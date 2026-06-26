import type { MjNative } from './preload';

declare global {
  interface Window {
    // Absente cote web (fallback IndexedDB) ; presente cote desktop.
    mjNative?: MjNative;
  }
}

export {};
