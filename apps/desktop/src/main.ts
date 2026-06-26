import { app, BrowserWindow, ipcMain, net, protocol } from 'electron';
import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { GameState } from '@mj/game-engine';
import type { AssetMeta, AssetMetaInput, SavedGameMeta } from '@mj/storage';

/**
 * Le build desktop charge l'export statique de @mj/web via un protocole custom
 * `app://` (pas `file://` : le routing client en depend). cf. tasks/plan-refonte.md.
 * Le service worker reste desactive cote desktop. Parties et musiques sont
 * persistees en fichiers natifs (userData), exposes a la page via le preload.
 */

const WEB_EXPORT_DIR = join(__dirname, '../../web/out');
const gamesDir = (): string => join(app.getPath('userData'), 'games');
const musicDir = (): string => join(app.getPath('userData'), 'music');

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'app',
    privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true },
  },
]);

function resolveAssetPath(requestUrl: string): string {
  const url = new URL(requestUrl);
  let pathname = decodeURIComponent(url.pathname);
  if (pathname === '/' || pathname === '') {
    pathname = '/index.html';
  } else if (!pathname.includes('.')) {
    pathname = `${pathname}.html`;
  }
  return join(WEB_EXPORT_DIR, pathname);
}

async function ensureDirs(): Promise<void> {
  await fs.mkdir(gamesDir(), { recursive: true });
  await fs.mkdir(musicDir(), { recursive: true });
}

function toArrayBuffer(buf: Buffer): ArrayBuffer {
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
}

function registerIpc(): void {
  ipcMain.handle('mj:saveGame', async (_e, state: GameState) => {
    await fs.writeFile(join(gamesDir(), `${state.id}.json`), JSON.stringify(state), 'utf8');
  });

  ipcMain.handle('mj:loadGame', async (_e, id: string): Promise<GameState | null> => {
    try {
      return JSON.parse(await fs.readFile(join(gamesDir(), `${id}.json`), 'utf8')) as GameState;
    } catch {
      return null;
    }
  });

  ipcMain.handle('mj:listGames', async (): Promise<SavedGameMeta[]> => {
    const files = (await fs.readdir(gamesDir())).filter((f) => f.endsWith('.json'));
    const metas: SavedGameMeta[] = [];
    for (const f of files) {
      try {
        const s = JSON.parse(await fs.readFile(join(gamesDir(), f), 'utf8')) as GameState;
        metas.push({
          id: s.id, updatedAt: s.updatedAt, nightCount: s.nightCount,
          playerCount: s.playerCount, gamePhase: s.gamePhase,
        });
      } catch {
        /* fichier corrompu : ignore */
      }
    }
    return metas.sort((a, b) => b.updatedAt - a.updatedAt);
  });

  ipcMain.handle('mj:deleteGame', async (_e, id: string) => {
    await fs.rm(join(gamesDir(), `${id}.json`), { force: true });
  });

  ipcMain.handle('mj:putAsset', async (_e, meta: AssetMetaInput, bytes: ArrayBuffer) => {
    await fs.writeFile(join(musicDir(), `${meta.id}.bin`), Buffer.from(bytes));
    const full: AssetMeta = { ...meta, size: bytes.byteLength };
    await fs.writeFile(join(musicDir(), `${meta.id}.json`), JSON.stringify(full), 'utf8');
  });

  ipcMain.handle('mj:getAsset', async (_e, id: string) => {
    try {
      const meta = JSON.parse(await fs.readFile(join(musicDir(), `${id}.json`), 'utf8')) as AssetMeta;
      const buf = await fs.readFile(join(musicDir(), `${id}.bin`));
      return { meta, bytes: toArrayBuffer(buf) };
    } catch {
      return null;
    }
  });

  ipcMain.handle('mj:listAssets', async (): Promise<AssetMeta[]> => {
    const files = (await fs.readdir(musicDir())).filter((f) => f.endsWith('.json'));
    const metas: AssetMeta[] = [];
    for (const f of files) {
      try {
        metas.push(JSON.parse(await fs.readFile(join(musicDir(), f), 'utf8')) as AssetMeta);
      } catch {
        /* ignore */
      }
    }
    return metas;
  });

  ipcMain.handle('mj:deleteAsset', async (_e, id: string) => {
    await fs.rm(join(musicDir(), `${id}.bin`), { force: true });
    await fs.rm(join(musicDir(), `${id}.json`), { force: true });
  });
}

function createWindow(): void {
  const win = new BrowserWindow({
    width: 1100,
    height: 800,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      additionalArguments: [`--mj-version=${app.getVersion()}`],
    },
  });

  void win.loadURL('app://local/index.html');
}

void app.whenReady().then(async () => {
  protocol.handle('app', (request) => {
    const filePath = resolveAssetPath(request.url);
    return net.fetch(pathToFileURL(filePath).toString());
  });

  await ensureDirs();
  registerIpc();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
