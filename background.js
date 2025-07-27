chrome.runtime.onInstalled.addListener(() => {
    console.log('Dynamic Video Hover AI extension has been installed.');
});

// Re-apply saved effects when a tab is updated
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    // Ensure the tab is fully loaded and has a valid URL
    if (changeInfo.status === 'complete' && tab.url && !tab.url.startsWith('chrome://')) {
        const pageUrl = tab.url.split('?')[0].split('#')[0]; // Clean URL to match what's saved

        // Check if there's any saved data for this URL
        chrome.storage.local.get([pageUrl], (result) => {
            if (result[pageUrl] && result[pageUrl].length > 0) {
                // If data exists, inject the content script
                chrome.scripting.executeScript({
                    target: { tabId: tabId },
                    files: ['content.js']
                }, () => {
                    if (chrome.runtime.lastError) {
                        console.error('Background script injection failed:', chrome.runtime.lastError.message);
                        return;
                    }
                    // Send the saved effects data to the content script for re-application
                    chrome.tabs.sendMessage(tabId, {
                        action: 'applySavedEffects',
                        effects: result[pageUrl]
                    });
                });
            }
        });
    }
});