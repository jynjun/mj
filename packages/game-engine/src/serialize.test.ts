import { describe, expect, it } from 'vitest';
import { deserializeGame, serializeGame } from './serialize';
import { gameReducer } from './reducer';
import { makeInitialState } from './state';
import { createTestDeps } from './rng';

const deps = createTestDeps();

describe('sauvegarde / reprise', () => {
  it('serialize puis deserialize : aller-retour fidele', () => {
    const s = { ...makeInitialState(deps), playerCount: 12, nightCount: 3 };
    const round = deserializeGame(serializeGame(s));
    expect(round).toEqual(s);
  });

  it('deserialize rejette un schema inconnu', () => {
    const bad = serializeGame({ ...makeInitialState(deps), schemaVersion: 999 });
    expect(() => deserializeGame(bad)).toThrow(/schema/i);
  });

  it('LOAD_STATE remplace l\'etat et conserve son updatedAt', () => {
    const saved = { ...makeInitialState(deps), id: 'saved', nightCount: 5, updatedAt: 123 };
    const current = makeInitialState(deps);
    const r = gameReducer(current, { type: 'LOAD_STATE', state: saved }, deps);
    expect(r.id).toBe('saved');
    expect(r.nightCount).toBe(5);
    expect(r.updatedAt).toBe(123);
  });
});
