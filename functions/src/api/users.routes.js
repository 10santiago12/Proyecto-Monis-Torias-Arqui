const express = require("express");
const {z} = require("zod");
const {UsersService} = require("../services/users.service");
const {authMiddleware} = require("../middlewares/auth.middleware");
const {requireRoles} = require("../middlewares/role.middleware");

const router = express.Router();
const service = new UsersService();

// TEMPORAL: Bootstrap admin sin autenticación (REMOVER EN PRODUCCIÓN)
router.post("/bootstrap-admin", async (req, res, next) => {
  try {
    const { email, secret } = req.body;
    
    // Secret simple para evitar abuso
    if (secret !== 'temp-admin-2024') {
      return res.status(403).json({ error: 'Invalid secret' });
    }

    const { admin } = require('../firebase');
    const userRecord = await admin.auth().getUserByEmail(email);

    await admin.auth().setCustomUserClaims(userRecord.uid, {
      roles: { manager: true, admin: true, tutor: true, student: true }
    });

    await admin.firestore().collection('user_roles').doc(userRecord.uid).set({
      manager: true,
      admin: true,
      tutor: true,
      student: true,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    return res.json({
      success: true,
      message: 'Admin roles assigned. Please logout and login again.',
      uid: userRecord.uid
    });
  } catch (e) { return next(e); }
});

// DEBUG: Endpoint para ver roles actuales (requiere estar autenticado)
router.get("/debug-roles", async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const { admin } = require('../firebase');
    const decoded = await admin.auth().verifyIdToken(token);
    
    // Buscar roles en Firestore
    const rolesDoc = await admin.firestore().collection('user_roles').doc(decoded.uid).get();
    const firestoreRoles = rolesDoc.exists ? rolesDoc.data() : null;

    // Buscar info completa del usuario
    const userRecord = await admin.auth().getUser(decoded.uid);

    return res.json({
      uid: decoded.uid,
      email: decoded.email,
      customClaims: userRecord.customClaims || null,
      tokenRoles: decoded.roles || null,
      firestoreRoles: firestoreRoles,
      recommendation: !decoded.roles && !firestoreRoles 
        ? 'No roles found. Use /users/bootstrap-admin to assign roles.'
        : decoded.roles 
        ? 'Roles found in custom claims. You should be able to access protected routes.'
        : 'Roles only in Firestore. Logout and login again to load them.'
    });
  } catch (e) { return next(e); }
});

// Inicializa rol por defecto estudiante
router.post("/bootstrap", async (req, res, next) => {
  try {
    const r = await service.ensureStudent(req.user.uid);
    return res.json(r);
  } catch (e) { return next(e); }
});

// Elevar a tutor con código de 4 dígitos
const tutorSchema = z.object({
  code: z.string().regex(/^\d{4}$/, {message: "code debe tener exactamente 4 dígitos"}),
});
router.post("/upgrade-to-tutor", async (req, res, next) => {
  try {
    const {code} = tutorSchema.parse(req.body);
    const r = await service.upgradeToTutor(req.user.uid, code);
    return res.json(r);
  } catch (e) { return next(e); }
});

// Solo gestor: asignar o quitar rol gestor
const roleSchema = z.object({uid: z.string(), makeManager: z.boolean()});
router.post("/set-manager", authMiddleware, requireRoles("manager"), async (req, res, next) => {
  try {
    const {uid, makeManager} = roleSchema.parse(req.body);
    const r = await service.setManager(uid, makeManager);
    return res.json(r);
  } catch (e) { return next(e); }
});

module.exports = router;