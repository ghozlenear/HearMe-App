// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAX3gvrki7hMrunkjkiIfV08Oeq50jibdA",
  authDomain: "hearme-patient.firebaseapp.com",
  projectId: "hearme-patient",
  storageBucket: "hearme-patient.firebasestorage.app",
  messagingSenderId: "878261829318",
  appId: "1:878261829318:web:c1115521809512761261c7",
  measurementId: "G-Z2WV408EB9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);