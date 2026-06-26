import type { RoleId } from '../types';

/**
 * Pool de roles aleatoire equilibre selon le nombre de joueurs (portage de
 * window.getRandomRolePool). Deterministe : la composition ne depend que de
 * `count` (le melange final est fait separement, via le Rng injecte).
 */
export function getRandomRolePool(count: number): RoleId[] {
  count = Math.max(4, Math.min(25, count));
  const wolves = Math.max(1, Math.floor(count / 4));
  const pool: RoleId[] = [];
  for (let i = 0; i < wolves; i++) pool.push('LOUP_GAROU');
  pool.push('VOYANTE', 'SORCIERE', 'CHASSEUR');
  if (count >= 10) pool.push('CUPIDON');
  if (count >= 12) pool.push('SALVATEUR');
  if (count >= 15) pool.push('CORBEAU');
  if (count >= 18) pool.push('RENARD');
  // Regle : si Enfant Sauvage, il faut au moins Montreur d'Ours ou Renard
  if (count >= 14) {
    pool.push('ENFANT_SAUVAGE');
    const hasGuard = pool.indexOf('RENARD') !== -1 || pool.indexOf('MONTREUR_OURS') !== -1;
    if (!hasGuard) pool.push('MONTREUR_OURS');
  }
  while (pool.length < count) pool.push('VILLAGEOIS');
  return pool.slice(0, count);
}
