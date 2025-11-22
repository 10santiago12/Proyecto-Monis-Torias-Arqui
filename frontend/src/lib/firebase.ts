import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserSessionPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configuración de Firebase usando variables de entorno
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Validación de configuración en desarrollo
if (import.meta.env.DEV) {
  const requiredEnvVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID'
  ];
  
  const missingVars = requiredEnvVars.filter(varName => !import.meta.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ Faltan variables de entorno de Firebase:', missingVars.join(', '));
    console.error('💡 Copia .env.example a .env y configura tus credenciales');
  }
}

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

// Configurar persistencia de sesión
// Opciones:
// - browserLocalPersistence: La sesión persiste incluso después de cerrar el navegador (DEFAULT)
// - browserSessionPersistence: La sesión se borra al cerrar la pestaña/navegador
// - inMemoryPersistence: No persiste, solo en memoria (no recomendado)

// Cambiar a SESSION si quieres que la sesión expire al cerrar el navegador
const persistence = import.meta.env.VITE_SESSION_PERSISTENCE === 'session' 
  ? browserSessionPersistence 
  : browserLocalPersistence;

setPersistence(auth, persistence).catch((error) => {
  console.error('Error setting auth persistence:', error);
});