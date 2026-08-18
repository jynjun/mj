'use client';

import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import type { Dispatch, ReactNode } from 'react';
import type { Action, EngineDeps, GameState } from '@mj/game-engine';
import { defaultDeps, gameReducer, makeInitialState } from '@mj/game-engine';

interface GameContextValue {
  state: GameState;
  dispatch: Dispatch<Action>;
}

const GameContext = createContext<GameContextValue | null>(null);

/**
 * Etat global du jeu via le reducer pur du moteur. Les effets (minuteur) vivent
 * ici, hors moteur. Le son et l'audio sont geres separement (couche app).
 */
export function GameProvider({ children, deps = defaultDeps }: { children: ReactNode; deps?: EngineDeps }) {
  const reducer = useMemo(() => (s: GameState, a: Action) => gameReducer(s, a, deps), [deps]);
  const [state, dispatch] = useReducer(reducer, deps, makeInitialState);

  // Minuteur du debat (portage de l'effet de GameProvider legacy).
  useEffect(() => {
    if (!state.timerRunning) return;
    const id = setInterval(() => dispatch({ type: 'TIMER_TICK' }), 1000);
    return () => clearInterval(id);
  }, [state.timerRunning]);

  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame doit etre utilise dans un <GameProvider>.');
  return ctx;
}
