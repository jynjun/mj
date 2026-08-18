'use client';

import { useGame } from '../game';
import { useSound } from '../sound';
import { HomeScreen } from './HomeScreen';
import { PlayerRoleAssign } from './PlayerRoleAssign';
import { AssignScreen } from './AssignScreen';
import { GameScreen } from './GameScreen';
import { SoundConfigModal } from './SoundConfigModal';

/**
 * Racine de l'application de jeu : aiguille selon state.screen
 * (home -> playerRoleAssign -> assign -> game) et superpose la modale son.
 */
export function AppRoot() {
  const { state } = useGame();
  const { showModal } = useSound();
  return (
    <div style={{ width: '100%', height: '100dvh', minHeight: '560px', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      {state.screen === 'home' && <HomeScreen />}
      {state.screen === 'playerRoleAssign' && <PlayerRoleAssign />}
      {state.screen === 'assign' && <AssignScreen />}
      {state.screen === 'game' && <GameScreen />}
      {showModal && <SoundConfigModal />}
    </div>
  );
}
