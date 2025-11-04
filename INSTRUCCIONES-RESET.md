# 🔥 RESET COMPLETO DEL SISTEMA DE OBLEAS Y BLOQUES

## ⚠️ ADVERTENCIA

Esta operación eliminará:
- ✖️ **TODAS las obleas** (disponibles y asignadas)
- ✖️ **TODOS los bloques**
- ✖️ **Referencias de obleas en revisiones** (el campo `oleaId` se pondrá en NULL)

Las revisiones NO se eliminarán, pero perderán su vínculo con las obleas.

---

## 📋 Requisitos Previos

1. ✅ El contenedor Docker de Postgres debe estar corriendo
2. ✅ Hacer backup de la base de datos (opcional pero recomendado)

---

## 🚀 Pasos para Ejecutar el Reset

### Opción 1: Usando el Script Automatizado (RECOMENDADO)

```bash
cd /home/ezequiel-arevalo/obleas-system/backend
./reset-system.sh
```

El script te pedirá confirmación. Debes escribir **`SI`** (en mayúsculas) para continuar.

### Opción 2: Ejecutar SQL Manualmente

```bash
cd /home/ezequiel-arevalo/obleas-system/backend
docker exec -i obleas-postgres psql -U postgres -d obleas_db < reset-obleas.sql
```

---

## 🔍 Verificar que el Reset fue Exitoso

```bash
docker exec -i obleas-postgres psql -U postgres -d obleas_db -c "
SELECT 
    (SELECT COUNT(*) FROM obleas) as obleas_count,
    (SELECT COUNT(*) FROM bloques_obleas) as bloques_count,
    (SELECT COUNT(*) FROM revisiones WHERE \"oleaId\" IS NOT NULL) as revisiones_con_oblea;
"
```

**Resultado esperado:**
```
 obleas_count | bloques_count | revisiones_con_oblea 
--------------+---------------+----------------------
            0 |             0 |                    0
```

---

## 📝 Próximos Pasos Después del Reset

### 1. Reiniciar el Servidor Backend

```bash
# Si el servidor está corriendo, detenlo (Ctrl+C) y reinicia:
npm run start:dev
```

### 2. Crear Nuevos Bloques desde el Frontend

1. Ir a la página de **Bloques** en el frontend
2. Hacer clic en **"Crear Bloque"**
3. Completar los datos:
   - **Planta**: Seleccionar la planta
   - **Número Inicial**: Por ejemplo, `1000000`
   - **Cantidad**: Por ejemplo, `100` (creará obleas del 1000000 al 1000099)

### 3. Verificar el Formato de las Obleas

Las nuevas obleas deben tener el formato:
```
OBL-{numero}-{hash16}
```

Ejemplo: `OBL-1000000-e60d7db74fe6f428`

---

## 🔧 Formato de QR Code que se Generará

### Al Crear el Bloque
```
OBL-{numero}-{hash16}
```

### Al Asignar a una Revisión (Certificado)
```
QR-{oleaNumero}-{timestamp}-{revisionId}-{signature}
```

---

## ⚡ Troubleshooting

### Error: "No se puede conectar a la base de datos"

```bash
# Verificar que el contenedor está corriendo
docker ps | grep postgres

# Si no está corriendo, iniciarlo
docker start obleas-postgres
```

### Error: "Permission denied"

```bash
# Dar permisos de ejecución al script
chmod +x reset-system.sh
```

### Quiero hacer Backup antes del Reset

```bash
# Backup completo de la base de datos
docker exec obleas-postgres pg_dump -U postgres obleas_db > backup-obleas-$(date +%Y%m%d-%H%M%S).sql

# Para restaurar el backup después (si es necesario)
docker exec -i obleas-postgres psql -U postgres -d obleas_db < backup-obleas-YYYYMMDD-HHMMSS.sql
```

---

## 📊 Consultas Útiles Después del Reset

### Ver bloques creados
```bash
docker exec -i obleas-postgres psql -U postgres -d obleas_db -c "
SELECT codigo, \"numeroInicial\", \"numeroFinal\", estado 
FROM bloques_obleas 
ORDER BY id DESC 
LIMIT 5;
"
```

### Ver obleas disponibles
```bash
docker exec -i obleas-postgres psql -U postgres -d obleas_db -c "
SELECT numero, \"codigoQr\", estado 
FROM obleas 
WHERE estado = 'DISPONIBLE' 
LIMIT 10;
"
```

### Contar obleas por estado
```bash
docker exec -i obleas-postgres psql -U postgres -d obleas_db -c "
SELECT estado, COUNT(*) 
FROM obleas 
GROUP BY estado;
"
```

---

## ✅ Ventajas del Reset

- 🎯 **Formato Consistente**: Todas las obleas tendrán el mismo formato
- 🔄 **IDs Limpios**: Los IDs empiezan desde 1
- 🧹 **Sin Datos Legacy**: No hay datos del seed mezclados con datos de producción
- 🛡️ **Sistema Limpio**: Puedes establecer el formato correcto desde el inicio

---

## 🎓 Notas Importantes

1. **No afecta a otras tablas**: Usuarios, plantas, vehículos, municipios, etc. se mantienen intactos
2. **Las revisiones se conservan**: Solo se elimina la referencia a las obleas
3. **Operación reversible**: Si haces backup antes, puedes restaurar
4. **Solo para desarrollo**: En producción, necesitarías una estrategia de migración más sofisticada

