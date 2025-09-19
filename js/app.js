/**
 * SAT Practice Pro - Core Application Logic
 * Modern JavaScript application with comprehensive features
 */

class SATApp {
    constructor() {
        this.questions = [];
        this.currentUser = null;
        this.currentQuestion = 0;
        this.practiceSession = null;
        this.userData = this.loadUserData();
        this.settings = this.loadSettings();
        
        this.init();
    }

    async init() {
        try {
            await this.loadQuestions();
            this.setupEventListeners();
            this.setupMobileNavigation();
            this.checkAuth();
            this.hideLoading();

            // Initialize analytics
            if (window.SATAnalytics) {
                window.SATAnalytics.init(this);
            }

            // Initialize skill practice module
            if (window.skillPracticeUI) {
                await window.skillPracticeUI.initialize();
            }
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showToast('Failed to load application', 'error');
        }
    }

    // Data Loading
    async loadQuestions() {
        try {
            const manifest = await this.fetchJSON('data/manifest.json');
            const questionArrays = [];
            
            for (const chunk of manifest.chunks) {
                const questions = await this.fetchJSON(`data/${chunk.path}`);
                questionArrays.push(...questions);
            }
            
            this.questions = questionArrays.map(q => ({
                ...q,
                attempts: 0,
                correctAttempts: 0,
                lastAttempted: null,
                averageTime: null,
                bookmarked: false,
                flagged: false
            }));
            
            console.log(`Loaded ${this.questions.length} questions`);
        } catch (error) {
            throw new Error(`Failed to load questions: ${error.message}`);
        }
    }

    async fetchJSON(url) {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json();
    }

    // Authentication & User Management
    checkAuth() {
        const user = localStorage.getItem('satapp_user');
        if (user) {
            this.currentUser = JSON.parse(user);
            this.showDashboard();
            this.updateUserInfo();
        } else {
            this.showAuthModal();
        }
    }

    showAuthModal() {
        document.getElementById('authModal').classList.remove('hidden');
    }

    hideAuthModal() {
        document.getElementById('authModal').classList.add('hidden');
    }

    login(email, password) {
        // Simulate authentication - in real app, this would call an API
        const users = JSON.parse(localStorage.getItem('satapp_users') || '{}');
        const user = users[email];
        
        if (user && user.password === password) {
            this.currentUser = { ...user };
            delete this.currentUser.password;
            localStorage.setItem('satapp_user', JSON.stringify(this.currentUser));
            this.hideAuthModal();
            this.showDashboard();
            this.updateUserInfo();
            this.showToast('Welcome back!', 'success');
            return true;
        } else {
            this.showToast('Invalid credentials', 'error');
            return false;
        }
    }

    signup(userData) {
        const users = JSON.parse(localStorage.getItem('satapp_users') || '{}');
        
        if (users[userData.email]) {
            this.showToast('Email already exists', 'error');
            return false;
        }
        
        const user = {
            id: Date.now().toString(),
            name: userData.name,
            email: userData.email,
            password: userData.password,
            targetScore: userData.targetScore,
            joinDate: new Date().toISOString(),
            stats: {
                questionsCompleted: 0,
                correctAnswers: 0,
                streak: 0,
                lastActivity: null,
                estimatedScore: 1200
            }
        };
        
        users[userData.email] = user;
        localStorage.setItem('satapp_users', JSON.stringify(users));
        
        this.currentUser = { ...user };
        delete this.currentUser.password;
        localStorage.setItem('satapp_user', JSON.stringify(this.currentUser));
        
        this.hideAuthModal();
        this.showDashboard();
        this.updateUserInfo();
        this.showToast('Account created successfully!', 'success');
        return true;
    }

    logout() {
        localStorage.removeItem('satapp_user');
        this.currentUser = null;
        this.showAuthModal();
        this.showToast('Logged out successfully', 'success');
    }

    updateUserInfo() {
        if (this.currentUser) {
            document.getElementById('userName').textContent = this.currentUser.name;
            document.getElementById('welcomeName').textContent = this.currentUser.name;
            this.updateDashboardStats();
        }
    }

    // Navigation
    showPage(pageId) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        // Show target page
        document.getElementById(pageId + 'Page').classList.add('active');
        
        // Update nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        document.querySelector(`[data-page="${pageId}"]`).classList.add('active');

        // Load lessons when navigating to Learn page
        if (pageId === 'learn' && window.learnPage && typeof window.learnPage.loadCreatorStudioLessons === 'function') {
            window.learnPage.loadCreatorStudioLessons();
        }
    }

    showDashboard() {
        this.showPage('dashboard');
        this.updateDashboardStats();
        this.loadRecentActivity();
    }

    // Dashboard
    updateDashboardStats() {
        if (!this.currentUser) return;
        
        const stats = this.getUserStats();
        
        document.getElementById('totalQuestions').textContent = stats.questionsCompleted;
        document.getElementById('accuracyRate').textContent = `${stats.accuracyRate}%`;
        document.getElementById('currentStreak').textContent = stats.streak;
        document.getElementById('estimatedScore').textContent = stats.estimatedScore;
    }

    getUserStats() {
        if (!this.currentUser) return {};
        
        const userData = this.getUserData();
        const sessions = userData.sessions || [];
        
        let questionsCompleted = 0;
        let correctAnswers = 0;
        
        sessions.forEach(session => {
            questionsCompleted += session.questions.length;
            correctAnswers += session.questions.filter(q => q.correct).length;
        });
        
        const accuracyRate = questionsCompleted > 0 ? 
            Math.round((correctAnswers / questionsCompleted) * 100) : 0;
        
        const estimatedScore = this.calculateEstimatedScore(accuracyRate);
        
        return {
            questionsCompleted,
            correctAnswers,
            accuracyRate,
            streak: userData.streak || 0,
            estimatedScore
        };
    }

    calculateEstimatedScore(accuracyRate) {
        // Simple estimation based on accuracy rate
        // In a real app, this would be more sophisticated
        const baseScore = 1200;
        const maxIncrease = 400;
        return Math.round(baseScore + (accuracyRate / 100) * maxIncrease);
    }

    loadRecentActivity() {
        const activityContainer = document.getElementById('recentActivity');
        const userData = this.getUserData();
        const sessions = userData.sessions?.slice(-5) || [];
        
        if (sessions.length === 0) {
            activityContainer.innerHTML = '<p class="text-secondary">No recent activity</p>';
            return;
        }
        
        const activityHTML = sessions.map(session => `
            <div class="activity-item">
                <div class="activity-icon">${session.mode === 'practice' ? '📝' : '⏱️'}</div>
                <div class="activity-details">
                    <h4>${session.mode === 'practice' ? 'Practice Session' : 'Timed Test'}</h4>
                    <p>${session.questions.length} questions • ${session.score}% accuracy</p>
                    <small>${this.formatDate(session.date)}</small>
                </div>
            </div>
        `).join('');
        
        activityContainer.innerHTML = activityHTML;
    }

    // Practice Mode
    startPractice(options = {}) {
        const {
            mode = 'adaptive',
            count = 10,
            module = null,
            difficulty = null,
            topics = null
        } = options;
        
        this.practiceSession = {
            id: Date.now().toString(),
            startTime: Date.now(),
            mode,
            questions: [],
            currentIndex: 0,
            score: 0,
            timeSpent: 0
        };
        
        const selectedQuestions = this.selectQuestions({
            count,
            module,
            difficulty,
            topics,
            mode
        });
        
        this.practiceSession.questions = selectedQuestions.map(q => ({
            ...q,
            startTime: null,
            endTime: null,
            selectedAnswer: null,
            correct: null,
            timeSpent: 0
        }));
        
        this.showPage('practice');
        this.displayQuestion(0);
    }

    selectQuestions(options) {
        let availableQuestions = [...this.questions];
        
        // Filter by module
        if (options.module) {
            availableQuestions = availableQuestions.filter(q => q.module === options.module);
        }
        
        // Filter by difficulty
        if (options.difficulty) {
            availableQuestions = availableQuestions.filter(q => q.difficulty === options.difficulty);
        }
        
        // Adaptive selection based on user performance
        if (options.mode === 'adaptive') {
            availableQuestions = this.selectAdaptiveQuestions(availableQuestions);
        }
        
        // Shuffle and select
        const shuffled = availableQuestions.sort(() => Math.random() - 0.5);
        return shuffled.slice(0, options.count);
    }

    selectAdaptiveQuestions(questions) {
        const userData = this.getUserData();
        const weakAreas = this.identifyWeakAreas(userData);
        
        // Prioritize questions from weak areas
        const prioritized = questions.sort((a, b) => {
            const aWeakness = weakAreas[a.primary_class_cd_desc] || 0;
            const bWeakness = weakAreas[b.primary_class_cd_desc] || 0;
            return bWeakness - aWeakness;
        });
        
        return prioritized;
    }

    identifyWeakAreas(userData) {
        const sessions = userData.sessions || [];
        const topicPerformance = {};
        
        sessions.forEach(session => {
            session.questions.forEach(q => {
                const topic = q.primary_class_cd_desc;
                if (!topicPerformance[topic]) {
                    topicPerformance[topic] = { correct: 0, total: 0 };
                }
                topicPerformance[topic].total++;
                if (q.correct) {
                    topicPerformance[topic].correct++;
                }
            });
        });
        
        const weakAreas = {};
        Object.keys(topicPerformance).forEach(topic => {
            const perf = topicPerformance[topic];
            const accuracy = perf.correct / perf.total;
            weakAreas[topic] = 1 - accuracy; // Higher value = weaker area
        });
        
        return weakAreas;
    }

    displayQuestion(index) {
        if (!this.practiceSession || index >= this.practiceSession.questions.length) {
            return;
        }
        
        const question = this.practiceSession.questions[index];
        this.practiceSession.currentIndex = index;
        
        // Update question info
        document.getElementById('currentQuestionNum').textContent = index + 1;
        document.getElementById('totalQuestionsCount').textContent = this.practiceSession.questions.length;
        document.getElementById('questionType').textContent = question.module === 'math' ? 'Math' : 'Reading & Writing';
        
        const difficultyMap = { 'E': 'Easy', 'M': 'Medium', 'H': 'Hard' };
        document.getElementById('difficultyBadge').textContent = difficultyMap[question.difficulty] || 'Unknown';
        
        // Display question content
        document.getElementById('questionContent').innerHTML = question.stem_html || 'Question content not available';
        
        // Display answer choices if available
        const choicesContainer = document.getElementById('answerChoices');
        if (question.choices && Array.isArray(question.choices)) {
            const choicesHTML = question.choices.map((choice, i) => `
                <div class="choice" data-index="${i}">
                    <strong>${String.fromCharCode(65 + i)}.</strong> ${choice}
                </div>
            `).join('');
            choicesContainer.innerHTML = choicesHTML;
            
            // Add click handlers
            choicesContainer.querySelectorAll('.choice').forEach(choice => {
                choice.addEventListener('click', (e) => {
                    // Remove previous selection
                    choicesContainer.querySelectorAll('.choice').forEach(c => c.classList.remove('selected'));
                    // Select current
                    choice.classList.add('selected');
                    question.selectedAnswer = parseInt(choice.dataset.index);
                });
            });
        } else {
            choicesContainer.innerHTML = '<p class="text-secondary">This is a grid-in question. Enter your answer numerically.</p>';
        }
        
        // Update navigation buttons
        document.getElementById('prevQuestion').disabled = index === 0;
        document.getElementById('nextQuestion').disabled = index === this.practiceSession.questions.length - 1;
        
        // Start timing
        question.startTime = Date.now();
        
        // Re-render MathJax if needed
        if (window.MathJax) {
            MathJax.typesetPromise();
        }
    }

    submitAnswer() {
        if (!this.practiceSession) return;
        
        const question = this.practiceSession.questions[this.practiceSession.currentIndex];
        
        if (question.selectedAnswer === null || question.selectedAnswer === undefined) {
            this.showToast('Please select an answer', 'warning');
            return;
        }
        
        // Calculate time spent
        question.endTime = Date.now();
        question.timeSpent = question.endTime - question.startTime;
        
        // Check if correct
        question.correct = question.selectedAnswer === question.correct_choice_index;
        
        // Show feedback
        this.showAnswerFeedback(question);
        
        // Update session score
        this.practiceSession.score = this.practiceSession.questions
            .filter(q => q.correct !== null)
            .reduce((acc, q) => acc + (q.correct ? 1 : 0), 0);
    }

    showAnswerFeedback(question) {
        const choicesContainer = document.getElementById('answerChoices');
        const choices = choicesContainer.querySelectorAll('.choice');
        
        choices.forEach((choice, index) => {
            choice.style.pointerEvents = 'none';
            
            if (index === question.correct_choice_index) {
                choice.classList.add('correct');
            } else if (index === question.selectedAnswer) {
                choice.classList.add('incorrect');
            }
        });
        
        // Show explanation if available
        if (question.explanation_html) {
            this.showExplanation(question.explanation_html);
        }
        
        // Show feedback toast
        const message = question.correct ? 'Correct! ✅' : 'Incorrect ❌';
        this.showToast(message, question.correct ? 'success' : 'error');
    }

    showExplanation(explanationHTML) {
        document.getElementById('explanationContent').innerHTML = explanationHTML;
        document.getElementById('explanationPanel').classList.remove('hidden');
        
        if (window.MathJax) {
            MathJax.typesetPromise();
        }
    }

    hideExplanation() {
        document.getElementById('explanationPanel').classList.add('hidden');
    }

    nextQuestion() {
        if (!this.practiceSession) return;
        
        const nextIndex = this.practiceSession.currentIndex + 1;
        
        if (nextIndex < this.practiceSession.questions.length) {
            this.hideExplanation();
            this.displayQuestion(nextIndex);
        } else {
            this.finishPracticeSession();
        }
    }

    prevQuestion() {
        if (!this.practiceSession) return;
        
        const prevIndex = this.practiceSession.currentIndex - 1;
        
        if (prevIndex >= 0) {
            this.hideExplanation();
            this.displayQuestion(prevIndex);
        }
    }

    finishPracticeSession() {
        if (!this.practiceSession) return;
        
        // Calculate final statistics
        const totalQuestions = this.practiceSession.questions.length;
        const correctAnswers = this.practiceSession.questions.filter(q => q.correct).length;
        const accuracy = Math.round((correctAnswers / totalQuestions) * 100);
        const totalTime = this.practiceSession.questions.reduce((acc, q) => acc + (q.timeSpent || 0), 0);
        
        // Save session to user data
        this.saveSession({
            id: this.practiceSession.id,
            mode: 'practice',
            date: new Date().toISOString(),
            questions: this.practiceSession.questions,
            score: accuracy,
            timeSpent: totalTime,
            totalQuestions,
            correctAnswers
        });
        
        // Show completion message
        this.showToast(`Session complete! Score: ${accuracy}%`, 'success');
        
        // Return to dashboard
        this.practiceSession = null;
        this.showDashboard();
    }

    // Data persistence
    getUserData() {
        if (!this.currentUser) return {};
        const key = `satapp_userData_${this.currentUser.id}`;
        return JSON.parse(localStorage.getItem(key) || '{}');
    }

    saveUserData(data) {
        if (!this.currentUser) return;
        const key = `satapp_userData_${this.currentUser.id}`;
        const existing = this.getUserData();
        const merged = { ...existing, ...data };
        localStorage.setItem(key, JSON.stringify(merged));
    }

    saveSession(session) {
        const userData = this.getUserData();
        const sessions = userData.sessions || [];
        sessions.push(session);
        this.saveUserData({ sessions });
    }

    loadUserData() {
        return JSON.parse(localStorage.getItem('satapp_globalData') || '{}');
    }

    loadSettings() {
        return JSON.parse(localStorage.getItem('satapp_settings') || JSON.stringify({
            theme: 'light',
            notifications: true,
            autoAdvance: false,
            showHints: true
        }));
    }

    // Event listeners
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.dataset.page;
                this.showPage(page);
            });
        });
        
        // User menu
        document.getElementById('userMenuBtn').addEventListener('click', (e) => {
            e.stopPropagation();
            document.getElementById('userMenu').classList.toggle('hidden');
        });
        
        document.addEventListener('click', () => {
            document.getElementById('userMenu').classList.add('hidden');
        });
        
        document.getElementById('logoutBtn').addEventListener('click', (e) => {
            e.preventDefault();
            this.logout();
        });

        // Settings navigation - handle any link with data-page attribute
        document.addEventListener('click', (e) => {
            const link = e.target.closest('[data-page]');
            if (link) {
                e.preventDefault();
                const page = link.dataset.page;
                this.showPage(page);
                // Close user menu if it was opened
                document.getElementById('userMenu').classList.add('hidden');
            }
        });
        
        // Quick actions
        document.getElementById('continuePractice')?.addEventListener('click', () => {
            this.startPractice();
        });
        
        document.getElementById('weakAreas')?.addEventListener('click', () => {
            this.startPractice({ mode: 'weak_areas' });
        });
        
        document.getElementById('timedPractice')?.addEventListener('click', () => {
            this.startPractice({ mode: 'timed', count: 20 });
        });
        
        // Practice controls
        document.getElementById('prevQuestion')?.addEventListener('click', () => {
            this.prevQuestion();
        });
        
        document.getElementById('nextQuestion')?.addEventListener('click', () => {
            this.nextQuestion();
        });
        
        document.getElementById('submitAnswer')?.addEventListener('click', () => {
            this.submitAnswer();
        });
        
        // Explanation panel
        document.getElementById('closeExplanation')?.addEventListener('click', () => {
            this.hideExplanation();
        });
        
        document.getElementById('nextAfterExplanation')?.addEventListener('click', () => {
            this.nextQuestion();
        });
    }

    // Utility functions
    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        
        return date.toLocaleDateString();
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; cursor: pointer; padding: 0 0 0 1rem;">×</button>
            </div>
        `;
        
        container.appendChild(toast);
        
        // Animate in
        setTimeout(() => toast.classList.add('show'), 100);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            toast.remove();
        }, 5000);
    }

    hideLoading() {
        document.getElementById('loadingScreen').classList.add('hidden');
    }

    setupMobileNavigation() {
        // Add hamburger menu functionality for mobile
        const navContainer = document.querySelector('.nav-container');
        const navMenu = document.querySelector('.nav-menu');

        // Create hamburger button
        const hamburgerBtn = document.createElement('button');
        hamburgerBtn.className = 'hamburger-btn';
        hamburgerBtn.innerHTML = '☰';
        hamburgerBtn.style.display = 'none';

        // Add click handler
        hamburgerBtn.addEventListener('click', () => {
            navMenu.classList.toggle('open');
            hamburgerBtn.innerHTML = navMenu.classList.contains('open') ? '✕' : '☰';
        });

        // Close menu when clicking nav links
        navMenu.addEventListener('click', (e) => {
            if (e.target.classList.contains('nav-link')) {
                navMenu.classList.remove('open');
                hamburgerBtn.innerHTML = '☰';
            }
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navContainer.contains(e.target) && navMenu.classList.contains('open')) {
                navMenu.classList.remove('open');
                hamburgerBtn.innerHTML = '☰';
            }
        });

        // Insert hamburger button
        navContainer.appendChild(hamburgerBtn);

        // Show/hide hamburger button based on screen size
        const checkScreenSize = () => {
            if (window.innerWidth <= 768) {
                hamburgerBtn.style.display = 'block';
            } else {
                hamburgerBtn.style.display = 'none';
                navMenu.classList.remove('open');
            }
        };

        window.addEventListener('resize', checkScreenSize);
        checkScreenSize();
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.satApp = new SATApp();
});