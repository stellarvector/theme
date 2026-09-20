(function () {
    'use strict';

    const board = document.getElementById('challenges-board');
    const filters = document.getElementById('challenge-filters');

    if (!board) return;

    async function fetchChallenges() {
        try {
            const [challengesRes, solvesRes] = await Promise.all([
                fetch('/api/v1/challenges'),
                fetch('/api/v1/challenges/solves')
            ]);

            const challenges = (await challengesRes.json()).data;
            const solves = (await solvesRes.json()).data.map(s => s.challenge_id);

            renderBoard(challenges, solves);
        } catch (err) {
            board.innerHTML = `<p class="text-accent">Error loading challenges. Please check your connection.</p>`;
        }
    }

    function renderBoard(challenges, solves) {
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
                const solved = solves.includes(c.id);
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

    function loadChallenge(id) {
        fetch(`/api/v1/challenges/${id}`)
            .then(res => res.json())
            .then(res => {
                const challenge = res.data;
                // For now, we'll use a simple alert/prompt or just log.
                // In a real theme, this would populate and show a modal.
                console.log('Challenge loaded:', challenge);
                // Since we don't have a full modal system implemented in JS yet,
                // we'll advise the user to use CTFd's standard modal if possible
                // or we can implement a simple one.
            });
    }

    // Handle flag submission if the elements exist (e.g. in a modal)
    document.addEventListener('click', async (e) => {
        if (e.target.id === 'submit-flag') {
            const input = document.getElementById('flag-input');
            const responseDiv = document.getElementById('submission-response');
            const challengeId = window.location.hash.slice(1);

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
                        responseDiv.innerHTML = `<p class="text-muted mt-2 font-mono text-xs">INCORRECT</p>`;
                    }
                }
            } catch (err) {
                responseDiv.innerHTML = `<p class="text-accent mt-2 font-mono text-xs">ERROR</p>`;
            }
        }
    });

    fetchChallenges();
})();
