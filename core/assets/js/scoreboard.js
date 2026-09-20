(function () {
    'use strict';

    const body = document.getElementById('scoreboard-body');

    if (!body) return;

    async function fetchScoreboard() {
        try {
            const res = await fetch('/api/v1/scoreboard');
            const teams = (await res.json()).data;

            renderScoreboard(teams);
        } catch (err) {
            body.innerHTML = `<tr><td colspan="3" class="px-6 py-12 text-center text-accent">Error loading scoreboard.</td></tr>`;
        }
    }

    function renderScoreboard(teams) {
        if (teams.length === 0) {
            body.innerHTML = `<tr><td colspan="3" class="px-6 py-12 text-center text-muted">No teams have scored yet.</td></tr>`;
            return;
        }

        body.innerHTML = '';
        teams.forEach((team, i) => {
            const row = document.createElement('tr');
            row.className = 'border-b border-line hover:bg-surface transition-colors group';
            
            row.innerHTML = `
                <td class="px-6 py-4 text-muted group-hover:text-accent">${i + 1}</td>
                <td class="px-6 py-4">
                    <a href="/teams/${team.account_id}" class="text-body hover:text-link no-underline font-bold">${team.name}</a>
                </td>
                <td class="px-6 py-4 text-right font-bold text-accent">${team.score}</td>
            `;

            body.appendChild(row);
        });
    }

    fetchScoreboard();
})();
