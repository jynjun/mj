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

## Phase 1 - Moteur TS (`feature/phase-1-moteur`) - EN COURS

- [x] Porter `types`, `data/roles`, `rules/*` (winConditions, nightOrder, cascade, rolePool), `reducer`, `state`, `rng`
- [x] Corriger incoherences : ajout `IDIOT` a ROLES_DATA, formalisation `ancienPowerLost`
- [x] Sortir le son du moteur (couche app/phase 2) ; etat serialisable (id/schemaVersion/updatedAt)
- [x] Injection aleatoire/temps (`EngineDeps`, `createTestDeps`) pour snapshots stables
- [x] Tests Vitest : 8 cas `checkWinConditions`, 7 cas `computeNightOrder`, 3 cas `cascadeDeaths`, 8 scenarios reducer, 3 amorces -> **29 verts**
- [ ] Commit + push `feature/phase-1-moteur`, puis merge dans `develop`

## Phase 2 - App web (`feature/phase-2-app-web`) - EN COURS

- [x] `packages/storage` : `PersistencePort` + `MemoryAdapter` + `IndexedDBAdapter` (idb) + `selectAdapter`, blobs audio (4 tests)
- [x] `packages/sound-config` : donnees son (hors moteur) + `getProfileAssignments` + `resolveEventSound` (4 tests)
- [x] `packages/ui` : `GameProvider`/`useGame` (reducer du moteur + minuteur) + `StorageProvider`/`usePersistence`
- [x] `apps/web` : theme Tailwind v4 (tokens legacy : sombre, rouge sang, Cinzel/Crimson/JetBrains), providers, route `/play` cablee au moteur + persistance
- [x] Verifs : 37 tests verts, typecheck/lint/build/export desktop OK
- [ ] RESTE : portage complet des composants `NightPhase`/`DayPhase`/`GameScreen`/`AssignScreen` legacy dans `@mj/ui` (parite fonctionnelle, ~800 l.) - a faire avec verification visuelle
- [ ] RESTE : migration effective des sons importes vers IndexedDB dans l'UI (modale son) + primitives shadcn/ui
- [ ] Commit + push, merge dans `develop`

## Phase 3 - PWA (`feature/phase-3-pwa`) - EN COURS

- [x] Serwist (`@serwist/next`) : `app/sw.ts`, `withSerwist` dans next.config, SW desactive en desktop
- [x] `app/manifest.ts` (installable, `force-static` pour l'export desktop) + icone SVG
- [x] Sauvegarde/reprise : `serializeGame`/`deserializeGame` (moteur) + action `LOAD_STATE` ; bouton "Reprendre" (UI) via `@mj/storage`
- [x] Verifs : 40 tests verts, build web (sw.js + manifest.webmanifest), export desktop propre (sans SW)
- [ ] RESTE : verification Lighthouse PWA / offline reel (necessite navigateur)
- [ ] Commit + push, merge dans `develop`

## Phase 4 - SEO / vitrine (`feature/phase-4-seo-vitrine`) - EN COURS

- [x] Route groups `(marketing)` (SSG) et `(app)` (noindex sur /play)
- [x] Pages roles generees depuis `@mj/game-engine` : `/roles` + `/roles/[id]` (23 pages SSG)
- [x] `/regles` avec FAQ ; JSON-LD SoftwareApplication (accueil), FAQPage (regles), Article (role)
- [x] `sitemap.ts` (vitrine + roles), `robots.ts` (disallow /play) ; metadata + OpenGraph
- [x] Verifs : 40 tests verts, build web + export desktop (toutes routes force-static), robots/sitemap corrects
- [ ] RESTE : OG images dynamiques par role via next/og (reportees : risque export statique) ; Lighthouse SEO reel
- [ ] Commit + push, merge dans `develop`

## Phase 5

- Phase 5 : `apps/desktop` Electron complet (ElectronFsAdapter, electron-builder par OS, "A propos")
