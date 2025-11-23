# Proyecto-Monitorias-Arqui
Proyecto para Diseño y Arquitectura de Software Corte 1

## 🎓 Integrantes

- **Luis Mario Ramírez Muñoz**
- **Santiago Gutiérrez de Piñeres Barbosa**
- **Santiago Urrego Rodríguez**

## 📚 Wiki

La wiki no se encuentra en este README, se encuentra en la sección de wiki del repositorio de GitHub.

## 🚀 Inicio Rápido

### Opción 1: Scripts Automáticos (Windows)

```powershell
# Iniciar Backend y Frontend simultáneamente
.\start-all.ps1

# O iniciarlos por separado:
.\start-backend.ps1   # Terminal 1
.\start-frontend.ps1  # Terminal 2
```

### Opción 2: Manual

#### Backend (Firebase Functions)

```bash
cd functions
npm install
npm run serve
# Disponible en: http://localhost:5001
```

#### Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
# Disponible en: http://localhost:5173
```

### Configuración Inicial

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/10santiago12/Proyecto-Monis-Torias-Arqui.git
   cd Proyecto-Monis-Torias-Arqui
   ```

2. **Configurar variables de entorno**
   ```bash
   cd frontend
   copy .env.example .env
   # Editar .env con tus credenciales de Firebase
   ```

3. **Instalar dependencias**
   ```bash
   # Backend
   cd functions
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   ```

## 📁 Estructura del Proyecto

```
Proyecto-Monis-Torias-Arqui/
├── frontend/              # Aplicación React + TypeScript
│   ├── src/
│   │   ├── pages/        # Páginas (Login, Dashboard, etc.)
│   │   ├── components/   # Componentes reutilizables
│   │   ├── services/     # API client
│   │   ├── context/      # React Context (Auth)
│   │   └── routes/       # Configuración de rutas
│   ├── __tests__/        # Tests unitarios
│   ├── cypress/          # Tests E2E
│   └── .env              # Variables de entorno (no commitear)
├── functions/            # Backend Firebase Functions
│   ├── src/
│   │   ├── api/         # Rutas de la API
│   │   ├── services/    # Lógica de negocio
│   │   ├── repos/       # Acceso a datos
│   │   └── middlewares/ # Auth, roles, errores
│   └── package.json
├── evidencias/           # Evidencias de testing y deployment
├── start-all.ps1        # Script para iniciar todo
└── README.md
```

## 🧪 Testing

### Tests Unitarios

```bash
cd frontend
npm run test           # Watch mode
npm run test:run       # Single run
npm run test:coverage  # Con cobertura
```

### Tests E2E (Cypress)

```bash
cd frontend
npm run dev            # Terminal 1
npm run cypress        # Terminal 2 (interactivo)
npm run cypress:headless  # Headless (genera videos)
```

## 🐳 Docker

```bash
cd frontend
docker build -t monis-frontend .
docker run -d -p 5173:80 monis-frontend
```

O usando docker-compose:

```bash
docker-compose up
```

## 📖 Documentación Adicional

- **Frontend**: Ver `frontend/README.md`
- **Desarrollo**: Ver `INICIO-DESARROLLO.md`
- **Evidencias**: Ver `evidencias/frontend/GUIA-EVIDENCIAS.md`

## 🔧 Solución de Problemas

### Error CORS al probar la aplicación

**Problema**: `Access-Control-Allow-Origin header is present`

**Solución**: Asegúrate de que el backend esté corriendo localmente:

```bash
cd functions
npm run serve
```

Y verifica que el archivo `.env` tenga:
```env
VITE_API_URL=http://localhost:5001/proyecto-arqui-2c418/us-central1/api
```

### Tests fallan

```bash
cd frontend
rm -rf node_modules
npm install
npm run test:run
```

### Backend no inicia

```bash
cd functions
rm -rf node_modules
npm install
npm run serve
```

## 🌐 URLs

### Desarrollo Local

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5001/proyecto-arqui-2c418/us-central1/api

### Producción

- **Frontend**: https://proyecto-arqui-2c418.web.app
- **Backend**: https://proyecto-arqui-2c418.web.app/api

## 📝 Scripts Disponibles

### Frontend
- `npm run dev` - Servidor de desarrollo
- `npm run build` - Build de producción
- `npm run test` - Tests en modo watch
- `npm run test:coverage` - Tests con cobertura
- `npm run cypress` - E2E tests interactivos

### Backend
- `npm run serve` - Servidor local de Functions
- `npm run deploy` - Deploy a producción
- `npm run logs` - Ver logs de producción

## 🚢 Deployment

### Opción 1: GitHub Actions (Recomendado)

El proyecto tiene CI/CD automático configurado:

- **CI**: Tests automáticos en cada push/PR
- **CD**: Deploy automático a Firebase en merge a `main`

📖 **Guía completa**: [`.github/GITHUB_ACTIONS_SETUP.md`](.github/GITHUB_ACTIONS_SETUP.md)

```bash
# Configurar secret FIREBASE_TOKEN en GitHub
firebase login:ci
# Copiar el token a GitHub Settings → Secrets → FIREBASE_TOKEN
```

### Opción 2: Firebase CLI Manual

```bash
# Deploy completo (frontend + backend)
firebase deploy

# Solo frontend
firebase deploy --only hosting

# Solo backend
firebase deploy --only functions
```

### Opción 3: Docker

El proyecto está completamente containerizado con Docker Compose:

📖 **Guía completa**: [`DOCKER_SETUP.md`](DOCKER_SETUP.md)

```bash
# Iniciar todos los servicios (backend + frontend + redis)
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener
docker-compose down
```

## 🧪 Testing

### Backend Tests

```bash
cd functions

# Unit tests (92 tests, 98.67% coverage)
npm run test:unit

# Integration tests (12 tests)
npm run test:integration

# Coverage report
npm run test:coverage

# Postman/Newman API tests
npm run postman

# k6 Load tests
cd load-tests
k6 run sessions.js
k6 run auth.js
```

### Frontend Tests

```bash
cd frontend

# Unit tests con Vitest
npm test

# E2E tests con Cypress
npm run test:e2e

# Coverage
npm run test:coverage
```

## 📦 Tecnologías

### Frontend
- React 19.1
- TypeScript
- Vite 7
- React Router v7
- Vitest + Cypress
- Firebase SDK

### Backend
- Firebase Functions
- Express.js 4.19.2
- Firestore
- Firebase Auth
- Zod 3.23.8 (validation)
- CORS 2.8.5

### Testing & Automation
- **Unit/Integration**: Jest 30.2.0 + Supertest 7.1.4
- **API Testing**: Postman + Newman
- **Load Testing**: k6 v1.4.1
- **CI/CD**: GitHub Actions
- **Containerization**: Docker + Docker Compose

### Coverage
- Backend: **98.67%** (92 unit tests)
  - Services: 96.9%
  - Repositories: 100%
  - Middlewares: 100%
- Frontend: 85%+ (Vitest + Cypress)

## 🤝 Contribuir

1. Crear rama: `git checkout -b feature/nueva-funcionalidad`
2. Hacer commits: `git commit -m "feat: descripción"`
3. Push: `git push origin feature/nueva-funcionalidad`
4. Crear Pull Request

## 📄 Licencia

© 2025 Monis-Torias — Universidad de La Sabana
