# Plan - Refonte MJ (assistant Maitre du Jeu Loup-Garou)

## Contexte

Le projet actuel (`C:\Projet\mj`) est une SPA React chargee via CDN (React 18 + Babel
standalone transpile dans le navigateur, **aucun build**), ~2900 lignes : `index.html`
(128 l), `js/gameData.js` (403 l, donnees + logique pure), `jsx/*.jsx` (AppContext 639 l =
useReducer + ~50 actions, NightPhase 801 l, DayPhase, etc.).

La logique Loup-Garou est deja riche (22 roles, 6 conditions de victoire, cascades de morts,
ordre de nuit dynamique, phases nuit/aube/jour/vote/chasseur). Mais : pas de build, pas de
backend, pas de persistance de partie, et **les sons sont stockes en localStorage (dataURL)**
ce qui casse sur les gros fichiers musicaux - c'est la contrainte d'import musique a resoudre.

Objectif : transformer ce fichier unique en un produit multi-plateformes propre : front + back
(minimal, extensible), PWA installable, vrai SEO, logique de jeu complete, design responsive,
desktop via Electron, et import de musique sans limite de taille.

### Decisions validees avec l'utilisateur

- **Backend** : minimal maintenant (vitrine + SEO, stats eventuelles). Architecture
  **local-first, backend-ready** : prevoir les coutures pour comptes / sync / multijoueur plus tard,
  sans les construire.
- **Musique** : stockage **IndexedDB** cote web (gros fichiers, offline) + acces **fichiers natifs**
  en Electron. Le service worker ne gere PAS les sons utilisateur.
- **Plateformes** : Web **PWA installable** + **Desktop Electron** (Windows/macOS/Linux).
  Pas de mobile natif (stores) pour l'instant.
- **Stack** : monorepo **Turborepo + pnpm**, **Next.js (App Router)** pour vitrine SEO + app,
  **moteur de jeu TypeScript pur partage**, **Electron** reutilisant le build.
- **Design** : preserver l'identite visuelle actuelle (sombre, rouge sang, polices Cinzel/Crimson),
  la porter vers **Tailwind CSS + primitives shadcn/ui**, la rendre vraiment responsive.
- **Livraison** : par **phases**, **une branche par phase**, mergees sur `develop` ;
  `main` mis a jour **a chaque release** (tag SemVer).

---

## Strategie Git (GitFlow allege)

- Branche d'integration : `develop` (creee depuis `main`). On ne travaille jamais directement
  sur `main`.
- Une branche par phase : `feature/phase-1-fondations`, `feature/phase-2-pwa-musique`, etc.
  Merge dans `develop` en fin de phase (PR + revue).
- Release : quand un lot de phases forme une version livrable, merge `develop` -> `main`,
  tag SemVer (`vX.Y.Z`), entree CHANGELOG. Version centralisee dans `apps/desktop/package.json`
  (source de verite du binaire), alignee dans `apps/web` via script `sync-version`.
- A chaque release, mettre a jour : version centralisee, affichage version dans l'UI ("A propos"),
  README (avec diagramme mermaid), CHANGELOG, `tasks/`. (Conforme au workflow de versioning.)

---

## Architecture cible

### Monorepo (Turborepo + pnpm)

`.npmrc` racine : `node-linker=hoisted` (compatibilite electron-builder avec pnpm).

```
mj/
  pnpm-workspace.yaml, turbo.json, tsconfig.base.json, .npmrc
  apps/
    web/            # Next.js App Router : vitrine SSG + app cliente + PWA
      app/
        (marketing)/   # SSG, SEO : /, /roles, /regles, /guide
        (app)/play/    # app de jeu, 100% client (ssr:false)
        manifest.ts, sitemap.ts, robots.ts, sw.ts
    desktop/        # Electron : main + preload, reutilise le build statique de web
  packages/
    game-engine/    # @mj/game-engine : TS PUR, zero dep React/DOM (le coeur)
    storage/        # @mj/storage : PersistencePort + adapters (idb, electron-fs, memory, api-stub)
    sound-config/   # @mj/sound-config : resolution pure son (eventId -> source), sans IO
    ui/             # @mj/ui : composants React partages (NightPhase, DayPhase, ...)
    tsconfig/       # presets TS partages
```

Frontieres de dependances (a faire respecter, ex. `eslint-plugin-boundaries`) :
`game-engine` ne depend de RIEN ; `storage`/`sound-config` ne dependent que de types ;
`ui` depend de tout ; `apps/*` consomment tout. C'est ce qui garde le moteur reutilisable
cote serveur (multijoueur futur).

### Next.js + Electron (le point dur) : deux artefacts depuis le meme code

- **Build web deploye** : Next.js standard (serveur). `(marketing)` en SSG (`force-static`) pour
  le SEO ; `(app)/play` en client pur (`dynamic(..., { ssr:false })`). API routes futures vivent ici.
- **Build Electron** : `output: 'export'` conditionnel via `BUILD_TARGET=desktop`
  (`assetPrefix:'./'`, `images.unoptimized`). Electron charge l'export local via un **protocole
  custom `app://`** (`protocol.handle`, pas `file://` - les SW et le routing client en dependent).
  Le service worker est **desactive** dans le build desktop (precache `app://` redondant).
- Capacites natives (dossier musique, plein ecran) exposees par le `preload` via `contextBridge`
  -> `window.mjNative` typee. Cote web, absente -> fallback IndexedDB.

### Moteur de jeu (`packages/game-engine`)

Port **mecanique d'abord, refactor ensuite** : on copie les algorithmes quasi a l'identique,
on ne change que le typage, `window.X` -> imports, et l'injection de l'aleatoire/temps.

- `types.ts` : `RoleId` (union des 22 roles + `IDIOT`, voir corrections), `Team`, `Role`,
  `Player`, `GameState`, `Action` (union discriminee des ~50 actions de jeu), `Death`,
  `NightAction`, `Victory`.
- `roles.data.ts` : `ROLES_DATA` / `NIGHT_ORDER_BASE` / `TEAM_INFO` typees avec `satisfies`.
  (Les donnees son sortent du moteur.)
- `rules/winConditions.ts`, `rules/nightOrder.ts`, `rules/cascade.ts`, `rules/rolePool.ts` :
  fonctions pures extraites du code actuel.
- `reducer.ts` + `state.ts` : `gameReducer(state, action)` pur (deja immuable dans le code actuel)
  et `makeInitialState()` **sans aucun acces localStorage**.
- `rng.ts` : injection `Rng` (seedable en test) + generateur d'id (`Death.id` devient `string`
  deterministe), pour des tests par snapshot stables.
- Etat **serialisable** + champs `id`, `schemaVersion`, `updatedAt` ajoutes des maintenant
  (cout nul, indispensables pour sauvegarde/reprise et sync future).

Corrections d'incoherences detectees dans le code actuel :
- `IDIOT` est utilise dans `ELIMINATE_PLAYER` (AppContext:199) mais absent de `ROLES_DATA`
  -> l'ajouter proprement (c'est un vrai role Loup-Garou).
- `ancienPowerLost` lu/ecrit (AppContext:227) mais jamais initialise -> le formaliser dans `GameState`.

### Persistance & musique (couches au-dessus du moteur)

- `packages/storage` expose `PersistencePort` (loadGame/saveGame/listGames + putAsset/getAsset
  pour les blobs audio + `subscribe?` no-op aujourd'hui pour la sync future).
- Adapters : `IndexedDBAdapter` (web, lib `idb`), `ElectronFsAdapter` (desktop, fichiers via
  `window.mjNative`), `MemoryAdapter` (tests). `ApiAdapter` = stub pour plus tard.
- Injection unique : `<StorageProvider adapter={selectAdapter()}>` au root de chaque app ;
  l'UI consomme `usePersistence()`, jamais l'implementation. **Le jour du backend, on ajoute
  un adapter, l'UI ne change pas.**
- Sons importes -> IndexedDB (web) / fichiers (desktop), JAMAIS localStorage : c'est ce qui leve
  la contrainte musique actuelle.

### PWA & SEO

- PWA : **Serwist (`@serwist/next`)** (next-pwa non maintenu en 2026). `manifest.ts`, SW en TS,
  precache de l'app-shell `/play` pour un offline 100%, CacheFirst sur assets/polices.
- SEO : le route group `(marketing)` (SSG) est l'actif a referencer - guide des roles genere
  **depuis `game-engine/data`** (source unique), regles, FAQ, page telechargement. Metadata API,
  `sitemap.ts`, `robots.ts` (`disallow: /play`), OpenGraph + images OG generees par role
  (`next/og`), JSON-LD `SoftwareApplication`/`FAQPage`. `/play` en `noindex`.

### Design

Porter le theme actuel (variables CSS sombres rouge sang) en **tokens Tailwind** + primitives
**shadcn/ui** (Dialog, Select, Tabs, Button, Slider...). Conserver Cinzel/Crimson/JetBrains Mono.
Refondre les layouts en mobile-first responsive (la NightPhase de 801 l. est fractionnee en
composants par role dans `@mj/ui`).

---

## Phases (une branche par phase -> `develop`)

**Phase 0 - `feature/phase-0-setup`** : creer `develop`, scaffold Turborepo + pnpm + tsconfig base
+ `.npmrc` hoisted + Vitest + ESLint/Prettier + boundaries. POC Electron minimal qui charge un
export statique via `app://` (valider le point dur tot). Creer/mettre a jour `tasks/todo.md`,
`tasks/lessons.md`, `CHANGELOG.md`. Retirer `project/` (copie) et `mj.zip`.

**Phase 1 - `feature/phase-1-moteur`** : extraire `packages/game-engine` (types -> donnees ->
rules -> reducer), avec tests Vitest prioritaires : 8 cas `checkWinConditions` (priorite amoureux,
loup blanc, flute, fossoyeur, loups dernier adversaire, village, aucun, 0 vivant), 7 cas
`computeNightOrder` (firstNightOnly, secondNightOnly, notBeforeNight, everyOtherNight, filtre morts
+ exception fossoyeur, repositionnement demenageur), `cascadeDeaths` (amoureux transitif, enfant
sauvage, pas de double-mort), et scenarios reducer en snapshot (nuit->aube, ancien survit,
salvateur, sorciere undo, chasseur, ancien lynche, voleur, demenageur swap).

**Phase 2 - `feature/phase-2-app-web`** : `apps/web` App Router, route `(app)/play` cliente
consommant `@mj/ui` (port de NightPhase/DayPhase/etc.) + `@mj/game-engine`. Parite fonctionnelle
avec l'existant. Theme Tailwind + shadcn. `packages/storage` (Port + IndexedDB + Memory) ;
migration des sons localStorage -> IndexedDB (leve la contrainte musique). `packages/sound-config`.
**Release candidate v1 possible ici.**

**Phase 3 - `feature/phase-3-pwa`** : Serwist, manifest, offline-first, sauvegarde/reprise de partie
(serialize/deserialize + IndexedDB), installabilite.

**Phase 4 - `feature/phase-4-seo-vitrine`** : route group `(marketing)` SSG, pages roles generees
depuis le moteur, regles, FAQ, metadata/sitemap/robots/OG/JSON-LD.

**Phase 5 - `feature/phase-5-desktop`** : `apps/desktop` Electron (main + preload + protocole
`app://`), build `BUILD_TARGET=desktop`, `ElectronFsAdapter` (musique en fichiers natifs),
electron-builder (Win/macOS/Linux), version centralisee + "A propos". electron-updater optionnel.

**Phase 6 (optionnelle) - logique de jeu v2** : descendre dans le moteur la logique restee dans
l'UI (scan Renard, Montreur d'Ours, comptage Flute >15), variantes/multiplicateurs de roles,
notes par joueur. A faire une fois les snapshots en place.

Chaque release (lots de phases) : merge `develop` -> `main`, tag SemVer, CHANGELOG, README/docs,
affichage version UI.

---

## Fichiers sources de reference (a porter)

- `C:\Projet\mj\js\gameData.js` : `ROLES_DATA`, `checkWinConditions`, `computeNightOrder`,
  `getRandomRolePool`, `TEAM_INFO` -> `packages/game-engine`.
- `C:\Projet\mj\jsx\AppContext.jsx` : `makeInitial`, `gameReducer` (~50 actions), `cascadeDeaths`
  -> `game-engine` (logique) ; effets (timer, localStorage, `playSound`) -> couche app/`sound-config`.
- `C:\Projet\mj\jsx\NightPhase.jsx`, `DayPhase.jsx` -> `packages/ui`.
- `C:\Projet\mj\index.html` (theme CSS + ordre de chargement) -> tokens Tailwind + layout Next.js.

---

## Verification (par phase)

- **Moteur** : `pnpm test` (Vitest) vert sur tous les cas listes ; couverture des 6 victoires et de
  l'ordre de nuit. Snapshots de parties scriptees stables (RNG seede).
- **App web** : `pnpm dev`, jouer une partie complete de bout en bout (config -> attribution ->
  nuit -> aube -> jour -> vote -> victoire) et comparer le comportement a l'app actuelle.
  Import d'un fichier audio > 10 Mo qui cassait avant -> doit fonctionner (IndexedDB).
- **PWA** : Lighthouse PWA installable ; couper le reseau et verifier que `/play` se charge et
  qu'une partie se joue offline.
- **SEO** : Lighthouse SEO sur la vitrine ; sitemap/robots accessibles ; rich results test sur le
  JSON-LD ; pages roles indexables, `/play` en noindex.
- **Desktop** : build electron-builder par OS, lancement offline, import musique depuis un dossier
  local, version affichee correcte.
- Verification visuelle possible via les outils de preview navigateur a chaque phase UI.
