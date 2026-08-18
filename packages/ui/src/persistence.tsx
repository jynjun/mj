'use client';

import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { PersistencePort } from '@mj/storage';

const PersistenceContext = createContext<PersistencePort | null>(null);

/**
 * Injecte le port de persistance au root de l'app. L'UI consomme usePersistence(),
 * jamais l'implementation : le jour du backend, on change d'adapter sans toucher l'UI.
 */
export function StorageProvider({
  adapter,
  children,
}: {
  adapter: PersistencePort;
  children: ReactNode;
}) {
  return <PersistenceContext.Provider value={adapter}>{children}</PersistenceContext.Provider>;
}

export function usePersistence(): PersistencePort {
  const ctx = useContext(PersistenceContext);
  if (!ctx) throw new Error('usePersistence doit etre utilise dans un <StorageProvider>.');
  return ctx;
}
