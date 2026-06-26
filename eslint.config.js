import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import boundaries from 'eslint-plugin-boundaries';

/**
 * Frontieres de dependances (cf. tasks/plan-refonte.md) :
 *  - game-engine ne depend de RIEN
 *  - storage / sound-config ne dependent que de types (et de game-engine pour les types)
 *  - ui depend de tout (engine, storage, sound-config)
 *  - apps/* consomment tout
 */
export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/.next/**',
      '**/out/**',
      '**/dist/**',
      '**/.turbo/**',
      // SPA legacy : reference a porter, non lintee
      'js/**',
      'jsx/**',
      'chats/**',
      'index.html',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['packages/**/*.{ts,tsx}', 'apps/**/*.{ts,tsx}'],
    plugins: { boundaries },
    settings: {
      'boundaries/elements': [
        { type: 'game-engine', pattern: 'packages/game-engine/**' },
        { type: 'storage', pattern: 'packages/storage/**' },
        { type: 'sound-config', pattern: 'packages/sound-config/**' },
        { type: 'ui', pattern: 'packages/ui/**' },
        { type: 'app', pattern: 'apps/**' },
      ],
    },
    rules: {
      'boundaries/element-types': [
        'error',
        {
          default: 'disallow',
          rules: [
            { from: 'game-engine', allow: [] },
            { from: 'storage', allow: ['game-engine'] },
            { from: 'sound-config', allow: ['game-engine'] },
            { from: 'ui', allow: ['game-engine', 'storage', 'sound-config'] },
            { from: 'app', allow: ['game-engine', 'storage', 'sound-config', 'ui'] },
          ],
        },
      ],
    },
  },
  {
    // Fichiers de config / build : pas de regle boundaries
    files: ['**/*.config.{js,mjs,ts}', '**/vitest.config.ts'],
    rules: {},
  },
);
