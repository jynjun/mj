import { describe, expect, it } from 'vitest';
import { makeInitialState, createTestDeps } from '@mj/game-engine';
import { MemoryAdapter } from './memory';
import type { StoredAsset } from '../types';

describe('MemoryAdapter', () => {
  it('sauvegarde, recharge et liste les parties', async () => {
    const a = new MemoryAdapter();
    const s = { ...makeInitialState(createTestDeps()), id: 'g1', playerCount: 8, nightCount: 2 };
    await a.saveGame(s);
    expect((await a.loadGame('g1'))?.id).toBe('g1');
    const list = await a.listGames();
    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({ id: 'g1', playerCount: 8, nightCount: 2 });
    await a.deleteGame('g1');
    expect(await a.loadGame('g1')).toBeNull();
  });

  it('liste les parties triees par updatedAt decroissant', async () => {
    const a = new MemoryAdapter();
    await a.saveGame({ ...makeInitialState(createTestDeps()), id: 'old', updatedAt: 100 });
    await a.saveGame({ ...makeInitialState(createTestDeps()), id: 'new', updatedAt: 200 });
    const list = await a.listGames();
    expect(list.map((g) => g.id)).toEqual(['new', 'old']);
  });

  it('stocke et relit des assets binaires (blob), expose la taille', async () => {
    const a = new MemoryAdapter();
    const blob = new Blob(['x'.repeat(50)], { type: 'audio/mpeg' });
    const asset: StoredAsset = { id: 's1', name: 'gong', type: 'audio/mpeg', blob };
    await a.putAsset(asset);
    expect((await a.getAsset('s1'))?.name).toBe('gong');
    const metas = await a.listAssets();
    expect(metas[0]).toMatchObject({ id: 's1', name: 'gong', type: 'audio/mpeg', size: 50 });
    await a.deleteAsset('s1');
    expect(await a.getAsset('s1')).toBeNull();
  });

  it('notifie les abonnes a chaque mutation', async () => {
    const a = new MemoryAdapter();
    let n = 0;
    const off = a.subscribe(() => { n++; });
    await a.saveGame({ ...makeInitialState(createTestDeps()), id: 'g' });
    off();
    await a.deleteGame('g');
    expect(n).toBe(1);
  });
});
