/**
 * Creator Studio - Content creation framework for SAT Reading & Writing
 * Allows instructors to create lessons, manage topics, and preview content
 */

class CreatorStudio {
    constructor(app) {
        this.app = app;
        this.satTaxonomy = null;
        this.currentLesson = null;
        this.previewMode = false;
        this.validationRules = null;
        this.init();
    }

    async init() {
        console.log('Creator Studio init() called');

        console.log('Step 1: Loading SAT taxonomy...');
        await this.loadSATTaxonomy();

        console.log('Step 2: Setting up event listeners...');
        this.setupEventListeners();

        console.log('Step 3: Populating domain dropdown...');
        this.populateDomainDropdown();

        console.log('Step 4: Populating domains grid...');
        this.populateDomainsGrid();

        console.log('Step 5: Initializing validation framework...');
        this.initializeValidationFramework();

        console.log('Creator Studio initialized successfully');
    }

    async loadSATTaxonomy() {
        try {
            const response = await fetch('data/sat-taxonomy.json');
            this.satTaxonomy = await response.json();
            this.validationRules = this.satTaxonomy.content_creation_guidelines.validation_rules;
            console.log('SAT taxonomy loaded successfully');
        } catch (error) {
            console.error('Error loading SAT taxonomy:', error);
            this.showNotification('Error loading content taxonomy', 'error');
        }
    }

    setupEventListeners() {
        console.log('Setting up Creator Studio event listeners...');

        // Header actions
        document.getElementById('createNewLessonBtn')?.addEventListener('click', () => {
            console.log('Create New Lesson button clicked');
            this.showLessonCreation();
        });

        document.getElementById('viewLibraryBtn')?.addEventListener('click', () => {
            console.log('View Library button clicked');
            this.showLessonLibrary();
        });

        // Domain selection
        const domainSelect = document.getElementById('domainSelect');
        if (domainSelect) {
            domainSelect.addEventListener('change', (e) => {
                console.log('Domain changed:', e.target.value);
                this.onDomainChange(e.target.value);
            });
            console.log('Domain select event listener attached');
        } else {
            console.error('Domain select element not found for event listener');
        }

        // Skill selection
        const skillSelect = document.getElementById('skillSelect');
        if (skillSelect) {
            skillSelect.addEventListener('change', (e) => {
                console.log('Skill changed:', e.target.value);
                this.onSkillChange(e.target.value);
            });
            console.log('Skill select event listener attached');
        } else {
            console.error('Skill select element not found for event listener');
        }

        // Create lesson button
        document.getElementById('createLessonBtn')?.addEventListener('click', () => {
            console.log('Create Lesson button clicked');
            this.createNewLesson();
        });

        // Reset form button
        document.getElementById('resetFormBtn')?.addEventListener('click', () => {
            console.log('Reset Form button clicked');
            this.resetForm();
        });

        // Clear storage button (for debugging)
        document.getElementById('clearStorageBtn')?.addEventListener('click', () => {
            console.log('Clear Storage button clicked');
            this.clearLessonStorage();
        });

        // Content editing
        document.getElementById('lessonTitle')?.addEventListener('input', () => {
            this.validateAndPreview();
        });

        document.getElementById('learningObjectives')?.addEventListener('input', () => {
            this.validateAndPreview();
        });

        // Slide management
        document.getElementById('addSlideBtn')?.addEventListener('click', () => {
            this.addNewSlide();
        });

        // Preview toggle
        document.getElementById('togglePreview')?.addEventListener('click', () => {
            this.togglePreviewMode();
        });

        // Save functionality
        document.getElementById('saveLesson')?.addEventListener('click', () => {
            this.saveLesson();
        });

        // Publishing
        document.getElementById('publishLesson')?.addEventListener('click', () => {
            this.publishLesson();
        });

        // Template management
        document.getElementById('loadTemplate')?.addEventListener('change', (e) => {
            this.loadTemplate(e.target.value);
        });

        // Real-time validation
        this.setupRealTimeValidation();
    }

    populateDomainDropdown() {
        console.log('Populating domain dropdown...');
        console.log('SAT taxonomy available:', !!this.satTaxonomy);

        if (!this.satTaxonomy) {
            console.error('SAT taxonomy not loaded');
            return;
        }

        const domainSelect = document.getElementById('domainSelect');
        if (!domainSelect) {
            console.error('Domain select element not found');
            return;
        }

        console.log('Domain select element found');

        try {
            const domains = this.satTaxonomy.reading_writing.domains;
            console.log('Available domains:', Object.keys(domains));

            domainSelect.innerHTML = '<option value="">Select a domain...</option>';

            Object.values(domains).forEach(domain => {
                const option = document.createElement('option');
                option.value = domain.id;
                option.textContent = domain.title;
                domainSelect.appendChild(option);
                console.log('Added domain option:', domain.title);
            });

            console.log('Domain dropdown populated successfully');
        } catch (error) {
            console.error('Error populating domain dropdown:', error);
        }
    }

    onDomainChange(domainId) {
        const skillSelect = document.getElementById('skillSelect');
        if (!skillSelect || !domainId) {
            skillSelect.innerHTML = '<option value="">Select a skill...</option>';
            return;
        }

        const domain = this.satTaxonomy.reading_writing.domains[domainId];
        skillSelect.innerHTML = '<option value="">Select a skill...</option>';

        if (domain && domain.skills) {
            Object.values(domain.skills).forEach(skill => {
                const option = document.createElement('option');
                option.value = skill.id;
                option.textContent = skill.title;
                skillSelect.appendChild(option);
            });
        }

        this.updateDomainInfo(domain);
    }

    onSkillChange(skillId) {
        const domainId = document.getElementById('domainSelect').value;
        if (!domainId || !skillId) return;

        const skill = this.satTaxonomy.reading_writing.domains[domainId].skills[skillId];
        this.updateSkillInfo(skill);
        this.populateLearningObjectives(skill);
    }

    updateDomainInfo(domain) {
        const domainInfo = document.getElementById('domainInfo');
        if (!domainInfo || !domain) return;

        domainInfo.innerHTML = `
            <h4>${domain.title}</h4>
            <p>${domain.description}</p>
        `;
    }

    updateSkillInfo(skill) {
        const skillInfo = document.getElementById('skillInfo');
        if (!skillInfo || !skill) return;

        skillInfo.innerHTML = `
            <h4>${skill.title}</h4>
            <p>${skill.description}</p>
        `;
    }

    populateLearningObjectives(skill) {
        const objectivesTextarea = document.getElementById('learningObjectives');
        if (!objectivesTextarea || !skill) return;

        objectivesTextarea.value = skill.learning_objectives.join('\n');
        this.validateAndPreview();
    }

    initializeValidationFramework() {
        this.validation = {
            required: this.validationRules.required_fields,
            contentLength: this.validationRules.content_length,
            strategySteps: this.validationRules.strategy_steps
        };
    }

    setupRealTimeValidation() {
        const validationFields = ['lessonTitle', 'learningObjectives'];

        validationFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('input', () => {
                    this.validateField(fieldId);
                });
            }
        });
    }

    validateField(fieldId) {
        const field = document.getElementById(fieldId);
        if (!field) {
            console.warn(`Field ${fieldId} not found`);
            return false;
        }

        const value = field.value.trim();
        const validationMsg = document.getElementById(`${fieldId}Validation`);

        let isValid = true;
        let message = '';

        switch (fieldId) {
            case 'lessonTitle':
                if (value.length === 0) {
                    isValid = false;
                    message = 'Title is required';
                } else if (value.length < 5) {
                    isValid = false;
                    message = 'Title should be at least 5 characters';
                }
                break;

            case 'learningObjectives':
                const objectives = value.split('\n').filter(obj => obj.trim());
                if (objectives.length === 0) {
                    isValid = false;
                    message = 'At least one learning objective is required';
                } else if (objectives.length < 3) {
                    isValid = false;
                    message = 'Recommend at least 3 learning objectives';
                }
                break;
        }

        if (validationMsg) {
            validationMsg.textContent = message;
            validationMsg.className = `validation-message ${isValid ? 'valid' : 'invalid'}`;
        }

        field.className = field.className.replace(/\b(valid|invalid)\b/g, '') + ` ${isValid ? 'valid' : 'invalid'}`;

        return isValid;
    }

    validateAndPreview() {
        const isValid = this.validateCurrentLesson();
        if (isValid && this.previewMode) {
            this.updatePreview();
        }
        return isValid;
    }

    validateCurrentLesson() {
        let allValid = true;
        const validationFields = ['lessonTitle', 'learningObjectives'];

        validationFields.forEach(fieldId => {
            const fieldValid = this.validateField(fieldId);
            allValid = allValid && fieldValid;
        });

        this.updateSaveButtonState(allValid);
        return allValid;
    }

    updateSaveButtonState(isValid) {
        const saveBtn = document.getElementById('saveLesson');
        const publishBtn = document.getElementById('publishLesson');

        // Save button should always be enabled if we have a current lesson
        if (saveBtn) {
            saveBtn.disabled = !this.currentLesson;
        }

        // Publish button requires full validation
        if (publishBtn) {
            publishBtn.disabled = !isValid;
        }
    }

    createNewLesson() {
        const domainId = document.getElementById('domainSelect').value;
        const skillId = document.getElementById('skillSelect').value;
        const title = document.getElementById('lessonTitle').value;
        const objectives = document.getElementById('learningObjectives').value;

        console.log('Validation check:', {
            domainId: domainId,
            skillId: skillId,
            title: title,
            objectives: objectives
        });

        if (!domainId || !skillId || !title || !objectives) {
            console.log('Validation failed - missing fields');
            this.showNotification('Please fill in all required fields', 'warning');
            return;
        }

        console.log('All validation passed, creating lesson...');

        // Get domain and skill details from taxonomy
        const domain = this.satTaxonomy.reading_writing.domains[domainId];
        const skill = domain.skills[skillId];

        this.currentLesson = {
            id: this.generateLessonId(),
            domain_id: domainId,
            domain_title: domain.title,
            skill_id: skillId,
            skill_title: skill.title,
            title: title,
            learning_objectives: objectives.split('\n').filter(obj => obj.trim()),
            slides: [],
            created_at: new Date().toISOString(),
            status: 'draft'
        };

        console.log('Lesson created with:', {
            domain_id: this.currentLesson.domain_id,
            domain_title: this.currentLesson.domain_title,
            skill_id: this.currentLesson.skill_id,
            skill_title: this.currentLesson.skill_title
        });

        this.showLessonEditor();
        this.addDefaultSlides();
        this.showNotification('New lesson created successfully', 'success');
    }

    generateLessonId() {
        return 'lesson_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    }

    createDefaultSlides() {
        // 6-slide template based on Words in Context Learn section
        return [
            {
                id: 'whats-tested',
                type: 'introduction',
                title: "What's Tested",
                icon: '🎯',
                content: {
                    title: this.currentLesson?.title || 'Lesson Title',
                    subtitle: "What you'll encounter on the SAT",
                    points: [
                        'Understanding the skill requirements',
                        'Common question patterns',
                        'Key strategies for success'
                    ]
                }
            },
            {
                id: 'what-makes-tricky',
                type: 'concept',
                title: "What Makes This Tricky",
                icon: '⚠️',
                content: {
                    title: 'Common Challenges',
                    explanation: 'Students often struggle with...',
                    pitfalls: [
                        'Trap answer choices',
                        'Time pressure effects',
                        'Overlooking key details'
                    ]
                }
            },
            {
                id: 'strategy-steps',
                type: 'strategy',
                title: 'Strategy Steps',
                icon: '📋',
                content: {
                    title: 'Step-by-Step Approach',
                    steps: [
                        'Step 1: Read and identify',
                        'Step 2: Analyze the context',
                        'Step 3: Predict the answer',
                        'Step 4: Eliminate and choose',
                        'Step 5: Verify your choice'
                    ]
                }
            },
            {
                id: 'example-question',
                type: 'practice',
                title: 'Example Question',
                icon: '❓',
                content: {
                    title: 'Try This Example',
                    question: 'Add a sample question here...',
                    choices: ['Choice A', 'Choice B', 'Choice C', 'Choice D'],
                    correct_answer: 0,
                    explanation: 'Add explanation here...'
                }
            },
            {
                id: 'walkthrough',
                type: 'walkthrough',
                title: 'Walkthrough',
                icon: '💡',
                content: {
                    title: 'Step-by-Step Solution',
                    solution_steps: [
                        'First, we identify...',
                        'Next, we analyze...',
                        'Then, we eliminate...',
                        'Finally, we choose...'
                    ]
                }
            },
            {
                id: 'wrap-up',
                type: 'summary',
                title: 'Wrap-up',
                icon: '🎉',
                content: {
                    title: 'Key Takeaways',
                    summary: 'Remember these important points:',
                    key_points: [
                        'Main strategy to remember',
                        'Common mistakes to avoid',
                        'Quick tips for success'
                    ],
                    next_steps: 'Ready to practice more questions!'
                }
            }
        ];
    }

    addDefaultSlides() {
        // Use the 6-slide template method that's already created
        const defaultSlides = this.createDefaultSlides();

        this.currentLesson.slides = defaultSlides;
        this.updateSlidesList();
    }

    showLessonEditor() {
        document.getElementById('lessonCreation').classList.add('hidden');
        document.getElementById('lessonEditor').classList.remove('hidden');
        document.getElementById('lessonEditorTitle').textContent = this.currentLesson.title;
    }

    addNewSlide() {
        const slideType = document.getElementById('slideTypeSelect')?.value || 'concept';

        const newSlide = {
            id: 'slide_' + Date.now(),
            type: slideType,
            title: 'New Slide',
            content: this.getDefaultSlideContent(slideType)
        };

        this.currentLesson.slides.push(newSlide);
        this.updateSlidesList();
        this.showNotification('New slide added', 'success');
    }

    getDefaultSlideContent(slideType) {
        const templates = {
            introduction: {
                title: 'Introduction',
                subtitle: 'Learning objectives',
                points: ['Key point 1', 'Key point 2', 'Key point 3']
            },
            concept: {
                title: 'Concept Title',
                explanation: 'Detailed explanation of the concept...',
                example: 'Example or illustration...'
            },
            strategy: {
                title: 'Strategy Steps',
                steps: ['Step 1: Identify key elements', 'Step 2: Apply the strategy', 'Step 3: Verify the answer']
            },
            example: {
                title: 'Practice Example',
                question: 'Sample question text...',
                walkthrough: ['Analysis step 1', 'Analysis step 2', 'Final answer explanation']
            },
            summary: {
                title: 'Summary',
                key_points: ['Main takeaway 1', 'Main takeaway 2', 'Main takeaway 3'],
                next_steps: 'Practice with real SAT questions'
            }
        };

        return templates[slideType] || templates.concept;
    }

    updateSlidesList() {
        const slidesList = document.getElementById('slidesList');
        if (!slidesList || !this.currentLesson) return;

        slidesList.innerHTML = '';

        this.currentLesson.slides.forEach((slide, index) => {
            const slideItem = document.createElement('div');
            slideItem.className = 'slide-item';
            slideItem.innerHTML = `
                <div class="slide-header">
                    <span class="slide-number">${index + 1}</span>
                    <span class="slide-title">${slide.title}</span>
                    <span class="slide-type">${slide.type}</span>
                </div>
                <div class="slide-actions">
                    <button class="btn-small" onclick="creatorStudio.editSlide(${index})">Edit</button>
                    <button class="btn-small btn-danger" onclick="creatorStudio.deleteSlide(${index})">Delete</button>
                </div>
            `;
            slidesList.appendChild(slideItem);
        });
    }

    editSlide(slideIndex) {
        const slide = this.currentLesson.slides[slideIndex];
        this.showSlideEditor(slide, slideIndex);
    }

    deleteSlide(slideIndex) {
        if (confirm('Are you sure you want to delete this slide?')) {
            this.currentLesson.slides.splice(slideIndex, 1);
            this.updateSlidesList();
            this.showNotification('Slide deleted', 'success');
        }
    }

    showSlideEditor(slide, slideIndex) {
        const editor = document.getElementById('slideEditor');
        const content = document.getElementById('slideEditorContent');

        if (!editor || !content) return;

        content.innerHTML = this.generateSlideEditForm(slide, slideIndex);
        editor.classList.remove('hidden');
    }

    generateSlideEditForm(slide, slideIndex) {
        let formHTML = `
            <div class="slide-edit-form">
                <h4>Editing: ${slide.title}</h4>
                <div class="form-group">
                    <label for="slideTitle">Slide Title:</label>
                    <input type="text" id="slideTitle" value="${slide.title}" />
                </div>
        `;

        // Generate type-specific form fields
        switch (slide.type) {
            case 'introduction':
                formHTML += `
                    <div class="form-group">
                        <label for="slideSubtitle">Subtitle:</label>
                        <input type="text" id="slideSubtitle" value="${slide.content.subtitle || ''}" />
                    </div>
                    <div class="form-group">
                        <label for="slidePoints">Key Points (one per line):</label>
                        <textarea id="slidePoints" rows="4">${(slide.content.points || []).join('\n')}</textarea>
                    </div>
                `;
                break;

            case 'concept':
                formHTML += `
                    <div class="form-group">
                        <label for="slideExplanation">Explanation:</label>
                        <textarea id="slideExplanation" rows="6">${slide.content.explanation || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label for="slideExample">Example:</label>
                        <textarea id="slideExample" rows="4">${slide.content.example || ''}</textarea>
                    </div>
                `;
                break;

            case 'strategy':
                formHTML += `
                    <div class="form-group">
                        <label for="slideSteps">Strategy Steps (one per line):</label>
                        <textarea id="slideSteps" rows="5">${(slide.content.steps || []).join('\n')}</textarea>
                    </div>
                `;
                break;

            case 'practice':
                const practiceContent = slide.content || {};
                formHTML += `
                    <div class="form-group">
                        <label for="slideQuestion">Practice Question:</label>
                        <textarea id="slideQuestion" rows="4">${practiceContent.question || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label for="slideChoices">Answer Choices (one per line):</label>
                        <textarea id="slideChoices" rows="4">${(practiceContent.choices || []).join('\n')}</textarea>
                    </div>
                    <div class="form-group">
                        <label for="slideCorrectAnswer">Correct Answer (0-3):</label>
                        <input type="number" id="slideCorrectAnswer" min="0" max="3" value="${practiceContent.correct_answer || 0}" />
                    </div>
                    <div class="form-group">
                        <label for="slideExplanation">Explanation:</label>
                        <textarea id="slideExplanation" rows="4">${practiceContent.explanation || ''}</textarea>
                    </div>
                `;
                break;

            case 'walkthrough':
                const walkthroughContent = slide.content || {};
                formHTML += `
                    <div class="form-group">
                        <label for="slideSolutionSteps">Solution Steps (one per line):</label>
                        <textarea id="slideSolutionSteps" rows="6">${(walkthroughContent.solution_steps || []).join('\n')}</textarea>
                    </div>
                `;
                break;

            case 'summary':
                const summaryContent = slide.content || {};
                formHTML += `
                    <div class="form-group">
                        <label for="slideSummary">Summary Text:</label>
                        <textarea id="slideSummary" rows="3">${summaryContent.summary || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label for="slideKeyPoints">Key Points (one per line):</label>
                        <textarea id="slideKeyPoints" rows="4">${(summaryContent.key_points || []).join('\n')}</textarea>
                    </div>
                    <div class="form-group">
                        <label for="slideNextSteps">Next Steps:</label>
                        <input type="text" id="slideNextSteps" value="${summaryContent.next_steps || ''}" />
                    </div>
                `;
                break;
        }

        formHTML += `
                <div class="form-actions">
                    <button class="btn btn-primary" onclick="creatorStudio.saveSlideEdit(${slideIndex})">Save Changes</button>
                    <button class="btn btn-secondary" onclick="creatorStudio.cancelSlideEdit()">Cancel</button>
                </div>
            </div>
        `;

        return formHTML;
    }

    saveSlideEdit(slideIndex) {
        const slide = this.currentLesson.slides[slideIndex];

        slide.title = document.getElementById('slideTitle')?.value || slide.title;

        // Update type-specific content
        switch (slide.type) {
            case 'introduction':
                slide.content.subtitle = document.getElementById('slideSubtitle')?.value || '';
                slide.content.points = document.getElementById('slidePoints')?.value.split('\n').filter(p => p.trim()) || [];
                break;

            case 'concept':
                slide.content.explanation = document.getElementById('slideExplanation')?.value || '';
                slide.content.example = document.getElementById('slideExample')?.value || '';
                break;

            case 'strategy':
                slide.content.steps = document.getElementById('slideSteps')?.value.split('\n').filter(s => s.trim()) || [];
                break;

            case 'practice':
                slide.content.question = document.getElementById('slideQuestion')?.value || '';
                slide.content.choices = document.getElementById('slideChoices')?.value.split('\n').filter(c => c.trim()) || [];
                slide.content.correct_answer = parseInt(document.getElementById('slideCorrectAnswer')?.value) || 0;
                slide.content.explanation = document.getElementById('slideExplanation')?.value || '';
                break;

            case 'walkthrough':
                slide.content.solution_steps = document.getElementById('slideSolutionSteps')?.value.split('\n').filter(s => s.trim()) || [];
                break;

            case 'summary':
                slide.content.summary = document.getElementById('slideSummary')?.value || '';
                slide.content.key_points = document.getElementById('slideKeyPoints')?.value.split('\n').filter(p => p.trim()) || [];
                slide.content.next_steps = document.getElementById('slideNextSteps')?.value || '';
                break;
        }

        this.updateSlidesList();
        this.cancelSlideEdit();
        this.showNotification('Slide updated successfully', 'success');
    }

    cancelSlideEdit() {
        const editor = document.getElementById('slideEditor');
        if (editor) {
            editor.classList.add('hidden');
        }
    }

    togglePreviewMode() {
        this.previewMode = !this.previewMode;
        const previewPanel = document.getElementById('previewPanel');
        const toggleBtn = document.getElementById('togglePreview');

        if (this.previewMode) {
            previewPanel.classList.remove('hidden');
            toggleBtn.textContent = 'Hide Preview';
            this.updatePreview();
        } else {
            previewPanel.classList.add('hidden');
            toggleBtn.textContent = 'Show Preview';
        }
    }

    updatePreview() {
        if (!this.previewMode || !this.currentLesson) return;

        const previewContent = document.getElementById('previewContent');
        if (!previewContent) return;

        previewContent.innerHTML = `
            <div class="lesson-preview">
                <h3>${this.currentLesson.title}</h3>
                <div class="lesson-meta">
                    <span class="domain">${this.currentLesson.domain}</span>
                    <span class="skill">${this.currentLesson.skill}</span>
                    <span class="slides-count">${this.currentLesson.slides.length} slides</span>
                </div>
                <div class="learning-objectives">
                    <h4>Learning Objectives:</h4>
                    <ul>
                        ${this.currentLesson.learning_objectives.map(obj => `<li>${obj}</li>`).join('')}
                    </ul>
                </div>
                <div class="slides-preview">
                    ${this.currentLesson.slides.map((slide, index) => this.renderSlidePreview(slide, index)).join('')}
                </div>
            </div>
        `;
    }

    renderSlidePreview(slide, index) {
        return `
            <div class="slide-preview">
                <h4>Slide ${index + 1}: ${slide.title}</h4>
                <div class="slide-content">
                    ${this.renderSlideContentPreview(slide)}
                </div>
            </div>
        `;
    }

    renderSlideContentPreview(slide) {
        switch (slide.type) {
            case 'introduction':
                return `
                    <h5>${slide.content.title}</h5>
                    <p><em>${slide.content.subtitle}</em></p>
                    <ul>
                        ${(slide.content.points || []).map(point => `<li>${point}</li>`).join('')}
                    </ul>
                `;

            case 'concept':
                return `
                    <div class="concept-content">
                        <p><strong>Explanation:</strong> ${slide.content.explanation}</p>
                        <p><strong>Example:</strong> ${slide.content.example}</p>
                    </div>
                `;

            case 'strategy':
                return `
                    <ol>
                        ${(slide.content.steps || []).map(step => `<li>${step}</li>`).join('')}
                    </ol>
                `;

            default:
                return '<p>Preview not available for this slide type</p>';
        }
    }

    saveLesson() {
        if (!this.currentLesson) {
            this.showNotification('No lesson to save', 'warning');
            return;
        }

        // Update the lesson with current editor state
        this.updateLessonFromEditor();

        // Save to localStorage (works on GitHub Pages and locally)
        const lessons = JSON.parse(localStorage.getItem('creator_studio_lessons') || '[]');
        const existingIndex = lessons.findIndex(lesson => lesson.id === this.currentLesson.id);

        // Update timestamps
        this.currentLesson.updated_at = new Date().toISOString();
        if (!this.currentLesson.created_at) {
            this.currentLesson.created_at = new Date().toISOString();
        }

        if (existingIndex >= 0) {
            lessons[existingIndex] = this.currentLesson;
        } else {
            lessons.push(this.currentLesson);
        }

        localStorage.setItem('creator_studio_lessons', JSON.stringify(lessons));

        console.log('Lesson saved to localStorage:', this.currentLesson);
        console.log('Total lessons in storage:', lessons.length);

        this.showNotification(`Lesson saved to browser storage (${lessons.length} total lessons)`, 'success');
    }

    updateLessonFromEditor() {
        // Update lesson title if changed
        const titleField = document.getElementById('lessonTitle');
        if (titleField && titleField.value.trim()) {
            this.currentLesson.title = titleField.value.trim();
        }

        // Update learning objectives if changed
        const objectivesField = document.getElementById('learningObjectives');
        if (objectivesField && objectivesField.value.trim()) {
            this.currentLesson.learning_objectives = objectivesField.value
                .split('\n')
                .filter(obj => obj.trim())
                .map(obj => obj.trim());
        }
    }

    async publishLesson() {
        if (!this.validateCurrentLesson()) {
            this.showNotification('Please fix validation errors before publishing', 'error');
            return;
        }

        // Migrate lesson data if needed
        this.migrateLessonData();

        // Show confirmation dialog
        const confirmed = await this.showPublishConfirmation();
        if (!confirmed) return;

        try {
            // Update lesson metadata
            this.currentLesson.status = 'published';
            this.currentLesson.published_at = new Date().toISOString();
            this.currentLesson.author = window.roleManager?.getCurrentRole() || 'instructor';

            // Save to localStorage first
            this.saveLesson();

            // Try to publish to GitHub (will fallback gracefully if server not available)
            const result = await this.publishToGitHub();

            if (result.method === 'github-actions') {
                this.showNotification(`Lesson "${this.currentLesson.title}" ready for GitHub publishing. Follow the instructions in the modal.`, 'info');
                console.log('Lesson prepared for GitHub Actions publishing:', this.currentLesson);
            } else {
                this.showNotification(`Lesson "${this.currentLesson.title}" published successfully to GitHub!`, 'success');
                console.log('Lesson published to GitHub:', this.currentLesson);
            }

        } catch (error) {
            console.error('Publishing failed:', error);

            // Always save locally even if GitHub publishing fails
            this.currentLesson.status = 'draft';
            this.saveLesson();

            // Check if this is the expected "API not available" error
            if (error.message.includes('API not available') || error.message.includes('Manual file placement') || error.message.includes('Failed to fetch')) {
                this.showNotification(`Lesson saved locally. For GitHub publishing, use the Node.js server (localhost:3001)`, 'warning');
                console.log('Lesson saved to localStorage - server not available for GitHub publishing');
            } else {
                this.showNotification(`Publishing failed: ${error.message}`, 'error');
            }
        }
    }

    migrateLessonData() {
        // Check if lesson needs migration from old format
        if (!this.currentLesson.domain_id && this.currentLesson.domain) {
            console.log('Migrating lesson from old format...');

            const domainId = this.currentLesson.domain;
            const skillId = this.currentLesson.skill;

            if (this.satTaxonomy && domainId && skillId) {
                const domain = this.satTaxonomy.reading_writing.domains[domainId];
                const skill = domain?.skills[skillId];

                if (domain && skill) {
                    this.currentLesson.domain_id = domainId;
                    this.currentLesson.domain_title = domain.title;
                    this.currentLesson.skill_id = skillId;
                    this.currentLesson.skill_title = skill.title;

                    // Remove old properties
                    delete this.currentLesson.domain;
                    delete this.currentLesson.skill;

                    console.log('Lesson migrated successfully:', {
                        domain_id: this.currentLesson.domain_id,
                        domain_title: this.currentLesson.domain_title,
                        skill_id: this.currentLesson.skill_id,
                        skill_title: this.currentLesson.skill_title
                    });
                } else {
                    console.error('Could not find domain/skill in taxonomy for migration');
                }
            }
        }

        // Ensure we have the required fields, even if migration failed
        if (!this.currentLesson.domain_id || !this.currentLesson.skill_id) {
            console.error('Missing domain/skill data, using defaults');
            this.currentLesson.domain_id = this.currentLesson.domain_id || 'unknown';
            this.currentLesson.domain_title = this.currentLesson.domain_title || 'Unknown Domain';
            this.currentLesson.skill_id = this.currentLesson.skill_id || 'unknown';
            this.currentLesson.skill_title = this.currentLesson.skill_title || 'Unknown Skill';
        }
    }

    async showPublishConfirmation() {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'modal-overlay';
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Publish Lesson to GitHub</h3>
                    </div>
                    <div class="modal-body">
                        <p><strong>Lesson:</strong> ${this.currentLesson.title}</p>
                        <p><strong>Domain:</strong> ${this.currentLesson.domain_title}</p>
                        <p><strong>Skill:</strong> ${this.currentLesson.skill_title}</p>
                        <p><strong>Slides:</strong> ${this.currentLesson.slides.length}</p>
                        <br>
                        <p>This will commit the lesson to the GitHub repository and make it available to students.</p>
                        <br>
                        <label for="commitMessage">Commit Message:</label>
                        <input type="text" id="commitMessage" class="form-control"
                               value="Add lesson: ${this.currentLesson.title}" placeholder="Enter commit message">
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" id="cancelPublish">Cancel</button>
                        <button class="btn btn-primary" id="confirmPublish">Publish to GitHub</button>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            document.getElementById('cancelPublish').onclick = () => {
                document.body.removeChild(modal);
                resolve(false);
            };

            document.getElementById('confirmPublish').onclick = () => {
                const commitMessage = document.getElementById('commitMessage').value.trim();
                this.currentLesson.commitMessage = commitMessage || `Add lesson: ${this.currentLesson.title}`;
                document.body.removeChild(modal);
                resolve(true);
            };

            // Close on backdrop click
            modal.onclick = (e) => {
                if (e.target === modal) {
                    document.body.removeChild(modal);
                    resolve(false);
                }
            };
        });
    }

    async publishToGitHub() {
        // Generate filename
        const domainId = this.currentLesson.domain_id;
        const skillId = this.currentLesson.skill_id;
        const lessonName = this.generateFilename(this.currentLesson.title);
        const filename = `${lessonName}.json`;
        const filepath = `lessons/${domainId}/${skillId}/${filename}`;

        // Prepare lesson data for GitHub
        const lessonData = {
            ...this.currentLesson,
            created_at: this.currentLesson.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString(),
            version: "1.0",
            format_version: "creator_studio_v1"
        };

        // Update manifest
        const updatedManifest = await this.updateManifest(lessonData, filepath);

        // Commit to GitHub
        await this.commitToGitHub(
            this.currentLesson.commitMessage,
            lessonData,
            filepath,
            updatedManifest
        );
    }

    generateFilename(title) {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    }

    async writeFileToLocalProject(filepath, content) {
        // Create a server endpoint request to write the file
        try {
            const response = await fetch('/api/write-lesson', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    filepath: filepath,
                    content: content
                })
            });

            if (!response.ok) {
                throw new Error(`Failed to write file: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            // Fallback: download the file for manual placement
            console.log('Server endpoint not available, preparing file for download');
            this.downloadFile(filepath, content);
            throw new Error('Server endpoint not available - file prepared for download');
        }
    }

    downloadFile(filepath, content) {
        const blob = new Blob([content], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filepath.split('/').pop();
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    async updateManifest(lessonData, filepath) {
        try {
            // Read current manifest
            const manifestResponse = await fetch('lessons/manifest.json');
            let manifest;

            if (manifestResponse.ok) {
                manifest = await manifestResponse.json();
            } else {
                // Create new manifest if it doesn't exist
                manifest = {
                    version: "1.0",
                    lastUpdated: new Date().toISOString(),
                    totalLessons: 0,
                    lessons: {}
                };
            }

            // Add lesson to manifest
            const lessonId = `${lessonData.domain_id}_${lessonData.skill_id}_${this.generateFilename(lessonData.title)}`;
            manifest.lessons[lessonId] = {
                id: lessonId,
                title: lessonData.title,
                domain_id: lessonData.domain_id,
                domain_title: lessonData.domain_title,
                skill_id: lessonData.skill_id,
                skill_title: lessonData.skill_title,
                author: lessonData.author,
                created_at: lessonData.created_at,
                updated_at: lessonData.updated_at,
                published_at: lessonData.published_at,
                status: lessonData.status,
                filepath: filepath,
                slide_count: lessonData.slides.length,
                learning_objectives_count: lessonData.learning_objectives.length
            };

            manifest.totalLessons = Object.keys(manifest.lessons).length;
            manifest.lastUpdated = new Date().toISOString();

            return manifest;

        } catch (error) {
            console.error('Error updating manifest:', error);
            throw new Error('Failed to update lessons manifest');
        }
    }

    async commitToGitHub(message, lessonData, filepath, updatedManifest) {
        try {
            console.log('Publishing lesson via GitHub Actions...');

            // Skip server API for GitHub Pages deployment
            console.log('Using GitHub Actions approach for static deployment...');

            // Fallback to GitHub Actions approach
            await this.publishViaGitHubActions(message, lessonData, filepath, updatedManifest);
            return { success: true, method: 'github-actions' };

        } catch (error) {
            console.log('GitHub Actions not available, using manual approach...');

            // Final fallback: prepare files for manual commit
            this.downloadFile(filepath, JSON.stringify(lessonData, null, 2));
            this.downloadFile('lessons/manifest.json', JSON.stringify(updatedManifest, null, 2));

            // Show user instructions
            this.showManualCommitInstructions(filepath, message);

            throw new Error('Automatic publishing not available - files prepared for manual commit');
        }
    }

    async publishViaGitHubActions(message, lessonData, filepath, updatedManifest) {
        try {
            // Get repository info from current URL or default
            const repoOwner = 'gravishankar'; // You can make this configurable
            const repoName = 'sat-practice-pro';

            // Create GitHub issue to trigger the action
            const issueTitle = `Publish Lesson: ${lessonData.title}`;
            const issueBody = `## Creator Studio Lesson Publishing Request

**Lesson Title:** ${lessonData.title}
**Domain:** ${lessonData.domain_title} (${lessonData.domain_id})
**Skill:** ${lessonData.skill_title} (${lessonData.skill_id})
**Author:** ${lessonData.author}
**Commit Message:** ${message}

### Lesson Data
\`\`\`json
${JSON.stringify(lessonData, null, 2)}
\`\`\`

### Manifest Data
\`\`\`manifest
${JSON.stringify(updatedManifest, null, 2)}
\`\`\`

---
*This issue was automatically created by Creator Studio to publish a lesson.*`;

            // For GitHub Pages deployment, we'll show instructions to create the issue manually
            // In a more advanced setup, you could use GitHub API with a token
            this.showGitHubActionsInstructions(issueTitle, issueBody, repoOwner, repoName, lessonData);

        } catch (error) {
            console.error('Error setting up GitHub Actions publishing:', error);
            throw error;
        }
    }

    showGitHubActionsInstructions(issueTitle, issueBody, repoOwner, repoName, lessonData) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 700px; max-height: 80vh; overflow-y: auto;">
                <div class="modal-header">
                    <h3>🚀 Publish Lesson via GitHub Actions</h3>
                </div>
                <div class="modal-body">
                    <p>Your lesson is ready to publish! Follow these simple steps:</p>

                    <h4>Step 1: Create GitHub Issue</h4>
                    <p>Click the button below to create a GitHub issue, then copy and paste the lesson data:</p>
                    <a href="https://github.com/${repoOwner}/${repoName}/issues/new?title=${encodeURIComponent(issueTitle)}&labels=${encodeURIComponent('creator-studio-lesson')}"
                       target="_blank" class="btn btn-primary" style="display: inline-block; margin: 10px 0;">
                        📝 Create GitHub Issue to Publish
                    </a>

                    <h4>Step 1.5: Copy Lesson Data</h4>
                    <p>Copy the JSON data below and paste it into the GitHub issue description:</p>
                    <textarea readonly style="width: 100%; height: 200px; font-family: monospace; font-size: 12px; background: #f8f9fa; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">\`\`\`json
${JSON.stringify(lessonData, null, 2)}
\`\`\`</textarea>

                    <h4>Step 2: Wait for Automation</h4>
                    <p>GitHub Actions will automatically:</p>
                    <ul>
                        <li>Create the lesson file in the correct location</li>
                        <li>Update the manifest</li>
                        <li>Commit everything to the repository</li>
                        <li>Close the issue when complete</li>
                    </ul>

                    <p><strong>No manual git commands needed!</strong> The entire process is automated.</p>

                    <div style="background: #f8f9fa; padding: 10px; border-radius: 4px; margin: 10px 0; border-left: 4px solid #007bff;">
                        <strong>📌 Important:</strong> Make sure the issue has the <code>creator-studio-lesson</code> label.
                        If the label doesn't appear automatically, add it manually in the GitHub issue form.
                    </div>

                    <details style="margin-top: 20px;">
                        <summary style="cursor: pointer; font-weight: bold;">📋 Manual Issue Creation (if button doesn't work)</summary>
                        <div style="margin-top: 10px;">
                            <p><strong>Title:</strong></p>
                            <input type="text" readonly value="${issueTitle}" style="width: 100%; padding: 5px; margin-bottom: 10px;">

                            <p><strong>Labels:</strong> creator-studio-lesson</p>

                            <p><strong>Body:</strong></p>
                            <textarea readonly style="width: 100%; height: 150px; padding: 5px; font-family: monospace; font-size: 12px;">${issueBody}</textarea>
                        </div>
                    </details>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="closeGitHubInstructions">I've created the issue</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        document.getElementById('closeGitHubInstructions').onclick = () => {
            document.body.removeChild(modal);
        };

        modal.onclick = (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        };
    }

    showManualCommitInstructions(filepath, message) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header">
                    <h3>Manual GitHub Commit Required</h3>
                </div>
                <div class="modal-body">
                    <p>The lesson files have been downloaded. Please follow these steps:</p>
                    <ol>
                        <li>Place the lesson file in: <code>${filepath}</code></li>
                        <li>Place the manifest.json in: <code>lessons/manifest.json</code></li>
                        <li>Open terminal in your project directory</li>
                        <li>Run these commands:</li>
                    </ol>
                    <pre style="background: #f5f5f5; padding: 10px; border-radius: 4px; overflow-x: auto;">
git add ${filepath} lessons/manifest.json
git commit -m "${message}"
git push origin main</pre>
                    <p><small>Future versions will automate this process.</small></p>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" id="closeInstructions">I'll do this manually</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        document.getElementById('closeInstructions').onclick = () => {
            document.body.removeChild(modal);
        };

        modal.onclick = (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        };
    }

    loadTemplate(templateId) {
        if (!templateId) return;

        // Template loading logic here
        this.showNotification(`Loading template: ${templateId}`, 'info');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;

        const container = document.getElementById('notificationContainer') || document.body;
        container.appendChild(notification);

        setTimeout(() => notification.classList.add('show'), 100);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => container.removeChild(notification), 300);
        }, 3000);
    }

    // New interface methods
    showLessonCreation() {
        console.log('Showing lesson creation panel');
        document.getElementById('lessonCreation').classList.remove('hidden');
        document.getElementById('lessonEditor').classList.add('hidden');
        document.getElementById('previewPanel').classList.add('hidden');
    }

    showLessonLibrary() {
        console.log('Showing lesson library');
        const lessons = this.getCreatedLessons();

        if (lessons.length === 0) {
            this.showNotification('No lessons created yet. Create your first lesson!', 'info');
            return;
        }

        console.log('Stored lessons:', lessons);

        // Show lesson details in console
        lessons.forEach((lesson, index) => {
            console.log(`Lesson ${index + 1}:`, {
                title: lesson.title,
                domain: lesson.domain,
                skill: lesson.skill,
                status: lesson.status,
                slides: lesson.slides?.length || 0,
                created: lesson.created_at,
                published: lesson.published_at
            });
        });

        this.showNotification(`Found ${lessons.length} lessons in browser storage. Check console for details.`, 'info');
    }

    resetForm() {
        console.log('Resetting creation form');
        document.getElementById('domainSelect').value = '';
        document.getElementById('skillSelect').value = '';
        document.getElementById('lessonTitle').value = '';
        document.getElementById('learningObjectives').value = '';
        document.getElementById('domainInfo').innerHTML = '';
        document.getElementById('skillInfo').innerHTML = '';
    }

    clearLessonStorage() {
        if (confirm('This will delete all saved lessons from browser storage. Are you sure?')) {
            localStorage.removeItem('creator_studio_lessons');
            this.currentLesson = null;
            this.showLessonCreation();
            this.showNotification('All lesson storage cleared', 'info');
            console.log('Lesson storage cleared');
        }
    }

    populateDomainsGrid() {
        const grid = document.getElementById('domainsGrid');
        if (!grid || !this.satTaxonomy) return;

        const domains = this.satTaxonomy.reading_writing.domains;
        grid.innerHTML = '';

        Object.values(domains).forEach(domain => {
            const domainCard = document.createElement('div');
            domainCard.className = 'domain-card';
            domainCard.innerHTML = `
                <h3>${domain.title}</h3>
                <p>${domain.description}</p>
                <div class="skills-count">${Object.keys(domain.skills).length} skills</div>
            `;
            grid.appendChild(domainCard);
        });
    }

    // Public methods for integration
    getCreatedLessons() {
        return JSON.parse(localStorage.getItem('creator_studio_lessons') || '[]');
    }

    exportLesson(lessonId) {
        const lessons = this.getCreatedLessons();
        const lesson = lessons.find(l => l.id === lessonId);

        if (lesson) {
            const dataStr = JSON.stringify(lesson, null, 2);
            const dataBlob = new Blob([dataStr], {type: 'application/json'});

            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `${lesson.title.replace(/\s+/g, '_')}.json`;
            link.click();
        }
    }
}

// Initialize Creator Studio - called when DOM is ready and role manager is initialized
function initializeCreatorStudio() {
    console.log('Checking Creator Studio access...');
    console.log('Role manager exists:', !!window.roleManager);
    console.log('Has permission:', window.roleManager?.hasPermission('access_creator_studio'));

    // Clean up existing instance
    if (window.creatorStudio) {
        console.log('Cleaning up existing Creator Studio instance');
        window.creatorStudio = null;
    }

    // Check role access before initializing
    if (window.roleManager && window.roleManager.hasPermission('access_creator_studio')) {
        console.log('Initializing Creator Studio...');
        // Wait for satApp to be ready
        if (window.satApp) {
            window.creatorStudio = new CreatorStudio(window.satApp);
        } else {
            // Wait a bit for satApp to initialize
            setTimeout(() => {
                if (window.satApp) {
                    window.creatorStudio = new CreatorStudio(window.satApp);
                } else {
                    console.error('SATApp not available for Creator Studio initialization');
                }
            }, 500);
        }
    } else {
        console.log('Access denied: Creator Studio requires instructor role');
    }
}

// Listen for role changes to reinitialize Creator Studio
window.addEventListener('roleChanged', (event) => {
    console.log('Role changed, reinitializing Creator Studio...', event.detail);
    initializeCreatorStudio();
});

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Creator Studio DOM loaded, waiting for role manager...');
    // Wait a bit for role manager to be fully initialized
    setTimeout(() => {
        initializeCreatorStudio();
    }, 300);
});