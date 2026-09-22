import { auth, db } from './firebase.js';
import { collection, addDoc, query, where, getDocs, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const targetUserSpan = document.getElementById('target-user');
const senderStatus = document.getElementById('sender-status');
const sendForm = document.getElementById('send-form');
const messageText = document.getElementById('message-text');
const statusMsg = document.getElementById('status-message');
const btnSend = document.getElementById('btn-send');

const urlParams = new URLSearchParams(window.location.search);
const usernameParam = urlParams.get('u');

let recipientUid = null;
let recipientName = "";
let currentUser = null;

onAuthStateChanged(auth, (user) => {
    currentUser = user;
    if (user) {
        senderStatus.innerHTML = `Connecté en tant que <strong>${user.email}</strong>. Ton message reste anonyme pour le destinataire.`;
    } else {
        senderStatus.innerHTML = `Envoyer en visiteur anonyme ou <a href="register.html" class="link">créer un compte</a>.`;
    }
});

async function loadRecipient() {
    if (!usernameParam) {
        targetUserSpan.innerText = "Utilisateur inconnu";
        btnSend.disabled = true;
        statusMsg.innerText = "Lien invalide.";
        return;
    }

    try {
        const q = query(collection(db, "users"), where("username", "==", usernameParam.toLowerCase()));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            targetUserSpan.innerText = "Inconnu";
            btnSend.disabled = true;
            statusMsg.innerText = "Cet utilisateur n'existe pas.";
        } else {
            querySnapshot.forEach((doc) => {
                recipientUid = doc.id;
                const data = doc.data();
                recipientName = data.fullname || data.username;
                targetUserSpan.innerText = recipientName;
            });
        }
    } catch (err) {
        console.error("Erreur destinataire :", err);
    }
}

loadRecipient();

sendForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!recipientUid) return;

    const text = messageText.value.trim();
    if (!text) return;

    btnSend.disabled = true;
    btnSend.innerText = "Envoi en cours...";

    try {
        await addDoc(collection(db, "messages"), {
            recipientUid: recipientUid,
            recipientName: recipientName,
            recipientUsername: usernameParam.toLowerCase(),
            text: text,
            read: false,
            createdAt: serverTimestamp(),
            // Traçabilité administrateur / sécurité
            senderUid: currentUser ? currentUser.uid : "ANONYME_VISITEUR",
            senderEmail: currentUser ? currentUser.email : "NON_CONNECTE",
            userAgent: navigator.userAgent
        });

        statusMsg.style.color = "#4E9F3D";
        statusMsg.innerText = "Message envoyé avec succès !";
        messageText.value = "";
    } catch (err) {
        console.error("Erreur d'envoi :", err);
        statusMsg.style.color = "#FF1E1E";
        statusMsg.innerText = "Échec de l'envoi.";
    } finally {
        btnSend.disabled = false;
        btnSend.innerText = "Envoyer le message";
    }
});
