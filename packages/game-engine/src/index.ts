/**
 * @mj/game-engine - moteur de jeu TypeScript pur (zero dependance React/DOM).
 *
 * Phase 0 : scaffold uniquement. Le portage des types, donnees (ROLES_DATA),
 * rules (checkWinConditions, computeNightOrder, cascadeDeaths, getRandomRolePool)
 * et du reducer depuis le SPA legacy est la phase 1 (cf. tasks/plan-refonte.md).
 */

/** Version du schema de l'etat de jeu serialise (incremente a chaque migration). */
export const SCHEMA_VERSION = 1 as const;

/** Identifiant du moteur, utile pour tracer les sauvegardes. */
export const ENGINE_NAME = '@mj/game-engine' as const;
