# 📋 RESUMEN DE CAMBIOS: Nuevo Flujo de Obleas con QR

## 🎯 Objetivo
Cambiar el flujo de obleas para generar el QR al crear el bloque y activarlo al asignar a una revisión.

---

## ✅ CAMBIOS COMPLETADOS

### 🔧 BACKEND

#### 1. **Entidad Oblea** (`src/obleas/entities/oblea.entity.ts`)
```typescript
@Column({ type: 'boolean', default: false })
qrActivo: boolean;  // ✨ NUEVO CAMPO
```

#### 2. **BloquesService** (`src/bloques/bloques.service.ts`)
- ✅ Genera QR automáticamente al crear cada oblea
- ✅ Método `generateQRCode()` con firma digital
- ✅ Método `generarCSV()` para exportar obleas del bloque

**Cambios en `create()`:**
```typescript
for (let i = numeroInicio; i <= numeroFin; i++) {
  const codigoQr = this.generateQRCode(i, savedBloque.id);
  obleas.push({
    numero: i,
    codigoQr,  // QR generado
    qrActivo: false,  // Inactivo por defecto
    estado: EstadoOblea.DISPONIBLE,
    // ...
  });
}
```

#### 3. **BloquesController** (`src/bloques/bloques.controller.ts`)
```typescript
@Get(':id/csv')
async descargarCSV(@Param('id') id: number, @Request() req, @Response() res) {
  const csv = await this.bloquesService.generarCSV(id, req.user.camaraId);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="obleas-bloque-${id}.csv"`);
  res.send(csv);
}
```

#### 4. **RevisionesService** (`src/revisiones/revisiones.service.ts`)
**ANTES:**
```typescript
async asignarOblea(revisionId: number, user: any): Promise<Revision> {
  // Asignaba automáticamente la próxima oblea disponible
}
```

**AHORA:**
```typescript
async asignarOblea(revisionId: number, numeroOblea: number, user: any): Promise<Revision> {
  // Busca la oblea por número
  const oblea = await this.obleasRepository.findOne({ where: { numero: numeroOblea } });
  
  // Valida disponibilidad y permisos
  
  // Asigna y ACTIVA el QR
  oblea.estado = EstadoOblea.ASIGNADA;
  oblea.qrActivo = true;  // 🎯 ACTIVAR QR
  oblea.plantaId = revision.plantaId;
  oblea.revisionId = revisionId;
  await this.obleasRepository.save(oblea);
}
```

#### 5. **RevisionesController** (`src/revisiones/revisiones.controller.ts`)
```typescript
@Post(':id/asignar-oblea')
@Roles(UserRole.CAMARA, UserRole.PLANTA_ADMIN, UserRole.PLANTA_OPERADOR)
asignarOblea(
  @Param('id') id: number,
  @Body() asignarObleaDto: AsignarObleaDto,  // ✨ NUEVO DTO
  @Req() req: any,
) {
  return this.revisionesService.asignarOblea(id, asignarObleaDto.numeroOblea, req.user);
}
```

#### 6. **AsignarObleaDto** (`src/revisiones/dto/asignar-oblea.dto.ts`)
```typescript
export class AsignarObleaDto {
  @IsInt()
  @Min(1)
  numeroOblea: number;  // ✨ NUEVO CAMPO
}
```

---

### 💻 FRONTEND

#### 1. **Tipos** (`src/types/bloques.types.ts`)
```typescript
export interface Oblea {
  // ... campos existentes
  qrActivo: boolean;  // ✨ NUEVO CAMPO
}
```

#### 2. **BloquesService** (`src/services/bloques.service.ts`)
```typescript
async descargarCSV(bloqueId: number): Promise<void> {
  const response = await apiClient.get(`/bloques/${bloqueId}/csv`, {
    responseType: 'blob',
  });
  
  // Descarga automática del archivo CSV
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `obleas-bloque-${bloqueId}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
```

#### 3. **RevisionesService** (`src/services/revisiones.service.ts`)
**ANTES:**
```typescript
async asignarOblea(revisionId: number): Promise<Revision>
```

**AHORA:**
```typescript
async asignarOblea(revisionId: number, numeroOblea: number): Promise<Revision> {
  const response = await api.post<Revision>(`/revisiones/${revisionId}/asignar-oblea`, {
    numeroOblea,  // ✨ Envía el número de oblea
  });
  return response.data;
}
```

#### 4. **BloquesPage** (`src/pages/BloquesPage.tsx`)
```tsx
<Button
  size="small"
  variant="outlined"
  color="success"
  onClick={() => handleDescargarCSV(bloque.id)}
  sx={{ mr: 1 }}
>
  📥 CSV
</Button>

// Handler
const handleDescargarCSV = async (bloqueId: number) => {
  try {
    await bloquesService.descargarCSV(bloqueId);
  } catch (err) {
    alert('Error al descargar el archivo CSV');
  }
};
```

#### 5. **RevisionesPage** (`src/pages/RevisionesPage.tsx`)
**Cambios pendientes:**
- [ ] Agregar input/modal para ingresar número de oblea
- [ ] Validar que el número sea > 0
- [ ] Mostrar confirmación antes de asignar
- [ ] Llamar al servicio con el número ingresado

---

## 📊 MIGRACIÓN DE BASE DE DATOS

**Archivo:** `/tmp/migration_qr_activo.sql`

```sql
ALTER TABLE obleas ADD COLUMN IF NOT EXISTS "qrActivo" BOOLEAN NOT NULL DEFAULT FALSE;
COMMENT ON COLUMN obleas."qrActivo" IS 'Indica si el QR está activo. Se activa al asignar la oblea a una revisión.';
CREATE INDEX IF NOT EXISTS idx_obleas_qr_activo ON obleas("qrActivo") WHERE "qrActivo" = TRUE;
```

**Ejecutar:**
```bash
PGPASSWORD=postgres psql -h localhost -U postgres -d obleas_db -f /tmp/migration_qr_activo.sql
```

---

## 🔄 NUEVO FLUJO COMPLETO

### 1. **Generación de Obleas (Cámara)**
```
Crear Bloque
  ↓
Generar N obleas (según cantidad)
  ↓
Para cada oblea:
  - numero: asignado secuencialmente
  - codigoQr: OBL-{numero}-{firma}
  - qrActivo: FALSE ← inactivo
  - estado: DISPONIBLE
```

### 2. **Descarga CSV (Cámara)**
```
Click en botón "📥 CSV"
  ↓
GET /bloques/:id/csv
  ↓
Descarga archivo: obleas-bloque-{id}.csv
  Contenido: Numero,CodigoQR,Estado,QRActivo,Bloque,FechaCreacion
  ↓
Enviar a imprimir obleas físicas con QR
```

### 3. **Asignación en Planta (Operador)**
```
Revisión APROBADA
  ↓
Operador ingresa/escanea número de oblea
  ↓
POST /revisiones/:id/asignar-oblea
  Body: { numeroOblea: 12345 }
  ↓
Sistema valida:
  - Oblea existe
  - Estado DISPONIBLE
  - Pertenece a la cámara correcta
  ↓
Asigna oblea:
  - estado: ASIGNADA
  - qrActivo: TRUE ← ACTIVADO
  - plantaId: {plantaId}
  - revisionId: {revisionId}
  ↓
Genera certificado automáticamente
```

### 4. **Verificación Pública**
```
Escanear QR de oblea física
  ↓
GET /certificados/verificar/{codigoQR}
  ↓
Si qrActivo === true:
  ✅ Mostrar información del certificado
Si qrActivo === false:
  ❌ "QR no activo o inválido"
```

---

## ⚠️ PENDIENTES

### Backend:
- [ ] Ejecutar migración SQL en la base de datos
- [ ] Actualizar servicio de verificación de certificados para validar `qrActivo`
- [ ] Agregar endpoint para reactivar/desactivar QR (opcional)

### Frontend:
- [ ] Implementar modal/input para ingresar número de oblea en RevisionesPage
- [ ] Agregar validación de número de oblea (>0, numérico)
- [ ] Mostrar icono/badge de QR activo/inactivo en vistas de obleas
- [ ] Implementar scanner QR (futuro)

---

## 🧪 TESTING

### Pruebas a realizar:

1. **Crear bloque:**
   ```bash
   POST /bloques
   Body: { cantidad: 10 }
   ```
   - Verificar que se generan 10 obleas
   - Cada oblea debe tener `codigoQr` y `qrActivo: false`

2. **Descargar CSV:**
   ```bash
   GET /bloques/1/csv
   ```
   - Debe descargar archivo CSV
   - Verificar que contiene todas las obleas con QR

3. **Asignar oblea:**
   ```bash
   POST /revisiones/1/asignar-oblea
   Body: { numeroOblea: 12345 }
   ```
   - Debe asignar la oblea
   - Verificar `qrActivo: true`
   - Debe generar certificado

4. **Verificar certificado:**
   ```bash
   GET /certificados/verificar/OBL-12345-{firma}
   ```
   - Si `qrActivo: true` → mostrar info
   - Si `qrActivo: false` → error

---

## 📝 NOTAS

- El campo `qrActivo` permite controlar qué QR son públicamente verificables
- Las obleas impresas con QR inactivo no mostrarán información hasta ser asignadas
- El QR se genera con firma digital usando `QR_SECRET` del .env
- El CSV incluye todos los datos necesarios para la imprenta

---

**Fecha:** 3 de noviembre de 2025
**Versión:** 1.0.0
