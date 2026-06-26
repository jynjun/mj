/**
 * Deux artefacts depuis le meme code (cf. tasks/plan-refonte.md) :
 *  - build web standard (serveur) par defaut ;
 *  - export statique pour Electron quand BUILD_TARGET=desktop
 *    (charge ensuite via le protocole custom app://).
 */
const isDesktop = process.env.BUILD_TARGET === 'desktop';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@mj/game-engine'],
  ...(isDesktop
    ? {
        output: 'export',
        assetPrefix: './',
        images: { unoptimized: true },
      }
    : {}),
};

export default nextConfig;
