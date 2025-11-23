# 📑 ÍNDICE DEL INFORME - PROYECTO MONIS-TORIAS

**Proyecto**: Sistema de Gestión de Tutorías Académicas  
**Equipo**: Santiago Urrego, Luis Mario Ramírez, Santiago Gutiérrez  
**Universidad**: Universidad de La Sabana  
**Curso**: Diseño y Arquitectura de Software - Semestre 6  
**Fecha**: 22 de Noviembre, 2025

---

## 📂 Contenido de la Carpeta Informe

### 📄 Documentación Principal

1. **README-PRINCIPAL.md**
   - Descripción general del proyecto
   - Integrantes y objetivos
   - Arquitectura y tecnologías
   - Instrucciones de setup
   - Scripts y comandos
   - Testing y deployment
   - ~250 líneas

2. **ESTADO_PROYECTO.md**
   - Estado completo del proyecto
   - Checklist de requisitos (100% completado)
   - Métricas de código y tests
   - Coverage y calidad
   - Estrategia de pruebas
   - CI/CD y DevSecOps
   - Próximos pasos para entrega
   - ~800 líneas

3. **RETOS_Y_SOLUCIONES.md**
   - 7 retos técnicos enfrentados
   - Análisis detallado de cada problema
   - Soluciones implementadas
   - Lecciones aprendidas
   - Commits relevantes
   - ~600 líneas

4. **FRONTEND-README.md**
   - Documentación específica del frontend
   - Stack tecnológico
   - Estructura del proyecto
   - Scripts y comandos
   - Docker setup
   - ~150 líneas

---

### 🎨 Diagramas de Arquitectura

#### 📐 Modelo 4+1 Vistas (`diagramas-4+1/`)

Los 5 diagramas PlantUML que describen la arquitectura desde diferentes perspectivas:

1. **vista-logica.puml** (~200 líneas)
   - Diagrama de clases
   - Frontend: Components, Context, Hooks
   - Backend: Routes, Services, Repos, Middlewares
   - Relaciones y dependencias

2. **vista-procesos.puml** (~180 líneas)
   - Diagramas de secuencia
   - Flujo: Solicitud de sesión (Estudiante → API → Tutor)
   - Flujo: Confirmación de sesión (Tutor → API → Estudiante)
   - Flujo: Finalización de sesión
   - Autenticación JWT
   - Notificaciones asíncronas

3. **vista-desarrollo.puml** (~250 líneas)
   - Estructura de módulos
   - Dependencias entre paquetes
   - Testing infrastructure
   - CI/CD pipeline
   - NPM packages

4. **vista-fisica.puml** (~200 líneas)
   - Despliegue en Firebase Cloud Platform
   - Alternativa con Kubernetes
   - CI/CD con GitHub Actions
   - Monitoreo y seguridad
   - Infraestructura y escalabilidad

5. **vista-escenarios.puml** (~180 líneas)
   - 21 casos de uso
   - 3 actores: Estudiante, Tutor, Manager
   - Relaciones de inclusión/extensión
   - Sistemas externos (Firebase Auth, Storage, FCM)

6. **README-4+1.md**
   - Guía completa del modelo 4+1
   - Descripción de cada vista
   - Instrucciones para generar diagramas
   - Referencias y documentación

#### 🏗️ Modelo C4 (`diagramas-c4/`)

Los 4 niveles de abstracción del modelo C4:

1. **level-1-context.puml** (~150 líneas)
   - Vista de contexto del sistema
   - Actores: Estudiante, Tutor, Manager
   - Sistemas externos: Firebase Auth, Firestore, Storage
   - Relaciones principales

2. **level-2-containers.puml** (~200 líneas)
   - Contenedores del sistema
   - Web Application (React + Vite)
   - API Backend (Node.js + Express + Functions)
   - Base de Datos (Firestore)
   - Authentication (Firebase Auth)
   - File Storage (Firebase Storage)

3. **level-3-components.puml** (~250 líneas)
   - Componentes del API Backend
   - Routes (5): sessions, payments, tutors, users, materials
   - Middlewares (3): auth, role, error
   - Services (7): sessions, payments, tutors, users, materials, notifications, earnings
   - Repositories (6): sessions, payments, tutors, users, materials, earnings

4. **level-4-code-sessions.puml** (~180 líneas)
   - Detalle de código del SessionsService
   - Clases: SessionsService, SessionsRepo, TutorsRepo
   - Interfaces: Session, SessionRequestDTO, SessionConfirmDTO
   - Métodos y flujos de lógica de negocio

5. **README-C4.md**
   - Guía completa del modelo C4
   - Descripción de cada nivel
   - Instrucciones para generar diagramas
   - Opciones de exportación

---

## 🎯 Propósito de Cada Documento

### Para el Profesor/Evaluador:

1. **Empezar por**: `ESTADO_PROYECTO.md`
   - Vista general del cumplimiento de requisitos
   - Checklist completo
   - Métricas finales

2. **Arquitectura**: Diagramas 4+1 y C4
   - Vista completa de la arquitectura
   - Decisiones técnicas documentadas
   - PlantUML generables como PNG

3. **Retos Técnicos**: `RETOS_Y_SOLUCIONES.md`
   - Evidencia de problem-solving
   - Debugging real
   - Aprendizajes del proyecto

4. **Setup Rápido**: `README-PRINCIPAL.md`
   - Instrucciones para correr el proyecto
   - Comandos de testing
   - URLs de producción

---

## 📊 Estadísticas del Informe

### Documentación Escrita
- **Total Archivos MD**: 6 archivos
- **Total Líneas MD**: ~2,000 líneas
- **Total Archivos PUML**: 9 diagramas
- **Total Líneas PUML**: ~1,800 líneas
- **TOTAL DOCUMENTACIÓN**: ~3,800 líneas

### Cobertura de Requisitos
- ✅ Arquitectura: 100%
- ✅ Pruebas: 95%
- ✅ CI/CD: 100%
- ✅ DevSecOps: 100%
- ✅ Contenedores: 100%
- ✅ Documentación: 95%

### Métricas del Proyecto
- **Código**: 8,400 LOC
- **Tests**: 126 tests
- **Coverage Backend**: 98.7%
- **Coverage SonarQube**: 91.4%
- **CI Jobs**: 8 paralelos
- **Diagramas**: 9 PlantUML

---

## 🛠️ Cómo Usar Este Informe

### 1. Leer Documentación Markdown
Todos los archivos `.md` pueden leerse directamente en:
- GitHub (con preview automático)
- VS Code (con extensión Markdown Preview)
- Cualquier editor de texto

### 2. Generar Diagramas PNG

**Opción A: PlantUML Online** (más fácil)
```
1. Ir a: http://www.plantuml.com/plantuml/uml/
2. Copiar contenido de archivo .puml
3. Pegar en editor
4. Descargar como PNG
```

**Opción B: VS Code**
```bash
# Instalar extensión PlantUML
code --install-extension jebbs.plantuml

# Abrir archivo .puml y presionar Alt+D
```

**Opción C: CLI**
```bash
# Instalar PlantUML
choco install plantuml graphviz  # Windows

# Generar todos los diagramas
cd informe/diagramas-4+1
plantuml -tpng *.puml

cd ../diagramas-c4
plantuml -tpng *.puml
```

### 3. Crear PDF del Informe

**Opción A: Markdown to PDF (VS Code)**
```bash
# Instalar extensión
code --install-extension yzane.markdown-pdf

# Clic derecho en .md → "Markdown PDF: Export (pdf)"
```

**Opción B: Pandoc**
```bash
# Instalar Pandoc
choco install pandoc

# Generar PDF
pandoc README-PRINCIPAL.md -o README-PRINCIPAL.pdf
pandoc ESTADO_PROYECTO.md -o ESTADO_PROYECTO.pdf
```

**Opción C: Manual**
```
1. Copiar contenido de .md
2. Pegar en Word/Google Docs
3. Insertar imágenes PNG de diagramas
4. Exportar como PDF
```

---

## 📦 Archivos Incluidos

```
informe/
├── 00-INDICE-INFORME.md          # Este archivo
├── README-PRINCIPAL.md            # Documentación general
├── ESTADO_PROYECTO.md             # Estado y checklist
├── RETOS_Y_SOLUCIONES.md          # Retos técnicos
├── FRONTEND-README.md             # Frontend específico
├── diagramas-4+1/
│   ├── vista-logica.puml
│   ├── vista-procesos.puml
│   ├── vista-desarrollo.puml
│   ├── vista-fisica.puml
│   ├── vista-escenarios.puml
│   └── README-4+1.md
└── diagramas-c4/
    ├── level-1-context.puml
    ├── level-2-containers.puml
    ├── level-3-components.puml
    ├── level-4-code-sessions.puml
    └── README-C4.md
```

---

## ✅ Checklist de Revisión

### Para el Estudiante (antes de entregar):
- [x] Todos los archivos .md se leen correctamente
- [x] Todos los archivos .puml están completos
- [x] Diagramas generados como PNG (opcional)
- [x] Enlaces y referencias verificadas
- [ ] PDF final generado (si requerido)

### Para el Profesor:
- [ ] Revisar `ESTADO_PROYECTO.md` primero
- [ ] Verificar diagramas 4+1 (5 vistas)
- [ ] Verificar diagramas C4 (4 niveles)
- [ ] Revisar retos y soluciones técnicas
- [ ] Validar métricas de coverage
- [ ] Verificar pipeline CI/CD

---

## 📞 Contacto

**Equipo Monis-Torias**
- Santiago Urrego Rodríguez
- Luis Mario Ramírez Muñoz
- Santiago Gutiérrez de Piñeres Barbosa

**Repositorio**: https://github.com/10santiago12/Proyecto-Monis-Torias-Arqui

**Producción**: https://proyecto-arqui-2c418.web.app

---

**Creado**: 22 de Noviembre, 2025  
**Versión**: 1.0 Final  
**Curso**: Diseño y Arquitectura de Software  
**Universidad de La Sabana** - Semestre 6
