/**
 * sv-theme.js -- pre-paint theme application.
 * Runs in <head>, before first paint, to apply the correct theme without a flash.
 * Configuration (theme colors) is read from data-theme-* attributes on <html>.
 */
(function() {
    'use strict';

    try {
        // Read persistence, fall back to system preference
        const stored = localStorage.getItem('sv-theme');
        const isLight = stored ? stored === 'light'
                               : window.matchMedia('(prefers-color-scheme: light)').matches;

        // Apply class
        if (isLight) {
            document.documentElement.classList.add('light');
        } else {
            document.documentElement.classList.remove('light');
        }

        // Update meta theme-color from data attributes
        const themeColor = isLight ? document.documentElement.dataset.themeLight
                                   : document.documentElement.dataset.themeDark;
        
        if (themeColor) {
            const meta = document.querySelector('meta[name="theme-color"]');
            if (meta) {
                meta.setAttribute('content', themeColor);
            }
        }
    } catch (e) {
        // Fallback for private mode or blocked storage
    }
})();
