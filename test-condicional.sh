#!/bin/bash

# 🧪 Script de prueba para certificados CONDICIONALES

echo "=================================================="
echo "🧪 PRUEBA DE CERTIFICADOS CONDICIONALES"
echo "=================================================="
echo ""

# Configuración
API="http://localhost:3000"
TOKEN=""

echo "1️⃣ Iniciando sesión como admin..."
LOGIN_RESPONSE=$(curl -s -X POST "${API}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.access_token')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ Error al obtener token"
  exit 1
fi

echo "✅ Token obtenido: ${TOKEN:0:20}..."
echo ""

# Crear vehículo de prueba
echo "2️⃣ Creando vehículo de prueba..."
VEHICULO=$(curl -s -X POST "${API}/vehiculos" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "dominio": "TEST'$(date +%s)'",
    "marca": "TEST",
    "modelo": "TEST",
    "anio": 2020,
    "tipoVehiculo": "AUTOMOVIL",
    "tipoCombustible": "NAFTA"
  }')

VEHICULO_ID=$(echo $VEHICULO | jq -r '.id')
echo "✅ Vehículo creado: ID=$VEHICULO_ID"
echo ""

# Crear revisión CONDICIONAL
echo "3️⃣ Creando revisión CONDICIONAL (60 días de vigencia)..."
REVISION_COND=$(curl -s -X POST "${API}/revisiones" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "vehiculoId": '$VEHICULO_ID',
    "plantaId": 1,
    "resultado": "CONDICIONAL",
    "observaciones": "Prueba de revisión condicional",
    "kilometraje": 50000
  }')

REVISION_COND_ID=$(echo $REVISION_COND | jq -r '.id')
FECHA_VENC_COND=$(echo $REVISION_COND | jq -r '.fechaVencimiento')

echo "✅ Revisión CONDICIONAL creada:"
echo "   ID: $REVISION_COND_ID"
echo "   Fecha vencimiento: $FECHA_VENC_COND"
echo "   (Debe ser aprox. 60 días desde hoy)"
echo ""

# Esperar 2 segundos (simulando paso de tiempo)
sleep 2

# Crear revisión APROBADO (debe tener vigencia ajustada)
echo "4️⃣ Creando revisión APROBADO (vigencia con ajuste de tiempo)..."
REVISION_APR=$(curl -s -X POST "${API}/revisiones" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "vehiculoId": '$VEHICULO_ID',
    "plantaId": 1,
    "resultado": "APROBADO",
    "observaciones": "Prueba de revisión aprobada después de condicional",
    "kilometraje": 50100
  }')

REVISION_APR_ID=$(echo $REVISION_APR | jq -r '.id')
FECHA_VENC_APR=$(echo $REVISION_APR | jq -r '.fechaVencimiento')

echo "✅ Revisión APROBADO creada:"
echo "   ID: $REVISION_APR_ID"
echo "   Fecha vencimiento: $FECHA_VENC_APR"
echo "   (Debe ser 1 año MENOS ~2 días desde hoy)"
echo ""

echo "=================================================="
echo "📊 RESUMEN DE FECHAS"
echo "=================================================="
echo "Fecha actual:           $(date -I)"
echo "Venc. CONDICIONAL:      $FECHA_VENC_COND"
echo "Venc. APROBADO ajustado: $FECHA_VENC_APR"
echo ""
echo "✅ Prueba completada. Revisa los logs del backend para ver:"
echo "   [calcularVencimiento] CONDICIONAL → 60 días"
echo "   [calcularVencimiento] APROBADO con ajuste → días transcurridos"

