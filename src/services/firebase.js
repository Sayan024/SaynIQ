import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBBgiZ8n8A23CTxs5ceyFuACzVuHIRpiHE",
  authDomain: "sayniq-app.firebaseapp.com",
  projectId: "sayniq-app",
  storageBucket: "sayniq-app.firebasestorage.app",
  messagingSenderId: "368064021919",
  appId: "1:368064021919:web:a1a99b044f7fb5a5fa69aa", // Note: Using a web format based on the project number
  measurementId: "G-XXXXXXXXXX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
// const analytics = getAnalytics(app);

export default app;
