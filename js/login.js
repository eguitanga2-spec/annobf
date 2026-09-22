import { auth } from './firebase.js';
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const form = document.getElementById('login-form');
const errorMsg = document.getElementById('error-message');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMsg.innerText = '';

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    try {
        await signInWithEmailAndPassword(auth, email, password);
        window.location.href = "messages.html";
    } catch (error) {
        errorMsg.innerText = "Email ou mot de passe incorrect.";
    }
});
