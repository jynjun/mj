# TODO - Refonte MJ App

Plan complet : `tasks/plan-refonte.md`. Strategie Git : une branche par phase mergee dans `develop`.

## Phase 0 - Setup monorepo (`feature/phase-0-setup`) - EN COURS

- [x] Creer la branche `feature/phase-0-setup` depuis `develop`
- [x] Retirer `project/` (copie) et `mj.zip`
- [x] Outillage racine : `package.json`, `pnpm-workspace.yaml`, `.npmrc` (hoisted), `turbo.json`, `tsconfig.base.json`, `.gitignore`
- [x] ESLint flat + `eslint-plugin-boundaries` (frontieres engine/storage/sound-config/ui/app), Prettier
- [x] `packages/tsconfig` (presets base/node/react)
- [x] `packages/game-engine` : scaffold + test Vitest d'amorce
- [x] `apps/web` : Next.js App Router minimal + export conditionnel `BUILD_TARGET=desktop`
- [x] `apps/desktop` : Electron scaffold (main + preload + protocole `app://`, electron-builder.yml) - non lance (headless)
- [x] `tasks/todo.md`, `tasks/lessons.md`, `CHANGELOG.md`
- [x] Verifs : `pnpm install`, `pnpm test` (2 verts), `pnpm lint` (3 OK), `pnpm build` (web), `BUILD_TARGET=desktop pnpm build` (export `apps/web/out`), `tsc` desktop (main.js/preload.js)
- [x] Commit + push `feature/phase-0-setup`
- [ ] Merge dans `develop` (sur ta validation)

## A faire dans les phases dediees (rappels)

- Packages `storage`, `sound-config`, `ui` : crees en phase 2 (eviter le code mort).
- POC Electron : validation GUI reelle reportee (impossible en environnement headless) -> phase 5.

## Phase 1 - Moteur TS (`feature/phase-1-moteur`)

- [ ] Porter `types`, `roles.data`, `rules/*` (winConditions, nightOrder, cascade, rolePool), `reducer`, `state`, `rng`
- [ ] Corriger incoherences : ajouter `IDIOT` a ROLES_DATA, formaliser `ancienPowerLost`
- [ ] Tests Vitest : 8 cas `checkWinConditions`, 7 cas `computeNightOrder`, `cascadeDeaths`, snapshots reducer

## Phases 2-5

- Phase 2 : `apps/web` (parite + theme Tailwind/shadcn), `packages/storage` (IndexedDB, migration sons), `packages/sound-config`
- Phase 3 : PWA Serwist (offline, sauvegarde/reprise)
- Phase 4 : vitrine SSG `(marketing)` + SEO (sitemap/robots/OG/JSON-LD)
- Phase 5 : `apps/desktop` Electron complet (ElectronFsAdapter, electron-builder par OS, "A propos")
