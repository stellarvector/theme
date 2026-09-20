(function () {
    'use strict';

    const board = document.getElementById('challenges-board');
    const filters = document.getElementById('challenge-filters');

    if (!board) return;

    async function fetchChallenges() {
        try {
            const challengesRes = await fetch('/api/v1/challenges');
            const challenges = (await challengesRes.json()).data;

            renderBoard(challenges);
        } catch (err) {
            board.innerHTML = `<p class="text-accent">Error loading challenges. Please check your connection.</p>`;
        }
    }

    function renderBoard(challenges) {
        const categories = {};
        challenges.forEach(c => {
            if (!categories[c.category]) categories[c.category] = [];
            categories[c.category].push(c);
        });

        board.innerHTML = '';
        
        // Render Filters
        const allBtn = createFilterBtn('All', true);
        filters.appendChild(allBtn);
        Object.keys(categories).forEach(cat => {
            filters.appendChild(createFilterBtn(cat));
        });

        // Render Categories
        Object.entries(categories).forEach(([name, items]) => {
            const section = document.createElement('section');
            section.className = 'challenge-category';
            section.dataset.category = name;

            const header = document.createElement('h2');
            header.className = 'sv-section-title mb-6';
            header.textContent = name;
            section.appendChild(header);

            const grid = document.createElement('div');
            grid.className = 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3';

            items.forEach(c => {
                const solved = c.solved_by_me;
                const card = document.createElement('button');
                card.type = 'button';
                card.className = `flex flex-col text-left p-4 rounded-sm border transition-all duration-200 group relative overflow-hidden
                    ${solved ? 'border-accent/50 bg-accent/5' : 'border-line-strong bg-card hover:border-accent'}`;
                
                card.innerHTML = `
                    <div class="flex justify-between items-start mb-2">
                        <span class="sv-label text-xs ${solved ? 'text-accent' : 'text-muted'}">${c.category}</span>
                        ${solved ? '<span class="text-accent text-[10px] font-mono">SOLVED</span>' : ''}
                    </div>
                    <h3 class="font-mono font-bold text-sm mb-1 group-hover:text-accent transition-colors">${c.name}</h3>
                    <p class="text-xs text-muted">${c.value} points</p>
                `;

                card.onclick = () => loadChallenge(c.id);
                grid.appendChild(card);
            });

            section.appendChild(grid);
            board.appendChild(section);
        });
    }

    function createFilterBtn(name, active = false) {
        const btn = document.createElement('button');
        btn.className = `px-3 py-1 font-mono text-xs border rounded-xs transition-colors
            ${active ? 'bg-accent border-accent text-accent-text!' : 'border-line-strong text-muted hover:border-accent'}`;
        btn.textContent = name;
        btn.onclick = () => {
            document.querySelectorAll('#challenge-filters button').forEach(b => {
                b.classList.remove('bg-accent', 'border-accent', 'text-accent-text!');
                b.classList.add('border-line-strong', 'text-muted');
            });
            btn.classList.add('bg-accent', 'border-accent', 'text-accent-text!');
            btn.classList.remove('border-line-strong', 'text-muted');
            
            filterCategory(name === 'All' ? null : name);
        };
        return btn;
    }

    function filterCategory(cat) {
        document.querySelectorAll('.challenge-category').forEach(el => {
            el.style.display = (!cat || el.dataset.category === cat) ? 'block' : 'none';
        });
    }

    async function loadChallenge(id) {
        try {
            const res = await fetch(`/api/v1/challenges/${id}`);
            const challenge = (await res.json()).data;
            
            renderModal(challenge);
        } catch (err) {
            console.error('Failed to load challenge:', err);
        }
    }

    function renderModal(c) {
        const container = document.getElementById('modal-container');
        if (!container) return;

        container.innerHTML = `
            <div id="challenge-modal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-page/90 backdrop-blur-sm">
                <div class="relative w-full max-w-2xl rounded-sm border border-line-strong bg-card shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                    <div class="flex items-center justify-between border-b border-line-strong p-6">
                        <div>
                            <span class="sv-label text-xs text-accent mb-1 block">${c.category}</span>
                            <h2 class="sv-marker text-xl">${c.name}</h2>
                        </div>
                        <button type="button" class="text-muted hover:text-accent transition-colors" id="close-modal">
                            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>
                        </button>
                    </div>
                    
                    <div class="p-6 sm:p-8 overflow-y-auto">
                        <div class="prose max-w-none text-muted mb-8">
                            ${c.description}
                        </div>

                        ${c.files && c.files.length ? `
                        <div class="grid gap-2 mb-8">
                            ${c.files.map(f => `
                            <a href="${f}" class="flex items-center gap-2 p-3 rounded-xs border border-line-strong bg-surface hover:border-accent group transition-colors no-underline">
                                <svg class="w-4 h-4 text-muted group-hover:text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"/></svg>
                                <span class="font-mono text-xs text-body group-hover:text-link">${f.split('/').pop().split('?')[0]}</span>
                            </a>
                            `).join('')}
                        </div>
                        ` : ''}

                        <div class="flex flex-col gap-4 mt-auto">
                            <div class="flex gap-2">
                                <input type="text" id="flag-input" placeholder="sv{...}" 
                                       class="flex-1 rounded-sm border border-line-strong bg-surface px-4 py-2.5 font-mono text-sm text-body focus:border-accent focus:outline-none">
                                <button id="submit-flag" data-id="${c.id}" class="font-mono font-bold px-6 bg-accent text-accent-text! hover:bg-accent-dark transition-colors rounded-sm">
                                    SUBMIT
                                </button>
                            </div>
                            <div id="submission-response"></div>
                        </div>
                    </div>
                    
                    <div class="flex items-center justify-between border-t border-line-strong bg-surface/50 p-4 px-6 text-xs text-muted font-mono">
                        <span>${c.value} points</span>
                        <span>${c.solves} solves</span>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('close-modal').onclick = () => container.innerHTML = '';
        window.location.hash = c.id;
    }

    // Handle flag submission
    document.addEventListener('click', async (e) => {
        const btn = e.target.closest('#submit-flag');
        if (btn) {
            const input = document.getElementById('flag-input');
            const responseDiv = document.getElementById('submission-response');
            const challengeId = btn.dataset.id;

            if (!input || !challengeId) return;

            try {
                const res = await fetch('/api/v1/challenges/attempt', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'CSRF-Token': init.csrfToken
                    },
                    body: JSON.stringify({
                        challenge_id: challengeId,
                        submission: input.value
                    })
                });

                const data = await res.json();
                if (data.success) {
                    if (data.data.status === 'correct') {
                        responseDiv.innerHTML = `<p class="text-accent mt-2 font-mono text-xs">CORRECT!</p>`;
                        setTimeout(() => window.location.reload(), 1000);
                    } else {
                        responseDiv.innerHTML = `<p class="text-muted mt-2 font-mono text-xs">${data.data.message || 'INCORRECT'}</p>`;
                    }
                }
            } catch (err) {
                responseDiv.innerHTML = `<p class="text-accent mt-2 font-mono text-xs">ERROR</p>`;
            }
        }
    });

    fetchChallenges().then(() => {
        if (window.location.hash) {
            const id = window.location.hash.slice(1);
            if (!isNaN(id)) loadChallenge(id);
        }
    });
})();
