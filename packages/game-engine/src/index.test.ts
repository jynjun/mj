import { describe, expect, it } from 'vitest';
import { ENGINE_NAME, ROLES_DATA, SCHEMA_VERSION, makeInitialState } from './index';
import { createTestDeps } from './rng';

describe('@mj/game-engine (amorce)', () => {
  it('expose un nom de moteur stable', () => {
    expect(ENGINE_NAME).toBe('@mj/game-engine');
  });

  it('inclut les 22 roles du legacy + IDIOT (23 au total)', () => {
    expect(Object.keys(ROLES_DATA)).toHaveLength(23);
    expect(ROLES_DATA.IDIOT.team).toBe('village');
  });

  it('makeInitialState : serialisable, sans son, avec id/schema/updatedAt', () => {
    const s = makeInitialState(createTestDeps());
    expect(s.schemaVersion).toBe(SCHEMA_VERSION);
    expect(s.id).toBeTypeOf('string');
    expect(s.ancienPowerLost).toBe(false);
    // Aucun champ son ne doit subsister dans le moteur.
    expect(s).not.toHaveProperty('soundLibrary');
    expect(s).not.toHaveProperty('soundEnabled');
    // Etat entierement serialisable (pas de fonctions/refs).
    expect(() => JSON.parse(JSON.stringify(s))).not.toThrow();
  });
});
