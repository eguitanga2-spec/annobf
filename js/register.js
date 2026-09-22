import { auth, db } from './firebase.js';
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, setDoc, getDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const form = document.getElementById('register-form');
const errorMsg = document.getElementById('error-message');
const btnSubmit = document.getElementById('btn-submit');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMsg.innerText = '';

    const username = document.getElementById('username').value.trim().toLowerCase();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
        errorMsg.innerText = "Le nom d'utilisateur ne doit contenir que des lettres, chiffres et underscore (_).";
        return;
    }

    btnSubmit.disabled = true;
    btnSubmit.innerText = "Création en cours...";

    try {
        // 1. Vérifier si le pseudo existe déjà
        const userRef = doc(db, "usernames", username);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            throw new Error("Ce nom d'utilisateur est déjà pris !");
        }

        // 2. Créer l'utilisateur dans Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 3. Sauvegarder l'utilisateur
        await setDoc(doc(db, "users", user.uid), {
            username: username,
            email: email,
            createdAt: serverTimestamp()
        });

        // 4. Réserver le nom d'utilisateur
        await setDoc(doc(db, "usernames", username), {
            uid: user.uid
        });

        window.location.href = "messages.html";

    } catch (error) {
        btnSubmit.disabled = false;
        btnSubmit.innerText = "Créer mon lien";
        errorMsg.innerText = error.message;
    }
});
