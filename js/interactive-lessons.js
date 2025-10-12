/**
 * Interactive Lessons System
 * Maps skills to lessons and renders them using automation directory approach
 */

class InteractiveLessons {
    constructor() {
        this.lessons = {};
        this.currentLesson = null;
        this.currentSlideIndex = 0;

        this.init();
    }

    async init() {
        console.log('[Interactive Lessons] Initializing...');

        // Load lesson manifest
        await this.loadLessonManifest();

        // Set up page visibility handler
        this.setupPageHandler();
    }

    async loadLessonManifest() {
        try {
            const response = await fetch('lessons/manifest.json?v=' + Date.now());
            if (!response.ok) throw new Error('Failed to load lesson manifest');

            const data = await response.json();
            this.lessons = data.lessons;

            console.log('[Interactive Lessons] Loaded lessons:', this.lessons);
        } catch (error) {
            console.error('[Interactive Lessons] Error loading manifest:', error);
        }
    }

    setupPageHandler() {
        // Listen for page navigation events
        document.addEventListener('click', (e) => {
            const link = e.target.closest('[data-page="interactive-lessons"]');
            if (link) {
                // Small delay to ensure page is shown
                setTimeout(() => this.renderSkillsGrid(), 100);
            }
        });

        // Also render if page is already active
        if (document.querySelector('#interactive-lessonsPage:not(.hidden)')) {
            this.renderSkillsGrid();
        }
    }

    renderSkillsGrid() {
        const grid = document.getElementById('interactiveLessonsGrid');
        if (!grid || !this.lessons) return;

        console.log('[Interactive Lessons] Rendering skills grid...');

        // Map lessons to skills
        const skillLessons = Object.values(this.lessons).map(lesson => ({
            skill: lesson.skill_codes[0], // Primary skill code
            title: lesson.title,
            subtitle: lesson.subtitle,
            duration: lesson.duration,
            level: lesson.level,
            lessonId: lesson.id,
            domain: lesson.domain_title,
            displayOrder: lesson.display_order || 999
        }));

        // Sort by display_order for custom ordering
        skillLessons.sort((a, b) => a.displayOrder - b.displayOrder);

        // Create HTML for skill cards
        grid.innerHTML = skillLessons.map(lesson => `
            <div class="skill-lesson-card" data-skill="${lesson.skill}" data-lesson-id="${lesson.lessonId}">
                <div class="skill-header">
                    <div class="skill-badge">${lesson.skill}</div>
                    <div class="skill-level">${lesson.level}</div>
                </div>
                <h3 class="skill-title">${lesson.title}</h3>
                <p class="skill-subtitle">${lesson.subtitle}</p>
                <div class="skill-meta">
                    <span class="skill-domain">📚 ${lesson.domain}</span>
                    <span class="skill-duration">⏱️ ${lesson.duration}</span>
                </div>
                <button class="btn start-lesson-btn" onclick="window.interactiveLessons.startLesson('${lesson.lessonId}', '${lesson.skill}')">
                    Start Lesson
                </button>
            </div>
        `).join('');

        console.log('[Interactive Lessons] Rendered', skillLessons.length, 'skill cards');
    }

    async startLesson(lessonId, skillCode) {
        console.log('[Interactive Lessons] Starting lesson:', lessonId, 'for skill:', skillCode);

        try {
            // Load lesson content
            const lesson = this.lessons[lessonId];
            if (!lesson) throw new Error(`Lesson ${lessonId} not found in manifest`);

            const response = await fetch(lesson.filepath + '?v=' + Date.now());
            if (!response.ok) throw new Error(`Failed to load lesson file: ${lesson.filepath}`);

            const lessonData = await response.json();
            console.log('[Interactive Lessons] Loaded lesson data:', lessonData);

            // Validate lesson data
            if (!lessonData.slides || !lessonData.slides.length) {
                throw new Error('Lesson data is missing slides');
            }

            // Store for navigation
            this.currentLesson = lessonData;
            this.currentSlideIndex = 0;
            this.currentSkillCode = skillCode;

            console.log('[Interactive Lessons] Stored skill code:', this.currentSkillCode);

            // Show lesson player (automation directory style)
            this.showLessonPlayer(lessonData);

        } catch (error) {
            console.error('[Interactive Lessons] Error starting lesson:', error);
            alert(`Failed to load lesson: ${error.message}`);
        }
    }

    showLessonPlayer(lessonData) {
        // First show learning objectives intro
        this.showLearningObjectives(lessonData);
    }

    showLearningObjectives(lessonData) {
        // Create learning objectives intro modal
        const objectivesModal = document.createElement('div');
        objectivesModal.id = 'objectivesModal';
        objectivesModal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;

        objectivesModal.innerHTML = `
            <div style="
                background: white;
                border-radius: 16px;
                padding: 2rem;
                max-width: 600px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            ">
                <div style="text-align: center; margin-bottom: 2rem;">
                    <h2 style="color: #0369a1; margin-bottom: 0.5rem; font-size: 2rem;">${lessonData.title}</h2>
                    <p style="color: #64748b; margin: 0; font-size: 1.1rem;">${lessonData.subtitle}</p>
                    <div style="background: #f0f9ff; padding: 0.5rem 1rem; border-radius: 8px; margin-top: 1rem; display: inline-block;">
                        <span style="color: #0284c7; font-weight: 600;">${lessonData.level}</span> •
                        <span style="color: #0284c7;">${lessonData.duration}</span>
                    </div>
                </div>

                <div style="margin-bottom: 2rem;">
                    <h3 style="color: #1e293b; margin-bottom: 1rem; font-size: 1.3rem;">📚 Learning Objectives</h3>
                    <ul style="list-style: none; padding: 0; margin: 0;">
                        ${lessonData.learning_objectives.map(objective => `
                            <li style="
                                background: #f8fafc;
                                border: 1px solid #e2e8f0;
                                border-radius: 8px;
                                padding: 1rem;
                                margin-bottom: 0.75rem;
                                border-left: 4px solid #0369a1;
                            ">
                                ${objective}
                            </li>
                        `).join('')}
                    </ul>
                </div>

                <div style="text-align: center;">
                    <button id="startLessonBtn" style="
                        background: #0369a1;
                        color: white;
                        border: none;
                        padding: 1rem 2rem;
                        border-radius: 8px;
                        font-size: 1.1rem;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.2s;
                    " onmouseover="this.style.background='#025a85'" onmouseout="this.style.background='#0369a1'">
                        🚀 Start Lesson
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(objectivesModal);

        // Add click handler for start lesson button
        document.getElementById('startLessonBtn').addEventListener('click', () => {
            document.body.removeChild(objectivesModal);
            this.showActualLesson(lessonData);
        });
    }

    showActualLesson(lessonData) {
        // Create main lesson modal overlay (based on automation directory's simple.html)
        const modal = document.createElement('div');
        modal.id = 'lessonModal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        `;

        modal.innerHTML = `
            <div style="
                background: white;
                border-radius: 1rem;
                width: 90%;
                max-width: 800px;
                max-height: 90vh;
                overflow: hidden;
                display: flex;
                flex-direction: column;
            ">
                <div style="
                    padding: 1.5rem;
                    border-bottom: 1px solid #e2e8f0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                ">
                    <h2 style="margin: 0; color: #0369a1;">${lessonData.title}</h2>
                    <button id="closeLessonModal" style="
                        background: none;
                        border: none;
                        font-size: 1.5rem;
                        cursor: pointer;
                        padding: 0.5rem;
                        border-radius: 0.5rem;
                    ">&times;</button>
                </div>

                <div id="slideContent" style="
                    flex: 1;
                    padding: 2rem;
                    overflow-y: auto;
                ">
                    ${this.renderSlide(lessonData.slides[0])}
                </div>

                <div style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 2rem;
                    padding: 1.5rem;
                    border-top: 1px solid #e2e8f0;
                ">
                    <button id="prevBtn" style="
                        background: #e2e8f0;
                        color: #334155;
                        border: none;
                        padding: 0.75rem 1.5rem;
                        border-radius: 0.5rem;
                        cursor: pointer;
                        opacity: 0.5;
                    " disabled>Previous</button>

                    <span id="slideCounter">1 / ${lessonData.slides.length}</span>

                    <button id="nextBtn" style="
                        background: #0369a1;
                        color: white;
                        border: none;
                        padding: 0.75rem 1.5rem;
                        border-radius: 0.5rem;
                        cursor: pointer;
                    ">Next</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Set up navigation
        this.setupLessonNavigation(modal);

        // Prevent background scrolling
        document.body.style.overflow = 'hidden';
    }

    renderSlide(slide) {
        console.log('[Interactive Lessons] Rendering slide:', slide);

        // Use the generic lesson content renderer
        if (!window.lessonContentRenderer) {
            // Fallback if generic renderer is not available
            console.warn('[Interactive Lessons] Generic renderer not found, using fallback');
            if (!slide || !slide.content) {
                return '<div style="text-align: center; padding: 2rem;">Slide content not found</div>';
            }
            return `<div class="slide-fallback">${slide.content.heading || 'Slide content'}</div>`;
        }

        const renderedContent = window.lessonContentRenderer.renderSlideContent(slide);

        // Add practice transition button on concept reinforcement slides or last slide
        const isLastSlide = this.currentSlideIndex === this.currentLesson.slides.length - 1;
        console.log('[Interactive Lessons] Rendering slide, current skill code:', this.currentSkillCode, 'isLastSlide:', isLastSlide);

        let practiceTransitionHtml = '';
        const content = slide.content;

        // Check if slide has practice_transition interaction
        const hasPracticeTransition = slide.interactions && slide.interactions.some(i => i.type === 'practice_transition');

        if ((slide.type === 'concept_reinforcement' || hasPracticeTransition) && content && content.practice_transition) {
            // Use existing practice transition from content
            practiceTransitionHtml = `
                <div style="
                    background: #0369a1;
                    color: white;
                    padding: 1.5rem;
                    border-radius: 0.5rem;
                    margin-top: 2rem;
                    text-align: center;
                ">
                    <p style="margin-bottom: 1rem;">${content.practice_transition.text}</p>
                    <button id="practiceTransitionBtn" data-skill-code="${this.currentSkillCode}" style="
                        background: white;
                        color: #0369a1;
                        border: none;
                        padding: 0.75rem 1.5rem;
                        border-radius: 0.5rem;
                        cursor: pointer;
                        font-weight: 600;
                    ">
                        ${content.practice_transition.button_text}
                    </button>
                </div>
            `;
        } else if (hasPracticeTransition) {
            // Generate practice transition button from interactions
            const practiceInteraction = slide.interactions.find(i => i.type === 'practice_transition');
            practiceTransitionHtml = `
                <div style="
                    background: #0369a1;
                    color: white;
                    padding: 1.5rem;
                    border-radius: 0.5rem;
                    margin-top: 2rem;
                    text-align: center;
                ">
                    <p style="margin-bottom: 1rem;">Ready to practice what you've learned? Let's apply these skills with real SAT questions!</p>
                    <button id="practiceTransitionBtn" data-skill-code="${practiceInteraction.target_skill}" style="
                        background: white;
                        color: #0369a1;
                        border: none;
                        padding: 0.75rem 1.5rem;
                        border-radius: 0.5rem;
                        cursor: pointer;
                        font-weight: 600;
                    ">
                        Start Practice Questions
                    </button>
                </div>
            `;
        } else if (isLastSlide) {
            // Add practice transition to any last slide
            practiceTransitionHtml = `
                <div style="
                    background: #0369a1;
                    color: white;
                    padding: 1.5rem;
                    border-radius: 0.5rem;
                    margin-top: 2rem;
                    text-align: center;
                ">
                    <p style="margin-bottom: 1rem;">Ready to practice what you've learned? Let's apply these skills with real SAT questions!</p>
                    <button id="practiceTransitionBtn" data-skill-code="${this.currentSkillCode}" style="
                        background: white;
                        color: #0369a1;
                        border: none;
                        padding: 0.75rem 1.5rem;
                        border-radius: 0.5rem;
                        cursor: pointer;
                        font-weight: 600;
                    ">
                        Start Practice Questions
                    </button>
                </div>
            `;
        }

        return renderedContent + practiceTransitionHtml;
    }

    setupLessonNavigation(modal) {
        const closeBtn = modal.querySelector('#closeLessonModal');
        const prevBtn = modal.querySelector('#prevBtn');
        const nextBtn = modal.querySelector('#nextBtn');
        const slideContent = modal.querySelector('#slideContent');
        const slideCounter = modal.querySelector('#slideCounter');

        // Close modal
        closeBtn.addEventListener('click', () => this.closeLessonModal(modal));
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.closeLessonModal(modal);
        });

        // Navigation
        prevBtn.addEventListener('click', () => this.previousSlide(modal));
        nextBtn.addEventListener('click', () => this.nextSlide(modal));

        // Practice transition
        this.setupPracticeTransition(modal);

        // Update navigation state
        this.updateNavigationState(modal);
    }

    setupPracticeTransition(modal) {
        modal.addEventListener('click', (e) => {
            if (e.target.id === 'practiceTransitionBtn') {
                // Prevent multiple clicks
                if (e.target.disabled) return;
                e.target.disabled = true;
                e.target.textContent = 'Loading...';

                const skillCode = e.target.dataset.skillCode;
                console.log('[Interactive Lessons] Transitioning to practice for skill:', skillCode);

                // Close lesson modal
                this.closeLessonModal(modal);

                // Navigate to skill practice page first, then start practice
                if (window.skillPracticeUI && skillCode) {
                    // Navigate to skill practice page
                    if (window.app && window.app.showPage) {
                        console.log('[Interactive Lessons] Showing skill-practice page');
                        window.app.showPage('skill-practice');
                    }

                    // Wait longer for page to be visible and elements to be available
                    setTimeout(async () => {
                        console.log('[Interactive Lessons] Checking if skillPracticeUI is initialized:', window.skillPracticeUI.isInitialized);

                        // Check if skill practice page is visible
                        const skillPracticePage = document.getElementById('skill-practicePage');
                        console.log('[Interactive Lessons] Skill practice page visibility:', {
                            element: !!skillPracticePage,
                            hidden: skillPracticePage ? skillPracticePage.classList.contains('hidden') : 'N/A',
                            display: skillPracticePage ? window.getComputedStyle(skillPracticePage).display : 'N/A'
                        });

                        // Debug page navigation
                        if (skillPracticePage) {
                            console.log('[Interactive Lessons] Skill practice page debug:', {
                                hasActiveClass: skillPracticePage.classList.contains('active'),
                                computedDisplay: window.getComputedStyle(skillPracticePage).display,
                                classList: skillPracticePage.className
                            });

                            // If page doesn't have active class, ensure it gets it
                            if (!skillPracticePage.classList.contains('active')) {
                                console.log('[Interactive Lessons] Page missing active class, re-triggering navigation');
                                if (window.app && window.app.showPage) {
                                    window.app.showPage('skill-practice');
                                }

                                // Double-check after navigation
                                setTimeout(() => {
                                    if (!skillPracticePage.classList.contains('active')) {
                                        console.log('[Interactive Lessons] Navigation failed, manually adding active class');
                                        skillPracticePage.classList.add('active');
                                    }
                                }, 50);
                            }
                        }

                        // Ensure UI is initialized
                        if (!window.skillPracticeUI.isInitialized) {
                            console.log('[Interactive Lessons] Initializing skillPracticeUI...');
                            await window.skillPracticeUI.initialize();
                        }

                        // Check if elements exist
                        const practiceSessionView = document.getElementById('practiceSessionView');
                        const skillSelectionView = document.getElementById('skillSelectionView');
                        const questionPhase = document.getElementById('questionPhase');
                        console.log('[Interactive Lessons] Practice elements found:', {
                            practiceSessionView: !!practiceSessionView,
                            skillSelectionView: !!skillSelectionView,
                            questionPhase: !!questionPhase,
                            questionPhaseDisplay: questionPhase ? window.getComputedStyle(questionPhase).display : 'N/A'
                        });

                        console.log('[Interactive Lessons] Starting skill practice for:', skillCode);
                        window.skillPracticeUI.startSkillPractice(skillCode);
                    }, 500);
                } else {
                    console.error('[Interactive Lessons] Practice system not available:', {
                        skillPracticeUI: !!window.skillPracticeUI,
                        skillCode: skillCode
                    });
                    alert('Practice system not available or skill code missing');
                }
            }
        });
    }

    previousSlide(modal) {
        if (this.currentSlideIndex > 0) {
            this.currentSlideIndex--;
            this.updateSlideContent(modal);
        }
    }

    nextSlide(modal) {
        if (this.currentSlideIndex < this.currentLesson.slides.length - 1) {
            this.currentSlideIndex++;
            this.updateSlideContent(modal);
        }
    }

    updateSlideContent(modal) {
        const slideContent = modal.querySelector('#slideContent');
        const slide = this.currentLesson.slides[this.currentSlideIndex];

        slideContent.innerHTML = this.renderSlide(slide);
        this.updateNavigationState(modal);
        this.setupPracticeTransition(modal);
    }

    updateNavigationState(modal) {
        const prevBtn = modal.querySelector('#prevBtn');
        const nextBtn = modal.querySelector('#nextBtn');
        const slideCounter = modal.querySelector('#slideCounter');

        prevBtn.disabled = this.currentSlideIndex === 0;
        prevBtn.style.opacity = prevBtn.disabled ? '0.5' : '1';

        nextBtn.disabled = this.currentSlideIndex === this.currentLesson.slides.length - 1;
        nextBtn.style.opacity = nextBtn.disabled ? '0.5' : '1';

        slideCounter.textContent = `${this.currentSlideIndex + 1} / ${this.currentLesson.slides.length}`;
    }

    closeLessonModal(modal) {
        if (modal && modal.parentNode) {
            document.body.removeChild(modal);
        }
        document.body.style.overflow = '';

        this.currentLesson = null;
        this.currentSlideIndex = 0;
        this.currentSkillCode = null;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.interactiveLessons = new InteractiveLessons();
});