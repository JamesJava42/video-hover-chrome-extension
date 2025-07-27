// Ensure the script is injected only once
if (typeof window.videoHoverApplied === 'undefined') {
    window.videoHoverApplied = (function() {

        /**
         * Injects all necessary CSS into the page head.
         */
        function injectStyles() {
            const styleId = 'video-hover-styles';
            if (document.getElementById(styleId)) return;
            const style = document.createElement('style');
            style.id = styleId;
            style.innerHTML = `
                .video-hover-enhanced { 
                    position: relative; 
                    overflow: hidden; 
                    transition: transform 0.3s ease, box-shadow 0.3s ease; 
                    cursor: pointer; 
                }
                .video-hover-enhanced:hover { 
                    transform: scale(1.03); 
                    box-shadow: 0 10px 35px rgba(0, 0, 0, 0.2);
                }
                .video-hover-enhanced .video-overlay {
                    width: 100%; 
                    height: 100%; 
                    object-fit: cover; 
                    position: absolute; 
                    top: 0; 
                    left: 0; 
                    opacity: 0; 
                    pointer-events: none; 
                    transition: opacity 0.4s ease-in-out; 
                    z-index: 1;
                }
                .video-hover-enhanced:hover .video-overlay {
                    opacity: 1;
                }
            `;
            document.head.appendChild(style);
        }

        /**
         * Generates a unique and stable CSS selector for a given element.
         */
        function getSelector(element) {
            if (element.id) return `#${element.id}`;
            let path = [];
            while (element.parentElement) {
                let sibling = element;
                let count = 1;
                while (sibling.previousElementSibling) {
                    sibling = sibling.previousElementSibling;
                    count++;
                }
                let selector = element.tagName.toLowerCase();
                if (element.className) {
                    const stableClass = Array.from(element.classList).find(c => !c.includes(':'));
                    if (stableClass) selector += `.${stableClass}`;
                }
                selector += `:nth-child(${count})`;
                path.unshift(selector);
                element = element.parentElement;
                if (element.id) {
                    path.unshift(`#${element.id}`);
                    break;
                }
            }
            return path.join(' > ');
        }

        /**
         * Applies a video hover effect to the target element.
         */
        function applyHoverVideo(targetElement, videoUrl, shouldSave = false) {
            const isDirectVideoLink = /\.(mp4|webm|ogg)(\?.*)?$/i.test(videoUrl);
            if (!isDirectVideoLink) {
                alert('Invalid URL:\nThis link is not a direct video file (.mp4, .webm, .ogg).\n\nLinks to YouTube pages or other websites cannot be played directly.');
                return;
            }

            const voidElements = ['IMG', 'INPUT', 'VIDEO', 'IFRAME'];
            let container = targetElement;
            let originalElement = targetElement;

            // ✅ **THE FIX:** If the target is an element that can't have children (like an <img>),
            // we create a wrapper <div> and apply the effects to it instead.
            if (voidElements.includes(targetElement.tagName)) {
                const wrapper = document.createElement('div');
                // Make the wrapper mimic the display style of the image for layout purposes
                wrapper.style.display = window.getComputedStyle(targetElement).display;
                // Place the wrapper where the image was
                targetElement.parentNode.insertBefore(wrapper, targetElement);
                // Move the image inside the new wrapper
                wrapper.appendChild(targetElement);
                // The wrapper is now the container for our effects
                container = wrapper;
            }

            if (container.dataset.videoHoverApplied) return;
            container.dataset.videoHoverApplied = 'true';

            injectStyles();
            
            // The container must have a non-static position for the absolute overlay to work
            const position = window.getComputedStyle(container).position;
            if (position === 'static') {
                container.style.position = 'relative';
            }
            
            container.classList.add('video-hover-enhanced');

            const video = document.createElement('video');
            video.className = 'video-overlay';
            video.src = videoUrl;
            video.muted = true;
            video.loop = true;
            video.playsInline = true;
            video.preload = 'auto';
            
            video.style.borderRadius = window.getComputedStyle(originalElement).borderRadius;
            container.appendChild(video);

            container.addEventListener('mouseenter', () => {
                const playPromise = video.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        if (error.name !== 'AbortError') {
                            console.error("Video hover playback failed:", error);
                        }
                    });
                }
            });

            container.addEventListener('mouseleave', () => {
                video.pause();
                video.currentTime = 0;
            });

            if (shouldSave) {
                const selector = getSelector(originalElement);
                const pageUrl = window.location.href.split('?')[0].split('#')[0];
                chrome.storage.local.get([pageUrl], (result) => {
                    const effects = result[pageUrl] || [];
                    effects.push({ selector, videoUrl });
                    chrome.storage.local.set({ [pageUrl]: effects });
                });
            }
        }
        
        /**
         * Creates a selection overlay and lets the user click an element.
         */
        function startSelection(onSelect) {
            const selectorOverlay = document.createElement('div');
            Object.assign(selectorOverlay.style, { 
                position: 'absolute',
                border: '2px dashed #007bff', 
                backgroundColor: 'rgba(0, 123, 255, 0.25)', 
                borderRadius: '4px', 
                zIndex: '99999999', 
                pointerEvents: 'none', 
                transition: 'all 0.1s ease' 
            });
            document.body.appendChild(selectorOverlay);

            let currentTarget = null;
            const handleMouseOver = e => {
                currentTarget = e.target;
                const rect = currentTarget.getBoundingClientRect();
                Object.assign(selectorOverlay.style, { 
                    top: `${rect.top + window.scrollY}px`, 
                    left: `${rect.left + window.scrollX}px`, 
                    width: `${rect.width}px`, 
                    height: `${rect.height}px` 
                });
            };

            const handleClick = e => {
                e.preventDefault(); 
                e.stopPropagation();
                document.body.style.cursor = 'default';
                document.body.removeChild(selectorOverlay);
                document.removeEventListener('mouseover', handleMouseOver);
                document.removeEventListener('click', handleClick, true);
                if (currentTarget) {
                    onSelect(currentTarget);
                }
            };
            
            document.body.style.cursor = 'crosshair';
            document.addEventListener('mouseover', handleMouseOver);
            document.addEventListener('click', handleClick, { capture: true, once: true });
        }

        // --- Message Listener ---
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.action === 'startSelection') {
                startSelection(selectedElement => {
                    applyHoverVideo(selectedElement, message.url, true);
                });
                sendResponse({ status: 'selection_started' });
            } else if (message.action === 'applySavedEffects') {
                const effects = message.effects || [];
                effects.forEach(effect => {
                    try {
                        const element = document.querySelector(effect.selector);
                        if (element) {
                            applyHoverVideo(element, effect.videoUrl, false);
                        }
                    } catch (e) {
                        console.error("Video Hover: Failed to apply saved effect:", e);
                    }
                });
                sendResponse({ status: 'effects_applied' });
            }
            return true;
        });

        return true;
    })();
}