export * from './locales/index.js';

export const helpLinks = {
  base: (import.meta.env.VITE_COMPANION_BASE || 'http://localhost:3000') + '/docs/',
  general: '/general',
  layout: '/layout',
  background: '/background',
  shortcut: '/shortcut',
  time: '/time',
  date: '/date',
  management: '/management',
  weather: '/weather',
  search: '/search',
};

export const searchEngine = [
  {
    name: 'Startpage',
    link: 'https://www.startpage.com/sp/search?q=$s',
  },
  {
    name: 'Ecosia',
    link: 'https://www.ecosia.org/search?method=index&q=$s',
  },
  {
    name: 'DuckDuckGo',
    link: 'https://duckduckgo.com/?q=$s',
  },
];
