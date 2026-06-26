# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Langue

Parler exclusivement en français. Les termes techniques gardent leur forme originale.
Interdiction du tiret cadratin "—" (U+2014). Utiliser le tiret "-", les deux-points ":", ou reformuler.

## Checklist de session

1. Lire `tasks/lessons.md` (toutes les leçons actives).
2. Lire `tasks/todo.md` et comprendre l'état actuel du projet.
3. Vérifier la branche Git : **ne jamais travailler sur `main`** (branche d'intégration : `develop`).
4. Si un des fichiers ci-dessus n'existe pas, le créer immédiatement.

## Projet

**MJ App** — assistant Maître du Jeu pour le jeu Loup-Garou de Thiercelieux.
4 à 25 joueurs. 22 rôles implémentés. Fonctionne entièrement dans le navigateur (aucun build actuellement).

### Lancement (état actuel — avant refonte)

```bash
npx serve .
# ou
python3 -m http.server 8080
```

Ouvrir `http://localhost:8080`. Aucune installation, React 18 et Babel via CDN.

## Architecture actuelle (avant refonte)

Pas de build. React + Babel transpilé dans le navigateur. Tous les scripts chargés via `<script type="text/babel">` dans `index.html`, ordre de chargement important (les exports utilisent `window.*`).

Fichiers clés :

- `js/gameData.js` : données statiques et logique pure exposées sur `window`. `ROLES_DATA` (22 rôles), `checkWinConditions(players)` (6 conditions de victoire), `computeNightOrder(nightCount, players)` (ordre dynamique), `getRandomRolePool(count)`.
- `jsx/AppContext.jsx` : état global via React Context + `useReducer`. `makeInitial()` (état initial), `gameReducer` (~50 actions), `cascadeDeaths()` (morts en cascade : amoureux, Enfant Sauvage). Lit aussi `localStorage` pour les sons.
- `jsx/NightPhase.jsx` : composant le plus volumineux (801 lignes). Gère l'affichage et les interactions de tous les rôles appelés la nuit.
- `jsx/DayPhase.jsx` : aube (révélation morts), jour (débat + minuteur), vote, chasseur, victoire.
- `jsx/GameScreen.jsx` : wrapper header/historique, modes `focused` et `dashboard`.
- `jsx/SoundConfigModal.jsx` : bibliothèque audio via `FileReader` → `dataURL` → `localStorage`.

Flux de la partie : `home` → `playerRoleAssign` → `assign` (révélation secrète rôles) → `game` (boucle nuit/aube/jour/vote jusqu'à victoire).

Phases de jeu (`gamePhase`) : `night` → `dawn` → `day` → `vote` → [`hunter`] → `victory` → retour nuit+1.

### Incohérences connues dans le code actuel (à corriger lors de la refonte)

- `IDIOT` utilisé dans `ELIMINATE_PLAYER` (AppContext:199) mais absent de `ROLES_DATA`.
- `ancienPowerLost` lu/écrit (AppContext:227) mais jamais initialisé dans `makeInitial()`.

### Sons

Stockés en `localStorage` comme `dataURL` — casse sur les gros fichiers. Résolu en phase 2 de la refonte (migration vers IndexedDB).

## Refonte en cours (voir `tasks/plan-refonte.md`)

Architecture cible : monorepo Turborepo + pnpm, Next.js App Router, moteur de jeu TypeScript pur (`@mj/game-engine`), PWA (Serwist), Desktop Electron. Stratégie Git :

- Branche d'intégration : `develop`
- Une branche par phase : `feature/phase-X-...`
- Merge `develop` → `main` + tag SemVer à chaque release

Phases : 0 setup → 1 moteur TS testé → 2 app web (parité + IndexedDB) → 3 PWA → 4 SEO/vitrine → 5 Desktop Electron.

### Commandes cibles (après scaffold phase 0)

```bash
pnpm install
pnpm dev                        # Next.js dev server
pnpm build                      # build web
pnpm build:desktop              # build Electron (BUILD_TARGET=desktop)
pnpm test                       # Vitest (moteur de jeu)
pnpm test --filter @mj/game-engine
pnpm lint
```

## Workflow

- Toute tâche non triviale (3+ étapes) : passer en mode plan, écrire dans `tasks/todo.md` avant d'implémenter.
- Après toute correction ou erreur significative : mettre à jour `tasks/lessons.md`. Format : `[date] | ce qui a mal tourné | règle pour l'éviter`.
- Ne jamais marquer une tâche comme terminée sans preuve de fonctionnement (tests, logs, comportement réel).
- Face à un bug : aller directement dans les logs, identifier la cause racine. Pas de fix temporaire.

## Versioning

- SemVer. Version centralisée dans `apps/desktop/package.json` (source de vérité).
- Avant tout tag Git et merge sur `main` : mettre à jour la version, l'UI ("À propos"), le README, le CHANGELOG.

## Principes

- Simplicité d'abord — toucher un minimum de code.
- Ne jamais supposer — toujours vérifier.
- Réutiliser avant d'ajouter.
