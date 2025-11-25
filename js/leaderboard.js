document.addEventListener('DOMContentLoaded', () => {
    // Check auth
    if (!window.quizStore.currentUser) {
        window.location.href = 'index.html';
        return;
    }

    const leaderboard = window.quizStore.getLeaderboard();
    const leaderboardBody = document.getElementById('leaderboard-body');

    if (leaderboard.length === 0) {
        leaderboardBody.innerHTML = `
            <tr>
                <td colspan="4" class="p-4 text-center text-muted-foreground">No data available</td>
            </tr>
        `;
    } else {
        leaderboardBody.innerHTML = leaderboard.map((entry, index) => {
            let rankIcon = '';
            if (index === 0) rankIcon = '<i data-lucide="trophy" class="w-5 h-5 text-yellow-500 inline mr-2"></i>';
            else if (index === 1) rankIcon = '<i data-lucide="medal" class="w-5 h-5 text-gray-400 inline mr-2"></i>';
            else if (index === 2) rankIcon = '<i data-lucide="medal" class="w-5 h-5 text-amber-600 inline mr-2"></i>';

            return `
                <tr class="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <td class="p-4 align-middle font-medium">
                        ${rankIcon}
                        <span class="${index < 3 ? 'font-bold' : ''}">#${index + 1}</span>
                    </td>
                    <td class="p-4 align-middle">
                        <div class="flex items-center gap-2">
                            <div class="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                ${entry.studentEmail[0].toUpperCase()}
                            </div>
                            ${entry.studentEmail}
                        </div>
                    </td>
                    <td class="p-4 align-middle text-right">${entry.quizzesCompleted}</td>
                    <td class="p-4 align-middle text-right font-bold text-primary">
                        ${entry.averageScore.toFixed(1)}%
                    </td>
                </tr>
            `;
        }).join('');
        lucide.createIcons();
    }
});
