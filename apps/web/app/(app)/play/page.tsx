'use client';

import { AppRoot } from '@mj/ui';

/**
 * Route de jeu : l'application complete (portee du SPA legacy) consomme le
 * moteur, la persistance et la couche son via les providers du layout racine.
 */
export default function PlayPage() {
  return <AppRoot />;
}
