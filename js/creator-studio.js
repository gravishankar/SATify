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
        await this.loadSATTaxonomy();
        this.setupEventListeners();
        this.populateDomainDropdown();
        this.populateDomainsGrid();
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
        document.getElementById('domainSelect')?.addEventListener('change', (e) => {
            console.log('Domain changed:', e.target.value);
            this.onDomainChange(e.target.value);
        });

        // Skill selection
        document.getElementById('skillSelect')?.addEventListener('change', (e) => {
            console.log('Skill changed:', e.target.value);
            this.onSkillChange(e.target.value);
        });

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
        if (!this.satTaxonomy) return;

        const domainSelect = document.getElementById('domainSelect');
        if (!domainSelect) return;

        const domains = this.satTaxonomy.reading_writing.domains;
        domainSelect.innerHTML = '<option value="">Select a domain...</option>';

        Object.values(domains).forEach(domain => {
            const option = document.createElement('option');
            option.value = domain.id;
            option.textContent = domain.title;
            domainSelect.appendChild(option);
        });
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

        if (saveBtn) {
            saveBtn.disabled = !isValid;
        }
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

        this.currentLesson = {
            id: this.generateLessonId(),
            domain: domainId,
            skill: skillId,
            title: title,
            learning_objectives: objectives.split('\n').filter(obj => obj.trim()),
            slides: [],
            created_at: new Date().toISOString(),
            status: 'draft'
        };

        this.showLessonEditor();
        this.addDefaultSlides();
        this.showNotification('New lesson created successfully', 'success');
    }

    generateLessonId() {
        return 'lesson_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    }

    addDefaultSlides() {
        const defaultSlides = [
            {
                id: 'intro',
                type: 'introduction',
                title: 'Introduction',
                content: {
                    title: this.currentLesson.title,
                    subtitle: 'What you\'ll learn in this lesson',
                    points: this.currentLesson.learning_objectives.slice(0, 3)
                }
            },
            {
                id: 'concept',
                type: 'concept',
                title: 'Key Concept',
                content: {
                    title: 'Main Concept',
                    explanation: 'Add your explanation here...',
                    example: 'Add an example here...'
                }
            }
        ];

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
        if (!this.validateCurrentLesson()) {
            this.showNotification('Please fix validation errors before saving', 'error');
            return;
        }

        // For now, save to localStorage (later will integrate with GitHub)
        const lessons = JSON.parse(localStorage.getItem('creator_studio_lessons') || '[]');
        const existingIndex = lessons.findIndex(lesson => lesson.id === this.currentLesson.id);

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

    publishLesson() {
        if (!this.validateCurrentLesson()) {
            this.showNotification('Please fix validation errors before publishing', 'error');
            return;
        }

        this.currentLesson.status = 'published';
        this.currentLesson.published_at = new Date().toISOString();
        this.saveLesson();

        console.log('Lesson published:', this.currentLesson);

        // Show detailed publishing info
        this.showNotification(`Lesson "${this.currentLesson.title}" published to browser storage! Available for students.`, 'success');

        // TODO: Future integrations
        console.log('Publishing destinations (future):');
        console.log('- GitHub repository for version control');
        console.log('- Content delivery network (CDN)');
        console.log('- Learning management system (LMS)');
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

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Creator Studio DOM loaded, checking permissions...');
    console.log('Role manager exists:', !!window.roleManager);
    console.log('Has permission:', window.roleManager?.hasPermission('access_creator_studio'));

    // Check role access before initializing
    if (window.roleManager && window.roleManager.hasPermission('access_creator_studio')) {
        console.log('Initializing Creator Studio...');
        window.creatorStudio = new CreatorStudio(window.satApp);
    } else {
        console.log('Access denied: Creator Studio requires instructor role');
    }
});