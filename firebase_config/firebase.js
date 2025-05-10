// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAX3gvrki7hMrunkjkiIfV08Oeq50jibdA",
  authDomain: "hearme-patient.firebaseapp.com",
  projectId: "hearme-patient",
  storageBucket: "hearme-patient.firebasestorage.app",
  messagingSenderId: "878261829318",
  appId: "1:878261829318:web:c1115521809512761261c7",
  measurementId: "G-Z2WV408EB9"
};



const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { firebaseConfig, auth };