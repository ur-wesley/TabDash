const isOnChrome = navigator.userAgent.includes('Chrome');
  const newTab = () => chrome.tabs.create({ url: 'chrome://newtab' });
  const url = `https://tabdash.wesley.fyi/`
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
  });
  