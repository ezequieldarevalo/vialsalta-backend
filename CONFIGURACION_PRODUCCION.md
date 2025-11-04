# 🚀 Configuración para Producción

## 📋 Variables de Entorno para QR Codes

### Backend (.env)

El sistema genera códigos QR con URL completa usando la variable `FRONTEND_URL`:

```bash
# .env (Backend)

# 🌐 URL del Frontend (IMPORTANTE para QR codes)
FRONTEND_URL=http://localhost:5173  # ← Desarrollo
# FRONTEND_URL=https://obleas.tudominio.com  # ← Producción

# 🔐 Secreto para firmar QR codes (32+ caracteres)
QR_SECRET=tu_secreto_super_seguro_minimo_32_caracteres_aqui

# 📊 Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=obleas_db
DB_USER=postgres
DB_PASSWORD=tu_password_seguro

# 🔑 JWT Secret
JWT_SECRET=otro_secreto_muy_seguro_para_jwt_tokens
```

---

## 🔄 Flujo de QR Code

### Generación del QR (al crear bloque de obleas)

**Código en:** `src/bloques/bloques.service.ts`

```typescript
private generateQRCode(numero: number, bloqueId: number): string {
  // 1. Generar firma criptográfica
  const signature = crypto
    .createHash('sha256')
    .update(`${numero}-${bloqueId}-${process.env.QR_SECRET}`)
    .digest('hex')
    .substring(0, 16);
  
  // 2. Crear código
  const codigo = `OBL-${numero}-${signature}`;
  
  // 3. 🌐 Agregar URL del frontend
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  return `${frontendUrl}/verificar/${codigo}`;
}
```

**Resultado:**
- **Desarrollo**: `http://localhost:5173/verificar/OBL-1000002-1166cab25b581ca0`
- **Producción**: `https://obleas.tudominio.com/verificar/OBL-1000002-1166cab25b581ca0`

---

## 🔧 Migración de Desarrollo a Producción

### Escenario 1: Obleas ya creadas en desarrollo

Si ya tienes obleas creadas con `http://localhost:5173`, necesitas regenerarlas:

```bash
# En el servidor de producción
cd backend

# Editar .env
nano .env
# Cambiar FRONTEND_URL=https://obleas.tudominio.com

# Ejecutar script de migración
node migrate-qr-urls.js
```

**Script de migración** (ya creado: `migrate-qr-urls.js`):
- Lee todas las obleas
- Regenera los QR con la nueva URL
- Actualiza la base de datos

### Escenario 2: Migración limpia

Si migras la base de datos vacía:

1. Configurar `.env` con la URL de producción
2. Crear bloques de obleas
3. Los QR se generan automáticamente con la URL correcta

---

## 🎯 Checklist de Despliegue

### Antes de ir a producción:

- [ ] **1. Configurar FRONTEND_URL**
  ```bash
  FRONTEND_URL=https://obleas.tudominio.com
  ```

- [ ] **2. Configurar QR_SECRET** (CRÍTICO)
  ```bash
  # Generar secreto fuerte
  QR_SECRET=$(openssl rand -hex 32)
  
  # O usar un generador online
  QR_SECRET=a1b2c3d4e5f6...  # 64 caracteres
  ```
  
  ⚠️ **IMPORTANTE**: Una vez en producción, **NUNCA cambiar** `QR_SECRET` porque invalidaría todos los QR existentes.

- [ ] **3. Verificar generación de QR**
  ```bash
  # Crear un bloque de prueba
  # Verificar que el QR contenga: https://obleas.tudominio.com/verificar/...
  ```

- [ ] **4. Regenerar obleas existentes** (si ya hay datos de desarrollo)
  ```bash
  node migrate-qr-urls.js
  ```

---

## 📊 Ejemplo Completo

### Desarrollo (.env)
```bash
FRONTEND_URL=http://localhost:5173
QR_SECRET=dev-secret-123
```

**QR generado:**
```
http://localhost:5173/verificar/OBL-1000002-abc123def456
```

### Producción (.env)
```bash
FRONTEND_URL=https://obleas.salta.gob.ar
QR_SECRET=prod-5f8a9b2c3d4e...  # 64 caracteres
```

**QR generado:**
```
https://obleas.salta.gob.ar/verificar/OBL-1000002-xyz789abc123
```

---

## 🔐 Seguridad del QR_SECRET

### ¿Qué pasa si cambio el QR_SECRET?

1. **Todos los QR existentes se invalidan** ❌
2. La firma no coincidirá
3. Los ciudadanos verán "QR inválido" al escanear

### Solución: NUNCA cambiar en producción

Si necesitas cambiar por seguridad:

```bash
# 1. Respaldar el QR_SECRET anterior
QR_SECRET_OLD=secret_anterior
QR_SECRET_NEW=secret_nuevo

# 2. Regenerar TODAS las obleas
node regenerar-todas-obleas.js

# 3. Actualizar .env con nuevo secret
```

---

## 🧪 Testing en Producción

### 1. Crear bloque de prueba (1 oblea)
```bash
POST /bloques
{
  "cantidad": 1,
  "plantaId": 1
}
```

### 2. Verificar QR generado
```sql
SELECT numero, "codigoQr" FROM obleas ORDER BY id DESC LIMIT 1;
```

**Debe contener:**
```
https://obleas.tudominio.com/verificar/OBL-...
```

### 3. Probar escaneo
- Generar QR físico con el código
- Escanearlo con un teléfono
- Debe abrir: `https://obleas.tudominio.com/verificar/...`

---

## 🌐 Configuración de DNS y SSL

### Frontend (Nginx + Let's Encrypt)

```nginx
# /etc/nginx/sites-available/obleas-frontend
server {
    listen 80;
    server_name obleas.tudominio.com;
    
    # Redirigir a HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name obleas.tudominio.com;
    
    # Certificados SSL (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/obleas.tudominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/obleas.tudominio.com/privkey.pem;
    
    # Frontend estático
    root /var/www/obleas-frontend/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Proxy para API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 📱 Ruta de Verificación Pública

### Frontend: `src/pages/VerificarPage.tsx`

```typescript
// Cuando alguien escanea el QR:
// https://obleas.tudominio.com/verificar/OBL-1000002-abc123

// React Router captura la ruta
<Route path="/verificar/:codigo" element={<VerificarPage />} />

// Extrae el código
const { codigo } = useParams();  // "OBL-1000002-abc123"

// Llama al backend
GET /certificados/verificar/OBL-1000002-abc123

// Backend valida firma y devuelve info del certificado
```

---

## 🔄 Script de Migración para Producción

### Regenerar QR Codes con Nueva URL

```javascript
// migrate-qr-production.js
const FRONTEND_URL = process.env.FRONTEND_URL;

console.log(`🔄 Regenerando QR codes para: ${FRONTEND_URL}`);

// Para cada oblea:
//   1. Leer numero y bloqueId
//   2. Regenerar QR con nueva URL
//   3. Actualizar en base de datos

// Ejemplo:
// Antes: http://localhost:5173/verificar/OBL-1000002-abc123
// Después: https://obleas.tudominio.com/verificar/OBL-1000002-abc123
```

**Ejecutar:**
```bash
FRONTEND_URL=https://obleas.tudominio.com node migrate-qr-production.js
```

---

## 📋 Resumen

| Variable | Desarrollo | Producción |
|----------|-----------|------------|
| `FRONTEND_URL` | `http://localhost:5173` | `https://obleas.tudominio.com` |
| `QR_SECRET` | Cualquiera (testing) | **64 caracteres seguros** |
| QR generado | `http://localhost:5173/verificar/...` | `https://obleas.tudominio.com/verificar/...` |

---

## ⚠️ IMPORTANTE

1. **Configurar `FRONTEND_URL` ANTES de crear obleas en producción**
2. **NUNCA cambiar `QR_SECRET` en producción** (invalida todos los QR)
3. **Usar HTTPS** en producción (Let's Encrypt gratis)
4. **Probar QR** antes de imprimir masivamente

---

Fecha: 2025-11-03
Autor: GitHub Copilot
