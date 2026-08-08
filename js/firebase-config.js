// ============================================================
// FIREBASE CONFIGURATION
// ------------------------------------------------------------
// 1. Go to https://console.firebase.google.com
// 2. Create a project (or use an existing one)
// 3. Project Settings -> General -> "Your apps" -> Add a Web App
// 4. Copy the config object Firebase gives you and paste the
//    values below, replacing the placeholders.
// 5. In the Firebase console, go to Build -> Authentication ->
//    Sign-in method -> enable "Email/Password".
// ============================================================

// Import the functions you need from the SDKs you need
// import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration

// Initialize Firebase
// const app = initializeApp(firebaseConfig);

//---------------------------

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyA15eH2UMWXGObWnryI_j4PSuzqdnkbgPc",
  authDomain: "fitnessapp-35fc6.firebaseapp.com",
  projectId: "fitnessapp-35fc6",
  storageBucket: "fitnessapp-35fc6.firebasestorage.app",
  messagingSenderId: "301084302366",
  appId: "1:301084302366:web:a677e96a2380b825a1220f",
};
export const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
