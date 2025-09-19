/**
 * Skill Practice UI Controller
 * Manages the user interface for skill-based practice sessions
 * Integrates with SkillPracticeManager for data and session management
 */

class SkillPracticeUI {
    constructor() {
        this.manager = null;
        this.currentMode = 'individual'; // 'individual' or 'topic'
        this.currentSession = null;
        this.elements = {};
        this.isInitialized = false;
    }

    async initialize() {
        if (this.isInitialized) return;

        try {
            // Initialize the manager
            this.manager = new SkillPracticeManager();
            await this.manager.initialize();

            // Cache DOM elements
            this.cacheElements();

            // Set up event listeners
            this.setupEventListeners();

            // Initialize UI state
            this.initializeUI();

            this.isInitialized = true;
            console.log('SkillPracticeUI initialized successfully');
        } catch (error) {
            console.error('Failed to initialize SkillPracticeUI:', error);
            this.showError('Failed to initialize skill practice. Please try again.');
        }
    }

    cacheElements() {
        // Navigation and feature flag
        this.elements.navLink = document.getElementById('skillPracticeNavLink');
        this.elements.featureToggle = document.getElementById('skillPracticeEnabled');

        // Main containers
        this.elements.skillSelectionView = document.getElementById('skillSelectionView');
        this.elements.practiceSessionView = document.getElementById('practiceSessionView');

        // Mode selector
        this.elements.individualModeBtn = document.getElementById('individualSkillMode');
        this.elements.topicModeBtn = document.getElementById('topicPracticeMode');

        // Domain grid
        this.elements.domainsGrid = document.getElementById('domainsGrid');

        // Strategy phase
        this.elements.strategyPhase = document.getElementById('strategyPhase');
        this.elements.strategyTitle = document.getElementById('strategyTitle');
        this.elements.strategySubtitle = document.getElementById('strategySubtitle');
        this.elements.strategyContent = document.getElementById('strategyContent');
        this.elements.skipStrategyBtn = document.getElementById('skipStrategy');
        this.elements.startPracticeBtn = document.getElementById('startPractice');

        // Question phase
        this.elements.questionPhase = document.getElementById('questionPhase');
        this.elements.sessionTitle = document.getElementById('sessionTitle');
        this.elements.sessionProgress = document.getElementById('sessionProgress');
        this.elements.sessionSkill = document.getElementById('sessionSkill');
        this.elements.questionContent = document.getElementById('skillQuestionContent');
        this.elements.answerChoices = document.getElementById('skillAnswerChoices');
        this.elements.submitAnswerBtn = document.getElementById('skillSubmitAnswer');
        this.elements.nextQuestionBtn = document.getElementById('skillNextQuestion');
        this.elements.prevQuestionBtn = document.getElementById('skillPrevQuestion');

        // Results phase
        this.elements.resultsPhase = document.getElementById('resultsPhase');
        this.elements.resultsSummary = document.getElementById('resultsSummary');
        this.elements.practiceAgainBtn = document.getElementById('practiceAgain');
        this.elements.backToSkillsBtn = document.getElementById('backToSkills');
    }

    setupEventListeners() {
        // Feature flag toggle
        if (this.elements.featureToggle) {
            this.elements.featureToggle.addEventListener('change', () => {
                this.handleFeatureToggle();
            });
        }

        // Mode selector
        this.elements.individualModeBtn?.addEventListener('click', () => {
            this.setMode('individual');
        });

        this.elements.topicModeBtn?.addEventListener('click', () => {
            this.setMode('topic');
        });

        // Strategy phase
        this.elements.skipStrategyBtn?.addEventListener('click', () => {
            this.skipStrategy();
        });

        this.elements.startPracticeBtn?.addEventListener('click', () => {
            this.startQuestionPhase();
        });

        // Question phase
        this.elements.submitAnswerBtn?.addEventListener('click', () => {
            this.submitAnswer();
        });

        this.elements.nextQuestionBtn?.addEventListener('click', () => {
            this.nextQuestion();
        });

        this.elements.prevQuestionBtn?.addEventListener('click', () => {
            this.previousQuestion();
        });

        // Results phase
        this.elements.practiceAgainBtn?.addEventListener('click', () => {
            this.restartSession();
        });

        this.elements.backToSkillsBtn?.addEventListener('click', () => {
            this.backToSkillSelection();
        });
    }

    initializeUI() {
        // Check and apply feature flag state
        this.applyFeatureFlag();

        // Load domains grid
        this.loadDomainsGrid();
    }

    handleFeatureToggle() {
        const isEnabled = this.elements.featureToggle.checked;

        // Update manager feature flag
        this.manager.updateFeatureFlag('skillPracticeEnabled', isEnabled);

        // Save to localStorage
        localStorage.setItem('skillPracticeEnabled', isEnabled.toString());

        // Show/hide navigation
        this.applyFeatureFlag();

        // Show feedback
        this.showToast(isEnabled ? 'Skill Practice enabled!' : 'Skill Practice disabled');
    }

    applyFeatureFlag() {
        const isEnabled = this.getFeatureFlagState();

        // Update checkbox
        if (this.elements.featureToggle) {
            this.elements.featureToggle.checked = isEnabled;
        }

        // Show/hide navigation link
        if (this.elements.navLink) {
            this.elements.navLink.style.display = isEnabled ? 'flex' : 'none';
        }
    }

    getFeatureFlagState() {
        // Check localStorage first, then manager, then default to false
        const stored = localStorage.getItem('skillPracticeEnabled');
        if (stored !== null) {
            return stored === 'true';
        }

        return this.manager?.getFeatureFlags()?.skillPracticeEnabled || false;
    }

    setMode(mode) {
        this.currentMode = mode;

        // Update button states
        this.elements.individualModeBtn.classList.toggle('active', mode === 'individual');
        this.elements.topicModeBtn.classList.toggle('active', mode === 'topic');

        // Reload domains grid with new mode
        this.loadDomainsGrid();
    }

    async loadDomainsGrid() {
        if (!this.manager) return;

        const skillsByDomain = this.manager.getSkillsByDomain();
        const container = this.elements.domainsGrid;

        if (!container) return;

        container.innerHTML = '';

        Object.keys(skillsByDomain).forEach(domainId => {
            const domain = skillsByDomain[domainId];
            const domainCard = this.createDomainCard(domain, domainId);
            container.appendChild(domainCard);
        });
    }

    createDomainCard(domain, domainId) {
        const card = document.createElement('div');
        card.className = 'domain-card';
        card.dataset.domainId = domainId;

        const iconMap = {
            'information_and_ideas': '🔍',
            'expression_of_ideas': '✍️',
            'craft_and_structure': '🏗️',
            'standard_english_conventions': '📝'
        };

        card.innerHTML = `
            <div class="domain-header">
                <span class="domain-icon">${iconMap[domainId] || '📚'}</span>
                <h3>${domain.title}</h3>
            </div>
            <p class="domain-description">${domain.description}</p>
            <div class="domain-stats">
                <span class="question-count">${domain.questionCount} questions</span>
                <span class="skill-count">${domain.skills.length} skills</span>
            </div>
            ${this.currentMode === 'individual' ? this.createSkillsList(domain.skills) : ''}
            ${this.currentMode === 'topic' ? this.createTopicButton(domainId, domain.title) : ''}
        `;

        return card;
    }

    createSkillsList(skills) {
        const skillsHtml = skills.map(skill => `
            <button class="skill-btn" data-skill-code="${skill.skillCode}">
                <span class="skill-title">${skill.skillTitle}</span>
                <span class="skill-description">${skill.description}</span>
            </button>
        `).join('');

        return `
            <div class="skills-list">
                ${skillsHtml}
            </div>
        `;
    }

    createTopicButton(domainId, domainTitle) {
        return `
            <button class="topic-practice-btn" data-domain-id="${domainId}">
                <span class="btn-text">Practice All ${domainTitle} Skills</span>
                <span class="btn-arrow">→</span>
            </button>
        `;
    }

    async startSkillPractice(skillCode) {
        try {
            this.showLoading('Starting skill practice...');

            const session = await this.manager.startPracticeSession('skill', skillCode, {
                questionLimit: 20,
                shuffle: true
            });

            this.currentSession = session;
            this.showPracticeSession();

        } catch (error) {
            console.error('Error starting skill practice:', error);
            this.showError('Failed to start skill practice. Please try again.');
        }
    }

    async startTopicPractice(domainId) {
        try {
            this.showLoading('Starting topic practice...');

            const session = await this.manager.startPracticeSession('domain', domainId, {
                questionLimit: 20,
                shuffle: true
            });

            this.currentSession = session;
            this.showPracticeSession();

        } catch (error) {
            console.error('Error starting topic practice:', error);
            this.showError('Failed to start topic practice. Please try again.');
        }
    }

    showPracticeSession() {
        // Hide skill selection, show practice session
        this.elements.skillSelectionView.classList.add('hidden');
        this.elements.practiceSessionView.classList.remove('hidden');

        // Show strategy phase if strategy is available
        if (this.currentSession.strategy && this.manager.getFeatureFlags().strategyIntegrationEnabled) {
            this.showStrategyPhase();
        } else {
            this.skipStrategy();
        }
    }

    showStrategyPhase() {
        const strategy = this.currentSession.strategy;

        // Update strategy content
        this.elements.strategyTitle.textContent = strategy.title || 'Strategy Overview';
        this.elements.strategySubtitle.textContent = `Key concepts for ${this.getSessionDisplayName()}`;

        // Load strategy slides
        this.loadStrategyContent(strategy);

        // Show strategy phase
        this.elements.strategyPhase.classList.remove('hidden');
        this.elements.questionPhase.classList.add('hidden');
        this.elements.resultsPhase.classList.add('hidden');
    }

    loadStrategyContent(strategy) {
        const container = this.elements.strategyContent;
        container.innerHTML = '';

        if (strategy.slides && strategy.slides.length > 0) {
            strategy.slides.forEach((slide, index) => {
                const slideElement = this.createStrategySlide(slide, index);
                container.appendChild(slideElement);
            });
        } else {
            container.innerHTML = '<p>No specific strategy available for this skill. You can start practicing directly.</p>';
        }
    }

    createStrategySlide(slide, index) {
        const slideDiv = document.createElement('div');
        slideDiv.className = 'strategy-slide';

        slideDiv.innerHTML = `
            <div class="slide-header">
                <h3>${slide.title || `Step ${index + 1}`}</h3>
            </div>
            <div class="slide-content">
                ${this.formatSlideContent(slide.content)}
            </div>
        `;

        return slideDiv;
    }

    formatSlideContent(content) {
        if (!content) return '';

        // Handle different content formats from lessons
        if (content.steps) {
            return `
                <ol class="strategy-steps">
                    ${content.steps.map(step => `<li>${step}</li>`).join('')}
                </ol>
            `;
        }

        if (content.points) {
            return `
                <ul class="strategy-points">
                    ${content.points.map(point => `<li>${point}</li>`).join('')}
                </ul>
            `;
        }

        if (typeof content === 'string') {
            return `<p>${content}</p>`;
        }

        return '<p>Strategy content available</p>';
    }

    skipStrategy() {
        this.startQuestionPhase();
    }

    startQuestionPhase() {
        // Hide strategy, show questions
        this.elements.strategyPhase.classList.add('hidden');
        this.elements.questionPhase.classList.remove('hidden');

        // Load first question
        this.loadCurrentQuestion();

        // Update session info
        this.updateSessionInfo();
    }

    loadCurrentQuestion() {
        const question = this.manager.getNextQuestion();
        if (!question) {
            this.showResults();
            return;
        }

        // Format question for display
        const formattedQuestion = this.manager.questionEngine.formatQuestionForDisplay(question);

        // Update question content
        this.elements.questionContent.innerHTML = formattedQuestion.stem;

        // Update choices
        this.loadAnswerChoices(formattedQuestion.choices);

        // Update question info
        this.updateQuestionInfo(formattedQuestion);

        // Reset button states
        this.resetQuestionControls();
    }

    loadAnswerChoices(choices) {
        const container = this.elements.answerChoices;
        container.innerHTML = '';

        if (!choices || choices.length === 0) {
            container.innerHTML = '<p>No answer choices available</p>';
            return;
        }

        choices.forEach((choice, index) => {
            const choiceElement = document.createElement('div');
            choiceElement.className = 'answer-choice';
            choiceElement.dataset.choiceIndex = index;

            choiceElement.innerHTML = `
                <input type="radio" name="answer" id="choice${index}" value="${index}">
                <label for="choice${index}" class="choice-label">
                    <span class="choice-letter">${String.fromCharCode(65 + index)}</span>
                    <span class="choice-text">${choice}</span>
                </label>
            `;

            container.appendChild(choiceElement);
        });

        // Add click handlers
        container.addEventListener('click', (e) => {
            const choice = e.target.closest('.answer-choice');
            if (choice) {
                this.selectChoice(choice.dataset.choiceIndex);
            }
        });
    }

    selectChoice(choiceIndex) {
        // Update radio button
        const radio = document.getElementById(`choice${choiceIndex}`);
        if (radio) {
            radio.checked = true;
        }

        // Enable submit button
        this.elements.submitAnswerBtn.disabled = false;
    }

    updateQuestionInfo(question) {
        const session = this.currentSession;
        const currentIndex = session.currentIndex + 1;
        const total = session.questions.length;

        // Update question number
        document.getElementById('questionNumber').textContent = `Question ${currentIndex} of ${total}`;

        // Update question type
        document.getElementById('skillQuestionType').textContent = question.skillDesc || question.type;

        // Update difficulty
        const difficultyBadge = document.getElementById('skillDifficultyBadge');
        difficultyBadge.textContent = question.difficulty;
        difficultyBadge.className = `difficulty-badge difficulty-${question.difficulty.toLowerCase()}`;
    }

    updateSessionInfo() {
        const session = this.currentSession;
        const displayName = this.getSessionDisplayName();

        this.elements.sessionTitle.textContent = `${displayName} Practice`;
        this.elements.sessionProgress.textContent = `Question ${session.currentIndex + 1} of ${session.questions.length}`;
        this.elements.sessionSkill.textContent = displayName;
    }

    getSessionDisplayName() {
        const session = this.currentSession;
        if (session.practiceType === 'skill') {
            return session.skillInfo?.skillTitle || 'Skill Practice';
        } else {
            return session.domainInfo?.title || 'Topic Practice';
        }
    }

    submitAnswer() {
        const selectedChoice = document.querySelector('input[name="answer"]:checked');
        if (!selectedChoice) {
            this.showToast('Please select an answer');
            return;
        }

        const answerIndex = parseInt(selectedChoice.value);
        const timeSpent = Date.now() - (this.questionStartTime || Date.now());

        try {
            const result = this.manager.submitAnswer(answerIndex, timeSpent);
            this.showAnswerFeedback(result);
        } catch (error) {
            console.error('Error submitting answer:', error);
            this.showError('Failed to submit answer. Please try again.');
        }
    }

    showAnswerFeedback(result) {
        // Disable submit button
        this.elements.submitAnswerBtn.disabled = true;

        // Show correct/incorrect feedback
        const choices = document.querySelectorAll('.answer-choice');
        choices.forEach((choice, index) => {
            const choiceElement = choice;
            if (index === result.correctAnswer) {
                choiceElement.classList.add('correct');
            } else if (index === result.userAnswer && !result.isCorrect) {
                choiceElement.classList.add('incorrect');
            }
        });

        // Enable next button
        this.elements.nextQuestionBtn.disabled = false;

        // Show toast feedback
        this.showToast(result.isCorrect ? '✅ Correct!' : '❌ Incorrect');
    }

    nextQuestion() {
        if (this.currentSession.completed) {
            this.showResults();
        } else {
            this.loadCurrentQuestion();
            this.updateSessionInfo();
        }

        this.questionStartTime = Date.now();
    }

    previousQuestion() {
        // Implementation for going back (if needed)
        // This would require modifying the session management
    }

    showResults() {
        // Hide question phase, show results
        this.elements.questionPhase.classList.add('hidden');
        this.elements.resultsPhase.classList.remove('hidden');

        // Generate and display results
        const summary = this.currentSession.summary;
        this.displayResultsSummary(summary);
    }

    displayResultsSummary(summary) {
        const container = this.elements.resultsSummary;

        container.innerHTML = `
            <div class="results-overview">
                <div class="result-stat">
                    <span class="stat-value">${summary.correctAnswers}/${summary.totalQuestions}</span>
                    <span class="stat-label">Questions Correct</span>
                </div>
                <div class="result-stat">
                    <span class="stat-value">${summary.accuracy}%</span>
                    <span class="stat-label">Accuracy</span>
                </div>
                <div class="result-stat">
                    <span class="stat-value">${Math.round(summary.avgTimePerQuestion / 1000)}s</span>
                    <span class="stat-label">Avg Time</span>
                </div>
            </div>

            <div class="skill-breakdown">
                <h3>Performance by Skill</h3>
                ${this.createSkillBreakdown(summary.skillBreakdown)}
            </div>
        `;
    }

    createSkillBreakdown(skillBreakdown) {
        return Object.keys(skillBreakdown).map(skillCode => {
            const skill = skillBreakdown[skillCode];
            return `
                <div class="skill-result">
                    <div class="skill-info">
                        <span class="skill-name">${skill.skillInfo.skillTitle}</span>
                        <span class="skill-score">${skill.correct}/${skill.total} (${skill.accuracy}%)</span>
                    </div>
                    <div class="skill-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${skill.accuracy}%"></div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    restartSession() {
        if (this.currentSession) {
            const practiceType = this.currentSession.practiceType;
            const targetId = this.currentSession.targetId;

            if (practiceType === 'skill') {
                this.startSkillPractice(targetId);
            } else {
                this.startTopicPractice(targetId);
            }
        }
    }

    backToSkillSelection() {
        // Reset session
        this.manager.resetSession();
        this.currentSession = null;

        // Show skill selection
        this.elements.practiceSessionView.classList.add('hidden');
        this.elements.skillSelectionView.classList.remove('hidden');
    }

    resetQuestionControls() {
        // Reset answer choices
        document.querySelectorAll('.answer-choice').forEach(choice => {
            choice.classList.remove('correct', 'incorrect', 'selected');
        });

        // Reset buttons
        this.elements.submitAnswerBtn.disabled = true;
        this.elements.nextQuestionBtn.disabled = true;

        // Reset radio buttons
        document.querySelectorAll('input[name="answer"]').forEach(radio => {
            radio.checked = false;
        });

        this.questionStartTime = Date.now();
    }

    showLoading(message) {
        // Implementation depends on your existing loading system
        console.log('Loading:', message);
    }

    showError(message) {
        // Implementation depends on your existing error handling
        console.error('Error:', message);
        this.showToast(message, 'error');
    }

    showToast(message, type = 'info') {
        // Implementation depends on your existing toast system
        console.log('Toast:', message, type);

        // Try to use existing toast system if available
        if (window.showToast) {
            window.showToast(message, type);
        } else if (window.toastManager) {
            window.toastManager.show(message, type);
        }
    }
}

// Global initialization
document.addEventListener('DOMContentLoaded', () => {
    // Initialize when the page loads
    const skillPracticeUI = new SkillPracticeUI();

    // Make it globally available
    window.skillPracticeUI = skillPracticeUI;

    // Set up event delegation for dynamically created elements
    document.addEventListener('click', (e) => {
        // Handle skill button clicks
        if (e.target.closest('.skill-btn')) {
            const skillCode = e.target.closest('.skill-btn').dataset.skillCode;
            if (skillCode && window.skillPracticeUI) {
                window.skillPracticeUI.startSkillPractice(skillCode);
            }
        }

        // Handle topic practice button clicks
        if (e.target.closest('.topic-practice-btn')) {
            const domainId = e.target.closest('.topic-practice-btn').dataset.domainId;
            if (domainId && window.skillPracticeUI) {
                window.skillPracticeUI.startTopicPractice(domainId);
            }
        }
    });
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SkillPracticeUI;
}