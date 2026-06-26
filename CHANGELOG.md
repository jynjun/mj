# Changelog

Format base sur [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/), versioning [SemVer](https://semver.org/lang/fr/).

## [Non publie]

### Ajoute

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
