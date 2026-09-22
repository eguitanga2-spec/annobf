// Adresse email de l'administrateur
const ADMIN_EMAIL = "admin8@gmail.com"; // <-- REMPLACEZ PAR VOTRE VRAI EMAIL

// Vérification de la connexion et des droits d'accès
auth.onAuthStateChanged(async (user) => {
  if (!user) {
    // Si l'utilisateur n'est pas connecté, redirection vers login
    window.location.href = "login.html";
    return;
  }

  // Vérification de l'adresse email
  if (user.email !== ADMIN_EMAIL) {
    alert("Accès refusé : Vous n'avez pas les privilèges d'administrateur.");
    window.location.href = "messages.html";
    return;
  }

  // Chargement des messages si l'utilisateur est bien l'admin
  chargerTousLesMessages();
});

// Fonction pour récupérer et afficher tous les messages
async function chargerTousLesMessages() {
  const adminContainer = document.getElementById("admin-messages-list");
  if (!adminContainer) return;

  adminContainer.innerHTML = "<p>Chargement des messages en cours...</p>";

  try {
    const snapshot = await db.collection("messages")
      .orderBy("createdAt", "desc")
      .get();

    if (snapshot.empty) {
      adminContainer.innerHTML = "<p>Aucun message enregistré dans la base de données.</p>";
      return;
    }

    adminContainer.innerHTML = ""; // Vider le conteneur

    snapshot.forEach((doc) => {
      const msg = doc.data();
      const date = msg.createdAt ? new Date(msg.createdAt.toDate()).toLocaleString("fr-FR") : "Date inconnue";

      // Identification de l'expéditeur
      let senderInfo = "<strong>Anonyme (Visiteur non connecté)</strong>";
      if (msg.sender) {
        senderInfo = `
          <strong>Utilisateur connecté :</strong><br>
          • Nom : ${msg.sender.fullName || 'N/A'}<br>
          • Pseudo : @${msg.sender.username || 'N/A'}<br>
          • Email : ${msg.sender.email || 'N/A'}
        `;
      }

      const card = document.createElement("div");
      card.className = "admin-card";
      card.style.cssText = "background: rgba(255,255,255,0.1); border-radius: 12px; padding: 15px; margin-bottom: 15px; border: 1px solid rgba(255,255,255,0.2); backdrop-filter: blur(10px); color: #fff;";

      card.innerHTML = `
        <div style="font-size: 0.9em; opacity: 0.8; margin-bottom: 10px;">
          <span>📅 Date : ${date}</span> | <span>🎯 Pour : @${msg.recipientUsername || 'Inconnu'}</span>
        </div>
        <div style="background: rgba(0,0,0,0.2); padding: 10px; border-radius: 8px; margin-bottom: 10px;">
          <strong>Message :</strong>
          <p style="margin: 5px 0 0 0; font-size: 1.05em;">${msg.text}</p>
        </div>
        <div style="font-size: 0.85em; background: rgba(255,255,255,0.05); padding: 8px; border-radius: 6px;">
          <p style="margin: 0 0 5px 0;">🕵️ <strong>Traçabilité Expéditeur :</strong></p>
          ${senderInfo}
        </div>
      `;

      adminContainer.appendChild(card);
    });
  } catch (error) {
    console.error("Erreur lors du chargement admin :", error);
    adminContainer.innerHTML = "<p>Une erreur est survenue lors du chargement des données.</p>";
  }
}
