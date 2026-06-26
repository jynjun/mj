/**
 * @mj/game-engine - moteur de jeu Loup-Garou TypeScript pur (zero dep React/DOM).
 * Portage du SPA legacy (js/gameData.js + jsx/AppContext.jsx).
 */

export const ENGINE_NAME = '@mj/game-engine' as const;

export * from './types';
export { SCHEMA_VERSION, makeInitialState } from './state';
export { gameReducer } from './reducer';
export {
  GAMES_LIST,
  ROLES_DATA,
  NIGHT_ORDER_BASE,
  TEAM_INFO,
  teamOf,
} from './data/roles';
export { checkWinConditions } from './rules/winConditions';
export { computeNightOrder } from './rules/nightOrder';
export { cascadeDeaths } from './rules/cascade';
export type { CascadeResult } from './rules/cascade';
export { getRandomRolePool } from './rules/rolePool';
export type { EngineDeps, Rng } from './rng';
export { createSeededRng, createIdFactory, createTestDeps, defaultDeps, shuffle } from './rng';
