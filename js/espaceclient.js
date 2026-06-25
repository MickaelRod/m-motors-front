document.addEventListener('DOMContentLoaded', async () => {
    const conteneurNom = document.getElementById('nom-utilisateur');
    const boutonDeconnexion = document.getElementById('bouton-deconnexion');

    // Détection de l'environnement pour définir l'URL de l'API de session
    const estLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const urlSession = estLocalhost ? 'http://localhost:8001/api/session.php' : 'back/api/session.php';

    try {
        // Interrogation du serveur pour valider l'existence de la session active
        const reponse = await fetch(urlSession, {
            method: 'GET',
            credentials: 'include' // Obligatoire pour transmettre le cookie de session PHP
        });

        if (!reponse.ok) {
            // Si le serveur refuse l'accès, destruction des données locales et redirection
            sessionStorage.removeItem('utilisateur_nom');
            window.location.replace('connexion.html');
            return;
        }

        const resultat = await reponse.ok ? await reponse.json() : null;
        
        // Mise à jour de l'affichage avec le nom officiel validé par le serveur
        if (conteneurNom && resultat) {
            conteneurNom.textContent = resultat.utilisateur.nom;
        }

    } catch (erreur) {
        // En cas d'erreur réseau, redirection par mesure de sécurité
        window.location.replace('connexion.html');
        return;
    }

    // Gestion de la déconnexion de l'utilisateur
    if (boutonDeconnexion) {
        boutonDeconnexion.addEventListener('click', async () => {
            const estLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            const urlDeconnexion = estLocalhost ? 'http://localhost:8001/api/deconnexion.php' : 'back/api/deconnexion.php';

            try {
                // Appel de l'API pour détruire la session côté serveur
                await fetch(urlDeconnexion, {
                    method: 'POST',
                    credentials: 'include'
                });
            } catch (erreur) {
                // L'exécution se poursuit même en cas d'erreur réseau pour garantir la sortie de l'interface
            }

            // Nettoyage local et redirection immédiate
            sessionStorage.removeItem('utilisateur_nom');
            window.location.replace('connexion.html');
        });
    }
});