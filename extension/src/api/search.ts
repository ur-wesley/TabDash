import type { SearchSetting } from '../../types/settings.js';
import { searchEngine } from '../lang.js';

export function searchQuery(query: string, setting: SearchSetting): void {
  if (import.meta.env.VITE_IS_EXTENSION == 'true') {
    chrome.search.query(
      {
        disposition: setting.newTab ? 'NEW_TAB' : 'CURRENT_TAB',
        text: query,
      },
      () => {},
    );
  } else {
    const link = `${searchEngine.find((s) => s.name == setting.engine)?.link.replace('$s', query)}`;
    if (setting.newTab) {
      Object.assign(document.createElement('a'), {
        target: '_blank',
        rel: 'noopener noreferrer',
        href: link,
      }).click();
    } else {
      window.location.href = link;
    }
  }
}
