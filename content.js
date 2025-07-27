if (typeof window.videoEffectsInjected === 'undefined') {
    window.videoEffectsInjected = true;

    const effectFunctions = {
        injectStyles: function() {
            const styleId = 'video-effects-styles';
            if (document.getElementById(styleId)) return;
            const style = document.createElement('style');
            style.id = styleId;
            style.innerHTML = `
                /* Hover effect styles */
                .video-hover-enhanced { position: relative; overflow: hidden; cursor: pointer; }
                .video-hover-enhanced .video-overlay { width: 100%; height: 100%; object-fit: cover; position: absolute; top: 0; left: 0; opacity: 0; pointer-events: none; transition: opacity 0.4s ease-in-out; z-index: 1; }
                .video-hover-enhanced:hover .video-overlay { opacity: 1; }

                /* ✅ MODIFIED: CSS for the new "cube" icon */
                .hover-effect-icon {
                    position: absolute;
                    top: 15px;
                    left: 15px;
                    width: 30px; /* Equal width */
                    height: 30px; /* Equal height */
                    z-index: 2;
                    pointer-events: none;
                    background-color: rgba(0, 0, 0, 0.6);
                    border-radius: 4px; /* Slightly rounded corners for a "soft cube" look */
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .hover-effect-icon svg {
                    width: 60%;
                    height: 60%;
                }

                /* Styles for popup feature (unchanged) */
                .video-popup-icon { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 60px; height: 60px; z-index: 5; cursor: pointer; transition: transform 0.2s ease; }
                .video-popup-icon:hover { transform: translate(-50%, -50%) scale(1.1); }
                .video-modal-overlay { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.8); z-index: 9999999; justify-content: center; align-items: center; }
                .video-modal-content { position: relative; width: 90%; max-width: 800px; max-height: 90vh; background-color: #000; box-shadow: 0 5px 15px rgba(0,0,0,0.5); }
                .video-modal-content video { display: block; width: 100%; max-height: 90vh; }
                .video-modal-close { position: absolute; top: -40px; right: 0px; font-size: 40px; color: #fff; cursor: pointer; line-height: 1; }
            `;
            document.head.appendChild(style);
        },

        applyClickPopup: function(targetElement, videoUrl) {
            // This function is unchanged
            this.injectStyles();
            const isDirectVideoLink = /\.(mp4|webm|ogg)(\?.*)?$/i.test(videoUrl);
            if (!isDirectVideoLink) {
                alert('Invalid URL for Popup. Please use a direct video link (.mp4, .webm, .ogg).');
                return;
            }
            const voidElements = ['IMG', 'INPUT', 'VIDEO', 'IFRAME'];
            let container = targetElement;
            if (voidElements.includes(targetElement.tagName) || targetElement.closest('.video-popup-icon-wrapper')) {
                const wrapper = document.createElement('div');
                wrapper.className = 'video-popup-icon-wrapper';
                wrapper.style.display = window.getComputedStyle(targetElement).display;
                wrapper.style.position = 'relative';
                targetElement.parentNode.insertBefore(wrapper, targetElement);
                wrapper.appendChild(targetElement);
                container = wrapper;
            }
            if(container.dataset.popupApplied) return;
            container.dataset.popupApplied = 'true';
            if (window.getComputedStyle(container).position === 'static') container.style.position = 'relative';
            const icon = document.createElement('img');
            icon.className = 'video-popup-icon';
            icon.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI0ZGRiI+PHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEycy00LjQ4IDEwIDEwIDEwIDEwLTQuNDggMTAtMTBTMTcuNTIgMiAxMiAyem0tMiAxNC41di05bDYgNC41LTYgNC41eiIvPjwvc3ZnPg==';
            container.appendChild(icon);
            const modalOverlay = document.createElement('div');
            modalOverlay.className = 'video-modal-overlay';
            const modalContent = document.createElement('div');
            modalContent.className = 'video-modal-content';
            const modalVideo = document.createElement('video');
            modalVideo.src = videoUrl;
            modalVideo.controls = true;
            const closeModalBtn = document.createElement('span');
            closeModalBtn.className = 'video-modal-close';
            closeModalBtn.innerHTML = '&times;';
            modalContent.appendChild(closeModalBtn);
            modalContent.appendChild(modalVideo);
            modalOverlay.appendChild(modalContent);
            document.body.appendChild(modalOverlay);
            const openModal = () => { modalOverlay.style.display = 'flex'; modalVideo.play(); };
            const closeModal = () => { modalVideo.pause(); modalOverlay.style.display = 'none'; };
            icon.addEventListener('click', e => { e.stopPropagation(); openModal(); });
            closeModalBtn.addEventListener('click', closeModal);
            modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });
        },

        applyHoverEffect: function(targetElement, videoUrl) {
            this.injectStyles();
            const isDirectVideoLink = /\.(mp4|webm|ogg)(\?.*)?$/i.test(videoUrl);
            if (!isDirectVideoLink) {
                alert('Invalid URL for Hover. Please use a direct video link (.mp4, .webm, .ogg).');
                return;
            }
            const voidElements = ['IMG', 'INPUT', 'VIDEO', 'IFRAME'];
            let container = targetElement;
            if (voidElements.includes(targetElement.tagName)) {
                const wrapper = document.createElement('div');
                wrapper.style.display = window.getComputedStyle(targetElement).display;
                wrapper.style.position = 'relative';
                targetElement.parentNode.insertBefore(wrapper, targetElement);
                wrapper.appendChild(targetElement);
                container = wrapper;
            }
            if (container.dataset.hoverApplied) return;
            container.dataset.hoverApplied = 'true';
            if (window.getComputedStyle(container).position === 'static') container.style.position = 'relative';
            container.classList.add('video-hover-enhanced');
            
            const video = document.createElement('video');
            video.className = 'video-overlay';
            video.src = videoUrl;
            video.muted = true;
            video.loop = true;
            video.playsInline = true;
            video.preload = 'auto';
            video.style.borderRadius = window.getComputedStyle(targetElement).borderRadius;
            container.appendChild(video);

            // ✅ MODIFIED: The icon is now a <div> with an <svg> inside for perfect centering.
            const icon = document.createElement('div');
            icon.className = 'hover-effect-icon';
            icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>';
            container.appendChild(icon);

            container.addEventListener('mouseenter', () => { video.load(); const playPromise = video.play(); if (playPromise !== undefined) playPromise.catch(error => { if (error.name !== 'AbortError') console.error("Video hover playback failed:", error); }); });
            container.addEventListener('mouseleave', () => { video.pause(); video.currentTime = 0; video.load(); });
        },

        startSelection: function(onSelect) {
            const selectorOverlay = document.createElement('div');
            Object.assign(selectorOverlay.style, { position: 'absolute', border: '2px dashed #007bff', backgroundColor: 'rgba(0, 123, 255, 0.25)', borderRadius: '4px', zIndex: '99999999', pointerEvents: 'none', transition: 'all 0.1s ease' });
            document.body.appendChild(selectorOverlay);
            let currentTarget = null;
            const handleMouseOver = e => { currentTarget = e.target; const rect = currentTarget.getBoundingClientRect(); Object.assign(selectorOverlay.style, { top: `${rect.top + window.scrollY}px`, left: `${rect.left + window.scrollX}px`, width: `${rect.width}px`, height: `${rect.height}px` }); };
            const handleClick = e => { e.preventDefault(); e.stopPropagation(); document.body.style.cursor = 'default'; document.body.removeChild(selectorOverlay); document.removeEventListener('mouseover', handleMouseOver); document.removeEventListener('click', handleClick, true); if (currentTarget) onSelect(currentTarget); };
            document.body.style.cursor = 'crosshair';
            document.addEventListener('mouseover', handleMouseOver);
            document.addEventListener('click', handleClick, { capture: true, once: true });
        }
    };

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === 'applyHoverEffect') {
            effectFunctions.startSelection(selectedElement => {
                effectFunctions.applyHoverEffect(selectedElement, message.url);
            });
            sendResponse({ status: 'selection_started' });
        } else if (message.action === 'applyClickPopup') {
            effectFunctions.startSelection(selectedElement => {
                effectFunctions.applyClickPopup(selectedElement, message.url);
            });
            sendResponse({ status: 'popup_selection_started' });
        }
        return true;
    });
}