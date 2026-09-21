(function () {
    'use strict';

    const body = document.getElementById('scoreboard-body');

    if (!body) return;

    async function fetchScoreboard() {
        try {
            const [scoreRes, bracketRes] = await Promise.all([
                fetch(`${window.init.urlRoot}/api/v1/scoreboard`),
                fetch(`${window.init.urlRoot}/api/v1/scoreboard/top/5`)
            ]);
            
            const teams = (await scoreRes.json()).data;
            renderScoreboard(teams);

            const topTeams = (await bracketRes.json()).data;
            renderGraph(topTeams);
        } catch (err) {
            body.innerHTML = `<tr><td colspan="3" class="px-6 py-12 text-center text-accent">Error loading scoreboard.</td></tr>`;
        }
    }

    function renderGraph(topTeams) {
        const container = document.getElementById('score-graph');
        if (!container) return;

        if (!Object.keys(topTeams).length) {
            container.innerHTML = '<div class="flex items-center justify-center h-full text-muted font-mono text-xs">NO TELEMETRY DATA AVAILABLE</div>';
            return;
        }

        const traces = [];
        const colors = ['#b21010', '#3ddc84', '#56b4e9', '#f0e442', '#cc79a7'];
        
        Object.entries(topTeams).forEach(([id, data], i) => {
            const team = data;
            const x = [window.init.start];
            const y = [0];

            team.solves.forEach(s => {
                x.push(s.date);
                y.push(s.value + (y[y.length - 1] || 0));
            });

            traces.push({
                x: x,
                y: y,
                name: team.name,
                mode: 'lines+markers',
                line: { shape: 'hv', width: 3, color: colors[i % colors.length] },
                marker: { size: 6 }
            });
        });

        const layout = {
            title: false,
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            font: { family: 'Space Mono, monospace', color: '#a89a9a', size: 10 },
            margin: { l: 40, r: 20, t: 20, b: 40 },
            hovermode: 'closest',
            xaxis: {
                showgrid: true,
                gridcolor: 'rgba(110, 50, 50, 0.15)',
                linecolor: 'rgba(110, 50, 50, 0.3)',
                zeroline: false
            },
            yaxis: {
                showgrid: true,
                gridcolor: 'rgba(110, 50, 50, 0.15)',
                linecolor: 'rgba(110, 50, 50, 0.3)',
                zeroline: false
            },
            legend: { orientation: 'h', y: -0.2 }
        };

        container.innerHTML = '';
        const config = { displayModeBar: false, responsive: true };
        Plotly.newPlot(container, traces, layout, config);
    }

    function renderScoreboard(teams) {
        if (teams.length === 0) {
            body.innerHTML = `<tr><td colspan="3" class="px-6 py-12 text-center text-muted">No one has scored yet.</td></tr>`;
            return;
        }

        const mode = window.init.userMode || 'teams';
        const path = mode === 'teams' ? 'teams' : 'users';

        body.innerHTML = '';
        teams.forEach((team, i) => {
            const row = document.createElement('tr');
            row.className = 'border-b border-line hover:bg-surface transition-colors group';
            
            row.innerHTML = `
                <td class="px-6 py-4 text-muted group-hover:text-accent">${i + 1}</td>
                <td class="px-6 py-4">
                    <a href="/${path}/${team.account_id}" class="text-body hover:text-link no-underline font-bold">${team.name}</a>
                </td>
                <td class="px-6 py-4 text-right font-bold text-accent">${team.score}</td>
            `;

            body.appendChild(row);
        });
    }

    fetchScoreboard();
})();
