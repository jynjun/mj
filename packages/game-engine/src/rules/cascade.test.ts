import { describe, expect, it } from 'vitest';
import { cascadeDeaths } from './cascade';
import { createTestDeps } from '../rng';
import { mkPlayer } from '../testutil';

describe('cascadeDeaths', () => {
  it('amoureux transitif : la chaine de chagrin se propage', () => {
    const players = [
      mkPlayer(1, 'VILLAGEOIS', { alive: false, lovers: 2 }),
      mkPlayer(2, 'VILLAGEOIS', { lovers: 3 }),
      mkPlayer(3, 'VILLAGEOIS', { lovers: 2 }),
    ];
    const res = cascadeDeaths(players, [1], 1, 'night', createTestDeps());
    expect(res.players.find((p) => p.id === 2)?.alive).toBe(false);
    expect(res.players.find((p) => p.id === 3)?.alive).toBe(false);
    expect(res.extra.map((d) => d.playerId).sort()).toEqual([2, 3]);
  });

  it('Enfant Sauvage : devient Loup-Garou si son modele meurt', () => {
    const players = [
      mkPlayer(1, 'VILLAGEOIS', { alive: false }),
      mkPlayer(2, 'ENFANT_SAUVAGE', { model: 1 }),
    ];
    const res = cascadeDeaths(players, [1], 1, 'night', createTestDeps());
    expect(res.players.find((p) => p.id === 2)?.role).toBe('LOUP_GAROU');
    expect(res.notes.length).toBeGreaterThan(0);
  });

  it('pas de double-mort : un amoureux deja mort ne redeclenche rien', () => {
    const players = [
      mkPlayer(1, 'VILLAGEOIS', { alive: false, lovers: 2 }),
      mkPlayer(2, 'VILLAGEOIS', { alive: false, lovers: 1 }),
    ];
    const res = cascadeDeaths(players, [1, 2], 1, 'night', createTestDeps());
    expect(res.extra).toEqual([]);
  });
});
