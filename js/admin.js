// Identifiants Administrateur prédéfinis
const ADMIN_EMAIL = "eguitanga8@gmail.com";
const ADMIN_PASS = "Gedy2005.";

document.addEventListener("DOMContentLoaded", () => {
  const loginSection = document.getElementById("admin-login-section");
  const dashboardSection = document.getElementById("admin-dashboard-section");
  const loginForm = document.getElementById("admin-login-form");
  const logoutBtn = document.getElementById("admin-logout-btn");

  // Vérification de la session admin active (via sessionStorage)
  if (sessionStorage.getItem("isAdminLoggedIn") === "true") {
    loginSection.style.display = "none";
    dashboardSection.style.display = "block";
    chargerTousLesMessages();
  } else {
    loginSection.style.display = "block";
    dashboardSection.style.display = "none";
  }

  // Soumission du formulaire de connexion admin
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("admin-email").value.trim();
      const pass = document.getElementById("admin-pass").value;

      if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase() && pass === ADMIN_PASS) {
        sessionStorage.setItem("isAdminLoggedIn", "true");
        loginSection.style.display = "none";
        dashboardSection.style.display = "block";
        chargerTousLesMessages();
      } else {
        alert("Identifiants Administrateur incorrects !");
      }
    });
  }

  // Déconnexion de la session admin
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      sessionStorage.removeItem("isAdminLoggedIn");
      location.reload();
    });
  }
});

// Fonction pour récupérer tous les messages depuis Firestore
async function chargerTousLesMessages() {
  const adminContainer = document.getElementById("admin-messages-list");
  if (!adminContainer) return;

  adminContainer.innerHTML = "<p style='color: #fff;'>Chargement des messages en cours...</p>";

  try {
    const snapshot = await db.collection("messages")
      .orderBy("createdAt", "desc")
      .get();

    if (snapshot.empty) {
      adminContainer.innerHTML = "<p style='color: #fff;'>Aucun message trouvé dans la base de données.</p>";
      return;
    }

    adminContainer.innerHTML = ""; // Vider le conteneur

    snapshot.forEach((doc) => {
      const msg = doc.data();
      const date = msg.createdAt ? new Date(msg.createdAt.toDate()).toLocaleString("fr-FR") : "Date inconnue";

      // Identification de l'expéditeur
      let senderInfo = "<span style='color: #ff9800;'>Anonyme (Visiteur non connecté)</span>";
      if (msg.sender) {
        senderInfo = `
          <div style="margin-top: 5px; color: #4caf50;">
            • <strong>Nom :</strong> ${msg.sender.fullName || 'N/A'}<br>
            • <strong>Pseudo :</strong> @${msg.sender.username || 'N/A'}<br>
            • <strong>Email :</strong> ${msg.sender.email || 'N/A'}
          </div>
        `;
      }

      const card = document.createElement("div");
      card.style.cssText = "background: rgba(255,255,255,0.1); border-radius: 12px; padding: 15px; margin-bottom: 15px; border: 1px solid rgba(255,255,255,0.2); backdrop-filter: blur(10px); color: #fff;";

      card.innerHTML = `
        <div style="font-size: 0.85em; opacity: 0.8; margin-bottom: 10px; display: flex; justify-content: space-between;">
          <span>📅 Date : ${date}</span>
          <span>🎯 Pour : <strong>@${msg.recipientUsername || 'Inconnu'}</strong></span>
        </div>
        <div style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 8px; margin-bottom: 10px;">
          <strong style="color: #00d2ff;">Message :</strong>
          <p style="margin: 5px 0 0 0; font-size: 1.05em; line-height: 1.4;">${msg.text}</p>
        </div>
        <div style="font-size: 0.85em; background: rgba(0,0,0,0.2); padding: 10px; border-radius: 6px;">
          🕵️ <strong>Traçabilité Expéditeur :</strong>
          ${senderInfo}
        </div>
      `;

      adminContainer.appendChild(card);
    });
  } catch (error) {
    console.error("Erreur lors du chargement des messages :", error);
    adminContainer.innerHTML = "<p style='color: #f44336;'>Erreur de chargement. Assurez-vous d'avoir configuré Firestore correctement.</p>";
  }
}
