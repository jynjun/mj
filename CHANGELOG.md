# Changelog

Format base sur [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/), versioning [SemVer](https://semver.org/lang/fr/).

## [Non publie]

## [0.1.0] - 2026-06-26

Première version de la refonte : monorepo complet, moteur testé, app web jouable
(PWA), vitrine SEO et base desktop.

### Ajoute

- Parite UI (phase 2) : portage des ecrans du SPA legacy dans `@mj/ui` (Home,
  assignation des roles, distribution secrete, NightPhase, aube/jour/vote/chasseur/
  victoire, GameScreen + historique, modale son). `/play` rend l'application complete.
- Couche son `SoundProvider`/`useSound` : configuration en localStorage, fichiers
  audio importes stockes en IndexedDB (migration son effective, fini les dataURL).
- Desktop Electron (phase 5) : `ElectronFsAdapter` + contrat `MjNativeBridge`
  (musique et parties en fichiers natifs via IPC preload/main), `selectAdapter`
  prefere le natif. Version centralisee (apps/desktop/package.json 0.1.0) +
  `scripts/sync-version.mjs` -> `apps/web/lib/version.ts`, page `/a-propos`.
- Vitrine SEO (phase 4) : route groups `(marketing)` (SSG) / `(app)` (noindex sur /play).
  Pages roles generees depuis le moteur (`/roles`, `/roles/[id]`), page `/regles` avec FAQ.
  `sitemap.xml`, `robots.txt` (disallow /play), metadata + OpenGraph, JSON-LD
  (SoftwareApplication, FAQPage, Article).
- PWA (phase 3) : service worker Serwist (`@serwist/next`), `manifest.webmanifest`
  installable + icone, SW desactive cote desktop. Sauvegarde/reprise de partie :
  `serializeGame`/`deserializeGame` + action `LOAD_STATE` du moteur, bouton "Reprendre".
- `@mj/storage` (phase 2) : `PersistencePort` local-first + adapters `IndexedDB` (blobs
  audio, leve la contrainte musique) et `Memory` (tests/SSR), `selectAdapter`.
- `@mj/sound-config` (phase 2) : donnees son sorties du moteur, `getProfileAssignments`,
  `resolveEventSound` (resolution pure eventId -> source).
- `@mj/ui` (phase 2) : contextes React `GameProvider`/`useGame` (reducer du moteur +
  minuteur) et `StorageProvider`/`usePersistence`.
- `apps/web` (phase 2) : theme Tailwind v4 portant les tokens legacy (sombre, rouge sang,
  Cinzel/Crimson/JetBrains Mono), providers au root, route `/play` cablee au moteur.
- Moteur de jeu `@mj/game-engine` (phase 1) : portage TS pur du SPA legacy. Types,
  donnees (`ROLES_DATA`/`NIGHT_ORDER_BASE`/`TEAM_INFO`), regles pures
  (`checkWinConditions`, `computeNightOrder`, `cascadeDeaths`, `getRandomRolePool`),
  `gameReducer` (~47 actions) et `makeInitialState`. Aleatoire/temps injectes
  (`EngineDeps`), etat serialisable (`id`/`schemaVersion`/`updatedAt`). 29 tests Vitest.
- Ajout du role `IDIOT` (utilise mais absent du legacy) ; `ancienPowerLost` formalise.
- Scaffold du monorepo Turborepo + pnpm (phase 0) : workspaces `apps/*` et `packages/*`.
- Outillage : `.npmrc` (node-linker=hoisted), `turbo.json`, `tsconfig.base.json`, ESLint flat + `eslint-plugin-boundaries`, Prettier, Vitest.
- `packages/tsconfig` (presets TS partages) et `packages/game-engine` (scaffold + test d'amorce).
- `apps/web` : Next.js App Router minimal avec export statique conditionnel (`BUILD_TARGET=desktop`).
- `apps/desktop` : scaffold Electron (protocole custom `app://`, preload `window.mjNative`, config electron-builder).

### Retire

- `project/` (copie dupliquee du SPA) et `mj.zip`.
