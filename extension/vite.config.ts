import { defineConfig, loadEnv } from "vite";
import solidPlugin from "vite-plugin-solid";
import Unocss from "unocss/vite";
import presetUno from "@unocss/preset-uno";
// @ts-ignore
import presetIcons from "@unocss/preset-icons";
import { writeFile } from "node:fs/promises";

export default defineConfig(({ command, mode }) => {
  if (command == "build") {
    buildBackgroundJS(mode);
    buildManifest();
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
          "surface-base": "backdrop-blur-xl backdrop-brightness-180 bg-white/50 dark:backdrop-brightness-80 dark:bg-black/50",
          "color-base": "text-dark-900 dark:text-light-200",
          "color-fade": "text-dark-900/90 dark:text-light-200/90",
          label: "text-sm font-medium text-dark-300 dark:text-light-700",
        },
        presets: [presetUno(), presetIcons()],
      }),
    ],
    server: {
      port: 3003,
    },
    preview: {
      port: 3003,
    },
    build: {
      target: "esnext",
      minify: false,
    },
  };
});

import pkg from "./package.json";
const buildBackgroundJS = async (mode: string) => {
  const env = loadEnv(mode, process.cwd(), "");
  await writeFile(
    "./public/background.js",
    `const isOnChrome = navigator.userAgent.includes('Chrome');
    const newTab = () => chrome.tabs.create({ url: 'chrome://newtab' });
    const url = \`${env.VITE_COMPANION_BASE}\`;
    const backend = \`${env.VITE_BACKEND_BASE}\`;
    chrome.runtime.onInstalled.addListener(function (d) {
      if (d?.reason === 'install') {
        const key = crypto.randomUUID().split('-')[0] + '_' + Date.now();
        chrome.storage.local.set({ key });
        chrome.runtime.setUninstallURL(
          \`$\{url\}/api/\$\{isOnChrome ? 'chrome' : 'firefox'}/goodbye?key=\$\{key\}\`
      );
      fetch(\`$\{url\}/api/install?id=\$\{key\}&browser=\$\{isOnChrome ? 'Chrome' : 'Firefox'}\`);
      newTab();
    }
  });`
  );
};

import manifest from "./public/manifest.json";
const buildManifest = async () => {
  const browsers = ["firefox", "chrome", "edge"];
  for (const browser of browsers) {
    const newManifest = {
      ...manifest,
      manifest_version: browser == "firefox" ? 2 : 3,
      version: pkg.version,
      background: setBackground(browser),
      ...setAction(browser),
    };
    await writeFile(
      `./public/manifest.${browser}.json`,
      JSON.stringify(newManifest, null, 2)
    );
  }
};

const setBackground = (browser: string) => {
  switch (browser) {
    case "firefox":
      return { script: ["background.js"] };
    case "chrome":
      return {
        service_worker: "background.js",
        type: "module",
        offline_enabled: true,
      };
    case "edge":
      return {
        service_worker: "background.js",
        type: "module",
        offline_enabled: true,
      };
    default:
      return { script: ["background.js"] };
  }
};

const setAction = (browser: string) => {
  switch (browser) {
    case "firefox":
      return {
        browser_action: {
          browser_style: true,
          default_icon: "tabdash_128.png",
          default_title: "__MSG_extensionName__",
        },
      };
    case "chrome":
      return {
        action: {
          browser_style: true,
          default_icon: "tabdash_128.png",
          default_title: "__MSG_extensionName__",
        },
      };
    case "edge":
      return {
        action: {
          browser_style: true,
          default_icon: "tabdash_128.png",
          default_title: "__MSG_extensionName__",
        },
      };
    default:
      return {
        browser_action: {
          browser_style: true,
          default_icon: "tabdash_128.png",
          default_title: "__MSG_extensionName__",
        },
      };
  }
};
