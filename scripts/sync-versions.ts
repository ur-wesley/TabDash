import { readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = join(dirname(fileURLToPath(import.meta.url)), '..');

const rootPkg = JSON.parse(await readFile(join(rootDir, 'package.json'), 'utf8')) as {
  version?: string;
};
const version = rootPkg.version;

if (!version) {
  throw new Error('[sync-versions] could not read version from root package.json');
}

const publicDir = join(rootDir, 'extension', 'public');
const files = (await readdir(publicDir)).filter(
  (f) => f === 'manifest.json' || /^manifest\..+\.json$/.test(f),
);

for (const file of files) {
  const path = join(publicDir, file);
  const manifest = JSON.parse(await readFile(path, 'utf8')) as { version?: string };
  if (manifest.version === version) {
    // eslint-disable-next-line no-console
    console.log(`[sync-versions] ${file} already at ${version}`);
    continue;
  }
  manifest.version = version;
  await writeFile(path, `${JSON.stringify(manifest, null, 2)}\n`);
  // eslint-disable-next-line no-console
  console.log(`[sync-versions] ${file} -> ${version}`);
}
