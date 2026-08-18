import { ROLES_DATA, TEAM_INFO } from '@mj/game-engine';
import type { Role, RoleId, Team } from '@mj/game-engine';

/** URL canonique du site (surchargee par NEXT_PUBLIC_SITE_URL en prod). */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mj-app.example';

export const SITE_NAME = 'MJ App';

/** Tous les roles, dans l'ordre de declaration du moteur. */
export function allRoles(): Role[] {
  return Object.values(ROLES_DATA);
}

export function roleById(id: string): Role | undefined {
  return (ROLES_DATA as Record<string, Role>)[id];
}

/** Roles regroupes par equipe, pour l'affichage de la vitrine. */
export function rolesByTeam(): { team: Team; label: string; roles: Role[] }[] {
  const order: Team[] = ['village', 'loupgarou', 'loupblanc', 'solitaire'];
  return order
    .map((team) => ({
      team,
      label: TEAM_INFO[team].label,
      roles: allRoles().filter((r) => r.team === team),
    }))
    .filter((g) => g.roles.length > 0);
}

export function roleIds(): RoleId[] {
  return Object.keys(ROLES_DATA) as RoleId[];
}
