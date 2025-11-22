# ADR 001: Uso de Firebase como Backend as a Service (BaaS)

**Estado:** Aceptado  
**Fecha:** 2025-11-21  
**Autores:** Equipo Proyecto Monis-Torias  
**Contexto:** Arquitectura de Software - Semestre 6

---

## Contexto y Problema

El proyecto "Monis-Torias" es una plataforma de gestión de tutorías académicas que requiere:
- Autenticación de usuarios (estudiantes, tutores, administradores)
- Base de datos NoSQL para sesiones, pagos, materiales
- Almacenamiento de archivos (materiales didácticos)
- Backend serverless para APIs REST
- Hosting de aplicación web
- Despliegue rápido con poco tiempo de desarrollo

Necesitamos decidir qué tecnología de backend utilizar que permita desarrollo ágil, escalabilidad y bajo costo operacional.

## Alternativas Consideradas

### 1. **Firebase (Google Cloud Platform)**
- ✅ Backend completo (Auth, Firestore, Storage, Functions, Hosting)
- ✅ Serverless - sin mantenimiento de servidores
- ✅ SDKs completos para web y móvil
- ✅ Plan gratuito generoso (suficiente para desarrollo y MVP)
- ✅ Integración nativa con GitHub Actions
- ✅ Emuladores locales para desarrollo
- ❌ Vendor lock-in con Google
- ❌ Costos pueden escalar con uso intensivo

### 2. **AWS (Amazon Web Services)**
- ✅ Muy flexible y potente
- ✅ Mayor control sobre infraestructura
- ✅ Amplio ecosistema de servicios
- ❌ Curva de aprendizaje pronunciada
- ❌ Configuración compleja (Cognito + DynamoDB + S3 + Lambda + API Gateway)
- ❌ Plan gratuito limitado a 12 meses
- ❌ Mayor tiempo de setup inicial

### 3. **Azure (Microsoft)**
- ✅ Buena integración con .NET y Microsoft Stack
- ✅ Azure Functions + Cosmos DB + Blob Storage
- ❌ Menos intuitivo que Firebase
- ❌ SDKs menos maduros para JavaScript/TypeScript
- ❌ Documentación menos clara para principiantes

### 4. **Backend Tradicional (Node.js + MongoDB + Nginx)**
- ✅ Control total sobre la arquitectura
- ✅ Sin vendor lock-in
- ❌ Requiere provisión y mantenimiento de servidores
- ❌ Necesita configurar autenticación desde cero
- ❌ Mayor tiempo de desarrollo
- ❌ Costos de hosting (VPS/DigitalOcean)

## Decisión

**Elegimos Firebase** como plataforma de backend por las siguientes razones:

1. **Rapidez de desarrollo:** Firebase proporciona soluciones listas para usar (Auth, Firestore, Storage) que reducen significativamente el tiempo de desarrollo.

2. **Escalabilidad automática:** Al ser serverless, Firebase escala automáticamente según la demanda sin necesidad de configurar balanceadores de carga o clusters.

3. **Costo inicial bajo:** El plan gratuito (Spark) cubre completamente las necesidades de desarrollo y MVP. El plan Blaze (pay-as-you-go) es económico para uso académico.

4. **DevOps simplificado:** Firebase CLI + GitHub Actions permite CI/CD sin necesidad de configurar servidores, Docker registries, o Kubernetes.

5. **Ecosistema completo:** Un solo proveedor para autenticación, base de datos, almacenamiento, funciones y hosting reduce la complejidad operacional.

6. **Emuladores locales:** Firebase proporciona emuladores completos para desarrollo local, permitiendo testing sin consumir cuota ni costos.

7. **Documentación y comunidad:** Firebase tiene documentación excelente y una comunidad activa, ideal para equipos de estudiantes.

## Consecuencias

### Positivas
- ✅ Desarrollo acelerado del MVP
- ✅ Infraestructura serverless sin mantenimiento
- ✅ Autenticación robusta con múltiples proveedores
- ✅ Firestore proporciona sincronización en tiempo real
- ✅ Hosting con CDN global incluido
- ✅ Firebase Functions permite lógica de backend compleja

### Negativas
- ⚠️ **Vendor lock-in:** Migrar fuera de Firebase requeriría reescribir partes significativas del código
- ⚠️ **Limitaciones de Firestore:** No soporta queries complejas como SQL (JOIN, GROUP BY)
- ⚠️ **Cold starts:** Firebase Functions pueden tener latencia inicial en peticiones después de inactividad
- ⚠️ **Costos futuros:** Si la aplicación escala masivamente, los costos podrían aumentar significativamente

### Mitigaciones
- Abstraer lógica de negocio en servicios independientes (patrón Repository)
- Usar Firebase Admin SDK en backend para facilitar futura migración
- Monitorear métricas de uso para optimizar costos
- Implementar caché en Cloud Functions para reducir cold starts

## Referencias
- [Firebase Pricing](https://firebase.google.com/pricing)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Emulator Suite](https://firebase.google.com/docs/emulator-suite)
- [Martin Fowler - Serverless Architectures](https://martinfowler.com/articles/serverless.html)

---

**Firmado por:** Equipo Proyecto Monis-Torias  
**Fecha de revisión:** 2025-11-21
