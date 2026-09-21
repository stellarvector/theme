/**
 * sv-chrome.js -- Theme toggle and mobile menu behavior.
 * Loaded deferred.
 */
(function() {
    'use strict';

    // --- Global Configuration ---
    const b = document.body;
    window.init = {
        urlRoot: b.dataset.urlRoot || '',
        csrfToken: b.dataset.csrfToken || '',
        userMode: b.dataset.userMode || '',
        userId: parseInt(b.dataset.userId || '0', 10),
        userName: b.dataset.userName || '',
        userEmail: b.dataset.userEmail || '',
        teamId: b.dataset.teamId || '',
        teamName: b.dataset.teamName || '',
        start: b.dataset.start || '',
        end: b.dataset.end || ''
    };

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

    // --- Modal System ---
    const modalContainer = document.getElementById('modal-container');
    
    window.svModal = {
        close: () => {
            if (modalContainer) modalContainer.innerHTML = '';
        },
        confirm: (message, onConfirm) => {
            if (!modalContainer) return;
            modalContainer.innerHTML = `
                <div class="fixed inset-0 z-[1001] flex items-center justify-center p-4 bg-page/90 backdrop-blur-sm">
                    <div class="w-full max-w-md rounded-sm border border-line-strong bg-card shadow-2xl overflow-hidden p-6 animate-in zoom-in-95 duration-200">
                        <p class="font-mono text-sm text-body mb-6">${message}</p>
                        <div class="flex justify-end gap-3">
                            <button type="button" class="px-4 py-2 font-mono text-xs text-muted uppercase tracking-widest hover:text-body transition-colors" data-modal-close>Cancel</button>
                            <button type="button" id="modal-confirm-btn" class="px-4 py-2 font-mono text-xs bg-accent text-accent-text! font-bold uppercase tracking-widest hover:bg-accent-dark transition-colors rounded-sm">Confirm</button>
                        </div>
                    </div>
                </div>
            `;
            document.getElementById('modal-confirm-btn').onclick = () => {
                onConfirm();
                window.svModal.close();
            };
        },
        alert: (message) => {
            if (!modalContainer) return;
            modalContainer.innerHTML = `
                <div class="fixed inset-0 z-[1001] flex items-center justify-center p-4 bg-page/90 backdrop-blur-sm">
                    <div class="w-full max-w-md rounded-sm border border-line-strong bg-card shadow-2xl overflow-hidden p-6 animate-in zoom-in-95 duration-200">
                        <p class="font-mono text-sm text-body mb-6">${message}</p>
                        <div class="flex justify-end">
                            <button type="button" class="px-4 py-2 font-mono text-xs bg-accent text-accent-text! font-bold uppercase tracking-widest hover:bg-accent-dark transition-colors rounded-sm" data-modal-close>OK</button>
                        </div>
                    </div>
                </div>
            `;
        }
    };

    if (modalContainer) {
        modalContainer.addEventListener('click', (e) => {
            if (e.target.closest('[data-modal-close]') || e.target === modalContainer.firstElementChild) {
                window.svModal.close();
            }
        });
    }

    // --- Notifications ---
    const notificationsContainer = document.getElementById('notifications');
    if (notificationsContainer) {
        const checkNotifications = async () => {
            try {
                const res = await fetch(`${window.init.urlRoot}/api/v1/notifications`);
                const data = await res.json();
                if (data.success && data.data.length) {
                    data.data.forEach(n => {
                        if (document.getElementById(`notif-${n.id}`)) return;
                        
                        const el = document.createElement('div');
                        el.id = `notif-${n.id}`;
                        el.className = 'sv-terminal p-4 bg-card/95 text-body border-accent shadow-2xl animate-in slide-in-from-right pointer-events-auto cursor-pointer group hover:border-accent-light transition-colors';
                        el.innerHTML = `
                            <div class="flex justify-between items-start mb-1">
                                <span class="sv-label text-[10px] text-accent font-bold uppercase tracking-widest">Notification</span>
                                <span class="text-[10px] text-muted font-mono">${n.date}</span>
                            </div>
                            <p class="font-mono text-xs font-bold text-heading group-hover:text-accent transition-colors">${n.title}</p>
                            <p class="text-xs mt-1 text-muted leading-relaxed">${n.content}</p>
                            <div class="mt-2 text-[9px] text-accent/40 font-mono text-right uppercase tracking-tighter group-hover:text-accent/60">Click to dismiss</div>
                        `;
                        el.addEventListener('click', () => el.remove());
                        notificationsContainer.appendChild(el);
                    });
                }
            } catch (err) {}
        };
        
        checkNotifications();
        setInterval(checkNotifications, 60000);
    }

    // --- Token Management ---
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-delete-token]');
        if (btn) {
            const tokenId = btn.dataset.deleteToken;
            window.svModal.confirm('Are you sure you want to revoke this access token?', () => {
                fetch(`${window.init.urlRoot}/api/v1/tokens/${tokenId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'CSRF-Token': window.init.csrfToken
                    }
                }).then(res => res.json()).then(data => {
                    if (data.success) {
                        window.location.reload();
                    } else {
                        window.svModal.alert(data.errors || 'Error revoking token');
                    }
                });
            });
        }
    });
})();
