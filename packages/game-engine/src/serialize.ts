import type { GameState } from './types';
import { SCHEMA_VERSION } from './state';

/**
 * Serialisation des parties pour la sauvegarde/reprise (phase 3). L'etat est
 * deja entierement serialisable (aucune fonction/ref) : JSON suffit. Le champ
 * schemaVersion permet de migrer les anciennes sauvegardes a l'avenir.
 */

export function serializeGame(state: GameState): string {
  return JSON.stringify(state);
}

/** Hook de migration : aujourd'hui seul le schema courant est connu. */
function migrate(data: GameState): GameState {
  if (data.schemaVersion === SCHEMA_VERSION) return data;
  // Aucune migration anterieure pour l'instant (schema v1).
  throw new Error(
    `Version de schema non supportee : ${data.schemaVersion} (attendu ${SCHEMA_VERSION}).`,
  );
}

export function deserializeGame(json: string): GameState {
  const data = JSON.parse(json) as GameState;
  return migrate(data);
}
