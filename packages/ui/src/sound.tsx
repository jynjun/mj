'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { resolveEventSound } from '@mj/sound-config';
import { usePersistence } from './persistence';

export interface SoundLibraryEntry {
  name: string;
  type: string;
}

interface SoundConfig {
  enabled: boolean;
  library: Record<string, SoundLibraryEntry>;
  assignments: Record<string, string>;
}

interface SoundContextValue {
  enabled: boolean;
  toggle(): void;
  showModal: boolean;
  setShowModal(v: boolean): void;
  library: Record<string, SoundLibraryEntry>;
  assignments: Record<string, string>;
  playingEventId: string | null;
  playSound(eventId: string, overrideSoundId?: string): void;
  addSound(file: File): Promise<void>;
  deleteSound(id: string): Promise<void>;
  setAssignment(eventId: string, soundId: string): void;
}

const CONFIG_KEY = 'mj_sound_config';
const SoundContext = createContext<SoundContextValue | null>(null);

function loadConfig(): SoundConfig {
  const empty: SoundConfig = { enabled: true, library: {}, assignments: {} };
  if (typeof localStorage === 'undefined') return empty;
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    return raw ? { ...empty, ...(JSON.parse(raw) as SoundConfig) } : empty;
  } catch {
    return empty;
  }
}

/**
 * Couche son (hors moteur) : config legere (activation, noms, assignations) en
 * localStorage, blobs audio en IndexedDB via la persistance. C'est la migration
 * son de la phase 2 : fini le dataURL localStorage qui cassait sur gros fichiers.
 */
export function SoundProvider({ children }: { children: ReactNode }) {
  const persistence = usePersistence();
  const [config, setConfig] = useState<SoundConfig>({ enabled: true, library: {}, assignments: {} });
  const [showModal, setShowModal] = useState(false);
  const [playingEventId, setPlayingEventId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const eventRef = useRef<string | null>(null);
  const urlRef = useRef<string | null>(null);

  // Chargement de la config apres montage (evite l'acces localStorage en SSR).
  useEffect(() => {
    setConfig(loadConfig());
  }, []);

  const persist = useCallback((next: SoundConfig) => {
    setConfig(next);
    try {
      localStorage.setItem(CONFIG_KEY, JSON.stringify(next));
    } catch {
      /* quota/SSR : ignore */
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
    eventRef.current = null;
    setPlayingEventId(null);
  }, []);

  const playSound = useCallback(
    (eventId: string, overrideSoundId?: string) => {
      // Toggle : si le meme son joue, on l'arrete.
      if (eventRef.current === eventId && audioRef.current) {
        stop();
        return;
      }
      stop();
      if (!config.enabled) return;
      const soundId = overrideSoundId ?? resolveEventSound(eventId, config.assignments);
      if (!soundId) return;
      void persistence.getAsset(soundId).then((asset) => {
        if (!asset) return;
        const url = URL.createObjectURL(asset.blob);
        const audio = new Audio(url);
        audioRef.current = audio;
        urlRef.current = url;
        eventRef.current = eventId;
        setPlayingEventId(eventId);
        audio.onended = () => stop();
        void audio.play().catch(() => stop());
      });
    },
    [config.enabled, config.assignments, persistence, stop],
  );

  const addSound = useCallback(
    async (file: File) => {
      const id = `snd_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      await persistence.putAsset({ id, name: file.name, type: file.type || 'audio/mpeg', blob: file });
      persist({
        ...config,
        library: { ...config.library, [id]: { name: file.name, type: file.type || 'audio/mpeg' } },
      });
    },
    [config, persist, persistence],
  );

  const deleteSound = useCallback(
    async (id: string) => {
      await persistence.deleteAsset(id);
      const library = { ...config.library };
      delete library[id];
      const assignments = { ...config.assignments };
      Object.keys(assignments).forEach((k) => {
        if (assignments[k] === id) delete assignments[k];
      });
      persist({ ...config, library, assignments });
    },
    [config, persist, persistence],
  );

  const setAssignment = useCallback(
    (eventId: string, soundId: string) => {
      const assignments = { ...config.assignments };
      if (soundId) assignments[eventId] = soundId;
      else delete assignments[eventId];
      persist({ ...config, assignments });
    },
    [config, persist],
  );

  const toggle = useCallback(() => {
    persist({ ...config, enabled: !config.enabled });
  }, [config, persist]);

  const value = useMemo<SoundContextValue>(
    () => ({
      enabled: config.enabled,
      toggle,
      showModal,
      setShowModal,
      library: config.library,
      assignments: config.assignments,
      playingEventId,
      playSound,
      addSound,
      deleteSound,
      setAssignment,
    }),
    [config, showModal, playingEventId, playSound, addSound, deleteSound, setAssignment, toggle],
  );

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}

export function useSound(): SoundContextValue {
  const ctx = useContext(SoundContext);
  if (!ctx) throw new Error('useSound doit etre utilise dans un <SoundProvider>.');
  return ctx;
}
