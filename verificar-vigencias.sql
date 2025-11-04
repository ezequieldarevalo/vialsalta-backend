-- ============================================================================
-- VERIFICAR VIGENCIAS DE REVISIONES
-- ============================================================================
-- Este script muestra todas las revisiones APROBADAS con su vigencia
-- calculada según la antigüedad del vehículo
-- ============================================================================

SELECT 
    r.id as "ID Revisión",
    v.dominio as "Dominio",
    v.anio as "Año Vehículo",
    EXTRACT(YEAR FROM CURRENT_DATE)::int - v.anio as "Antigüedad",
    r."fechaRevision" as "Fecha Revisión",
    r."fechaVencimiento" as "Fecha Vencimiento",
    EXTRACT(YEAR FROM r."fechaVencimiento")::int - EXTRACT(YEAR FROM r."fechaRevision")::int as "Años Vigencia",
    CASE 
        WHEN (EXTRACT(YEAR FROM CURRENT_DATE)::int - v.anio) <= 7 THEN '2 años (≤7 años antigüedad)'
        ELSE '1 año (>7 años antigüedad)'
    END as "Vigencia Esperada",
    CASE 
        WHEN (EXTRACT(YEAR FROM r."fechaVencimiento")::int - EXTRACT(YEAR FROM r."fechaRevision")::int) = 
             CASE WHEN (EXTRACT(YEAR FROM CURRENT_DATE)::int - v.anio) <= 7 THEN 2 ELSE 1 END
        THEN '✓ CORRECTO'
        ELSE '✗ INCORRECTO'
    END as "Estado"
FROM revisiones r
JOIN vehiculos v ON r."vehiculoId" = v.id
WHERE r.resultado = 'APROBADO'
ORDER BY r.id DESC;

-- Resumen
SELECT 
    COUNT(*) as "Total APROBADAS",
    SUM(CASE WHEN (EXTRACT(YEAR FROM r."fechaVencimiento")::int - EXTRACT(YEAR FROM r."fechaRevision")::int) = 
                   CASE WHEN (EXTRACT(YEAR FROM CURRENT_DATE)::int - v.anio) <= 7 THEN 2 ELSE 1 END
             THEN 1 ELSE 0 END) as "Correctas",
    SUM(CASE WHEN (EXTRACT(YEAR FROM r."fechaVencimiento")::int - EXTRACT(YEAR FROM r."fechaRevision")::int) != 
                   CASE WHEN (EXTRACT(YEAR FROM CURRENT_DATE)::int - v.anio) <= 7 THEN 2 ELSE 1 END
             THEN 1 ELSE 0 END) as "Incorrectas"
FROM revisiones r
JOIN vehiculos v ON r."vehiculoId" = v.id
WHERE r.resultado = 'APROBADO';
