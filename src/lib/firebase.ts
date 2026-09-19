import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
  projectId: "blogsemantico-1750525854725",
  appId: "1:316925929262:web:1f4d835826f372adedbcbf",
  apiKey: "AIzaSyAQjotsajjDNUBqQmgWRMhyJ5ppnVTygEs",
  authDomain: "blogsemantico-1750525854725.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-geradordetaxonom-9ccf350a-1dee-4548-affa-c62b2cae811f",
  storageBucket: "blogsemantico-1750525854725.firebasestorage.app",
  messagingSenderId: "316925929262",
  measurementId: "",
  oAuthClientId: "316925929262-o9j98tseq5n94reiscv0g4pqrkpj0ngh.apps.googleusercontent.com",
};

export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
