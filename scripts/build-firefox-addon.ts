import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { execSync } from 'node:child_process';

const rootDir = join(import.meta.dirname, '..');
const extensionDir = join(rootDir, 'extension');
const distDir = join(extensionDir, 'dist');
const bundleDir = join(extensionDir, 'bundle');
const outputZip = join(bundleDir, 'tabdash-firefox.zip');

const run = (command: string, cwd: string): void => {
  execSync(command, { cwd, stdio: 'inherit' });
};

run('bun install', rootDir);
run('bun run --filter @ur-wesley/tabdash-extension build:firefox', rootDir);
run('bun scripts/verify-extension-icon-css.ts', rootDir);

await mkdir(bundleDir, { recursive: true });

run(`bun x web-ext lint -s ${distDir}`, extensionDir);
run(
  `bun x web-ext build -s ${distDir} -a ${bundleDir} -n tabdash-firefox.zip --overwrite-dest`,
  extensionDir,
);

console.log(`[build-firefox-addon] ${outputZip}`);
