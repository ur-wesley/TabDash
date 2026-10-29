import { copyFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { presetIcons } from '@unocss/preset-icons';
import { presetUno } from '@unocss/preset-uno';
import Unocss from 'unocss/vite';
import { defineConfig, loadEnv } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import pkg from './package.json';
import manifest from './public/manifest.json';

const FIREFOX_EXTENSION_ID = '{494a0d1f-1baf-4f28-95bc-77d20a3f25a0}';
const JSON_INDENT_SPACES = 2;
const PREVIEW_PORT = 3003;
const STORE_BROWSERS = ['firefox', 'chrome', 'edge'] as const;
const require = createRequire(import.meta.url);
const corvuDist = path.dirname(require.resolve('@corvu/utils'));

const buildBackgroundJS = (mode: string): Promise<void> => {
  const env = loadEnv(mode, process.cwd(), '');
  return writeFile(
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
};

const setAction = (
  _browser: string,
): { action: { default_icon: string; default_title: string } } => ({
  action: {
    default_icon: 'tabdash_128.png',
    default_title: '__MSG_extensionName__',
  },
});

const setBackground = (
  browser: string,
): { scripts: string[] } | { service_worker: string; type: string } => {
  if (browser === 'firefox') {
    return { scripts: ['background.js'] };
  }
  return {
    service_worker: 'background.js',
    type: 'module',
  };
};

const setBrowserFields = (browser: (typeof STORE_BROWSERS)[number]): Record<string, unknown> => {
  if (browser === 'firefox') {
    return {
      browser_specific_settings: {
        gecko: {
          id: FIREFOX_EXTENSION_ID,
          strict_min_version: '115.0',
        },
      },
    };
  }
  return { offline_enabled: true };
};

const buildManifest = (): Promise<void> =>
  Promise.all(
    STORE_BROWSERS.map((browser) => {
      const browserFields = setBrowserFields(browser);
      const background = setBackground(browser);
      const action = setAction(browser);
      const newManifest = Object.assign(
        {},
        manifest,
        browserFields,
        { background, manifest_version: 3, version: pkg.version },
        action,
      );
      return writeFile(
        `./public/manifest.${browser}.json`,
        `${JSON.stringify(newManifest, undefined, JSON_INDENT_SPACES)}\n`,
      );
    }),
  ).then(() => undefined);

const syncBrowserManifestsToDist = (): Promise<void> =>
  Promise.all(
    STORE_BROWSERS.map((browser) =>
      copyFile(`./public/manifest.${browser}.json`, `./dist/manifest.${browser}.json`),
    ),
  ).then(() => undefined);

export default defineConfig(({ command, mode }) => {
  const isBuild = command === 'build';
  return {
    build: {
      minify: false,
      target: 'esnext',
    },
    envPrefix: ['VITE_', 'OPENWEATHER_', 'UNSPLASH_'],
    plugins: [
      ...(isBuild
        ? [
            {
              name: 'tabdash-extension-artifacts',
              apply: 'build' as const,
              buildStart() {
                return buildBackgroundJS(mode).then(() => buildManifest());
              },
              closeBundle() {
                return syncBrowserManifestsToDist();
              },
            },
          ]
        : []),
      solidPlugin(),
      Unocss({
        presets: [
          presetUno(),
          presetIcons({
            extraProperties: {
              display: 'inline-block',
              'vertical-align': 'middle',
            },
            prefix: 'i-',
          }),
        ],
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
          'bg-base': 'bg-slate-200 dark:bg-dark-100',
          'bg-base-glass':
            'bg-slate-200/60 dark:bg-dark-100/60 z-20 text-black dark:text-light-800 max-w-max rounded-2xl backdrop-blur-md backdrop-brightness-150 dark:backdrop-brightness-50',
          'border-base': 'border-gray-200 dark:border-dark-200',
          'color-base': 'text-dark-900 dark:text-light-200',
          'color-fade': 'text-dark-900/90 dark:text-light-200/90',
          label: 'text-sm font-medium text-dark-300 dark:text-light-700',
          'surface-base':
            'backdrop-blur-xl backdrop-brightness-180 bg-white/50 dark:backdrop-brightness-80 dark:bg-black/50',
        },
      }),
    ],
    preview: {
      port: PREVIEW_PORT,
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
      port: PREVIEW_PORT,
    },
  };
});
