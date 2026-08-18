import type { GameState } from '@mj/game-engine';

/** Resume d'une partie sauvegardee (pour les listes de reprise). */
export interface SavedGameMeta {
  id: string;
  updatedAt: number;
  nightCount: number;
  playerCount: number;
  gamePhase: GameState['gamePhase'];
}

/** Asset binaire (musique importee) stocke hors localStorage. */
export interface StoredAsset {
  id: string;
  name: string;
  /** Type MIME (ex. audio/mpeg). */
  type: string;
  blob: Blob;
}

export interface AssetMeta {
  id: string;
  name: string;
  type: string;
  size: number;
}

/**
 * Port de persistance local-first, backend-ready (cf. tasks/plan-refonte.md).
 * L'UI consomme ce port, jamais l'implementation : le jour du backend, on ajoute
 * un adapter sans toucher l'UI. `subscribe` est un no-op aujourd'hui (sync future).
 */
export interface PersistencePort {
  saveGame(state: GameState): Promise<void>;
  loadGame(id: string): Promise<GameState | null>;
  listGames(): Promise<SavedGameMeta[]>;
  deleteGame(id: string): Promise<void>;

  /** Blobs audio : leve la contrainte musique (plus de dataURL localStorage). */
  putAsset(asset: StoredAsset): Promise<void>;
  getAsset(id: string): Promise<StoredAsset | null>;
  listAssets(): Promise<AssetMeta[]>;
  deleteAsset(id: string): Promise<void>;

  subscribe?(listener: () => void): () => void;
}

export function toSavedGameMeta(state: GameState): SavedGameMeta {
  return {
    id: state.id,
    updatedAt: state.updatedAt,
    nightCount: state.nightCount,
    playerCount: state.playerCount,
    gamePhase: state.gamePhase,
  };
}

export function toAssetMeta(asset: StoredAsset): AssetMeta {
  return { id: asset.id, name: asset.name, type: asset.type, size: asset.blob.size };
}
