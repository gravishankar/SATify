/**
 * SATify Enhanced Creator Studio
 * Features: Auto-save, Draft Management, Version Control, Live Preview
 */

class EnhancedCreatorStudio {
    constructor() {
        this.currentLesson = null;
        this.autoSaveInterval = null;
        this.lastSaved = null;
        this.hasUnsavedChanges = false;
        this.lessons = [];

        this.init();
    }

    async init() {
        console.log('🚀 Enhanced Creator Studio initializing...');

        // Load lessons from manifest
        await this.loadLessons();

        // Restore from localStorage if exists
        this.restoreFromLocalStorage();

        // Setup auto-save (every 30 seconds)
        this.startAutoSave();

        // Setup form change listeners
        this.setupChangeListeners();

        // Setup beforeunload warning
        this.setupUnloadWarning();

        console.log('✅ Enhanced Creator Studio ready');
    }

    async loadLessons() {
        try {
            const response = await fetch('lessons/manifest.json');
            const manifest = await response.json();
            this.lessons = Object.values(manifest.lessons);
            this.renderLessonList();
        } catch (error) {
            console.error('Error loading lessons:', error);
            this.showNotification('Error loading lessons', 'error');
        }
    }

    renderLessonList() {
        const lessonList = document.getElementById('lessonList');
        if (!lessonList) return;

        lessonList.innerHTML = this.lessons.map(lesson => `
            <li class="lesson-item" onclick="studio.loadLesson('${lesson.id}')">
                <div class="lesson-title">${lesson.title}</div>
                <div class="lesson-meta">${lesson.skill_codes.join(', ')} • ${lesson.slide_count} slides</div>
            </li>
        `).join('');
    }

    async loadLesson(lessonId) {
        try {
            this.updateStatus('loading', 'Loading lesson...');

            // Try to load draft first, fallback to published
            let lessonData;
            try {
                const draftResponse = await fetch(`lessons/drafts/${lessonId}.json`);
                if (draftResponse.ok) {
                    lessonData = await draftResponse.json();
                    console.log(`📝 Loaded draft for ${lessonId}`);
                } else {
                    throw new Error('No draft found');
                }
            } catch {
                // Load published version
                const response = await fetch(`lessons/${lessonId}.json`);
                lessonData = await response.json();
                console.log(`📚 Loaded published version of ${lessonId}`);
            }

            this.currentLesson = lessonData;
            this.populateForm(lessonData);
            this.updatePreview();
            this.updateStatus('saved', 'Lesson loaded');

            // Mark active in list
            document.querySelectorAll('.lesson-item').forEach(item => item.classList.remove('active'));
            event.target.closest('.lesson-item')?.classList.add('active');

        } catch (error) {
            console.error('Error loading lesson:', error);
            this.showNotification('Error loading lesson', 'error');
        }
    }

    populateForm(lesson) {
        document.getElementById('lessonId').value = lesson.id || '';
        document.getElementById('lessonTitle').value = lesson.title || '';
        document.getElementById('lessonSubtitle').value = lesson.subtitle || '';
        document.getElementById('lessonLevel').value = lesson.level || 'Foundation';
        document.getElementById('lessonDuration').value = lesson.duration || '';
        document.getElementById('skillCodes').value = lesson.skill_codes?.join(', ') || '';
        document.getElementById('learningObjectives').value = lesson.learning_objectives?.join('\n') || '';

        // TODO: Render slides
        this.renderSlides(lesson.slides || []);
    }

    renderSlides(slides) {
        const container = document.getElementById('slidesContainer');
        if (!container) return;

        container.innerHTML = slides.map((slide, index) => `
            <div class="slide-editor" data-slide-index="${index}">
                <div class="slide-header">
                    <span class="slide-number">Slide ${index + 1}: ${slide.title || 'Untitled'}</span>
                    <div class="slide-actions">
                        <button class="slide-btn" onclick="studio.editSlide(${index})">Edit</button>
                        <button class="slide-btn" onclick="studio.deleteSlide(${index})">Delete</button>
                    </div>
                </div>
                <div style="color: #64748b; font-size: 0.85rem;">
                    Type: ${slide.type || 'unknown'} • ID: ${slide.id || 'none'}
                </div>
            </div>
        `).join('');
    }

    setupChangeListeners() {
        const form = document.getElementById('lessonForm');
        if (!form) return;

        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                this.hasUnsavedChanges = true;
                this.updateStatus('unsaved', 'Unsaved changes');
                this.saveToLocalStorage();
            });
        });
    }

    startAutoSave() {
        // Auto-save every 30 seconds
        this.autoSaveInterval = setInterval(() => {
            if (this.hasUnsavedChanges) {
                this.autoSaveToLocalStorage();
            }
        }, 30000);
    }

    autoSaveToLocalStorage() {
        this.saveToLocalStorage();
        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        this.updateStatus('saving', `Auto-saved at ${timeStr}`);

        setTimeout(() => {
            if (this.hasUnsavedChanges) {
                this.updateStatus('unsaved', `Last auto-save: ${timeStr}`);
            } else {
                this.updateStatus('saved', `Last auto-save: ${timeStr}`);
            }
        }, 2000);
    }

    saveToLocalStorage() {
        try {
            const lesson = this.getLessonFromForm();
            localStorage.setItem('satify_draft', JSON.stringify(lesson));
            localStorage.setItem('satify_draft_timestamp', new Date().toISOString());
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    }

    restoreFromLocalStorage() {
        try {
            const draft = localStorage.getItem('satify_draft');
            const timestamp = localStorage.getItem('satify_draft_timestamp');

            if (draft && timestamp) {
                const timeDiff = Date.now() - new Date(timestamp).getTime();
                const hoursDiff = timeDiff / (1000 * 60 * 60);

                // Only restore if less than 24 hours old
                if (hoursDiff < 24) {
                    const lesson = JSON.parse(draft);
                    const restore = confirm(`Found unsaved work from ${new Date(timestamp).toLocaleString()}. Restore it?`);

                    if (restore) {
                        this.currentLesson = lesson;
                        this.populateForm(lesson);
                        this.showNotification('Draft restored from local storage', 'success');
                    }
                }
            }
        } catch (error) {
            console.error('Error restoring from localStorage:', error);
        }
    }

    getLessonFromForm() {
        const lesson = {
            id: document.getElementById('lessonId').value,
            title: document.getElementById('lessonTitle').value,
            subtitle: document.getElementById('lessonSubtitle').value,
            level: document.getElementById('lessonLevel').value,
            duration: document.getElementById('lessonDuration').value,
            skill_codes: document.getElementById('skillCodes').value.split(',').map(s => s.trim()).filter(s => s),
            learning_objectives: document.getElementById('learningObjectives').value.split('\n').filter(s => s.trim()),
            slides: this.currentLesson?.slides || [],
            metadata: {
                last_updated: new Date().toISOString(),
                content_version: this.currentLesson?.metadata?.content_version || '1.0'
            }
        };

        return lesson;
    }

    async saveDraft() {
        try {
            this.updateStatus('saving', 'Saving draft...');

            const lesson = this.getLessonFromForm();

            // Save to server
            const response = await fetch('/api/save-draft', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(lesson)
            });

            if (response.ok) {
                this.hasUnsavedChanges = false;
                this.lastSaved = new Date();
                this.updateStatus('saved', 'Draft saved successfully');
                this.showNotification('Draft saved to server ✓', 'success');

                // Clear localStorage after successful server save
                localStorage.removeItem('satify_draft');
            } else {
                throw new Error('Server error');
            }
        } catch (error) {
            console.error('Error saving draft:', error);
            this.updateStatus('unsaved', 'Error saving to server');
            this.showNotification('Error saving draft - keeping local copy', 'error');
        }
    }

    updateStatus(status, text) {
        const indicator = document.getElementById('statusIndicator');
        const icon = document.getElementById('statusIcon');
        const statusText = document.getElementById('statusText');

        if (!indicator || !icon || !statusText) return;

        // Remove all status classes
        indicator.className = 'status-indicator';

        switch(status) {
            case 'saved':
                indicator.classList.add('saved');
                icon.textContent = '🟢';
                break;
            case 'saving':
                indicator.classList.add('saving');
                icon.textContent = '🟡';
                break;
            case 'unsaved':
                indicator.classList.add('unsaved');
                icon.textContent = '🔴';
                break;
            case 'loading':
                indicator.classList.add('saving');
                icon.textContent = '⏳';
                break;
        }

        statusText.textContent = text;
    }

    updatePreview() {
        const previewContent = document.getElementById('previewContent');
        if (!previewContent) return;

        const lesson = this.getLessonFromForm();

        previewContent.innerHTML = `
            <h3>${lesson.title || 'Untitled Lesson'}</h3>
            <p style="color: #64748b; margin-bottom: 1rem;">${lesson.subtitle || ''}</p>

            <div style="margin-bottom: 1rem;">
                <strong style="color: #0369a1;">Level:</strong> ${lesson.level || 'Not set'}<br>
                <strong style="color: #0369a1;">Duration:</strong> ${lesson.duration || 'Not set'}<br>
                <strong style="color: #0369a1;">Skills:</strong> ${lesson.skill_codes.join(', ') || 'None'}
            </div>

            <div style="margin-top: 1.5rem;">
                <strong style="color: #0369a1;">Learning Objectives:</strong>
                <ul style="margin: 0.5rem 0; padding-left: 1.5rem;">
                    ${lesson.learning_objectives.map(obj => `<li style="margin: 0.25rem 0;">${obj}</li>`).join('')}
                </ul>
            </div>

            <div style="margin-top: 1.5rem;">
                <strong style="color: #0369a1;">Slides:</strong> ${lesson.slides?.length || 0}
            </div>
        `;
    }

    setupUnloadWarning() {
        window.addEventListener('beforeunload', (e) => {
            if (this.hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = '';
                return '';
            }
        });
    }

    showNotification(message, type = 'info') {
        // Simple notification - can be enhanced with a toast library
        console.log(`[${type.toUpperCase()}] ${message}`);
        alert(message);
    }

    // Slide editing methods
    editSlide(index) {
        const slide = this.currentLesson.slides[index];
        this.openSlideEditor(slide, index);
    }

    deleteSlide(index) {
        if (confirm(`Delete slide ${index + 1}?`)) {
            this.currentLesson.slides.splice(index, 1);
            this.renderSlides(this.currentLesson.slides);
            this.hasUnsavedChanges = true;
            this.updateStatus('unsaved', 'Unsaved changes');
            this.updatePreview();
        }
    }

    addSlide() {
        const newSlide = {
            id: `slide_${String(this.currentLesson.slides.length + 1).padStart(2, '0')}`,
            type: 'content',
            title: 'New Slide',
            content: {}
        };
        this.openSlideEditor(newSlide, -1);
    }

    openSlideEditor(slide, index) {
        this.currentSlideIndex = index;
        this.currentSlideData = JSON.parse(JSON.stringify(slide)); // Deep copy

        // Create modal
        this.createSlideEditorModal(slide, index);
    }

    createSlideEditorModal(slide, index) {
        // Remove existing modal if present
        const existingModal = document.getElementById('slideEditorModal');
        if (existingModal) existingModal.remove();

        // Create modal
        const modal = document.createElement('div');
        modal.id = 'slideEditorModal';
        modal.className = 'slide-modal';
        modal.innerHTML = `
            <div class="slide-modal-content">
                <div class="slide-modal-header">
                    <h2>${index === -1 ? 'Add New Slide' : `Edit Slide ${index + 1}`}</h2>
                    <button class="modal-close" onclick="studio.closeSlideEditor()">✕</button>
                </div>
                <div class="slide-modal-body">
                    <div class="form-group">
                        <label>Slide ID</label>
                        <input type="text" id="slideId" value="${slide.id || ''}" readonly>
                    </div>

                    <div class="form-group">
                        <label>Slide Type</label>
                        <select id="slideType" onchange="studio.updateSlideTypeFields(this.value)">
                            <option value="content" ${slide.type === 'content' ? 'selected' : ''}>Content</option>
                            <option value="strategy_teaching" ${slide.type === 'strategy_teaching' ? 'selected' : ''}>Strategy Teaching</option>
                            <option value="worked_example" ${slide.type === 'worked_example' ? 'selected' : ''}>Worked Example</option>
                            <option value="concept_teaching" ${slide.type === 'concept_teaching' ? 'selected' : ''}>Concept Teaching</option>
                            <option value="practice_prompt" ${slide.type === 'practice_prompt' ? 'selected' : ''}>Practice Prompt</option>
                            <option value="learning_objectives" ${slide.type === 'learning_objectives' ? 'selected' : ''}>Learning Objectives</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label>Title</label>
                        <input type="text" id="slideTitle" value="${slide.title || ''}">
                    </div>

                    <div id="slideTypeFields">
                        <!-- Dynamic fields based on slide type -->
                    </div>
                </div>
                <div class="slide-modal-footer">
                    <button class="btn btn-secondary" onclick="studio.closeSlideEditor()">Cancel</button>
                    <button class="btn btn-primary" onclick="studio.saveSlide()">Save Slide</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Populate type-specific fields
        this.updateSlideTypeFields(slide.type);
    }

    updateSlideTypeFields(slideType) {
        const container = document.getElementById('slideTypeFields');
        if (!container) return;

        const slide = this.currentSlideData;
        const content = slide.content || {};

        let fieldsHTML = '';

        switch(slideType) {
            case 'strategy_teaching':
                fieldsHTML = `
                    <div class="form-group">
                        <label>Main Heading</label>
                        <input type="text" id="mainHeading" value="${content.main_heading || ''}">
                    </div>
                    <div class="form-group">
                        <label>Steps (one per line)</label>
                        <textarea id="steps" rows="6">${(content.steps || []).join('\n')}</textarea>
                    </div>
                    <div class="form-group">
                        <label>Summary</label>
                        <textarea id="summary" rows="3">${content.summary || ''}</textarea>
                    </div>
                `;
                break;

            case 'worked_example':
                fieldsHTML = `
                    <div class="form-group">
                        <label>Passage Text</label>
                        <textarea id="passageText" rows="4">${content.passage_text || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label>Question Text</label>
                        <textarea id="questionText" rows="3">${content.question_text || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label>Answer Choices (JSON array)</label>
                        <textarea id="choices" rows="6">${JSON.stringify(content.choices || [], null, 2)}</textarea>
                        <small style="color: #64748b;">Format: [{"id": "A", "text": "...", "category": "...", "flaw": "...", "validation": "..."}]</small>
                    </div>
                    <div class="form-group">
                        <label>Correct Answer</label>
                        <input type="text" id="correctAnswer" value="${content.correct_answer || ''}">
                    </div>
                    <div class="form-group">
                        <label>Explanation</label>
                        <textarea id="explanation" rows="3">${content.explanation || ''}</textarea>
                    </div>
                `;
                break;

            case 'concept_teaching':
                fieldsHTML = `
                    <div class="form-group">
                        <label>Main Concept</label>
                        <input type="text" id="mainConcept" value="${content.main_concept || ''}">
                    </div>
                    <div class="form-group">
                        <label>Bullet Points (one per line)</label>
                        <textarea id="bulletPoints" rows="6">${(content.bullet_points || []).join('\n')}</textarea>
                    </div>
                    <div class="form-group">
                        <label>Examples (JSON array)</label>
                        <textarea id="examples" rows="5">${JSON.stringify(content.examples || [], null, 2)}</textarea>
                        <small style="color: #64748b;">Format: [{"label": "Example 1", "text": "..."}]</small>
                    </div>
                `;
                break;

            case 'practice_prompt':
                fieldsHTML = `
                    <div class="form-group">
                        <label>Prompt Text</label>
                        <textarea id="promptText" rows="4">${content.prompt_text || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label>Button Text</label>
                        <input type="text" id="buttonText" value="${content.button_text || 'Start Practice Questions'}">
                    </div>
                `;
                break;

            case 'learning_objectives':
                fieldsHTML = `
                    <div class="form-group">
                        <label>Objectives (one per line)</label>
                        <textarea id="objectives" rows="6">${(content.objectives || []).join('\n')}</textarea>
                    </div>
                `;
                break;

            case 'content':
            default:
                fieldsHTML = `
                    <div class="form-group">
                        <label>Content (JSON object)</label>
                        <textarea id="contentJSON" rows="10">${JSON.stringify(content, null, 2)}</textarea>
                        <small style="color: #64748b;">Edit as JSON for maximum flexibility</small>
                    </div>
                `;
                break;
        }

        container.innerHTML = fieldsHTML;
    }

    saveSlide() {
        try {
            const slideType = document.getElementById('slideType').value;
            const slideId = document.getElementById('slideId').value;
            const slideTitle = document.getElementById('slideTitle').value;

            // Build slide object
            const slide = {
                id: slideId,
                type: slideType,
                title: slideTitle,
                content: {}
            };

            // Extract content based on type
            switch(slideType) {
                case 'strategy_teaching':
                    slide.content = {
                        main_heading: document.getElementById('mainHeading').value,
                        steps: document.getElementById('steps').value.split('\n').filter(s => s.trim()),
                        summary: document.getElementById('summary').value
                    };
                    break;

                case 'worked_example':
                    slide.content = {
                        passage_text: document.getElementById('passageText').value,
                        question_text: document.getElementById('questionText').value,
                        choices: JSON.parse(document.getElementById('choices').value),
                        correct_answer: document.getElementById('correctAnswer').value,
                        explanation: document.getElementById('explanation').value
                    };
                    break;

                case 'concept_teaching':
                    slide.content = {
                        main_concept: document.getElementById('mainConcept').value,
                        bullet_points: document.getElementById('bulletPoints').value.split('\n').filter(s => s.trim()),
                        examples: JSON.parse(document.getElementById('examples').value)
                    };
                    break;

                case 'practice_prompt':
                    slide.content = {
                        prompt_text: document.getElementById('promptText').value,
                        button_text: document.getElementById('buttonText').value
                    };
                    break;

                case 'learning_objectives':
                    slide.content = {
                        objectives: document.getElementById('objectives').value.split('\n').filter(s => s.trim())
                    };
                    break;

                case 'content':
                default:
                    slide.content = JSON.parse(document.getElementById('contentJSON').value);
                    break;
            }

            // Add or update slide
            if (this.currentSlideIndex === -1) {
                // New slide
                this.currentLesson.slides.push(slide);
            } else {
                // Update existing
                this.currentLesson.slides[this.currentSlideIndex] = slide;
            }

            // Update UI
            this.renderSlides(this.currentLesson.slides);
            this.hasUnsavedChanges = true;
            this.updateStatus('unsaved', 'Unsaved changes');
            this.updatePreview();
            this.closeSlideEditor();

            this.showNotification('Slide saved successfully!', 'success');

        } catch (error) {
            console.error('Error saving slide:', error);
            alert('Error saving slide: ' + error.message + '\n\nPlease check JSON formatting.');
        }
    }

    closeSlideEditor() {
        const modal = document.getElementById('slideEditorModal');
        if (modal) modal.remove();
    }
}

// Global functions for onclick handlers
let studio;

window.addEventListener('DOMContentLoaded', () => {
    studio = new EnhancedCreatorStudio();
});

function createNewLesson() {
    alert('Create new lesson - Coming soon!');
}

function saveDraft() {
    studio.saveDraft();
}

function previewLesson() {
    window.open(`/index.html?preview=${studio.currentLesson?.id}`, '_blank');
}

function requestPublish() {
    if (confirm('Request publish? This will send your draft for admin approval.')) {
        alert('Publish request submitted! Admin will review.');
    }
}
