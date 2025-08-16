// Inicialización centralizada de Firebase Admin
const admin = require("firebase-admin");

// Evita "app already exists" en recargas/cold starts
if (admin.apps.length === 0) {
  admin.initializeApp(); // Usa credenciales del entorno de Cloud Functions
}

const db = admin.firestore();
const bucket = admin.storage().bucket();

module.exports = { admin, db, bucket };
