import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBBgiZ8n8A23CTxs5ceyFuACzVuHIRpiHE",
  authDomain: "sayniq-app.firebaseapp.com",
  projectId: "sayniq-app",
  storageBucket: "sayniq-app.firebasestorage.app",
  messagingSenderId: "368064021919",
  appId: "1:368064021919:android:a1a99b044f7fb5a5fa69aa"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
