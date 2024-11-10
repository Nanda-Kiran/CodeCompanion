// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDoz7Sk95LbvNMJFQLQlQuzGij3j_ePQcM",
    authDomain: "hackumass-2266d.firebaseapp.com",
    projectId: "hackumass-2266d",
    storageBucket: "hackumass-2266d.firebasestorage.app",
    messagingSenderId: "1008411858233",
    appId: "1:1008411858233:web:85637f1dee9fac610b04e8"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
