import type { PersistencePort } from './types';
import { MemoryAdapter } from './adapters/memory';
import { IndexedDBAdapter } from './adapters/indexeddb';

/**
 * Choisit l'adapter selon l'environnement. Injection unique au root de l'app
 * (cf. tasks/plan-refonte.md). Desktop (window.mjNative -> ElectronFsAdapter)
 * arrive en phase 5 ; ici, IndexedDB en navigateur, Memory sinon (SSR/tests).
 */
export function selectAdapter(): PersistencePort {
  if (typeof indexedDB !== 'undefined') {
    return new IndexedDBAdapter();
  }
  return new MemoryAdapter();
}
