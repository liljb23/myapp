// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBqsgK25wY27ZGD0CDwV5nfGDqso00LSWQ",
  authDomain: "halalway-ef823.firebaseapp.com",
  projectId: "halalway-ef823",
  storageBucket: "halalway-ef823.firebasestorage.app",
  messagingSenderId: "802806182982",
  appId: "1:802806182982:web:145deaed8e8212aec88647",
  measurementId: "G-N57G4PSKEC"
};

const FIREBASE_APP = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export { FIREBASE_APP };
export const FIREBASE_AUTH = getAuth(FIREBASE_APP);
export const FIREBASE_DB = getFirestore(FIREBASE_APP);
export const FIREBASE_STORAGE = getStorage(FIREBASE_APP);