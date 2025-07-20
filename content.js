// Ensure the script is injected only once
if (typeof window.videoHoverManual === 'undefined') {
    window.videoHoverManual = (function() {

        /**
         * Injects all necessary CSS into the page head.
         */
        function injectStyles() {
            const styleId = 'video-hover-styles';
            if (document.getElementById(styleId)) return;
            const style = document.createElement('style');
            style.id = styleId;
            style.innerHTML = `
                .manual-enhanced-element { 
                    position: relative; 
                    overflow: hidden; 
                    transition: transform 0.3s ease, box-shadow 0.3s ease; 
                    cursor: pointer; 
                }
                .manual-enhanced-element:hover { 
                    transform: scale(1.03); 
                    box-shadow: 0 10px 35px rgba(0, 0, 0, 0.2);
                }
                .manual-enhanced-element .video-overlay {
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
                .manual-enhanced-element:hover .video-overlay {
                    opacity: 1;
                }
            `;
            document.head.appendChild(style);
        }

        /**
         * Applies a video hover effect by targeting the element's existing container.
         * This is a more robust method for complex websites like those built with Elementor.
         */
        function applyHoverVideo(targetElement, videoUrl) {
            if (!videoUrl || typeof videoUrl !== 'string' || !videoUrl.startsWith('http')) {
                console.error("Video Hover Error: An invalid video URL was provided.");
                alert("Video Hover Error: Could not apply effect because an invalid video URL was provided.");
                return;
            }

            // **CRITICAL FIX**: Instead of creating a new wrapper, we find the existing one.
            // For Elementor sites, '.elementor-widget-container' is a reliable choice.
            const container = targetElement.closest('.elementor-widget-container');

            if (!container) {
                console.error("Video Hover Error: Could not find a suitable container for the selected element.");
                alert("Could not apply effect: A suitable container was not found.");
                return;
            }

            if (container.dataset.videoHoverApplied) return;
            container.dataset.videoHoverApplied = 'true';

            injectStyles();
            
            // Ensure the container can be a positioning context
            const position = window.getComputedStyle(container).position;
            if (position === 'static') {
                container.style.position = 'relative';
            }
            
            // Apply the class to the container, which will control the hover effect.
            container.classList.add('manual-enhanced-element');

            const video = document.createElement('video');
            video.className = 'video-overlay';
            video.src = videoUrl;
            video.muted = true;
            video.loop = true;
            video.playsInline = true;
            video.preload = 'auto';
            
            // Match the border radius of the image for the video overlay
            video.style.borderRadius = getComputedStyle(targetElement).borderRadius;

            // Append the video to the existing container.
            container.appendChild(video);

            // Attach listeners to the container.
            container.addEventListener('mouseenter', () => {
                video.play().catch(e => console.warn("Video play was prevented, but hover should still work.", e));
            });

            container.addEventListener('mouseleave', () => {
                video.pause();
                video.currentTime = 0;
            });
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
                zIndex: '999999', 
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
                document.body.removeChild(selectorOverlay);
                document.removeEventListener('mouseover', handleMouseOver);
                document.removeEventListener('click', handleClick, true);
                if (currentTarget) {
                    onSelect(currentTarget);
                }
            };

            document.addEventListener('mouseover', handleMouseOver);
            document.addEventListener('click', handleClick, { capture: true, once: true });
        }

        // --- Message Listener ---
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.action === 'startSelection') {
                startSelection(selectedElement => {
                    applyHoverVideo(selectedElement, message.url);
                });
            }
            return true;
        });

        return true;
    })();
}
