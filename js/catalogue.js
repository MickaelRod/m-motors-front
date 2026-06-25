// Fonction pour récupérer et afficher les véhicules depuis l'API PHP
async function filtrerCatalogue(type = '') {
    // Nettoyage de la classe active sur TOUS les boutons du groupe
    document.querySelectorAll('.btn-group .btn').forEach(btn => btn.classList.remove('active-filter'));
    
    // Application de la classe uniquement au bouton cliqué
    if (type === '') document.getElementById('btn-tous').classList.add('active-filter');
    if (type === 'achat') document.getElementById('btn-achat').classList.add('active-filter');
    if (type === 'location') document.getElementById('btn-location').classList.add('active-filter');

    // Détection automatique de l'environnement (Local vs Production)
    const estLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    // Prise en compte du dossier /back/ isolé sur le serveur en ligne
    const urlBase = estLocalhost 
        ? 'http://localhost:8001/api/recherche.php' 
        : 'back/api/recherche.php';
    const urlApi = `${urlBase}${type ? '?type=' + type : ''}`;

    try {
        const reponse = await fetch(urlApi);
        if (!reponse.ok) throw new Error("Erreur lors de la récupération des données");
        
        const vehicules = await reponse.json();
        const conteneur = document.getElementById('zone-catalogue');
        conteneur.innerHTML = ''; // Nettoyage de la zone

        if (vehicules.length === 0) {
            conteneur.innerHTML = `<p class="text-center w-100 text-muted">Aucun véhicule disponible pour cette catégorie.</p>`;
            return;
        }

        // Injection dynamique des cartes de véhicules avec boutons d'action contextuels et transmission de l'ID
        vehicules.forEach(vehicule => {
            let boutonsHtml = '';
            if (vehicule.type_commercial === 'achat') {
                boutonsHtml = `
                    <div class="d-grid gap-2 mt-3">
                        <button class="btn btn-primary btn-sm" onclick="initierContact('Achat comptant', '${vehicule.marque} ${vehicule.modele}', ${vehicule.id})">Acheter comptant</button>
                        <button class="btn btn-outline-primary btn-sm" onclick="initierContact('Demande de financement', '${vehicule.marque} ${vehicule.modele}', ${vehicule.id})">Demander un financement</button>
                    </div>
                `;
            } else {
                boutonsHtml = `
                    <div class="d-grid mt-3">
                        <button class="btn btn-info btn-sm text-white" onclick="initierContact('Location LLD', '${vehicule.marque} ${vehicule.modele}', ${vehicule.id})">Postuler à la location</button>
                    </div>
                `;
            }

            const carteHtml = `
                <div class="col">
                    <div class="card h-100 shadow-sm">
                        <div class="card-body d-flex flex-column justify-content-between">
                            <div>
                                <h5 class="card-title fw-bold mb-1">${vehicule.marque} - ${vehicule.modele}</h5>
                                <span class="badge ${vehicule.type_commercial === 'achat' ? 'bg-success' : 'bg-info'} mb-3">
                                    ${vehicule.type_commercial === 'achat' ? 'Achat Occasion' : 'Location Longue Durée'}
                                </span>
                                <h4 class="text-primary fw-semibold mb-2">
                                    ${vehicule.type_commercial === 'achat' ? vehicule.prix + ' €' : vehicule.prix + ' € / mois'}
                                </h4>
                                ${vehicule.options_incluses ? `<p class="card-text small text-muted mt-2"><strong>Inclus :</strong> ${vehicule.options_incluses}</p>` : ''}
                            </div>
                            ${boutonsHtml}
                        </div>
                    </div>
                </div>
            `;
            conteneur.innerHTML += carteHtml;
        });

    } catch (erreur) {
        document.getElementById('zone-catalogue').innerHTML = `
            <div class="alert alert-danger w-100 text-center" role="alert">
                Impossible de charger le catalogue de véhicules pour le moment.
            </div>
        `;
    }
}

// Chargement initial du catalogue complet au démarrage de la page
document.addEventListener('DOMContentLoaded', () => filtrerCatalogue(''));

// Fonction pour faire défiler la page et pré-remplir le sujet avec la référence ID unique
function initierContact(typeDemande, vehiculeNom, vehiculeId) {
    const champSujet = document.getElementById('form-sujet');
    if (champSujet) {
        champSujet.value = `${typeDemande} - ${vehiculeNom} (Réf : #${vehiculeId})`;
    }
    
    // Défilement fluide vers la section de contact
    const sectionContact = document.getElementById('contact');
    if (sectionContact) {
        sectionContact.scrollIntoView({ behavior: 'smooth' });
    }
}

// Interception de la soumission du formulaire de contact
document.addEventListener('DOMContentLoaded', () => {
    const formulaire = document.getElementById('formulaire-contact');
    if (!formulaire) return;

    formulaire.addEventListener('submit', async (e) => {
        e.preventDefault(); // Empêche le rechargement de la page

        const zoneReponse = document.getElementById('form-reponse');
        zoneReponse.className = "mt-4 alert alert-info text-center";
        zoneReponse.textContent = "Envoi de votre demande en cours...";
        zoneReponse.classList.remove('d-none');

        // Récupération automatique de tous les champs et du fichier joint
        const donnéesFormulaire = new FormData();
        donnéesFormulaire.append('nom', document.getElementById('form-nom').value);
        donnéesFormulaire.append('telephone', document.getElementById('form-telephone').value);
        donnéesFormulaire.append('email', document.getElementById('form-email').value);
        donnéesFormulaire.append('sujet', document.getElementById('form-sujet').value);
        donnéesFormulaire.append('message', document.getElementById('form-message').value);

        const champFichier = document.getElementById('form-document');
        if (champFichier.files.length > 0) {
            donnéesFormulaire.append('document', champFichier.files[0]);
        }

        // Détection de l'environnement pour cibler la bonne URL d'API
        const estLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const urlAction = estLocalhost 
            ? 'http://localhost:8001/api/contact.php' 
            : 'back/api/contact.php';

        try {
            const reponse = await fetch(urlAction, {
                method: 'POST',
                body: donnéesFormulaire // Envoi direct du FormData (le navigateur gère les entêtes multi-part automatiquement)
            });

            const resultat = await reponse.json();

            if (reponse.ok) {
                zoneReponse.className = "mt-4 alert alert-success text-center";
                zoneReponse.textContent = resultat.succes || "Votre message a bien été envoyé !";
                formulaire.reset(); // Vide le formulaire après succès
            } else {
                zoneReponse.className = "mt-4 alert alert-danger text-center";
                zoneReponse.textContent = resultat.erreur || "Une erreur est survenue lors de l'envoi.";
            }
        } catch (erreur) {
            zoneReponse.className = "mt-4 alert alert-danger text-center";
            zoneReponse.textContent = "Impossible de joindre le serveur de messagerie.";
        }
    });
});