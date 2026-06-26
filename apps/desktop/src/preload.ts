import { contextBridge, ipcRenderer } from 'electron';
import type { MjNativeBridge } from '@mj/storage';

/**
 * Capacites natives exposees a la page via contextBridge -> window.mjNative.
 * Implemente le contrat MjNativeBridge (@mj/storage) : parties et musiques sont
 * persistees en fichiers natifs par le process main (cf. ElectronFsAdapter).
 */
const version =
  process.argv.find((a) => a.startsWith('--mj-version='))?.split('=')[1] ?? '0.0.0';

const mjNative: MjNativeBridge = {
  platform: 'desktop',
  version,
  saveGame: (state) => ipcRenderer.invoke('mj:saveGame', state),
  loadGame: (id) => ipcRenderer.invoke('mj:loadGame', id),
  listGames: () => ipcRenderer.invoke('mj:listGames'),
  deleteGame: (id) => ipcRenderer.invoke('mj:deleteGame', id),
  putAsset: (meta, bytes) => ipcRenderer.invoke('mj:putAsset', meta, bytes),
  getAsset: (id) => ipcRenderer.invoke('mj:getAsset', id),
  listAssets: () => ipcRenderer.invoke('mj:listAssets'),
  deleteAsset: (id) => ipcRenderer.invoke('mj:deleteAsset', id),
};

contextBridge.exposeInMainWorld('mjNative', mjNative);
