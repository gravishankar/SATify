/**
 * Learn Page Module - Interactive lesson functionality
 * Inspired by Khan Academy, Duolingo, and Brilliant
 */

class LearnPage {
    constructor(app) {
        this.app = app;
        this.currentSlide = 0;
        this.totalSlides = this.detectTotalSlides(); // Dynamic detection
        this.lessonCompleted = false;
        this.topicLoader = new TopicLoader();
        this.currentTopic = null;
        this.init();
    }

    // Enhanced method to dynamically detect total slides
    detectTotalSlides() {
        const slides = document.querySelectorAll('.lesson-slide');
        const count = slides.length;
        console.log(`Detected ${count} slides in lesson`);
        return count || 6; // fallback to 6 if no slides found yet
    }

    init() {
        this.setupEventListeners();
        this.updateProgress();
        this.setupFloatingActionButton();
        this.loadCreatorStudioLessons();
    }

    setupEventListeners() {
        // Skill card click to start lesson
        document.addEventListener('click', (e) => {
            const skillCard = e.target.closest('.skill-card.clickable');
            if (skillCard) {
                this.startLesson(skillCard.dataset.skill);
            }
        });

        // Back to skills button
        document.getElementById('backToSkills')?.addEventListener('click', () => {
            this.showSkillsGrid();
        });

        // Lesson navigation
        document.getElementById('prevSlide')?.addEventListener('click', () => {
            this.previousSlide();
        });

        document.getElementById('nextSlide')?.addEventListener('click', () => {
            this.nextSlide();
        });

        // Slide indicators
        document.addEventListener('click', (e) => {
            if (e.target.matches('.indicator')) {
                const slideIndex = parseInt(e.target.dataset.slide);
                this.goToSlide(slideIndex);
            }
        });

        // Practice Now button
        document.getElementById('practiceNow')?.addEventListener('click', () => {
            this.goToPractice();
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (document.getElementById('lessonContent')?.classList.contains('hidden')) return;

            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                this.previousSlide();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                this.nextSlide();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                this.showSkillsGrid();
            }
        });
    }

    setupFloatingActionButton() {
        // Show floating button on Words in Context and Learn pages
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-page]')) {
                const page = e.target.getAttribute('data-page');
                this.toggleFloatingButton(page);
            }
        });

        // Floating action button click
        document.getElementById('toggleLearnPractice')?.addEventListener('click', () => {
            this.toggleLearnPractice();
        });
    }

    toggleFloatingButton(currentPage) {
        const fab = document.getElementById('floatingActionBtn');
        const fabIcon = document.querySelector('.fab-icon');
        const fabText = document.querySelector('.fab-text');

        if (currentPage === 'words-in-context') {
            fab.classList.remove('hidden');
            fabIcon.textContent = '🎓';
            fabText.textContent = 'Learn';
        } else if (currentPage === 'learn') {
            fab.classList.remove('hidden');
            fabIcon.textContent = '💭';
            fabText.textContent = 'Practice';
        } else {
            fab.classList.add('hidden');
        }
    }

    toggleLearnPractice() {
        const currentPage = document.querySelector('.page.active');

        if (currentPage && currentPage.id === 'words-in-contextPage') {
            // Switch to Learn page
            const learnLink = document.querySelector('[data-page="learn"]');
            if (learnLink) {
                learnLink.click();
            }
        } else if (currentPage && currentPage.id === 'learnPage') {
            // Switch to Words in Context practice
            const practiceLink = document.querySelector('[data-page="words-in-context"]');
            if (practiceLink) {
                practiceLink.click();
            }
        }
    }

    async startLesson(skillId) {
        console.log('Starting lesson:', skillId);

        // Check if this is a Creator Studio lesson domain
        let success = false;
        console.log('Checking if Creator Studio domain:', skillId);
        console.log('Is Creator Studio domain?', this.isCreatorStudioDomain(skillId));

        if (this.isCreatorStudioDomain(skillId)) {
            console.log('Loading Creator Studio lessons for:', skillId);
            success = await this.loadCreatorStudioDomainLessons(skillId);
        } else {
            console.log('Loading topic content for:', skillId);
            // Load topic content dynamically
            success = await this.loadTopicContent(skillId);
        }

        if (!success) {
            console.error('Failed to load lesson content');
            return;
        }

        // Hide skills grid and show lesson content
        document.querySelector('.skills-grid').classList.add('hidden');
        document.getElementById('lessonContent').classList.remove('hidden');

        // Reset lesson state
        this.currentSlide = 0;
        this.lessonCompleted = false;

        // Recalculate total slides after loading new content
        this.totalSlides = this.detectTotalSlides();

        // Initialize first slide
        this.showSlide(0);
        this.updateProgress();

        // Update skill progress
        this.updateSkillProgress(skillId, 'started');

        // Add analytics event
        if (this.app && this.app.analytics) {
            this.app.analytics.trackEvent('lesson_started', {
                skill: skillId,
                timestamp: new Date().toISOString()
            });
        }
    }

    // Load topic content from JSON
    async loadTopicContent(skillId) {
        try {
            console.log(`Loading topic content for: ${skillId}`);

            // Load and render the topic
            const success = await this.topicLoader.loadAndRender(skillId);

            if (success) {
                this.currentTopic = this.topicLoader.currentTopic;
                console.log('Topic loaded successfully:', this.currentTopic.title);
                return true;
            } else {
                console.error('Failed to load topic');
                return false;
            }
        } catch (error) {
            console.error('Error loading topic content:', error);
            this.showFallbackContent(skillId);
            return false;
        }
    }

    // Fallback to hardcoded content if JSON loading fails
    showFallbackContent(skillId) {
        console.log('Using fallback content for:', skillId);
        // The existing hardcoded slides will be shown as fallback
    }

    showSkillsGrid() {
        document.getElementById('lessonContent').classList.add('hidden');
        document.querySelector('.skills-grid').classList.remove('hidden');

        // Save lesson progress
        if (this.currentSlide > 0) {
            this.saveProgress();
        }
    }

    showSlide(slideIndex) {
        // Validate slide index
        if (slideIndex < 0 || slideIndex >= this.totalSlides) {
            console.log('Invalid slide index:', slideIndex, 'Total slides:', this.totalSlides);
            return;
        }

        console.log('Showing slide:', slideIndex);

        // Hide all slides first with proper cleanup
        const allSlides = document.querySelectorAll('.lesson-slide');
        allSlides.forEach((slide, index) => {
            slide.classList.remove('active');
            slide.style.zIndex = '1';
            slide.style.visibility = 'hidden';
            slide.style.opacity = '0';
        });

        // Show new slide with proper layering after brief cleanup
        setTimeout(() => {
            const newSlide = document.querySelector(`.lesson-slide[data-slide="${slideIndex}"]`);
            if (newSlide) {
                // Ensure clean slate
                newSlide.style.zIndex = '10';
                newSlide.style.visibility = 'visible';
                newSlide.style.opacity = '1';
                newSlide.classList.add('active');
                console.log('Activated slide:', slideIndex);

                // Dynamically adjust slide container height
                this.adjustSlideHeight(newSlide);
            } else {
                console.error('Could not find slide with index:', slideIndex);
            }
        }, 50); // Brief delay to ensure clean transition

        this.currentSlide = slideIndex;
        this.updateNavigation();
        this.updateProgress();

        // Mark lesson as completed when reaching final slide
        if (slideIndex === this.totalSlides - 1) {
            this.lessonCompleted = true;
            this.updateSkillProgress('craft-and-structure', 'completed');
        }
    }

    nextSlide() {
        if (this.currentSlide < this.totalSlides - 1) {
            this.showSlide(this.currentSlide + 1);
        }
    }

    previousSlide() {
        if (this.currentSlide > 0) {
            this.showSlide(this.currentSlide - 1);
        }
    }

    goToSlide(slideIndex) {
        this.showSlide(slideIndex);
    }

    updateNavigation() {
        console.log('Updating navigation for slide:', this.currentSlide, 'of', this.totalSlides);

        // Update navigation buttons
        const prevBtn = document.getElementById('prevSlide');
        const nextBtn = document.getElementById('nextSlide');

        if (prevBtn) {
            prevBtn.disabled = this.currentSlide === 0;
            console.log('Previous button disabled:', prevBtn.disabled);
        }

        if (nextBtn) {
            if (this.currentSlide === this.totalSlides - 1) {
                nextBtn.textContent = 'Complete';
                nextBtn.classList.add('btn-success');
            } else {
                nextBtn.textContent = 'Next →';
                nextBtn.classList.remove('btn-success');
            }
            nextBtn.disabled = false; // Ensure next button is never disabled during navigation
            console.log('Next button text:', nextBtn.textContent);
        }

        // Update slide indicators
        document.querySelectorAll('.indicator').forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.currentSlide);
        });
    }

    updateProgress() {
        const progressFill = document.querySelector('.lesson-progress-fill');
        const stepText = document.querySelector('.lesson-step');

        if (progressFill) {
            const progress = ((this.currentSlide + 1) / this.totalSlides) * 100;
            progressFill.style.width = `${progress}%`;
        }

        if (stepText) {
            stepText.textContent = `Step ${this.currentSlide + 1} of ${this.totalSlides}`;
        }
    }

    updateSkillProgress(skillId, status) {
        const skillCard = document.querySelector(`[data-skill="${skillId}"]`);
        if (!skillCard) return;

        const progressFill = skillCard.querySelector('.progress-fill');
        const progressText = skillCard.querySelector('.progress-text');

        if (status === 'started') {
            if (progressFill) progressFill.style.width = '20%';
            if (progressText) progressText.textContent = 'In Progress';
        } else if (status === 'completed') {
            if (progressFill) progressFill.style.width = '100%';
            if (progressText) progressText.textContent = 'Completed ✓';
            skillCard.classList.add('completed');
        }

        // Save to localStorage
        this.saveSkillProgress(skillId, status);
    }

    saveSkillProgress(skillId, status) {
        const progress = JSON.parse(localStorage.getItem('sat_skill_progress') || '{}');
        progress[skillId] = {
            status: status,
            currentSlide: this.currentSlide,
            completedAt: status === 'completed' ? new Date().toISOString() : null,
            updatedAt: new Date().toISOString()
        };
        localStorage.setItem('sat_skill_progress', JSON.stringify(progress));
    }

    loadSkillProgress() {
        const progress = JSON.parse(localStorage.getItem('sat_skill_progress') || '{}');

        Object.keys(progress).forEach(skillId => {
            const skillProgress = progress[skillId];
            this.updateSkillProgress(skillId, skillProgress.status);
        });
    }

    saveProgress() {
        const lessonProgress = {
            currentSlide: this.currentSlide,
            completed: this.lessonCompleted,
            lastAccessed: new Date().toISOString()
        };
        localStorage.setItem('sat_lesson_progress', JSON.stringify(lessonProgress));
    }

    goToPractice() {
        console.log('Navigating to Words in Context practice...');

        // Track lesson completion
        if (this.app && this.app.analytics) {
            this.app.analytics.trackEvent('lesson_completed', {
                skill: 'craft-and-structure',
                slides_completed: this.totalSlides,
                timestamp: new Date().toISOString()
            });
        }

        // Navigate to Words in Context practice and start session
        if (this.app && this.app.navigateTo) {
            this.app.navigateTo('words-in-context');
        } else {
            // Fallback navigation
            const wordsInContextLink = document.querySelector('[data-page="words-in-context"]');
            if (wordsInContextLink) {
                wordsInContextLink.click();
            }
        }

        // Start practice session after navigation
        setTimeout(() => {
            if (this.app && this.app.wordsInContextPractice) {
                this.app.wordsInContextPractice.startPracticeSession();
            }
        }, 100);

        // Show a success message
        this.showCompletionToast();
    }

    showCompletionToast() {
        // Create success toast notification
        const toast = document.createElement('div');
        toast.className = 'toast toast-success';
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-icon">🎉</span>
                <span class="toast-message">Lesson completed! Ready to practice?</span>
            </div>
        `;

        const container = document.getElementById('toastContainer') || document.body;
        container.appendChild(toast);

        // Show toast with animation
        setTimeout(() => toast.classList.add('show'), 100);

        // Remove toast after 4 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (container.contains(toast)) {
                    container.removeChild(toast);
                }
            }, 300);
        }, 4000);
    }

    // Public methods for integration
    getProgress() {
        return {
            currentSlide: this.currentSlide,
            totalSlides: this.totalSlides,
            completed: this.lessonCompleted,
            progress: ((this.currentSlide + 1) / this.totalSlides) * 100
        };
    }

    resetLesson() {
        this.currentSlide = 0;
        this.lessonCompleted = false;
        this.showSlide(0);
        this.showSkillsGrid();
    }

    // Dynamic height adjustment for slides
    adjustSlideHeight(slideElement) {
        const slideContainer = document.querySelector('.lesson-slides');
        const slideContent = slideElement.querySelector('.slide-content');

        if (!slideContainer || !slideContent) return;

        // Temporarily make the slide visible to measure its content
        slideElement.style.position = 'relative';
        slideElement.style.opacity = '1';

        // Get the natural height of the content
        const contentHeight = slideContent.scrollHeight;
        const minHeight = Math.max(contentHeight + 40, 300); // Add padding, minimum 300px

        // Set the container height to accommodate the content
        slideContainer.style.minHeight = `${minHeight}px`;

        // Reset position
        slideElement.style.position = '';

        console.log(`Adjusted slide height to ${minHeight}px for slide content height ${contentHeight}px`);
    }


    // Flexible lesson initialization for different topics
    initializeLessonContent(topicData) {
        if (!topicData) {
            console.log('No topic data provided, using default lesson structure');
            return;
        }

        // This method can be extended to dynamically generate slides
        // based on topic data structure
        console.log('Initializing lesson for topic:', topicData.name || 'Unknown');

        // Update navigation indicators based on actual slide count
        this.updateSlideIndicators();
    }

    updateSlideIndicators() {
        const indicatorContainer = document.querySelector('.slide-indicators');
        if (!indicatorContainer) return;

        // Clear existing indicators
        indicatorContainer.innerHTML = '';

        // Create indicators for each slide
        for (let i = 0; i < this.totalSlides; i++) {
            const indicator = document.createElement('span');
            indicator.className = 'indicator';
            indicator.setAttribute('data-slide', i);
            if (i === this.currentSlide) {
                indicator.classList.add('active');
            }
            indicatorContainer.appendChild(indicator);
        }
    }

    // Load Creator Studio lessons from manifest and integrate into Learn section
    async loadCreatorStudioLessons() {
        try {
            console.log('Loading Creator Studio lessons...');
            const response = await fetch('/api/lessons');

            if (!response.ok) {
                // Fallback to direct manifest file
                const manifestResponse = await fetch('lessons/manifest.json');
                if (!manifestResponse.ok) {
                    console.warn('Could not load lessons manifest');
                    return;
                }
                const manifest = await manifestResponse.json();
                this.integrateLessonsIntoLearnSection(manifest);
            } else {
                const manifest = await response.json();
                this.integrateLessonsIntoLearnSection(manifest);
            }
        } catch (error) {
            console.warn('Error loading Creator Studio lessons:', error);
        }
    }

    integrateLessonsIntoLearnSection(manifest) {
        if (!manifest || !manifest.lessons) return;

        console.log('Integrating lessons into Learn section:', manifest);

        // Group lessons by domain
        const lessonsByDomain = {};
        Object.values(manifest.lessons).forEach(lesson => {
            if (!lessonsByDomain[lesson.domain_id]) {
                lessonsByDomain[lesson.domain_id] = {
                    title: lesson.domain_title,
                    lessons: []
                };
            }
            lessonsByDomain[lesson.domain_id].lessons.push(lesson);
        });

        // Update skill cards with actual lessons
        this.updateSkillCardsWithLessons(lessonsByDomain);
    }

    updateSkillCardsWithLessons(lessonsByDomain) {
        const skillsGrid = document.querySelector('.skills-grid');
        if (!skillsGrid) return;

        // Update Information and Ideas card (remove "coming soon")
        if (lessonsByDomain['information_and_ideas']) {
            console.log('Updating Information and Ideas card');
            // Find the specific Information and Ideas card
            const allCards = skillsGrid.querySelectorAll('.skill-card.coming-soon');
            console.log('Found coming-soon cards:', allCards.length);
            let infoIdeasCard = null;
            allCards.forEach(card => {
                const title = card.querySelector('h3')?.textContent;
                console.log('Checking card title:', title);
                if (title && title.includes('Information') && title.includes('Ideas')) {
                    console.log('Found Information and Ideas card');
                    infoIdeasCard = card;
                }
            });

            if (infoIdeasCard) {
                console.log('Activating Information and Ideas card');
                infoIdeasCard.classList.remove('coming-soon');
                infoIdeasCard.classList.add('clickable');
                infoIdeasCard.dataset.skill = 'information_and_ideas';

                const badge = infoIdeasCard.querySelector('.skill-badge');
                if (badge) badge.textContent = 'Active';

                const progressText = infoIdeasCard.querySelector('.progress-text');
                if (progressText) progressText.textContent = 'Start Learning';

                const lessonCount = lessonsByDomain['information_and_ideas'].lessons.length;
                const meta = infoIdeasCard.querySelector('.skill-meta .questions');
                if (meta) meta.textContent = `📝 ${lessonCount} lessons`;
            }
        }

        // Add new skill cards for other domains
        Object.entries(lessonsByDomain).forEach(([domainId, domain]) => {
            if (domainId !== 'information_and_ideas' && domainId !== 'craft_and_structure') {
                this.addSkillCard(skillsGrid, domainId, domain);
            }
        });
    }

    addSkillCard(skillsGrid, domainId, domain) {
        const lessonCount = domain.lessons.length;
        const skillCard = document.createElement('div');
        skillCard.className = 'skill-card clickable';
        skillCard.dataset.skill = domainId;

        skillCard.innerHTML = `
            <div class="skill-header">
                <div class="skill-icon">📚</div>
                <div class="skill-badge">Active</div>
            </div>
            <h3>${domain.title}</h3>
            <p>Interactive lessons created in Creator Studio</p>
            <div class="skill-meta">
                <span class="duration">⏱️ Variable duration</span>
                <span class="questions">📝 ${lessonCount} lessons</span>
            </div>
            <div class="skill-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: 0%"></div>
                </div>
                <span class="progress-text">Start Learning</span>
            </div>
        `;

        skillsGrid.appendChild(skillCard);
    }

    isCreatorStudioDomain(skillId) {
        // Creator Studio domains we know about (with underscores as in manifest)
        const creatorStudioDomains = ['information_and_ideas', 'expression_of_ideas', 'craft_and_structure', 'standard_english_conventions'];
        return creatorStudioDomains.includes(skillId);
    }

    async loadCreatorStudioDomainLessons(domainId) {
        try {
            // Load the lessons manifest to get lessons for this domain
            const manifestResponse = await fetch('lessons/manifest.json');
            if (!manifestResponse.ok) {
                console.error('Could not load lessons manifest');
                return false;
            }

            const manifest = await manifestResponse.json();
            const domainLessons = Object.values(manifest.lessons).filter(
                lesson => lesson.domain_id === domainId
            );

            if (domainLessons.length === 0) {
                console.error('No lessons found for domain:', domainId);
                return false;
            }

            // Create a domain overview lesson that lists all available lessons
            this.createDomainOverviewLesson(domainLessons);
            return true;

        } catch (error) {
            console.error('Error loading Creator Studio domain lessons:', error);
            return false;
        }
    }

    createDomainOverviewLesson(lessons) {
        const domainTitle = lessons[0].domain_title;

        // Create slides container content
        const slidesHTML = `
            <div class="lesson-slide active" data-slide="0">
                <div class="slide-content centered">
                    <div class="slide-icon">📚</div>
                    <h3>${domainTitle} Lessons</h3>
                    <p>Choose a lesson to begin learning:</p>
                    <div class="lesson-selection-grid">
                        ${lessons.map(lesson => `
                            <div class="lesson-option" onclick="window.satApp.learnPage.loadSpecificLesson('${lesson.filepath}')">
                                <div class="lesson-icon">📖</div>
                                <h4>${lesson.title}</h4>
                                <p>${lesson.skill_title}</p>
                                <div class="lesson-meta">
                                    <span>📊 ${lesson.slide_count} slides</span>
                                    <span>🎯 ${lesson.learning_objectives_count} objectives</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        // Update the lesson slides container
        const slideContainer = document.querySelector('.lesson-slides');
        if (slideContainer) {
            slideContainer.innerHTML = slidesHTML;
        }
    }

    async loadSpecificLesson(filepath) {
        try {
            console.log('Loading specific lesson:', filepath);
            const response = await fetch(filepath);
            if (!response.ok) {
                console.error('Failed to load lesson file:', filepath);
                return;
            }

            const lessonData = await response.json();
            this.renderCreatorStudioLesson(lessonData);

        } catch (error) {
            console.error('Error loading specific lesson:', error);
        }
    }

    renderCreatorStudioLesson(lessonData) {
        // Convert Creator Studio lesson format to slides
        const slidesHTML = lessonData.slides.map((slide, index) => {
            const isActive = index === 0 ? 'active' : '';
            return `
                <div class="lesson-slide ${isActive}" data-slide="${index}">
                    <div class="slide-content centered">
                        <div class="slide-icon">${slide.icon || '📖'}</div>
                        <h3>${slide.title}</h3>
                        ${this.renderSlideContent(slide)}
                    </div>
                </div>
            `;
        }).join('');

        // Update the lesson slides container
        const slideContainer = document.querySelector('.lesson-slides');
        if (slideContainer) {
            slideContainer.innerHTML = slidesHTML;
        }

        // Update total slides count
        this.totalSlides = lessonData.slides.length;
        this.currentSlide = 0;
        this.updateProgress();
    }

    renderSlideContent(slide) {
        let contentHTML = '';

        if (slide.content) {
            if (slide.content.points) {
                contentHTML += `<ul class="slide-points">
                    ${slide.content.points.map(point => `<li>${point}</li>`).join('')}
                </ul>`;
            }

            if (slide.content.steps) {
                contentHTML += `<ol class="slide-steps">
                    ${slide.content.steps.map(step => `<li>${step}</li>`).join('')}
                </ol>`;
            }

            if (slide.content.explanation) {
                contentHTML += `<p class="slide-explanation">${slide.content.explanation}</p>`;
            }

            if (slide.content.question) {
                contentHTML += `<div class="practice-question">
                    <p>${slide.content.question}</p>
                    ${slide.content.choices ? `
                        <div class="choices-preview">
                            ${slide.content.choices.map((choice, i) =>
                                `${String.fromCharCode(65 + i)}) ${choice}`
                            ).join('<br>')}
                        </div>
                    ` : ''}
                </div>`;
            }
        }

        return contentHTML;
    }
}

// Enhanced toast styles (if not already present)
if (!document.querySelector('style[data-learn-toasts]')) {
    const toastStyles = document.createElement('style');
    toastStyles.setAttribute('data-learn-toasts', 'true');
    toastStyles.textContent = `
        .toast {
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            padding: 1rem;
            min-width: 300px;
            transform: translateX(400px);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            z-index: 1000;
            border-left: 4px solid var(--success-color);
        }

        .toast.show {
            transform: translateX(0);
        }

        .toast-content {
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }

        .toast-icon {
            font-size: 1.5rem;
        }

        .toast-message {
            font-weight: 500;
            color: var(--text-primary);
        }

        .toast.toast-success {
            border-left-color: var(--success-color);
        }

        @media (max-width: 768px) {
            .toast {
                right: 10px;
                left: 10px;
                min-width: auto;
                transform: translateY(-100px);
            }

            .toast.show {
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(toastStyles);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait for main app to be available
    const initLearnPage = () => {
        if (window.satApp) {
            window.satApp.learnPage = new LearnPage(window.satApp);
            // Load saved progress
            window.satApp.learnPage.loadSkillProgress();
        } else {
            setTimeout(initLearnPage, 100);
        }
    };
    initLearnPage();
});