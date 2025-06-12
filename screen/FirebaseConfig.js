// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from 'firebase/storage';

// import { getAnalytics } from "firebase/analytics"; // Uncomment if you need Analytics

// Your web app's Firebase configuration
// For Firebase JS SDK v7.w20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBqsgK25wY27ZGD0CDwV5nfGDqso00LSWQ",
  authDomain: "halalway-ef823.firebaseapp.com",
  projectId: "halalway-ef823",
  storageBucket: "halalway-ef823.appspot.com",
  messagingSenderId: "802806182982",
  appId: "1:802806182982:web:145deaed8e8212aec88647",
  measurementId: "G-N57G4PSKEC"
};

// Initialize Firebase App once and export all services
export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = getAuth(FIREBASE_APP);
export const FIREBASE_DB = getFirestore(FIREBASE_APP);
export const FIREBASE_STORAGE = getStorage(FIREBASE_APP);

// const analytics = getAnalytics(app);
