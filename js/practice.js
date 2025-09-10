/**
 * SAT Practice Pro - Practice Module
 * Advanced practice features and session management
 */

class SATPractice {
    constructor(app) {
        this.app = app;
        this.timerInterval = null;
        this.currentSessionTime = 0;
        this.init();
    }

    init() {
        this.setupPracticeEventListeners();
    }

    setupPracticeEventListeners() {
        // Bookmark and flag buttons
        document.getElementById('bookmarkBtn')?.addEventListener('click', () => {
            this.toggleBookmark();
        });

        document.getElementById('flagBtn')?.addEventListener('click', () => {
            this.toggleFlag();
        });

        // Practice mode selection
        this.createPracticeSettingsModal();
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (this.app.practiceSession) {
                this.handleKeyboardShortcuts(e);
            }
        });
    }

    createPracticeSettingsModal() {
        // Create practice settings modal
        const settingsModal = document.createElement('div');
        settingsModal.id = 'practiceSettingsModal';
        settingsModal.className = 'modal hidden';
        settingsModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Practice Settings</h2>
                    <button class="modal-close" id="closePracticeSettings">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="practiceMode">Practice Mode</label>
                        <select id="practiceMode" class="form-control">
                            <option value="adaptive">Adaptive (Recommended)</option>
                            <option value="random">Random Questions</option>
                            <option value="weak_areas">Focus on Weak Areas</option>
                            <option value="specific">Specific Topic</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="questionCount">Number of Questions</label>
                        <select id="questionCount" class="form-control">
                            <option value="5">5 Questions (Quick Practice)</option>
                            <option value="10" selected>10 Questions (Standard)</option>
                            <option value="15">15 Questions (Extended)</option>
                            <option value="20">20 Questions (Full Set)</option>
                            <option value="50">50 Questions (Marathon)</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="moduleFilter">Subject</label>
                        <select id="moduleFilter" class="form-control">
                            <option value="">All Subjects</option>
                            <option value="math">Math</option>
                            <option value="reading-writing">Reading & Writing</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="difficultyFilter">Difficulty</label>
                        <select id="difficultyFilter" class="form-control">
                            <option value="">All Difficulties</option>
                            <option value="E">Easy</option>
                            <option value="M">Medium</option>
                            <option value="H">Hard</option>
                        </select>
                    </div>
                    
                    <div class="form-group" id="topicGroup" style="display: none;">
                        <label for="topicFilter">Specific Topic</label>
                        <select id="topicFilter" class="form-control">
                            <option value="">Select a topic...</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="timedMode"> Timed Mode
                        </label>
                        <small class="text-secondary">Enable time limits for realistic test conditions</small>
                    </div>
                    
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="showHints" checked> Show Hints
                        </label>
                        <small class="text-secondary">Display helpful hints during practice</small>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="cancelPracticeSettings">Cancel</button>
                    <button class="btn btn-primary" id="startCustomPractice">Start Practice</button>
                </div>
            </div>
        `;
        document.body.appendChild(settingsModal);

        // Event listeners for practice settings
        document.getElementById('practiceSettings')?.addEventListener('click', () => {
            this.showPracticeSettings();
        });

        document.getElementById('closePracticeSettings')?.addEventListener('click', () => {
            this.hidePracticeSettings();
        });

        document.getElementById('cancelPracticeSettings')?.addEventListener('click', () => {
            this.hidePracticeSettings();
        });

        document.getElementById('startCustomPractice')?.addEventListener('click', () => {
            this.startCustomPractice();
        });

        document.getElementById('practiceMode')?.addEventListener('change', (e) => {
            this.toggleTopicSelection(e.target.value === 'specific');
        });

        // Topics will be populated when practice settings are shown
    }

    populateTopics() {
        const topicSelect = document.getElementById('topicFilter');
        if (!topicSelect || !this.app.questions) return;

        // Clear existing options except the first one (All Topics)
        while (topicSelect.children.length > 1) {
            topicSelect.removeChild(topicSelect.lastChild);
        }

        const topics = new Set();
        this.app.questions.forEach(q => {
            if (q.primary_class_cd_desc) {
                topics.add(q.primary_class_cd_desc);
            }
        });

        Array.from(topics).sort().forEach(topic => {
            const option = document.createElement('option');
            option.value = topic;
            option.textContent = topic;
            topicSelect.appendChild(option);
        });
    }

    showPracticeSettings() {
        // Populate topics when showing settings (ensures questions are loaded)
        this.populateTopics();
        document.getElementById('practiceSettingsModal').classList.remove('hidden');
    }

    hidePracticeSettings() {
        document.getElementById('practiceSettingsModal').classList.add('hidden');
    }

    toggleTopicSelection(show) {
        const topicGroup = document.getElementById('topicGroup');
        if (topicGroup) {
            topicGroup.style.display = show ? 'block' : 'none';
        }
    }

    startCustomPractice() {
        const mode = document.getElementById('practiceMode')?.value || 'adaptive';
        const count = parseInt(document.getElementById('questionCount')?.value || '10');
        const module = document.getElementById('moduleFilter')?.value || null;
        const difficulty = document.getElementById('difficultyFilter')?.value || null;
        const topic = document.getElementById('topicFilter')?.value || null;
        const timed = document.getElementById('timedMode')?.checked || false;
        const hints = document.getElementById('showHints')?.checked || true;

        const options = {
            mode,
            count,
            module,
            difficulty,
            topics: topic ? [topic] : null,
            timed,
            hints
        };

        this.hidePracticeSettings();
        this.app.startPractice(options);
        
        if (timed) {
            this.startTimer(count);
        }
    }

    startTimer(questionCount) {
        // Approximate time: 1.5 minutes per question for math, 1 minute for reading
        const baseTime = questionCount * 90 * 1000; // 90 seconds per question
        this.currentSessionTime = baseTime;
        
        this.createTimerDisplay();
        this.updateTimerDisplay();
        
        this.timerInterval = setInterval(() => {
            this.currentSessionTime -= 1000;
            this.updateTimerDisplay();
            
            if (this.currentSessionTime <= 0) {
                this.timeUp();
            }
        }, 1000);
    }

    createTimerDisplay() {
        if (document.getElementById('practiceTimer')) return;
        
        const timerDiv = document.createElement('div');
        timerDiv.id = 'practiceTimer';
        timerDiv.className = 'practice-timer';
        timerDiv.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: var(--surface-color);
            border: 2px solid var(--primary-color);
            border-radius: 8px;
            padding: 1rem;
            box-shadow: var(--shadow-lg);
            z-index: 100;
            font-weight: 600;
            color: var(--primary-color);
        `;
        
        document.body.appendChild(timerDiv);
    }

    updateTimerDisplay() {
        const timerElement = document.getElementById('practiceTimer');
        if (!timerElement) return;
        
        const minutes = Math.floor(this.currentSessionTime / 60000);
        const seconds = Math.floor((this.currentSessionTime % 60000) / 1000);
        
        timerElement.innerHTML = `
            <div style="text-align: center;">
                <div style="font-size: 0.8rem; margin-bottom: 0.25rem;">Time Remaining</div>
                <div style="font-size: 1.2rem;">${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}</div>
            </div>
        `;
        
        // Change color when time is running low
        if (this.currentSessionTime < 60000) { // Less than 1 minute
            timerElement.style.borderColor = 'var(--danger-color)';
            timerElement.style.color = 'var(--danger-color)';
        } else if (this.currentSessionTime < 300000) { // Less than 5 minutes
            timerElement.style.borderColor = 'var(--warning-color)';
            timerElement.style.color = 'var(--warning-color)';
        }
    }

    timeUp() {
        this.stopTimer();
        this.app.showToast('Time\'s up! Session complete.', 'warning');
        this.app.finishPracticeSession();
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        const timerElement = document.getElementById('practiceTimer');
        if (timerElement) {
            timerElement.remove();
        }
    }

    toggleBookmark() {
        if (!this.app.practiceSession) return;
        
        const currentQuestion = this.app.practiceSession.questions[this.app.practiceSession.currentIndex];
        currentQuestion.bookmarked = !currentQuestion.bookmarked;
        
        const btn = document.getElementById('bookmarkBtn');
        btn.classList.toggle('active');
        btn.title = currentQuestion.bookmarked ? 'Remove bookmark' : 'Bookmark';
        
        // Save to user data
        this.saveQuestionState(currentQuestion.uId, { bookmarked: currentQuestion.bookmarked });
        
        const message = currentQuestion.bookmarked ? 'Question bookmarked' : 'Bookmark removed';
        this.app.showToast(message, 'info');
    }

    toggleFlag() {
        if (!this.app.practiceSession) return;
        
        const currentQuestion = this.app.practiceSession.questions[this.app.practiceSession.currentIndex];
        currentQuestion.flagged = !currentQuestion.flagged;
        
        const btn = document.getElementById('flagBtn');
        btn.classList.toggle('active');
        btn.title = currentQuestion.flagged ? 'Remove flag' : 'Flag for review';
        
        // Save to user data
        this.saveQuestionState(currentQuestion.uId, { flagged: currentQuestion.flagged });
        
        const message = currentQuestion.flagged ? 'Question flagged for review' : 'Flag removed';
        this.app.showToast(message, 'info');
    }

    saveQuestionState(questionId, state) {
        const userData = this.app.getUserData();
        const questionStates = userData.questionStates || {};
        
        questionStates[questionId] = { ...questionStates[questionId], ...state };
        this.app.saveUserData({ questionStates });
    }

    loadQuestionState(questionId) {
        const userData = this.app.getUserData();
        const questionStates = userData.questionStates || {};
        return questionStates[questionId] || {};
    }

    handleKeyboardShortcuts(e) {
        // Don't handle shortcuts if user is typing in an input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }
        
        switch (e.key) {
            case 'ArrowLeft':
            case 'p':
                e.preventDefault();
                this.app.prevQuestion();
                break;
                
            case 'ArrowRight':
            case 'n':
                e.preventDefault();
                this.app.nextQuestion();
                break;
                
            case 'Enter':
            case ' ':
                e.preventDefault();
                this.app.submitAnswer();
                break;
                
            case 'b':
                e.preventDefault();
                this.toggleBookmark();
                break;
                
            case 'f':
                e.preventDefault();
                this.toggleFlag();
                break;
                
            case 'h':
                e.preventDefault();
                this.showHint();
                break;
                
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
                e.preventDefault();
                this.selectChoice(parseInt(e.key) - 1);
                break;
                
            case 'Escape':
                if (this.app.practiceSession) {
                    this.pausePractice();
                }
                break;
        }
    }

    selectChoice(index) {
        const choices = document.querySelectorAll('.choice');
        if (choices[index]) {
            choices[index].click();
        }
    }

    showHint() {
        if (!this.app.practiceSession) return;
        
        const currentQuestion = this.app.practiceSession.questions[this.app.practiceSession.currentIndex];
        
        // Generate contextual hints based on question type and content
        const hint = this.generateHint(currentQuestion);
        
        if (hint) {
            this.displayHint(hint);
        } else {
            this.app.showToast('No hint available for this question', 'info');
        }
    }

    generateHint(question) {
        // Basic hint generation based on question characteristics
        const hints = [];
        
        // Math-specific hints
        if (question.module === 'math') {
            if (question.primary_class_cd_desc?.includes('Algebra')) {
                hints.push('Look for variables and equations. Try to isolate the unknown variable.');
            } else if (question.primary_class_cd_desc?.includes('Geometry')) {
                hints.push('Draw a diagram if possible. Look for angle relationships and area formulas.');
            } else if (question.primary_class_cd_desc?.includes('Statistics')) {
                hints.push('Pay attention to the data trends and statistical measures mentioned.');
            }
        }
        
        // Reading & Writing hints
        if (question.module === 'reading-writing') {
            if (question.primary_class_cd_desc?.includes('Ideas')) {
                hints.push('Focus on the main idea and supporting details in the passage.');
            } else if (question.primary_class_cd_desc?.includes('Structure')) {
                hints.push('Look for transition words and how ideas connect to each other.');
            } else if (question.primary_class_cd_desc?.includes('Expression')) {
                hints.push('Consider word choice, tone, and how ideas are expressed clearly.');
            } else if (question.primary_class_cd_desc?.includes('Conventions')) {
                hints.push('Check grammar, punctuation, and sentence structure carefully.');
            }
        }
        
        // Difficulty-based hints
        if (question.difficulty === 'H') {
            hints.push('This is a challenging question. Take your time and consider multiple approaches.');
        }
        
        // General test-taking hints
        hints.push('Eliminate obviously wrong answers first.');
        hints.push('Re-read the question to make sure you understand what\'s being asked.');
        
        return hints[Math.floor(Math.random() * hints.length)];
    }

    displayHint(hintText) {
        // Remove existing hint
        const existingHint = document.getElementById('practiceHint');
        if (existingHint) {
            existingHint.remove();
        }
        
        // Create hint display
        const hintDiv = document.createElement('div');
        hintDiv.id = 'practiceHint';
        hintDiv.className = 'practice-hint';
        hintDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--surface-color);
            border: 2px solid var(--warning-color);
            border-radius: 12px;
            padding: 2rem;
            box-shadow: var(--shadow-lg);
            max-width: 400px;
            z-index: 1000;
            text-align: center;
        `;
        
        hintDiv.innerHTML = `
            <div style="color: var(--warning-color); font-size: 2rem; margin-bottom: 1rem;">💡</div>
            <h3 style="color: var(--text-primary); margin-bottom: 1rem;">Hint</h3>
            <p style="color: var(--text-secondary); line-height: 1.6; margin-bottom: 1.5rem;">${hintText}</p>
            <button class="btn btn-primary" onclick="document.getElementById('practiceHint').remove()">
                Got it!
            </button>
        `;
        
        document.body.appendChild(hintDiv);
    }

    pausePractice() {
        if (!this.app.practiceSession) return;
        
        const pauseModal = document.createElement('div');
        pauseModal.className = 'modal';
        pauseModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Practice Paused</h2>
                </div>
                <div class="modal-body">
                    <p>Your practice session is paused. Take a break if you need to!</p>
                    <div style="text-align: center; margin: 2rem 0;">
                        <div style="font-size: 3rem; margin-bottom: 1rem;">⏸️</div>
                        <p>Progress: ${this.app.practiceSession.currentIndex + 1} of ${this.app.practiceSession.questions.length} questions</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove();">Resume</button>
                    <button class="btn btn-danger" onclick="satApp.finishPracticeSession(); this.closest('.modal').remove();">End Session</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(pauseModal);
        
        // Pause timer if running
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
            
            // Will need to restart when resuming
            setTimeout(() => {
                if (!document.querySelector('.modal') && this.app.practiceSession) {
                    this.startTimer(this.app.practiceSession.questions.length - this.app.practiceSession.currentIndex);
                }
            }, 1000);
        }
    }

    // Enhanced question selection with spaced repetition
    selectAdaptiveQuestions(questions) {
        const userData = this.app.getUserData();
        const questionHistory = userData.questionHistory || {};
        
        // Score questions based on various factors
        const scoredQuestions = questions.map(q => {
            const history = questionHistory[q.uId] || { attempts: 0, lastSeen: 0, correct: 0 };
            
            let score = 0;
            
            // Spaced repetition: prefer questions not seen recently
            const daysSinceLastSeen = (Date.now() - history.lastSeen) / (1000 * 60 * 60 * 24);
            score += Math.min(daysSinceLastSeen, 30); // Cap at 30 days
            
            // Prefer questions with lower accuracy
            const accuracy = history.attempts > 0 ? history.correct / history.attempts : 0.5;
            score += (1 - accuracy) * 20;
            
            // Slight preference for questions never attempted
            if (history.attempts === 0) {
                score += 5;
            }
            
            // Difficulty adjustment based on user performance
            const userLevel = this.estimateUserLevel(userData);
            const difficultyValues = { 'E': 1, 'M': 2, 'H': 3 };
            const questionDifficulty = difficultyValues[q.difficulty] || 2;
            
            // Prefer questions slightly above user level
            const levelDiff = Math.abs(questionDifficulty - userLevel);
            score += Math.max(0, 5 - levelDiff * 2);
            
            return { ...q, adaptiveScore: score };
        });
        
        // Sort by score (higher = better) and return
        return scoredQuestions
            .sort((a, b) => b.adaptiveScore - a.adaptiveScore)
            .slice(0, scoredQuestions.length);
    }

    estimateUserLevel(userData) {
        const sessions = userData.sessions || [];
        if (sessions.length === 0) return 2; // Default to medium
        
        const recentSessions = sessions.slice(-5);
        const avgAccuracy = recentSessions.reduce((acc, s) => acc + s.score, 0) / recentSessions.length;
        
        if (avgAccuracy >= 80) return 3; // Hard
        if (avgAccuracy >= 60) return 2; // Medium
        return 1; // Easy
    }
}

// Initialize practice module
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (window.satApp) {
            window.satPractice = new SATPractice(window.satApp);
        }
    }, 100);
});