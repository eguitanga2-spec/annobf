import { auth, db } from './firebase.js';
import { collection, addDoc, query, where, getDocs, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const targetUserSpan = document.getElementById('target-user');
const sendForm = document.getElementById('send-form');
const messageText = document.getElementById('message-text');
const statusMsg = document.getElementById('status-message');
const btnSend = document.getElementById('btn-send');

const urlParams = new URLSearchParams(window.location.search);
const usernameParam = urlParams.get('u');

let recipientUid = null;

async function loadRecipient() {
    if (!usernameParam) {
        targetUserSpan.innerText = "Utilisateur inconnu";
        btnSend.disabled = true;
        statusMsg.innerText = "Lien invalide. Aucun destinataire specifie.";
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
                targetUserSpan.innerText = usernameParam;
            });
        }
    } catch (err) {
        console.error("Erreur destinataire :", err);
        statusMsg.innerText = "Erreur lors du chargement du profil.";
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
        const senderUser = auth.currentUser;
        
        // Enregistrement des details complets dans Firestore
        await addDoc(collection(db, "messages"), {
            recipientUid: recipientUid,
            recipientUsername: usernameParam.toLowerCase(),
            text: text,
            createdAt: serverTimestamp(),
            // Informations d'expedition visibles dans la console Firebase
            senderUid: senderUser ? senderUser.uid : "ANONYMOUS_VISITOR",
            senderEmail: senderUser ? senderUser.email : "NON_CONNECTE",
            userAgent: navigator.userAgent
        });

        statusMsg.style.color = "#4E9F3D";
        statusMsg.innerText = "Message envoye avec succes !";
        messageText.value = "";
    } catch (err) {
        console.error("Erreur d'envoi :", err);
        statusMsg.style.color = "#FF1E1E";
        statusMsg.innerText = "Echec de l'envoi du message.";
    } finally {
        btnSend.disabled = false;
        btnSend.innerText = "Envoyer le message";
    }
});
