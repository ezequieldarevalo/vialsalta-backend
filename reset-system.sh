#!/bin/bash

echo "════════════════════════════════════════════════════════════════"
echo "🔥 RESET COMPLETO DEL SISTEMA DE OBLEAS Y BLOQUES"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "⚠️  ADVERTENCIA: Esta operación:"
echo "   • Eliminará TODAS las obleas"
echo "   • Eliminará TODOS los bloques"
echo "   • Desvinculará obleas de las revisiones existentes"
echo "   • Reseteará los contadores (IDs empezarán en 1)"
echo ""
read -p "¿Estás seguro de continuar? (escribe 'SI' para confirmar): " confirmacion

if [ "$confirmacion" != "SI" ]; then
    echo "❌ Operación cancelada"
    exit 1
fi

echo ""
echo "🔄 Ejecutando reset..."
echo ""

# Verificar que existe la base de datos
if ! docker exec -i obleas-postgres psql -U postgres -d obleas_db -c '\dt' > /dev/null 2>&1; then
    echo "❌ No se puede conectar a la base de datos"
    echo "   Verifica que el contenedor Docker esté corriendo"
    exit 1
fi

# Ejecutar el script SQL
docker exec -i obleas-postgres psql -U postgres -d obleas_db < reset-obleas.sql

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "✅ Reset completado exitosamente"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "📝 Próximos pasos:"
echo "   1. Reinicia el servidor backend (npm run start:dev)"
echo "   2. Crea nuevos bloques desde el frontend"
echo "   3. Las obleas se generarán con formato consistente"
echo ""
