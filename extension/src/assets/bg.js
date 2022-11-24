const isOnChrome = navigator.userAgent.includes('Chrome');
const newTab = () => chrome.tabs.create({ url: 'chrome://newtab' });

chrome.runtime.onInstalled.addListener(function (d) {
  if (d?.reason === 'install') {
    const key = crypto.randomUUID().split('-')[0] + '_' + Date.now();
    chrome.storage.local.set({ key });
    console.info({ url: import.meta.env.VITE_COMPANION_BASE });
    chrome.runtime.setUninstallURL(
      'http://192.168.1.40:3000/' +
        (isOnChrome ? 'api/chrome/goodbye' : 'firefox/goodbye') +
        '?key=' +
        key
    );
    fetch(
      'http://192.168.1.40:3000/' +
        (isOnChrome ? 'api/chrome/install' : 'firefox/install') +
        '?key=' +
        key
    );
    newTab();
  }
});
