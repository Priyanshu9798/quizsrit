document.addEventListener('DOMContentLoaded', () => {
    // Check auth
    if (!window.quizStore.currentUser) {
        window.location.href = 'index.html';
        return;
    }

    const user = window.quizStore.currentUser;
    document.getElementById('welcome-msg').textContent = `Welcome back, ${user.email}`;

    // Logout handler
    document.getElementById('logout-btn').addEventListener('click', () => {
        window.quizStore.logout();
        window.location.href = 'index.html';
    });

    // State
    let searchTerm = '';
    let selectedCategory = 'All';
    const quizzes = window.quizStore.getAllQuizzes();
    const categories = ['All', ...new Set(quizzes.map(q => q.category))];

    // Render Categories
    const categoryContainer = document.getElementById('category-filters');

    function renderCategories() {
        categoryContainer.innerHTML = categories.map(category => `
            <div 
                class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer hover-lift ${selectedCategory === category ? 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80' : 'text-foreground'}"
                onclick="setCategory('${category}')"
            >
                ${category}
            </div>
        `).join('');
    }

    // Expose setCategory to global scope for onclick
    window.setCategory = (category) => {
        selectedCategory = category;
        renderCategories();
        renderQuizzes();
    };

    // Render Quizzes
    const quizGrid = document.getElementById('quiz-grid');
    const noQuizzesMsg = document.getElementById('no-quizzes');

    function renderQuizzes() {
        const filteredQuizzes = quizzes.filter(quiz => {
            const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                quiz.description.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategory === 'All' || quiz.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });

        if (filteredQuizzes.length === 0) {
            quizGrid.innerHTML = '';
            noQuizzesMsg.classList.remove('hidden');
        } else {
            noQuizzesMsg.classList.add('hidden');
            quizGrid.innerHTML = filteredQuizzes.map((quiz, index) => `
                <div 
                    class="rounded-xl border bg-card text-card-foreground shadow-sm glass-card hover-lift cursor-pointer"
                    style="animation-delay: ${index * 0.1}s"
                    onclick="window.location.href='quiz.html?id=${quiz.id}'"
                >
                    <div class="flex flex-col space-y-1.5 p-6">
                        <div class="flex justify-between items-start mb-2">
                            <div class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                                ${quiz.category}
                            </div>
                            <div class="flex items-center text-sm text-muted-foreground">
                                <i data-lucide="clock" class="w-4 h-4 mr-1"></i>
                                ${Math.floor(quiz.timeLimit / 60)}m
                            </div>
                        </div>
                        <h3 class="text-2xl font-semibold leading-none tracking-tight text-xl">${quiz.title}</h3>
                        <p class="text-sm text-muted-foreground">${quiz.description}</p>
                    </div>
                    <div class="p-6 pt-0">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center text-sm text-muted-foreground">
                                <i data-lucide="book-open" class="w-4 h-4 mr-1"></i>
                                ${quiz.questions.length} questions
                            </div>
                            <button class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3 hover-lift">
                                Start Quiz
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');

            // Re-initialize icons for new elements
            lucide.createIcons();
        }
    }

    // Search Handler
    document.getElementById('search-input').addEventListener('input', (e) => {
        searchTerm = e.target.value;
        renderQuizzes();
    });

    // Initial Render
    renderCategories();
    renderQuizzes();
});
