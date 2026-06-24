# 🧭 TyriaCompanion

**TyriaCompanion** est un portail web moderne, autonome et premium conçu pour les joueurs de **Guild Wars 2**. Il interagit directement avec l'API officielle d'ArenaNet pour offrir un tableau de bord héroïque complet, un calculateur de progression d'armures et d'amulettes légendaires, un planificateur de minuteurs d'événements et de World Boss avec suivi journalier, ainsi qu'un outil poussé d'évaluation de la valeur de votre compte et d'optimisation de vos ventes au Comptoir.

L'interface adopte une esthétique sombre soignée ("Obsidian & Astral Violet") avec des effets de translucidité (glassmorphism), des lueurs dynamiques, des transitions fluides et des micro-animations interactives calquées sur les standards graphiques de Guild Wars 2.

---

## ✨ Fonctionnalités Clés

### 1. 📊 Tableau de Bord Héroïque (Dashboard)
* **Profil de Compte :** Affiche vos statistiques clés (Niveau de Fractale personnel, Rang WvW, Guildes rejointes et temps de jeu cumulé en heures).
* **Fortune du Portefeuille :** Présentation géante et stylisée de vos devises majeures (Or, Argent, Bronze, Karma, Lauriers, Statuettes du Lion noir et Ressources astrales).
* **Suivi des Extensions :** Visualisez instantanément les extensions actives et liées à votre compte (de *Heart of Thorns* à *Janthir Wilds*).
* **Galerie des Personnages :** Cartes dynamiques de vos personnages indiquant leur profession, race et niveau. Chaque carte s'adapte visuellement aux couleurs thématiques officielles de leur profession.

### 2. 💎 Suivi et Progression Légendaire
* **Saisons des Dragons :** Suivi interactif des 24 succès requis pour l'amulette légendaire *Regalia du champion prismatique*. Déroulez les détails de chaque région pour visualiser la complétion de ses sous-objectifs.
* **Armure d'Obsidienne (SotO) :** Calculateur dynamique de composants pour 1 pièce ou le set complet (6 pièces). 
  * Il additionne vos stocks sur l'ensemble de votre compte : **Banque**, **Stockage de matériaux** et **Sacs d'inventaires de tous vos personnages**.
  * Intègre un guide d'artisanat pas-à-pas interactif.
  * Checklist d'objectifs manuels (skins débloqués, précurseurs purifiés, dons de cartes) persistante dans le navigateur.

### 3. 🕒 Utilitaires & Minuteurs des World Boss
* **Minuteurs Méta-Événements :** Planning en temps réel des événements majeurs (*Heart of Thorns*, *Path of Fire*, *End of Dragons*, *Secrets of the Obscure*) synchronisés en heure UTC.
* **Suivi des World Boss :** Grille classée par niveau de difficulté (Bas niveau, Standards, Hardcore) avec statut de spawn dynamique.
  * Check-list de complétion journalière avec effet visuel d'estompage.
  * Réinitialisation automatique au reset quotidien du jeu (00:00 UTC) ou manuelle via un bouton dédié.
  * Points de passage (Waypoints) copiables dans le presse-papiers en un clic pour un trajet instantané en jeu.

### 4. 📈 Optimisation du Comptoir (Trading Post Helper)
* **Évaluation Globale :** Calcule la valeur brute estimée, le montant des taxes (15%) et le profit net de vos possessions physiques réparties dans votre banque, stockage de matériaux et inventaires de personnages.
* **Catalogue d'Inventaire :** Recherchez instantanément vos objets, filtrez par type, par niveau de Tier (T1 à T6) ou par emplacement, et triez par profit net ou quantité.
* **Prix du Marché en Temps Réel :** Suivi des cours (Achat immédiat / Vente immédiate) pour les matériaux de valeur.
* **Système d'Épinglage :** Épinglez vos composants les plus suivis au sommet de l'onglet en un clic.
* **Simulateur de Taxes :** Calcule instantanément la commission d'inscription (5%), les frais de transaction (10%) et le profit net d'une vente fictive.

### 5. ⚡ Chambre du Sorcier (Wizard's Vault)
* Suivi complet de vos objectifs Quotidiens, Hebdomadaires et Spéciaux de la saison en cours (avec jauges de progression individuelle).
* Niveau de progression globale du coffre astrale, statut de réclamation et cumul des pièces astrales.

### 6. 📖 Intégration du Wiki GW2 & Convivialité
* **Redirection Wiki en un clic :** Cliquer sur n'importe quel objet ou monnaie dans l'inventaire, le comptoir ou la progression légendaire ouvre automatiquement sa page sur le Wiki anglais officiel (le plus fourni).
* **Contournement Pop-up :** L'onglet de destination s'ouvre instantanément avec un écran de chargement pour éviter le blocage de pop-up du navigateur pendant la récupération API.
* **Cache & Synchro :** Les données d'API et les noms anglais sont mis en cache localement (`localStorage`) pour une réactivité instantanée. Un bouton de synchronisation globale permet de rafraîchir manuellement les données.
* **Navigation Instantanée :** Navigation fluide sans rechargement de page grâce au maintien persistant du DOM.

---

## 🛠️ Stack Technique

* **Structure & Sémantique :** HTML5
* **Design & Animations :** Vanilla CSS3 (Effet de verre trempé, lueurs violettes et turquoises, transitions de translations, responsive complet)
* **Logique & Composants :** Javascript ES6 modulaire (séparation par vues d'onglets)
* **Compilation & Build :** Vite.js (Bundling ultra-rapide)
* **Données :** API REST Guild Wars 2 (ArenaNet)

---

## 🚀 Installation et Lancement Local

### Prérequis
Avoir installé [Node.js](https://nodejs.org/) (incluant `npm`).

### 1. Cloner ou Télécharger le Dépôt
Placez les fichiers dans le dossier de votre choix, puis ouvrez votre terminal dans ce dossier.

### 2. Installer les Dépendances
```bash
npm install
```

### 3. Lancer le Serveur de Développement
```bash
npm run dev
```
Ouvrez l'adresse locale affichée dans votre console (généralement `http://localhost:5173`) dans votre navigateur.

### 4. Compiler pour la Production (Optionnel)
```bash
npm run build
```
Les fichiers compilés et optimisés pour être hébergés en ligne seront générés dans le dossier `/dist`.

### 5. Configurer votre Clé API
Une fois l'application ouverte dans votre navigateur, cliquez sur le bouton **Clé API** en bas à gauche de la barre latérale pour renseigner votre clé API Guild Wars 2. 
*(Note : La clé nécessite les permissions minimales `account`, `inventories`, `characters`, `progression` et `wallet`).*
