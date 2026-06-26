import type { GameState } from '@mj/game-engine';
import type { AssetMeta, PersistencePort, SavedGameMeta, StoredAsset } from '../types';
import type { MjNativeBridge } from '../native';

/**
 * Adapter desktop : delegue au pont natif Electron (fichiers locaux). Convertit
 * les Blob audio en ArrayBuffer pour le passage IPC (cf. tasks/plan-refonte.md,
 * musique en fichiers natifs cote desktop).
 */
export class ElectronFsAdapter implements PersistencePort {
  constructor(private readonly native: MjNativeBridge) {}

  saveGame(state: GameState): Promise<void> {
    return this.native.saveGame(state);
  }

  loadGame(id: string): Promise<GameState | null> {
    return this.native.loadGame(id);
  }

  listGames(): Promise<SavedGameMeta[]> {
    return this.native.listGames();
  }

  deleteGame(id: string): Promise<void> {
    return this.native.deleteGame(id);
  }

  async putAsset(asset: StoredAsset): Promise<void> {
    const bytes = await asset.blob.arrayBuffer();
    await this.native.putAsset({ id: asset.id, name: asset.name, type: asset.type }, bytes);
  }

  async getAsset(id: string): Promise<StoredAsset | null> {
    const res = await this.native.getAsset(id);
    if (!res) return null;
    return {
      id: res.meta.id,
      name: res.meta.name,
      type: res.meta.type,
      blob: new Blob([res.bytes], { type: res.meta.type }),
    };
  }

  listAssets(): Promise<AssetMeta[]> {
    return this.native.listAssets();
  }

  deleteAsset(id: string): Promise<void> {
    return this.native.deleteAsset(id);
  }
}
