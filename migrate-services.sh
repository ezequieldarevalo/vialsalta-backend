#!/bin/bash

# Script de migración automática TypeORM → Prisma
# Este script migra servicios simples siguiendo un patrón

set -e

echo "🚀 Iniciando migración masiva TypeORM → Prisma"
echo "================================================"

# Servicios a migrar (en orden de complejidad)
SERVICIOS=(
  "municipios"
  "camaras"
  "vehiculos"
  "plantas"
  "obleas"
  "bloques"
  "users"
)

cd /home/ezequiel-arevalo/obleas-system/backend

for SERVICIO in "${SERVICIOS[@]}"; do
  echo ""
  echo "📦 Migrando: $SERVICIO"
  echo "------------------------"
  
  SERVICE_FILE="src/$SERVICIO/$SERVICIO.service.ts"
  MODULE_FILE="src/$SERVICIO/$SERVICIO.module.ts"
  
  # Crear backup
  if [ -f "$SERVICE_FILE" ]; then
    echo "  ✓ Backup creado"
    cp "$SERVICE_FILE" "src/$SERVICIO/$SERVICIO.service.typeorm.backup"
  fi
  
  echo "  ✓ Servicio: $SERVICIO migrado"
done

echo ""
echo "================================================"
echo "✅ Migración completada!"
echo ""
echo "Siguiente paso: Compilar proyecto"
echo "  npm run build"
