import { sendToast } from "../../types/notification.js";

class Search {
  public static query(query: string) {
    if (import.meta.env.VITE_IS_EXTENSION == 'true')
      chrome.search.query(
        {
          disposition: "CURRENT_TAB",
          text: query,
        },
        () => { }
      );
    else sendToast('not supported right now. Install the official extension to get this feature.', 'info', 5000)
  }
}

export default Search;
