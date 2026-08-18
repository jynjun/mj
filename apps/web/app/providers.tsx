'use client';

import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { GameProvider, SoundProvider, StorageProvider } from '@mj/ui';
import { selectAdapter } from '@mj/storage';

/**
 * Injection unique au root : persistance (IndexedDB en navigateur, Memory en SSR)
 * + etat de jeu. L'UI consomme usePersistence()/useGame().
 */
export function Providers({ children }: { children: ReactNode }) {
  const adapter = useMemo(() => selectAdapter(), []);
  return (
    <StorageProvider adapter={adapter}>
      <GameProvider>
        <SoundProvider>{children}</SoundProvider>
      </GameProvider>
    </StorageProvider>
  );
}
