import { describe, expect, it } from 'vitest';
import { computeNightOrder } from './nightOrder';
import { mkPlayer } from '../testutil';

describe('computeNightOrder', () => {
  it('1) firstNightOnly : present nuit 1, absent ensuite', () => {
    expect(computeNightOrder(1)).toContain('VOLEUR');
    expect(computeNightOrder(2)).not.toContain('VOLEUR');
  });

  it('2) secondNightOnly : Chien-Loup uniquement nuit 2', () => {
    expect(computeNightOrder(1)).not.toContain('CHIEN_LOUP');
    expect(computeNightOrder(2)).toContain('CHIEN_LOUP');
    expect(computeNightOrder(3)).not.toContain('CHIEN_LOUP');
  });

  it('3) notBeforeNight : Demenageur absent nuit 1, present des la nuit 2', () => {
    expect(computeNightOrder(1)).not.toContain('DEMENAGEUR');
    expect(computeNightOrder(2)).toContain('DEMENAGEUR');
  });

  it('4) everyOtherNight : Loup Blanc seulement les nuits impaires', () => {
    expect(computeNightOrder(1)).toContain('LOUP_BLANC');
    expect(computeNightOrder(2)).not.toContain('LOUP_BLANC');
    expect(computeNightOrder(3)).toContain('LOUP_BLANC');
  });

  it('5) filtre les morts, mais le Fossoyeur garde son tour via diggerRole', () => {
    const morts = [mkPlayer(1, 'VOYANTE', { alive: false }), mkPlayer(2, 'LOUP_GAROU')];
    const o = computeNightOrder(1, morts);
    expect(o).toContain('LOUP_GAROU');
    expect(o).not.toContain('VOYANTE');

    const fossoyeurAdopte = [mkPlayer(1, 'VILLAGEOIS', { diggerRole: 'VILLAGEOIS' })];
    expect(computeNightOrder(3, fossoyeurAdopte)).toEqual(['FOSSOYEUR']);
  });

  it('6) repositionnement : le Demenageur passe avant-dernier', () => {
    const o = computeNightOrder(2);
    expect(o[o.length - 2]).toBe('DEMENAGEUR');
    expect(o[o.length - 1]).toBe('JOUEUR_FLUTE');
  });

  it('7) ordre de base de la nuit 1', () => {
    expect(computeNightOrder(1)).toEqual([
      'VOLEUR', 'ENFANT_SAUVAGE', 'CUPIDON', 'SOEUR_1', 'VOYANTE', 'RENARD',
      'LOUP_GAROU', 'GRAND_MECHANT_LOUP', 'LOUP_BLANC', 'SORCIERE', 'SALVATEUR',
      'CORBEAU', 'FOSSOYEUR',
    ]);
  });
});
