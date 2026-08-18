import type { Player, RoleId } from '../types';
import { NIGHT_ORDER_BASE, ROLES_DATA } from '../data/roles';

/**
 * Ordre dynamique des reveils de la nuit (portage de window.computeNightOrder).
 * Le parametre _roleConfig du legacy est supprime (il etait ignore : les roles
 * viennent des joueurs).
 */
export function computeNightOrder(nightCount: number, players?: Player[]): RoleId[] {
  const order = NIGHT_ORDER_BASE.filter((roleId) => {
    const role = ROLES_DATA[roleId];
    if (!role) return false;
    if (role.firstNightOnly && nightCount > 1) return false;
    if (role.secondNightOnly && nightCount !== 2) return false;
    if (role.notBeforeNight && nightCount < role.notBeforeNight) return false;
    if (role.everyOtherNight && nightCount % 2 === 0) return false;
    if (players) {
      const hasAlive = players.some((p) => {
        if (!p.alive) return false;
        if (p.role === roleId) return true;
        // Le Fossoyeur garde son tour d'exhumation meme apres avoir adopte un role
        if (roleId === 'FOSSOYEUR' && p.diggerRole !== null && p.diggerRole !== undefined) return true;
        return false;
      });
      if (!hasAlive) return false;
    }
    return true;
  });

  // Le Demenageur passe toujours en avant-dernier dans l'ordre de la nuit
  const di = order.indexOf('DEMENAGEUR');
  if (di !== -1 && order.length >= 2) {
    order.splice(di, 1);
    order.splice(order.length - 1, 0, 'DEMENAGEUR');
  }
  return order;
}
