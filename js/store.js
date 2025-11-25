class QuizStore {
    constructor() {
        this.users = [
            { email: 'student@quiz.com', password: 'student123', role: 'student' },
            { email: 'admin@quiz.com', password: 'admin123', role: 'admin' },
        ];

        this.quizzes = [
            {
                id: '1',
                title: 'JavaScript Fundamentals',
                description: 'Test your knowledge of JavaScript basics',
                category: 'Programming',
                timeLimit: 600,
                createdAt: new Date(),
                questions: [
                    {
                        id: '1',
                        type: 'single',
                        question: 'What is the output of: typeof null?',
                        options: ['null', 'undefined', 'object', 'number'],
                        correctAnswer: 'object',
                    },
                    {
                        id: '2',
                        type: 'multiple',
                        question: 'Which are JavaScript data types?',
                        options: ['string', 'number', 'boolean', 'character'],
                        correctAnswer: ['string', 'number', 'boolean'],
                    },
                    {
                        id: '3',
                        type: 'boolean',
                        question: 'JavaScript is a compiled language.',
                        options: ['True', 'False'],
                        correctAnswer: 'False',
                    },
                ],
            },
            {
                id: '2',
                title: 'React Basics',
                description: 'Master the fundamentals of React',
                category: 'Frontend',
                timeLimit: 900,
                createdAt: new Date(),
                questions: [
                    {
                        id: '1',
                        type: 'single',
                        question: 'What is JSX?',
                        options: [
                            'JavaScript XML',
                            'Java Syntax Extension',
                            'JSON Extension',
                            'JavaScript Extension',
                        ],
                        correctAnswer: 'JavaScript XML',
                    },
                    {
                        id: '2',
                        type: 'boolean',
                        question: 'React components must start with a capital letter.',
                        options: ['True', 'False'],
                        correctAnswer: 'True',
                    },
                ],
            },
            {
                id: '3',
                title: 'Web Development Essentials',
                description: 'Core concepts every web developer should know',
                category: 'General',
                timeLimit: 720,
                createdAt: new Date(),
                questions: [
                    {
                        id: '1',
                        type: 'single',
                        question: 'What does HTML stand for?',
                        options: [
                            'Hyper Text Markup Language',
                            'High Tech Modern Language',
                            'Home Tool Markup Language',
                            'Hyperlinks and Text Markup Language',
                        ],
                        correctAnswer: 'Hyper Text Markup Language',
                    },
                ],
            },
        ];

        this.attempts = [
            {
                id: '1',
                quizId: '1',
                quizTitle: 'JavaScript Fundamentals',
                studentEmail: 'student@quiz.com',
                score: 2,
                totalQuestions: 3,
                completedAt: new Date(Date.now() - 86400000),
                timeTaken: 450,
            },
            {
                id: '2',
                quizId: '2',
                quizTitle: 'React Basics',
                studentEmail: 'student@quiz.com',
                score: 2,
                totalQuestions: 2,
                completedAt: new Date(Date.now() - 172800000),
                timeTaken: 600,
            },
        ];

        this.currentUser = null;

        // Load state from localStorage if available
        this.loadState();
    }

    loadState() {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            this.currentUser = JSON.parse(storedUser);
        }

        const storedQuizzes = localStorage.getItem('quizzes');
        if (storedQuizzes) {
            this.quizzes = JSON.parse(storedQuizzes);
            // Fix Date objects
            this.quizzes.forEach(q => q.createdAt = new Date(q.createdAt));
        }

        const storedAttempts = localStorage.getItem('attempts');
        if (storedAttempts) {
            this.attempts = JSON.parse(storedAttempts);
            // Fix Date objects
            this.attempts.forEach(a => a.completedAt = new Date(a.completedAt));
        }
    }

    saveState() {
        if (this.currentUser) {
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        } else {
            localStorage.removeItem('currentUser');
        }
        localStorage.setItem('quizzes', JSON.stringify(this.quizzes));
        localStorage.setItem('attempts', JSON.stringify(this.attempts));
    }

    // Auth methods
    login(email, password) {
        const user = this.users.find(
            (u) => u.email === email && u.password === password
        );
        if (user) {
            this.currentUser = user;
            this.saveState();
            return user;
        }
        return null;
    }

    logout() {
        this.currentUser = null;
        this.saveState();
    }

    // Quiz methods
    getAllQuizzes() {
        return this.quizzes;
    }

    getQuizById(id) {
        return this.quizzes.find((q) => q.id === id);
    }

    createQuiz(quiz) {
        const newQuiz = {
            ...quiz,
            id: Date.now().toString(),
            createdAt: new Date(),
        };
        this.quizzes.push(newQuiz);
        this.saveState();
        return newQuiz;
    }

    deleteQuiz(id) {
        const index = this.quizzes.findIndex((q) => q.id === id);
        if (index !== -1) {
            this.quizzes.splice(index, 1);
            this.saveState();
            return true;
        }
        return false;
    }

    // Attempt methods
    submitAttempt(attempt) {
        const newAttempt = {
            ...attempt,
            id: Date.now().toString(),
            completedAt: new Date(),
        };
        this.attempts.push(newAttempt);
        this.saveState();
        return newAttempt;
    }

    getStudentAttempts(email) {
        return this.attempts.filter((a) => a.studentEmail === email);
    }

    getLeaderboard() {
        const studentStats = new Map();

        this.attempts.forEach((attempt) => {
            const existing = studentStats.get(attempt.studentEmail);
            const percentage = (attempt.score / attempt.totalQuestions) * 100;

            if (existing) {
                existing.totalScore += percentage;
                existing.quizzesCompleted += 1;
                existing.averageScore = existing.totalScore / existing.quizzesCompleted;
            } else {
                studentStats.set(attempt.studentEmail, {
                    studentEmail: attempt.studentEmail,
                    totalScore: percentage,
                    quizzesCompleted: 1,
                    averageScore: percentage,
                });
            }
        });

        return Array.from(studentStats.values()).sort(
            (a, b) => b.averageScore - a.averageScore
        );
    }
}

// Initialize and expose global store
window.quizStore = new QuizStore();
