import { describe, expect, it } from 'vitest';
import { makeInitialState, createTestDeps } from '@mj/game-engine';
import { ElectronFsAdapter } from './electron-fs';
import type { MjNativeBridge } from '../native';
import type { AssetMeta } from '../types';

/** Pont natif factice (Map en memoire) imitant le preload Electron. */
function fakeNative(): MjNativeBridge {
  const games = new Map<string, import('@mj/game-engine').GameState>();
  const assets = new Map<string, { meta: AssetMeta; bytes: ArrayBuffer }>();
  return {
    platform: 'desktop',
    version: '0.0.0-test',
    async saveGame(s) { games.set(s.id, s); },
    async loadGame(id) { return games.get(id) ?? null; },
    async listGames() { return [...games.values()].map((s) => ({ id: s.id, updatedAt: s.updatedAt, nightCount: s.nightCount, playerCount: s.playerCount, gamePhase: s.gamePhase })); },
    async deleteGame(id) { games.delete(id); },
    async putAsset(meta, bytes) { assets.set(meta.id, { meta: { ...meta, size: bytes.byteLength }, bytes }); },
    async getAsset(id) { return assets.get(id) ?? null; },
    async listAssets() { return [...assets.values()].map((a) => a.meta); },
    async deleteAsset(id) { assets.delete(id); },
  };
}

describe('ElectronFsAdapter', () => {
  it('delegue les parties au pont natif', async () => {
    const a = new ElectronFsAdapter(fakeNative());
    const s = { ...makeInitialState(createTestDeps()), id: 'g1', playerCount: 6 };
    await a.saveGame(s);
    expect((await a.loadGame('g1'))?.playerCount).toBe(6);
    expect(await a.listGames()).toHaveLength(1);
  });

  it('convertit Blob <-> ArrayBuffer pour les assets audio', async () => {
    const a = new ElectronFsAdapter(fakeNative());
    const blob = new Blob(['hurlement'], { type: 'audio/mpeg' });
    await a.putAsset({ id: 's1', name: 'loup', type: 'audio/mpeg', blob });
    const got = await a.getAsset('s1');
    expect(got?.blob.size).toBe(blob.size);
    expect(await got?.blob.text()).toBe('hurlement');
    expect((await a.listAssets())[0]).toMatchObject({ id: 's1', size: blob.size });
  });
});
