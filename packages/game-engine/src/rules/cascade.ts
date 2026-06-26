import type { Death, GamePhase, Player } from '../types';
import type { EngineDeps } from '../rng';

export interface CascadeResult {
  players: Player[];
  /** Morts additionnelles declenchees (amoureux), a ajouter aux pendingDeaths. */
  extra: Death[];
  /** Notes pour le recap de l'aube. */
  notes: string[];
}

/**
 * Cascade des repercussions de mort : amoureux + transformation Enfant Sauvage.
 * deadIds = ids fraichement morts (deja marques alive:false dans `players`).
 * Portage de cascadeDeaths (jsx/AppContext.jsx), avec ids deterministes (deps.nextId).
 */
export function cascadeDeaths(
  players: Player[],
  deadIds: number[],
  night: number,
  phase: GamePhase,
  deps: EngineDeps,
): CascadeResult {
  let pls = players;
  const extra: Death[] = [];
  const notes: string[] = [];
  const queue = deadIds.slice();

  while (queue.length) {
    const did = queue.shift()!;
    const dead = pls.find((p) => p.id === did);
    if (!dead) continue;

    // Amoureux : l'autre meurt de chagrin
    if (dead.lovers !== null && dead.lovers !== undefined) {
      const lover = pls.find((p) => p.id === dead.lovers);
      if (lover && lover.alive) {
        pls = pls.map((p) => (p.id === lover.id ? { ...p, alive: false, revealed: true } : p));
        extra.push({ id: deps.nextId(), playerId: lover.id, cause: 'lovers', night, phase });
        notes.push('\u{1F498} J' + lover.id + ' meurt de chagrin (amoureux de J' + did + ')');
        queue.push(lover.id);
      }
    }

    // Enfant Sauvage : si son modele meurt, il bascule Loup-Garou
    pls.forEach((p) => {
      if (p.role === 'ENFANT_SAUVAGE' && p.alive && p.model === did) {
        pls = pls.map((q) => (q.id === p.id ? { ...q, role: 'LOUP_GAROU' } : q));
        notes.push(
          "\u{1F9D2} L'Enfant Sauvage (J" + p.id + ') devient Loup-Garou - son modele J' + did + ' est mort',
        );
      }
    });
  }

  return { players: pls, extra, notes };
}
