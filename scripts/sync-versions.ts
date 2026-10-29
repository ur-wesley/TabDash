import { readFile, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const JSON_INDENT = 2,
  MANIFEST_BASE = 'manifest.json',
  MANIFEST_PATTERN = /^manifest\..+\.json$/u,
  rootDir = join(import.meta.dirname, '..'),
  rootPkgRaw = await readFile(join(rootDir, 'package.json'), 'utf8'),
  rootPkg = JSON.parse(rootPkgRaw) as { version?: string },
  { version } = rootPkg;

if (version === undefined || version === '') {
  throw new Error('[sync-versions] could not read version from root package.json');
}

const publicDir = join(rootDir, 'extension', 'public'),
  dirEntries = await readdir(publicDir),
  files = dirEntries.filter(
    (fileName) => fileName === MANIFEST_BASE || MANIFEST_PATTERN.test(fileName),
  );

for (const file of files) {
  const manifestPath = join(publicDir, file),
    manifestRaw = await readFile(manifestPath, 'utf8'),
    manifest = JSON.parse(manifestRaw) as { version?: string };
  if (manifest.version === version) {
    // eslint-disable-next-line no-console
    console.log(`[sync-versions] ${file} already at ${version}`);
    continue;
  }
  manifest.version = version;
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, JSON_INDENT)}\n`);
  // eslint-disable-next-line no-console
  console.log(`[sync-versions] ${file} -> ${version}`);
}
