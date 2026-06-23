# 🐺 MJ App — Loup-Garou de Thiercelieux

Application d'aide au **Maître du Jeu** pour le jeu de société *Loup-Garou de Thiercelieux*.  
Gère l'ordre des nuits, les actions des rôles, les votes, les conditions de victoire et les sons d'ambiance.

## Fonctionnalités

- **22 rôles** pris en charge : Villageois, Loups-Garous, Sorcière, Voyante, Chasseur, Cupidon, Fossoyeur, Joueur de Flûte, et bien d'autres
- **Phase nuit** : ordre automatique, actions par rôle (attaque, potions, révélations, transformations…)
- **Phase jour** : récap de l'aube, détection des victoires, vote et élimination
- **Conditions de victoire** : détection automatique (Village, Loups, Amoureux, Joueur de Flûte, Loup Blanc, Ancien)
- **Sons d'ambiance** : bibliothèque audio personnalisable, profils d'assignation par événement
- **Mode dashboard** : sidebar joueurs + phase principale côte à côte
- **Historique de partie** : panneau récapitulatif des actions et morts par nuit
- **Tirage aléatoire** des rôles proportionnel au nombre de joueurs

## Lancement

Aucune installation requise. L'application fonctionne entièrement dans le navigateur.

1. Cloner le dépôt :
   ```bash
   git clone https://github.com/TON_UTILISATEUR/loup-garou-mj.git
   cd loup-garou-mj
   ```

2. Ouvrir `index.html` dans un navigateur :
   ```bash
   # Option A — double-clic sur index.html
   # Option B — serveur local (recommandé pour les sons)
   npx serve .
   # ou
   python3 -m http.server 8080
   ```

3. Accéder à `http://localhost:8080` (si serveur local)

> **Note :** Pour utiliser les sons, il est recommandé d'ouvrir le fichier via un serveur local (certains navigateurs bloquent les requêtes audio depuis `file://`).

## Structure

```
├── index.html              # Point d'entrée
├── js/
│   └── gameData.js         # Données des rôles, ordre de nuit, conditions de victoire
└── jsx/
    ├── AppContext.jsx       # État global (React Context + useReducer)
    ├── App.jsx              # Routeur principal
    ├── HomeScreen.jsx       # Écran d'accueil
    ├── RoleConfig.jsx       # Assignation des rôles
    ├── AssignScreen.jsx     # Noms des joueurs + révélation secrète
    ├── NightPhase.jsx       # Phase nuit
    ├── DayPhase.jsx         # Aube, vote, chasseur, victoire
    ├── GameScreen.jsx       # Wrapper de jeu (header, historique, dashboard)
    └── SoundConfigModal.jsx # Gestion des sons
```

## Stack technique

- **React 18.3.1** via CDN (pas de build nécessaire)
- **Babel Standalone 7.29.0** pour la transpilation JSX en navigateur
- **Styles inline** avec variables CSS (thème sombre)
- **Polices** : Cinzel, Crimson Text, JetBrains Mono (Google Fonts)
- **Web Audio** via éléments `<audio>` et dataURL (localStorage)

## Joueurs

4 à 25 joueurs.
