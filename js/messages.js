import { auth, db } from './firebase.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { collection, query, where, onSnapshot, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const messagesList = document.getElementById('messages-list');
const linkInput = document.getElementById('link-input');
const btnCopy = document.getElementById('btn-copy');
const btnLogout = document.getElementById('btn-logout');
const notifBadge = document.getElementById('notif-badge');
const selfSendLink = document.getElementById('self-send-link');
const userDisplayName = document.getElementById('user-display-name');
const canvas = document.getElementById('story-canvas');

let currentUserFullname = "";
let currentUsername = "";

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "login.html";
        return;
    }

    try {
        const userSnap = await getDoc(doc(db, "users", user.uid));
        
        if (userSnap.exists()) {
            const data = userSnap.data();
            currentUserFullname = data.fullname || data.username;
            currentUsername = data.username;
            
            userDisplayName.innerText = currentUserFullname;

            let baseUrl = window.location.origin + window.location.pathname;
            baseUrl = baseUrl.replace("messages.html", "");
            if (!baseUrl.endsWith("/")) baseUrl += "/";

            const sendUrl = `${baseUrl}send.html?u=${currentUsername}`;
            linkInput.value = sendUrl;
            selfSendLink.href = sendUrl;
        }
    } catch (err) {
        console.error("Erreur profil :", err);
    }

    // Écoute temps réel des messages
    const q = query(
        collection(db, "messages"),
        where("recipientUid", "==", user.uid)
    );

    onSnapshot(q, (snapshot) => {
        messagesList.innerHTML = "";
        let unreadCount = 0;

        if (snapshot.empty) {
            notifBadge.style.display = "none";
            messagesList.innerHTML = "<p style='color: rgba(255,255,255,0.6); font-size: 0.9em;'>Aucun message pour le moment. Partage ton lien !</p>";
            return;
        }

        const messages = [];
        snapshot.forEach((document) => {
            const data = document.data();
            if (!data.read) unreadCount++;
            messages.push({ id: document.id, ...data });
        });

        // Mise à jour du badge de notifications non lues
        if (unreadCount > 0) {
            notifBadge.innerText = `${unreadCount} nouveau(x)`;
            notifBadge.style.display = "inline-block";
        } else {
            notifBadge.style.display = "none";
        }

        messages.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

        messages.forEach((msg) => {
            const card = document.createElement('div');
            card.style.cssText = `
                background: ${msg.read ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.12)'};
                border: 1px solid ${msg.read ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.25)'};
                padding: 16px;
                border-radius: 14px;
                margin-bottom: 14px;
            `;

            card.onclick = async () => {
                if (!msg.read) {
                    await updateDoc(doc(db, "messages", msg.id), { read: true });
                }
            };

            const txt = document.createElement('p');
            txt.style.cssText = "margin: 0 0 10px 0; font-size: 1.05em; line-height: 1.4;";
            txt.innerText = `"${msg.text}"`;

            const actions = document.createElement('div');
            actions.className = "msg-actions";

            const btnWa = document.createElement('button');
            btnWa.className = "btn-wa";
            btnWa.innerText = "Répondre sur WhatsApp";
            btnWa.onclick = (e) => {
                e.stopPropagation();
                shareToWhatsApp(msg.text);
            };

            const btnDl = document.createElement('button');
            btnDl.className = "btn-dl";
            btnDl.innerText = "Télécharger l'Image Story";
            btnDl.onclick = (e) => {
                e.stopPropagation();
                generateStoryImage(msg.text);
            };

            actions.appendChild(btnWa);
            actions.appendChild(btnDl);
            card.appendChild(txt);
            card.appendChild(actions);
            messagesList.appendChild(card);
        });
    });
});

// Génération Image Story 1080x1920 Liquid Glass
function generateStoryImage(text) {
    const ctx = canvas.getContext('2d');

    // Fond Dégradé
    const grad = ctx.createLinearGradient(0, 0, 1080, 1920);
    grad.addColorStop(0, '#0f0c20');
    grad.addColorStop(0.5, '#15102a');
    grad.addColorStop(1, '#06040a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1080, 1920);

    // Boîte Liquid Glass Principale
    const boxX = 100, boxY = 560, boxW = 880, boxH = 800;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 3;
    
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxW, boxH, 40);
    ctx.fill();
    ctx.stroke();

    // En-tête
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 56px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('AnonBF', 540, 680);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '32px sans-serif';
    ctx.fillText(`Message anonyme pour ${currentUserFullname}`, 540, 740);

    // Ligne
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.beginPath();
    ctx.moveTo(200, 790);
    ctx.lineTo(880, 790);
    ctx.stroke();

    // Message
    ctx.fillStyle = '#ffffff';
    ctx.font = '40px sans-serif';
    
    const maxWidth = 760;
    const lineHeight = 55;
    const words = text.split(' ');
    let line = '';
    let y = 880;

    for (let n = 0; n < words.length; n++) {
        let testLine = line + words[n] + ' ';
        let metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
            ctx.fillText(line, 540, y);
            line = words[n] + ' ';
            y += lineHeight;
        } else {
            line = testLine;
        }
    }
    ctx.fillText(line, 540, y);

    // Pied de page
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '28px sans-serif';
    ctx.fillText('Pose-moi tes questions sur AnonBF', 540, 1300);

    // Téléchargement
    const link = document.createElement('a');
    link.download = `AnonBF_Story_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}

function shareToWhatsApp(text) {
    const shareText = encodeURIComponent(`" ${text} "\n\nEnvoyez-moi aussi des messages anonymes ici : ${linkInput.value}`);
    window.open(`https://api.whatsapp.com/send?text=${shareText}`, '_blank');
}

if (btnCopy) {
    btnCopy.addEventListener('click', () => {
        linkInput.select();
        navigator.clipboard.writeText(linkInput.value);
        btnCopy.innerText = "Copié !";
        setTimeout(() => btnCopy.innerText = "Copier", 2000);
    });
}

if (btnLogout) {
    btnLogout.addEventListener('click', () => signOut(auth));
}
