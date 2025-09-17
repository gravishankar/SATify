/**
 * Topic Loader - Dynamic slide generation from JSON
 * Enables content creators to manage lessons through JSON files
 */

class TopicLoader {
    constructor() {
        this.currentTopic = null;
        this.slideTemplates = this.initializeTemplates();
    }

    // Initialize slide rendering templates
    initializeTemplates() {
        return {
            'intro': this.renderIntroSlide.bind(this),
            'explanation': this.renderExplanationSlide.bind(this),
            'strategy': this.renderStrategySlide.bind(this),
            'example': this.renderExampleSlide.bind(this),
            'walkthrough': this.renderWalkthroughSlide.bind(this),
            'completion': this.renderCompletionSlide.bind(this)
        };
    }

    // Load topic from JSON file
    async loadTopic(topicId) {
        try {
            console.log(`Loading topic: ${topicId}`);
            const response = await fetch(`data/topics/${topicId}.json`);

            if (!response.ok) {
                throw new Error(`Failed to load topic ${topicId}: ${response.status}`);
            }

            this.currentTopic = await response.json();
            console.log(`Successfully loaded topic:`, this.currentTopic);
            return this.currentTopic;
        } catch (error) {
            console.error('Error loading topic:', error);
            this.showError(`Failed to load topic: ${error.message}`);
            return null;
        }
    }

    // Generate HTML for all slides
    generateSlidesHTML(topic) {
        if (!topic || !topic.slides) {
            console.error('Invalid topic data provided');
            return '';
        }

        let slidesHTML = '';

        topic.slides.forEach((slide, index) => {
            const isActive = index === 0 ? 'active' : '';
            const renderer = this.slideTemplates[slide.type];

            if (!renderer) {
                console.warn(`Unknown slide type: ${slide.type}`);
                return;
            }

            const slideContent = renderer(slide);

            slidesHTML += `
                <div class="lesson-slide ${isActive}" data-slide="${index}">
                    ${slideContent}
                </div>
            `;
        });

        return slidesHTML;
    }

    // Render intro slide
    renderIntroSlide(slide) {
        const { layout, title, content } = slide;

        if (layout === 'two-column') {
            return `
                <div class="slide-content two-column">
                    <div class="slide-left">
                        ${content.left.icon ? `<div class="slide-icon">${content.left.icon}</div>` : ''}
                        <h3>${title}</h3>
                        <p>${content.left.text}</p>
                    </div>
                    <div class="slide-right">
                        <div class="${content.right.type}">
                            ${content.right.title ? `<strong>${content.right.title}</strong> ` : ''}
                            ${content.right.text}
                        </div>
                    </div>
                </div>
            `;
        }

        return this.renderCenteredSlide(slide);
    }

    // Render explanation slide
    renderExplanationSlide(slide) {
        return this.renderIntroSlide(slide); // Same structure
    }

    // Render strategy steps slide
    renderStrategySlide(slide) {
        const { title, content } = slide;

        const stepsHTML = content.steps.map(step => `
            <div class="step">
                <span class="step-number">${step.number}</span>
                <span class="step-text">${step.text}</span>
            </div>
        `).join('');

        return `
            <div class="slide-content centered">
                ${content.icon ? `<div class="slide-icon">${content.icon}</div>` : ''}
                <h3>${title}</h3>
                <div class="strategy-steps">
                    ${stepsHTML}
                </div>
            </div>
        `;
    }

    // Render example question slide
    renderExampleSlide(slide) {
        const { layout, title, content } = slide;

        if (layout === 'two-column') {
            const choicesHTML = content.right.choices ?
                content.right.choices.map(choice => `${choice}<br>`).join('') : '';

            return `
                <div class="slide-content two-column">
                    <div class="slide-left">
                        ${content.left.icon ? `<div class="slide-icon">${content.left.icon}</div>` : ''}
                        <h3>${title}</h3>
                        <p>${content.left.text}</p>
                    </div>
                    <div class="slide-right">
                        <div class="practice-question">
                            <p>${content.right.question}</p>
                            <div class="choices-preview">
                                ${choicesHTML}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        return this.renderCenteredSlide(slide);
    }

    // Render walkthrough slide
    renderWalkthroughSlide(slide) {
        const { title, content } = slide;

        const stepsHTML = content.steps.map(step => {
            let stepHTML = `
                <div class="step-solution">
                    <span class="step-label">Step ${step.number}:</span> ${step.text}
            `;

            if (step.analysis) {
                stepHTML += `<div class="choice-analysis">`;
                step.analysis.forEach(analysis => {
                    const statusClass = analysis.status === 'correct' ? 'correct' : 'incorrect';
                    const icon = analysis.status === 'correct' ? '✓' : '✗';
                    stepHTML += `
                        <div class="${statusClass}">
                            ${icon} <strong>${analysis.choice}</strong> - ${analysis.explanation}
                        </div>
                    `;
                });
                stepHTML += `</div>`;
            }

            stepHTML += `</div>`;
            return stepHTML;
        }).join('');

        return `
            <div class="slide-content centered">
                ${content.icon ? `<div class="slide-icon">${content.icon}</div>` : ''}
                <h3>${title}</h3>
                <div class="walkthrough">
                    ${stepsHTML}
                </div>
            </div>
        `;
    }

    // Render completion slide
    renderCompletionSlide(slide) {
        const { layout, title, content } = slide;

        if (layout === 'two-column') {
            return `
                <div class="slide-content two-column">
                    <div class="slide-left">
                        ${content.left.icon ? `<div class="slide-icon">${content.left.icon}</div>` : ''}
                        <h3>${title}</h3>
                        <div class="key-takeaway">
                            <strong>${content.left.takeaway.title}</strong> ${content.left.takeaway.text}
                        </div>
                    </div>
                    <div class="slide-right">
                        <p>${content.right.text}</p>
                        <div class="lesson-complete">
                            <button id="${content.right.action.id}" class="btn btn-primary btn-large">
                                ${content.right.action.text}
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }

        return this.renderCenteredSlide(slide);
    }

    // Fallback for centered layout
    renderCenteredSlide(slide) {
        return `
            <div class="slide-content centered">
                <h3>${slide.title}</h3>
                <p>Centered layout for ${slide.type} slide</p>
            </div>
        `;
    }

    // Generate navigation indicators
    generateIndicatorsHTML(slideCount) {
        let indicatorsHTML = '';
        for (let i = 0; i < slideCount; i++) {
            const activeClass = i === 0 ? 'active' : '';
            indicatorsHTML += `<span class="indicator ${activeClass}" data-slide="${i}"></span>`;
        }
        return indicatorsHTML;
    }

    // Update lesson header with topic info
    updateLessonHeader(topic) {
        const titleElement = document.getElementById('lessonTitle');
        if (titleElement) {
            titleElement.textContent = topic.title;
        }

        // Update total slides count
        const totalSteps = topic.slides.length;
        const stepElement = document.querySelector('.lesson-step');
        if (stepElement) {
            stepElement.textContent = `Step 1 of ${totalSteps}`;
        }
    }

    // Show error message
    showError(message) {
        const errorHTML = `
            <div class="slide-content centered">
                <h3>Error Loading Lesson</h3>
                <p>${message}</p>
                <div class="key-point">
                    <strong>Note for Content Creators:</strong> Check that your JSON file is valid and properly formatted.
                </div>
            </div>
        `;

        const slideContainer = document.querySelector('.lesson-slides');
        if (slideContainer) {
            slideContainer.innerHTML = `<div class="lesson-slide active">${errorHTML}</div>`;
        }
    }

    // Main method to load and render a topic
    async loadAndRender(topicId) {
        const topic = await this.loadTopic(topicId);
        if (!topic) return false;

        // Generate slides HTML
        const slidesHTML = this.generateSlidesHTML(topic);
        const indicatorsHTML = this.generateIndicatorsHTML(topic.slides.length);

        // Update DOM
        const slideContainer = document.querySelector('.lesson-slides');
        const indicatorContainer = document.querySelector('.slide-indicators');

        if (slideContainer) {
            slideContainer.innerHTML = slidesHTML;
        }

        if (indicatorContainer) {
            indicatorContainer.innerHTML = indicatorsHTML;
        }

        // Update lesson header
        this.updateLessonHeader(topic);

        console.log(`Successfully rendered ${topic.slides.length} slides for ${topic.title}`);
        return true;
    }

    // Get available topics (for content creator interface)
    async getAvailableTopics() {
        try {
            // This would ideally come from a topics index file
            // For now, return known topics
            return [
                { id: 'craft-and-structure', title: 'Craft and Structure' },
                // Add more as they're created
            ];
        } catch (error) {
            console.error('Error getting available topics:', error);
            return [];
        }
    }
}

// Export for use in other modules
window.TopicLoader = TopicLoader;