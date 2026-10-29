import { mkdir, readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { execSync } from 'node:child_process';

const rootDir = join(import.meta.dirname, '..');
const bundleDir = join(rootDir, 'extension', 'bundle');
const pkg = JSON.parse(await readFile(join(rootDir, 'package.json'), 'utf8')) as {
  version?: string;
};
const version = pkg.version ?? '0.0.0';
const archiveName = `tabdash-${version}-source.zip`;
const archivePath = join(bundleDir, archiveName);
const maxBytes = 200 * 1024 * 1024;

await mkdir(bundleDir, { recursive: true });

execSync(`git archive --format=zip -o "${archivePath}" HEAD`, {
  cwd: rootDir,
  stdio: 'inherit',
});

const { size } = await stat(archivePath);
if (size > maxBytes) {
  throw new Error(
    `[package-amo-source] ${archiveName} is ${(size / 1024 / 1024).toFixed(1)} MB (limit 200 MB)`,
  );
}

console.log(`[package-amo-source] ${archivePath} (${(size / 1024 / 1024).toFixed(2)} MB)`);
