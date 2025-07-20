document.addEventListener('DOMContentLoaded', () => {
    const videoUrlInput = document.getElementById('videoUrlInput');
    const selectElementBtn = document.getElementById('selectElementBtn');
    const autoScanBtn = document.getElementById('autoScanBtn');
    const videoThumbs = document.querySelectorAll('.video-thumb');

    let selectedVideoUrl = '';

    // Set default video
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

    async function injectAndSendMessage(message) {
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
                        console.error("Message sending failed: ", chrome.runtime.lastError.message);
                        alert('Failed to communicate with the page. Please try again.');
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
        injectAndSendMessage({ action: 'startSelection', url: url });
        window.close();
    });

    autoScanBtn.addEventListener('click', () => {
        alert('Auto-scan feature coming soon!');
    });
});