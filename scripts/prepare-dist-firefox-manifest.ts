import { copyFile } from 'node:fs/promises';
import { join } from 'node:path';

const distDir = join(import.meta.dirname, '..', 'extension', 'dist');
const firefoxManifest = join(distDir, 'manifest.firefox.json');
const distManifest = join(distDir, 'manifest.json');

await copyFile(firefoxManifest, distManifest);
console.log('[prepare-dist-firefox-manifest] dist/manifest.json <- manifest.firefox.json');
