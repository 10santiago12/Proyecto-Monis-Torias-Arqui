# Proyecto Monis-Torías – Informe Final DYAS

**Proyecto**: Sistema de Gestión de Tutorías Académicas (Monis‑Torías)

**Curso**: Diseño y Arquitectura de Software

**Programa**: Ingeniería de Sistemas – Universidad de La Sabana

**Equipo de trabajo**:
- Santiago Urrego Rodríguez
- Luis Mario Ramírez Muñoz
- Santiago Gutiérrez de Piñeres Barbosa

**Fecha**: 22 de noviembre de 2025

---

## 1. Resumen ejecutivo

El sistema Monis‑Torías es una plataforma web para gestionar tutorías académicas que conecta estudiantes con tutores, permite agendar y hacer seguimiento de sesiones, administrar pagos y brindar visibilidad a coordinadores académicos.

El proyecto adopta una arquitectura limpia con separación clara entre frontend (React + TypeScript + Vite) y backend (Node.js + Express desplegado como Firebase Functions), con Firestore como base de datos, Firebase Auth como proveedor de identidad y un pipeline de CI/CD completo en GitHub Actions.

Desde la perspectiva de diseño y arquitectura de software, el sistema incluye:

- Un modelo arquitectónico documentado con **4+1 vistas** y **modelo C4**, con sus diagramas correspondientes.
- Cobertura de pruebas elevada en backend (≈98.7%) y un análisis de calidad en SonarQube superior al umbral exigido por DYAS (>80%).
- Integración de prácticas DevSecOps: SAST (SonarQube), DAST (OWASP ZAP), análisis de dependencias, escaneo de contenedores y búsqueda de secretos.
- Contenerización de componentes clave con Docker, orquestación de referencia en Kubernetes y despliegue productivo en Firebase.

Este informe resume la solución desde el punto de vista arquitectónico, de calidad y de proceso, alineado con los requisitos definidos en la rúbrica DYAS y usando como base la documentación más detallada que se encuentra en `README-PRINCIPAL.md`, `ESTADO_PROYECTO.md` y `RETOS_Y_SOLUCIONES.md`.

---

## 3. Contexto y alcance del sistema

### 3.1 Problema de negocio

En la universidad, la gestión de tutorías académicas suele depender de procesos manuales (formularios, correos, hojas de cálculo) que presentan problemas recurrentes:

- Dificultad para encontrar tutor disponible en el horario deseado.
- Falta de trazabilidad de las sesiones realizadas.
- Ausencia de métricas consolidadas de uso y desempeño de los tutores.
- Procesos confusos para el pago a tutores o monitores.

Monis‑Torías aborda estos problemas proporcionando una aplicación web centralizada donde estudiantes, tutores y coordinadores pueden interactuar de forma segura y trazable.

### 3.2 Objetivos del sistema

- Permitir a los estudiantes **buscar tutores**, solicitar sesiones y hacer seguimiento de su estado.
- Permitir a los tutores **gestionar su agenda** de tutorías, aceptar o rechazar solicitudes y registrar la realización de la sesión.
- Proveer a los coordinadores una vista de **gestión y monitoreo**, con métricas básicas (número de sesiones, tutores activos, etc.).
- Integrar mecanismos de autenticación, autorización por roles y trazabilidad de operaciones.
- Demostrar un diseño arquitectónico sólido acorde a los criterios de DYAS.

### 3.3 Actores principales

- **Estudiante**: consulta la oferta de tutorías, solicita y asiste a sesiones.
- **Tutor**: administra su disponibilidad y atiende las solicitudes de estudiantes.
- **Administrador/Coordinador**: configura reglas, administra usuarios especiales y revisa métricas.

---

## 4. Arquitectura del sistema

Esta sección resume la arquitectura utilizando los dos marcos de referencia exigidos: **modelo 4+1** y **modelo C4**. Los diagramas detallados se encuentran en los archivos `.puml` del repositorio y en las imágenes incluidas en `informe/diagramasPNG`.

### 4.1 Vista lógica (4+1)

La vista lógica describe los principales componentes de software y sus relaciones. En Monis‑Torías se distinguen claramente los módulos de frontend y backend.

**Diagrama de vista lógica:**

![Vista lógica 4+1](./diagramasPNG/Imagen%20de%20WhatsApp%202025-11-23%20a%20las%2014.01.12_ce85a787.jpg)

A alto nivel, en el **backend** se tienen:

- **Rutas (API)**: agrupan los endpoints HTTP relacionados con sesiones, pagos, tutores, usuarios y materiales.
- **Middlewares**: responsabilidades transversales como autenticación, autorización basada en roles y manejo de errores.
- **Servicios (Services)**: encapsulan la lógica de negocio (p.ej. creación de sesión, confirmación, cálculo de pagos, validaciones).
- **Repositorios (Repos)**: acceso a datos en Firestore y a otros servicios de Firebase.

En el **frontend** se definen:

- **Pages**: pantallas de alto nivel (login, dashboard, listado de sesiones, etc.).
- **Components**: componentes reutilizables (formularios, tablas, modales, etc.).
- **Context/Hooks**: manejo de estado global (autenticación, usuario actual) y lógica compartida.
- **Services (API client)**: funciones que encapsulan las llamadas HTTP al backend.

Este diseño facilita la aplicación de principios SOLID y la posibilidad de probar de manera aislada servicios y componentes.

### 4.2 Vista de procesos (4+1)

La vista de procesos representa los flujos dinámicos más importantes, incluyendo concurrencia y comunicación entre procesos.

**Diagrama de procesos – flujo de solicitud de sesión:**

![Vista de procesos 4+1](./diagramasPNG/Imagen%20de%20WhatsApp%202025-11-23%20a%20las%2014.01.12_fb42747b.jpg)

Flujo típico:

1. El **estudiante** inicia sesión (Firebase Auth) y navega a la pantalla de búsqueda de tutores.
2. Selecciona tutor, horario y envía la **solicitud de sesión**.
3. El frontend invoca el endpoint correspondiente del **API de sesiones**.
4. El backend valida datos (Zod), verifica permisos (middlewares), registra la solicitud en Firestore y deja la sesión en estado "pendiente".
5. El **tutor** recibe la notificación y, desde su interfaz, acepta o rechaza la solicitud.
6. El backend actualiza el estado a "confirmada" o "rechazada" y registra los cambios.

Otro flujo clave (no dibujado aquí en detalle) es el de **registro de finalización de sesión y cálculo de pagos**, donde se actualizan métricas y se registran montos devengados por el tutor.

### 4.3 Vista de desarrollo (4+1)

La vista de desarrollo (o implementación) muestra la organización del software en módulos y paquetes.

**Diagrama de vista de desarrollo:**

![Vista de desarrollo 4+1](./diagramasPNG/Imagen%20de%20WhatsApp%202025-11-23%20a%20las%2014.01.13_0478d36a.jpg)

En el repositorio monorepo se distinguen dos carpetas principales:

- `frontend/`: proyecto React + TypeScript con estructura por páginas, componentes, hooks, contextos y servicios.
- `functions/`: backend Node.js sobre Firebase Functions, con carpetas para `api/`, `services/`, `repos/`, `middlewares/` y `test/`.

A esto se suman carpetas de apoyo como `docs/`, `k8s/`, `security/`, `allure/` y `informe/` que almacenan la documentación, manifestos de Kubernetes, configuración de seguridad y reportes de pruebas.

### 4.4 Vista física (4+1)

La vista física describe el despliegue de componentes de software en la infraestructura.

**Diagrama de vista física:**

![Vista física 4+1](./diagramasPNG/Imagen%20de%20WhatsApp%202025-11-23%20a%20las%2014.01.13_10f00599.jpg)

Existen dos escenarios principales:

1. **Despliegue oficial en Firebase** (escenario actual de producción):
   - **Firebase Hosting** sirve la aplicación frontend estática.
   - **Firebase Functions** expone el API backend.
   - **Cloud Firestore** almacena los datos de sesiones, usuarios y tutores.
   - **Firebase Auth** gestiona la identidad y los tokens.

2. **Alternativa en Kubernetes** (escenario de referencia):
   - Despliegue de contenedor de frontend (Nginx + artefactos Vite) y backend (Node.js) en un clúster Kubernetes.
   - `Ingress` NGINX enruta tráfico HTTP/HTTPS.
   - `ConfigMaps` y `Secrets` cargan configuración y credenciales.

### 4.5 Vista de escenarios (4+1)

La vista de escenarios recoge casos de uso representativos, combinando elementos de las vistas anteriores.

**Diagrama de escenarios:**

![Vista de escenarios 4+1](./diagramasPNG/Imagen%20de%20WhatsApp%202025-11-23%20a%20las%2014.01.13_2337c048.jpg)

Algunos de los escenarios más importantes son:

- Estudiante busca tutor por materia y solicita una sesión.
- Tutor acepta la sesión y agenda la hora definitiva.
- Tutor marca la sesión como realizada y se registra el pago.
- Administrador revisa métricas de sesiones y tutores.

---

## 5. Modelo C4

El modelo C4 complementa al modelo 4+1 describiendo el sistema a distintos niveles de abstracción.

### 5.1 Nivel 1 – Contexto del sistema

**Diagrama de contexto:**

![Contexto C4](./diagramasPNG/Imagen%20de%20WhatsApp%202025-11-23%20a%20las%2014.04.00_049de98c.jpg)

En este nivel se muestra Monis‑Torías como un sistema que interactúa con:

- Estudiantes, tutores y administradores.
- Firebase Auth como proveedor de identidad.
- Firestore y Storage como servicios de persistencia.

### 5.2 Nivel 2 – Contenedores

**Diagrama de contenedores:**

![Contenedores C4](./diagramasPNG/Imagen%20de%20WhatsApp%202025-11-23%20a%20las%2014.04.00_4089b20d.jpg)

Se identifican los principales contenedores lógicos:

- **Web Application (React)**: interfaz de usuario, renderizada en el navegador.
- **API Backend (Node.js/Express en Firebase Functions)**: lógica de negocio y endpoints REST.
- **Base de datos (Cloud Firestore)**: almacenamiento de documentos de sesiones, usuarios, tutores.
- **Auth Provider (Firebase Auth)**: gestión de credenciales y tokens.
- **Storage (Cloud Storage)**: almacenamiento de materiales o recursos asociados a las sesiones.

### 5.3 Nivel 3 – Componentes

**Diagrama de componentes:**

![Componentes C4](./diagramasPNG/Imagen%20de%20WhatsApp%202025-11-23%20a%20las%2014.04.00_e0e459a4.jpg)

En el backend, el contenedor de API se divide conceptualmente en:

- **Rutas / Controladores** por dominio (sessions, payments, tutors, users, materials).
- **Middlewares** de autenticación, autorización y manejo centralizado de errores.
- **Servicios** que implementan reglas de negocio para cada dominio.
- **Repositorios** que encapsulan el acceso a Firestore.

En el frontend, la aplicación se compone de páginas (como `LoginPage`, `SessionsDashboard`), componentes compartidos (tablas, formularios) y servicios de acceso API.

### 5.4 Nivel 4 – Detalle de código (Sessions)

**Diagrama de código (módulo de sesiones):**

![Código C4 – Sessions](./diagramasPNG/Imagen%20de%20WhatsApp%202025-11-23%20a%20las%2014.04.00_e9d651dc.jpg)

Este nivel muestra cómo se estructura internamente el módulo de sesiones, con clases y/o funciones como:

- `SessionsService`: expone operaciones como `createSession`, `confirmSession`, `finishSession`.
- `SessionsRepository`: persiste y consulta documentos de sesión en Firestore.
- Dependencia hacia repositorios de tutores o usuarios, cuando es necesario validar información adicional.

---

## 6. Calidad, pruebas y DevSecOps

Esta sección resume cómo se atienden los criterios de calidad y aseguramiento exigidos por DYAS (detalles completos en `ESTADO_PROYECTO.md`).

### 6.1 Estrategia de pruebas

- **Backend**: 92 pruebas unitarias y 12 de integración sobre servicios, repositorios y middlewares, con una cobertura aproximada del 98.7%.
- **Frontend**: pruebas unitarias con Vitest sobre componentes clave y lógica de autenticación, así como pruebas E2E con Cypress que cubren los flujos de login, creación y confirmación de sesiones.
- **Pruebas de carga**: scripts en k6 que someten a estrés los endpoints de autenticación y creación de sesiones.
- **Pruebas de API**: colección Postman ejecutable con Newman que valida el correcto funcionamiento de los endpoints principales.

**Evidencias de pruebas (capturas):**

- **Tests unitarios backend**

   ![Tests unitarios backend](./diagramasPNG/tests-backend-unit.png)

- **Cobertura backend (Jest/Istanbul)**

   ![Cobertura backend](./diagramasPNG/tests-backend-coverage.png)

- **Tests de integración backend**

   ![Tests integración backend](./diagramasPNG/tests-backend-integration.png)

- **Tests unitarios frontend (Vitest)**

   ![Tests unitarios frontend](./diagramasPNG/tests-frontend-unit.png)

- **Tests E2E (Cypress)**

   ![Tests E2E Cypress](./diagramasPNG/tests-frontend-e2e.png)

- **Pruebas de carga k6 – sesiones**

   ![Pruebas de carga k6 sesiones](./diagramasPNG/tests-k6-sessions.png)

- **Pruebas de carga k6 – auth**

   ![Pruebas de carga k6 auth](./diagramasPNG/tests-k6-auth.png)

- **Pruebas de API con Postman/Newman**

   ![Pruebas API Postman](./diagramasPNG/tests-postman.png)

### 6.2 CI/CD

- **CI**: GitHub Actions ejecuta en cada push/PR
  - Tests backend y frontend.
  - Linting y análisis estático.
  - Análisis de SonarQube con reporte de cobertura agregado.
  - Escaneos de seguridad (dependencias, secretos, contenedores).
- **CD**: en merges a `main` se construye el frontend y se despliega automáticamente a Firebase Hosting y Functions.

**Evidencias de CI/CD (capturas):**

- **Workflow de GitHub Actions con todos los jobs en verde**

   ![CI GitHub Actions](./diagramasPNG/ci-github-actions.png)

- **Detalle de job de despliegue a Firebase**

   ![CD Firebase Deploy](./diagramasPNG/ci-firebase-deploy.png)

### 6.3 DevSecOps y seguridad

- **SAST**: SonarQube Cloud con cobertura >80% establecida como umbral.
- **DAST**: OWASP ZAP con escaneo baseline sobre el entorno de pruebas.
- **Dependencias**: `npm audit` en los proyectos de frontend y backend.
- **Secrets**: Gitleaks para detectar posibles claves expuestas.
- **Contenedores**: Trivy para analizar imágenes Docker de frontend y backend.
- **Aplicación**: autenticación con Firebase Auth, autorización por roles mediante custom claims y middlewares, validación de datos con Zod y configuración correcta de CORS.

**Evidencias de calidad y seguridad (capturas):**

- **Panel de SonarQube (coverage, bugs, vulnerabilities)**

   ![Panel SonarQube](./diagramasPNG/quality-sonarqube.png)

- **Reporte OWASP ZAP (DAST)**

   ![Reporte OWASP ZAP](./diagramasPNG/security-zap.png)

- **Resultado de npm audit (dependency scanning)**

   ![npm audit](./diagramasPNG/security-npm-audit.png)

- **Resultado de Gitleaks (secrets scanning)**

   ![Gitleaks](./diagramasPNG/security-gitleaks.png)

- **Resultado de Trivy sobre imagen Docker**

   ![Trivy](./diagramasPNG/security-trivy.png)

---

## 7. Retos técnicos y soluciones

A lo largo del proyecto se identificaron y resolvieron varios retos, documentados con más detalle en `RETOS_Y_SOLUCIONES.md`. Algunos destacados son:

- **Cobertura en SonarQube**: inicialmente, la mezcla de frontend y backend arrojaba un porcentaje bajo. Se ajustó el análisis para enfocarlo en el backend (donde la cobertura real supera el 98%), logrando un 91.4% en SonarQube.
- **Compatibilidad de Allure**: se sustituyeron librerías no compatibles (`jest-allure`) por `allure-jest` para generar reportes de pruebas más confiables.
- **Problemas en builds Docker**: ajustes en `.dockerignore` y en la estructura de los Dockerfiles para garantizar que los artefactos necesarios se copien correctamente.
- **Configuración de CORS y JWT**: ajuste fino de políticas CORS y validación de tokens para prevenir errores de autenticación al consumir el API desde el frontend.

---

## 8. Conclusiones

Monis‑Torías cumple con los requisitos planteados para el proyecto de Diseño y Arquitectura de Software:

- Presenta una arquitectura clara y modular, descrita mediante los modelos 4+1 y C4.
- Integra una estrategia sólida de pruebas con alta cobertura y diferentes tipos de testing.
- Implementa un pipeline de CI/CD automatizado y un conjunto de prácticas DevSecOps alineadas con las buenas prácticas de la industria.
- Documenta las decisiones arquitectónicas y los retos técnicos afrontados durante el desarrollo.
