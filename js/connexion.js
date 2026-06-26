document.addEventListener('DOMContentLoaded', async () => {
    // Vérification initiale : redirection vers l'espace client si déjà connecté
    try {
        const reponseSession = await fetch(URL_API + 'session_client.php', {
            method: 'GET',
            credentials: 'include'
        });
        if (reponseSession.ok) {
            window.location.replace('espaceclient.html');
            return;
        }
    } catch (erreur) {
        // Poursuite normale en cas d'erreur réseau
    }

    const formulaireInscription = document.getElementById('formulaire-inscription');
    const formulaireConnexion   = document.getElementById('formulaire-connexion');

    // Gestion du formulaire d'inscription
    if (formulaireInscription) {
        formulaireInscription.addEventListener('submit', async (e) => {
            e.preventDefault();

            const zoneReponse = document.getElementById('inscription-reponse');
            zoneReponse.className = "mt-4 alert alert-info text-center";
            zoneReponse.textContent = "Création du compte en cours...";
            zoneReponse.classList.remove('d-none');

            const donneesInscription = {
                nom:          document.getElementById('insc-nom').value,
                email:        document.getElementById('insc-email').value,
                telephone:    document.getElementById('insc-telephone').value,
                mot_de_passe: document.getElementById('insc-mot-de-passe').value
            };

            try {
                const reponse = await fetch(URL_API + 'inscription.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json; charset=UTF-8' },
                    body: JSON.stringify(donneesInscription)
                });

                const resultat = await reponse.json();

                if (reponse.ok) {
                    zoneReponse.className = "mt-4 alert alert-success text-center";
                    zoneReponse.textContent = resultat.succes || "Votre compte a été créé avec succès.";
                    formulaireInscription.reset();
                    setTimeout(() => zoneReponse.classList.add('d-none'), 3000);
                } else {
                    zoneReponse.className = "mt-4 alert alert-danger text-center";
                    zoneReponse.textContent = resultat.erreur || "Une erreur est survenue lors de l'inscription.";
                }
            } catch (erreur) {
                zoneReponse.className = "mt-4 alert alert-danger text-center";
                zoneReponse.textContent = "Impossible de joindre le serveur d'authentification pour le moment.";
            }
        });
    }

    // Gestion du formulaire de connexion
    if (formulaireConnexion) {
        formulaireConnexion.addEventListener('submit', async (e) => {
            e.preventDefault();

            const zoneReponseConnexion = document.getElementById('connexion-reponse');
            zoneReponseConnexion.className = "mt-4 alert alert-info text-center";
            zoneReponseConnexion.textContent = "Vérification des identifiants...";
            zoneReponseConnexion.classList.remove('d-none');

            const donneesConnexion = {
                email:        document.getElementById('conn-email').value,
                mot_de_passe: document.getElementById('conn-mot-de-passe').value
            };

            try {
                const reponse = await fetch(URL_API + 'connexion_client.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json; charset=UTF-8' },
                    body: JSON.stringify(donneesConnexion),
                    credentials: 'include'
                });

                const statutOk = reponse.ok;
                const resultat = await reponse.json();

                if (statutOk) {
                    zoneReponseConnexion.className = "mt-4 alert alert-success text-center";
                    zoneReponseConnexion.textContent = resultat.succes || "Connexion réussie.";
                    sessionStorage.setItem('utilisateur_nom', resultat.utilisateur.nom);
                    window.location.replace('espaceclient.html');
                } else {
                    zoneReponseConnexion.className = "mt-4 alert alert-danger text-center";
                    zoneReponseConnexion.textContent = resultat.erreur || "Identifiants invalides.";
                }
            } catch (erreur) {
                zoneReponseConnexion.className = "mt-4 alert alert-danger text-center";
                zoneReponseConnexion.textContent = "Impossible de joindre le serveur d'authentification pour le moment.";
            }
        });
    }
});
