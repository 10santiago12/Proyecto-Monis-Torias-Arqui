/**
 * Script para verificar roles de un usuario
 * Uso: node scripts/check-user-roles.js <email>
 */

const admin = require('firebase-admin');

// Inicializar Firebase Admin con credenciales del proyecto
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      projectId: 'proyecto-arqui-2c418'
    });
  } catch (error) {
    console.log('⚠️  Usando credenciales por defecto');
    admin.initializeApp();
  }
}

async function checkUserRoles(email) {
  try {
    // Buscar usuario por email
    const userRecord = await admin.auth().getUserByEmail(email);
    console.log('\n📋 Información del Usuario:');
    console.log('─────────────────────────────');
    console.log(`Email: ${userRecord.email}`);
    console.log(`UID: ${userRecord.uid}`);
    console.log(`Display Name: ${userRecord.displayName || 'N/A'}`);
    console.log(`Creado: ${new Date(userRecord.metadata.creationTime).toLocaleString()}`);

    // Verificar custom claims
    console.log('\n🔐 Custom Claims (Firebase Auth):');
    console.log('─────────────────────────────');
    if (userRecord.customClaims && userRecord.customClaims.roles) {
      console.log(JSON.stringify(userRecord.customClaims.roles, null, 2));
    } else {
      console.log('⚠️  No hay custom claims de roles configurados');
    }

    // Verificar roles en Firestore
    console.log('\n💾 Roles en Firestore (user_roles):');
    console.log('─────────────────────────────');
    const rolesDoc = await admin.firestore().collection('user_roles').doc(userRecord.uid).get();
    if (rolesDoc.exists) {
      const data = rolesDoc.data();
      console.log(JSON.stringify(data, null, 2));
    } else {
      console.log('⚠️  No hay documento en user_roles collection');
    }

    // Resumen
    console.log('\n📊 Resumen de Roles:');
    console.log('─────────────────────────────');
    const claims = userRecord.customClaims?.roles || {};
    const dbRoles = rolesDoc.exists ? rolesDoc.data() : {};
    
    const allRoles = new Set([
      ...Object.keys(claims).filter(k => claims[k] === true),
      ...Object.keys(dbRoles).filter(k => dbRoles[k] === true && k !== 'updatedAt')
    ]);

    if (allRoles.size > 0) {
      console.log(`✅ Roles activos: ${Array.from(allRoles).join(', ')}`);
    } else {
      console.log('⚠️  El usuario NO tiene roles asignados');
      console.log('💡 Ejecuta: node scripts/set-admin-role.js ' + email);
    }

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

// Obtener email del argumento
const email = process.argv[2];

if (!email) {
  console.error('❌ Uso: node scripts/check-user-roles.js <email>');
  console.error('   Ejemplo: node scripts/check-user-roles.js admin@example.com');
  process.exit(1);
}

checkUserRoles(email);
