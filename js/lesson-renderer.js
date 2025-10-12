/**
 * Modern Lesson Renderer - Supporting rich interactive lesson format
 * Handles new lesson structure with advanced interactions
 */

class LessonRenderer {
    constructor(containerSelector) {
        this.container = document.querySelector(containerSelector);
        this.currentLesson = null;
        this.currentSlideIndex = 0;
        this.interactions = new Map();
        this.progressData = {
            completedSlides: new Set(),
            totalSlides: 0,
            startTime: null,
            slideStartTime: null
        };

        this.init();
    }

    init() {
        this.setupContainer();
        this.bindEvents();
    }

    setupContainer() {
        if (!this.container) {
            console.error('Lesson container not found');
            return;
        }

        this.container.innerHTML = `
            <div class="lesson-wrapper">
                <div class="lesson-header">
                    <div class="lesson-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" id="lessonProgressFill"></div>
                        </div>
                        <span class="progress-text" id="lessonProgressText">0 / 0</span>
                    </div>
                    <button class="btn btn-secondary lesson-exit" id="lessonExitBtn">Exit Lesson</button>
                </div>
                <div class="lesson-content" id="lessonContent">
                    <!-- Lesson slides will be rendered here -->
                </div>
                <div class="lesson-navigation">
                    <button class="btn btn-secondary" id="prevSlideBtn" disabled>Previous</button>
                    <button class="btn btn-primary" id="nextSlideBtn" disabled>Next</button>
                </div>
            </div>
        `;
    }

    bindEvents() {
        const prevBtn = document.getElementById('prevSlideBtn');
        const nextBtn = document.getElementById('nextSlideBtn');
        const exitBtn = document.getElementById('lessonExitBtn');

        if (prevBtn) prevBtn.addEventListener('click', () => this.previousSlide());
        if (nextBtn) nextBtn.addEventListener('click', () => this.nextSlide());
        if (exitBtn) exitBtn.addEventListener('click', () => this.exitLesson());
    }

    async loadLesson(lessonData) {
        try {
            this.currentLesson = lessonData;
            this.currentSlideIndex = 0;
            this.progressData.totalSlides = lessonData.slides?.length || 0;
            this.progressData.startTime = Date.now();
            this.progressData.completedSlides.clear();

            await this.renderCurrentSlide();
            this.updateProgress();
            this.updateNavigation();

            console.log(`Loaded lesson: ${lessonData.title}`);
        } catch (error) {
            console.error('Error loading lesson:', error);
            this.showError('Failed to load lesson. Please try again.');
        }
    }

    async renderCurrentSlide() {
        if (!this.currentLesson || !this.currentLesson.slides) {
            this.showError('No lesson data available');
            return;
        }

        const slide = this.currentLesson.slides[this.currentSlideIndex];
        if (!slide) {
            this.showError('Slide not found');
            return;
        }

        this.progressData.slideStartTime = Date.now();
        const content = document.getElementById('lessonContent');

        try {
            const slideHtml = await this.renderSlide(slide);
            content.innerHTML = slideHtml;

            // Setup interactions for this slide
            await this.setupSlideInteractions(slide);

            // Mark slide as viewed
            this.progressData.completedSlides.add(this.currentSlideIndex);

        } catch (error) {
            console.error('Error rendering slide:', error);
            this.showError('Failed to render slide content');
        }
    }

    async renderSlide(slide) {
        const slideClass = `lesson-slide slide-${slide.type}`;
        let html = `<div class="${slideClass}" data-slide-id="${slide.id}">`;

        // Slide header
        html += `
            <div class="slide-header">
                <h2 class="slide-title">${slide.title}</h2>
                ${slide.duration_estimate ? `<span class="duration-badge">${Math.ceil(slide.duration_estimate / 60)} min</span>` : ''}
            </div>
        `;

        // Slide content based on type
        switch (slide.type) {
            case 'introduction':
                html += this.renderIntroductionSlide(slide);
                break;
            case 'concept_teaching':
                html += this.renderConceptSlide(slide);
                break;
            case 'strategy_teaching':
                html += this.renderStrategySlide(slide);
                break;
            case 'guided_example':
                html += this.renderGuidedExampleSlide(slide);
                break;
            case 'guided_practice':
                html += this.renderGuidedPracticeSlide(slide);
                break;
            case 'independent_practice':
                html += this.renderIndependentPracticeSlide(slide);
                break;
            case 'skill_application':
                html += this.renderSkillApplicationSlide(slide);
                break;
            case 'concept_reinforcement':
                html += this.renderConceptReinforcementSlide(slide);
                break;
            case 'mastery_check':
                html += this.renderMasteryCheckSlide(slide);
                break;
            case 'quick_check':
                html += this.renderQuickCheckSlide(slide);
                break;
            case 'common_traps':
                html += this.renderTrapsSlide(slide);
                break;
            case 'wrap_up':
                html += this.renderWrapUpSlide(slide);
                break;
            default:
                html += this.renderGenericSlide(slide);
        }

        html += '</div>';
        return html;
    }

    renderIntroductionSlide(slide) {
        const content = slide.content;
        let html = `<div class="slide-content introduction-content">`;

        if (content.heading) {
            html += `<h3 class="content-heading">${content.heading}</h3>`;
        }

        if (content.text) {
            html += `<p class="content-text">${content.text}</p>`;
        }

        if (content.bullet_points && content.bullet_points.length > 0) {
            html += '<ul class="objective-list">';
            content.bullet_points.forEach(point => {
                html += `<li>${point}</li>`;
            });
            html += '</ul>';
        }

        if (content.visual_element && content.visual_element.type === 'progress_indicator') {
            const ve = content.visual_element;
            html += `
                <div class="lesson-overview">
                    <div class="overview-item">
                        <span class="overview-label">Total Slides:</span>
                        <span class="overview-value">${ve.total_slides}</span>
                    </div>
                    <div class="overview-item">
                        <span class="overview-label">Estimated Time:</span>
                        <span class="overview-value">${ve.estimated_time}</span>
                    </div>
                </div>
            `;
        }

        html += '</div>';
        return html;
    }

    renderConceptSlide(slide) {
        const content = slide.content;
        let html = `<div class="slide-content concept-content">`;

        if (content.heading) {
            html += `<h3 class="content-heading">${content.heading}</h3>`;
        }

        if (content.text) {
            html += `<p class="content-text">${content.text}</p>`;
        }

        if (content.concept_box) {
            const box = content.concept_box;
            html += `
                <div class="concept-box">
                    <h4 class="concept-title">${box.title}</h4>
            `;
            if (box.points) {
                html += '<ul class="concept-points">';
                box.points.forEach(point => {
                    html += `<li>${point}</li>`;
                });
                html += '</ul>';
            }
            html += '</div>';
        }

        if (content.examples) {
            html += '<div class="examples-section">';
            Object.entries(content.examples).forEach(([key, value]) => {
                const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                html += `
                    <div class="example-item">
                        <strong>${label}:</strong> ${value}
                    </div>
                `;
            });
            html += '</div>';
        }

        html += '</div>';
        return html;
    }

    renderStrategySlide(slide) {
        const content = slide.content;
        let html = `<div class="slide-content strategy-content">`;

        if (content.heading) {
            html += `<h3 class="content-heading">${content.heading}</h3>`;
        }

        if (content.subtitle) {
            html += `<h4 class="content-subtitle">${content.subtitle}</h4>`;
        }

        if (content.strategy_steps) {
            html += '<div class="strategy-steps">';
            content.strategy_steps.forEach((step, index) => {
                html += `
                    <div class="strategy-step" data-step="${step.step}">
                        <div class="step-number">${step.step}</div>
                        <div class="step-content">
                            <h4 class="step-title">${step.title}</h4>
                            <p class="step-description">${step.description}</p>
                            ${step.example ? `<div class="step-example">${step.example}</div>` : ''}
                        </div>
                    </div>
                `;
            });
            html += '</div>';
        }

        if (content.memory_aid) {
            html += `
                <div class="memory-aid">
                    <strong>💡 Memory Aid:</strong> ${content.memory_aid}
                </div>
            `;
        }

        if (content.key_insight) {
            html += `<div class="key-insight">${content.key_insight}</div>`;
        }

        // Render worked_example if present (with interactivity enabled)
        if (content.worked_example) {
            html += this.renderWorkedExample(content.worked_example, true); // true = interactive
        }

        html += '</div>';
        return html;
    }

    renderGuidedExampleSlide(slide) {
        const content = slide.content;
        let html = `<div class="slide-content guided-example-content">`;

        if (content.heading) {
            html += `<h3 class="content-heading">${content.heading}</h3>`;
        }

        if (content.passage) {
            html += `
                <div class="passage-container">
                    <div class="passage-text" ${content.passage.highlight_enabled ? 'data-highlight="enabled"' : ''}>
                        ${content.passage.text}
                    </div>
                </div>
            `;
        }

        if (content.guided_questions) {
            html += '<div class="guided-questions">';
            content.guided_questions.forEach((question, index) => {
                html += `
                    <div class="guided-question" data-step="${question.step}" data-question-index="${index}">
                        <div class="question-header">
                            <span class="question-step">Step ${question.step}</span>
                            <h4 class="question-text">${question.question}</h4>
                        </div>
                        ${question.hint ? `<div class="question-hint" id="hint-${index}">💡 ${question.hint}</div>` : ''}
                        <div class="question-answer" id="answer-${index}" style="display: none;">
                            <strong>Answer:</strong> ${question.answer}
                            ${question.explanation ? `<p class="answer-explanation">${question.explanation}</p>` : ''}
                        </div>
                        <button class="btn btn-outline reveal-answer-btn" data-target="answer-${index}">Show Answer</button>
                    </div>
                `;
            });
            html += '</div>';
        }

        html += '</div>';
        return html;
    }

    renderGuidedPracticeSlide(slide) {
        const content = slide.content;
        let html = `<div class="slide-content guided-practice-content">`;

        if (content.heading) {
            html += `<h3 class="content-heading">${content.heading}</h3>`;
        }

        if (content.instructions) {
            html += `<div class="instructions">${content.instructions}</div>`;
        }

        // Render worked_example if present
        if (content.worked_example) {
            html += this.renderWorkedExample(content.worked_example, false); // false = non-interactive
        }

        html += '</div>';
        return html;
    }

    renderWorkedExample(workedExample, interactive = true) {
        let html = '<div class="worked-example-container">';

        // Render passage/text if present
        if (workedExample.text) {
            html += `
                <div class="passage-container">
                    <div class="passage-text">${workedExample.text}</div>
                </div>
            `;
        }

        // Render question
        if (workedExample.question) {
            html += `<div class="question-text">${workedExample.question}</div>`;
        }

        // Render answer choices
        if (workedExample.choices) {
            html += '<div class="answer-choices' + (interactive ? '' : ' non-interactive') + '">';

            Object.entries(workedExample.choices).forEach(([key, choice]) => {
                const choiceText = typeof choice === 'string' ? choice : choice.text;
                const category = choice.category || '';
                const flaw = choice.flaw || '';
                const validation = choice.validation || '';

                html += `
                    <div class="choice-item ${interactive ? 'interactive' : 'display-only'}" data-choice="${key}">
                        <span class="choice-letter">${key}</span>
                        <span class="choice-text">${choiceText}</span>
                `;

                // Show analysis if provided and in interactive mode
                if (interactive && (category || flaw || validation)) {
                    html += '<div class="choice-analysis" style="display: none;">';
                    if (category) html += `<div class="choice-category"><strong>Category:</strong> ${category}</div>`;
                    if (flaw) html += `<div class="choice-flaw"><strong>Flaw:</strong> ${flaw}</div>`;
                    if (validation) html += `<div class="choice-validation">${validation}</div>`;
                    html += '</div>';
                }

                html += '</div>';
            });
            html += '</div>';
        }

        html += '</div>';
        return html;
    }

    renderTrapsSlide(slide) {
        const content = slide.content;
        let html = `<div class="slide-content traps-content">`;

        if (content.heading) {
            html += `<h3 class="content-heading">${content.heading}</h3>`;
        }

        if (content.trap_examples) {
            html += '<div class="trap-examples">';
            content.trap_examples.forEach((trap, index) => {
                html += `
                    <div class="trap-example">
                        <h4 class="trap-type">${trap.trap_type}</h4>
                        <p class="trap-description">${trap.description}</p>
                        ${trap.example ? `<div class="trap-example-text">${trap.example}</div>` : ''}
                    </div>
                `;
            });
            html += '</div>';
        }

        html += '</div>';
        return html;
    }

    renderWrapUpSlide(slide) {
        const content = slide.content;
        let html = `<div class="slide-content wrap-up-content">`;

        if (content.heading) {
            html += `<h3 class="content-heading">${content.heading}</h3>`;
        }

        if (content.summary_points) {
            html += '<ul class="summary-points">';
            content.summary_points.forEach(point => {
                html += `<li>${point}</li>`;
            });
            html += '</ul>';
        }

        if (content.next_steps) {
            html += '<div class="next-steps">';
            if (content.next_steps.practice_suggestion) {
                html += `<p class="practice-suggestion">${content.next_steps.practice_suggestion}</p>`;
            }
            if (content.next_steps.confidence_builder) {
                html += `<p class="confidence-builder">${content.next_steps.confidence_builder}</p>`;
            }
            html += '</div>';
        }

        html += '</div>';
        return html;
    }

    renderIndependentPracticeSlide(slide) {
        const content = slide.content;
        let html = `<div class="slide-content practice-content">`;

        if (content.instructions) {
            html += `<div class="instructions">${content.instructions}</div>`;
        }

        if (content.passage) {
            html += `<div class="passage-text">${content.passage}</div>`;
        }

        if (content.question) {
            html += `<div class="practice-question">${content.question}</div>`;
        }

        if (content.strategy_tip) {
            html += `<div class="strategy-tip"><strong>Strategy Tip:</strong> ${content.strategy_tip}</div>`;
        }

        html += '</div>';
        return html;
    }

    renderSkillApplicationSlide(slide) {
        const content = slide.content;
        let html = `<div class="slide-content application-content">`;

        if (content.heading) {
            html += `<h3>${content.heading}</h3>`;
        }

        if (content.text) {
            html += `<p>${content.text}</p>`;
        }

        if (content.advanced_techniques) {
            html += '<div class="advanced-techniques">';
            content.advanced_techniques.forEach(technique => {
                html += `
                    <div class="technique-item">
                        <h4>${technique.technique}</h4>
                        <p>${technique.description}</p>
                        ${technique.example ? `<div class="example">${technique.example}</div>` : ''}
                    </div>
                `;
            });
            html += '</div>';
        }

        html += '</div>';
        return html;
    }

    renderConceptReinforcementSlide(slide) {
        const content = slide.content;
        let html = `<div class="slide-content reinforcement-content">`;

        if (content.heading) {
            html += `<h3>${content.heading}</h3>`;
        }

        if (content.key_points) {
            html += '<ul class="key-points">';
            content.key_points.forEach(point => {
                html += `<li>${point}</li>`;
            });
            html += '</ul>';
        }

        if (content.strategy_reminder) {
            html += `<div class="strategy-reminder"><strong>Strategy Reminder:</strong> ${content.strategy_reminder}</div>`;
        }

        if (content.expert_insight || content.college_board_insight || content.meltzer_tip) {
            const insight = content.expert_insight || content.college_board_insight || content.meltzer_tip;
            html += `<div class="expert-insight">${insight}</div>`;
        }

        if (content.practice_transition) {
            html += `
                <div class="practice-transition">
                    <p>${content.practice_transition.text}</p>
                    <button class="btn btn-primary practice-btn" data-skill-code="${content.practice_transition.skill_code}">
                        ${content.practice_transition.button_text}
                    </button>
                </div>
            `;
        }

        html += '</div>';
        return html;
    }

    renderMasteryCheckSlide(slide) {
        let html = `<div class="slide-content mastery-content">`;

        html += `<div class="question-text">${slide.question}</div>`;

        html += '<div class="answer-choices">';
        slide.options.forEach((option, index) => {
            const letter = String.fromCharCode(65 + index);
            html += `
                <div class="choice-item" data-choice="${letter}">
                    <span class="choice-letter">${letter}</span>
                    <span class="choice-text">${option}</span>
                </div>
            `;
        });
        html += '</div>';

        html += `
            <div class="question-actions">
                <button class="btn btn-primary submit-answer">Submit Answer</button>
            </div>
            <div class="explanation hidden">
                <h4>Explanation:</h4>
                <p>${slide.explanation}</p>
            </div>
        `;

        html += '</div>';
        return html;
    }

    renderQuickCheckSlide(slide) {
        return this.renderMasteryCheckSlide(slide);
    }

    renderGenericSlide(slide) {
        let html = `<div class="slide-content generic-content">`;
        if (slide.content && slide.content.text) {
            html += `<p>${slide.content.text}</p>`;
        }
        html += '</div>';
        return html;
    }

    async setupSlideInteractions(slide) {
        if (!slide.interactions) return;

        for (const interaction of slide.interactions) {
            switch (interaction.type) {
                case 'click_to_continue':
                    this.setupClickToContinue(interaction);
                    break;
                case 'reveal_on_click':
                    this.setupRevealOnClick(interaction);
                    break;
                case 'step_by_step_reveal':
                    this.setupStepByStepReveal(interaction);
                    break;
                case 'completion_celebration':
                    this.setupCompletionCelebration(interaction);
                    break;
                case 'interactive_elimination':
                    this.setupInteractiveElimination(interaction);
                    break;
            }
        }

        // Setup reveal answer buttons
        this.setupRevealAnswerButtons();

        // Setup practice transition buttons
        this.setupPracticeButtons();
    }

    setupClickToContinue(interaction) {
        const nextBtn = document.getElementById('nextSlideBtn');
        if (nextBtn && interaction.text) {
            nextBtn.textContent = interaction.text;
            nextBtn.disabled = false;
        }
    }

    setupRevealOnClick(interaction) {
        if (!interaction.elements) return;

        interaction.elements.forEach((element, index) => {
            const triggerId = `reveal-trigger-${index}`;
            const revealId = `reveal-content-${index}`;

            // Add trigger button to content
            const triggerBtn = document.createElement('button');
            triggerBtn.className = 'btn btn-outline reveal-trigger';
            triggerBtn.id = triggerId;
            triggerBtn.textContent = element.trigger;

            const revealDiv = document.createElement('div');
            revealDiv.className = 'reveal-content';
            revealDiv.id = revealId;
            revealDiv.style.display = 'none';
            revealDiv.innerHTML = element.reveal;

            const content = document.querySelector('.slide-content');
            content.appendChild(triggerBtn);
            content.appendChild(revealDiv);

            triggerBtn.addEventListener('click', () => {
                revealDiv.style.display = revealDiv.style.display === 'none' ? 'block' : 'none';
                triggerBtn.textContent = revealDiv.style.display === 'none' ? element.trigger : 'Hide';
            });
        });
    }

    setupStepByStepReveal(interaction) {
        const steps = document.querySelectorAll('.strategy-step');
        let currentStep = 0;

        // Hide all steps initially except the first
        steps.forEach((step, index) => {
            if (index > 0) {
                step.style.display = 'none';
            }
        });

        // Add reveal button
        if (steps.length > 1) {
            const revealBtn = document.createElement('button');
            revealBtn.className = 'btn btn-primary step-reveal-btn';
            revealBtn.textContent = 'Next Step';

            const content = document.querySelector('.slide-content');
            content.appendChild(revealBtn);

            revealBtn.addEventListener('click', () => {
                currentStep++;
                if (currentStep < steps.length) {
                    steps[currentStep].style.display = 'block';
                    steps[currentStep].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }

                if (currentStep >= steps.length - 1) {
                    revealBtn.style.display = 'none';
                    document.getElementById('nextSlideBtn').disabled = false;
                }
            });
        }
    }

    setupCompletionCelebration(interaction) {
        const content = document.querySelector('.slide-content');
        const celebration = document.createElement('div');
        celebration.className = 'completion-celebration';
        celebration.innerHTML = `
            <div class="celebration-content">
                <div class="celebration-emoji">🎉</div>
                <p class="celebration-text">${interaction.celebration_text}</p>
            </div>
        `;
        content.appendChild(celebration);
    }

    setupRevealAnswerButtons() {
        const revealBtns = document.querySelectorAll('.reveal-answer-btn');
        revealBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetId = btn.dataset.target;
                const target = document.getElementById(targetId);
                if (target) {
                    target.style.display = target.style.display === 'none' ? 'block' : 'none';
                    btn.textContent = target.style.display === 'none' ? 'Show Answer' : 'Hide Answer';
                }
            });
        });
    }

    setupPracticeButtons() {
        const practiceButtons = document.querySelectorAll('.practice-btn');
        practiceButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const skillCode = e.target.dataset.skillCode;
                if (skillCode) {
                    this.navigateToSkillPractice(skillCode);
                }
            });
        });
    }

    setupInteractiveElimination(interaction) {
        const choiceItems = document.querySelectorAll('.choice-item.interactive');
        const correctAnswer = interaction.correct_answer;

        choiceItems.forEach(item => {
            item.addEventListener('click', () => {
                const choiceKey = item.dataset.choice;
                const analysis = item.querySelector('.choice-analysis');

                // Toggle analysis visibility
                if (analysis) {
                    const isVisible = analysis.style.display !== 'none';
                    analysis.style.display = isVisible ? 'none' : 'block';
                }

                // Add visual feedback
                if (correctAnswer && choiceKey === correctAnswer) {
                    item.classList.add('correct-choice');
                } else {
                    item.classList.add('viewed-choice');
                }
            });

            // Add hover effect for interactive items
            item.style.cursor = 'pointer';
        });
    }

    navigateToSkillPractice(skillCode) {
        console.log('Navigating to skill practice for:', skillCode);

        // Track lesson completion
        if (window.satApp && window.satApp.analytics) {
            window.satApp.analytics.trackEvent('lesson_to_practice_transition', {
                skill: skillCode,
                lesson_id: this.currentLesson?.id,
                timestamp: new Date().toISOString()
            });
        }

        // Navigate to skill practice page
        if (window.satApp && window.satApp.showPage) {
            window.satApp.showPage('skill-practice');
        } else {
            // Fallback navigation
            const skillPracticeLink = document.querySelector('[data-page="skill-practice"]');
            if (skillPracticeLink) {
                skillPracticeLink.click();
            }
        }

        // Start skill practice session after navigation
        setTimeout(() => {
            if (window.skillPracticeUI) {
                window.skillPracticeUI.startSkillPractice(skillCode);
            }
        }, 100);
    }

    nextSlide() {
        if (this.currentSlideIndex < this.progressData.totalSlides - 1) {
            this.currentSlideIndex++;
            this.renderCurrentSlide();
            this.updateProgress();
            this.updateNavigation();
        } else {
            this.completeLesson();
        }
    }

    previousSlide() {
        if (this.currentSlideIndex > 0) {
            this.currentSlideIndex--;
            this.renderCurrentSlide();
            this.updateProgress();
            this.updateNavigation();
        }
    }

    updateProgress() {
        const progressFill = document.getElementById('lessonProgressFill');
        const progressText = document.getElementById('lessonProgressText');

        if (progressFill && progressText) {
            const progress = ((this.currentSlideIndex + 1) / this.progressData.totalSlides) * 100;
            progressFill.style.width = `${progress}%`;
            progressText.textContent = `${this.currentSlideIndex + 1} / ${this.progressData.totalSlides}`;
        }
    }

    updateNavigation() {
        const prevBtn = document.getElementById('prevSlideBtn');
        const nextBtn = document.getElementById('nextSlideBtn');

        if (prevBtn) {
            prevBtn.disabled = this.currentSlideIndex === 0;
        }

        if (nextBtn) {
            if (this.currentSlideIndex === this.progressData.totalSlides - 1) {
                nextBtn.textContent = 'Complete Lesson';
            } else {
                nextBtn.textContent = 'Next';
            }
            nextBtn.disabled = false;
        }
    }

    completeLesson() {
        const endTime = Date.now();
        const totalTime = endTime - this.progressData.startTime;

        console.log(`Lesson completed in ${Math.round(totalTime / 1000)} seconds`);

        // Trigger completion event
        this.container.dispatchEvent(new CustomEvent('lessonCompleted', {
            detail: {
                lessonId: this.currentLesson.id,
                completionTime: totalTime,
                slidesCompleted: this.progressData.completedSlides.size,
                totalSlides: this.progressData.totalSlides
            }
        }));

        this.showCompletionMessage();
    }

    showCompletionMessage() {
        const content = document.getElementById('lessonContent');
        content.innerHTML = `
            <div class="lesson-completion">
                <div class="completion-icon">🎉</div>
                <h2>Lesson Complete!</h2>
                <p>Great job completing "${this.currentLesson.title}"</p>
                <div class="completion-stats">
                    <div class="stat">
                        <span class="stat-value">${this.progressData.totalSlides}</span>
                        <span class="stat-label">Slides Completed</span>
                    </div>
                    <div class="stat">
                        <span class="stat-value">${Math.round((Date.now() - this.progressData.startTime) / 60000)}</span>
                        <span class="stat-label">Minutes</span>
                    </div>
                </div>
                <button class="btn btn-primary" onclick="window.location.reload()">Return to Lessons</button>
            </div>
        `;
    }

    exitLesson() {
        if (confirm('Are you sure you want to exit this lesson? Your progress will be saved.')) {
            window.location.reload();
        }
    }

    showError(message) {
        const content = document.getElementById('lessonContent') || this.container;
        content.innerHTML = `
            <div class="lesson-error">
                <div class="error-icon">⚠️</div>
                <h3>Error</h3>
                <p>${message}</p>
                <button class="btn btn-primary" onclick="window.location.reload()">Reload</button>
            </div>
        `;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LessonRenderer;
}