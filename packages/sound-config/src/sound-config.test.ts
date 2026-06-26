import { describe, expect, it } from 'vitest';
import { buildSoundEvents } from './events';
import { getProfileAssignments } from './profiles';
import { resolveEventSound } from './resolve';

describe('@mj/sound-config', () => {
  it('genere un evenement reveil par role appele la nuit ou a la mort', () => {
    const events = buildSoundEvents();
    const roleEvents = events.filter((e) => e.id.startsWith('role_'));
    // Chaque role appele la nuit (nightOrder != null) ou onDeath (Chasseur).
    expect(roleEvents.length).toBeGreaterThan(0);
    expect(roleEvents.some((e) => e.id === 'role_CHASSEUR')).toBe(true);
    expect(roleEvents.some((e) => e.id === 'role_VILLAGEOIS')).toBe(false);
  });

  it('profil silencieux : tout a "aucun"', () => {
    const a = getProfileAssignments('silencieux');
    expect(Object.values(a).every((s) => s === 'aucun')).toBe(true);
  });

  it('profil defaut : reprend les sons par defaut des evenements', () => {
    const a = getProfileAssignments('defaut');
    expect(a['night_start']).toBe('gong');
    expect(a['win_village']).toBe('fanfare');
  });

  it('resolveEventSound : null si aucun ou non assigne', () => {
    expect(resolveEventSound('night_start', { night_start: 'gong' })).toBe('gong');
    expect(resolveEventSound('night_start', { night_start: 'aucun' })).toBeNull();
    expect(resolveEventSound('inconnu', {})).toBeNull();
  });
});
