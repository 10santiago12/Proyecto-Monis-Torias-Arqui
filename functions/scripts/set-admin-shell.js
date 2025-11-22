// Script para asignar rol de admin usando Firebase Admin SDK directamente
// Uso: node scripts/set-admin-shell.js

const admin = require('firebase-admin');

// Inicializar Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'proyecto-arqui-2c418'
  });
}

async function setAdminRole(email) {
  try {
    console.log('\nBuscando usuario:', email);
    const userRecord = await admin.auth().getUserByEmail(email);
    console.log('[OK] Usuario encontrado');
    console.log('    UID:', userRecord.uid);
    console.log('    Email:', userRecord.email);

    console.log('\nAsignando custom claims...');
    await admin.auth().setCustomUserClaims(userRecord.uid, {
      roles: {
        manager: true,
        admin: true,
        tutor: true,
        student: true
      }
    });
    console.log('[OK] Custom claims establecidos en Firebase Auth');

    console.log('\nGuardando en Firestore...');
    await admin.firestore().collection('user_roles').doc(userRecord.uid).set({
      manager: true,
      admin: true,
      tutor: true,
      student: true,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    console.log('[OK] Roles guardados en Firestore');

    console.log('\n[SUCCESS] Rol de admin asignado correctamente!');
    console.log('[!] IMPORTANTE: El usuario debe hacer logout y login nuevamente\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n[ERROR]', error.message);
    process.exit(1);
  }
}

// Obtener email del argumento o usar el default
const email = process.argv[2] || 'admin@gmail.com';
setAdminRole(email);
