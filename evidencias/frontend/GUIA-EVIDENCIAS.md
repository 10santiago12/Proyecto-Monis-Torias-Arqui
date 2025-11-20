# 📊 Guía de Generación de Evidencias - Frontend

Este documento describe cómo generar todas las evidencias necesarias para el proyecto.

## 🧪 1. Reportes de Tests Unitarios

### Ejecutar tests con cobertura

```bash
cd frontend
npm run test:coverage
```

### Resultados

- **Ubicación**: `frontend/coverage/`
- **Archivos generados**:
  - `coverage/index.html` - Reporte visual interactivo
  - `coverage/lcov-report/index.html` - Reporte detallado
  - `coverage/coverage-summary.json` - Resumen JSON

### Copiar evidencias

```powershell
# Windows PowerShell
Copy-Item -Recurse frontend/coverage/* evidencias/frontend/coverage/
```

```bash
# Linux/Mac
cp -r frontend/coverage/* evidencias/frontend/coverage/
```

---

## 🎭 2. Tests E2E con Cypress

### Ejecutar tests E2E en modo headless (genera videos)

```bash
cd frontend
npm run dev  # En una terminal
```

```bash
# En otra terminal
npm run cypress:headless
```

### Resultados

- **Videos**: `frontend/cypress/videos/`
- **Screenshots**: `frontend/cypress/screenshots/`

### Copiar evidencias

```powershell
# Windows
Copy-Item -Recurse frontend/cypress/videos/* evidencias/frontend/tests/
Copy-Item -Recurse frontend/cypress/screenshots/* evidencias/frontend/screenshots/
```

---

## 📸 3. Screenshots de la Aplicación

### Opción A: Manual

1. Iniciar la aplicación: `npm run dev`
2. Navegar por cada página
3. Capturar screenshots de:
   - Página de login
   - Dashboard de estudiante
   - Formulario de solicitud de sesión
   - Dashboard de tutor
   - Panel de administración

### Opción B: Automatizado con Cypress

Crear un test específico para screenshots:

```typescript
// cypress/e2e/screenshots.cy.ts
describe('Screenshots de la Aplicación', () => {
  it('captura todas las páginas', () => {
    cy.visit('/');
    cy.screenshot('01-login');
    
    // Después de login manual o automatizado
    cy.visit('/dashboard');
    cy.screenshot('02-dashboard');
    
    cy.visit('/request-session');
    cy.screenshot('03-request-session');
  });
});
```

Ejecutar: `npm run cypress`

---

## 📦 4. Build y Bundle Analysis

### Generar build de producción

```bash
cd frontend
npm run build
```

### Análisis de bundle

El build genera estadísticas en `frontend/dist/`:

```powershell
# Ver tamaño de archivos
Get-ChildItem -Recurse frontend/dist/ | Select-Object Name, Length | Sort-Object Length -Descending
```

### Capturar evidencia

1. Captura de pantalla de la carpeta `dist/` mostrando archivos
2. Captura del output del comando `npm run build`

---

## 🔍 5. Lighthouse Audit

### Ejecutar Lighthouse

1. Construir y servir la aplicación:
```bash
npm run build
npm run preview
```

2. Abrir Chrome DevTools (F12)
3. Ir a pestaña "Lighthouse"
4. Seleccionar:
   - ✅ Performance
   - ✅ Accessibility
   - ✅ Best Practices
   - ✅ SEO
5. Click "Analyze page load"

### Guardar reporte

- Hacer click en "Save report" (icono de descarga)
- Guardar como HTML en `evidencias/frontend/lighthouse-report.html`

---

## 🐳 6. Docker

### Build de imagen

```bash
cd frontend
docker build -t monis-frontend .
```

### Capturar evidencias

```powershell
# Lista de imágenes
docker images monis-frontend

# Ejecutar contenedor
docker run -d -p 5173:80 --name monis-test monis-frontend

# Verificar que está corriendo
docker ps

# Health check
docker ps --format "table {{.Names}}\t{{.Status}}"

# Logs
docker logs monis-test

# Detener y limpiar
docker stop monis-test
docker rm monis-test
```

Capturar screenshots de cada comando.

---

## 📋 7. Checklist de Evidencias

### Tests
- [ ] Reporte de cobertura HTML (coverage/index.html)
- [ ] Videos de Cypress tests
- [ ] Screenshots de tests fallidos (si hay)

### Screenshots de la Aplicación
- [ ] Login/Registro
- [ ] Dashboard Estudiante (vacío y con datos)
- [ ] Formulario Solicitar Sesión
- [ ] Dashboard Tutor
- [ ] Panel Admin
- [ ] Página 404/No autorizado
- [ ] Versión móvil (responsive)

### Performance
- [ ] Reporte Lighthouse
- [ ] Screenshot del build output
- [ ] Análisis de bundle size

### Docker
- [ ] Screenshot de `docker images`
- [ ] Screenshot de `docker ps` (contenedor corriendo)
- [ ] Screenshot de la app corriendo en Docker
- [ ] Logs del contenedor

### Documentación
- [ ] README.md actualizado
- [ ] Diagramas de arquitectura
- [ ] Documentación de componentes

---

## 🚀 Script de Automatización

Crear archivo `generate-evidences.ps1`:

```powershell
# Script para generar todas las evidencias
Write-Host "Generando evidencias del frontend..." -ForegroundColor Green

# 1. Tests con cobertura
Write-Host "1. Ejecutando tests unitarios..." -ForegroundColor Yellow
cd frontend
npm run test:coverage
Copy-Item -Recurse -Force coverage/* ../evidencias/frontend/coverage/

# 2. Build
Write-Host "2. Generando build de producción..." -ForegroundColor Yellow
npm run build

# 3. Cypress (requiere que el dev server esté corriendo)
Write-Host "3. Recuerda ejecutar 'npm run dev' en otra terminal antes de continuar" -ForegroundColor Yellow
Read-Host "Presiona Enter cuando el dev server esté corriendo"
npm run cypress:headless
Copy-Item -Recurse -Force cypress/videos/* ../evidencias/frontend/tests/
Copy-Item -Recurse -Force cypress/screenshots/* ../evidencias/frontend/screenshots/

Write-Host "✅ Evidencias generadas en /evidencias/frontend/" -ForegroundColor Green
Write-Host "   - Coverage: /evidencias/frontend/coverage/" -ForegroundColor Cyan
Write-Host "   - Tests: /evidencias/frontend/tests/" -ForegroundColor Cyan
Write-Host "   - Screenshots: /evidencias/frontend/screenshots/" -ForegroundColor Cyan
```

Ejecutar: `.\generate-evidences.ps1`

---

## 📊 Formato de Reporte Final

Crear un documento PDF/DOCX con:

### 1. Portada
- Título: "Evidencias Frontend - Monis-Torias"
- Fecha
- Integrantes

### 2. Índice

### 3. Introducción
- Descripción del proyecto
- Tecnologías utilizadas
- Objetivos de testing

### 4. Tests Unitarios
- Resumen de cobertura
- Tabla de tests ejecutados
- Screenshots del reporte

### 5. Tests E2E
- Casos de prueba
- Screenshots/videos clave
- Resultados

### 6. Performance
- Métricas de Lighthouse
- Bundle size analysis
- Optimizaciones implementadas

### 7. Docker
- Configuración
- Screenshots de ejecución
- Health checks

### 8. Conclusiones
- Métricas alcanzadas
- Problemas encontrados y soluciones
- Mejoras futuras

---

## 🎯 Métricas Objetivo

### Cobertura de Tests
- **Objetivo**: > 70%
- **Ideal**: > 80%

### Lighthouse Scores
- **Performance**: > 90
- **Accessibility**: > 90
- **Best Practices**: > 90
- **SEO**: > 80

### Bundle Size
- **Main bundle**: < 500 KB
- **Total size**: < 2 MB

---

**Última actualización**: Noviembre 2025
