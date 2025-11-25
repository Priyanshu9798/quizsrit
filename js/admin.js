document.addEventListener('DOMContentLoaded', () => {
    // Check auth
    if (!window.quizStore.currentUser || window.quizStore.currentUser.role !== 'admin') {
        window.location.href = 'index.html';
        return;
    }

    // Logout handler
    document.getElementById('logout-btn').addEventListener('click', () => {
        window.quizStore.logout();
        window.location.href = 'index.html';
    });

    // State
    let questions = [];
    let currentOptions = ['', ''];

    // DOM Elements
    const questionTypeSelect = document.getElementById('question-type');
    const optionsList = document.getElementById('options-list');
    const addOptionBtn = document.getElementById('add-option-btn');
    const questionsPreview = document.getElementById('questions-preview');
    const questionsList = document.getElementById('questions-list');
    const createQuizBtn = document.getElementById('create-quiz-btn');
    const existingQuizzesList = document.getElementById('existing-quizzes');

    // Render Options Inputs
    function renderOptionsInputs() {
        optionsList.innerHTML = currentOptions.map((opt, index) => `
            <input 
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mb-2"
                value="${opt}"
                placeholder="Option ${index + 1}"
                onchange="updateOption(${index}, this.value)"
            >
        `).join('');

        if (questionTypeSelect.value === 'boolean') {
            addOptionBtn.classList.add('hidden');
        } else {
            addOptionBtn.classList.remove('hidden');
        }
    }

    // Expose updateOption globally
    window.updateOption = (index, value) => {
        currentOptions[index] = value;
    };

    // Add Option Handler
    addOptionBtn.addEventListener('click', () => {
        currentOptions.push('');
        renderOptionsInputs();
    });

    // Question Type Change Handler
    questionTypeSelect.addEventListener('change', (e) => {
        if (e.target.value === 'boolean') {
            currentOptions = ['True', 'False'];
        } else {
            currentOptions = ['', ''];
        }
        renderOptionsInputs();
    });

    // Add Question Handler
    document.getElementById('add-question-btn').addEventListener('click', () => {
        const type = questionTypeSelect.value;
        const questionText = document.getElementById('question-text').value;
        const correctAnswer = document.getElementById('correct-answer').value;

        if (!questionText || currentOptions.some(opt => !opt) || !correctAnswer) {
            alert('Please fill all question fields');
            return;
        }

        questions.push({
            type,
            question: questionText,
            options: [...currentOptions],
            correctAnswer: type === 'multiple' ? correctAnswer.split(',').map(s => s.trim()) : correctAnswer
        });

        // Reset Question Form
        document.getElementById('question-text').value = '';
        document.getElementById('correct-answer').value = '';
        currentOptions = type === 'boolean' ? ['True', 'False'] : ['', ''];
        renderOptionsInputs();

        renderQuestionsPreview();
        alert('Question added');
    });

    // Render Questions Preview
    function renderQuestionsPreview() {
        if (questions.length > 0) {
            questionsPreview.classList.remove('hidden');
            createQuizBtn.classList.remove('hidden');
            createQuizBtn.textContent = `Create Quiz (${questions.length} questions)`;
        } else {
            questionsPreview.classList.add('hidden');
            createQuizBtn.classList.add('hidden');
        }

        questionsList.innerHTML = questions.map((q, index) => `
            <div class="flex justify-between items-start p-3 rounded-lg bg-muted/50">
                <div>
                    <p class="font-medium">Q${index + 1}: ${q.question}</p>
                    <p class="text-sm text-muted-foreground">${q.type}</p>
                </div>
                <button 
                    class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 w-9"
                    onclick="removeQuestion(${index})"
                >
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
            </div>
        `).join('');
        lucide.createIcons();
    }

    window.removeQuestion = (index) => {
        questions.splice(index, 1);
        renderQuestionsPreview();
    };

    // Create Quiz Handler
    createQuizBtn.addEventListener('click', () => {
        const title = document.getElementById('quiz-title').value;
        const description = document.getElementById('quiz-description').value;
        const category = document.getElementById('quiz-category').value;
        const timeLimit = document.getElementById('quiz-timeLimit').value;

        if (!title || !description || !category || questions.length === 0) {
            alert('Please fill all fields and add at least one question');
            return;
        }

        window.quizStore.createQuiz({
            title,
            description,
            category,
            timeLimit: parseInt(timeLimit),
            questions: questions.map((q, i) => ({ ...q, id: (i + 1).toString() }))
        });

        alert('Quiz created successfully!');

        // Reset Form
        document.getElementById('quiz-title').value = '';
        document.getElementById('quiz-description').value = '';
        document.getElementById('quiz-category').value = '';
        document.getElementById('quiz-timeLimit').value = '600';
        questions = [];
        renderQuestionsPreview();
        renderExistingQuizzes();
    });

    // Render Existing Quizzes
    function renderExistingQuizzes() {
        const quizzes = window.quizStore.getAllQuizzes();
        existingQuizzesList.innerHTML = quizzes.map(quiz => `
            <div class="flex justify-between items-start p-3 rounded-lg bg-muted/50">
                <div>
                    <p class="font-medium">${quiz.title}</p>
                    <p class="text-sm text-muted-foreground">
                        ${quiz.questions.length} questions • ${quiz.category}
                    </p>
                </div>
                <button 
                    class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 w-9"
                    onclick="deleteQuiz('${quiz.id}')"
                >
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
            </div>
        `).join('');
        lucide.createIcons();
    }

    window.deleteQuiz = (id) => {
        if (confirm('Are you sure you want to delete this quiz?')) {
            window.quizStore.deleteQuiz(id);
            renderExistingQuizzes();
        }
    };

    // Initial Render
    renderOptionsInputs();
    renderExistingQuizzes();
});
