import { copyFile, mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { execSync } from 'node:child_process';

const rootDir = join(import.meta.dirname, '..');
const extensionDir = join(rootDir, 'extension');
const distDir = join(extensionDir, 'dist');
const bundleDir = join(extensionDir, 'bundle');
const browsers = ['firefox', 'chrome', 'edge'] as const;

const run = (command: string, cwd: string): void => {
  execSync(command, { cwd, stdio: 'inherit' });
};

run('bun run --filter @ur-wesley/tabdash-extension build', rootDir);
run('bun scripts/verify-extension-icon-css.ts', rootDir);

await mkdir(bundleDir, { recursive: true });
await rm(bundleDir, { recursive: true, force: true });
await mkdir(bundleDir, { recursive: true });

for (const browser of browsers) {
  const browserManifest = join(distDir, `manifest.${browser}.json`);
  const distManifest = join(distDir, 'manifest.json');
  await copyFile(browserManifest, distManifest);
  if (browser === 'firefox') {
    run(`bun x web-ext lint -s ${distDir}`, extensionDir);
  }
  run(
    `bun x web-ext build -s ${distDir} -a ${bundleDir} -n tabdash-${browser}.zip --overwrite-dest`,
    extensionDir,
  );
  // eslint-disable-next-line no-console
  console.log(`[bundle-store] ${browser} ok`);
}
