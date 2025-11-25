document.addEventListener('DOMContentLoaded', () => {
    // Check auth
    if (!window.quizStore.currentUser) {
        window.location.href = 'index.html';
        return;
    }

    // Get Quiz ID
    const urlParams = new URLSearchParams(window.location.search);
    const quizId = urlParams.get('id');
    const quiz = window.quizStore.getQuizById(quizId);

    if (!quiz) {
        window.location.href = 'dashboard.html';
        return;
    }

    // State
    let currentQuestionIndex = 0;
    let answers = {}; // questionId -> value (string or array)
    let timeRemaining = quiz.timeLimit;
    let timerInterval;
    const startTime = Date.now();

    // DOM Elements
    const quizContainer = document.getElementById('quiz-container');
    const resultContainer = document.getElementById('result-container');
    const quizTitle = document.getElementById('quiz-title');
    const timerDisplay = document.getElementById('timer');
    const progressBar = document.getElementById('progress-bar');
    const questionCounter = document.getElementById('question-counter');
    const questionText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const reviewBtn = document.getElementById('review-btn');
    const reviewSection = document.getElementById('review-section');
    const reviewList = document.getElementById('review-list');

    // Initialize
    quizTitle.textContent = quiz.title;
    startTimer();
    renderQuestion();

    // Timer Logic
    function startTimer() {
        updateTimerDisplay();
        timerInterval = setInterval(() => {
            timeRemaining--;
            updateTimerDisplay();

            if (timeRemaining <= 0) {
                clearInterval(timerInterval);
                submitQuiz();
            }
        }, 1000);
    }

    function updateTimerDisplay() {
        const mins = Math.floor(timeRemaining / 60);
        const secs = timeRemaining % 60;
        timerDisplay.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
        if (timeRemaining < 60) {
            timerDisplay.classList.add('text-destructive');
        }
    }

    // Render Question
    function renderQuestion() {
        const question = quiz.questions[currentQuestionIndex];

        // Update Progress
        const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
        progressBar.style.width = `${progress}%`;
        questionCounter.textContent = `Question ${currentQuestionIndex + 1} of ${quiz.questions.length}`;

        // Update Content
        questionText.textContent = question.question;

        // Render Options
        optionsContainer.innerHTML = '';

        if (question.type === 'single' || question.type === 'boolean') {
            // Radio buttons
            question.options.forEach(option => {
                const isSelected = answers[question.id] === option;
                const div = document.createElement('div');
                div.className = `flex items-center space-x-2 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer ${isSelected ? 'bg-muted/50' : ''}`;
                div.onclick = () => handleAnswer(question.id, option);

                div.innerHTML = `
                    <div class="h-4 w-4 rounded-full border border-primary flex items-center justify-center">
                        ${isSelected ? '<div class="h-2 w-2 rounded-full bg-primary"></div>' : ''}
                    </div>
                    <label class="flex-1 cursor-pointer select-none">${option}</label>
                `;
                optionsContainer.appendChild(div);
            });
        } else {
            // Checkboxes
            question.options.forEach(option => {
                const currentAnswers = answers[question.id] || [];
                const isSelected = currentAnswers.includes(option);

                const div = document.createElement('div');
                div.className = `flex items-center space-x-2 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer ${isSelected ? 'bg-muted/50' : ''}`;
                div.onclick = () => {
                    let newAnswers = [...currentAnswers];
                    if (isSelected) {
                        newAnswers = newAnswers.filter(a => a !== option);
                    } else {
                        newAnswers.push(option);
                    }
                    handleAnswer(question.id, newAnswers);
                };

                div.innerHTML = `
                    <div class="h-4 w-4 rounded-sm border border-primary flex items-center justify-center ${isSelected ? 'bg-primary text-primary-foreground' : ''}">
                        ${isSelected ? '<i data-lucide="check" class="h-3 w-3"></i>' : ''}
                    </div>
                    <label class="flex-1 cursor-pointer select-none">${option}</label>
                `;
                optionsContainer.appendChild(div);
            });
            lucide.createIcons();
        }

        // Update Buttons
        prevBtn.disabled = currentQuestionIndex === 0;
        nextBtn.textContent = currentQuestionIndex === quiz.questions.length - 1 ? 'Submit' : 'Next';
    }

    function handleAnswer(questionId, value) {
        answers[questionId] = value;
        renderQuestion(); // Re-render to update selection UI
    }

    // Navigation Handlers
    prevBtn.addEventListener('click', () => {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            renderQuestion();
        }
    });

    nextBtn.addEventListener('click', () => {
        if (currentQuestionIndex < quiz.questions.length - 1) {
            currentQuestionIndex++;
            renderQuestion();
        } else {
            submitQuiz();
        }
    });

    // Submit Logic
    function submitQuiz() {
        clearInterval(timerInterval);

        let correctCount = 0;

        quiz.questions.forEach((question) => {
            const userAnswer = answers[question.id];
            if (!userAnswer) return;

            if (question.type === 'multiple') {
                const correct = question.correctAnswer;
                const user = userAnswer;
                if (
                    correct.length === user.length &&
                    correct.every((ans) => user.includes(ans))
                ) {
                    correctCount++;
                }
            } else {
                if (userAnswer === question.correctAnswer) {
                    correctCount++;
                }
            }
        });

        const timeTaken = Math.floor((Date.now() - startTime) / 1000);

        // Save attempt
        window.quizStore.submitAttempt({
            quizId: quiz.id,
            quizTitle: quiz.title,
            studentEmail: window.quizStore.currentUser.email,
            score: correctCount,
            totalQuestions: quiz.questions.length,
            timeTaken,
        });

        showResults(correctCount);
    }

    function showResults(score) {
        quizContainer.classList.add('hidden');
        resultContainer.classList.remove('hidden');

        const percentage = (score / quiz.questions.length) * 100;
        const resultIcon = document.getElementById('result-icon');
        const scorePercentage = document.getElementById('score-percentage');
        const scoreText = document.getElementById('score-text');

        if (percentage >= 70) {
            resultIcon.innerHTML = `<i data-lucide="check-circle-2" class="w-20 h-20 text-primary"></i>`;
            window.soundManager.playSuccess();
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
        } else {
            resultIcon.innerHTML = `<i data-lucide="x-circle" class="w-20 h-20 text-destructive"></i>`;
            window.soundManager.playIncorrect();
        }

        scorePercentage.textContent = `${percentage.toFixed(0)}%`;
        scoreText.textContent = `You scored ${score} out of ${quiz.questions.length}`;

        lucide.createIcons();
    }

    // Review Logic
    reviewBtn.addEventListener('click', () => {
        reviewSection.classList.remove('hidden');
        reviewBtn.classList.add('hidden');

        reviewList.innerHTML = quiz.questions.map((q, i) => {
            const userAnswer = answers[q.id];
            const isCorrect = checkAnswer(q, userAnswer);

            return `
                <div class="p-4 rounded-lg border ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}">
                    <p class="font-medium mb-2">Q${i + 1}: ${q.question}</p>
                    <div class="text-sm space-y-1">
                        <p class="${isCorrect ? 'text-green-700' : 'text-red-700'}">
                            Your Answer: ${formatAnswer(userAnswer)}
                        </p>
                        ${!isCorrect ? `
                            <p class="text-green-700 font-medium">
                                Correct Answer: ${formatAnswer(q.correctAnswer)}
                            </p>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');
    });

    function checkAnswer(question, userAnswer) {
        if (!userAnswer) return false;
        if (question.type === 'multiple') {
            const correct = question.correctAnswer;
            return correct.length === userAnswer.length && correct.every(ans => userAnswer.includes(ans));
        }
        return userAnswer === question.correctAnswer;
    }

    function formatAnswer(ans) {
        if (!ans) return 'Skipped';
        return Array.isArray(ans) ? ans.join(', ') : ans;
    }
});
