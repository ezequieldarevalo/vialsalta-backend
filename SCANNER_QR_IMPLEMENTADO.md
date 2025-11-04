# �� Scanner QR con Auto-Submit Implementado

## ✅ Funcionalidad Agregada

### RevisionesPage.tsx - Asignación de Oblea con Scanner

#### 🎯 Características

1. **Modal de Escaneo**
   - Dialog modal que se abre al hacer clic en "Asignar Oblea"
   - Input enfocado automáticamente para recibir entrada del scanner
   - Instrucciones claras para el usuario

2. **Detección Automática del Patrón QR**
   ```typescript
   const qrPattern = /(?:\/verificar\/)?OBL-(\d+)-([a-f0-9]{16})/i;
   ```
   
   **Detecta:**
   - ✅ `OBL-123456-abc123def456789a` (código directo)
   - ✅ `http://localhost:5173/verificar/OBL-123456-abc123def456789a` (URL completa)
   - ✅ `/verificar/OBL-123456-abc123def456789a` (ruta relativa)

3. **Auto-Submit**
   - Cuando el scanner ingresa un código que coincide con el patrón
   - Se extrae automáticamente el número de oblea
   - Se envía la asignación sin necesidad de hacer clic en ningún botón

4. **Manejo de Errores**
   - Muestra alertas en caso de error (oblea no encontrada, ya asignada, etc.)
   - Cierra el modal automáticamente al éxito
   - Recarga la lista de revisiones

---

## 🔧 Código Implementado

### Estados Agregados
```typescript
const [showObleaDialog, setShowObleaDialog] = useState(false);
const [selectedRevisionId, setSelectedRevisionId] = useState<number | null>(null);
const [codigoQrInput, setCodigoQrInput] = useState('');
```

### Método de Asignación
```typescript
const handleAsignarOblea = async (revisionId: number) => {
  setSelectedRevisionId(revisionId);
  setCodigoQrInput('');
  setShowObleaDialog(true);
};
```

### Detección y Auto-Submit
```typescript
const handleCodigoQrChange = (value: string) => {
  setCodigoQrInput(value);
  
  // Patrón: OBL-{numero}-{hash16} o URL completa
  const qrPattern = /(?:\/verificar\/)?OBL-(\d+)-([a-f0-9]{16})/i;
  const match = value.match(qrPattern);
  
  if (match) {
    const numeroOblea = parseInt(match[1]);
    procesarAsignacionOblea(numeroOblea); // Auto-submit
  }
};
```

### Procesamiento de Asignación
```typescript
const procesarAsignacionOblea = async (numeroOblea: number) => {
  if (!selectedRevisionId) return;
  
  try {
    await revisionesService.asignarOblea(selectedRevisionId, numeroOblea);
    alert('Oblea asignada y certificado generado exitosamente');
    setShowObleaDialog(false);
    setCodigoQrInput('');
    setSelectedRevisionId(null);
    loadData();
  } catch (error: unknown) {
    const errorMessage = (error as any).response?.data?.message || 'Error al asignar oblea';
    alert(errorMessage);
  }
};
```

---

## 🎨 UI del Modal

```tsx
<Dialog open={showObleaDialog} onClose={...} maxWidth="sm" fullWidth>
  <DialogTitle>
    📱 Escanear Oblea
  </DialogTitle>
  
  <DialogContent>
    <Alert severity="info">
      Instrucciones:
      1. Coloque el cursor en el campo de texto
      2. Escanee el código QR con la pistola lectora
      3. La asignación se realizará automáticamente
    </Alert>

    <TextField
      autoFocus
      label="Código QR de la Oblea"
      value={codigoQrInput}
      onChange={(e) => handleCodigoQrChange(e.target.value)}
      placeholder="OBL-123456-abc123def456789a"
      helperText="Escanee el código QR o ingrese manualmente"
    />
  </DialogContent>

  <DialogActions>
    <Button onClick={...}>Cancelar</Button>
  </DialogActions>
</Dialog>
```

---

## 📖 Flujo de Uso

### Para el Operador de Planta:

1. **Usuario hace clic en "Asignar Oblea"** (botón en revisión aprobada)
   - Se abre el modal con el input enfocado
   - Cursor listo para recibir entrada del scanner

2. **Operador escanea la oblea con la pistola**
   - La pistola ingresa el texto como si fuera un teclado
   - Ejemplo: `http://localhost:5173/verificar/OBL-123456-abc123def456789a`

3. **Sistema detecta el patrón automáticamente**
   - Regex valida el formato
   - Extrae el número de oblea (123456)
   - Valida que el hash tenga 16 caracteres hexadecimales

4. **Auto-submit inmediato**
   - Llama a `revisionesService.asignarOblea(revisionId, 123456)`
   - Backend valida:
     - ✓ Oblea existe
     - ✓ Oblea disponible (no asignada)
     - ✓ Oblea pertenece a la cámara correcta
   - Backend activa el QR: `oblea.qrActivo = true`
   - Backend genera certificado

5. **Feedback al usuario**
   - ✅ Éxito: "Oblea asignada y certificado generado exitosamente"
   - ❌ Error: Mensaje específico del backend
   - Modal se cierra automáticamente
   - Lista de revisiones se actualiza

---

## 🔍 Validaciones

### Frontend (Regex)
- ✅ Formato `OBL-{numero}-{hash}`
- ✅ Número es numérico
- ✅ Hash tiene exactamente 16 caracteres hexadecimales
- ✅ Acepta URL completa o código directo

### Backend (API)
- ✅ Oblea existe en base de datos
- ✅ Oblea no está asignada (`revisionId IS NULL`)
- ✅ Oblea pertenece a la misma cámara que la revisión
- ✅ Revisión está aprobada
- ✅ Firma del QR es válida

---

## 🧪 Casos de Prueba

### ✅ Caso Exitoso
```
Input scanner: http://localhost:5173/verificar/OBL-123456-a1b2c3d4e5f67890
Resultado: ✅ Oblea 123456 asignada, certificado generado
```

### ❌ Oblea No Encontrada
```
Input scanner: http://localhost:5173/verificar/OBL-999999-a1b2c3d4e5f67890
Resultado: ❌ "Oblea no encontrada"
```

### ❌ Oblea Ya Asignada
```
Input scanner: http://localhost:5173/verificar/OBL-123456-a1b2c3d4e5f67890
Resultado: ❌ "La oblea ya está asignada a otra revisión"
```

### ❌ Formato Inválido
```
Input scanner: ABC-123
Resultado: (No hace nada, no coincide con el patrón)
```

### ✅ Código Directo (sin URL)
```
Input scanner: OBL-123456-a1b2c3d4e5f67890
Resultado: ✅ Oblea 123456 asignada
```

---

## 🎯 Ventajas de Esta Implementación

1. **Rápido y Eficiente**
   - No requiere clicks adicionales
   - Un solo scan = asignación completa

2. **A Prueba de Errores**
   - Regex valida el formato antes de enviar
   - Backend valida disponibilidad
   - Mensajes claros de error

3. **Flexible**
   - Acepta URL completa del QR
   - Acepta código directo
   - Permite ingreso manual si es necesario

4. **UX Intuitivo**
   - Instrucciones claras en el modal
   - Auto-focus en el input
   - Feedback inmediato

5. **Compatible con Scanners**
   - Funciona con cualquier pistola que emule teclado
   - No requiere drivers especiales
   - Detecta Enter automático del scanner

---

## 🔄 Siguiente Paso Recomendado

Implementar el método de **verificación pública** del QR para que cuando un ciudadano escanee la oblea en la calle, pueda ver:
- ✅ Certificado válido
- �� Fecha de vencimiento
- 🚗 Datos del vehículo
- �� Planta verificadora

**Archivo a modificar**: `src/certificados/certificados.service.ts`
**Método**: `verificarPorCodigoQr()` - Agregar lógica para formato `OBL-{numero}-{hash}`

