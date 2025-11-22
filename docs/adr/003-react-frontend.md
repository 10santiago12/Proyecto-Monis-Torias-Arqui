# ADR 003: React como Framework de Frontend

**Estado:** Aceptado  
**Fecha:** 2025-11-21  
**Autores:** Equipo Proyecto Monis-Torias  
**Contexto:** Arquitectura de Software - Semestre 6

---

## Contexto y Problema

Necesitamos un framework de frontend moderno que permita:
- Desarrollo de SPA (Single Page Application)
- Gestión eficiente del estado de la aplicación
- Autenticación con Firebase
- Routing del lado del cliente
- Componentes reutilizables
- TypeScript para type-safety
- Ecosistema maduro con buenas prácticas

## Alternativas Consideradas

### 1. **React**
**Pros:**
- ✅ Librería más popular (70M+ descargas semanales en npm)
- ✅ Ecosistema gigante: React Router, Redux, TanStack Query, etc.
- ✅ Excelente integración con TypeScript
- ✅ Firebase proporciona SDKs optimizados para React
- ✅ Hooks permiten lógica reutilizable
- ✅ Vite proporciona hot reload instantáneo
- ✅ React Developer Tools excelente para debugging
- ✅ Gran cantidad de tutoriales y documentación

**Cons:**
- ❌ No es un framework completo (requiere librerías adicionales para routing, estado global, etc.)
- ❌ JSX puede ser confuso para principiantes

### 2. **Vue 3**
**Pros:**
- ✅ Curva de aprendizaje suave
- ✅ Composition API similar a React Hooks
- ✅ Vue Router y Pinia incluidos en el ecosistema oficial
- ✅ Excelente documentación en español

**Cons:**
- ❌ Ecosistema más pequeño que React
- ❌ Menos demanda laboral comparado con React
- ❌ Firebase SDKs menos optimizados para Vue

### 3. **Angular**
**Pros:**
- ✅ Framework completo con todo incluido (routing, HTTP, forms, etc.)
- ✅ TypeScript de forma nativa
- ✅ Arquitectura opinionada (menos decisiones que tomar)

**Cons:**
- ❌ Curva de aprendizaje pronunciada
- ❌ Más verboso que React o Vue
- ❌ Bundle size más grande
- ❌ RxJS puede ser complejo para principiantes

### 4. **Svelte**
**Pros:**
- ✅ No usa Virtual DOM (mejor performance)
- ✅ Código más limpio (menos boilerplate)
- ✅ Bundle size muy pequeño

**Cons:**
- ❌ Ecosistema inmaduro
- ❌ Menos recursos de aprendizaje
- ❌ Pocas librerías de terceros

## Decisión

**Elegimos React con TypeScript y Vite** por las siguientes razones:

1. **Dominio del equipo:** Todos los miembros del equipo tienen experiencia previa con React.

2. **Firebase Integration:** Firebase proporciona hooks oficiales para React (`useAuth`, `useFirestore`, etc.) que simplifican la integración.

3. **Ecosistema maduro:** React tiene soluciones probadas para:
   - Routing: React Router v6
   - Estado global: Context API + hooks
   - Forms: React Hook Form
   - Testing: React Testing Library, Vitest

4. **Vite como build tool:** Vite proporciona:
   - Hot Module Replacement (HMR) instantáneo
   - Build optimizado con Rollup
   - TypeScript out-of-the-box
   - 10x más rápido que Create React App

5. **Demanda laboral:** React es el framework con mayor demanda en el mercado laboral colombiano, beneficiando a los estudiantes.

6. **Componentes funcionales:** Los hooks de React permiten código más limpio y reutilizable comparado con class components.

## Consecuencias

### Positivas
- ✅ Desarrollo rápido con componentes reutilizables
- ✅ Type-safety con TypeScript reduce bugs en producción
- ✅ Vite reduce tiempos de build de 30s a 2s comparado con Webpack
- ✅ Context API suficiente para estado global (no necesita Redux)
- ✅ Firebase Hooks simplifican autenticación y Firestore
- ✅ React Developer Tools facilita debugging

### Negativas
- ⚠️ **Decisiones de arquitectura:** React no es opinionado, requiere definir estructura de carpetas, manejo de estado, etc.
- ⚠️ **Prop drilling:** Pasar props por múltiples niveles puede ser tedioso (mitigado con Context API)
- ⚠️ **Re-renders innecesarios:** Requiere optimización manual con `React.memo`, `useMemo`, `useCallback`

### Mitigaciones
- Definir estructura de carpetas clara: `pages/`, `components/`, `hooks/`, `services/`, `context/`
- Usar Context API para estado global (autenticación, usuario actual)
- Implementar **code splitting** con `React.lazy()` y `Suspense`
- Usar React.memo solo en componentes pesados (listas largas, gráficos)

## Implementación

### Stack Tecnológico Frontend
```
- React 18.3+
- TypeScript 5.x
- Vite 6.x (build tool)
- React Router v6 (routing)
- Firebase SDK 11.x (auth, firestore)
- TailwindCSS (estilos - opcional)
- Vitest + React Testing Library (tests)
- Cypress (E2E tests)
```

### Estructura de Proyecto
```
frontend/
├── src/
│   ├── pages/          # Páginas principales
│   ├── components/     # Componentes reutilizables
│   ├── context/        # Context providers (auth)
│   ├── hooks/          # Custom hooks
│   ├── services/       # API calls
│   ├── lib/            # Firebase config
│   ├── routes/         # Router config
│   └── __tests__/      # Tests
├── public/             # Assets estáticos
├── index.html
├── vite.config.ts
└── package.json
```

## Referencias
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Firebase React Hooks](https://github.com/CSFrequency/react-firebase-hooks)
- [State of JS 2024](https://stateofjs.com/)

---

**Firmado por:** Equipo Proyecto Monis-Torias  
**Fecha de revisión:** 2025-11-21
