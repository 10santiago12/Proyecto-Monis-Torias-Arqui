# ADR 005: Firebase Authentication + Custom Claims

**Estado:** Aceptado  
**Fecha:** 2025-11-21  
**Autores:** Equipo Proyecto Monis-Torias  
**Contexto:** Arquitectura de Software - Semestre 6

---

## Contexto y Problema

La aplicación Monis-Torias requiere:
- Autenticación de usuarios (email/password)
- 3 roles distintos: **estudiante**, **tutor**, **manager/admin**
- Autorización basada en roles (RBAC)
- Tokens JWT seguros
- Gestión de sesiones
- Protección de rutas en frontend y backend

Necesitamos decidir cómo implementar autenticación y autorización de forma segura y escalable.

## Alternativas Consideradas

### 1. **Firebase Authentication + Custom Claims**

**Arquitectura:**
- Firebase Auth maneja autenticación (login, registro, tokens JWT)
- Custom claims en JWT para roles (manager, tutor)
- Firestore collection `user_roles` como fallback
- Middleware de autorización en backend valida roles

**Pros:**
- ✅ Firebase Auth maneja tokens JWT automáticamente
- ✅ Custom claims en JWT (no requiere query a BD en cada request)
- ✅ Integración nativa con Firebase Functions
- ✅ Tokens auto-renovables
- ✅ Protección contra CSRF incluida
- ✅ SDKs para web, mobile, server

**Cons:**
- ❌ Custom claims limitados a 1000 bytes
- ❌ Cambiar custom claims requiere logout/login del usuario
- ❌ Vendor lock-in con Firebase

### 2. **JWT Manual (jsonwebtoken + bcrypt)**

**Arquitectura:**
- Guardar usuarios con contraseñas hasheadas (bcrypt) en Firestore
- Generar tokens JWT manualmente en `/login`
- Middleware verifica token en cada request

**Pros:**
- ✅ Control total sobre tokens
- ✅ Sin vendor lock-in
- ✅ Roles en payload del JWT

**Cons:**
- ❌ Implementar hashing de passwords (riesgo de seguridad)
- ❌ Implementar token refresh manualmente
- ❌ Implementar logout (blacklist de tokens)
- ❌ No protege contra CSRF automáticamente
- ❌ Mayor tiempo de desarrollo

### 3. **Passport.js + Sessions**

**Arquitectura:**
- Passport.js para autenticación
- Express-session para sesiones
- Cookies para mantener sesión
- Roles en objeto de sesión

**Pros:**
- ✅ Muy flexible (múltiples estrategias: local, OAuth, LDAP)
- ✅ Ampliamente usado en Node.js

**Cons:**
- ❌ Sesiones requieren almacenamiento persistente (Redis)
- ❌ No funciona bien en serverless (Firebase Functions)
- ❌ Cookies problemáticas en mobile apps
- ❌ Escalabilidad limitada

### 4. **Auth0 / Clerk / Supabase Auth**

**Pros:**
- ✅ Soluciones completas de autenticación
- ✅ UI components listos para usar
- ✅ OAuth integrado (Google, GitHub, etc.)

**Cons:**
- ❌ Costo adicional
- ❌ Vendor lock-in
- ❌ Requiere integración adicional con Firebase

## Decisión

**Elegimos Firebase Authentication + Custom Claims** por las siguientes razones:

1. **Integración nativa:** Firebase Auth funciona perfectamente con Firebase Functions y Hosting.

2. **Seguridad robusta:** Firebase Auth maneja:
   - Hashing de passwords (bcrypt con salt)
   - Tokens JWT firmados con clave privada de Google
   - Protección contra brute-force attacks
   - Email verification
   - Password reset

3. **Performance:** Custom claims en JWT evitan queries a BD en cada request.

4. **Dual-strategy:** Usamos custom claims (rápido) + Firestore `user_roles` (fallback):
   ```javascript
   const roles = decoded.roles || await getRolesFromDb(uid);
   ```

5. **Middleware simple:**
   ```javascript
   async function authMiddleware(req, res, next) {
     const token = req.headers.authorization.split('Bearer ')[1];
     const decoded = await admin.auth().verifyIdToken(token);
     req.user = { uid: decoded.uid, roles: decoded.roles || {} };
     next();
   }
   ```

## Arquitectura Implementada

### 1. Registro de Usuario

```javascript
// Frontend
const { user } = await createUserWithEmailAndPassword(auth, email, password);

// Backend (Cloud Function trigger)
exports.onUserCreate = functions.auth.user().onCreate(async (user) => {
  // Crear documento en Firestore
  await db.collection('users').doc(user.uid).set({
    email: user.email,
    role: 'student', // rol por defecto
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });
  
  // Crear entry en user_roles (fallback)
  await db.collection('user_roles').doc(user.uid).set({
    student: true
  });
});
```

### 2. Asignación de Roles (Manager asigna tutor)

```javascript
// Backend endpoint (solo manager)
router.post('/users/upgrade-to-tutor', requireRoles('manager'), async (req, res) => {
  const { uid } = req.body;
  
  // Actualizar Firestore
  await db.collection('user_roles').doc(uid).set({ tutor: true }, { merge: true });
  
  // Actualizar custom claims en JWT
  await admin.auth().setCustomUserClaims(uid, { tutor: true });
  
  res.json({ success: true });
});
```

### 3. Autorización en Backend

```javascript
// Middleware de roles
function requireRoles(...roles) {
  return async (req, res, next) => {
    const userRoles = req.user.roles;
    const hasRole = roles.some(role => userRoles[role] === true);
    
    if (!hasRole) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}

// Uso en routes
router.get('/tutors', authMiddleware, requireRoles('manager'), async (req, res) => {
  // Solo managers pueden listar tutores
});

router.post('/sessions/confirm', authMiddleware, requireRoles('tutor'), async (req, res) => {
  // Solo tutores pueden confirmar sesiones
});
```

### 4. Protección de Rutas en Frontend

```tsx
// ProtectedRoute.tsx
function ProtectedRoute({ children, requiredRole }) {
  const { user } = useAuth();
  const [hasRole, setHasRole] = useState(false);
  
  useEffect(() => {
    if (user) {
      user.getIdTokenResult().then(tokenResult => {
        const roles = tokenResult.claims;
        setHasRole(roles[requiredRole] === true);
      });
    }
  }, [user, requiredRole]);
  
  if (!user) return <Navigate to="/login" />;
  if (!hasRole) return <Navigate to="/unauthorized" />;
  return children;
}

// Uso en router
<Route path="/admin" element={
  <ProtectedRoute requiredRole="manager">
    <AdminPanel />
  </ProtectedRoute>
} />
```

## Consecuencias

### Positivas
- ✅ **Performance:** Roles en JWT (0ms latency), no query a BD en cada request
- ✅ **Seguridad:** Tokens firmados por Google, imposibles de falsificar
- ✅ **Escalabilidad:** Firebase Auth escala automáticamente
- ✅ **Testing:** Firebase Auth Emulator permite testing local
- ✅ **Auditabilidad:** Firebase Auth logs todas las autenticaciones

### Negativas
- ⚠️ **Cambio de roles requiere re-login:** Si un admin asigna rol "tutor", el usuario debe logout/login para obtener el nuevo token.

- ⚠️ **Dual source of truth:** Roles están en custom claims Y Firestore, puede haber inconsistencias.

- ⚠️ **Custom claims limitados:** Solo 1000 bytes, no puede guardar datos extensos.

### Mitigaciones
- **Fallback a Firestore:** Si custom claims no existen, leer de Firestore:
  ```javascript
  const roles = decoded.roles || await getRolesFromDb(uid);
  ```

- **Forzar token refresh:** Después de cambiar roles, forzar logout en frontend:
  ```javascript
  await admin.auth().revokeRefreshTokens(uid);
  ```

- **Sincronización:** Script de validación que compara custom claims con Firestore y reporta inconsistencias.

## Testing

```javascript
// Unit test
describe('requireRoles middleware', () => {
  it('should allow manager', async () => {
    const req = { user: { roles: { manager: true } } };
    const next = jest.fn();
    await requireRoles('manager')(req, {}, next);
    expect(next).toHaveBeenCalled();
  });
  
  it('should block student', async () => {
    const req = { user: { roles: { student: true } } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    await requireRoles('manager')(req, res, () => {});
    expect(res.status).toHaveBeenCalledWith(403);
  });
});
```

## Referencias
- [Firebase Auth Custom Claims](https://firebase.google.com/docs/auth/admin/custom-claims)
- [JWT Best Practices](https://auth0.com/blog/jwt-handbook/)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

---

**Firmado por:** Equipo Proyecto Monis-Torias  
**Fecha de revisión:** 2025-11-21
