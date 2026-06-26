import type { PersistencePort } from './types';
import { MemoryAdapter } from './adapters/memory';
import { IndexedDBAdapter } from './adapters/indexeddb';
import { ElectronFsAdapter } from './adapters/electron-fs';

/**
 * Choisit l'adapter selon l'environnement. Injection unique au root de l'app
 * (cf. tasks/plan-refonte.md) : desktop (window.mjNative) -> fichiers natifs,
 * navigateur -> IndexedDB, sinon (SSR/tests) -> memoire.
 */
export function selectAdapter(): PersistencePort {
  if (typeof window !== 'undefined' && window.mjNative) {
    return new ElectronFsAdapter(window.mjNative);
  }
  if (typeof indexedDB !== 'undefined') {
    return new IndexedDBAdapter();
  }
  return new MemoryAdapter();
}
