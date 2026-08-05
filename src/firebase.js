import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCk_ajrktwPSpe1nE_JokXwkSIgcfPZYMI",
  authDomain: "habit-tracker-abcd0.firebaseapp.com",
  projectId: "habit-tracker-abcd0",
  storageBucket: "habit-tracker-abcd0.firebasestorage.app",
  messagingSenderId: "266865895677",
  appId: "1:266865895677:web:7f66f0e67cb8c8311d7694",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
