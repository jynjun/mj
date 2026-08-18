import { describe, expect, it } from 'vitest';
import { checkWinConditions } from './winConditions';
import { mkPlayer } from '../testutil';

describe('checkWinConditions', () => {
  it('1) priorite Amoureux : seuls survivants tous les deux', () => {
    const wins = checkWinConditions([
      mkPlayer(1, 'VILLAGEOIS', { lovers: 2 }),
      mkPlayer(2, 'LOUP_GAROU', { lovers: 1 }),
    ]);
    expect(wins[0]?.key).toBe('lovers');
  });

  it('2) Loup Blanc seul survivant', () => {
    const wins = checkWinConditions([mkPlayer(1, 'LOUP_BLANC')]);
    expect(wins.map((w) => w.key)).toEqual(['loup_blanc']);
  });

  it('3) Joueur de Flute : tous les autres survivants enchantes', () => {
    const wins = checkWinConditions([
      mkPlayer(1, 'JOUEUR_FLUTE'),
      mkPlayer(2, 'VILLAGEOIS', { enchanted: true }),
      mkPlayer(3, 'VILLAGEOIS', { enchanted: true }),
    ]);
    expect(wins[0]?.key).toBe('flute');
  });

  it('4) Fossoyeur : un unique camp restant, aucun independant', () => {
    const wins = checkWinConditions([
      mkPlayer(1, 'FOSSOYEUR'),
      mkPlayer(2, 'VILLAGEOIS'),
      mkPlayer(3, 'VOYANTE'),
    ]);
    expect(wins.map((w) => w.key)).toEqual(['fossoyeur']);
  });

  it('5) Loups-Garous : un seul adversaire restant', () => {
    const wins = checkWinConditions([
      mkPlayer(1, 'LOUP_GAROU'),
      mkPlayer(2, 'LOUP_GAROU'),
      mkPlayer(3, 'VILLAGEOIS'),
    ]);
    expect(wins[0]?.key).toBe('wolves');
  });

  it('6) Village : plus aucune menace', () => {
    const wins = checkWinConditions([mkPlayer(1, 'VILLAGEOIS'), mkPlayer(2, 'VOYANTE')]);
    expect(wins.map((w) => w.key)).toEqual(['village']);
  });

  it('7) aucune victoire : partie en cours', () => {
    const wins = checkWinConditions([
      mkPlayer(1, 'LOUP_GAROU'),
      mkPlayer(2, 'VILLAGEOIS'),
      mkPlayer(3, 'VILLAGEOIS'),
    ]);
    expect(wins).toEqual([]);
  });

  it('8) aucun survivant : aucune victoire', () => {
    const wins = checkWinConditions([
      mkPlayer(1, 'LOUP_GAROU', { alive: false }),
      mkPlayer(2, 'VILLAGEOIS', { alive: false }),
    ]);
    expect(wins).toEqual([]);
  });
});
