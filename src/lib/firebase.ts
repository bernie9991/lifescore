import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCjk8AiItEReTsYafqyOxIV9am2TmBmwXc",
  authDomain: "lifescore-8cccd.firebaseapp.com",
  projectId: "lifescore-8cccd",
  storageBucket: "lifescore-8cccd.firebasestorage.app",
  messagingSenderId: "555436415279",
  appId: "1:555436415279:web:9151b957c65b094f64a9da",
  measurementId: "G-S2NLXW95PC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;