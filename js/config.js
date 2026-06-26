/**
 * Configuration commune à toutes les pages du Front-Office.
 * Centralise la détection d'environnement et les traductions métier.
 */

// URL de base de l'API selon l'environnement détecté automatiquement
const estLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const URL_API = estLocalhost ? 'http://localhost:8001/api/' : 'back/api/';

/**
 * Retourne le libellé affichable d'un type de demande.
 */
function traduireTypeDemande(type) {
    const types = {
        'achat':       'Achat comptant',
        'financement': 'Achat avec financement',
        'location':    'Location (LLD)',
        'autre':       'Demande générale'
    };
    return types[type] || type;
}

/**
 * Retourne la classe Bootstrap et le libellé d'un statut de dossier.
 */
function traduireStatut(statut) {
    const statuts = {
        'en_attente': { classe: 'bg-warning text-dark', libelle: 'En attente' },
        'valide':     { classe: 'bg-success',           libelle: 'Validé'     },
        'refuse':     { classe: 'bg-danger',            libelle: 'Refusé'     }
    };
    return statuts[statut] || { classe: 'bg-secondary', libelle: statut };
}
