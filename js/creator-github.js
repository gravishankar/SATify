/**
 * SATify Enhanced Creator Studio - GitHub Edition
 * Features: Auto-save, Draft Management, Version Control, Live Preview
 * Uses GitHub API instead of server API calls
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
        console.log('🚀 Enhanced Creator Studio (GitHub Edition) initializing...');

        // Initialize GitHub API
        const authenticated = await githubAPI.init();

        if (!authenticated) {
            // Show authentication UI
            this.showAuthenticationUI();
            return;
        }

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

        // Load last backup time
        this.updateLastBackupTime();

        console.log('✅ Enhanced Creator Studio ready');
    }

    showAuthenticationUI() {
        const authMessage = document.createElement('div');
        authMessage.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            max-width: 500px;
            z-index: 10000;
        `;
        authMessage.innerHTML = `
            <h2 style="color: #0369a1; margin-bottom: 1rem;">GitHub Authentication Required</h2>
            <p style="color: #64748b; margin-bottom: 1.5rem;">
                This Creator Studio needs access to GitHub to save your work.
                Click the button below to authenticate.
            </p>
            <button onclick="studio.handleAuthentication()" style="
                background: #0369a1;
                color: white;
                border: none;
                padding: 0.75rem 1.5rem;
                border-radius: 6px;
                font-weight: 600;
                cursor: pointer;
                font-size: 1rem;
                width: 100%;
            ">Authenticate with GitHub</button>
        `;
        document.body.appendChild(authMessage);
    }

    async handleAuthentication() {
        const success = githubAPI.authenticate();
        if (success) {
            // Verify token
            const isValid = await githubAPI.verifyToken();
            if (isValid) {
                githubAPI.authenticated = true;
                location.reload(); // Reload page after authentication
            } else {
                alert('Authentication failed. Please check your token and try again.');
            }
        }
    }

    async updateLastBackupTime() {
        try {
            const timeDisplay = document.getElementById('lastBackupTime');
            if (!timeDisplay) return;

            if (!githubAPI.authenticated) {
                timeDisplay.textContent = '';
                return;
            }

            const data = await githubAPI.getLastBackupTime();

            if (data.lastBackup) {
                const backupDate = new Date(data.lastBackup);
                if (isNaN(backupDate.getTime())) {
                    timeDisplay.textContent = 'Invalid backup date';
                    return;
                }
                const timeAgo = this.getTimeAgo(backupDate);
                timeDisplay.textContent = `Last backup: ${timeAgo}`;
            } else {
                timeDisplay.textContent = 'No backups yet';
            }
        } catch (error) {
            console.error('Error getting backup status:', error);
            const timeDisplay = document.getElementById('lastBackupTime');
            if (timeDisplay) timeDisplay.textContent = '';
        }
    }

    getTimeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000);

        if (seconds < 60) return 'just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    }

    async loadLessons() {
        try {
            const manifest = await githubAPI.loadManifest();
            if (manifest) {
                this.lessons = Object.values(manifest.lessons);
                this.renderLessonList();
            }
        } catch (error) {
            console.error('Error loading lessons:', error);
            this.showNotification('Error loading lessons', 'error');
        }
    }

    renderLessonList() {
        const lessonList = document.getElementById('lessonList');
        if (!lessonList) return;

        lessonList.innerHTML = this.lessons.map(lesson => `
            <li class="lesson-item" onclick="studio.loadLesson('${lesson.id}', event)">
                <div class="lesson-title">${lesson.title}</div>
                <div class="lesson-meta">${lesson.skill_codes.join(', ')} • ${lesson.slide_count} slides</div>
            </li>
        `).join('');
    }

    async loadLesson(lessonId, event) {
        try {
            this.updateStatus('loading', 'Loading lesson...');

            // Find the lesson metadata from manifest
            const lessonMeta = this.lessons.find(l => l.id === lessonId);
            const filepath = lessonMeta?.filepath || `lessons/${lessonId}.json`;

            // Use GitHub API to load lesson (tries draft first, then published)
            const result = await githubAPI.loadLesson(lessonId, filepath);

            this.currentLesson = result.data;
            this.currentLesson._sha = result.sha; // Store SHA for updates
            this.currentLesson._isDraft = result.isDraft;

            this.populateForm(result.data);
            this.updatePreview();
            this.updateStatus('saved', 'Lesson loaded');

            // Mark active in list (if event is provided)
            if (event && event.target) {
                document.querySelectorAll('.lesson-item').forEach(item => item.classList.remove('active'));
                event.target.closest('.lesson-item')?.classList.add('active');
            }

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
            <div class="slide-editor"
                 data-slide-index="${index}"
                 draggable="true"
                 ondragstart="studio.handleDragStart(event, ${index})"
                 ondragover="studio.handleDragOver(event)"
                 ondrop="studio.handleDrop(event, ${index})"
                 ondragend="studio.handleDragEnd(event)">
                <div class="slide-header">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <span class="drag-handle" style="cursor: grab; color: #94a3b8; font-size: 1.2rem;">☰</span>
                        <span class="slide-number">Slide ${index + 1}: ${slide.title || 'Untitled'}</span>
                    </div>
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

    // Drag and drop handlers
    handleDragStart(event, index) {
        this.draggedIndex = index;
        event.currentTarget.style.opacity = '0.4';
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/html', event.currentTarget.innerHTML);
    }

    handleDragOver(event) {
        if (event.preventDefault) {
            event.preventDefault();
        }
        event.dataTransfer.dropEffect = 'move';
        event.currentTarget.style.borderTop = '3px solid #0369a1';
        return false;
    }

    handleDrop(event, targetIndex) {
        if (event.stopPropagation) {
            event.stopPropagation();
        }

        event.currentTarget.style.borderTop = '';

        if (this.draggedIndex !== targetIndex && this.draggedIndex !== undefined) {
            // Reorder slides
            const slides = this.currentLesson.slides;
            const draggedSlide = slides[this.draggedIndex];

            // Remove from old position
            slides.splice(this.draggedIndex, 1);

            // Insert at new position
            if (this.draggedIndex < targetIndex) {
                slides.splice(targetIndex - 1, 0, draggedSlide);
            } else {
                slides.splice(targetIndex, 0, draggedSlide);
            }

            // Update UI
            this.renderSlides(slides);
            this.hasUnsavedChanges = true;
            this.updateStatus('unsaved', 'Unsaved changes - slides reordered');
            this.updatePreview();
        }

        return false;
    }

    handleDragEnd(event) {
        event.currentTarget.style.opacity = '1';

        // Remove all border highlights
        document.querySelectorAll('.slide-editor').forEach(slide => {
            slide.style.borderTop = '';
        });

        this.draggedIndex = undefined;
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

        // Preserve SHA if exists
        if (this.currentLesson?._sha) {
            lesson._sha = this.currentLesson._sha;
        }

        return lesson;
    }

    async saveDraft() {
        try {
            // Check if a lesson is loaded
            if (!this.currentLesson || !this.currentLesson.id) {
                this.showNotification('Please load a lesson first before saving', 'error');
                return;
            }

            this.updateStatus('saving', 'Saving draft...');

            const lesson = this.getLessonFromForm();

            // Save to GitHub using GitHub API
            const result = await githubAPI.saveDraft(lesson);

            if (result.success) {
                this.hasUnsavedChanges = false;
                this.lastSaved = new Date();
                this.updateStatus('saved', 'Draft saved successfully');
                this.showNotification('Draft saved to GitHub ✓', 'success');

                // Update SHA for future updates
                if (result.sha && this.currentLesson) {
                    this.currentLesson._sha = result.sha;
                }

                // Create version snapshot
                try {
                    await githubAPI.createVersionSnapshot(lesson);
                } catch (snapError) {
                    console.warn('Version snapshot failed:', snapError);
                    // Don't fail the save if snapshot fails
                }

                // Clear localStorage after successful GitHub save
                localStorage.removeItem('satify_draft');

                // Update last backup time
                this.updateLastBackupTime();
            } else {
                throw new Error('Save failed');
            }
        } catch (error) {
            console.error('Error saving draft:', error);
            this.updateStatus('unsaved', 'Error saving to GitHub');
            this.showNotification(`Error saving draft: ${error.message}`, 'error');
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
            <div style="margin-bottom: 1.5rem;">
                <h3 style="color: #0369a1; font-size: 1.3rem; margin-bottom: 0.5rem;">${lesson.title || 'Untitled Lesson'}</h3>
                <p style="color: #64748b; font-size: 0.95rem;">${lesson.subtitle || ''}</p>
            </div>

            <div style="background: #f8fafc; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; border-left: 3px solid #0369a1;">
                <div style="font-size: 0.85rem; color: #64748b; margin-bottom: 0.5rem;">
                    <strong>Level:</strong> ${lesson.level || 'Not set'}
                </div>
                <div style="font-size: 0.85rem; color: #64748b; margin-bottom: 0.5rem;">
                    <strong>Duration:</strong> ${lesson.duration || 'Not set'}
                </div>
                <div style="font-size: 0.85rem; color: #64748b;">
                    <strong>Skills:</strong> ${lesson.skill_codes.join(', ') || 'None'}
                </div>
            </div>

            <div style="margin-bottom: 1.5rem;">
                <strong style="color: #0369a1; font-size: 1rem; display: block; margin-bottom: 0.75rem;">🎯 Learning Objectives</strong>
                <ul style="margin: 0; padding-left: 1.5rem; color: #475569;">
                    ${lesson.learning_objectives.map(obj => `<li style="margin: 0.5rem 0; line-height: 1.5;">${obj}</li>`).join('')}
                </ul>
            </div>

            <div style="margin-bottom: 1.5rem;">
                <strong style="color: #0369a1; font-size: 1rem; display: block; margin-bottom: 0.75rem;">📑 Slides (${lesson.slides?.length || 0})</strong>
                ${this.renderPreviewSlides(lesson.slides || [])}
            </div>

            <div style="text-align: center; padding: 1.5rem; background: #e0f2fe; border-radius: 8px; margin-top: 1.5rem;">
                <button onclick="studio.openFullPreview()" style="background: #0369a1; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 0.95rem;">
                    🚀 Open Full Preview
                </button>
            </div>
        `;
    }

    renderPreviewSlides(slides) {
        if (!slides || slides.length === 0) {
            return '<p style="color: #94a3b8; font-style: italic;">No slides yet</p>';
        }

        return slides.map((slide, index) => {
            const typeIcons = {
                'strategy_teaching': '📚',
                'worked_example': '🎯',
                'concept_teaching': '💡',
                'practice_prompt': '✏️',
                'learning_objectives': '🎯',
                'introduction': '👋',
                'content': '📄'
            };

            const icon = typeIcons[slide.type] || '📄';

            return `
                <div style="background: white; border: 1px solid #cbd5e1; border-radius: 6px; padding: 1rem; margin-bottom: 0.75rem; transition: all 0.2s;"
                     onmouseover="this.style.borderColor='#0369a1'; this.style.boxShadow='0 2px 4px rgba(3,105,161,0.1)'"
                     onmouseout="this.style.borderColor='#cbd5e1'; this.style.boxShadow='none'">
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <div style="flex: 1;">
                            <div style="font-weight: 600; color: #1e293b; margin-bottom: 0.25rem;">
                                ${icon} Slide ${index + 1}: ${slide.title || 'Untitled'}
                            </div>
                            <div style="font-size: 0.8rem; color: #64748b;">
                                Type: ${this.formatSlideType(slide.type)}
                            </div>
                        </div>
                        <button onclick="studio.editSlide(${index})" style="background: #e2e8f0; border: none; padding: 0.5rem 0.75rem; border-radius: 4px; cursor: pointer; font-size: 0.85rem;">
                            Edit
                        </button>
                    </div>
                    ${this.renderSlidePreviewContent(slide)}
                </div>
            `;
        }).join('');
    }

    formatSlideType(type) {
        const typeNames = {
            'strategy_teaching': 'Strategy Teaching',
            'worked_example': 'Worked Example',
            'concept_teaching': 'Concept Teaching',
            'practice_prompt': 'Practice Prompt',
            'learning_objectives': 'Learning Objectives',
            'introduction': 'Introduction',
            'content': 'Content'
        };
        return typeNames[type] || type;
    }

    renderSlidePreviewContent(slide) {
        const content = slide.content || {};

        switch(slide.type) {
            case 'strategy_teaching':
                return `
                    <div style="margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid #e2e8f0; font-size: 0.85rem;">
                        <div style="color: #64748b;"><strong>Steps:</strong> ${content.steps?.length || 0}</div>
                        ${content.main_heading ? `<div style="color: #64748b; margin-top: 0.25rem;"><strong>Heading:</strong> ${content.main_heading}</div>` : ''}
                    </div>
                `;

            case 'worked_example':
                return `
                    <div style="margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid #e2e8f0; font-size: 0.85rem;">
                        <div style="color: #64748b;"><strong>Choices:</strong> ${content.choices?.length || 0}</div>
                        ${content.correct_answer ? `<div style="color: #10b981; margin-top: 0.25rem;"><strong>Answer:</strong> ${content.correct_answer}</div>` : ''}
                    </div>
                `;

            case 'concept_teaching':
                return `
                    <div style="margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid #e2e8f0; font-size: 0.85rem;">
                        ${content.main_concept ? `<div style="color: #64748b;"><strong>Concept:</strong> ${content.main_concept}</div>` : ''}
                        <div style="color: #64748b; margin-top: 0.25rem;"><strong>Points:</strong> ${content.bullet_points?.length || 0}</div>
                    </div>
                `;

            default:
                return '';
        }
    }

    openFullPreview() {
        const lesson = this.getLessonFromForm();

        // Save to localStorage for preview (same keys as previewLesson function)
        localStorage.setItem('preview_lesson_data', JSON.stringify(lesson));
        localStorage.setItem('preview_lesson_id', lesson.id);

        // Open preview in new window
        window.open('/preview-lesson.html', 'lesson-preview', 'width=1200,height=800');
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
    if (!studio.currentLesson || !studio.currentLesson.id) {
        alert('Please load or create a lesson first!');
        return;
    }

    // Get current lesson state from form
    const lesson = studio.getLessonFromForm();

    // Save to localStorage for preview
    localStorage.setItem('preview_lesson_data', JSON.stringify(lesson));
    localStorage.setItem('preview_lesson_id', lesson.id);

    // Open preview in new window
    window.open('/preview-lesson.html', 'lesson-preview', 'width=1200,height=800');
}

function requestPublish() {
    if (confirm('Request publish? This will send your draft for admin approval.')) {
        alert('Publish request submitted! Admin will review.');
    }
}

async function backupToGitHub() {
    const button = document.getElementById('backupButton');
    const originalText = button.innerHTML;

    try {
        button.disabled = true;
        button.innerHTML = '⏳ Backing up...';

        // In GitHub version, this is handled by saveDraft
        await studio.saveDraft();

        alert('✅ Draft backed up to GitHub!');

        // Update last backup time
        studio.updateLastBackupTime();

    } catch (error) {
        console.error('Backup error:', error);
        alert(`❌ Backup failed: ${error.message}`);
    } finally {
        button.disabled = false;
        button.innerHTML = originalText;
    }
}
