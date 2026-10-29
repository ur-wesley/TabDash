import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

const distAssetsDir = join(import.meta.dirname, '..', 'extension', 'dist', 'assets');
const requiredMarkers = ['i-mdi-cog', 'i-mdi-weather-sunny'] as const;

const cssFiles = (await readdir(distAssetsDir)).filter((name) => name.endsWith('.css'));
if (cssFiles.length === 0) {
  throw new Error('[verify-extension-icon-css] no CSS files in extension/dist/assets');
}

let combined = '';
for (const file of cssFiles) {
  combined += await readFile(join(distAssetsDir, file), 'utf8');
}

for (const marker of requiredMarkers) {
  if (!combined.includes(marker)) {
    throw new Error(
      `[verify-extension-icon-css] missing ${marker} in dist CSS — UnoCSS icon rules were not emitted`,
    );
  }
}

console.log('[verify-extension-icon-css] ok');
