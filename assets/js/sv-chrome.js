/**
 * sv-chrome.js -- Theme toggle and mobile menu behavior.
 * Loaded deferred.
 */
(function() {
    'use strict';

    // --- Theme Toggle ---
    const themeButtons = document.querySelectorAll('[data-theme-toggle]');
    
    if (themeButtons.length > 0) {
        const syncTheme = () => {
            const isLight = document.documentElement.classList.contains('light');
            const themeColor = isLight ? document.documentElement.dataset.themeLight
                                       : document.documentElement.dataset.themeDark;

            themeButtons.forEach(button => {
                button.setAttribute('aria-pressed', String(isLight));
                button.setAttribute('aria-label', isLight ? 'Switch to dark theme' : 'Switch to light theme');

                const label = button.querySelector('[data-theme-label]');
                if (label) {
                    label.textContent = isLight ? 'theme: light' : 'theme: dark';
                }
            });

            if (themeColor) {
                const meta = document.querySelector('meta[name="theme-color"]');
                if (meta) {
                    meta.setAttribute('content', themeColor);
                }
            }
        };

        // Initial sync
        syncTheme();

        themeButtons.forEach(button => {
            button.addEventListener('click', () => {
                const isLight = document.documentElement.classList.toggle('light');
                try {
                    localStorage.setItem('sv-theme', isLight ? 'light' : 'dark');
                } catch (e) {}
                syncTheme();
            });
        });
    }

    // --- Mobile Menu ---
    const toggle = document.getElementById('menu-toggle');
    const panel = document.getElementById('menu-panel');

    if (toggle && panel) {
        const setOpen = (open) => {
            toggle.setAttribute('aria-expanded', String(open));
            toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
            
            if (open) {
                panel.classList.remove('hidden');
                panel.hidden = false;
            } else {
                panel.classList.add('hidden');
                panel.hidden = true;
            }
        };

        // Initial state
        setOpen(toggle.getAttribute('aria-expanded') === 'true');

        toggle.addEventListener('click', () => {
            setOpen(toggle.getAttribute('aria-expanded') !== 'true');
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
                setOpen(false);
                toggle.focus();
            }
        });

        document.addEventListener('click', (event) => {
            if (toggle.getAttribute('aria-expanded') !== 'true') return;
            if (!event.target.closest('#menu-panel') && !event.target.closest('#menu-toggle')) {
                setOpen(false);
            }
        });

        const wide = window.matchMedia('(min-width: 768px)');
        const onWide = (event) => {
            if (event.matches) setOpen(false);
        };
        wide.addEventListener('change', onWide);
    }
})();
