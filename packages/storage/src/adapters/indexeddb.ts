import type { DBSchema, IDBPDatabase } from 'idb';
import { openDB } from 'idb';
import type { GameState } from '@mj/game-engine';
import type { AssetMeta, PersistencePort, SavedGameMeta, StoredAsset } from '../types';
import { toAssetMeta, toSavedGameMeta } from '../types';

interface MjDB extends DBSchema {
  games: { key: string; value: GameState };
  assets: { key: string; value: StoredAsset };
}

const DB_NAME = 'mj-app';
const DB_VERSION = 1;

/**
 * Adapter IndexedDB (web). Stocke parties et blobs audio : c'est ce qui leve la
 * contrainte musique (fini le dataURL localStorage qui cassait sur gros fichiers).
 */
export class IndexedDBAdapter implements PersistencePort {
  private dbp: Promise<IDBPDatabase<MjDB>>;

  constructor() {
    this.dbp = openDB<MjDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('games')) db.createObjectStore('games', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('assets')) db.createObjectStore('assets', { keyPath: 'id' });
      },
    });
  }

  async saveGame(state: GameState): Promise<void> {
    const db = await this.dbp;
    await db.put('games', state);
  }

  async loadGame(id: string): Promise<GameState | null> {
    const db = await this.dbp;
    return (await db.get('games', id)) ?? null;
  }

  async listGames(): Promise<SavedGameMeta[]> {
    const db = await this.dbp;
    const all = await db.getAll('games');
    return all.map(toSavedGameMeta).sort((a, b) => b.updatedAt - a.updatedAt);
  }

  async deleteGame(id: string): Promise<void> {
    const db = await this.dbp;
    await db.delete('games', id);
  }

  async putAsset(asset: StoredAsset): Promise<void> {
    const db = await this.dbp;
    await db.put('assets', asset);
  }

  async getAsset(id: string): Promise<StoredAsset | null> {
    const db = await this.dbp;
    return (await db.get('assets', id)) ?? null;
  }

  async listAssets(): Promise<AssetMeta[]> {
    const db = await this.dbp;
    const all = await db.getAll('assets');
    return all.map(toAssetMeta);
  }

  async deleteAsset(id: string): Promise<void> {
    const db = await this.dbp;
    await db.delete('assets', id);
  }
}
