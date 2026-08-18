import type { GameState } from '@mj/game-engine';
import type { AssetMeta, PersistencePort, SavedGameMeta, StoredAsset } from '../types';
import { toAssetMeta, toSavedGameMeta } from '../types';

/** Adapter en memoire (tests, fallback SSR). Aucune persistance reelle. */
export class MemoryAdapter implements PersistencePort {
  private games = new Map<string, GameState>();
  private assets = new Map<string, StoredAsset>();
  private listeners = new Set<() => void>();

  private notify(): void {
    this.listeners.forEach((l) => l());
  }

  async saveGame(state: GameState): Promise<void> {
    this.games.set(state.id, state);
    this.notify();
  }

  async loadGame(id: string): Promise<GameState | null> {
    return this.games.get(id) ?? null;
  }

  async listGames(): Promise<SavedGameMeta[]> {
    return [...this.games.values()]
      .map(toSavedGameMeta)
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }

  async deleteGame(id: string): Promise<void> {
    this.games.delete(id);
    this.notify();
  }

  async putAsset(asset: StoredAsset): Promise<void> {
    this.assets.set(asset.id, asset);
    this.notify();
  }

  async getAsset(id: string): Promise<StoredAsset | null> {
    return this.assets.get(id) ?? null;
  }

  async listAssets(): Promise<AssetMeta[]> {
    return [...this.assets.values()].map(toAssetMeta);
  }

  async deleteAsset(id: string): Promise<void> {
    this.assets.delete(id);
    this.notify();
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}
