import { SearchSetting } from "../../types/settings.js";
import { searchEngine } from "../lang.js";

class Search {
  public static query(query: string, setting: SearchSetting) {
    if (import.meta.env.VITE_IS_EXTENSION == 'true')
      chrome.search.query(
        {
          disposition: setting.newTab ? "NEW_TAB" : "CURRENT_TAB",
          text: query,
        },
        () => { }
      );
    else {
      const link = `${searchEngine.find(s => s.name == setting.engine)?.link.replace('$s', query)}`;
      if (setting.newTab)
        window.location.href = link;
      else {
        Object.assign(document.createElement('a'), {
          target: '_blank',
          rel: 'noopener noreferrer',
          href: link,
        }).click();
      }
    }
  }
}

export default Search;
