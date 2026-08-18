import withSerwistInit from '@serwist/next';

/**
 * Deux artefacts depuis le meme code (cf. tasks/plan-refonte.md) :
 *  - build web standard (serveur) par defaut, avec PWA (Serwist) ;
 *  - export statique pour Electron quand BUILD_TARGET=desktop
 *    (charge ensuite via le protocole custom app://). Le service worker est
 *    DESACTIVE cote desktop (precache app:// redondant).
 */
const isDesktop = process.env.BUILD_TARGET === 'desktop';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@mj/game-engine', '@mj/ui', '@mj/storage', '@mj/sound-config'],
  ...(isDesktop
    ? {
        output: 'export',
        assetPrefix: './',
        images: { unoptimized: true },
      }
    : {}),
};

const withSerwist = withSerwistInit({
  swSrc: 'app/sw.ts',
  swDest: 'public/sw.js',
  // SW desactive en desktop (et donc pour l'export statique Electron).
  disable: isDesktop,
});

export default withSerwist(nextConfig);
