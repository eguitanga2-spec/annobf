import { auth } from './firebase.js';
import { 
    signInWithEmailAndPassword, 
    setPersistence, 
    browserLocalPersistence, 
    browserSessionPersistence 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const form = document.getElementById('login-form');
const errorMsg = document.getElementById('error-message');
const btnSubmit = document.getElementById('btn-submit');
const rememberMe = document.getElementById('remember-me');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMsg.innerText = '';

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    btnSubmit.disabled = true;
    btnSubmit.innerText = "Connexion en cours...";

    try {
        const persistenceType = rememberMe.checked ? browserLocalPersistence : browserSessionPersistence;
        await setPersistence(auth, persistenceType);
        
        await signInWithEmailAndPassword(auth, email, password);
        window.location.href = "messages.html";
    } catch (error) {
        btnSubmit.disabled = false;
        btnSubmit.innerText = "Se connecter";
        
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            errorMsg.innerText = "Email ou mot de passe incorrect.";
        } else {
            errorMsg.innerText = error.message;
        }
    }
});
