# ⚡ Inicio Rápido - Monis-Torias

## 🎯 Resumen Ejecutivo

**Problema**: Error CORS al probar la aplicación  
**Causa**: Frontend intenta conectarse al backend en producción  
**Solución**: Iniciar backend localmente

## 🚀 Pasos para Iniciar (3 minutos)

### 1️⃣ Opción Fácil (Windows)

```powershell
.\start-all.ps1
```

Este script abrirá 2 terminales automáticamente:
- **Backend** en http://localhost:5001
- **Frontend** en http://localhost:5173

### 2️⃣ Opción Manual

**Terminal 1 - Backend:**
```bash
cd functions
npm run serve
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## ✅ Verificar que funciona

1. **Backend**: http://localhost:5001/proyecto-arqui-2c418/us-central1/api/health
   - Debería responder: `{"status":"ok"}`

2. **Frontend**: http://localhost:5173
   - Debería cargar la página de login sin errores CORS

## 🔍 Si algo falla...

### Backend no inicia

```bash
cd functions
npm install
npm run serve
```

### Frontend no conecta al backend

Verifica el archivo `frontend/.env`:

```env
VITE_API_URL=http://localhost:5001/proyecto-arqui-2c418/us-central1/api
```

### Tests fallan

```bash
cd frontend
npm run test:run
```

## 📚 Más información

- **Guía completa**: Ver `INICIO-DESARROLLO.md`
- **Documentación frontend**: Ver `frontend/README.md`
- **Evidencias**: Ver `evidencias/frontend/GUIA-EVIDENCIAS.md`

## 🎓 Comandos Útiles

```bash
# Tests unitarios
cd frontend
npm run test:coverage

# Tests E2E
npm run cypress

# Build producción
npm run build

# Ver logs del backend
cd functions
npm run logs
```

## 🌐 URLs de Desarrollo

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:5001/proyecto-arqui-2c418/us-central1/api |

## ⚠️ Recordatorios

1. ✅ El backend DEBE estar corriendo para que el frontend funcione
2. ✅ Usa el archivo `.env` para configurar variables
3. ✅ NO commitees el archivo `.env` (ya está en `.gitignore`)
4. ✅ Ejecuta tests antes de hacer push

---

**¿Listo para empezar?** → `.\start-all.ps1`
