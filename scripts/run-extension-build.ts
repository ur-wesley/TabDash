import { execSync } from 'node:child_process';
import { join } from 'node:path';

const browser = process.argv[2] ?? 'chrome';
if (browser !== 'chrome' && browser !== 'firefox' && browser !== 'edge') {
  console.error(`[run-extension-build] unknown browser target: ${browser}`);
  process.exit(1);
}

const extensionDir = join(import.meta.dirname, '..', 'extension');

execSync('bun x vite build', {
  cwd: extensionDir,
  stdio: 'inherit',
  env: { ...process.env, TABDASH_MANIFEST: browser },
});

console.log(`[run-extension-build] dist/manifest.json <- manifest.${browser}.json`);
