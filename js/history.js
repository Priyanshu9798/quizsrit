document.addEventListener('DOMContentLoaded', () => {
    // Check auth
    if (!window.quizStore.currentUser) {
        window.location.href = 'index.html';
        return;
    }

    const attempts = window.quizStore.getStudentAttempts(window.quizStore.currentUser.email)
        .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));

    const historyList = document.getElementById('history-list');
    const noHistoryMsg = document.getElementById('no-history');

    if (attempts.length === 0) {
        noHistoryMsg.classList.remove('hidden');
    } else {
        noHistoryMsg.classList.add('hidden');
        historyList.innerHTML = attempts.map((attempt, index) => {
            const percentage = (attempt.score / attempt.totalQuestions) * 100;
            const isPassing = percentage >= 70;
            const date = new Date(attempt.completedAt).toLocaleDateString();
            const time = new Date(attempt.completedAt).toLocaleTimeString();

            return `
                <div class="glass-card rounded-xl border bg-card text-card-foreground shadow-sm p-6 hover-lift" style="animation-delay: ${index * 0.1}s">
                    <div class="flex justify-between items-center">
                        <div>
                            <h3 class="font-semibold text-lg">${attempt.quizTitle}</h3>
                            <p class="text-sm text-muted-foreground">
                                <i data-lucide="calendar" class="w-3 h-3 inline mr-1"></i>
                                ${date} at ${time}
                            </p>
                        </div>
                        <div class="text-right">
                            <div class="text-2xl font-bold ${isPassing ? 'text-green-500' : 'text-destructive'}">
                                ${percentage.toFixed(0)}%
                            </div>
                            <p class="text-xs text-muted-foreground">
                                ${attempt.score}/${attempt.totalQuestions} correct
                            </p>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        lucide.createIcons();
    }
});
