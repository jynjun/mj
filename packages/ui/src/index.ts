/**
 * @mj/ui - composants et contextes React partages (web + desktop).
 * Phase 2 : socle de contextes (jeu + persistance). Le portage des composants
 * NightPhase / DayPhase / GameScreen depuis le SPA legacy suit dans cette phase.
 */
export { GameProvider, useGame } from './game';
export { StorageProvider, usePersistence } from './persistence';
