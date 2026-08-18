/**
 * Injection de l'aleatoire, du temps et des identifiants.
 *
 * Le moteur ne doit JAMAIS appeler Math.random / Date.now directement : ces
 * dependances sont passees via EngineDeps, ce qui rend les parties scriptees
 * deterministes et les snapshots de tests stables.
 */

/** Generateur pseudo-aleatoire : renvoie un nombre dans [0, 1). */
export type Rng = () => number;

export interface EngineDeps {
  rng: Rng;
  now: () => number;
  /** Genere un identifiant unique (ex. Death.id), serialisable. */
  nextId: () => string;
}

/** PRNG deterministe (mulberry32) pour les tests. */
export function createSeededRng(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fabrique un generateur d'identifiants incremental a partir d'un prefixe. */
export function createIdFactory(prefix = 'd'): () => string {
  let n = 0;
  return () => `${prefix}${++n}`;
}

/** Dependances reelles (production) : aleatoire systeme + horloge. */
export const defaultDeps: EngineDeps = {
  rng: Math.random,
  now: Date.now,
  nextId: () => `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
};

/** Dependances deterministes pour les tests (seed + ids incrementaux + horloge figee). */
export function createTestDeps(seed = 1, fixedNow = 0): EngineDeps {
  return {
    rng: createSeededRng(seed),
    now: () => fixedNow,
    nextId: createIdFactory('d'),
  };
}

/** Melange de Fisher-Yates utilisant le Rng injecte (non mutant). */
export function shuffle<T>(arr: readonly T[], rng: Rng): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = a[i]!;
    a[i] = a[j]!;
    a[j] = tmp;
  }
  return a;
}
