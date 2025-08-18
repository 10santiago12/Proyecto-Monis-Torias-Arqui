import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAoi-RSPB5DyCDpMtiwOj2_Ct-xb04Uev0",
  authDomain: "proyecto-arqui-2c418.firebaseapp.com",
  projectId: "proyecto-arqui-2c418",
  storageBucket: "proyecto-arqui-2c418.firebasestorage.app",
  messagingSenderId: "602101435480",
  appId: "1:602101435480:web:dcc7371020d12b9cb44e2d",
  measurementId: "G-3YXJQ552WE"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);