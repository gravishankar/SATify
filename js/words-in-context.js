/**
 * Words in Context Practice Module
 * Handles vocabulary questions with strategy breakdown functionality
 */

class WordsInContextPractice {
    constructor(app) {
        this.app = app;
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.sessionStartTime = null;
        this.strategyGenerator = new StrategyGenerator();
        this.init();
    }

    async init() {
        await this.loadQuestions();
        this.setupEventListeners();
    }

    async loadQuestions() {
        try {
            const response = await fetch('data/chunks/words-in-context.json');
            this.questions = await response.json();
            console.log(`Loaded ${this.questions.length} Words in Context questions`);
        } catch (error) {
            console.error('Error loading Words in Context questions:', error);
            this.showToast('Error loading questions', 'error');
        }
    }

    setupEventListeners() {
        // Navigation events
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-page="words-in-context"]')) {
                this.startPracticeSession();
            }
        });


        // Learn This Concept button
        document.getElementById('wicLearnConcept')?.addEventListener('click', () => {
            this.goToLearnConcept();
        });

        // Answer submission
        document.getElementById('wicSubmitAnswer')?.addEventListener('click', () => {
            this.submitAnswer();
        });

        // Navigation buttons
        document.getElementById('wicPrevQuestion')?.addEventListener('click', () => {
            this.previousQuestion();
        });

        document.getElementById('wicNextQuestion')?.addEventListener('click', () => {
            this.nextQuestion();
        });

        // Modal close buttons
        document.getElementById('closeStrategy')?.addEventListener('click', () => {
            this.hideStrategyModal();
        });

        document.getElementById('strategyContinue')?.addEventListener('click', () => {
            this.hideStrategyModal();
        });

        // Answer choice selection - handle both click and touch events
        document.addEventListener('click', (e) => {
            if (e.target.closest('.wic-choice')) {
                e.preventDefault();
                this.selectChoice(e.target.closest('.wic-choice'));
            }
        });

        // Add touch event handling for mobile
        document.addEventListener('touchend', (e) => {
            if (e.target.closest('.wic-choice')) {
                e.preventDefault();
                this.selectChoice(e.target.closest('.wic-choice'));
            }
        });

        // Close modal when clicking outside of it (clicks outside the modal panel)
        document.addEventListener('click', (e) => {
            const modal = document.getElementById('strategyModal');
            if (modal && !modal.classList.contains('hidden') && modal.classList.contains('show')) {
                // Check if click is outside the modal panel area
                const rect = modal.getBoundingClientRect();
                const clickX = e.clientX;

                // If click is to the left of the modal panel, close it
                if (clickX < rect.left) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.hideStrategyModal();
                }
            }
        });

        // Close modal on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const modal = document.getElementById('strategyModal');
                if (modal && !modal.classList.contains('hidden')) {
                    this.hideStrategyModal();
                }
            }
        });
    }

    startPracticeSession() {
        if (this.questions.length === 0) {
            this.showToast('Questions still loading...', 'info');
            return;
        }

        this.sessionStartTime = new Date();
        this.currentQuestionIndex = 0;
        this.userAnswers = [];

        document.getElementById('wicTotalQuestionsCount').textContent = this.questions.length;
        this.displayQuestion();
    }

    displayQuestion() {
        const question = this.questions[this.currentQuestionIndex];
        if (!question) return;

        // Update question info
        document.getElementById('wicCurrentQuestionNum').textContent = this.currentQuestionIndex + 1;
        document.getElementById('wicDifficultyBadge').textContent = this.getDifficultyText(question.difficulty);
        document.getElementById('wicDifficultyBadge').className = `difficulty-badge ${question.difficulty.toLowerCase()}`;

        // Display question content
        document.getElementById('wicQuestionContent').innerHTML = question.stem_html;

        // Display answer choices
        const choicesContainer = document.getElementById('wicAnswerChoices');
        choicesContainer.innerHTML = '';

        question.choices.forEach((choice, index) => {
            const choiceDiv = document.createElement('div');
            choiceDiv.className = 'choice wic-choice';
            choiceDiv.setAttribute('data-choice-index', index);

            // Clean up choice content - remove HTML tags if present
            const cleanChoice = choice.replace(/<[^>]*>/g, '').trim();

            choiceDiv.innerHTML = `
                <div class="choice-letter">${String.fromCharCode(65 + index)}</div>
                <div class="choice-content">${cleanChoice}</div>
            `;
            choicesContainer.appendChild(choiceDiv);
        });

        // Update navigation buttons
        document.getElementById('wicPrevQuestion').disabled = this.currentQuestionIndex === 0;
        document.getElementById('wicNextQuestion').disabled = this.currentQuestionIndex === this.questions.length - 1;

        // Reset submit button and clear selection
        document.getElementById('wicSubmitAnswer').disabled = true;
        this.selectedChoice = null;

        // Clear any existing selections
        document.querySelectorAll('.wic-choice').forEach(choice => {
            choice.classList.remove('selected', 'correct', 'incorrect');
        });

        // Hide explanation panel
        document.getElementById('wicExplanationPanel').classList.add('hidden');
    }

    selectChoice(choiceElement) {
        if (!choiceElement) return;

        console.log('Selecting choice:', choiceElement.getAttribute('data-choice-index'));

        // Remove previous selection
        document.querySelectorAll('.wic-choice').forEach(choice => {
            choice.classList.remove('selected');
        });

        // Add selection to clicked choice
        choiceElement.classList.add('selected');

        // Store selected element for reference
        this.selectedChoice = choiceElement;

        // Enable submit button
        const submitBtn = document.getElementById('wicSubmitAnswer');
        if (submitBtn) {
            submitBtn.disabled = false;
            console.log('Submit button enabled');
        }

        // Add visual feedback
        console.log('Choice selected, classes:', choiceElement.className);
    }

    submitAnswer() {
        console.log('Submit answer called');

        // Try to get selected choice, use stored reference as fallback
        let selectedChoice = document.querySelector('.wic-choice.selected');
        if (!selectedChoice && this.selectedChoice) {
            selectedChoice = this.selectedChoice;
            console.log('Using stored selection:', selectedChoice);
        }

        if (!selectedChoice) {
            console.log('No choice selected');
            this.showToast('Please select an answer', 'warning');
            return;
        }

        const selectedIndex = parseInt(selectedChoice.getAttribute('data-choice-index'));
        const question = this.questions[this.currentQuestionIndex];
        const isCorrect = selectedIndex === question.correct_choice_index;

        console.log('Submitting answer:', { selectedIndex, isCorrect });

        // Store user answer
        this.userAnswers[this.currentQuestionIndex] = {
            selectedIndex,
            isCorrect,
            timeSpent: this.getQuestionTime()
        };

        // Show feedback
        this.showAnswerFeedback(selectedIndex, question.correct_choice_index);

        // Show explanation
        this.showExplanation(question, isCorrect);

        // Disable submit button
        document.getElementById('wicSubmitAnswer').disabled = true;
    }

    showAnswerFeedback(selectedIndex, correctIndex) {
        const choices = document.querySelectorAll('.wic-choice');

        choices.forEach((choice, index) => {
            if (index === correctIndex) {
                choice.classList.add('correct');
            } else if (index === selectedIndex && index !== correctIndex) {
                choice.classList.add('incorrect');
            }
        });
    }

    showExplanation(question, isCorrect) {
        const panel = document.getElementById('wicExplanationPanel');
        const content = document.getElementById('wicExplanationContent');

        content.innerHTML = `
            <div class="answer-result ${isCorrect ? 'correct' : 'incorrect'}">
                <h4>${isCorrect ? '✓ Correct!' : '✗ Incorrect'}</h4>
                <p>The correct answer is ${String.fromCharCode(65 + question.correct_choice_index)}.</p>
            </div>
            <div class="explanation">
                ${question.explanation_html}
            </div>
        `;

        panel.classList.remove('hidden');
    }

    showStrategyBreakdown() {
        const question = this.questions[this.currentQuestionIndex];
        if (!question) {
            this.showToast('No question available', 'error');
            return;
        }

        let strategy;

        // Use pre-made strategy if available, otherwise generate dynamically
        if (question.strategy) {
            strategy = question.strategy;
        } else {
            // Generate strategy dynamically using the strategy generator
            strategy = this.strategyGenerator.generateTextStrategy(question);
        }

        // Populate strategy modal
        document.getElementById('strategyPatternName').textContent = strategy.pattern;
        document.getElementById('strategyStep1').textContent = strategy.step1;
        document.getElementById('strategyStep2').textContent = strategy.step2;
        document.getElementById('strategyStep3').textContent = strategy.step3;
        document.getElementById('strategyStep4').textContent = strategy.step4;
        document.getElementById('strategyStep5').textContent = strategy.step5;

        // Show modal with side panel animation
        const modal = document.getElementById('strategyModal');
        modal.classList.remove('hidden');
        // Use setTimeout to trigger CSS transition
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
    }

    hideStrategyModal() {
        const modal = document.getElementById('strategyModal');
        modal.classList.remove('show');
        // Wait for animation to complete before hiding
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 300);
    }

    nextQuestion() {
        if (this.currentQuestionIndex < this.questions.length - 1) {
            this.currentQuestionIndex++;
            this.displayQuestion();
        }
    }

    previousQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.displayQuestion();
        }
    }

    getDifficultyText(difficulty) {
        const difficultyMap = {
            'E': 'Easy',
            'M': 'Medium',
            'H': 'Hard'
        };
        return difficultyMap[difficulty] || difficulty;
    }

    getQuestionTime() {
        if (!this.sessionStartTime) return 0;
        return Math.floor((new Date() - this.sessionStartTime) / 1000);
    }

    goToLearnConcept() {
        // Determine current topic from practice context (default to craft-and-structure for now)
        const currentTopic = this.getCurrentTopic() || 'craft-and-structure';

        console.log(`Navigating to ${currentTopic} lesson...`);

        // Track analytics
        if (this.app && this.app.analytics) {
            this.app.analytics.trackEvent('learn_concept_clicked', {
                skill: currentTopic,
                from_practice: true,
                current_accuracy: this.getCurrentAccuracy(),
                timestamp: new Date().toISOString()
            });
        }

        // Navigate to Learn page
        if (this.app && this.app.navigateTo) {
            this.app.navigateTo('learn');
        } else {
            // Fallback navigation
            const learnLink = document.querySelector('[data-page="learn"]');
            if (learnLink) {
                learnLink.click();
            }
        }

        // Start the corresponding lesson from slide 0
        setTimeout(() => {
            if (this.app && this.app.learnPage) {
                this.app.learnPage.startLesson(currentTopic);
            }
        }, 100);

        // Show helpful message
        this.showToast('Review the concept, then come back to practice!', 'info');
    }

    getCurrentTopic() {
        // Framework: determine topic from practice context
        // For now returns default, but can be extended for multiple topics
        return 'craft-and-structure';
    }

    getCurrentAccuracy() {
        const answeredQuestions = this.userAnswers.filter(answer => answer !== undefined).length;
        const correctAnswers = this.userAnswers.filter(answer => answer && answer.isCorrect).length;
        return answeredQuestions > 0 ? (correctAnswers / answeredQuestions * 100).toFixed(1) : 0;
    }

    showToast(message, type = 'info') {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;

        const container = document.getElementById('toastContainer');
        container.appendChild(toast);

        // Show toast
        setTimeout(() => toast.classList.add('show'), 100);

        // Remove toast after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => container.removeChild(toast), 300);
        }, 3000);
    }

    // Public methods for integration with main app
    getProgress() {
        const totalQuestions = this.questions.length;
        const answeredQuestions = this.userAnswers.filter(answer => answer !== undefined).length;
        const correctAnswers = this.userAnswers.filter(answer => answer && answer.isCorrect).length;

        return {
            totalQuestions,
            answeredQuestions,
            correctAnswers,
            accuracy: answeredQuestions > 0 ? (correctAnswers / answeredQuestions * 100).toFixed(1) : 0
        };
    }

    resetSession() {
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.sessionStartTime = null;
        this.hideStrategyModal();

        // Clear any UI state
        document.querySelectorAll('.wic-choice').forEach(choice => {
            choice.classList.remove('selected', 'correct', 'incorrect');
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait for main app to be available
    const initWIC = () => {
        if (window.satApp) {
            window.satApp.wordsInContextPractice = new WordsInContextPractice(window.satApp);
        } else {
            setTimeout(initWIC, 100);
        }
    };
    initWIC();
});