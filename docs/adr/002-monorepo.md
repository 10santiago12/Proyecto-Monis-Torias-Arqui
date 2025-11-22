# ADR 002: Monorepo vs Multi-Repo

**Estado:** Aceptado  
**Fecha:** 2025-11-21  
**Autores:** Equipo Proyecto Monis-Torias  
**Contexto:** Arquitectura de Software - Semestre 6

---

## Contexto y Problema

El proyecto consiste en una aplicación web con:
- Frontend (React + TypeScript + Vite)
- Backend (Firebase Functions + Node.js)
- Tests (Jest + Cypress)
- CI/CD (GitHub Actions)
- Configuración compartida (ESLint, TypeScript, Docker)

Necesitamos decidir si mantener ambos proyectos en un solo repositorio (monorepo) o separarlos en repositorios independientes (multi-repo).

## Alternativas Consideradas

### 1. **Monorepo**
Estructura:
```
proyecto-monis-torias/
├── frontend/
│   ├── src/
│   ├── package.json
│   └── ...
├── functions/
│   ├── src/
│   ├── package.json
│   └── ...
├── .github/workflows/
├── docker-compose.yml
└── README.md
```

**Ventajas:**
- ✅ Cambios atómicos: un PR puede modificar frontend y backend simultáneamente
- ✅ Configuración compartida: ESLint, Prettier, TypeScript configs
- ✅ CI/CD unificado: un solo pipeline para todo el proyecto
- ✅ Historial git unificado: fácil rastrear cambios relacionados
- ✅ Documentación centralizada
- ✅ Facilita colaboración en equipos pequeños

**Desventajas:**
- ❌ Repositorio más grande (más tiempo de clone)
- ❌ CI/CD ejecuta tests de ambos proyectos siempre
- ❌ Puede ser confuso para nuevos colaboradores

### 2. **Multi-Repo**
Estructura:
```
monis-torias-frontend/
└── src/...

monis-torias-backend/
└── src/...
```

**Ventajas:**
- ✅ Separación clara de responsabilidades
- ✅ CI/CD independiente (solo ejecuta tests del proyecto modificado)
- ✅ Control de acceso granular por repositorio
- ✅ Versionado independiente (frontend v1.0, backend v2.0)

**Desventajas:**
- ❌ Cambios que afectan ambos proyectos requieren múltiples PRs
- ❌ Duplicación de configuración (ESLint, CI/CD, Docker)
- ❌ Historial fragmentado: difícil rastrear cambios relacionados
- ❌ Más complejo para equipos pequeños
- ❌ Documentación fragmentada

## Decisión

**Elegimos Monorepo** por las siguientes razones:

1. **Equipo pequeño (3 personas):** En equipos pequeños, la coordinación es más simple con un solo repositorio.

2. **Cambios frecuentes cross-stack:** Muchas features requieren cambios simultáneos en frontend y backend (ej: agregar un nuevo endpoint implica modificar el servicio backend y el cliente frontend).

3. **Configuración compartida:** TypeScript, ESLint, Prettier, Docker y GitHub Actions comparten configuración similar.

4. **Despliegue conjunto:** Firebase despliega frontend y functions desde la misma raíz del proyecto.

5. **Simplicidad en CI/CD:** Un solo pipeline puede ejecutar linters, tests y despliegues de forma orquestada.

6. **Firebase CLI requiere estructura específica:** Firebase CLI espera que `firebase.json` esté en la raíz, con `frontend/` y `functions/` como subdirectorios.

## Consecuencias

### Positivas
- ✅ PRs más completos: un solo PR puede incluir cambios de contrato API en frontend y backend
- ✅ Refactorings más seguros: cambios en tipos compartidos se reflejan inmediatamente
- ✅ Setup simplificado para nuevos desarrolladores: `git clone` + `npm install` en ambos directorios
- ✅ Tests de integración más fáciles: frontend y backend están en la misma máquina
- ✅ Documentación unificada: un solo README con instrucciones completas

### Negativas
- ⚠️ **CI/CD más lento:** Cada push ejecuta tests de frontend y backend, incluso si solo uno cambió
- ⚠️ **Repositorio más pesado:** Más archivos, más tiempo de clone inicial
- ⚠️ **Conflictos de merge potenciales:** Si dos personas trabajan en frontend y backend simultáneamente

### Mitigaciones
- Implementar **change detection** en CI/CD (ejecutar tests solo de proyectos modificados)
- Usar **Git LFS** si el repositorio crece con archivos binarios
- Separar workspaces en `package.json` root si se adopta Yarn Workspaces o npm Workspaces
- Considerar migración a multi-repo si el equipo crece a más de 5 personas

## Implementación

```json
// firebase.json
{
  "hosting": {
    "public": "frontend/dist"
  },
  "functions": {
    "source": "functions"
  }
}
```

```yaml
# .github/workflows/ci.yml
jobs:
  backend-tests:
    working-directory: ./functions
    
  frontend-tests:
    working-directory: ./frontend
```

## Referencias
- [Monorepo vs Multi-Repo - Martin Fowler](https://martinfowler.com/articles/monorepo.html)
- [Advantages of Monorepos - Google Engineering](https://research.google/pubs/pub45424/)
- [Firebase Monorepo Setup](https://firebase.google.com/docs/hosting/github-integration)

---

**Firmado por:** Equipo Proyecto Monis-Torias  
**Fecha de revisión:** 2025-11-21
