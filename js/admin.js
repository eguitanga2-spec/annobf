import { auth, db } from './firebase.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { collection, getDocs, query, orderBy, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const adminTable = document.getElementById('admin-table');

// Indiquez votre propre Email d'administrateur
const ADMIN_EMAIL = "votre-email-admin@gmail.com"; 

onAuthStateChanged(auth, async (user) => {
    if (!user || user.email !== ADMIN_EMAIL) {
        alert("Accès refusé. Réservé à l'administrateur.");
        window.location.href = "index.html";
        return;
    }

    try {
        const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);

        adminTable.innerHTML = "";
        snapshot.forEach((docSnap) => {
            const m = docSnap.data();
            const tr = document.createElement('tr');
            
            const dateStr = m.createdAt ? new Date(m.createdAt.seconds * 1000).toLocaleString('fr-FR') : 'Inconnue';
            
            tr.innerHTML = `
                <td>${dateStr}</td>
                <td>${m.senderEmail || 'ANONYME'} <br><small style="color:#aaa;">${m.senderUid}</small></td>
                <td>${m.recipientName || m.recipientUsername}</td>
                <td>"${m.text}"</td>
            `;
            adminTable.appendChild(tr);
        });
    } catch (err) {
        console.error("Erreur Admin :", err);
    }
});
