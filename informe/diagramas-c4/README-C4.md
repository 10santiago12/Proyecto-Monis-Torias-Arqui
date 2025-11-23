# Diagramas C4 - Proyecto Monis-Torias

Este directorio contiene los diagramas C4 (Context, Containers, Components, Code) de la arquitectura del sistema Monis-Torias.

## 📐 Modelo C4

El modelo C4 es un enfoque ligero para documentar arquitectura de software mediante 4 niveles de abstracción:

1. **Context (Nivel 1):** Visión general del sistema y sus interacciones con usuarios y sistemas externos
2. **Containers (Nivel 2):** Aplicaciones y almacenes de datos que componen el sistema
3. **Components (Nivel 3):** Componentes internos de cada contenedor
4. **Code (Nivel 4):** Clases y métodos de un componente específico

## 📁 Archivos

### Nivel 1 - Contexto
**Archivo:** `level-1-context.puml`

Muestra:
- Actores: Estudiante, Tutor, Manager
- Sistema: Monis-Torias
- Sistemas externos: Firebase Auth, Firestore, Storage, Email Service

### Nivel 2 - Contenedores
**Archivo:** `level-2-containers.puml`

Muestra:
- Web Application (React + TypeScript + Vite)
- API Backend (Node.js + Express + Firebase Functions)
- Base de Datos (Cloud Firestore)
- File Storage (Firebase Storage)
- Authentication Service (Firebase Authentication)
- Sistemas de CI/CD (GitHub Actions, SonarCloud)

### Nivel 3 - Componentes
**Archivo:** `level-3-components.puml`

Desglosa el API Backend en:
- **Routes:** sessionsRoutes, paymentsRoutes, tutorsRoutes, usersRoutes, materialsRoutes
- **Middlewares:** authMiddleware, roleMiddleware, errorMiddleware
- **Services:** sessionsService, paymentsService, tutorsService, usersService, materialsService, notificationsService, earningsService
- **Repositories:** sessionsRepo, paymentsRepo, tutorsRepo, usersRepo, materialsRepo, earningsRepo

### Nivel 4 - Código
**Archivo:** `level-4-code-sessions.puml`

Detalle del SessionsService:
- Clases: SessionsService, SessionsRepo, TutorsRepo, NotificationsService
- Interfaces: Session, SessionRequestDTO, SessionConfirmDTO
- Métodos: listForUser, requestSession, confirmByTutor, markDoneByStudent

## 🔧 Cómo Generar Diagramas

### Opción 1: PlantUML Online (Más fácil)
1. Ve a: http://www.plantuml.com/plantuml/uml/
2. Copia el contenido de cualquier archivo `.puml`
3. Pega en el editor
4. Descarga como PNG o SVG

### Opción 2: PlantUML Extension en VS Code
1. Instala la extensión: **PlantUML** (by jebbs)
2. Instala Graphviz:
   - Windows: `choco install graphviz`
   - Mac: `brew install graphviz`
   - Linux: `sudo apt install graphviz`
3. Abre cualquier archivo `.puml`
4. Presiona `Alt+D` (Windows/Linux) o `Option+D` (Mac)
5. Exporta con clic derecho → "Export Current Diagram"

### Opción 3: PlantUML CLI
```bash
# Instalar Java + PlantUML
choco install openjdk graphviz
curl -O https://sourceforge.net/projects/plantuml/files/plantuml.jar/download

# Generar PNG
java -jar plantuml.jar level-1-context.puml

# Generar SVG
java -jar plantuml.jar -tsvg level-1-context.puml

# Generar todos los diagramas
java -jar plantuml.jar *.puml
```

## 📊 Exportar para el PDF

Para incluir en el documento final:

1. Genera todos los diagramas como PNG (1200px de ancho)
2. Copia a `/evidencias/diagrams/`
3. Incluye en el PDF con títulos descriptivos:
   - Figura 1: Diagrama de Contexto (C4 - Nivel 1)
   - Figura 2: Diagrama de Contenedores (C4 - Nivel 2)
   - Figura 3: Diagrama de Componentes (C4 - Nivel 3)
   - Figura 4: Diagrama de Código - Sessions Service (C4 - Nivel 4)

## 📚 Referencias

- [C4 Model](https://c4model.com/)
- [PlantUML C4 Standard Library](https://github.com/plantuml-stdlib/C4-PlantUML)
- [PlantUML Documentation](https://plantuml.com/)
- [Simon Brown - Software Architecture for Developers](https://leanpub.com/software-architecture-for-developers)

---

**Creado por:** Equipo Proyecto Monis-Torias  
**Fecha:** 2025-11-21  
**Curso:** Arquitectura de Software - Semestre 6
