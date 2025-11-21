# 🐳 Docker Setup - Monis Torias Backend

## Arquitectura de Contenedores

El proyecto está containerizado con 3 servicios:

1. **Backend** (`monis-torias-backend`): Firebase Functions en Node.js 20
2. **Frontend** (`monis-torias-frontend`): React App servida con Nginx
3. **Redis** (`monis-torias-redis`): Caché opcional para sesiones

## 📋 Prerrequisitos

### Instalar Docker Desktop

```powershell
# Opción 1: Descargar de https://www.docker.com/products/docker-desktop/

# Opción 2: Con winget
winget install Docker.DockerDesktop
```

Después de instalar:
1. Reinicia tu computadora
2. Abre Docker Desktop
3. Verifica que esté corriendo: `docker --version`

### Obtener Service Account Key

El backend necesita un archivo de credenciales de Firebase:

1. Ve a Firebase Console: https://console.firebase.google.com/
2. Selecciona tu proyecto: `proyecto-arqui-2c418`
3. Ve a **Project Settings** (⚙️) → **Service Accounts**
4. Click en **Generate new private key**
5. Guarda el archivo como `functions/serviceAccount.json`

⚠️ **IMPORTANTE**: Este archivo contiene credenciales sensibles. NO lo commitees a Git.

```powershell
# Verifica que .gitignore incluye serviceAccount.json
Select-String -Path .gitignore -Pattern "serviceAccount.json"
```

## 🚀 Uso de Docker

### 1. Build de las imágenes

```powershell
# Build de todos los servicios
docker-compose build

# Build solo del backend
docker-compose build backend

# Build sin caché (útil si hay problemas)
docker-compose build --no-cache
```

### 2. Iniciar los contenedores

```powershell
# Iniciar todos los servicios en modo detached (-d)
docker-compose up -d

# Iniciar con logs visibles (útil para debugging)
docker-compose up

# Iniciar solo backend y frontend (sin Redis)
docker-compose up -d backend frontend
```

**URLs de acceso:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5001/proyecto-arqui-2c418/us-central1/api
- Redis: localhost:6379 (password: `redispassword`)

### 3. Ver logs

```powershell
# Logs de todos los servicios
docker-compose logs -f

# Logs solo del backend
docker-compose logs -f backend

# Últimas 50 líneas del frontend
docker-compose logs --tail=50 frontend
```

### 4. Detener los contenedores

```powershell
# Detener todos los servicios
docker-compose down

# Detener y eliminar volúmenes (Redis data)
docker-compose down -v

# Detener sin eliminar contenedores
docker-compose stop
```

### 5. Reiniciar un servicio

```powershell
# Reiniciar el backend
docker-compose restart backend

# Rebuild y reiniciar después de cambios en código
docker-compose up -d --build backend
```

## 🔍 Comandos de Debugging

### Inspeccionar contenedores

```powershell
# Ver contenedores corriendo
docker ps

# Ver todos los contenedores (incluyendo detenidos)
docker ps -a

# Inspeccionar detalles de un contenedor
docker inspect monis-torias-backend
```

### Acceder a un contenedor

```powershell
# Shell interactivo en el backend
docker exec -it monis-torias-backend sh

# Ver archivos en el contenedor
docker exec monis-torias-backend ls -la /app

# Verificar variables de entorno
docker exec monis-torias-backend env
```

### Health checks

```powershell
# Ver estado de health de todos los servicios
docker-compose ps

# Health check manual del backend
docker exec monis-torias-backend wget -O- http://localhost:5001/health
```

### Monitoreo de recursos

```powershell
# Ver uso de CPU/RAM en tiempo real
docker stats

# Ver solo backend y frontend
docker stats monis-torias-backend monis-torias-frontend
```

## 📊 Estructura del Dockerfile Backend

```dockerfile
# Stage 1: Builder - Instala todas las deps y prepara código
FROM node:20-alpine AS builder
...

# Stage 2: Production - Solo deps de producción
FROM node:20-alpine AS production
...
```

**Características:**
- ✅ Multi-stage build (imagen final más pequeña)
- ✅ Usuario no-root (`nodejs:1001`)
- ✅ Health check configurado
- ✅ dumb-init para manejo de señales
- ✅ Caché de layers optimizado

## 🔧 Configuración Avanzada

### Variables de entorno personalizadas

Crea un archivo `.env` en la raíz:

```env
# Backend
NODE_ENV=development
PORT=5001
REDIS_URL=redis://redis:6379
REDIS_PASSWORD=redispassword

# Frontend
VITE_API_URL=http://localhost:5001/proyecto-arqui-2c418/us-central1/api
```

Luego modifica `docker-compose.yml`:

```yaml
services:
  backend:
    env_file:
      - .env
```

### Hot reload en desarrollo

Descomenta esta línea en `docker-compose.yml`:

```yaml
volumes:
  - ./functions/src:/app/src:ro
```

Usa `nodemon` en el Dockerfile:

```dockerfile
CMD ["npx", "nodemon", "src/index.js"]
```

### Usar Redis en el backend

Instala el cliente Redis:

```powershell
cd functions
npm install redis
```

Conecta en tu código:

```javascript
const redis = require('redis');

const client = redis.createClient({
  url: 'redis://redis:6379',
  password: 'redispassword'
});

await client.connect();
```

## 🧪 Testing con Docker

### Ejecutar tests dentro del contenedor

```powershell
# Unit tests
docker exec monis-torias-backend npm run test:unit

# Integration tests
docker exec monis-torias-backend npm run test:integration

# Coverage
docker exec monis-torias-backend npm run test:coverage
```

### Ejecutar k6 load tests contra contenedor

```powershell
# Asegúrate de que los contenedores estén corriendo
docker-compose up -d

# Ejecuta k6 desde tu máquina local
cd functions/load-tests
k6 run sessions.js --env BASE_URL=http://localhost:5001/proyecto-arqui-2c418/us-central1/api
```

## 🚨 Troubleshooting

### Problema: Backend no inicia

```powershell
# Ver logs detallados
docker-compose logs backend

# Posibles causas:
# 1. serviceAccount.json falta → Descárgalo de Firebase Console
# 2. Puerto 5001 ocupado → Cambia en docker-compose.yml: "5002:5001"
# 3. Memoria insuficiente → Aumenta en Docker Desktop Settings
```

### Problema: "Cannot connect to Docker daemon"

```powershell
# Asegúrate de que Docker Desktop esté corriendo
Get-Process "Docker Desktop"

# Si no está corriendo, inícialo desde el menú de inicio
```

### Problema: Build muy lento

```powershell
# Usa BuildKit para builds más rápidos
$env:DOCKER_BUILDKIT=1
docker-compose build

# Limpia imágenes viejas
docker system prune -a
```

### Problema: Frontend no puede conectar con backend

```powershell
# Verifica la red
docker network inspect monis-torias-net

# Asegúrate de que VITE_API_URL apunta a localhost (no a us-central1...)
# En docker-compose.yml, el build arg debe ser:
# VITE_API_URL=http://localhost:5001/proyecto-arqui-2c418/us-central1/api
```

## 📦 Comandos Útiles

```powershell
# Ver tamaño de las imágenes
docker images

# Limpiar todo (imágenes, contenedores, volúmenes, networks)
docker system prune -a --volumes

# Exportar imagen para compartir
docker save -o backend.tar monis-torias-backend:latest

# Importar imagen
docker load -i backend.tar

# Ver redes
docker network ls

# Ver volúmenes
docker volume ls
```

## 📈 Producción

Para producción, usa un `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  backend:
    image: ghcr.io/tu-usuario/monis-torias-backend:latest
    environment:
      - NODE_ENV=production
    # Sin volúmenes montados
    # Con secretos desde environment
```

Deploy:

```powershell
docker-compose -f docker-compose.prod.yml up -d
```

## ✅ Checklist de Setup

- [ ] Docker Desktop instalado y corriendo
- [ ] `serviceAccount.json` descargado y en `functions/`
- [ ] `.gitignore` incluye `serviceAccount.json`
- [ ] `docker-compose build` ejecutado sin errores
- [ ] `docker-compose up -d` inicia todos los servicios
- [ ] Health checks pasan (verde en `docker-compose ps`)
- [ ] Frontend accesible en http://localhost:5173
- [ ] Backend API responde en http://localhost:5001/.../api/health
- [ ] Logs no muestran errores críticos

## 🎯 Próximos Pasos

1. ✅ Ejecuta `docker-compose up -d`
2. ✅ Verifica que los 3 servicios estén "healthy"
3. ✅ Prueba el frontend en http://localhost:5173
4. ✅ Ejecuta tests dentro del contenedor
5. ✅ Ejecuta k6 load tests contra el backend containerizado
