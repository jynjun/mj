# Lecons

Format : `[date] | ce qui a mal tourne | regle pour l'eviter`

- [2026-06-26] | Initialisation du fichier (phase 0, aucune lecon corrective encore). | Mettre a jour ce fichier apres toute correction ou erreur significative.
- [2026-06-26] | `const X = {...} satisfies Record<RoleId, Role>` conserve le type litteral etroit : les props optionnelles (firstNightOnly...) deviennent inaccessibles a l'usage generique (TS2339). | Pour une table de donnees lue generiquement, annoter aussi le type : `const X: Record<RoleId, Role> = {...} satisfies Record<RoleId, Role>`.
