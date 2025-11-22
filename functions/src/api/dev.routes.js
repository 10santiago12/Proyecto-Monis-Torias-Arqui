/**
 * Rutas de utilidad para desarrollo
 * NO EXPONER EN PRODUCCIÓN
 */
const express = require('express');
const { admin } = require('../firebase');

const router = express.Router();

// Endpoint para asignar rol de admin
router.post('/dev/set-admin-role', async (req, res, next) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email es requerido' });
    }

    // Buscar usuario por email
    const userRecord = await admin.auth().getUserByEmail(email);

    // Establecer custom claims
    await admin.auth().setCustomUserClaims(userRecord.uid, {
      roles: {
        manager: true,
        admin: true,
        tutor: true,
        student: true
      }
    });

    // También guardar en Firestore
    await admin.firestore().collection('user_roles').doc(userRecord.uid).set({
      manager: true,
      admin: true,
      tutor: true,
      student: true,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    return res.json({
      success: true,
      message: 'Roles asignados correctamente. El usuario debe hacer logout y login nuevamente.',
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        roles: { manager: true, admin: true, tutor: true, student: true }
      }
    });
  } catch (error) {
    return next(error);
  }
});

// Endpoint para verificar roles
router.get('/dev/check-roles/:email', async (req, res, next) => {
  try {
    const { email } = req.params;
    
    const userRecord = await admin.auth().getUserByEmail(email);
    const rolesDoc = await admin.firestore().collection('user_roles').doc(userRecord.uid).get();

    return res.json({
      uid: userRecord.uid,
      email: userRecord.email,
      customClaims: userRecord.customClaims || null,
      firestoreRoles: rolesDoc.exists ? rolesDoc.data() : null
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
