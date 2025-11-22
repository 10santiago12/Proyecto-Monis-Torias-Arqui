// Script para verificar roles de usuario en Firestore
// Ejecutar con: node verify-user-roles.js

const admin = require('firebase-admin');

// Inicializar Firebase Admin
admin.initializeApp();

const db = admin.firestore();

async function checkUserRoles(email) {
  try {
    console.log(`\n🔍 Buscando usuario: ${email}\n`);
    
    // Obtener usuario por email
    const userRecord = await admin.auth().getUserByEmail(email);
    console.log('✅ Usuario encontrado en Authentication:');
    console.log(`   - UID: ${userRecord.uid}`);
    console.log(`   - Email: ${userRecord.email}`);
    console.log(`   - Custom Claims:`, userRecord.customClaims || 'ninguno');
    
    // Verificar documento en user_roles
    console.log(`\n🔍 Verificando colección user_roles...\n`);
    const rolesDoc = await db.collection('user_roles').doc(userRecord.uid).get();
    
    if (rolesDoc.exists) {
      console.log('✅ Documento user_roles encontrado:');
      console.log('   Roles:', rolesDoc.data());
    } else {
      console.log('❌ NO existe documento en user_roles para este usuario');
      console.log('   Esto causará el error 403 Forbidden');
      console.log('\n💡 Solución: Crear el documento con:');
      console.log(`   db.collection('user_roles').doc('${userRecord.uid}').set({ manager: true })`);
    }
    
    // Verificar documento en users
    console.log(`\n🔍 Verificando colección users...\n`);
    const userDoc = await db.collection('users').doc(userRecord.uid).get();
    
    if (userDoc.exists) {
      console.log('✅ Documento users encontrado:');
      console.log('   Datos:', userDoc.data());
    } else {
      console.log('⚠️  NO existe documento en users (esto es opcional)');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Cambiar este email por el del admin que está teniendo problemas
const emailToCheck = process.argv[2] || 'admin@unisabana.edu.co';

checkUserRoles(emailToCheck);
