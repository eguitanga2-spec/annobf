import { auth, db } from './firebase.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { collection, query, where, onSnapshot, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const messagesList = document.getElementById('messages-list');
const linkInput = document.getElementById('link-input');
const btnCopy = document.getElementById('btn-copy');
const btnLogout = document.getElementById('btn-logout');
const notifBadge = document.getElementById('notif-badge');

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "login.html";
        return;
    }

    try {
        // Récupérer le nom d'utilisateur
        const userSnap = await getDoc(doc(db, "users", user.uid));
        if (userSnap.exists()) {
            const username = userSnap.data().username;
            linkInput.value = `${window.location.origin}/send.html?u=${username}`;
        }
    } catch (err) {
        console.error("Erreur profil :", err);
    }

    // Écoute des messages (simplifiée sans orderBy pour éviter le crash au démarrage)
    const q = query(
        collection(db, "messages"),
        where("recipientUid", "==", user.uid)
    );

    onSnapshot(q, (snapshot) => {
        messagesList.innerHTML = "";
        
        if (snapshot.empty) {
            notifBadge.style.display = "none";
            messagesList.innerHTML = "<p style='color: #4a4e69;'>Aucun message pour le moment... 🤫 Partage ton lien !</p>";
            return;
        }

        notifBadge.innerText = snapshot.size;
        notifBadge.style.display = "inline-block";

        // Tri des messages côté JavaScript pour éviter les erreurs d'index Firestore
        const messages = [];
        snapshot.forEach((doc) => messages.push(doc.data()));
        messages.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

        messages.forEach((msg) => {
            const card = document.createElement('div');
            card.className = "message-card";
            card.innerHTML = `<p>"${msg.text}"</p>`;
            messagesList.appendChild(card);
        });
    }, (error) => {
        console.error("Erreur Firestore messages :", error);
    });
});

if (btnCopy) {
    btnCopy.addEventListener('click', () => {
        linkInput.select();
        navigator.clipboard.writeText(linkInput.value);
        btnCopy.innerText = "✅ Copié !";
        setTimeout(() => btnCopy.innerText = "📋 Copier mon lien", 2000);
    });
}

if (btnLogout) {
    btnLogout.addEventListener('click', () => signOut(auth));
}
