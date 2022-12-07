import { defineConfig, loadEnv } from "vite";
import solidPlugin from "vite-plugin-solid";
import Unocss from "unocss/vite";
import presetUno from "@unocss/preset-uno";
import presetAttributify from "@unocss/preset-attributify";
import presetIcons from "@unocss/preset-icons";
import { writeFile } from 'node:fs/promises';

export default defineConfig(({ command, mode }) => {
  if (command == 'build') {
    buildBackgroundJS(mode);
  }
  return {
    plugins: [
      solidPlugin(),
      Unocss({
        shortcuts: {
          "border-base": "border-gray-200 dark:border-dark-200",
          "bg-base": "bg-slate-200 dark:bg-dark-100",
          "bg-base-glass":
            "bg-slate-200/60 dark:bg-dark-100/60 z-20 text-black dark:text-light-800 max-w-max rounded-2xl backdrop-blur-md backdrop-brightness-150 dark:backdrop-brightness-50",
          "surface-base": "bg-white dark:bg-black",
          "color-base": "text-gray-900 dark:text-gray-300",
          "color-fade": "text-gray-900:90 dark:text-gray-200:90",
          widget:
            "z-20 text-black bg-light-100/20 dark:bg-dark-100/20 dark:text-light-800 rounded-2xl backdrop-blur-md",
          label: "text-sm font-medium text-dark-300 dark:text-light-700",
        },
        presets: [presetUno(), presetAttributify(), presetIcons()],
      }),
    ],
    server: {
      port: 3003,
    },
    preview: {
      port: 3003
    },
    build: {
      target: "esnext",
    },
  }
});

import pkg from './package.json';
import manifest from './public/manifest.json';
const buildBackgroundJS = async (mode: string) => {
  const newManifest = { ...manifest, version: pkg.version };
  const env = loadEnv(mode, process.cwd(), '');
  await writeFile('./public/manifest.json', JSON.stringify(newManifest, null, 2));
  await writeFile('./public/background.js',
    `const isOnChrome = navigator.userAgent.includes('Chrome');
const newTab = () => chrome.tabs.create({ url: 'chrome://newtab' });
const url = \`${env.VITE_COMPANION_BASE}/\`;
chrome.runtime.onInstalled.addListener(function (d) {
  if (d?.reason === 'install') {
    const key = crypto.randomUUID().split('-')[0] + '_' + Date.now();
    chrome.storage.local.set({ key });
    chrome.runtime.setUninstallURL(
      url +
        (isOnChrome ? 'api/chrome/goodbye' : 'api/firefox/goodbye') +
        '?key=' +
        key
    );
    fetch(
      url +
        (isOnChrome ? 'api/chrome/install' : 'api/firefox/install') +
        '?key=' +
        key
    );
    newTab();
  }
});`)
}