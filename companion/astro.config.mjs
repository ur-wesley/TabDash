import { defineConfig } from 'astro/config';

// https://astro.build/config
import solidJs from '@astrojs/solid-js';

// https://astro.build/config
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  integrations: [solidJs()],
  adapter: node({ mode: 'standalone' }),
});
