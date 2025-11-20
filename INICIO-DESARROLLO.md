# 🚀 Guía de Inicio para Desarrollo Local

Esta guía te ayudará a iniciar tanto el frontend como el backend localmente para evitar errores de CORS.

## 📋 Requisitos Previos

- Node.js 20.x instalado
- Firebase CLI instalado: `npm install -g firebase-tools`
- Cuenta de Firebase configurada

## 🔧 Configuración Inicial (Solo la primera vez)

### 1. Instalar dependencias

```powershell
# Backend (Functions)
cd functions
npm install
cd ..

# Frontend
cd frontend
npm install
cd ..
```

### 2. Login en Firebase

```powershell
firebase login
```

## 🏃‍♂️ Iniciar el Proyecto Completo

### Opción 1: Usando Firebase Emulators (RECOMENDADO)

Esta opción emula todo Firebase localmente (Functions, Firestore, Auth):

```powershell
# Desde la raíz del proyecto
firebase emulators:start
```

Esto iniciará:
- **Functions**: http://localhost:5001
- **Firestore**: http://localhost:8080
- **Auth**: http://localhost:9099
- **Emulator UI**: http://localhost:4000

### Opción 2: Backend Real + Frontend Local

Si necesitas usar la base de datos real:

#### Terminal 1 - Backend (Firebase Functions)

```powershell
cd functions
npm run serve
```

Esto inicia las Cloud Functions en: http://localhost:5001

#### Terminal 2 - Frontend

```powershell
cd frontend
npm run dev
```

Esto inicia el frontend en: http://localhost:5173

## 🔍 Verificar que todo funciona

### 1. Verificar Backend

Abre en el navegador o usa curl:

```powershell
# Health check
curl http://localhost:5001/proyecto-arqui-2c418/us-central1/api/health

# Debería responder: {"status":"ok"}
```

### 2. Verificar Frontend

Abre: http://localhost:5173

Deberías ver la página de login sin errores de CORS.

## ⚠️ Solución de Problemas

### Error CORS: "No 'Access-Control-Allow-Origin' header"

**Causa**: El frontend intenta conectarse al backend en producción en lugar de localhost.

**Solución**: Verifica que el archivo `.env` del frontend tenga:

```env
VITE_API_URL=http://localhost:5001/proyecto-arqui-2c418/us-central1/api
```

Si usas emulators:
```env
VITE_API_URL=http://localhost:5001/your-project-id/us-central1/api
```

### Error: "Port already in use"

Si el puerto 5173 o 5001 ya está ocupado:

```powershell
# Windows - Matar proceso en puerto 5173
netstat -ano | findstr :5173
taskkill /PID <PID_NUMBER> /F

# Para puerto 5001
netstat -ano | findstr :5001
taskkill /PID <PID_NUMBER> /F
```

O cambia el puerto en `vite.config.ts`:

```typescript
export default defineConfig({
  server: {
    port: 3000  // Nuevo puerto
  }
})
```

### Backend no inicia

```powershell
# Limpiar node_modules y reinstalar
cd functions
Remove-Item -Recurse -Force node_modules
npm install
```

### Tests fallan con errores de módulos

```powershell
cd frontend
Remove-Item -Recurse -Force node_modules
npm install
npm run test:run
```

## 📁 Estructura de URLs

### Desarrollo Local

| Servicio | URL Local |
|----------|-----------|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5001/proyecto-arqui-2c418/us-central1/api |
| Firebase Emulator UI | http://localhost:4000 |
| Firestore Emulator | http://localhost:8080 |
| Auth Emulator | http://localhost:9099 |

### Producción

| Servicio | URL Producción |
|----------|----------------|
| Frontend | https://proyecto-arqui-2c418.web.app |
| Backend API | https://proyecto-arqui-2c418.web.app/api |

## 🧪 Ejecutar Tests

### Tests Unitarios

```powershell
cd frontend
npm run test:run        # Ejecuta una vez
npm run test            # Modo watch
npm run test:ui         # Interfaz visual
npm run test:coverage   # Con cobertura
```

### Tests E2E

```powershell
# Terminal 1 - Iniciar dev server
cd frontend
npm run dev

# Terminal 2 - Ejecutar Cypress
npm run cypress         # Modo interactivo
npm run cypress:headless # Modo headless (genera videos)
```

## 🐳 Docker (Opcional)

Para probar el frontend en Docker:

```powershell
cd frontend
docker build -t monis-frontend .
docker run -d -p 5173:80 monis-frontend
```

Accede en: http://localhost:5173

## 📦 Scripts Disponibles

### Frontend (desde /frontend)

```powershell
npm run dev              # Desarrollo
npm run build            # Build producción
npm run preview          # Preview del build
npm run test             # Tests (watch mode)
npm run test:run         # Tests (single run)
npm run test:coverage    # Tests con cobertura
npm run cypress          # E2E interactivo
npm run cypress:headless # E2E headless
```

### Backend (desde /functions)

```powershell
npm run serve            # Inicia Functions localmente
npm run shell            # Shell interactivo
npm run deploy           # Deploy a producción
npm run logs             # Ver logs de producción
```

### Raíz del proyecto

```powershell
firebase emulators:start     # Inicia emulators
firebase deploy              # Deploy completo
firebase deploy --only hosting      # Solo frontend
firebase deploy --only functions    # Solo backend
```

## 🔥 Workflow Recomendado de Desarrollo

1. **Inicia Firebase Emulators** (incluye backend local):
   ```powershell
   firebase emulators:start
   ```

2. **En otra terminal, inicia el frontend**:
   ```powershell
   cd frontend
   npm run dev
   ```

3. **Desarrolla** con hot-reload automático

4. **Ejecuta tests** antes de hacer commit:
   ```powershell
   npm run test:run
   ```

5. **Commit y push**:
   ```powershell
   git add .
   git commit -m "feat: descripción del cambio"
   git push
   ```

## 🎯 Checklist Pre-Deploy

Antes de hacer deploy a producción:

- [ ] Tests pasan: `npm run test:run`
- [ ] Build funciona: `npm run build`
- [ ] No hay errores de lint
- [ ] Variables de entorno configuradas en Firebase
- [ ] README actualizado
- [ ] Commits con mensajes descriptivos

## 📚 Recursos Adicionales

- [Firebase Emulators](https://firebase.google.com/docs/emulator-suite)
- [Vite Docs](https://vitejs.dev/)
- [Vitest Docs](https://vitest.dev/)
- [Cypress Docs](https://docs.cypress.io/)

---

**Última actualización**: Noviembre 2025
