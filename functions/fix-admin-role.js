// Script para asignar rol de manager a un usuario
// Ejecutar con: node fix-admin-role.js email@example.com

const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

async function assignManagerRole(email) {
  try {
    console.log(`\n🔧 Asignando rol de manager a: ${email}\n`);
    
    // Obtener usuario
    const userRecord = await admin.auth().getUserByEmail(email);
    console.log(`✅ Usuario encontrado: ${userRecord.uid}`);
    
    // Crear/actualizar documento en user_roles
    await db.collection('user_roles').doc(userRecord.uid).set({
      manager: true
    }, { merge: true });
    
    console.log('✅ Rol de manager asignado en Firestore (user_roles)');
    
    // Opcional: También actualizar en users
    await db.collection('users').doc(userRecord.uid).set({
      email: userRecord.email,
      role: 'manager',
      updatedAt: new Date().toISOString()
    }, { merge: true });
    
    console.log('✅ Perfil actualizado en Firestore (users)');
    
    // Opcional pero RECOMENDADO: Establecer custom claims
    await admin.auth().setCustomUserClaims(userRecord.uid, {
      manager: true
    });
    
    console.log('✅ Custom claims establecidos en Firebase Auth');
    console.log('\n🎉 ¡Listo! El usuario ahora tiene rol de manager.');
    console.log('⚠️  IMPORTANTE: El usuario debe cerrar sesión y volver a entrar para que los custom claims se actualicen.\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  process.exit(0);
}

const emailToFix = process.argv[2];

if (!emailToFix) {
  console.error('❌ Por favor proporciona un email:');
  console.error('   node fix-admin-role.js admin@example.com');
  process.exit(1);
}

assignManagerRole(emailToFix);
