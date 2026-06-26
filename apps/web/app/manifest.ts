import type { MetadataRoute } from 'next';

// Genere statiquement (compatible output: export pour le build desktop).
export const dynamic = 'force-static';

/** Manifest PWA : rend l'app installable (cf. tasks/plan-refonte.md, phase 3). */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MJ App - Maitre du Jeu Loup-Garou',
    short_name: 'MJ App',
    description:
      'Assistant Maitre du Jeu pour le Loup-Garou de Thiercelieux (4 a 25 joueurs, 22 roles).',
    start_url: '/play',
    display: 'standalone',
    orientation: 'portrait',
    lang: 'fr',
    background_color: '#06030a',
    theme_color: '#c41e3a',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
    ],
  };
}
