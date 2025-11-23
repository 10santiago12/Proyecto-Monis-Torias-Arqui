# Modelo 4+1 Vistas - Proyecto Monis-Torias

Este directorio contiene los diagramas del **Modelo 4+1 Vistas** de la arquitectura del sistema Monis-Torias, propuesto por Philippe Kruchten. Este modelo describe la arquitectura desde cinco perspectivas diferentes, cada una dirigida a diferentes stakeholders.

## Las 5 Vistas

### 1. Vista Lógica (`vista-logica.puml`)
**Audiencia**: Desarrolladores, Arquitectos de Software

**Propósito**: Describe la estructura estática del sistema mediante clases, interfaces y sus relaciones.

**Contiene**:
- Diagrama de clases del Frontend (React components, Context, Hooks)
- Diagrama de clases del Backend (Routes, Services, Repositories)
- Relaciones y dependencias entre módulos
- Patrón de arquitectura: Repository + Service Layer (3-tier)

**Elementos clave**:
- `AuthContext` y `useAuth`: Gestión de autenticación global
- `SessionsService`: Lógica de negocio de sesiones de tutoría
- `SessionsRepo`: Acceso a datos de Firestore
- Middlewares: `AuthMiddleware`, `RoleMiddleware`, `ErrorMiddleware`

### 2. Vista de Procesos (`vista-procesos.puml`)
**Audiencia**: Ingenieros de Performance, Arquitectos de Sistemas

**Propósito**: Muestra los procesos concurrentes, threads y la comunicación entre componentes en tiempo de ejecución.

**Contiene**:
- Diagrama de secuencia: Solicitud y confirmación de sesión
- Flujos de autenticación con JWT tokens
- Interacciones asíncronas con Firebase Cloud Messaging (notificaciones)
- Validaciones de estado y transiciones (requested → confirmed → done)

**Procesos clave**:
1. **Solicitud de Sesión**: Estudiante → API → Firestore → Notificación al Tutor
2. **Confirmación de Sesión**: Tutor → API → Validación → Actualización → Notificación al Estudiante
3. **Finalización**: Estudiante → API → Actualización de estado

### 3. Vista de Desarrollo (`vista-desarrollo.puml`)
**Audiencia**: Desarrolladores, DevOps, Arquitectos

**Propósito**: Organiza el código en módulos y muestra las dependencias entre paquetes.

**Contiene**:
- Estructura de directorios del proyecto (frontend/ y functions/)
- Dependencias entre módulos (NPM packages, Firebase SDK)
- Capas de arquitectura (Pages → Hooks → Context → Services → API)
- Testing infrastructure (Unit, Integration, E2E, Load tests)
- CI/CD pipeline y DevSecOps tools

**Organización**:
```
frontend/src/
  ├── pages/          # Componentes de página
  ├── context/        # Estado global (Auth)
  ├── hooks/          # Lógica reutilizable
  ├── services/       # HTTP client
  └── routes/         # Routing y guards

functions/src/
  ├── api/            # Definición de rutas HTTP
  ├── middlewares/    # Auth, roles, error handling
  ├── services/       # Lógica de negocio
  └── repos/          # Acceso a datos (Firestore)
```

### 4. Vista Física (`vista-fisica.puml`)
**Audiencia**: Ingenieros de Infraestructura, DevOps, Arquitectos de Sistemas

**Propósito**: Mapea el software a la infraestructura física, servidores y nodos de red.

**Contiene**:
- Despliegue en Firebase Cloud Platform:
  - Firebase Hosting (CDN global para React SPA)
  - Cloud Functions (API Backend serverless)
  - Firestore (base de datos NoSQL)
  - Firebase Auth (gestión de usuarios)
  - Cloud Storage (archivos)
- Despliegue alternativo en Kubernetes:
  - Deployments con 2 réplicas (frontend y backend)
  - Services (ClusterIP)
  - Ingress Controller (NGINX)
  - ConfigMaps y Secrets
- CI/CD con GitHub Actions
- Monitoreo con Firebase Console y SonarCloud

**Infraestructura**:
- **Producción**: Firebase (us-central1)
- **Escalabilidad**: Auto-scaling (Firebase) o HPA (Kubernetes)
- **SSL/TLS**: Automático (Let's Encrypt)
- **Backup**: Automático (Firestore daily backups)

### 5. Vista de Escenarios (`vista-escenarios.puml`)
**Audiencia**: Analistas de Negocio, Product Owners, Stakeholders

**Propósito**: Describe casos de uso y escenarios que ilustran cómo los usuarios interactúan con el sistema.

**Contiene**:
- 21 casos de uso principales:
  - **Estudiante**: Solicitar sesión, ver sesiones, marcar como completada, descargar materiales
  - **Tutor**: Ver solicitudes, confirmar sesión, solicitar pago, subir materiales
  - **Manager**: Listar tutores, asignar códigos, aprobar pagos, ver métricas
  - **Comunes**: Autenticación, recuperación de contraseña
- Relaciones de inclusión y extensión
- Integraciones con sistemas externos (Firebase Auth, Storage, FCM)

**Escenarios clave**:
- **UC-01**: Solicitar Sesión de Tutoría
- **UC-08**: Confirmar Sesión
- **UC-16**: Aprobar Solicitud de Pago

## Cómo Generar los Diagramas

### Opción 1: PlantUML Online
1. Abre https://www.plantuml.com/plantuml/uml/
2. Copia el contenido de cada archivo `.puml`
3. Pega en el editor web
4. Exporta como PNG o SVG

### Opción 2: VS Code Extension
```bash
# Instalar extensión
code --install-extension jebbs.plantuml

# En VS Code, abre el archivo .puml y presiona Alt+D para preview
```

### Opción 3: PlantUML CLI
```bash
# Instalar PlantUML
brew install plantuml  # macOS
sudo apt install plantuml  # Linux
# Windows: descargar plantuml.jar de https://plantuml.com

# Generar todos los diagramas
plantuml docs/diagrams/4+1/*.puml

# Generar en formato específico
plantuml -tpng docs/diagrams/4+1/vista-logica.puml
plantuml -tsvg docs/diagrams/4+1/vista-procesos.puml
```

## Relación entre las Vistas

```
┌─────────────────┐       ┌──────────────────┐
│ Vista Lógica    │──────▶│ Vista de         │
│ (Clases)        │       │ Procesos         │
│                 │       │ (Secuencia)      │
└─────────────────┘       └──────────────────┘
         │                         │
         │                         │
         ▼                         ▼
┌─────────────────┐       ┌──────────────────┐
│ Vista de        │       │ Vista Física     │
│ Desarrollo      │──────▶│ (Deployment)     │
│ (Paquetes)      │       │                  │
└─────────────────┘       └──────────────────┘
         │                         ▲
         │                         │
         ▼                         │
         ┌────────────────────────┐
         │ Vista de Escenarios    │
         │ (Use Cases)            │
         │                        │
         └────────────────────────┘
           Unifica todas las vistas
```

## Referencias

- **Modelo 4+1**: Philippe Kruchten (1995) - "The 4+1 View Model of Architecture"
- **PlantUML Documentation**: https://plantuml.com/
- **C4 Model** (complementario): https://c4model.com/
- **Firebase Architecture**: https://firebase.google.com/docs/guides
- **Kubernetes Patterns**: https://kubernetes.io/docs/concepts/

## Notas

- Los diagramas están sincronizados con la implementación actual del código
- Actualizados el: Noviembre 2025
- Para cambios arquitectónicos significativos, actualizar estos diagramas
- Los diagramas C4 (en `docs/diagrams/c4/`) son complementarios a este modelo
