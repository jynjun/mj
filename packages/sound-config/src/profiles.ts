import type { SoundEvent } from './events';
import { SOUND_EVENTS } from './events';

export interface SoundProfileOption {
  id: string;
  name: string;
}

/** eventId -> soundId. */
export type Assignments = Record<string, string>;

/** Profils predefinis (portage de window.SOUND_PROFILES). */
export const SOUND_PROFILES: SoundProfileOption[] = [
  { id: 'defaut', name: 'Defaut' },
  { id: 'intense', name: 'Intense' },
  { id: 'discret', name: 'Discret' },
  { id: 'silencieux', name: 'Silencieux' },
];

/**
 * Calcule les assignations son d'un profil predefini (portage de
 * window.getProfileAssignments). Fonction pure.
 */
export function getProfileAssignments(profileId: string, events: SoundEvent[] = SOUND_EVENTS): Assignments {
  const a: Assignments = {};
  events.forEach((e) => {
    if (profileId === 'silencieux') {
      a[e.id] = 'aucun';
    } else if (profileId === 'intense') {
      a[e.id] = e.defaultSound === 'tintement' ? 'cloche' : e.defaultSound;
    } else if (profileId === 'discret') {
      a[e.id] = e.category === 'Phase' || e.category === 'Fin' ? e.defaultSound : 'tintement';
    } else {
      a[e.id] = e.defaultSound;
    }
  });
  return a;
}
