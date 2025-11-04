-- ============================================================================
-- RESET COMPLETO DEL SISTEMA DE OBLEAS Y BLOQUES
-- ============================================================================
-- ADVERTENCIA: Este script eliminará TODOS los datos de obleas y bloques
-- También eliminará certificados asociados
-- ============================================================================

BEGIN;

-- 1. Primero, eliminar certificados que referencian obleas
DELETE FROM certificados WHERE "oleaId" IS NOT NULL;

-- 2. Actualizar revisiones para quitar referencia a obleas
UPDATE revisiones SET "oleaId" = NULL WHERE "oleaId" IS NOT NULL;

-- 3. Eliminar todas las obleas
DELETE FROM obleas;

-- 4. Eliminar todos los bloques
DELETE FROM bloques_obleas;

-- 5. Resetear las secuencias para que los IDs empiecen desde 1
ALTER SEQUENCE IF EXISTS obleas_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS bloques_obleas_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS certificados_id_seq RESTART WITH 1;

-- 6. Verificar que las tablas están vacías
SELECT 
    (SELECT COUNT(*) FROM obleas) as obleas_eliminadas,
    (SELECT COUNT(*) FROM bloques_obleas) as bloques_eliminados,
    (SELECT COUNT(*) FROM revisiones WHERE "oleaId" IS NOT NULL) as revisiones_con_oblea,
    (SELECT COUNT(*) FROM certificados) as certificados_restantes;

COMMIT;

-- ============================================================================
-- RESULTADO ESPERADO:
-- obleas_eliminadas    | 0
-- bloques_eliminados   | 0
-- revisiones_con_oblea | 0
-- certificados_restantes | (solo los condicionales sin oblea)
-- ============================================================================

SELECT '✅ Reset completado. El sistema está listo para generar nuevos bloques y obleas.' as mensaje;
