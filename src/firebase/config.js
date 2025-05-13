// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC814vt6WONggJp40WFC5DLeMcSV3CorEY",
  authDomain: "split50-1c472.firebaseapp.com",
  projectId: "split50-1c472",
  storageBucket: "split50-1c472.firebasestorage.app",
  messagingSenderId: "599168593054",
  appId: "1:599168593054:web:1063461f0481b7d2c41f8f",
  measurementId: "G-DDVW7F1MG5",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
