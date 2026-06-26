/**
 * @mj/ui - composants et contextes React partages (web + desktop).
 * Portage du SPA legacy : ecrans de jeu consommant le moteur (@mj/game-engine),
 * la persistance (@mj/storage) et la couche son (@mj/sound-config).
 */
export { GameProvider, useGame } from './game';
export { StorageProvider, usePersistence } from './persistence';
export { SoundProvider, useSound } from './sound';
export { AppRoot } from './components/AppRoot';
export { HomeScreen } from './components/HomeScreen';
export { PlayerRoleAssign } from './components/PlayerRoleAssign';
export { AssignScreen } from './components/AssignScreen';
export { GameScreen } from './components/GameScreen';
export { NightPhase } from './components/NightPhase';
export { DawnPhase, DayPhase, VotePhase, HunterPhase, VictoryScreen } from './components/DayPhase';
export { SoundConfigModal } from './components/SoundConfigModal';
