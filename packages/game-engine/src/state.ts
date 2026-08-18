import type { GameState } from './types';
import type { EngineDeps } from './rng';
import { defaultDeps } from './rng';

/** Version du schema de l'etat serialise (incremente a chaque migration). */
export const SCHEMA_VERSION = 1;

/**
 * Etat initial du moteur (portage de makeInitial, jsx/AppContext.jsx).
 * Aucun acces localStorage : la configuration son et l'audio sortent du moteur
 * (couche app / @mj/sound-config en phase 2). Etat serialisable, avec id /
 * schemaVersion / updatedAt pour la sauvegarde-reprise et la sync future.
 */
export function makeInitialState(deps: EngineDeps = defaultDeps): GameState {
  return {
    id: deps.nextId(),
    schemaVersion: SCHEMA_VERSION,
    updatedAt: deps.now(),

    screen: 'home',
    selectedGame: 'loup-garou',
    playerCount: 0,
    roleConfig: {},
    players: [],
    assignIndex: 0,
    gamePhase: 'night',
    nightCount: 1,
    currentRoleIndex: 0,
    nightOrder: [],
    nightVictimId: null,
    witchLifePotion: true,
    witchDeathPotion: true,
    witchDeathInfo: null,
    witchLifeInfo: null,
    deaths: [],
    pendingDeaths: [],
    timerSeconds: 0,
    timerRunning: false,
    selectedPlayerId: null,
    layoutMode: 'focused',
    hunterDying: null,
    loversSelected: [],
    nightActions: [],
    dawnNotes: [],
    sisterRevengeUsed: false,
    sisterRevengeInfo: null,
    ancienPowerLost: false,
    victory: null,
  };
}
