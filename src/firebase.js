import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth"; // 1. Бул жерге Auth импортун коштук

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDIVTAfxWn6fSIeuoMfWAHiWpWetfaSxzk",
  authDomain: "material-5bde9.firebaseapp.com",
  projectId: "material-5bde9",
  storageBucket: "material-5bde9.firebasestorage.app",
  messagingSenderId: "280363702449",
  appId: "1:280363702449:web:205a20ce7e3fbcc1c8ea90",
  measurementId: "G-6MRTK3F8KS"
};

// Firebase'ди иштетүү
const app = initializeApp(firebaseConfig);

// Керектүү кызматтарды инициализациялоо
export const db = getFirestore(app);
export const auth = getAuth(app); // 2. Эми Auth кызматтын экспорттодук