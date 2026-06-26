import { describe, expect, it } from 'vitest';
import { ENGINE_NAME, SCHEMA_VERSION } from './index.js';

// Test d'amorce de la phase 0 : prouve que le pipeline Vitest + Turbo est vert.
// Les vrais tests du moteur (8 cas checkWinConditions, 7 cas computeNightOrder,
// cascadeDeaths, snapshots reducer) arrivent en phase 1.
describe('@mj/game-engine (scaffold phase 0)', () => {
  it('expose un nom de moteur stable', () => {
    expect(ENGINE_NAME).toBe('@mj/game-engine');
  });

  it('expose une version de schema >= 1', () => {
    expect(SCHEMA_VERSION).toBeGreaterThanOrEqual(1);
  });
});
