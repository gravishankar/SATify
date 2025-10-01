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
            domain: lesson.domain_title
        }));

        // Sort by skill code for consistent ordering
        skillLessons.sort((a, b) => a.skill.localeCompare(b.skill));

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
        // Create modal overlay (based on automation directory's simple.html)
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
                    <h2 style="margin: 0; color: #2563eb;">${lessonData.title}</h2>
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
                        background: #2563eb;
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
        // Based on automation directory's renderSlide function
        console.log('[Interactive Lessons] Rendering slide:', slide);

        if (!slide || !slide.content) {
            return '<div style="text-align: center; padding: 2rem;">Slide content not found</div>';
        }

        const content = slide.content;
        let html = `<div style="margin-bottom: 2rem;">`;

        // Always show slide content
        html += `<div style="text-align: center; margin-bottom: 1.5rem;">`;

        if (content.heading) {
            html += `<h3 style="color: #2563eb; margin-bottom: 1rem; font-size: 1.5rem;">${content.heading}</h3>`;
        }

        if (content.text) {
            html += `<p style="margin-bottom: 1.5rem; line-height: 1.6; color: #334155;">${content.text}</p>`;
        }

        if (content.subtitle) {
            html += `<p style="margin-bottom: 1rem; font-style: italic; color: #64748b;">${content.subtitle}</p>`;
        }

        html += `</div>`;

        if (content.bullet_points && content.bullet_points.length > 0) {
            html += `<div style="max-width: 600px; margin: 0 auto 1.5rem;">`;
            html += `<ul style="text-align: left; list-style-position: inside;">`;
            content.bullet_points.forEach(point => {
                html += `<li style="margin-bottom: 0.75rem; padding-left: 0.5rem;">${point}</li>`;
            });
            html += `</ul></div>`;
        }

        // Handle strategy steps (multiple formats)
        if (content.strategy_steps && content.strategy_steps.length > 0) {
            html += `<div style="max-width: 700px; margin: 0 auto;">`;
            content.strategy_steps.forEach((step, index) => {
                html += `
                    <div style="
                        background: white;
                        border: 1px solid #e2e8f0;
                        border-radius: 0.5rem;
                        padding: 1.5rem;
                        margin-bottom: 1rem;
                    ">`;

                // Handle different strategy step formats
                if (step.letter && step.word) {
                    // Old format
                    html += `<h5 style="color: #2563eb; margin-bottom: 0.5rem;">${step.letter}: ${step.word}</h5>`;
                } else if (step.step && step.title) {
                    // New format
                    html += `<h5 style="color: #2563eb; margin-bottom: 0.5rem;">Step ${step.step}: ${step.title}</h5>`;
                }

                if (step.description) {
                    html += `<p style="margin-bottom: 1rem;">${step.description}</p>`;
                }

                // Handle points array
                if (step.points && step.points.length > 0) {
                    html += `<ul style="margin: 0; padding-left: 1rem;">`;
                    step.points.forEach(point => {
                        html += `<li style="margin-bottom: 0.5rem;">${point}</li>`;
                    });
                    html += `</ul>`;
                }

                // Handle examples array
                if (step.examples && step.examples.length > 0) {
                    html += `<div style="background: #f8fafc; padding: 1rem; border-radius: 0.25rem; margin-top: 0.5rem;">`;
                    step.examples.forEach(example => {
                        html += `<p style="margin: 0.25rem 0; font-style: italic;">${example}</p>`;
                    });
                    html += `</div>`;
                }

                html += `</div>`;
            });
            html += `</div>`;
        }

        // Handle key_points
        if (content.key_points && content.key_points.length > 0) {
            html += `<div style="max-width: 600px; margin: 0 auto;">`;
            content.key_points.forEach(point => {
                html += `
                    <div style="
                        background: #f0f9ff;
                        border: 1px solid #0284c7;
                        border-radius: 0.5rem;
                        padding: 1rem;
                        margin-bottom: 1rem;
                    ">
                        <h6 style="color: #0284c7; margin-bottom: 0.5rem; font-weight: 600;">${point.title || point.icon + ' ' + point.title}</h6>
                        <p style="margin: 0; color: #334155;">${point.description}</p>
                    </div>
                `;
            });
            html += `</div>`;
        }

        // Handle categories (for transition types, etc.)
        if (content.categories) {
            html += `<div style="max-width: 700px; margin: 0 auto;">`;
            Object.keys(content.categories).forEach(category => {
                html += `
                    <div style="
                        background: white;
                        border: 1px solid #e2e8f0;
                        border-radius: 0.5rem;
                        padding: 1rem;
                        margin-bottom: 1rem;
                    ">
                        <h6 style="color: #2563eb; margin-bottom: 0.5rem; font-weight: 600;">${category}</h6>
                        <p style="margin: 0; color: #64748b;">${content.categories[category].join(', ')}</p>
                    </div>
                `;
            });
            html += `</div>`;
        }

        // Handle table structure (for strategy synthesis, etc.)
        if (content.table && content.table.rows) {
            html += `<div style="max-width: 800px; margin: 0 auto;">`;
            html += `<div style="overflow-x: auto;">`;
            html += `<table style="width: 100%; border-collapse: collapse; background: white; border: 1px solid #e2e8f0; border-radius: 0.5rem;">`;

            // Table header
            if (content.table.columns) {
                html += `<thead><tr>`;
                content.table.columns.forEach(column => {
                    html += `<th style="padding: 1rem; border-bottom: 2px solid #e2e8f0; background: #f8fafc; font-weight: 600; color: #2563eb;">${column}</th>`;
                });
                html += `</tr></thead>`;
            }

            // Table body
            html += `<tbody>`;
            content.table.rows.forEach((row, index) => {
                html += `<tr style="${index % 2 === 0 ? 'background: white;' : 'background: #f8fafc;'}">`;
                row.forEach(cell => {
                    html += `<td style="padding: 1rem; border-bottom: 1px solid #e2e8f0; vertical-align: top;">${cell}</td>`;
                });
                html += `</tr>`;
            });
            html += `</tbody></table></div></div>`;
        }

        // Handle examples object
        if (content.examples && typeof content.examples === 'object') {
            html += `<div style="max-width: 600px; margin: 0 auto;">`;
            Object.keys(content.examples).forEach(key => {
                html += `
                    <div style="
                        background: #f0f9ff;
                        border-left: 4px solid #0284c7;
                        padding: 1rem;
                        margin-bottom: 1rem;
                    ">
                        <h6 style="color: #0284c7; margin-bottom: 0.5rem; font-weight: 600; text-transform: capitalize;">${key.replace('_', ' ')}</h6>
                        <p style="margin: 0; color: #334155;">${content.examples[key]}</p>
                    </div>
                `;
            });
            html += `</div>`;
        }

        // Add practice transition button on concept reinforcement slides or last slide
        const isLastSlide = this.currentSlideIndex === this.currentLesson.slides.length - 1;
        console.log('[Interactive Lessons] Rendering slide, current skill code:', this.currentSkillCode, 'isLastSlide:', isLastSlide);

        if (slide.type === 'concept_reinforcement' && content.practice_transition) {
            // Use existing practice transition
            html += `
                <div style="
                    background: #2563eb;
                    color: white;
                    padding: 1.5rem;
                    border-radius: 0.5rem;
                    margin-top: 2rem;
                    text-align: center;
                ">
                    <p style="margin-bottom: 1rem;">${content.practice_transition.text}</p>
                    <button id="practiceTransitionBtn" data-skill-code="${this.currentSkillCode}" style="
                        background: white;
                        color: #2563eb;
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
        } else if (isLastSlide) {
            // Add practice transition to any last slide
            html += `
                <div style="
                    background: #2563eb;
                    color: white;
                    padding: 1.5rem;
                    border-radius: 0.5rem;
                    margin-top: 2rem;
                    text-align: center;
                ">
                    <p style="margin-bottom: 1rem;">Ready to practice what you've learned? Let's apply these skills with real SAT questions!</p>
                    <button id="practiceTransitionBtn" data-skill-code="${this.currentSkillCode}" style="
                        background: white;
                        color: #2563eb;
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

        html += `</div>`;
        return html;
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