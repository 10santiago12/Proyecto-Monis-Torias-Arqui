# Frontend - Monis-Torias

Aplicación web React + TypeScript para la plataforma de gestión de tutorías académicas.

## 🚀 Stack Tecnológico

- **React 19.1** con TypeScript
- **React Router v7** para navegación
- **Firebase SDK** (Authentication, Firestore)
- **Vite** como bundler y dev server
- **Vitest** para tests unitarios
- **Cypress** para tests E2E
- **CSS vanilla** con diseño modular

## 📁 Estructura del Proyecto

```
frontend/
├── src/
│   ├── components/        # Componentes reutilizables
│   ├── pages/            # Componentes de páginas
│   ├── routes/           # Configuración de rutas
│   ├── services/         # Servicios y API
│   ├── hooks/            # Custom hooks
│   ├── lib/              # Configuraciones
│   └── __tests__/        # Tests unitarios
├── cypress/              # Tests E2E
├── Dockerfile            # Configuración Docker
└── package.json
```

## 🔧 Setup Local

### Prerrequisitos
- Node.js 20+
- npm
- Cuenta de Firebase

### Instalación

```bash
cd frontend
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de Firebase

npm run dev  # http://localhost:5173
```

## 📝 Scripts Disponibles

```bash
npm run dev              # Servidor de desarrollo
npm run build            # Build de producción
npm run test             # Tests unitarios
npm run test:coverage    # Cobertura de tests
npm run cypress          # Tests E2E interactivos
npm run lint             # Ejecutar ESLint
```

## 🗺️ Rutas

- `/` - Login y registro
- `/dashboard` - Dashboard estudiante (protegida)
- `/request-session` - Solicitar sesión (protegida)
- `/tutor` - Dashboard tutor (protegida)
- `/admin` - Panel admin (protegida)

## 🔐 Roles

- **student**: Solicitar y ver sesiones
- **tutor**: Confirmar y gestionar sesiones
- **manager**: Administración completa

## 🐳 Docker

```bash
# Build
docker build -t monis-frontend .

# Run
docker run -p 5173:80 monis-frontend

# Con docker-compose (desde raíz)
docker-compose up frontend
```

## 📚 Documentación Completa

Ver documentación detallada en la [Wiki del repositorio](../../wiki).

---

**Universidad de La Sabana** - Proyecto Académico

