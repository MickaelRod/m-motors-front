// Fonction pour récupérer et afficher les véhicules depuis l'API PHP
async function filtrerCatalogue(type = '') {
    // Gestion active des classes de boutons Bootstrap
    document.querySelectorAll('.d-flex .btn').forEach(btn => btn.classList.remove('active'));
    if (type === '') document.getElementById('btn-tous').classList.add('active');
    if (type === 'achat') document.getElementById('btn-achat').classList.add('active');
    if (type === 'location') document.getElementById('btn-location').classList.add('active');

    // Détection automatique de l'environnement (Local vs Production)
    const estLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    // En local, on pointe vers le port de l'API Back-Office (ex: 8001)
    // En production, on utilise le chemin relatif direct
    const urlBase = estLocalhost 
        ? 'http://localhost:8001/api/recherche.php' 
        : 'api/recherche.php';
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

        // Injection dynamique des cartes de véhicules
        vehicules.forEach(vehicule => {
            const carteHtml = `
                <div class="col">
                    <div class="card h-100 shadow-sm">
                        <div class="card-body">
                            <h5 class="card-title fw-bold">${vehicule.marque} - ${vehicule.modele}</h5>
                            <span class="badge ${vehicule.type_commercial === 'achat' ? 'bg-success' : 'bg-info'} mb-3">
                                ${vehicule.type_commercial === 'achat' ? 'Achat Occasion' : 'Location Longue Durée'}
                            </span>
                            <h4 class="text-primary fw-semibold">
                                ${vehicule.type_commercial === 'achat' ? vehicule.prix + ' €' : vehicule.prix + ' € / mois'}
                            </h4>
                            ${vehicule.options_incluses ? `<p class="card-text small text-muted mt-2"><strong>Inclus :</strong> ${vehicule.options_incluses}</p>` : ''}
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