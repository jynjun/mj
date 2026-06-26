/**
 * @mj/sound-config - resolution pure de la configuration son (eventId -> source).
 * Sans IO ni React. Les donnees son vivent ici, pas dans le moteur de jeu.
 */
export type { SoundOption, SoundEvent } from './events';
export { AVAILABLE_SOUNDS, SOUND_EVENTS, buildSoundEvents } from './events';
export type { SoundProfileOption, Assignments } from './profiles';
export { SOUND_PROFILES, getProfileAssignments } from './profiles';
export { resolveEventSound } from './resolve';
