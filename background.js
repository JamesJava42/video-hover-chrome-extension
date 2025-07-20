chrome.runtime.onInstalled.addListener(() => {
    console.log('Dynamic Video Hover AI extension has been installed.');
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url && !	tab.url.startsWith('chrome://')) {
        chrome.storage.local.get([tab.url], (result) => {
            if (result[tab.url]) {
                chrome.scripting.executeScript({
                    target: { tabId: tabId },
                    files: ['content.js']
                }, () => {
                    if (chrome.runtime.lastError) {
                        console.error('Background script injection failed:', chrome.runtime.lastError.message);
                        return;
                    }
                    chrome.tabs.sendMessage(tabId, {
                        action: 'startSelection',
                        url: result[tab.url].videoUrl
                    });
                });
            }
        });
    }
});