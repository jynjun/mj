import { contextBridge } from 'electron';

/**
 * Capacites natives exposees a la page via contextBridge -> window.mjNative.
 * Phase 0 : stub minimal. Les acces fichiers (dossier musique, ElectronFsAdapter)
 * et le plein ecran arrivent en phase 5.
 */
const mjNative = {
  platform: 'desktop' as const,
  version: process.versions.electron,
};

export type MjNative = typeof mjNative;

contextBridge.exposeInMainWorld('mjNative', mjNative);
