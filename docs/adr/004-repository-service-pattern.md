# ADR 004: Repository Pattern + Service Layer

**Estado:** Aceptado  
**Fecha:** 2025-11-21  
**Autores:** Equipo Proyecto Monis-Torias  
**Contexto:** Arquitectura de Software - Semestre 6

---

## Contexto y Problema

El backend de Firebase Functions necesita:
- Acceso a Firestore (base de datos)
- Lógica de negocio compleja (validaciones, cálculos, notificaciones)
- Manejo de transacciones
- Testing unitario aislado
- Posibilidad de cambiar Firestore por otra BD en el futuro

Necesitamos una arquitectura que separe responsabilidades y facilite el mantenimiento.

## Alternativas Consideradas

### 1. **Repository Pattern + Service Layer (3-tier architecture)**

```
Routes (Express) → Services (Lógica de negocio) → Repositories (Acceso a datos)
```

**Pros:**
- ✅ Separación clara de responsabilidades (SRP - SOLID)
- ✅ Services no conocen detalles de Firebase (abstracción)
- ✅ Fácil testing: mockear repositories en tests de services
- ✅ Migración futura facilitada: cambiar repository sin tocar services
- ✅ Lógica de negocio centralizada en services

**Cons:**
- ❌ Más archivos y carpetas (mayor complejidad inicial)
- ❌ Boilerplate adicional

### 2. **Active Record Pattern** (Rails style)

```
Models contienen lógica + acceso a datos
```

**Pros:**
- ✅ Menos archivos (models contienen todo)
- ✅ Rápido para CRUD simples

**Cons:**
- ❌ Models acoplados a Firestore
- ❌ Difícil testing (models hacen queries reales)
- ❌ Lógica de negocio mezclada con acceso a datos
- ❌ Migración complicada

### 3. **Transaction Script** (sin capas)

```
Routes ejecutan lógica directamente en Firestore
```

**Pros:**
- ✅ Muy simple para proyectos pequeños
- ✅ Sin abstracción (código directo)

**Cons:**
- ❌ Código duplicado en múltiples routes
- ❌ Testing complicado (requiere Firebase emulator)
- ❌ Acoplamiento extremo a Firestore
- ❌ Difícil mantener cuando crece el proyecto

### 4. **Clean Architecture** (Uncle Bob)

```
Entities → Use Cases → Interface Adapters → Frameworks
```

**Pros:**
- ✅ Máxima independencia del framework
- ✅ Arquitectura altamente testeable

**Cons:**
- ❌ Over-engineering para proyecto académico
- ❌ Demasiadas capas de abstracción
- ❌ Curva de aprendizaje alta

## Decisión

**Elegimos Repository Pattern + Service Layer** por las siguientes razones:

1. **Balance perfecto:** Suficiente abstracción sin over-engineering.

2. **Testabilidad:** Services pueden testearse con repositories mockeados, sin necesidad de Firebase emulators.

3. **SOLID Principles:**
   - **SRP:** Cada clase tiene una responsabilidad (repository = datos, service = lógica)
   - **DIP:** Services dependen de abstracciones (interfaces), no implementaciones concretas

4. **Escalabilidad:** Fácil agregar nuevos repositories o services sin afectar código existente.

5. **Documentación clara:** Patrón bien documentado, fácil de entender para nuevos desarrolladores.

## Arquitectura Implementada

### Estructura de Carpetas

```
functions/src/
├── api/                    # Express routes
│   ├── sessions.routes.js
│   ├── payments.routes.js
│   ├── tutors.routes.js
│   └── users.routes.js
├── services/               # Lógica de negocio
│   ├── sessions.service.js
│   ├── payments.service.js
│   ├── tutors.service.js
│   └── notifications.service.js
├── repos/                  # Acceso a Firestore
│   ├── sessions.repo.js
│   ├── payments.repo.js
│   ├── tutors.repo.js
│   └── users.repo.js
├── middlewares/            # Auth, roles, errors
│   ├── auth.middleware.js
│   ├── role.middleware.js
│   └── error.middleware.js
└── index.js                # Express app
```

### Flujo de Datos

```
1. Client → POST /api/sessions/request
2. Route (sessions.routes.js) → authMiddleware → requireRoles
3. Route → SessionsService.requestSession(user, dto)
4. Service valida datos, aplica lógica de negocio
5. Service → SessionsRepo.create(sessionData)
6. Repository → Firestore.collection('sessions').add()
7. Repository ← Firestore devuelve doc ID
8. Service ← Repository devuelve session object
9. Route ← Service devuelve session
10. Client ← Route devuelve JSON response
```

### Ejemplo de Implementación

**Repository (sessions.repo.js):**
```javascript
class SessionsRepo {
  async create(data) {
    const docRef = await db.collection('sessions').add({
      ...data,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    return { id: docRef.id, ...data };
  }
  
  async getById(id) {
    const doc = await db.collection('sessions').doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  }
}
```

**Service (sessions.service.js):**
```javascript
class SessionsService {
  constructor() {
    this.repo = new SessionsRepo();
    this.tutorsRepo = new TutorsRepo();
  }
  
  async requestSession(user, dto) {
    // Validaciones de negocio
    if (!dto.tutorCode || dto.tutorCode.length !== 4) {
      throw new Error('Tutor code inválido');
    }
    
    const tutor = await this.tutorsRepo.getByCode(dto.tutorCode);
    if (!tutor) {
      throw new Error('Tutor no encontrado');
    }
    
    // Crear sesión
    const session = await this.repo.create({
      studentId: user.uid,
      tutorId: tutor.uid,
      status: 'pending',
      subject: dto.subject
    });
    
    // Lógica adicional (notificaciones, etc.)
    await this.notificationsService.notifyTutor(tutor, session);
    
    return session;
  }
}
```

**Route (sessions.routes.js):**
```javascript
router.post('/request', authMiddleware, async (req, res, next) => {
  try {
    const service = new SessionsService();
    const session = await service.requestSession(req.user, req.body);
    return res.status(201).json(session);
  } catch (error) {
    next(error);
  }
});
```

## Consecuencias

### Positivas
- ✅ **Testing unitario simple:**
  ```javascript
  // Test de service
  const mockRepo = { create: jest.fn().mockResolvedValue({id: '123'}) };
  const service = new SessionsService(mockRepo);
  const result = await service.requestSession(user, dto);
  expect(mockRepo.create).toHaveBeenCalledWith({...});
  ```

- ✅ **Migración facilitada:** Cambiar Firestore por MongoDB solo requiere reescribir repositories, services no cambian.

- ✅ **Lógica de negocio centralizada:** Toda la validación y lógica está en services, no dispersa en routes.

- ✅ **Código reutilizable:** Múltiples routes pueden usar el mismo service.

### Negativas
- ⚠️ **Boilerplate adicional:** Cada entidad necesita repository + service + route (3 archivos mínimo).

- ⚠️ **Learning curve:** Desarrolladores nuevos necesitan entender la separación de capas.

### Mitigaciones
- Crear generators/templates para nuevas entidades (script que genera repo + service + route)
- Documentar arquitectura en README con diagramas
- Code reviews para asegurar que se respeta la separación de capas

## Testing Strategy

```javascript
// Unit tests (services)
describe('SessionsService', () => {
  it('should create session', async () => {
    const mockRepo = { create: jest.fn().mockResolvedValue({id: '1'}) };
    const service = new SessionsService(mockRepo);
    const result = await service.requestSession(user, dto);
    expect(result.id).toBe('1');
  });
});

// Integration tests (routes)
describe('POST /api/sessions/request', () => {
  it('should return 201 with session', async () => {
    const res = await request(app)
      .post('/api/sessions/request')
      .set('Authorization', `Bearer ${token}`)
      .send(dto);
    expect(res.status).toBe(201);
  });
});
```

## Referencias
- [Repository Pattern - Martin Fowler](https://martinfowler.com/eaaCatalog/repository.html)
- [Service Layer - Martin Fowler](https://martinfowler.com/eaaCatalog/serviceLayer.html)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)

---

**Firmado por:** Equipo Proyecto Monis-Torias  
**Fecha de revisión:** 2025-11-21
