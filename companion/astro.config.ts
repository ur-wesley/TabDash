import { defineConfig } from 'astro/config';
import solidJs from '@astrojs/solid-js';
import Unocss from 'unocss/astro';

export default defineConfig({
  integrations: [solidJs(), Unocss()],
  output: 'static',
});
