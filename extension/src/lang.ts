export * from './locales/index.js';

export const helpLinks = {
  background: '/background',
  base: (import.meta.env.VITE_COMPANION_BASE || 'http://localhost:3000') + '/docs/',
  date: '/date',
  general: '/general',
  layout: '/layout',
  management: '/management',
  search: '/search',
  shortcut: '/shortcut',
  time: '/time',
  weather: '/weather',
};

export const searchEngine = [
  {
    link: 'https://www.startpage.com/sp/search?q=$s',
    name: 'Startpage',
  },
  {
    link: 'https://www.ecosia.org/search?method=index&q=$s',
    name: 'Ecosia',
  },
  {
    link: 'https://duckduckgo.com/?q=$s',
    name: 'DuckDuckGo',
  },
];
