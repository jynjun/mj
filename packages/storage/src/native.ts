import type { GameState } from '@mj/game-engine';
import type { AssetMeta, SavedGameMeta } from './types';

/** Metadonnees d'asset transmises au pont natif (sans le Blob). */
export type AssetMetaInput = Omit<AssetMeta, 'size'>;

/**
 * Contrat du pont natif expose par Electron (preload -> window.mjNative).
 * Cote desktop, parties et musiques sont stockees en fichiers natifs ; les blobs
 * transitent en ArrayBuffer (serialisable sur le canal IPC). Absent cote web.
 */
export interface MjNativeBridge {
  platform: 'desktop';
  version: string;

  saveGame(state: GameState): Promise<void>;
  loadGame(id: string): Promise<GameState | null>;
  listGames(): Promise<SavedGameMeta[]>;
  deleteGame(id: string): Promise<void>;

  putAsset(meta: AssetMetaInput, bytes: ArrayBuffer): Promise<void>;
  getAsset(id: string): Promise<{ meta: AssetMeta; bytes: ArrayBuffer } | null>;
  listAssets(): Promise<AssetMeta[]>;
  deleteAsset(id: string): Promise<void>;
}

declare global {
  interface Window {
    mjNative?: MjNativeBridge;
  }
}
