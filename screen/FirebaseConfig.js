import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, onAuthStateChanged } from 'firebase/auth';
//import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
// import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'
import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBx9u44PzTUWorLe1hepijyzD6fHv3ZFKw",
  authDomain: "halalway-ef823.firebaseapp.com",
  projectId: "halalway-ef823",
  storageBucket: "halalway-ef823.appspot.com",
  messagingSenderId: "802806182982",
  appId: "1:802806182982:web:145deaed8e8212aec88647",
  measurementId: "G-N57G4PSKEC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

  // Initialize Auth
//const FIREBASE_AUTH = getAuth(app);
const FIREBASE_AUTH = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
})

// Initialize Firestore
const FIREBASE_DB = getFirestore(app);

// Initialize Storage
const FIREBASE_STORAGE = getStorage(app);

// Handle auth state changes
onAuthStateChanged(FIREBASE_AUTH, (user) => {
  if (user) {
    // User is signed in
    console.log('User is signed in:', user.uid);
  } else {
    // User is signed out
    console.log('User is signed out');
  }
});

export { app, FIREBASE_AUTH, FIREBASE_DB, FIREBASE_STORAGE };