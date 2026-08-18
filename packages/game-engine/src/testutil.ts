import type { Player, RoleId } from './types';

/** Fabrique un joueur avec des valeurs par defaut, pour les tests. */
export function mkPlayer(id: number, role: RoleId, overrides: Partial<Player> = {}): Player {
  return {
    id,
    name: 'Joueur ' + id,
    role,
    alive: true,
    revealed: false,
    protected: false,
    cursed: false,
    lovers: null,
    idiotRevealed: false,
    enchanted: false,
    model: null,
    elderLifeUsed: false,
    diggerRole: null,
    ...overrides,
  };
}
