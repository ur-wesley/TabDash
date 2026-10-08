import { defineConfig } from 'bumpp';

export default defineConfig({
  recursive: true,
  commit: 'chore: release v{version}',
  tag: 'v{version}',
  push: true,
  execute: 'bun scripts/sync-versions.ts',
});
