# 🔧 Solución al Error 403 "Forbidden" en Admin Dashboard

## 🎯 Problema Identificado

El error 403 al intentar acceder a `/api/tutors` como administrador se debe a que:

1. El usuario NO tiene el rol `manager: true` configurado en Firestore (`user_roles` collection)
2. O los **custom claims** de Firebase Authentication no están configurados
3. Por lo tanto, el middleware `requireRoles("manager")` rechaza la petición

## ✅ Solución Rápida (Opción 1 - Usando Endpoints Debug)

### Paso 1: Verificar tus roles actuales

Abre la consola del navegador en tu app desplegada (estando logueado como admin) y ejecuta:

```javascript
// Verificar roles actuales
const token = await firebase.auth().currentUser.getIdToken();
const response = await fetch('https://proyecto-arqui-2c418.web.app/api/debug/my-roles', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const data = await response.json();
console.log(data);
```

**O simplemente visita:** `https://proyecto-arqui-2c418.web.app/api/debug/my-roles`

### Paso 2: Asignar rol de manager (si es necesario)

Si el diagnóstico muestra que NO tienes rol de manager:

```javascript
// Asignar rol de manager
const token = await firebase.auth().currentUser.getIdToken();
const response = await fetch('https://proyecto-arqui-2c418.web.app/api/debug/fix-my-role', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ role: 'manager' })
});
const result = await response.json();
console.log(result);
```

### Paso 3: ⚠️ IMPORTANTE - Cerrar sesión y volver a entrar

Los custom claims solo se actualizan cuando se renueva el token. **DEBES:**

1. ✅ Cerrar sesión completamente
2. ✅ Volver a iniciar sesión
3. ✅ Intentar acceder al dashboard de admin nuevamente

---

## ✅ Solución Manual (Opción 2 - Firebase Console)

### 1. Ir a Firebase Console

1. Abre [Firebase Console](https://console.firebase.google.com/project/proyecto-arqui-2c418/firestore/databases/-default-/data/~2Fuser_roles)
2. Ve a **Firestore Database**
3. Busca la colección `user_roles`

### 2. Verificar/Crear documento para tu usuario

1. Busca el documento con el UID de tu usuario administrador
2. Si NO existe, créalo con:
   ```json
   {
     "manager": true
   }
   ```
3. Si existe pero no tiene `manager: true`, agrégalo

### 3. (Opcional pero recomendado) Configurar Custom Claims

Aunque Firestore ya funciona, los custom claims son más rápidos:

1. Ve a **Authentication** → **Users**
2. Selecciona tu usuario
3. En la pestaña **Custom claims**, agrega:
   ```json
   {
     "manager": true
   }
   ```

---

## 🔍 ¿Cómo verificar que funcionó?

Después de cerrar sesión y volver a entrar, ejecuta en la consola del navegador:

```javascript
// Ver el token decodificado
const user = firebase.auth().currentUser;
const token = await user.getIdToken();
const decoded = await user.getIdTokenResult();
console.log('Custom Claims:', decoded.claims);
```

Deberías ver:
```javascript
{
  manager: true,
  // ... otros claims ...
}
```

---

## 🚨 Prevención futura

Para evitar este problema al crear nuevos administradores:

### Opción A: Usar el endpoint de registro con rol

Modificar `Login.tsx` para que al registrar un admin, también se configuren los custom claims (requiere Cloud Function).

### Opción B: Script de inicialización

Crear un endpoint `/api/users/bootstrap-admin` que:
1. Cree el primer usuario administrador
2. Configure custom claims automáticamente
3. Solo se pueda ejecutar una vez

---

## 📝 Notas Técnicas

### ¿Por qué funciona en localhost y no en producción?

Probablemente en localhost tenías configurado el emulador de Firebase con datos de prueba que incluían los roles correctos, o estabas usando un usuario diferente que sí tenía roles configurados.

### Diferencia entre Firestore roles y Custom Claims

- **Firestore (`user_roles`)**: Requiere lectura de BD en cada request (más lento pero más flexible)
- **Custom Claims**: Vienen en el JWT token (más rápido, pero requiere refresh de sesión)

El sistema actual usa AMBOS como fallback:
1. Primero intenta leer de custom claims
2. Si no existen, lee de Firestore
3. Por eso es importante tener ambos configurados

---

## 🎉 ¿Todo funcionó?

Si después de seguir estos pasos puedes ver la lista de tutores en `/admin`, ¡problema resuelto!

Recuerda eliminar las rutas de debug antes de la entrega final:
- `/api/debug/*` en producción

---

## 💡 Para el equipo

Este problema común puede documentarse en la presentación como:

**"Reto Técnico Enfrentado"**
- **Problema**: Error 403 en producción pero funciona en desarrollo
- **Causa**: Diferencia en configuración de roles entre entornos
- **Solución**: Implementación de endpoints de debug + custom claims
- **Aprendizaje**: Importancia de tener datos consistentes entre entornos

---

**Fecha**: 22 de Noviembre, 2025
**Autor**: Equipo Monis-Torias
