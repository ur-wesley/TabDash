import { defineConfig } from 'bumpp';

export default defineConfig({
  commit: 'chore: release v{version}',
  execute: 'bun scripts/sync-versions.ts',
  files: [
    'package.json',
    'extension/package.json',
    'companion/package.json',
    'backend/package.json',
    'extension/public/manifest.json',
    'extension/public/manifest.chrome.json',
    'extension/public/manifest.edge.json',
    'extension/public/manifest.firefox.json',
  ],
  push: true,
  recursive: true,
  tag: 'v{version}',
});
