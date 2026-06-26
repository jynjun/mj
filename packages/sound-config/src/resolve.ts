import type { Assignments } from './profiles';

/**
 * Resolution pure : eventId -> soundId a jouer (ou null si aucun / non assigne).
 * Sans IO : la lecture du blob audio est faite par la couche app. C'est le coeur
 * de @mj/sound-config (cf. tasks/plan-refonte.md).
 */
export function resolveEventSound(eventId: string, assignments: Assignments): string | null {
  const soundId = assignments[eventId];
  if (!soundId || soundId === 'aucun') return null;
  return soundId;
}
