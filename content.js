if (typeof window.videoEffectsInjected === 'undefined') {
    window.videoEffectsInjected = true;

    const effectFunctions = {
        injectStyles: function() {
            const styleId = 'video-effects-styles';
            if (document.getElementById(styleId)) return;
            const style = document.createElement('style');
            style.id = styleId;
            style.innerHTML = `
                /* --- STYLES FOR FEATURE 1: In-Place Hover Effect --- */
                .video-hover-container { position: relative; overflow: hidden; cursor: pointer; }
                .video-hover-container .video-overlay { width: 100%; height: 100%; object-fit: cover; position: absolute; top: 0; left: 0; opacity: 0; pointer-events: none; transition: opacity 0.4s ease-in-out; z-index: 1; }
                .video-hover-container:hover .video-overlay { opacity: 1; }

                /* --- STYLES FOR FEATURE 2: Pop-Out Preview Effect --- */
                .video-popup-container { position: relative; cursor: pointer; }
                .video-preview-popup {
                    position: absolute;
                    width: 320px;
                    height: 180px;
                    bottom: 105%;
                    left: 50%;
                    transform: translateX(-50%);
                    z-index: 10;
                    opacity: 0;
                    transition: opacity 0.3s ease, bottom 0.3s ease;
                    pointer-events: none;
                    background: #000;
                    border-radius: 8px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.4);
                    overflow: hidden;
                }
                .video-popup-container:hover .video-preview-popup {
                    opacity: 1;
                    bottom: 110%;
                }
                .video-preview-popup video { width: 100%; height: 100%; }
                
                /* ✅ UNIFIED ICON STYLE: Both features will use this small, top-left icon */
                .top-left-icon {
                    position: absolute;
                    top: 15px;
                    left: 15px;
                    width: 30px;
                    height: 30px;
                    z-index: 5;
                    pointer-events: none;
                    background-color: rgba(0, 0, 0, 0.6);
                    border-radius: 4px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .top-left-icon svg { width: 60%; height: 60%; }
            `;
            document.head.appendChild(style);
        },

        /**
         * ✅ FEATURE 2: Pop-out Preview on Hover
         * Adds a small icon and makes a small video POP OUT when you hover the element.
         */
        applyClickPopup: function(targetElement, videoUrl) {
            this.injectStyles();
            const isDirectVideoLink = /\.(mp4|webm|ogg)(\?.*)?$/i.test(videoUrl);
            if (!isDirectVideoLink) { alert('Invalid URL. Please use a direct video link.'); return; }

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
            if(container.dataset.popupApplied) return;
            container.dataset.popupApplied = 'true';
            if (window.getComputedStyle(container).position === 'static') container.style.position = 'relative';
            container.classList.add('video-popup-container');

            // 1. Create the small, top-left icon
            const icon = document.createElement('div');
            icon.className = 'top-left-icon';
            icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>';
            
            // 2. Create the small pop-out preview window
            const previewPopup = document.createElement('div');
            previewPopup.className = 'video-preview-popup';
            const previewVideo = document.createElement('video');
            previewVideo.src = videoUrl;
            previewVideo.muted = true;
            previewVideo.loop = true;
            previewVideo.playsInline = true;

            previewPopup.appendChild(previewVideo);
            container.appendChild(icon);
            container.appendChild(previewPopup);

            // 3. Add listeners to the CONTAINER to play/pause the preview
            container.addEventListener('mouseenter', () => {
                previewVideo.load();
                const playPromise = previewVideo.play();
                if (playPromise !== undefined) playPromise.catch(error => { if (error.name !== 'AbortError') console.error("Preview playback failed:", error); });
            });
            container.addEventListener('mouseleave', () => {
                previewVideo.pause();
                previewVideo.load();
            });
        },

        /**
         * ✅ FEATURE 1: In-Place Video on Hover
         * Adds a small icon and plays the video IN-PLACE when you hover the element.
         */
        applyHoverEffect: function(targetElement, videoUrl) {
            this.injectStyles();
            const isDirectVideoLink = /\.(mp4|webm|ogg)(\?.*)?$/i.test(videoUrl);
            if (!isDirectVideoLink) { alert('Invalid URL. Please use a direct video link.'); return; }

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
            container.classList.add('video-hover-container');
            
            // 1. Create the in-place video overlay
            const video = document.createElement('video');
            video.className = 'video-overlay';
            video.src = videoUrl;
            video.muted = true;
            video.loop = true;
            video.playsInline = true;
            video.preload = 'auto';
            video.style.borderRadius = window.getComputedStyle(targetElement).borderRadius;
            
            // 2. Create the small, top-left icon
            const icon = document.createElement('div');
            icon.className = 'top-left-icon';
            icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>';
            
            container.appendChild(video);
            container.appendChild(icon);

            // 3. Add listeners to the CONTAINER to play/pause the in-place video
            container.addEventListener('mouseenter', () => { video.load(); const playPromise = video.play(); if (playPromise !== undefined) playPromise.catch(error => { if (error.name !== 'AbortError') console.error("Hover playback failed:", error); }); });
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