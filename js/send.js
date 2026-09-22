import { db } from './firebase.js';
import { collection, addDoc, doc, getDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const urlParams = new URLSearchParams(window.location.search);
const targetUsername = urlParams.get('u');

const targetUserEl = document.getElementById('target-user');
const form = document.getElementById('send-form');
const errorMsg = document.getElementById('error-message');

let targetUid = null;

async function init() {
    if (!targetUsername) {
        targetUserEl.innerText = "Utilisateur inconnu";
        return;
    }
    targetUserEl.innerText = "@" + targetUsername;

    const userSnap = await getDoc(doc(db, "usernames", targetUsername.toLowerCase()));
    if (userSnap.exists()) {
        targetUid = userSnap.data().uid;
    } else {
        errorMsg.innerText = "Cet utilisateur n'existe pas.";
    }
}
init();

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!targetUid) return;

    const text = document.getElementById('message-text').value.trim();
    if (!text) return;

    const btnSend = document.getElementById('btn-send');
    btnSend.disabled = true;
    btnSend.innerText = "Envoi...";

    try {
        await addDoc(collection(db, "messages"), {
            recipientUid: targetUid,
            text: text,
            createdAt: serverTimestamp()
        });

        alert("💜 Message envoyé anonymement !");
        document.getElementById('message-text').value = "";
        btnSend.disabled = false;
        btnSend.innerText = "Envoyer ➤";

    } catch (err) {
        errorMsg.innerText = "Erreur lors de l'envoi.";
        btnSend.disabled = false;
        btnSend.innerText = "Envoyer ➤";
    }
});
