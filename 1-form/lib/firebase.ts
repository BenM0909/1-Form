import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAOynljZxRBWBI5gAZET2Mmrdlk1hKa2hc",
  authDomain: "form-d9742.firebaseapp.com",
  projectId: "form-d9742",
  storageBucket: "form-d9742.firebasestorage.app",
  messagingSenderId: "43982469253",
  appId: "1:43982469253:web:2ac5d4eaa0433a14e911ec",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, googleProvider, storage };

