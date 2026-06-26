/**
 * @mj/storage - persistance local-first, backend-ready.
 * Port + adapters (IndexedDB, Memory). Aucune dependance React.
 */
export type {
  PersistencePort,
  SavedGameMeta,
  StoredAsset,
  AssetMeta,
} from './types';
export { toSavedGameMeta, toAssetMeta } from './types';
export { MemoryAdapter } from './adapters/memory';
export { IndexedDBAdapter } from './adapters/indexeddb';
export { selectAdapter } from './select';
