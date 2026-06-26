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
export type { MjNativeBridge, AssetMetaInput } from './native';
export { MemoryAdapter } from './adapters/memory';
export { IndexedDBAdapter } from './adapters/indexeddb';
export { ElectronFsAdapter } from './adapters/electron-fs';
export { selectAdapter } from './select';
