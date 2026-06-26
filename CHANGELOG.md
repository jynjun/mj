# Changelog

Format base sur [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/), versioning [SemVer](https://semver.org/lang/fr/).

## [Non publie]

### Ajoute

- Scaffold du monorepo Turborepo + pnpm (phase 0) : workspaces `apps/*` et `packages/*`.
- Outillage : `.npmrc` (node-linker=hoisted), `turbo.json`, `tsconfig.base.json`, ESLint flat + `eslint-plugin-boundaries`, Prettier, Vitest.
- `packages/tsconfig` (presets TS partages) et `packages/game-engine` (scaffold + test d'amorce).
- `apps/web` : Next.js App Router minimal avec export statique conditionnel (`BUILD_TARGET=desktop`).
- `apps/desktop` : scaffold Electron (protocole custom `app://`, preload `window.mjNative`, config electron-builder).

### Retire

- `project/` (copie dupliquee du SPA) et `mj.zip`.
