import { ROLES_DATA } from '@mj/game-engine';
import type { RoleId } from '@mj/game-engine';

export interface SoundOption {
  id: string;
  name: string;
}

export interface SoundEvent {
  id: string;
  label: string;
  category: string;
  icon: string;
  defaultSound: string;
}

/** Sons integres disponibles (portage de window.AVAILABLE_SOUNDS). */
export const AVAILABLE_SOUNDS: SoundOption[] = [
  { id: 'aucun', name: 'Aucun' },
  { id: 'gong', name: 'Gong grave' },
  { id: 'cloche', name: 'Cloche' },
  { id: 'tintement', name: 'Tintement' },
  { id: 'hurlement', name: 'Hurlement' },
  { id: 'flute', name: 'Flute' },
  { id: 'tambour', name: 'Tambour' },
  { id: 'mort', name: 'Ton funebre' },
  { id: 'sorciere', name: 'Sortilege' },
  { id: 'chasse', name: 'Coup de feu' },
  { id: 'mystere', name: 'Mystere' },
  { id: 'fanfare', name: 'Fanfare' },
];

/** Evenements de base (phases, evenements, minuteur, fins). */
const BASE_EVENTS: SoundEvent[] = [
  { id: 'night_start', label: 'Debut de la nuit', category: 'Phase', icon: '\u{1F319}', defaultSound: 'gong' },
  { id: 'day_start', label: 'Lever du soleil', category: 'Phase', icon: '\u{2600}\u{FE0F}', defaultSound: 'cloche' },
  { id: 'death_night', label: 'Mort dans la nuit', category: 'Evenement', icon: '\u{1F480}', defaultSound: 'mort' },
  { id: 'death_day', label: 'Vote', category: 'Evenement', icon: '\u{2696}\u{FE0F}', defaultSound: 'mort' },
  { id: 'hunter_shot', label: 'Tir du Chasseur', category: 'Evenement', icon: '\u{1F3F9}', defaultSound: 'chasse' },
  { id: 'timer_end', label: 'Fin du minuteur', category: 'Minuteur', icon: '\u{23F0}', defaultSound: 'tintement' },
  { id: 'win_village', label: 'Victoire Village', category: 'Fin', icon: '\u{1F3C6}', defaultSound: 'fanfare' },
  { id: 'win_wolves', label: 'Victoire Loups-Garous', category: 'Fin', icon: '\u{1F43A}', defaultSound: 'hurlement' },
  { id: 'win_loup_blanc', label: 'Victoire Loup Blanc', category: 'Fin', icon: '\u{1F315}', defaultSound: 'mystere' },
  { id: 'win_flute', label: 'Victoire Joueur de Flute', category: 'Fin', icon: '\u{1F3B5}', defaultSound: 'mystere' },
  { id: 'win_fossoyeur', label: 'Victoire Fossoyeur', category: 'Fin', icon: '\u{26CF}\u{FE0F}', defaultSound: 'mystere' },
  { id: 'win_lovers', label: 'Victoire Amoureux', category: 'Fin', icon: '\u{1F498}', defaultSound: 'fanfare' },
];

function defaultRoleSound(role: (typeof ROLES_DATA)[RoleId]): string {
  if (role.team === 'loupgarou' || role.team === 'loupblanc') return 'hurlement';
  if (role.team === 'solitaire') return 'mystere';
  if (role.id === 'SORCIERE') return 'sorciere';
  if (role.id === 'CHASSEUR') return 'chasse';
  if (role.id === 'VOYANTE') return 'flute';
  return 'tintement';
}

/**
 * Construit la liste complete des evenements son : evenements de base + un
 * evenement "reveil" par role appele la nuit ou a la mort (portage de la
 * generation dynamique de window.SOUND_EVENTS_FULL). Deterministe.
 */
export function buildSoundEvents(): SoundEvent[] {
  const events = [...BASE_EVENTS];
  Object.values(ROLES_DATA).forEach((r) => {
    if (r.nightOrder !== null || r.onDeath) {
      events.push({
        id: 'role_' + r.id,
        label: r.name,
        category: 'Reveil des roles',
        icon: r.emoji,
        defaultSound: defaultRoleSound(r),
      });
    }
  });
  return events;
}

/** Liste complete des evenements son (construite une fois). */
export const SOUND_EVENTS: SoundEvent[] = buildSoundEvents();
