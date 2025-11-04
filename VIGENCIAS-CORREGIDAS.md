# ✅ CORRECCIÓN DE VIGENCIAS - DOCUMENTACIÓN

**Fecha:** 3 de noviembre de 2025  
**Problema:** Revisiones creadas antes de implementar la lógica de antigüedad tenían vigencia de 1 año en lugar de 2  
**Solución:** Scripts SQL para corregir y verificar vigencias

---

## 🎯 Problema Identificado

El vehículo **ABC123** (año 2025, antigüedad 0 años) tenía:
- ❌ **Vigencia incorrecta:** 1 año (vencimiento 2/11/2026)
- ✅ **Vigencia correcta:** 2 años (vencimiento 2/11/2027)

**Causa:** Las revisiones se crearon antes de implementar la lógica de cálculo según antigüedad.

---

## 📋 Regla de Negocio

```
SI antigüedad del vehículo ≤ 7 años → Vigencia de 2 años
SI antigüedad del vehículo > 7 años → Vigencia de 1 año
```

**Cálculo de antigüedad:**
```
antigüedad = año_actual - año_del_vehículo
```

---

## 🔧 Solución Aplicada

### 1. Script de Corrección: `fix-vigencias.sql`

```sql
UPDATE revisiones r
SET "fechaVencimiento" = CASE 
    WHEN (EXTRACT(YEAR FROM CURRENT_DATE)::int - v.anio) <= 7 
    THEN r."fechaRevision" + INTERVAL '2 years'
    ELSE r."fechaRevision" + INTERVAL '1 year'
END
FROM vehiculos v
WHERE r."vehiculoId" = v.id
AND r.resultado = 'APROBADO';
```

**Resultado:** 5 revisiones actualizadas

### 2. Actualización de Certificados

```sql
UPDATE certificados c
SET "fechaVencimiento" = r."fechaVencimiento"
FROM revisiones r
WHERE c."revisionId" = r.id
AND r.resultado = 'APROBADO';
```

**Resultado:** 1 certificado actualizado

---

## 📊 Resultados

### Revisiones Corregidas

| ID | Dominio | Año | Antigüedad | Vigencia Anterior | Vigencia Corregida | Estado |
|----|---------|-----|------------|-------------------|-------------------|---------|
| 1 | ABC123 | 2025 | 0 años | 2026-11-02 (1 año) | 2027-11-02 (2 años) | ✓ |
| 2 | AF012!H | 2023 | 2 años | 2026-11-03 (1 año) | 2027-11-03 (2 años) | ✓ |
| 3 | AA670YQ | 2025 | 0 años | 2026-11-03 (1 año) | 2027-11-03 (2 años) | ✓ |
| 4 | AB485JK | 2025 | 0 años | 2026-11-03 (1 año) | 2027-11-03 (2 años) | ✓ |
| 9 | AA111AA | 2018 | 7 años | 2027-11-03 (2 años) | 2027-11-03 (2 años) | ✓ |

### Resumen

- ✅ **Total de revisiones APROBADAS:** 5
- ✅ **Correctas:** 5 (100%)
- ✅ **Incorrectas:** 0

---

## 🧪 Script de Verificación: `verificar-vigencias.sql`

Para verificar que todas las vigencias están correctas:

```bash
cd /home/ezequiel-arevalo/obleas-system/backend
docker exec -i obleas-postgres psql -U postgres -d obleas_db < verificar-vigencias.sql
```

**Salida esperada:**
```
 Total APROBADAS | Correctas | Incorrectas 
-----------------+-----------+-------------
               5 |         5 |           0
```

---

## 🔍 Cómo Funciona Ahora

### Flujo Completo

```
1. CREAR REVISIÓN APROBADA
   ├─> Se obtiene el vehículo
   ├─> Se calcula antigüedad = 2025 - año_vehiculo
   ├─> SI antigüedad ≤ 7 → vigencia = 2 años
   │   SINO → vigencia = 1 año
   ├─> Se calcula fechaVencimiento = fechaRevision + vigencia
   └─> Se verifica si hay condicional previa para ajustar

2. GENERAR CERTIFICADO
   ├─> El certificado usa la fechaVencimiento de la revisión
   └─> Se crea el PDF con la vigencia correcta

3. VERIFICAR CERTIFICADO
   ├─> Se busca el certificado en la BD
   ├─> Se valida la vigencia
   └─> Se muestra la fecha de vencimiento correcta
```

---

## 📝 Ejemplo Práctico

### Vehículo ABC123 (Año 2025)

```
Año del vehículo: 2025
Año actual: 2025
Antigüedad: 2025 - 2025 = 0 años

Como 0 ≤ 7 → Vigencia de 2 años

Fecha de revisión: 02/11/2025
Fecha de vencimiento: 02/11/2027 ✓
```

### Vehículo Hipotético XYZ789 (Año 2010)

```
Año del vehículo: 2010
Año actual: 2025
Antigüedad: 2025 - 2010 = 15 años

Como 15 > 7 → Vigencia de 1 año

Fecha de revisión: 02/11/2025
Fecha de vencimiento: 02/11/2026 ✓
```

---

## 🚀 Prevención Futura

La lógica está implementada en `revisiones.service.ts` en el método `calcularFechaVencimiento()`:

```typescript
// Calcular antigüedad del vehículo
const anioActual = new Date().getFullYear();
const antiguedad = anioActual - vehiculo.anio;

// Determinar vigencia base según antigüedad
let vigenciaAnios = antiguedad <= 7 ? 2 : 1;

// Aplicar vigencia
const vencimiento = new Date(fecha);
vencimiento.setFullYear(vencimiento.getFullYear() + vigenciaAnios);
```

**Todas las nuevas revisiones se crearán con la vigencia correcta automáticamente.**

---

## 🔐 Seguridad

- ✅ Los scripts solo afectan revisiones APROBADAS
- ✅ Se mantiene el histórico (no se eliminan datos)
- ✅ Los certificados se actualizan en cascada
- ✅ Se puede verificar en cualquier momento con `verificar-vigencias.sql`

---

## 📁 Archivos Relacionados

1. **`fix-vigencias.sql`** - Script de corrección (ejecutado)
2. **`verificar-vigencias.sql`** - Script de verificación
3. **`src/revisiones/revisiones.service.ts`** - Lógica de cálculo
4. **`VIGENCIAS-CORREGIDAS.md`** - Esta documentación

---

## ✅ Estado Final

- ✅ Todas las revisiones APROBADAS tienen vigencia correcta
- ✅ Todos los certificados tienen fechas actualizadas
- ✅ El código backend calcula vigencias automáticamente
- ✅ Sistema de verificación disponible para auditorías

---

**Problema resuelto:** ✅  
**Versión:** 1.0.0  
**Última actualización:** 3 de noviembre de 2025

