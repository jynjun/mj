# Lecons

Format : `[date] | ce qui a mal tourne | regle pour l'eviter`

- [2026-06-26] | Initialisation du fichier (phase 0, aucune lecon corrective encore). | Mettre a jour ce fichier apres toute correction ou erreur significative.
- [2026-06-26] | `const X = {...} satisfies Record<RoleId, Role>` conserve le type litteral etroit : les props optionnelles (firstNightOnly...) deviennent inaccessibles a l'usage generique (TS2339). | Pour une table de donnees lue generiquement, annoter aussi le type : `const X: Record<RoleId, Role> = {...} satisfies Record<RoleId, Role>`.
- [2026-06-26] | Avec `output: export`, une route metadata dynamique (`manifest.ts`) casse le build desktop ("dynamic not configured"). | Ajouter `export const dynamic = 'force-static'` aux routes metadata destinees a l'export statique.
- [2026-06-26] | `noUncheckedIndexedAccess` global rend le portage d'UI (acces tableau/index frequents) tres penible (des dizaines d'erreurs), et `apps/web` type-checke les sources de `@mj/ui`. | Garder le flag strict uniquement sur `@mj/game-engine` (coeur), le desactiver dans la base pour l'UI/les apps.
- [2026-06-26] | Serwist ecrit `sw.js` dans `apps/web/public/` (artefact) ; un build web precedent laisse ce fichier, copie ensuite dans l'export desktop malgre SW desactive. | Gitignorer les fichiers Serwist generes ; un export desktop propre (sans build web prealable) ne les contient pas.
