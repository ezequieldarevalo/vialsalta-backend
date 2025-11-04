# Sistema de Almacenamiento de Archivos

## Descripción

El sistema de almacenamiento está diseñado para ser **agnóstico al proveedor**, permitiendo usar almacenamiento local en desarrollo y DigitalOcean Spaces (S3) en producción sin cambiar el código de la aplicación.

## Arquitectura

```
┌─────────────────┐
│   Aplicación    │
│  (Revisiones,   │
│   Vehículos)    │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ StorageService  │  ← Capa de abstracción
└────────┬────────┘
         │
    ┌────┴────┐
    ↓         ↓
┌────────┐ ┌────────┐
│ Local  │ │   S3   │
│ (Dev)  │ │ (Prod) │
└────────┘ └────────┘
```

## Uso en desarrollo (Local)

### 1. Configuración

En `.env`:

```env
# Storage
STORAGE_MODE=local
STORAGE_BASE_URL=http://localhost:3000/uploads
```

### 2. Subir un archivo desde el backend

```typescript
import { StorageService } from '../storage/storage.service';

@Injectable()
export class RevisionesService {
  constructor(private readonly storageService: StorageService) {}

  async crearRevision(file: Express.Multer.File, datos: any) {
    // Subir foto del vehículo
    const fotoUrl = await this.storageService.uploadFile(
      file,
      'vehiculos', // carpeta destino
      file.originalname,
    );

    // Guardar URL en la base de datos
    const revision = this.revisionRepository.create({
      ...datos,
      fotoUrl,
    });

    return this.revisionRepository.save(revision);
  }
}
```

### 3. Endpoint de ejemplo

```typescript
@Post()
@UseInterceptors(FileInterceptor('foto'))
async crear(
  @UploadedFile() foto: Express.Multer.File,
  @Body() dto: CreateRevisionDto,
) {
  return this.revisionesService.crearRevision(foto, dto);
}
```

### 4. Probar con curl

```bash
curl -X POST http://localhost:3000/upload/test \
  -F "file=@/path/to/image.jpg"
```

### 5. Estructura de directorios local

```
backend/
  uploads/           ← Git ignorado
    vehiculos/       ← Fotos de vehículos
      uuid-1.jpg
      uuid-2.jpg
    temp/            ← Archivos temporales
```

## Uso en producción (DigitalOcean Spaces)

### 1. Configuración

En `.env` (producción):

```env
# Storage
STORAGE_MODE=s3
SPACES_ENDPOINT=https://nyc3.digitaloceanspaces.com
SPACES_REGION=nyc3
SPACES_BUCKET=obleas-vtv
SPACES_KEY=tu_access_key
SPACES_SECRET=tu_secret_key
SPACES_CDN_URL=https://obleas-vtv.nyc3.cdn.digitaloceanspaces.com
```

### 2. Instalar dependencia de AWS SDK (cuando migres a producción)

```bash
npm install @aws-sdk/client-s3
```

### 3. El código de la aplicación NO cambia

El `StorageService` detecta automáticamente el modo (`local` vs `s3`) y usa el método correcto.

## Frontend: Cómo subir fotos

### Opción 1: Operador saca foto, admin la sube (tu caso actual)

**Flow:**
1. Operador de planta saca foto con su celular/tablet
2. Guarda foto en carpeta compartida (Google Drive, Dropbox, red local)
3. Admin de planta accede a la carpeta compartida
4. Admin sube la foto desde el sistema web

**Implementación frontend:**

```typescript
// Componente para subir foto (usado por admin de planta)
const uploadFoto = async (file: File, vehiculoId: number) => {
  const formData = new FormData();
  formData.append('foto', file);
  formData.append('vehiculoId', vehiculoId.toString());

  const response = await axios.post('/api/vehiculos/upload-foto', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.fotoUrl;
};
```

### Opción 2: Operador sube directo desde la revisión (futuro)

**Flow:**
1. Operador de planta saca foto desde el formulario de revisión
2. Foto se sube automáticamente al crear la revisión

```typescript
// En el formulario de crear revisión
const crearRevision = async (datos: RevisionForm, foto: File) => {
  const formData = new FormData();
  formData.append('foto', foto);
  formData.append('dominioVehiculo', datos.dominioVehiculo);
  formData.append('numeroOblea', datos.numeroOblea);
  // ... otros campos

  const response = await axios.post('/api/revisiones', formData);
  return response.data;
};
```

## Migración de local a S3 (cuando despliegues en producción)

### Paso 1: Crear Space en DigitalOcean

1. Ir a DigitalOcean > Spaces
2. Create Space
3. Nombre: `obleas-vtv`
4. Región: New York 3 (nyc3)
5. Enable CDN
6. Create

### Paso 2: Generar claves de acceso

1. API > Tokens/Keys > Spaces Keys
2. Generate New Key
3. Copiar Access Key y Secret Key

### Paso 3: Actualizar variables de entorno

```env
STORAGE_MODE=s3
SPACES_ENDPOINT=https://nyc3.digitaloceanspaces.com
SPACES_REGION=nyc3
SPACES_BUCKET=obleas-vtv
SPACES_KEY=DO00XXXXXXXXXXXXX
SPACES_SECRET=xxxxxxxxxxxxxxxxxxxxxx
SPACES_CDN_URL=https://obleas-vtv.nyc3.cdn.digitaloceanspaces.com
```

### Paso 4: Instalar SDK de AWS

```bash
npm install @aws-sdk/client-s3
```

### Paso 5: Descomentar código S3 en StorageService

El código ya está preparado en `storage.service.ts`, solo hay que descomentarlo.

### Paso 6: Migrar archivos existentes (si hay)

```bash
# Usando AWS CLI (compatible con Spaces)
aws s3 sync ./uploads s3://obleas-vtv/vehiculos \
  --endpoint-url=https://nyc3.digitaloceanspaces.com \
  --acl public-read
```

## Estructura de URLs

### Local (desarrollo):
```
http://localhost:3000/uploads/vehiculos/uuid-123.jpg
```

### Spaces con CDN (producción):
```
https://obleas-vtv.nyc3.cdn.digitaloceanspaces.com/vehiculos/uuid-123.jpg
```

## Consideraciones de seguridad

### Validaciones implementadas:
- ✅ Solo imágenes permitidas (mimetype check)
- ✅ Nombres de archivo únicos (UUID)
- ✅ Tamaño máximo configurable
- ⚠️ TODO: Validar dimensiones de imagen
- ⚠️ TODO: Comprimir imágenes antes de subir

### Permisos:
- En local: archivos públicos (para desarrollo)
- En S3: public-read (para que se puedan ver en certificados)
- Alternativa segura: URLs firmadas (pre-signed URLs) para acceso temporal

## Testing

### Test endpoint de prueba:

```bash
# Subir foto de prueba
curl -X POST http://localhost:3000/upload/test \
  -F "file=@./test-image.jpg"

# Ver info del storage
curl http://localhost:3000/upload/info
```

### Respuesta esperada:

```json
{
  "message": "File uploaded successfully",
  "url": "http://localhost:3000/uploads/vehiculos/abc-123-def-456.jpg"
}
```

## Logs

El `StorageService` loggea automáticamente:
- ✅ Modo de storage detectado (local/s3)
- ✅ Directorio de uploads
- ✅ URL base
- ✅ Cada archivo subido
- ⚠️ Errores al subir/eliminar archivos

## Roadmap

- [ ] Implementar código S3 cuando se configure Spaces
- [ ] Agregar compresión de imágenes (sharp)
- [ ] Agregar validación de dimensiones
- [ ] Implementar límite de tamaño por archivo
- [ ] Agregar watermark opcional en fotos
- [ ] Sistema de thumbnails automáticos
- [ ] Limpieza de archivos huérfanos (sin referencia en BD)
