// js/firebase.js

// Importation des SDKs Firebase v10 via CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

// Votre configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDmccoCQkRFUv6kBHmUKkFpucw00okia5k",
  authDomain: "annon-bf.firebaseapp.com",
  projectId: "annon-bf",
  storageBucket: "annon-bf.firebasestorage.app",
  messagingSenderId: "895903777978",
  appId: "1:895903777978:web:df906df5ffe0cff9876e83"
};

// Initialisation de Firebase
const app = initializeApp(firebaseConfig);

// Exportation des services pour les utiliser dans register.js, login.js, etc.
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
