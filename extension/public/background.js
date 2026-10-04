const isOnChrome = navigator.userAgent.includes('Chrome');
const newTab = () => chrome.tabs.create({ url: 'chrome://newtab' });
const url = "";
chrome.runtime.onInstalled.addListener(function (d) {
  if (d?.reason === 'install') {
    const key = crypto.randomUUID().split('-')[0] + '_' + Date.now();
    chrome.storage.local.set({ key });
    if (url) {
      chrome.runtime.setUninstallURL(`${url}/api/${isOnChrome ? 'chrome' : 'firefox'}/goodbye?key=${key}`);
      void fetch(`${url}/api/install?id=${key}&browser=${isOnChrome ? 'Chrome' : 'Firefox'}`);
    }
    newTab();
  }
});