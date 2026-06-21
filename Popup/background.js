chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "IS_ACTIVE_TAB") {
    chrome.tabs.get(sender.tab.id, tab => {
      sendResponse(tab.active === true);
    });
    return true;
  }
});

chrome.tabs.onActivated.addListener(info => {
  chrome.tabs.sendMessage(info.tabId, { type: "TAB_ACTIVATED" }, () => {
    if (chrome.runtime.lastError) {
      return;
    }
  });
});