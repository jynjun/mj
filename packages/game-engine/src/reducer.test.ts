import { describe, expect, it } from 'vitest';
import { gameReducer } from './reducer';
import { makeInitialState } from './state';
import { createTestDeps } from './rng';
import { mkPlayer } from './testutil';
import type { GameState, Player } from './types';

const deps = createTestDeps();

function gameWith(players: Player[], extra: Partial<GameState> = {}): GameState {
  return { ...makeInitialState(deps), screen: 'game', gamePhase: 'night', players, ...extra };
}

describe('gameReducer (scenarios)', () => {
  it('nuit -> aube : les Loups tuent leur victime', () => {
    const s = gameWith([mkPlayer(1, 'LOUP_GAROU'), mkPlayer(2, 'VILLAGEOIS')], { nightVictimId: 2 });
    const r = gameReducer(s, { type: 'PROCEED_DAWN' }, deps);
    expect(r.gamePhase).toBe('dawn');
    expect(r.players.find((p) => p.id === 2)?.alive).toBe(false);
    expect(r.deaths.some((d) => d.cause === 'wolves' && d.playerId === 2)).toBe(true);
  });

  it("l'Ancien survit a sa 1ere attaque des Loups", () => {
    const s = gameWith([mkPlayer(1, 'LOUP_GAROU'), mkPlayer(2, 'ANCIEN')], { nightVictimId: 2 });
    const r = gameReducer(s, { type: 'PROCEED_DAWN' }, deps);
    const ancien = r.players.find((p) => p.id === 2);
    expect(ancien?.alive).toBe(true);
    expect(ancien?.elderLifeUsed).toBe(true);
    expect(r.dawnNotes.length).toBeGreaterThan(0);
  });

  it('Salvateur : un joueur protege ne meurt pas', () => {
    const base = gameWith([mkPlayer(1, 'LOUP_GAROU'), mkPlayer(2, 'VILLAGEOIS')]);
    const protege = gameReducer(base, { type: 'PROTECT_PLAYER', playerId: 2 }, deps);
    const r = gameReducer({ ...protege, nightVictimId: 2 }, { type: 'PROCEED_DAWN' }, deps);
    expect(r.players.find((p) => p.id === 2)?.alive).toBe(true);
  });

  it('Sorciere : potion de mort puis annulation (undo)', () => {
    const base = gameWith([mkPlayer(1, 'SORCIERE'), mkPlayer(2, 'VILLAGEOIS')]);
    const tue = gameReducer(base, { type: 'WITCH_USE_DEATH', playerId: 2 }, deps);
    expect(tue.players.find((p) => p.id === 2)?.alive).toBe(false);
    expect(tue.witchDeathPotion).toBe(false);
    const undo = gameReducer(tue, { type: 'WITCH_UNDO_DEATH' }, deps);
    expect(undo.players.find((p) => p.id === 2)?.alive).toBe(true);
    expect(undo.witchDeathPotion).toBe(true);
    expect(undo.deaths.some((d) => d.cause === 'witch')).toBe(false);
  });

  it('Chasseur lynche : passe en phase hunter', () => {
    const s = gameWith([mkPlayer(1, 'CHASSEUR'), mkPlayer(2, 'LOUP_GAROU')], { gamePhase: 'vote' });
    const r = gameReducer(s, { type: 'ELIMINATE_PLAYER', playerId: 1 }, deps);
    expect(r.gamePhase).toBe('hunter');
    expect(r.hunterDying).toBe(1);
    expect(r.players.find((p) => p.id === 1)?.alive).toBe(false);
  });

  it('Ancien lynche : le village perd ses pouvoirs', () => {
    const s = gameWith(
      [mkPlayer(1, 'ANCIEN'), mkPlayer(2, 'VOYANTE'), mkPlayer(3, 'LOUP_GAROU')],
      { gamePhase: 'vote' },
    );
    const r = gameReducer(s, { type: 'ELIMINATE_PLAYER', playerId: 1 }, deps);
    expect(r.ancienPowerLost).toBe(true);
    expect(r.players.find((p) => p.id === 2)?.role).toBe('VILLAGEOIS');
    expect(r.players.find((p) => p.id === 3)?.role).toBe('LOUP_GAROU');
  });

  it('Voleur : prend le role de la cible, qui devient Villageois', () => {
    const s = gameWith([mkPlayer(1, 'VOLEUR'), mkPlayer(2, 'LOUP_GAROU')]);
    const r = gameReducer(s, { type: 'STEAL_ROLE', playerId: 2 }, deps);
    expect(r.players.find((p) => p.id === 1)?.role).toBe('LOUP_GAROU');
    expect(r.players.find((p) => p.id === 2)?.role).toBe('VILLAGEOIS');
    expect(r.nightOrder).toContain('LOUP_GAROU');
  });

  it('Demenageur : echange les numeros de deux joueurs', () => {
    const s = gameWith([mkPlayer(1, 'VOYANTE'), mkPlayer(2, 'SORCIERE')]);
    const r = gameReducer(s, { type: 'DEMENAGEUR_SWAP', playerIds: [1, 2] }, deps);
    expect(r.players.find((p) => p.id === 2)?.role).toBe('VOYANTE');
    expect(r.players.find((p) => p.id === 1)?.role).toBe('SORCIERE');
  });
});
