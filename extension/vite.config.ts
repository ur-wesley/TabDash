import { defineConfig, loadEnv } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import Unocss from 'unocss/vite';
import { presetUno } from '@unocss/preset-uno';
import { presetIcons } from '@unocss/preset-icons';
import { writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import pkg from './package.json';
import manifest from './public/manifest.json';

const require = createRequire(import.meta.url),
  corvuDist = path.dirname(require.resolve('@corvu/utils'));

export default defineConfig(({ command, mode }) => {
  if (command == 'build') {
    void buildBackgroundJS(mode);
    void buildManifest();
  }
  return {
    build: {
      minify: false,
      target: 'esnext',
    },
    envPrefix: ['VITE_', 'OPENWEATHER_', 'UNSPLASH_'],
    plugins: [
      solidPlugin(),
      Unocss({
        // Weather icons are applied dynamically via owmIconToMdi()
        // (see features/weather/weather-icon.ts), so the scanner cannot see
        // the final class in the widget markup. Pin them here to guarantee
        // the icon CSS is always generated ÔÇö otherwise the span renders
        // empty and no icon is visible at all.
        safelist: [
          'i-mdi-weather-sunny',
          'i-mdi-weather-night',
          'i-mdi-weather-partly-cloudy',
          'i-mdi-weather-night-partly-cloudy',
          'i-mdi-weather-cloudy',
          'i-mdi-weather-rainy',
          'i-mdi-weather-pouring',
          'i-mdi-weather-lightning-rainy',
          'i-mdi-weather-snowy',
          'i-mdi-weather-fog',
        ],
        shortcuts: {
          'border-base': 'border-gray-200 dark:border-dark-200',
          'bg-base': 'bg-slate-200 dark:bg-dark-100',
          'bg-base-glass':
            'bg-slate-200/60 dark:bg-dark-100/60 z-20 text-black dark:text-light-800 max-w-max rounded-2xl backdrop-blur-md backdrop-brightness-150 dark:backdrop-brightness-50',
          'surface-base':
            'backdrop-blur-xl backdrop-brightness-180 bg-white/50 dark:backdrop-brightness-80 dark:bg-black/50',
          'color-base': 'text-dark-900 dark:text-light-200',
          'color-fade': 'text-dark-900/90 dark:text-light-200/90',
          label: 'text-sm font-medium text-dark-300 dark:text-light-700',
        },
        presets: [
          presetUno(),
          presetIcons({
            prefix: 'i-',
            extraProperties: {
              display: 'inline-block',
              'vertical-align': 'middle',
            },
          }),
        ],
      }),
    ],
    preview: {
      port: 3003,
    },
    resolve: {
      alias: [
        {
          find: /^@corvu\/utils\/create\/(.*)$/,
          replacement: path.join(corvuDist, 'create', '$1.js'),
        },
        {
          find: /^@corvu\/utils\/(.*)$/,
          replacement: path.join(corvuDist, '$1', 'index.js'),
        },
      ],
    },
    server: {
      port: 3003,
    },
  };
});

const buildBackgroundJS = async (mode: string) => {
    const env = loadEnv(mode, process.cwd(), '');
    await writeFile(
      './public/background.js',
      `const isOnChrome = navigator.userAgent.includes('Chrome');
const newTab = () => chrome.tabs.create({ url: 'chrome://newtab' });
const url = "${env.VITE_COMPANION_BASE || ''}";
chrome.runtime.onInstalled.addListener(function (d) {
  if (d?.reason === 'install') {
    const key = crypto.randomUUID().split('-')[0] + '_' + Date.now();
    chrome.storage.local.set({ key });
    if (url) {
      chrome.runtime.setUninstallURL(\`\${url}/api/\${isOnChrome ? 'chrome' : 'firefox'}/goodbye?key=\${key}\`);
      void fetch(\`\${url}/api/install?id=\${key}&browser=\${isOnChrome ? 'Chrome' : 'Firefox'}\`);
    }
    newTab();
  }
});`,
    );
  },
  buildManifest = async () => {
    const browsers = ['firefox', 'chrome', 'edge'];
    for (const browser of browsers) {
      const newManifest = {
        ...manifest,
        background: setBackground(browser),
        manifest_version: 3,
        version: pkg.version,
        ...setAction(browser),
      };
      await writeFile(`./public/manifest.${browser}.json`, JSON.stringify(newManifest, null, 2));
    }
  },
  setBackground = (browser: string) => {
    switch (browser) {
      case 'firefox': {
        return { scripts: ['background.js'] };
      }
      case 'chrome':
      case 'edge':
      default: {
        return {
          service_worker: 'background.js',
          type: 'module',
          offline_enabled: true,
        };
      }
    }
  },
  setAction = (_browser: string) => ({
    action: {
      default_icon: 'tabdash_128.png',
      default_title: '__MSG_extensionName__',
    },
  });
