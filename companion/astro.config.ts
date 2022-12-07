import { defineConfig } from 'astro/config';
import solidJs from '@astrojs/solid-js';
import node from '@astrojs/node';
import Unocss from 'unocss/astro'

export default defineConfig({
  output: 'server',
  integrations: [solidJs(), Unocss()],
  adapter: node({ mode: 'standalone' }),
});
