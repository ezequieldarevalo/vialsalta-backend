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
  -d '{"email":"admin@example.com","password":"Admin123!"}')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.access_token')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ Error al obtener token"
  echo "Respuesta: $LOGIN_RESPONSE"
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
    "dominio": "COND'$(date +%s)'",
    "marca": "TEST",
    "modelo": "CONDICIONAL",
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
    "observaciones": "Prueba de revisión condicional - defecto menor",
    "kilometraje": 50000
  }')

echo "Respuesta CONDICIONAL: $REVISION_COND"
echo ""

REVISION_COND_ID=$(echo $REVISION_COND | jq -r '.id')
FECHA_REV_COND=$(echo $REVISION_COND | jq -r '.fechaRevision')
FECHA_VENC_COND=$(echo $REVISION_COND | jq -r '.fechaVencimiento')

echo "✅ Revisión CONDICIONAL creada:"
echo "   ID: $REVISION_COND_ID"
echo "   Fecha revisión: $FECHA_REV_COND"
echo "   Fecha vencimiento: $FECHA_VENC_COND"
echo "   (Debe ser aprox. 60 días desde hoy)"
echo ""

# Calcular diferencia de días
if [ "$FECHA_REV_COND" != "null" ] && [ "$FECHA_VENC_COND" != "null" ]; then
  DIAS_DIFF=$(( ($(date -d "$FECHA_VENC_COND" +%s) - $(date -d "$FECHA_REV_COND" +%s)) / 86400 ))
  echo "   → Diferencia: $DIAS_DIFF días (esperado: 60)"
fi
echo ""

# Esperar 5 segundos (simulando paso de tiempo)
echo "⏱️  Esperando 5 segundos para simular paso del tiempo..."
sleep 5

# Crear revisión APROBADO (debe tener vigencia ajustada)
echo "4️⃣ Creando revisión APROBADO (vigencia con ajuste de tiempo)..."
REVISION_APR=$(curl -s -X POST "${API}/revisiones" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "vehiculoId": '$VEHICULO_ID',
    "plantaId": 1,
    "resultado": "APROBADO",
    "observaciones": "Prueba de revisión aprobada - defecto corregido",
    "kilometraje": 50100
  }')

echo "Respuesta APROBADO: $REVISION_APR"
echo ""

REVISION_APR_ID=$(echo $REVISION_APR | jq -r '.id')
FECHA_REV_APR=$(echo $REVISION_APR | jq -r '.fechaRevision')
FECHA_VENC_APR=$(echo $REVISION_APR | jq -r '.fechaVencimiento')

echo "✅ Revisión APROBADO creada:"
echo "   ID: $REVISION_APR_ID"
echo "   Fecha revisión: $FECHA_REV_APR"
echo "   Fecha vencimiento: $FECHA_VENC_APR"
echo ""

# Calcular diferencia de días entre aprobado y vencimiento
if [ "$FECHA_REV_APR" != "null" ] && [ "$FECHA_VENC_APR" != "null" ]; then
  DIAS_VIGENCIA=$(( ($(date -d "$FECHA_VENC_APR" +%s) - $(date -d "$FECHA_REV_APR" +%s)) / 86400 ))
  echo "   → Vigencia total: $DIAS_VIGENCIA días"
  echo "   → Esperado: ~360 días (365 - 5 días transcurridos)"
fi
echo ""

echo "=================================================="
echo "📊 RESUMEN DE FECHAS"
echo "=================================================="
echo "Fecha actual:             $(date -I)"
echo ""
echo "CONDICIONAL:"
echo "  Fecha revisión:         $FECHA_REV_COND"
echo "  Fecha vencimiento:      $FECHA_VENC_COND"
echo ""
echo "APROBADO (ajustado):"
echo "  Fecha revisión:         $FECHA_REV_APR"
echo "  Fecha vencimiento:      $FECHA_VENC_APR"
echo ""
echo "=================================================="
echo "✅ Prueba completada."
echo "📝 Revisa los logs del backend para ver:"
echo "   [calcularVencimiento] CONDICIONAL → 60 días"
echo "   [calcularVencimiento] Condicional previa encontrada"
echo "   [calcularVencimiento] APROBADO con ajuste → días transcurridos"
echo "=================================================="

