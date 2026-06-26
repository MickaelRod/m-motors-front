document.addEventListener('DOMContentLoaded', async () => {
    const conteneurNom    = document.getElementById('nom-utilisateur');
    const boutonDeconnexion = document.getElementById('bouton-deconnexion');
    const listeDemandes   = document.getElementById('liste-demandes');

    try {
        // Vérification de la session active — redirection si non connecté
        const reponseSession = await fetch(URL_API + 'session_client.php', {
            method: 'GET',
            credentials: 'include'
        });

        if (!reponseSession.ok) {
            sessionStorage.removeItem('utilisateur_nom');
            window.location.replace('connexion.html');
            return;
        }

        const resultatSession = await reponseSession.json();

        if (conteneurNom) {
            conteneurNom.textContent = resultatSession.utilisateur.nom;
        }

        // Récupération des demandes de l'utilisateur connecté
        const reponseDemandes = await fetch(URL_API + 'demandes.php', {
            method: 'GET',
            credentials: 'include'
        });

        if (reponseDemandes.ok && listeDemandes) {
            const resultatDemandes = await reponseDemandes.json();
            const demandes = resultatDemandes.demandes;

            if (demandes.length > 0) {
                listeDemandes.innerHTML = '';

                demandes.forEach(demande => {
                    const ligne = document.createElement('tr');

                    const dateOption = { year: 'numeric', month: 'long', day: 'numeric' };
                    const dateLisible = new Date(demande.cree_le).toLocaleDateString('fr-FR', dateOption);

                    const libelleType = traduireTypeDemande(demande.type_demande);
                    const statut      = traduireStatut(demande.statut);

                    ligne.innerHTML = `
                        <td class="small">${dateLisible}</td>
                        <td class="fw-bold small text-uppercase">${libelleType}</td>
                        <td class="small">${demande.vehicule_nom}</td>
                        <td><span class="badge ${statut.classe}">${statut.libelle}</span></td>
                    `;
                    listeDemandes.appendChild(ligne);
                });
            }
        }

    } catch (erreur) {
        window.location.replace('connexion.html');
        return;
    }

    // Gestion de la déconnexion
    if (boutonDeconnexion) {
        boutonDeconnexion.addEventListener('click', async () => {
            try {
                await fetch(URL_API + 'deconnexion_client.php', {
                    method: 'POST',
                    credentials: 'include'
                });
            } catch (erreur) {
                // Poursuite en cas d'erreur réseau
            }

            sessionStorage.removeItem('utilisateur_nom');
            window.location.replace('connexion.html');
        });
    }
});
