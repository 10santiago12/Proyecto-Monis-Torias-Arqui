// functions/src/api/debug.routes.js
// 🔧 RUTA TEMPORAL PARA DEBUGGING - ELIMINAR EN PRODUCCIÓN FINAL
const express = require("express");
const { authMiddleware } = require("../middlewares/auth.middleware");
const admin = require("firebase-admin");

const router = express.Router();
const db = admin.firestore();

/**
 * GET /api/debug/my-roles
 * Devuelve los roles del usuario actual desde todas las fuentes
 */
router.get("/my-roles", authMiddleware, async (req, res, next) => {
  try {
    const uid = req.user.uid;
    
    // Obtener datos del token
    const tokenData = await admin.auth().getUser(uid);
    
    // Obtener roles de Firestore
    const rolesDoc = await db.collection("user_roles").doc(uid).get();
    const rolesFromDb = rolesDoc.exists ? rolesDoc.data() : null;
    
    // Obtener perfil de usuario
    const userDoc = await db.collection("users").doc(uid).get();
    const userProfile = userDoc.exists ? userDoc.data() : null;
    
    return res.json({
      uid,
      email: tokenData.email,
      customClaims: tokenData.customClaims || null,
      rolesFromMiddleware: req.user.roles,
      rolesFromFirestore: rolesFromDb,
      userProfile,
      diagnosis: {
        hasCustomClaims: !!tokenData.customClaims,
        hasRolesInFirestore: !!rolesFromDb,
        hasManagerRole: !!(rolesFromDb?.manager || tokenData.customClaims?.manager),
        recommendation: !rolesFromDb?.manager 
          ? "❌ NO tienes rol de manager en Firestore. Usa POST /api/debug/fix-my-role"
          : "✅ Roles configurados correctamente"
      }
    });
  } catch (e) {
    return next(e);
  }
});

/**
 * POST /api/debug/fix-my-role
 * Asigna rol de manager al usuario actual (solo para desarrollo/debug)
 */
router.post("/fix-my-role", authMiddleware, async (req, res, next) => {
  try {
    const uid = req.user.uid;
    const { role } = req.body; // manager, tutor, o student
    
    if (!["manager", "tutor", "student"].includes(role)) {
      return res.status(400).json({ 
        message: "Role inválido. Usa: manager, tutor o student" 
      });
    }
    
    // Actualizar en Firestore user_roles
    const roleData = { [role]: true };
    await db.collection("user_roles").doc(uid).set(roleData, { merge: true });
    
    // Actualizar custom claims
    await admin.auth().setCustomUserClaims(uid, roleData);
    
    // Actualizar perfil en users
    await db.collection("users").doc(uid).set({
      role,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    
    return res.json({
      success: true,
      message: `✅ Rol '${role}' asignado correctamente`,
      uid,
      roleAssigned: role,
      important: "⚠️ Debes cerrar sesión y volver a entrar para que los cambios surtan efecto"
    });
  } catch (e) {
    return next(e);
  }
});

/**
 * GET /api/debug/all-users-roles
 * Lista todos los usuarios y sus roles (solo para debugging)
 */
router.get("/all-users-roles", authMiddleware, async (req, res, next) => {
  try {
    // Obtener todos los documentos de user_roles
    const rolesSnapshot = await db.collection("user_roles").get();
    const usersWithRoles = [];
    
    for (const doc of rolesSnapshot.docs) {
      const uid = doc.id;
      const roles = doc.data();
      
      try {
        const userRecord = await admin.auth().getUser(uid);
        usersWithRoles.push({
          uid,
          email: userRecord.email,
          roles,
          customClaims: userRecord.customClaims || null
        });
      } catch (e) {
        usersWithRoles.push({
          uid,
          email: "Usuario no encontrado en Auth",
          roles,
          customClaims: null
        });
      }
    }
    
    return res.json({
      totalUsers: usersWithRoles.length,
      users: usersWithRoles
    });
  } catch (e) {
    return next(e);
  }
});

module.exports = router;
