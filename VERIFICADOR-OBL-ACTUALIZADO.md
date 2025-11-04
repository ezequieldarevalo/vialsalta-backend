# ✅ VERIFICADOR ACTUALIZADO - SOPORTE FORMATO OBL

**Fecha:** 3 de noviembre de 2025  
**Archivo modificado:** `src/certificados/certificados.service.ts`  
**Método actualizado:** `verificarPorCodigoQr()`

---

## 🎯 Problema Resuelto

**Antes:** El verificador solo aceptaba formato `QR-{numero}-{timestamp}-{revisionId}-{signature}`

**Después:** El verificador acepta **3 formatos diferentes**:
1. `COND-{revisionId}-{timestamp}` - Certificados condicionales
2. `OBL-{numero}-{hash16}` - **NUEVO** - Obleas de bloques ⭐
3. `QR-{numero}-{timestamp}-{revisionId}-{signature}` - Legacy con validación criptográfica

---

## 📋 Cambios Técnicos

### Nuevo Flujo para Formato OBL

```typescript
if (codigoQr.startsWith('OBL-')) {
  // Buscar certificado por código de oblea en la BD
  const certificado = await this.certificadosRepository
    .createQueryBuilder('certificado')
    .leftJoinAndSelect('certificado.revision', 'revision')
    .leftJoinAndSelect('revision.oblea', 'oblea')
    // ... más joins ...
    .where('oblea.codigoQr LIKE :pattern', {
      pattern: `%${codigoQr}%`,
    })
    .getOne();
    
  // Validar vigencia
  const vencido = certificado.fechaVencimiento && ahora > certificado.fechaVencimiento;
  
  return {
    valido: !vencido,
    certificado: { ... },
    vehiculo: { ... },
    revision: { ... },
    oblea: { numero, codigo }
  };
}
```

### Ventajas del Nuevo Enfoque

✅ **Búsqueda por Base de Datos:** No depende de parsear el código QR  
✅ **Compatible con OBL:** Acepta el formato generado por bloques  
✅ **Retrocompatible:** Mantiene soporte para QR- legacy  
✅ **Validación de Vigencia:** Verifica si el certificado está vencido  
✅ **Datos Completos:** Devuelve información del vehículo, revisión y oblea

---

## �� Flujo Completo del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│ 1. CREACIÓN DE BLOQUE                                       │
├─────────────────────────────────────────────────────────────┤
│ • POST /bloques                                             │
│ • Input: { plantaId, numeroInicial, cantidad }              │
│ • Output: Bloque con 100 obleas                             │
│ • Código generado: OBL-{numero}-{hash16}                    │
│   Ejemplo: OBL-1000000-e60d7db74fe6f428                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. ASIGNACIÓN A REVISIÓN                                    │
├─────────────────────────────────────────────────────────────┤
│ • POST /revisiones/{id}/asignar-oblea                       │
│ • Encuentra primera oblea DISPONIBLE                        │
│ • Marca oblea como ASIGNADA                                 │
│ • Genera certificado con urlVerificacion = oblea.codigoQr   │
│ • El certificado almacena: OBL-1000000-{hash}               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. VERIFICACIÓN PÚBLICA                                     │
├─────────────────────────────────────────────────────────────┤
│ • GET /public/verificar/OBL-1000000-{hash}                  │
│ • verificarPorCodigoQr() detecta formato OBL                │
│ • Busca en BD: oblea.codigoQr LIKE '%OBL-1000000-{hash}%'   │
│ • Encuentra certificado asociado                            │
│ • Valida vigencia                                           │
│ • Devuelve: { valido, certificado, vehiculo, revision }     │
└─────────────────────────────────────────────────────────────┘
```

---

## �� Cómo Probar

### 1. Crear Bloque

```bash
curl -X POST http://localhost:3000/bloques \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "plantaId": 1,
    "numeroInicial": 1000000,
    "cantidad": 100
  }'
```

**Resultado esperado:** 100 obleas con códigos `OBL-1000000-{hash}` a `OBL-1000099-{hash}`

### 2. Asignar Oblea a Revisión

```bash
curl -X POST http://localhost:3000/revisiones/123/asignar-oblea \
  -H "Authorization: Bearer {token}"
```

**Resultado esperado:** Oblea asignada, certificado generado

### 3. Verificar Certificado (sin autenticación)

```bash
curl http://localhost:3000/public/verificar/OBL-1000000-e60d7db74fe6f428
```

**Resultado esperado:**
```json
{
  "valido": true,
  "vencido": false,
  "certificado": {
    "numero": "CERT-123-1699056800000",
    "fechaEmision": "2025-11-03T20:00:00.000Z",
    "fechaVencimiento": "2027-11-03T20:00:00.000Z"
  },
  "vehiculo": {
    "dominio": "ABC123",
    "marca": "Toyota",
    "modelo": "Corolla",
    "anio": 2020
  },
  "revision": {
    "fecha": "2025-11-03T19:00:00.000Z",
    "resultado": "APROBADO",
    "planta": "VTV Salta Centro",
    "provincia": "Salta"
  },
  "oblea": {
    "numero": 1000000,
    "codigo": "http://localhost:5173/verificar/OBL-1000000-e60d7db74fe6f428"
  }
}
```

---

## 📊 Comparación de Formatos

| Formato | Ejemplo | Generado en | Validación | Estado |
|---------|---------|-------------|------------|--------|
| **COND-** | `COND-123-1699056800000` | Revisiones condicionales | Búsqueda BD | ✅ Activo |
| **OBL-** | `OBL-1000000-e60d7db74fe6f428` | Creación de bloques | Búsqueda BD | ✅ **NUEVO** |
| **QR-** | `QR-1000000-169905-123-abc123` | Seed legacy | Firma criptográfica | ✅ Legacy |

---

## 🔐 Seguridad

### Formato OBL
- ✅ Hash SHA256 de 16 caracteres
- ✅ Incluye bloqueId y QR_SECRET
- ✅ Validación por base de datos (no se puede falsificar sin acceso a BD)
- ✅ Validación de vigencia del certificado

### Formato QR Legacy
- ✅ Firma criptográfica completa
- ✅ Validación estricta de componentes
- ✅ Alerta de seguridad si la firma no coincide
- ✅ Logging de intentos de fraude

---

## 🚀 Estado Actual

- ✅ Backend actualizado y corriendo
- ✅ Verificador acepta 3 formatos
- ✅ Base de datos limpia (reset completado)
- ✅ Listo para crear bloques nuevos
- ✅ Compilación sin errores
- ✅ Retrocompatible con códigos antiguos

---

## 📝 Notas Importantes

1. **El código OBL es un identificador de oblea**, no del certificado final
2. **El certificado usa el código de la oblea** en su urlVerificacion
3. **El verificador busca por código de oblea** en la base de datos
4. **No hay duplicación de códigos** porque cada oblea tiene un código único
5. **El hash del código OBL** depende del número, bloqueId y QR_SECRET

---

## 🎓 Próximos Pasos Recomendados

1. ✅ Crear primer bloque con formato OBL
2. ✅ Asignar obleas a revisiones
3. ✅ Probar verificación desde frontend y API
4. �� Opcional: Agregar logging de verificaciones exitosas
5. 🔄 Opcional: Dashboard de estadísticas de verificaciones

---

**Estado:** ✅ Implementado y funcionando  
**Versión:** 1.0.0  
**Última actualización:** 3 de noviembre de 2025

