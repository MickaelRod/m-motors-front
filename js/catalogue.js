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

        // Injection dynamique des cartes de véhicules avec boutons d'action contextuels et transmission des références
        vehicules.forEach(vehicule => {
            let boutonsHtml = '';
            if (vehicule.type_commercial === 'achat') {
                boutonsHtml = `
                    <div class="d-grid gap-2 mt-3">
                        <button class="btn btn-primary btn-sm" onclick="initierContact('achat', '${vehicule.marque} ${vehicule.modele}', ${vehicule.id})">Acheter comptant</button>
                        <button class="btn btn-outline-primary btn-sm" onclick="initierContact('financement', '${vehicule.marque} ${vehicule.modele}', ${vehicule.id})">Acheter avec demande de financement</button>
                    </div>
                `;
            } else {
                boutonsHtml = `
                    <div class="d-grid mt-3">
                        <button class="btn btn-info btn-sm text-white" onclick="initierContact('location', '${vehicule.marque} ${vehicule.modele}', ${vehicule.id})">Postuler à la location</button>
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
                                    ${vehicule.type_commercial === 'achat' ? 'Achat d\'occasion' : 'Location longue durée'}
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

// Chargement initial du catalogue complet et configuration du profil utilisateur connecté
document.addEventListener('DOMContentLoaded', async () => {
    // Exécution du filtre par défaut pour le catalogue
    filtrerCatalogue('');

    // Détection de l'environnement pour cibler l'API de session
    const estLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const urlBaseSession = estLocalhost ? 'http://localhost:8001/api/session.php' : 'back/api/session.php';

    try {
        // Interrogation de l'API pour vérifier si une session est active
        const reponseSession = await fetch(urlBaseSession, {
            method: 'GET',
            credentials: 'include'
        });

        if (reponseSession.ok) {
            const resultatSession = await reponseSession.json();
            
            // Récupération des éléments du formulaire de contact
            const champNom = document.getElementById('form-nom');
            const champEmail = document.getElementById('form-email');
            const champTelephone = document.getElementById('form-telephone');

            // Injection des données de l'utilisateur connecté et verrouillage des champs
            if (champNom && resultatSession.utilisateur.nom) {
                champNom.value = resultatSession.utilisateur.nom;
                champNom.readOnly = true;
            }
            if (champEmail && resultatSession.utilisateur.email) {
                champEmail.value = resultatSession.utilisateur.email;
                champEmail.readOnly = true;
            }
            if (champTelephone && resultatSession.utilisateur.telephone) {
                champTelephone.value = resultatSession.utilisateur.telephone;
                champTelephone.readOnly = true;
            }
        }
    } catch (erreur) {
        // L'exécution se poursuit normalement pour les visiteurs anonymes en cas d'absence de session
    }
});

// Fonction pour faire défiler la page et configurer le formulaire de contact de manière structurée
function initierContact(typeDemande, vehiculeNom, vehiculeId) {
    const selectType = document.getElementById('form-type-demande');
    const inputVehiculeNom = document.getElementById('form-vehicule-nom');
    const inputVehiculeId = document.getElementById('form-vehicule-id');
    const blocInfoFinancement = document.getElementById('bloc-info-financement');

    if (selectType) selectType.value = typeDemande;
    if (inputVehiculeNom) inputVehiculeNom.value = vehiculeNom;
    if (inputVehiculeId) inputVehiculeId.value = vehiculeId;
    
    // Affichage ou masquage du bloc informatif selon le type d'aiguillage
    if (blocInfoFinancement) {
        if (typeDemande === 'financement') {
            blocInfoFinancement.classList.remove('d-none');
        } else {
            blocInfoFinancement.classList.add('d-none');
        }
    }
    
    const sectionContact = document.getElementById('contact');
    if (sectionContact) {
        sectionContact.scrollIntoView({ behavior: 'smooth' });
    }
}

// Interception de la soumission du formulaire de contact
document.addEventListener('DOMContentLoaded', () => {
    const formulaire = document.getElementById('formulaire-contact');
    if (!formulaire) return;

    // Gestion de l'affichage dynamique du message d'information pour le financement
    const selectTypeDemande = document.getElementById('form-type-demande');
    const blocInfoFinancement = document.getElementById('bloc-info-financement');
    if (selectTypeDemande && blocInfoFinancement) {
        selectTypeDemande.addEventListener('change', () => {
            if (selectTypeDemande.value === 'financement') {
                blocInfoFinancement.classList.remove('d-none');
            } else {
                blocInfoFinancement.classList.add('d-none');
            }
        });
    }    

    formulaire.addEventListener('submit', async (e) => {
        e.preventDefault(); // Empêche le rechargement de la page

        const zoneReponse = document.getElementById('form-reponse');
        zoneReponse.className = "mt-4 alert alert-info text-center";
        zoneReponse.textContent = "Envoi de votre demande en cours...";
        zoneReponse.classList.remove('d-none');

        // Récupération automatique des variables textuelles et des références structurées
        const donneesFormulaire = new FormData();
        donneesFormulaire.append('nom', document.getElementById('form-nom').value);
        donneesFormulaire.append('telephone', document.getElementById('form-telephone').value);
        donneesFormulaire.append('email', document.getElementById('form-email').value);
        donneesFormulaire.append('type_demande', document.getElementById('form-type-demande').value);
        donneesFormulaire.append('vehicule_id', document.getElementById('form-vehicule-id').value);
        donneesFormulaire.append('vehicule_nom', document.getElementById('form-vehicule-nom').value);
        donneesFormulaire.append('message', document.getElementById('form-message').value);

        const champFichier = document.getElementById('form-document');
        if (champFichier.files.length > 0) {
            donneesFormulaire.append('document', champFichier.files[0]);
        }

        // Détection de l'environnement pour cibler la bonne URL d'API
        const estLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const urlAction = estLocalhost 
            ? 'http://localhost:8001/api/contact.php' 
            : 'back/api/contact.php';

        try {
            const reponse = await fetch(urlAction, {
                method: 'POST',
                body: donneesFormulaire, // Envoi direct du FormData (le navigateur gère les entêtes multi-part automatiquement)
                credentials: 'include' // Obligatoire pour transmettre le cookie de session PHP au serveur
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
            zoneReponse.textContent = "Impossible de joindre le serveur de messagerie pour le moment.";
        }
    });
});