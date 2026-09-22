import { auth, db } from './firebase.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { collection, query, where, onSnapshot, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const messagesList = document.getElementById('messages-list');
const linkInput = document.getElementById('link-input');
const btnCopy = document.getElementById('btn-copy');
const btnLogout = document.getElementById('btn-logout');
const notifBadge = document.getElementById('notif-badge');
const selfSendLink = document.getElementById('self-send-link');
const canvas = document.getElementById('card-canvas');

let currentUsername = "";

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "login.html";
        return;
    }

    try {
        const userSnap = await getDoc(doc(db, "users", user.uid));
        
        if (userSnap.exists()) {
            currentUsername = userSnap.data().username;
            
            let baseUrl = window.location.origin + window.location.pathname;
            baseUrl = baseUrl.replace("messages.html", "");
            if (!baseUrl.endsWith("/")) {
                baseUrl += "/";
            }

            const sendUrl = `${baseUrl}send.html?u=${currentUsername}`;
            linkInput.value = sendUrl;
            selfSendLink.href = sendUrl;
        }
    } catch (err) {
        console.error("Erreur chargement profil :", err);
    }

    // Ecoute des messages recus
    const q = query(
        collection(db, "messages"),
        where("recipientUid", "==", user.uid)
    );

    onSnapshot(q, (snapshot) => {
        messagesList.innerHTML = "";
        
        if (snapshot.empty) {
            notifBadge.style.display = "none";
            messagesList.innerHTML = "<p style='color: #aaa; font-size: 0.9em;'>Aucun message pour le moment. Partagez votre lien !</p>";
            return;
        }

        notifBadge.innerText = snapshot.size;
        notifBadge.style.display = "inline-block";

        const messages = [];
        snapshot.forEach((doc) => messages.push({ id: doc.id, ...doc.data() }));
        messages.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

        messages.forEach((msg) => {
            const card = document.createElement('div');
            card.className = "message-card";
            card.style.cssText = "background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.15); padding: 15px; border-radius: 10px; margin-bottom: 12px;";
            
            const msgText = document.createElement('p');
            msgText.style.cssText = "margin: 0 0 12px 0; font-size: 1em; word-break: break-word;";
            msgText.innerText = `"${msg.text}"`;
            
            const actionsDiv = document.createElement('div');
            actionsDiv.style.cssText = "display: flex; justify-content: flex-end; gap: 10px;";
            
            const downloadBtn = document.createElement('button');
            downloadBtn.className = "btn-secondary";
            downloadBtn.style.cssText = "padding: 6px 12px; font-size: 0.8em; border-radius: 5px; cursor: pointer;";
            downloadBtn.innerText = "Telecharger l'image pour repondre";
            downloadBtn.onclick = () => generateAndDownloadImage(msg.text);

            actionsDiv.appendChild(downloadBtn);
            card.appendChild(msgText);
            card.appendChild(actionsDiv);
            messagesList.appendChild(card);
        });
    }, (error) => {
        console.error("Erreur Firestore messages :", error);
    });
});

// Generation de l'image de la carte sur HTML Canvas
function generateAndDownloadImage(text) {
    const ctx = canvas.getContext('2d');

    // Arriere-plan gradient moderne
    const grad = ctx.createLinearGradient(0, 0, 600, 600);
    grad.addColorStop(0, '#1a1a2e');
    grad.addColorStop(1, '#16213e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 600, 600);

    // Boite style Glassmorphism au centre
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    
    const boxX = 50, boxY = 100, boxW = 500, boxH = 400;
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxW, boxH, 20);
    ctx.fill();
    ctx.stroke();

    // En-tete "AnonBF"
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('AnonBF', 300, 160);

    // Sous-titre
    ctx.fillStyle = '#aaaaaa';
    ctx.font = '16px sans-serif';
    ctx.fillText(`Message anonyme pour @${currentUsername}`, 300, 195);

    // Ligne de separation
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.beginPath();
    ctx.moveTo(100, 220);
    ctx.lineTo(500, 220);
    ctx.stroke();

    // Texte du message avec retour a la ligne automatique
    ctx.fillStyle = '#ffffff';
    ctx.font = '22px sans-serif';
    
    const maxWidth = 420;
    const lineHeight = 30;
    const words = text.split(' ');
    let line = '';
    let y = 270;

    for (let n = 0; n < words.length; n++) {
        let testLine = line + words[n] + ' ';
        let metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
            ctx.fillText(line, 300, y);
            line = words[n] + ' ';
            y += lineHeight;
        } else {
            line = testLine;
        }
    }
    ctx.fillText(line, 300, y);

    // Pied de page
    ctx.fillStyle = '#888888';
    ctx.font = '14px sans-serif';
    ctx.fillText('Envoyez-moi vos messages anonymes sur AnonBF', 300, 460);

    // Telechargement de l'image au format PNG
    const link = document.createElement('a');
    link.download = `AnonBF_Message_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}

if (btnCopy) {
    btnCopy.addEventListener('click', () => {
        linkInput.select();
        navigator.clipboard.writeText(linkInput.value);
        btnCopy.innerText = "Copie !";
        setTimeout(() => btnCopy.innerText = "Copier", 2000);
    });
}

if (btnLogout) {
    btnLogout.addEventListener('click', () => signOut(auth));
}
