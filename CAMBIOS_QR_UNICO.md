# 🎯 Cambios Implementados: Sistema de QR Único por Oblea

## Fecha: $(date +%Y-%m-%d)

## 📋 Resumen
Se implementó el sistema de **QR único por oblea** (Opción A), eliminando la generación de códigos QR duplicados en los certificados.

---

## ✅ Cambios Realizados

### 1. **BloquesService** - Generación de QR con URL Completa
- **Archivo**: `src/bloques/bloques.service.ts`
- **Modificación**: Método `generateQRCode()`
- **Antes**: Generaba `OBL-{numero}-{signature}`
- **Ahora**: Genera `http://localhost:5173/verificar/OBL-{numero}-{signature}`
- **Beneficio**: QR contiene URL completa lista para escanear

```typescript
private generateQRCode(numero: number, bloqueId: number): string {
  const signature = crypto
    .createHmac('sha256', this.QR_SECRET)
    .update(`${numero}-${bloqueId}`)
    .digest('hex')
    .substring(0, 16);

  const codigo = `OBL-${numero}-${signature}`;
  
  // 🌐 URL completa de verificación
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  return `${frontendUrl}/verificar/${codigo}`;
}
```

---

### 2. **CertificadosService** - Uso de QR de Oblea
- **Archivo**: `src/certificados/certificados.service.ts`
- **Modificación**: Método `generarCertificado()`
- **Cambio Principal**: Ya no genera un QR nuevo, usa el de la oblea

**Código Eliminado** (líneas ~163-182):
```typescript
// ❌ CÓDIGO ANTIGUO - ELIMINADO
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
const timestamp = Date.now();

const signature = this.generateQRSignature({
  oleaNumero: revision.oblea.numero,
  revisionId: revision.id,
  timestamp,
});

const uniqueCode = `QR-${revision.oblea.numero}-${timestamp}-${revision.id}-${signature}`;
const urlVerificacion = `${frontendUrl}/verificar/${uniqueCode}`;
const codigoQr = await QRCode.toDataURL(urlVerificacion);
```

**Código Nuevo**:
```typescript
// ✅ CÓDIGO NUEVO - USA QR DE OBLEA
if (!revision.oblea.codigoQr) {
  throw new Error('La oblea no tiene código QR generado');
}

const urlVerificacion = revision.oblea.codigoQr;
console.log('[generarCertificado] 🔒 Usando QR de la oblea:', urlVerificacion);

const codigoQr = await QRCode.toDataURL(urlVerificacion);
console.log('[generarCertificado] Código QR generado desde oblea');
```

**Importaciones Agregadas**:
```typescript
import { Oblea } from '../obleas/entities/oblea.entity';
```

**Constructor Actualizado**:
```typescript
constructor(
  @InjectRepository(Certificado)
  private certificadosRepository: Repository<Certificado>,
  @InjectRepository(Revision)
  private revisionesRepository: Repository<Revision>,
  @InjectRepository(Oblea)  // ✅ NUEVO
  private obleasRepository: Repository<Oblea>,  // ✅ NUEVO
) { ... }
```

---

### 3. **CertificadosModule** - Repositorio de Oblea
- **Archivo**: `src/certificados/certificados.module.ts`
- **Modificación**: Agregar repositorio de Oblea

**Antes**:
```typescript
imports: [TypeOrmModule.forFeature([Certificado, Revision])],
```

**Ahora**:
```typescript
import { Oblea } from '../obleas/entities/oblea.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Certificado, Revision, Oblea])],
  ...
})
```

---

## 🔄 Flujo Actual

### Ciclo de Vida del QR

1. **Creación de Bloque** → `BloquesService.create()`
   - Se crean N obleas (ej: 50)
   - Cada oblea recibe un QR único: `http://localhost:5173/verificar/OBL-{numero}-{signature}`
   - Campo `qrActivo = false` (QR inactivo)

2. **Impresión de Obleas** → Descarga CSV
   - Administrador descarga CSV con todos los números de oblea y QRs
   - Se imprimen las obleas físicas con el QR

3. **Asignación a Revisión** → `RevisionesService.asignarOblea()`
   - Operador asigna número de oblea a una revisión
   - Campo `qrActivo = true` (QR activado)

4. **Generación de Certificado** → `CertificadosService.generarCertificado()`
   - Se crea certificado usando **EL MISMO QR** de la oblea
   - No se genera un QR nuevo
   - El PDF del certificado muestra el QR de la oblea

5. **Verificación Pública** → `/verificar/OBL-{numero}-{signature}`
   - Usuario escanea QR en oblea o certificado
   - Sistema valida firma criptográfica
   - Verifica `qrActivo = true`
   - Muestra datos del certificado

---

## 📊 Beneficios

| Aspecto | Antes | Ahora |
|---------|-------|-------|
| **QRs por oblea** | 2 (oblea + certificado) | 1 único |
| **URL en QR** | Solo código | URL completa |
| **Sincronización** | Pueden diferir | Siempre igual |
| **Seguridad** | Firma doble | Firma única mejorada |
| **Escaneo** | Requiere configuración | Directo a URL |

---

## 🔒 Seguridad

### Firma Criptográfica
```typescript
const signature = crypto
  .createHmac('sha256', QR_SECRET)
  .update(`${numero}-${bloqueId}`)
  .digest('hex')
  .substring(0, 16);
```

- **Algoritmo**: HMAC-SHA256
- **Secreto**: Variable de entorno `QR_SECRET`
- **Longitud**: 16 caracteres (64 bits)
- **Imposible de falsificar** sin conocer `QR_SECRET`

### Control de Activación
- **qrActivo = false**: Oblea creada pero no asignada
  - QR no muestra información
  - Mensaje: "La oblea aún no ha sido asignada a ninguna revisión técnica"

- **qrActivo = true**: Oblea asignada a revisión
  - QR muestra datos completos del certificado
  - Validación de vigencia

---

## 📝 Tareas Pendientes

### 🔴 Críticas (Bloquean funcionalidad)

1. **Actualizar método de verificación**
   - Implementar `verificarPorCodigoOblea()` para formato `OBL-{numero}-{signature}`
   - Mantener `verificarPorCodigoCertificado()` para QRs antiguos (compatibilidad)
   - Archivo: `src/certificados/certificados.service.ts`

2. **Migración de obleas antiguas**
   - Regenerar QRs de obleas existentes con formato nuevo (URL completa)
   - Script de migración para actualizar campo `codigoQr`

### 🟡 Importantes (Mejoran UX)

3. **Frontend: Solicitar número de oblea en asignación**
   - Modificar `RevisionesPage.tsx` para pedir número de oblea al asignar
   - Actualmente el backend espera `numeroOblea` pero el frontend no lo solicita

4. **Mostrar estado de QR en UI**
   - Badge visual en `BloquesPage` indicando `qrActivo` (verde/gris)
   - Filtros por estado activo/inactivo

### 🟢 Opcionales (Futuro)

5. **Scanner QR integrado**
   - Implementar lector QR en frontend para operadores
   - Facilita asignación de obleas

6. **Auditoría de verificaciones**
   - Registrar cada escaneo de QR (IP, timestamp, resultado)
   - Detectar patrones de fraude

---

## 🧪 Testing

### Pruebas Manuales Recomendadas

1. **Crear bloque nuevo**
   ```bash
   POST /bloques
   {
     "cantidad": 5,
     "plantaId": 1
   }
   ```
   - Verificar que obleas tengan QR con URL completa
   - Verificar `qrActivo = false`

2. **Asignar oblea a revisión**
   ```bash
   POST /revisiones/:id/asignar-oblea
   {
     "numeroOblea": 12345
   }
   ```
   - Verificar que `qrActivo = true`

3. **Generar certificado**
   ```bash
   POST /revisiones/:id/certificado
   ```
   - Verificar que PDF contenga el QR de la oblea
   - Verificar que `urlVerificacion` sea igual a `oblea.codigoQr`

4. **Verificar QR** (cuando se implemente)
   ```bash
   GET /certificados/verificar/OBL-12345-abc123def456
   ```
   - Debe mostrar datos del certificado
   - Validar firma criptográfica
   - Validar `qrActivo = true`

---

## 🔧 Variables de Entorno

```bash
# .env
FRONTEND_URL=http://localhost:5173  # URL del frontend para QR
QR_SECRET=tu_secreto_aqui_minimo_32_caracteres  # Para firmar QRs
```

**⚠️ IMPORTANTE**: Definir `QR_SECRET` en producción. Sin esto, cada reinicio del servidor invalidará todos los QRs existentes.

---

## 📚 Documentación Relacionada

- `RESUMEN_CAMBIOS.md` - Cambios previos del workflow de obleas
- `EXPLICACION_QR.md` - Explicación de las opciones A y B (decisión de QR único)
- `src/certificados/certificados.service.ts.backup` - Código anterior del servicio

---

## ✅ Estado de Compilación

```bash
$ npm run build
✅ Compilación exitosa sin errores
```

---

## 👤 Autor
Asistente de IA - GitHub Copilot
Fecha: $(date +%Y-%m-%d)
