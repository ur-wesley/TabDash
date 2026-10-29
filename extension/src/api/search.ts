import type { SearchSetting } from '../../types/settings.js';
import { searchEngine } from '../lang.js';

export function searchQuery(query: string, setting: SearchSetting): void {
  if (import.meta.env.VITE_IS_EXTENSION === 'true') {
    chrome.search.query(
      {
        disposition: setting.newTab ? 'NEW_TAB' : 'CURRENT_TAB',
        text: query,
      },
      () => {},
    );
  } else {
    const engine = searchEngine.find((entry) => entry.name === setting.engine);
    if (engine === undefined) {
      return;
    }
    const link = engine.link.replace('$s', query);
    if (setting.newTab) {
      Object.assign(document.createElement('a'), {
        href: link,
        rel: 'noopener noreferrer',
        target: '_blank',
      }).click();
    } else {
      window.location.href = link;
    }
  }
}
