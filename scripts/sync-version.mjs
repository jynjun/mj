#!/usr/bin/env node
/**
 * Aligne la version sur la source de verite (apps/desktop/package.json) :
 * genere apps/web/lib/version.ts (affichage "A propos"). cf. tasks/plan-refonte.md.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const desktopPkg = JSON.parse(await readFile(join(root, 'apps/desktop/package.json'), 'utf8'));
const version = desktopPkg.version;

const out = join(root, 'apps/web/lib/version.ts');
const content = `// Genere par scripts/sync-version.mjs - ne pas editer a la main.
// Source de verite : apps/desktop/package.json
export const APP_VERSION = '${version}';
`;
await writeFile(out, content, 'utf8');
console.log(`version synchronisee : ${version} -> apps/web/lib/version.ts`);
