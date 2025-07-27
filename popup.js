document.addEventListener('DOMContentLoaded', () => {
    const videoUrlInput = document.getElementById('videoUrlInput');
    const selectElementBtn = document.getElementById('selectElementBtn');
    const applyPopupBtn = document.getElementById('applyPopupBtn');
    const videoThumbs = document.querySelectorAll('.video-thumb');

    let selectedVideoUrl = '';

    if (videoThumbs.length > 0) {
        selectedVideoUrl = videoThumbs[0].dataset.videoUrl;
        videoUrlInput.value = selectedVideoUrl;
        videoThumbs[0].classList.add('selected');
    }

    videoThumbs.forEach(thumb => {
        thumb.addEventListener('click', () => {
            selectedVideoUrl = thumb.dataset.videoUrl;
            videoUrlInput.value = selectedVideoUrl;
            videoThumbs.forEach(t => t.classList.remove('selected'));
            thumb.classList.add('selected');
        });
    });

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
                    if (chrome.runtime.lastError) {
                        console.warn("Message response error:", chrome.runtime.lastError.message);
                    }
                    if (onComplete) {
                        onComplete();
                    }
                });
            });
        } else {
            alert('This extension cannot be used on this page.');
        }
    }

    selectElementBtn.addEventListener('click', () => {
        const url = videoUrlInput.value || selectedVideoUrl;
        if (!url) {
            alert('Please select a video or paste a URL first.');
            return;
        }
        injectAndSendMessage({ action: 'applyHoverEffect', url: url }, () => {
            window.close();
        });
    });

    applyPopupBtn.addEventListener('click', () => {
        const url = videoUrlInput.value || selectedVideoUrl;
        if (!url) {
            alert('Please select a video or paste a URL first.');
            return;
        }
        injectAndSendMessage({ action: 'applyClickPopup', url: url }, () => {
            window.close();
        });
    });
});