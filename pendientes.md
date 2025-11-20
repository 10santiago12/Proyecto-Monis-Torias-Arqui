👤 PERSONA 1: SANTIAGO URREGO (Frontend & Testing GUI)
⏱️ Tiempo estimado: 16 horas
🔴 URGENTE - Día 1 (8 horas)
1. Arreglar Seguridad Crítica de Credenciales (30 min) ⚠️
 Crear archivo .env en frontend con las credenciales de Firebase
 Crear archivo .env.example con variables de ejemplo
 Actualizar firebase.ts para usar import.meta.env.VITE_*
 Agregar .env al .gitignore
 Verificar que no haya más secretos expuestos en el código
2. Setup de Testing Frontend (2 horas)
 Instalar dependencias: npm install --save-dev cypress @testing-library/react @testing-library/jest-dom vitest jsdom
 Configurar Vitest en vite.config.ts
 Crear estructura de carpetas: frontend/src/__tests__/
 Configurar Cypress: npx cypress install
 Crear archivo cypress.config.ts
3. Pruebas Unitarias - Componentes React (2 horas)
 Escribir test para Login.tsx (formulario, validaciones)
 Escribir test para Dashboard.tsx (renderizado, estados)
 Escribir test para AuthContext.tsx (hooks, estados)
 Escribir test para api.ts (mocking de fetch)
 Ejecutar tests y verificar que pasen
4. Pruebas E2E con Cypress (3 horas)
 Test E2E: Login exitoso como estudiante
 Test E2E: Login exitoso como tutor
 Test E2E: Login exitoso como manager/admin
 Test E2E: Crear solicitud de sesión (estudiante)
 Test E2E: Confirmar sesión (tutor)
 Test E2E: Asignar código a tutor (admin)
 Capturar screenshots de evidencia
5. Mejoras de UI/UX (30 min)
 Agregar loading states consistentes
 Agregar manejo de errores global
 Mejorar mensajes de validación
 Verificar responsive design
🟡 Día 2 (8 horas)
6. Dockerización del Frontend (1.5 horas)
 Crear frontend/Dockerfile con multi-stage build
 Crear frontend/.dockerignore
 Probar build local: docker build -t monis-frontend .
 Probar ejecución: docker run -p 5173:5173 monis-frontend
7. Documentación Frontend (2 horas)
 Crear README.md con instrucciones de setup
 Documentar estructura de componentes
 Documentar rutas y navegación
 Crear diagrama de componentes (draw.io o similar)
 Documentar variables de entorno necesarias
8. Pruebas de Accesibilidad (1 hora)
 Instalar axe-core o eslint-plugin-jsx-a11y
 Ejecutar audit de accesibilidad
 Corregir issues críticos (alt text, labels, contraste)
9. Optimización de Performance (1.5 horas)
 Implementar code splitting con React.lazy()
 Optimizar imágenes si las hay
 Verificar bundle size con npm run build
 Implementar lazy loading de rutas
10. Reportes y Evidencias (2 horas)
 Generar reporte de cobertura de tests
 Exportar videos de Cypress
 Capturar screenshots de todos los flujos
 Crear carpeta /evidencias/frontend/ con todo
 Documentar casos de prueba ejecutados


👤 PERSONA 2: LUIS MARIO RAMÍREZ (Backend, CI/CD & Pruebas)
⏱️ Tiempo estimado: 16 horas
🔴 URGENTE - Día 1 (8 horas)
1. Setup de Testing Backend (1 hora)
 Instalar: npm install --save-dev jest supertest @types/jest @types/supertest
 Crear functions/jest.config.js
 Crear estructura: functions/test/unit/ y functions/test/integration/
 Configurar script en package.json: "test": "jest"
 Crear archivo functions/test/setup.js para mocks de Firebase
2. Pruebas Unitarias - Servicios (3 horas)
 Test sessions.service.js: requestSession(), confirmByTutor(), markDoneByStudent()
 Test payments.service.js: requestPayout(), approvePayout(), markPaid()
 Test tutors.service.js: assignCodeToTutor(), listAllTutors()
 Test earnings.service.js: creditFromPayout()
 Mockear Firebase Admin SDK con jest.mock()
 Alcanzar 80%+ cobertura en servicios
3. Pruebas Unitarias - Repositorios (1.5 horas)
 Test sessions.repo.js: CRUD operations
 Test tutors.repo.js: createCode(), claimCode(), getByCode()
 Test payments.repo.js: create, update, getById
 Mockear Firestore con @google-cloud/firestore mock
4. Pruebas Unitarias - Middlewares (1 hora)
 Test auth.middleware.js: token válido, inválido, expirado
 Test role.middleware.js: autorización por roles
 Test error.middleware.js: manejo de errores
5. Pruebas de Integración - API (1.5 horas)
 Test integración: POST /api/sessions/request
 Test integración: POST /api/sessions/:id/confirm
 Test integración: POST /api/payments/request
 Test integración: POST /api/tutors/:uid/assign-code
 Usar Supertest para simular requests HTTP
🟡 Día 2 (8 horas)
6. Colección Postman + Newman (1.5 horas)
 Crear colección Postman con todos los endpoints
 Crear environment con variables (baseUrl, tokens)
 Incluir tests de validación en cada request
 Exportar colección a postman/collection.json
 Instalar Newman: npm install -g newman
 Ejecutar: newman run postman/collection.json
7. Pruebas de Carga con k6 (1.5 horas)
 Instalar k6: choco install k6 (Windows) o descargar
 Crear script load-tests/sessions.js (crear sesiones)
 Crear script load-tests/auth.js (login)
 Ejecutar test: k6 run --vus 10 --duration 30s sessions.js
 Capturar métricas y screenshots
8. Pipeline CI/CD - GitHub Actions (2.5 horas)
 Crear .github/workflows/ci.yml
Checkout code
Setup Node.js
Install dependencies (frontend + functions)
Run linters (ESLint)
Run tests backend con coverage
Run tests frontend
Upload coverage a Codecov
 Crear .github/workflows/cd.yml
Build Docker images
Deploy a Firebase Hosting
Deploy Firebase Functions
 Configurar secrets en GitHub (Firebase tokens)
 Hacer commit y verificar que pipeline ejecute
9. Dockerización Backend (1 hora)
 Crear functions/Dockerfile (si aplica para local testing)
 Crear docker-compose.yml en raíz del proyecto
Servicio frontend
Servicio functions (emulador Firebase)
Redis (opcional para caché)
 Probar: docker-compose up
10. Documentación Backend (1.5 horas)
 Crear README.md con setup instructions
 Documentar arquitectura de servicios y repos
 Crear diagrama de flujo de datos
 Documentar endpoints con formato OpenAPI/Swagger
 Documentar variables de entorno necesarias


👤 PERSONA 3: SANTIAGO GUTIÉRREZ (DevSecOps & Documentación)
⏱️ Tiempo estimado: 16 horas
🔴 URGENTE - Día 1 (8 horas)
1. SAST - Análisis Estático (1.5 horas)
 Configurar SonarQube Cloud (sonarcloud.io)
 Crear sonar-project.properties
 Integrar SonarQube en GitHub Actions
 Ejecutar análisis y documentar resultados
 Configurar quality gate (80% cobertura mínima)
2. Dependency Scanning (1 hora)
 Ejecutar npm audit en frontend y functions
 Instalar Snyk CLI: npm install -g snyk
 Ejecutar snyk test en ambos proyectos
 Crear reporte de vulnerabilidades encontradas
 Corregir vulnerabilidades críticas si las hay
 Integrar Snyk en GitHub Actions
3. Secrets Scanning (1 hora)
 Instalar Gitleaks: choco install gitleaks
 Ejecutar: gitleaks detect --source . --verbose
 Documentar secretos encontrados (ya sabemos de Firebase)
 Crear .gitleaksignore si es necesario
 Integrar Gitleaks en pre-commit hook
 Agregar Gitleaks a pipeline CI
4. Container Scanning con Trivy (1 hora)
 Instalar Trivy: choco install trivy
 Escanear imagen frontend: trivy image monis-frontend
 Escanear dependencias: trivy fs ./frontend
 Documentar vulnerabilidades encontradas
 Integrar Trivy en GitHub Actions
5. DAST - OWASP ZAP (1.5 horas)
 Descargar OWASP ZAP Desktop
 Configurar baseline scan contra app desplegada
 Ejecutar: zap-baseline.py -t http://localhost:5173
 Generar reporte HTML
 Documentar vulnerabilidades encontradas
 (Opcional) Integrar en pipeline
6. Security Headers & Best Practices (1 hora)
 Agregar security headers en Firebase hosting (firebase.json)
Content-Security-Policy
X-Frame-Options
X-Content-Type-Options
Strict-Transport-Security
 Configurar CORS correctamente en functions
 Verificar que no haya console.logs con info sensible
 Auditar logs para evitar exposición de datos
7. Configuración de Secrets en Firebase (1 hora)
 Mover API keys a Firebase Environment Config
 Ejecutar: firebase functions:config:set service.key="value"
 Actualizar código para usar functions.config()
 Documentar cómo configurar secrets localmente
🟡 Día 2 (8 horas)
8. Modelo 4+1 Vistas (2.5 horas)
 Vista Lógica: Diagrama de clases (Services, Repos, Entities)
 Vista de Procesos: Diagrama de secuencia (flujo de crear sesión)
 Vista de Desarrollo: Estructura de componentes y módulos
 Vista Física: Diagrama de deployment (Firebase, CDN, etc.)
 Vista de Escenarios: Casos de uso principales
 Usar draw.io, Lucidchart o PlantUML
 Exportar todos a PNG/PDF
9. Modelo C4 (2 horas)
 Nivel 1 - Contexto: Sistema + Actores externos (Estudiantes, Tutores, Admin)
 Nivel 2 - Contenedores: Frontend, Functions, Firestore, Storage, Auth
 Nivel 3 - Componentes: Desglose de Functions (Services, Repos, Routes)
 Nivel 4 - Código (opcional): Clases principales
 Usar herramienta C4 (Structurizr, draw.io con plantillas C4)
 Exportar diagramas
10. ADR - Architecture Decision Records (1.5 horas)
 Crear carpeta docs/adr/
 ADR 001: Por qué Firebase (vs AWS/Azure)
 ADR 002: Por qué monorepo (vs multi-repo)
 ADR 003: Por qué React (vs Vue/Angular)
 ADR 004: Repository Pattern + Service Layer
 ADR 005: Autenticación con Firebase Auth
 Usar template Markdown estándar
11. Documentación de API con Swagger (1 hora)
 Instalar swagger-jsdoc y swagger-ui-express
 Agregar comentarios JSDoc en rutas
 Configurar endpoint /api-docs
 Generar archivo openapi.yaml
 Capturar screenshot de Swagger UI
12. README Principal del Proyecto (1 hora)
 Actualizar README.md con:
Descripción del proyecto
Arquitectura general
Tech stack
Instrucciones de setup local
Variables de entorno necesarias
Cómo ejecutar tests
Cómo ejecutar con Docker
Link a documentación adicional
 Agregar badges (CI status, coverage, etc.)
 Agregar diagrama de arquitectura
🔥 TAREAS COMPARTIDAS - TODO EL EQUIPO
Día 2 - Tarde/Noche (3 horas)
13. Generación de Reportes (1 hora)
 Instalar Allure: npm install -g allure-commandline
 Configurar Allure con Jest y Cypress
 Generar reporte: allure generate allure-results --clean
 Capturar screenshots del reporte
14. Preparación de Evidencias (1 hora)
 Crear carpeta /evidencias/ estructurada:
/evidencias/tests/ (screenshots, videos)
/evidencias/ci-cd/ (pipeline ejecutándose)
/evidencias/security/ (reportes de seguridad)
/evidencias/performance/ (k6 results)
/evidencias/diagrams/ (todos los diagramas)
 Capturar video de pipeline ejecutándose
 Capturar screenshots de SonarQube dashboard
 Capturar métricas de coverage
15. Documento Final PDF (1 hora)
 Crear documento con:
Portada con nombres e integrantes
Introducción del proyecto
Arquitectura (diagramas 4+1 y C4)
Decisiones técnicas (ADR resumidos)
Estrategia de pruebas
Pipeline CI/CD
DevSecOps (herramientas y resultados)
Evidencias (screenshots intercalados)
Retos enfrentados y soluciones
Conclusiones
 Exportar a PDF profesional

📦 ENTREGABLES FINALES
Checklist de Entrega
 Repositorio GitHub actualizado con:

Código fuente completo
Tests implementados
Pipeline CI/CD funcionando
README actualizado
Documentación en /docs/
Evidencias en /evidencias/
 Informe técnico PDF con:

Mínimo 20 páginas
Diagramas 4+1
Diagramas C4
ADR
Evidencias de pruebas
Evidencias de seguridad
Conclusiones
 Presentación lista (PowerPoint/PDF)

5-10 minutos
Muestra de pipeline ejecutando
Muestra de tests pasando
Recorrido por la app
⚡ CONSEJOS PARA TRABAJAR EN PARALELO
Crear branches separadas:

feature/frontend-tests (Persona 1)
feature/backend-tests-cicd (Persona 2)
feature/devsecops-docs (Persona 3)
Comunicación constante: Slack/Discord/WhatsApp

Merge strategy: Merge a main al final de cada día

Backup: Push constantemente para no perder trabajo

🚨 PRIORIDADES SI SE QUEDA SIN TIEMPO
Mínimo viable para aprobar:
✅ Tests unitarios backend (80% cobertura)
✅ Tests E2E frontend (3-5 flujos críticos)
✅ Pipeline CI básico (lint + test)
✅ SonarQube configurado
✅ Dependency scanning (npm audit/Snyk)
✅ Secrets scanning (Gitleaks)
✅ Diagramas C4 (niveles 1 y 2)
✅ README completo
✅ Documento PDF con evidencias
✅ Arreglar credenciales expuestas