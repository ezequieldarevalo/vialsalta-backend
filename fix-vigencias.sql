-- ============================================================================
-- CORREGIR FECHAS DE VENCIMIENTO SEGÚN ANTIGÜEDAD
-- ============================================================================
-- Este script recalcula las fechas de vencimiento de todas las revisiones
-- APROBADAS aplicando la regla:
-- - Vehículos ≤ 7 años: 2 años de vigencia
-- - Vehículos > 7 años: 1 año de vigencia
-- ============================================================================

BEGIN;

-- Ver el estado actual antes de corregir
SELECT 
    r.id,
    v.dominio,
    v.anio as "año_vehiculo",
    EXTRACT(YEAR FROM CURRENT_DATE)::int - v.anio as "antigüedad",
    r."fechaRevision" as "fecha_revision",
    r."fechaVencimiento" as "vencimiento_actual",
    CASE 
        WHEN (EXTRACT(YEAR FROM CURRENT_DATE)::int - v.anio) <= 7 
        THEN r."fechaRevision" + INTERVAL '2 years'
        ELSE r."fechaRevision" + INTERVAL '1 year'
    END as "vencimiento_correcto"
FROM revisiones r
JOIN vehiculos v ON r."vehiculoId" = v.id
WHERE r.resultado = 'APROBADO'
ORDER BY r.id;

-- Actualizar fechas de vencimiento
UPDATE revisiones r
SET "fechaVencimiento" = CASE 
    WHEN (EXTRACT(YEAR FROM CURRENT_DATE)::int - v.anio) <= 7 
    THEN r."fechaRevision" + INTERVAL '2 years'
    ELSE r."fechaRevision" + INTERVAL '1 year'
END
FROM vehiculos v
WHERE r."vehiculoId" = v.id
AND r.resultado = 'APROBADO';

-- Ver el resultado después de corregir
SELECT 
    r.id,
    v.dominio,
    v.anio as "año_vehiculo",
    EXTRACT(YEAR FROM CURRENT_DATE)::int - v.anio as "antigüedad",
    r."fechaRevision" as "fecha_revision",
    r."fechaVencimiento" as "vencimiento_corregido",
    CASE 
        WHEN (EXTRACT(YEAR FROM CURRENT_DATE)::int - v.anio) <= 7 
        THEN '2 años ✓'
        ELSE '1 año ✓'
    END as "vigencia_aplicada"
FROM revisiones r
JOIN vehiculos v ON r."vehiculoId" = v.id
WHERE r.resultado = 'APROBADO'
ORDER BY r.id;

COMMIT;

SELECT '✅ Fechas de vencimiento corregidas según antigüedad del vehículo' as mensaje;
