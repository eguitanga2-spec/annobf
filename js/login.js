import { auth } from './firebase.js';
import { 
    signInWithEmailAndPassword, 
    setPersistence, 
    browserLocalPersistence 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const form = document.getElementById('login-form');
const errorMsg = document.getElementById('error-message');
const btnSubmit = document.getElementById('btn-submit');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMsg.innerText = '';

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    btnSubmit.disabled = true;
    btnSubmit.innerText = "Connexion...";

    try {
        // Persistance automatique
        await setPersistence(auth, browserLocalPersistence);
        await signInWithEmailAndPassword(auth, email, password);
        window.location.href = "messages.html";
    } catch (error) {
        btnSubmit.disabled = false;
        btnSubmit.innerText = "Se connecter";
        errorMsg.innerText = "Email ou mot de passe incorrect.";
    }
});
