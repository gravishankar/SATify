/**
 * Modern Learn Page - Updated to use new lesson format and renderer
 * Replaces the old learn-page.js functionality
 */

class ModernLearnPage {
    constructor(app) {
        this.app = app;
        this.lessonLoader = new LessonLoader();
        this.lessonRenderer = null;
        this.currentLessonId = null;
        this.isInLessonMode = false;

        this.init();
    }

    async init() {
        try {
            console.log('Initializing Modern Learn Page...');
            await this.lessonLoader.initialize();
            console.log('Lesson loader initialized');

            this.setupEventListeners();
            console.log('Event listeners setup');

            await this.setupLessonView();
            console.log('Lesson view setup complete');

            console.log('Modern Learn Page initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Modern Learn Page:', error);
            this.showError('Failed to initialize lessons. Please refresh the page.');
        }
    }

    setupEventListeners() {
        // Listen for skill card clicks
        document.addEventListener('click', this.handleSkillCardClick.bind(this));

        // Listen for lesson completion
        document.addEventListener('lessonCompleted', this.handleLessonCompletion.bind(this));

        // Listen for page navigation
        document.addEventListener('pageChanged', this.handlePageChange.bind(this));
    }

    async setupLessonView() {
        // Update skill cards to show lesson availability
        await this.updateSkillCardAvailability();
    }

    async updateSkillCardAvailability() {
        const skillCards = document.querySelectorAll('.skill-card[data-skill]');

        for (const card of skillCards) {
            const skillId = card.dataset.skill;
            const skillCode = this.getSkillCodeFromId(skillId);

            if (skillCode) {
                const hasLessons = await this.lessonLoader.hasLessonsForSkill(skillCode);

                if (hasLessons) {
                    this.markSkillAsHavingLessons(card, skillCode);
                } else {
                    this.markSkillAsNoLessons(card);
                }
            }
        }
    }

    getSkillCodeFromId(skillId) {
        // Map skill IDs to skill codes - Updated with all available lessons
        const skillMapping = {
            'information-and-ideas': 'CID',
            'craft-and-structure': 'WIC',
            'expression-of-ideas': 'TRA', // Changed to TRA as we have transitions lesson
            'standard-english-conventions': 'FSS' // Changed to FSS as we have grammar lesson
        };

        // Also check alternative mappings for the skills we have lessons for
        const alternativeMapping = {
            'information_and_ideas': 'CID',
            'craft_and_structure': 'WIC',
            'expression_of_ideas': 'TRA',
            'standard_english_conventions': 'FSS'
        };

        return skillMapping[skillId] || alternativeMapping[skillId] || null;
    }

    markSkillAsHavingLessons(card, skillCode) {
        // Add lesson available indicator
        card.classList.add('has-lessons');

        // Update progress text to show lesson available
        const progressText = card.querySelector('.progress-text');
        if (progressText) {
            progressText.textContent = 'Lesson Available';
        }

        // Add lesson button
        this.addLessonButton(card, skillCode);
    }

    markSkillAsNoLessons(card) {
        card.classList.add('no-lessons');

        const progressText = card.querySelector('.progress-text');
        if (progressText) {
            progressText.textContent = 'Coming Soon';
        }
    }

    addLessonButton(card, skillCode) {
        // Check if button already exists
        if (card.querySelector('.start-lesson-btn')) return;

        const buttonContainer = card.querySelector('.skill-progress') || card;
        const lessonBtn = document.createElement('button');
        lessonBtn.className = 'btn btn-primary start-lesson-btn';
        lessonBtn.textContent = 'Start Lesson';
        lessonBtn.dataset.skillCode = skillCode;

        lessonBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.startLessonForSkill(skillCode);
        });

        buttonContainer.appendChild(lessonBtn);
    }

    async handleSkillCardClick(event) {
        const skillCard = event.target.closest('.skill-card[data-skill]');
        if (!skillCard || this.isInLessonMode) return;

        const skillId = skillCard.dataset.skill;
        const skillCode = this.getSkillCodeFromId(skillId);

        if (skillCode) {
            const hasLessons = await this.lessonLoader.hasLessonsForSkill(skillCode);
            if (hasLessons) {
                await this.startLessonForSkill(skillCode);
            } else {
                this.showNoLessonMessage(skillCode);
            }
        }
    }

    async startLessonForSkill(skillCode) {
        try {
            const lesson = await this.lessonLoader.getSuggestedLesson(skillCode);
            if (lesson) {
                await this.startLesson(lesson);
            } else {
                this.showNoLessonMessage(skillCode);
            }
        } catch (error) {
            console.error('Failed to start lesson:', error);
            this.showError('Failed to load lesson. Please try again.');
        }
    }

    async startLesson(lesson) {
        try {
            this.currentLessonId = lesson.id;
            this.isInLessonMode = true;

            // Hide the main learn page content
            this.hideLearPageContent();

            // Create lesson renderer if not exists
            if (!this.lessonRenderer) {
                this.lessonRenderer = new LessonRenderer('#learnPage');
            }

            // Load the lesson
            await this.lessonRenderer.loadLesson(lesson);

            // Track lesson start
            this.trackLessonStart(lesson);

            console.log(`Started lesson: ${lesson.title}`);

        } catch (error) {
            console.error('Failed to start lesson:', error);
            this.showError('Failed to start lesson. Please try again.');
            this.exitLessonMode();
        }
    }

    hideLearPageContent() {
        const learnContainer = document.querySelector('#learnPage .container');
        if (learnContainer) {
            // Hide all child elements except the lesson renderer will create its own content
            Array.from(learnContainer.children).forEach(child => {
                child.style.display = 'none';
            });
        }
    }

    showLearnPageContent() {
        const learnContainer = document.querySelector('#learnPage .container');
        if (learnContainer) {
            // Show all child elements
            Array.from(learnContainer.children).forEach(child => {
                child.style.display = '';
            });
        }
    }

    handleLessonCompletion(event) {
        const { lessonId, completionTime, slidesCompleted, totalSlides } = event.detail;

        console.log(`Lesson ${lessonId} completed in ${completionTime}ms`);

        // Track completion
        this.trackLessonCompletion(lessonId, completionTime, slidesCompleted, totalSlides);

        // Update progress
        this.updateLessonProgress(lessonId, true);

        // Show completion celebration
        setTimeout(() => {
            this.exitLessonMode();
        }, 3000); // Allow time to see completion message
    }

    trackLessonStart(lesson) {
        if (this.app && this.app.analytics) {
            this.app.analytics.trackEvent('lesson_started', {
                lesson_id: lesson.id,
                lesson_title: lesson.title,
                skill_codes: lesson.skill_codes?.join(',') || '',
                timestamp: new Date().toISOString()
            });
        }
    }

    trackLessonCompletion(lessonId, completionTime, slidesCompleted, totalSlides) {
        if (this.app && this.app.analytics) {
            this.app.analytics.trackEvent('lesson_completed', {
                lesson_id: lessonId,
                completion_time_ms: completionTime,
                slides_completed: slidesCompleted,
                total_slides: totalSlides,
                completion_rate: slidesCompleted / totalSlides,
                timestamp: new Date().toISOString()
            });
        }
    }

    updateLessonProgress(lessonId, completed) {
        const progress = JSON.parse(localStorage.getItem('lesson_progress') || '{}');
        progress[lessonId] = {
            completed,
            completedAt: completed ? new Date().toISOString() : null,
            lastAccessed: new Date().toISOString()
        };
        localStorage.setItem('lesson_progress', JSON.stringify(progress));
    }

    exitLessonMode() {
        this.isInLessonMode = false;
        this.currentLessonId = null;

        // Show the main learn page content
        this.showLearnPageContent();

        // Refresh the page to show updated progress
        this.refreshLearPageView();
    }

    async refreshLearPageView() {
        // Update skill card availability and progress
        await this.updateSkillCardAvailability();
    }

    handlePageChange(event) {
        if (event.detail && event.detail.page !== 'learn' && this.isInLessonMode) {
            // User navigated away while in lesson mode
            this.exitLessonMode();
        }
    }

    showNoLessonMessage(skillCode) {
        // Create and show a modal or toast message
        const message = `Lesson for skill ${skillCode} is coming soon! Check back later.`;
        this.showToast(message, 'info');
    }

    showError(message) {
        this.showToast(message, 'error');
    }

    showToast(message, type = 'info') {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;

        const container = document.getElementById('toastContainer') || document.body;
        container.appendChild(toast);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 5000);
    }

    // Public API for external calls
    async getLessonsForSkill(skillCode) {
        return await this.lessonLoader.getLessonsBySkill(skillCode);
    }

    async getAllLessons() {
        return await this.lessonLoader.getAllLessons();
    }

    isCurrentlyInLesson() {
        return this.isInLessonMode;
    }

    getCurrentLessonId() {
        return this.currentLessonId;
    }

    // Force exit lesson mode (for debugging or navigation)
    forceExitLesson() {
        this.exitLessonMode();
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ModernLearnPage;
}