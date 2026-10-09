import { readFile, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const rootDir = join(import.meta.dirname, '..'),
  rootPkg = JSON.parse(await readFile(join(rootDir, 'package.json'), 'utf8')) as {
    version?: string;
  },
  { version } = rootPkg;

if (!version) {
  throw new Error('[sync-versions] could not read version from root package.json');
}

const publicDir = join(rootDir, 'extension', 'public'),
  files = (await readdir(publicDir)).filter(
    (f) => f === 'manifest.json' || /^manifest\..+\.json$/.test(f),
  );

for (const file of files) {
  const path = join(publicDir, file),
    manifest = JSON.parse(await readFile(path, 'utf8')) as { version?: string };
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
