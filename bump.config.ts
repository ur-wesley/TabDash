import { defineConfig } from 'bumpp';

export default defineConfig({
  commit: 'chore: release v{version}',
  execute: 'bun scripts/sync-versions.ts',
  push: true,
  recursive: true,
  tag: 'v{version}',
});
