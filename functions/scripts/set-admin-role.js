/**
 * Script para asignar rol de manager/admin a un usuario
 * Uso: node scripts/set-admin-role.js <email>
 */

const admin = require('firebase-admin');
const path = require('path');

// Inicializar Firebase Admin con credenciales del proyecto
if (!admin.apps.length) {
  // Intenta usar las credenciales de la aplicación
  try {
    admin.initializeApp({
      projectId: 'proyecto-arqui-2c418'
    });
  } catch (error) {
    console.log('⚠️  Usando credenciales por defecto');
    admin.initializeApp();
  }
}

async function setAdminRole(email) {
  try {
    // Buscar usuario por email
    const userRecord = await admin.auth().getUserByEmail(email);
    console.log(`✅ Usuario encontrado: ${userRecord.email} (UID: ${userRecord.uid})`);

    // Establecer custom claims
    await admin.auth().setCustomUserClaims(userRecord.uid, {
      roles: {
        manager: true,
        admin: true
      }
    });
    console.log('✅ Custom claims establecidos en Firebase Auth');

    // También guardar en Firestore como respaldo
    await admin.firestore().collection('user_roles').doc(userRecord.uid).set({
      manager: true,
      admin: true,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    console.log('✅ Roles guardados en Firestore (user_roles collection)');

    console.log('\n🎉 Rol de admin/manager asignado correctamente!');
    console.log('⚠️  IMPORTANTE: El usuario debe hacer logout y login nuevamente para que los cambios surtan efecto.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Obtener email del argumento
const email = process.argv[2];

if (!email) {
  console.error('❌ Uso: node scripts/set-admin-role.js <email>');
  console.error('   Ejemplo: node scripts/set-admin-role.js admin@example.com');
  process.exit(1);
}

setAdminRole(email);
