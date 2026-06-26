# M-Motors — Front-Office Client

Interface utilisateur du site M-Motors, entreprise fictive de ventes et de location de véhicules.

## Fonctionnalités

- **Catalogue dynamique** : affichage des véhicules via l'API back-office, filtrable par type (Tous / Achat / Location)
- **Formulaire de contact contextuel** : pré-remplissage automatique depuis le catalogue (véhicule, type de demande), téléversement sécurisé de pièces justificatives (PDF, JPG, PNG)
- **Authentification client** : connexion / déconnexion sécurisée, session PHP nommée distincte de celle du back-office
- **Espace client** : consultation du suivi des demandes personnelles (type, véhicule, statut)
- **Inscription** : création de compte avec validation des données côté serveur

## Stack technique

- HTML5 / CSS3 (Bootstrap 5)
- JavaScript vanilla (Fetch API, async/await)
- Communication avec le back-office via API REST PHP (cross-origin avec credentials)
- GitHub Actions (CI/CD FTP vers Hostinger)

## Architecture

```text
index.html          Page principale (catalogue + formulaire de contact)
connexion.html      Page d'authentification et d'inscription
espaceclient.html   Espace de suivi des demandes (accès authentifié)
js/
  config.js         URL de base de l'API (variable d'environnement JS)
  catalogue.js      Chargement du catalogue, filtres, initiation de contact
  connexion.js      Connexion, inscription, déconnexion
  espaceclient.js   Récupération et affichage des demandes de l'utilisateur connecté
```

## Sécurité

- Aucune donnée sensible stockée côté client (sessionStorage limité au nom d'affichage)
- Credentials inclus dans les requêtes Fetch (`credentials: 'include'`) pour la gestion des sessions
- Champs pré-remplis depuis la session marqués `readOnly` pour empêcher la falsification côté client
- Toute validation métier déléguée au back-office PHP

## Déploiement

Push sur `main` → déploiement automatique via GitHub Actions FTP vers hébergement (`public_html/front/`).
