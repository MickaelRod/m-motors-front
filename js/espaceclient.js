document.addEventListener('DOMContentLoaded', async () => {
    const conteneurNom = document.getElementById('nom-utilisateur');
    const boutonDeconnexion = document.getElementById('bouton-deconnexion');
    const listeDemandes = document.getElementById('liste-demandes');

    // Détection de l'environnement pour définir l'URL de base de l'API
    const estLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const urlBase = estLocalhost ? 'http://localhost:8001/api/' : 'back/api/';

    try {
        // Interrogation du serveur pour valider l'existence de la session active
        const reponseSession = await fetch(urlBase + 'session.php', {
            method: 'GET',
            credentials: 'include'
        });

        if (!reponseSession.ok) {
            sessionStorage.removeItem('utilisateur_nom');
            window.location.replace('connexion.html');
            return;
        }

        const resultatSession = await reponseSession.json();
        
        if (conteneurNom && resultatSession) {
            conteneurNom.textContent = resultatSession.utilisateur.nom;
        }

        // Récupération des demandes de l'utilisateur connecté
        const reponseDemandes = await fetch(urlBase + 'demandes.php', {
            method: 'GET',
            credentials: 'include'
        });

        if (reponseDemandes.ok && listeDemandes) {
            const resultatDemandes = await reponseDemandes.json();
            const demandes = resultatDemandes.demandes;

            if (demandes.length > 0) {
                // Vidage du message par défaut "Aucune demande"
                listeDemandes.innerHTML = '';

                // Construction dynamique des lignes du tableau
                demandes.forEach(demande => {
                    const ligne = document.createElement('tr');
                    
                    // Formatage de la date SQL en date française lisible
                    const dateOption = { year: 'numeric', month: 'long', day: 'numeric' };
                    const dateLisible = new Date(demande.cree_le).toLocaleDateString('fr-FR', dateOption);

                    // Traduction ergonomique des types de demandes reçus de la BDD
                    let libelleType = demande.type_demande;
                    if (demande.type_demande === 'achat') libelleType = 'Achat comptant';
                    else if (demande.type_demande === 'location') libelleType = 'Location (LLD)';
                    else if (demande.type_demande === 'financement') libelleType = 'Achat avec financement';
                    else if (demande.type_demande === 'autre') libelleType = 'Demande générale';

                    // Définition de la couleur du badge Bootstrap et traduction du statut réel de la BDD
                    let classeBadge = 'bg-secondary';
                    let texteStatut = demande.statut;

                    if (demande.statut === 'en_attente') {
                        classeBadge = 'bg-warning text-dark';
                        texteStatut = 'En attente';
                    } else if (demande.statut === 'valide') {
                        classeBadge = 'bg-success';
                        texteStatut = 'Validé';
                    } else if (demande.statut === 'refuse') {
                        classeBadge = 'bg-danger';
                        texteStatut = 'Refusé';
                    }

                    ligne.innerHTML = `
                        <td class="small">${dateLisible}</td>
                        <td class="fw-bold small text-uppercase">${libelleType}</td>
                        <td class="small">${demande.vehicule_nom}</td>
                        <td><span class="badge ${classeBadge}">${texteStatut}</span></td>
                    `;
                    listeDemandes.appendChild(ligne);
                });
            }
        }

    } catch (erreur) {
        window.location.replace('connexion.html');
        return;
    }

    // Gestion de la déconnexion de l'utilisateur
    if (boutonDeconnexion) {
        boutonDeconnexion.addEventListener('click', async () => {
            try {
                await fetch(urlBase + 'deconnexion.php', {
                    method: 'POST',
                    credentials: 'include'
                });
            } catch (erreur) {
                // Poursuite de l'exécution en cas d'erreur réseau
            }

            sessionStorage.removeItem('utilisateur_nom');
            window.location.replace('connexion.html');
        });
    }
});