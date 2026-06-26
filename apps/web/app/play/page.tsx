'use client';

import { useGame, usePersistence } from '@mj/ui';
import { ROLES_DATA } from '@mj/game-engine';
import { useState } from 'react';

/**
 * Scaffold de la route de jeu (phase 2) : prouve le cablage moteur <-> app
 * (reducer pur consomme via useGame) et la persistance (usePersistence).
 * Le portage complet de NightPhase / DayPhase depuis le SPA legacy suit.
 */
export default function PlayPage() {
  const { state, dispatch } = useGame();
  const persistence = usePersistence();
  const [saved, setSaved] = useState(false);

  const count = state.playerCount || 8;

  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col gap-6 p-8">
      <h1 className="font-display text-2xl font-bold text-blood-light">Partie</h1>

      <section className="flex flex-wrap items-center gap-3">
        <button
          className="rounded border border-blood/40 px-3 py-1.5 hover:bg-blood/10"
          onClick={() => dispatch({ type: 'SET_PLAYER_COUNT', count: count - 1 })}
        >
          -
        </button>
        <span className="font-mono text-lg">{count} joueurs</span>
        <button
          className="rounded border border-blood/40 px-3 py-1.5 hover:bg-blood/10"
          onClick={() => dispatch({ type: 'SET_PLAYER_COUNT', count: count + 1 })}
        >
          +
        </button>
        <button
          className="rounded border border-blood/50 bg-blood/10 px-3 py-1.5 font-semibold text-blood-light hover:bg-blood/20"
          onClick={() => dispatch({ type: 'INIT_PLAYERS' })}
        >
          Distribuer les roles
        </button>
        {state.players.length > 0 && (
          <button
            className="rounded border border-gold/50 bg-gold/10 px-3 py-1.5 font-semibold text-gold-light hover:bg-gold/20"
            onClick={() => dispatch({ type: 'START_GAME' })}
          >
            Commencer
          </button>
        )}
        <button
          className="rounded border border-parchment/30 px-3 py-1.5 hover:bg-parchment/10"
          onClick={async () => {
            await persistence.saveGame(state);
            setSaved(true);
          }}
        >
          {saved ? 'Sauvegarde ✓' : 'Sauvegarder'}
        </button>
      </section>

      <p className="font-mono text-sm text-parchment/50">
        ecran : {state.screen} - phase : {state.gamePhase} - nuit {state.nightCount}
      </p>

      {state.nightOrder.length > 0 && (
        <p className="font-mono text-xs text-parchment/50">
          Ordre de nuit : {state.nightOrder.join(' → ')}
        </p>
      )}

      {state.players.length > 0 && (
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {state.players.map((p) => (
            <li
              key={p.id}
              className="rounded border border-blood/15 bg-surface/60 px-3 py-2 text-sm"
            >
              <span className="mr-1">{ROLES_DATA[p.role].emoji}</span>
              {p.name} - {ROLES_DATA[p.role].name}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
