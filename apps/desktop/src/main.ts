import { app, BrowserWindow, net, protocol } from 'electron';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

/**
 * Le build desktop charge l'export statique de @mj/web via un protocole custom
 * `app://` (pas `file://` : le routing client et les service workers en dependent).
 * cf. tasks/plan-refonte.md. Le service worker reste desactive cote desktop.
 *
 * Phase 0 : scaffold. Le cablage final (packaging electron-builder, ElectronFsAdapter
 * pour la musique en fichiers natifs) est la phase 5.
 */

const WEB_EXPORT_DIR = join(__dirname, '../../web/out');

// Doit etre declare avant app.ready.
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
    // Route client sans extension -> page exportee correspondante.
    pathname = `${pathname}.html`;
  }
  return join(WEB_EXPORT_DIR, pathname);
}

function createWindow(): void {
  const win = new BrowserWindow({
    width: 1100,
    height: 800,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  void win.loadURL('app://local/index.html');
}

void app.whenReady().then(() => {
  protocol.handle('app', (request) => {
    const filePath = resolveAssetPath(request.url);
    return net.fetch(pathToFileURL(filePath).toString());
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
