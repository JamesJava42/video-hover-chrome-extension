document.addEventListener('DOMContentLoaded', () => {
    const videoUrlInput = document.getElementById('videoUrlInput');
    const selectElementBtn = document.getElementById('selectElementBtn');
    const autoScanBtn = document.getElementById('autoScanBtn');
    const videoThumbs = document.querySelectorAll('.video-thumb');

    let selectedVideoUrl = '';

    if (videoThumbs.length > 0) {
        selectedVideoUrl = videoThumbs[0].dataset.videoUrl;
        videoUrlInput.value = selectedVideoUrl;
        videoThumbs[0].classList.add('selected');
    } else {
        console.warn('No video thumbnails found in popup.');
        videoUrlInput.value = '';
    }

    videoThumbs.forEach(thumb => {
        thumb.addEventListener('click', () => {
            selectedVideoUrl = thumb.dataset.videoUrl;
            videoUrlInput.value = selectedVideoUrl;
            videoThumbs.forEach(t => t.classList.remove('selected'));
            thumb.classList.add('selected');
        });
    });

    // This function now accepts a callback
    // which will be executed only after the message is successfully handled.
    async function injectAndSendMessage(message, onComplete) {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab && tab.url && !tab.url.startsWith("chrome://")) {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ['content.js']
            }, () => {
                if (chrome.runtime.lastError) {
                    console.error('Script injection failed: ', chrome.runtime.lastError.message);
                    alert('Failed to inject script. Please try again.');
                    return;
                }
                
                chrome.tabs.sendMessage(tab.id, message, (response) => {
                    // This callback now waits for sendResponse() from the content script.
                    if (chrome.runtime.lastError) {
                        console.warn("Message response error:", chrome.runtime.lastError.message);
                    }
                    // Once we get a response, we run the onComplete function.
                    if (onComplete) {
                        onComplete();
                    }
                });
            });
        } else {
            alert('This extension cannot be used on this page (e.g., chrome:// URLs).');
        }
    }

    selectElementBtn.addEventListener('click', () => {
        const url = videoUrlInput.value || selectedVideoUrl;
        if (!url) {
            alert('Please select a video or paste a URL first.');
            return;
        }
        // We now pass a function to close the window,
        // ensuring it only happens *after* the message is sent and acknowledged.
        injectAndSendMessage({ action: 'startSelection', url: url }, () => {
            window.close();
        });
    });

    autoScanBtn.addEventListener('click', () => {
        alert('Auto-scan feature coming soon!');
    });
});