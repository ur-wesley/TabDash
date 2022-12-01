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
    else {
      window.location.href = `https://www.startpage.com/sp/search?q=${query}`;
    }
  }
}

export default Search;
