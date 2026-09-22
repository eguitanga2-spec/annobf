import { auth, db } from './firebase.js';
import { 
    createUserWithEmailAndPassword, 
    setPersistence, 
    browserLocalPersistence 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, setDoc, getDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const form = document.getElementById('register-form');
const errorMsg = document.getElementById('error-message');
const btnSubmit = document.getElementById('btn-submit');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMsg.innerText = '';

    const fullname = document.getElementById('fullname').value.trim();
    const username = document.getElementById('username').value.trim().toLowerCase();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
        errorMsg.innerText = "Le pseudo ne doit contenir que des lettres, chiffres et underscore (_).";
        return;
    }

    btnSubmit.disabled = true;
    btnSubmit.innerText = "Création en cours...";

    try {
        // Se souvenir de moi automatique (Obligatoire)
        await setPersistence(auth, browserLocalPersistence);

        // Vérification disponibilité du pseudo
        const userRef = doc(db, "usernames", username);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            throw new Error("Ce pseudo est déjà pris. Choisissez-en un autre.");
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Stockage des infos utilisateur (Nom, Prénom, Username)
        await setDoc(doc(db, "users", user.uid), {
            fullname: fullname,
            username: username,
            email: email,
            role: "user",
            createdAt: serverTimestamp()
        });

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
