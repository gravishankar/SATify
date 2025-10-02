/**
 * SATify Admin Review System
 * Handles lesson approval workflow
 */

class AdminReviewSystem {
    constructor() {
        this.drafts = [];
        this.published = [];
        this.init();
    }

    async init() {
        console.log('🛡️ Admin Review System initializing...');
        await this.loadDrafts();
        await this.loadPublished();
        this.updateStats();
        this.renderPendingLessons();
    }

    async loadDrafts() {
        try {
            const response = await fetch('/api/lessons');
            const manifest = await response.json();

            // Load all lessons that have drafts
            const draftPromises = Object.keys(manifest.lessons).map(async (lessonId) => {
                try {
                    const draftResponse = await fetch(`/api/load-draft/${lessonId}`);
                    if (draftResponse.ok) {
                        const draft = await draftResponse.json();
                        return { lessonId, draft, hasDraft: true };
                    }
                } catch (e) {
                    return null;
                }
                return null;
            });

            const results = await Promise.all(draftPromises);
            this.drafts = results.filter(r => r !== null && r.hasDraft);

            console.log(`📝 Found ${this.drafts.length} drafts`);
        } catch (error) {
            console.error('Error loading drafts:', error);
        }
    }

    async loadPublished() {
        try {
            const response = await fetch('/api/lessons');
            const manifest = await response.json();

            const publishedPromises = Object.keys(manifest.lessons).map(async (lessonId) => {
                try {
                    const pubResponse = await fetch(`lessons/${lessonId}.json`);
                    if (pubResponse.ok) {
                        const published = await pubResponse.json();
                        return { lessonId, published };
                    }
                } catch (e) {
                    return null;
                }
                return null;
            });

            const results = await Promise.all(publishedPromises);
            this.published = results.filter(r => r !== null).reduce((acc, item) => {
                acc[item.lessonId] = item.published;
                return acc;
            }, {});

            console.log(`📚 Loaded ${Object.keys(this.published).length} published lessons`);
        } catch (error) {
            console.error('Error loading published lessons:', error);
        }
    }

    updateStats() {
        document.getElementById('pendingCount').textContent = this.drafts.length;
        document.getElementById('publishedCount').textContent = Object.keys(this.published).length;
        document.getElementById('draftCount').textContent = this.drafts.length;
    }

    renderPendingLessons() {
        const container = document.getElementById('pendingLessons');

        if (this.drafts.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">✅</div>
                    <h2>All caught up!</h2>
                    <p>No pending lesson reviews at the moment.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.drafts.map(({ lessonId, draft }) => {
            const published = this.published[lessonId];
            return this.renderLessonCard(lessonId, draft, published);
        }).join('');
    }

    renderLessonCard(lessonId, draft, published) {
        const changes = this.detectChanges(draft, published);

        return `
            <div class="lesson-card" data-lesson-id="${lessonId}">
                <div class="lesson-card-header">
                    <h2>${draft.title || 'Untitled Lesson'}</h2>
                    <div class="lesson-meta">
                        <span>📚 ${lessonId}</span>
                        <span>🎯 ${(draft.skill_codes || []).join(', ')}</span>
                        <span>⏱️ ${draft.duration || 'N/A'}</span>
                        <span>📊 ${draft.slides?.length || 0} slides</span>
                    </div>
                </div>

                <div class="comparison-container">
                    <div class="version-panel draft">
                        <h3>✏️ Draft Version (Pending)</h3>
                        ${this.renderVersionContent(draft, changes, true)}
                    </div>

                    <div class="version-panel published">
                        <h3>📖 Published Version (Current)</h3>
                        ${published ? this.renderVersionContent(published, changes, false) : '<p style="color: #94a3b8;">No published version yet</p>'}
                    </div>
                </div>

                <div class="action-panel">
                    <div style="color: #64748b; font-size: 0.9rem;">
                        <strong>${changes.count} change${changes.count !== 1 ? 's' : ''}</strong> detected
                    </div>
                    <div class="action-buttons">
                        <button class="btn btn-preview" onclick="adminReview.previewLesson('${lessonId}')">
                            👁️ Preview
                        </button>
                        <button class="btn btn-reject" onclick="adminReview.rejectLesson('${lessonId}')">
                            ✕ Reject
                        </button>
                        <button class="btn btn-approve" onclick="adminReview.approveLesson('${lessonId}')">
                            ✓ Approve & Publish
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    renderVersionContent(version, changes, isDraft) {
        return `
            <div class="field-group">
                <div class="field-label">Title</div>
                <div class="field-value ${changes.title && isDraft ? 'field-diff' : ''}">
                    ${version.title || 'N/A'}
                </div>
            </div>

            <div class="field-group">
                <div class="field-label">Subtitle</div>
                <div class="field-value ${changes.subtitle && isDraft ? 'field-diff' : ''}">
                    ${version.subtitle || 'N/A'}
                </div>
            </div>

            <div class="field-group">
                <div class="field-label">Level & Duration</div>
                <div class="field-value ${changes.metadata && isDraft ? 'field-diff' : ''}">
                    ${version.level || 'N/A'} • ${version.duration || 'N/A'}
                </div>
            </div>

            <div class="field-group">
                <div class="field-label">Learning Objectives</div>
                <div class="field-value ${changes.objectives && isDraft ? 'field-diff' : ''}">
                    <ul style="margin: 0.5rem 0; padding-left: 1.5rem;">
                        ${(version.learning_objectives || []).map(obj => `<li style="margin: 0.25rem 0;">${obj}</li>`).join('')}
                    </ul>
                </div>
            </div>

            <div class="field-group">
                <div class="field-label">Slides (${version.slides?.length || 0})</div>
                <div class="slides-summary">
                    ${(version.slides || []).slice(0, 5).map((slide, idx) => {
                        const status = changes.slideChanges?.[idx] || '';
                        return `<div class="slide-badge ${status}">${slide.id || `Slide ${idx + 1}`}</div>`;
                    }).join('')}
                    ${version.slides?.length > 5 ? `<div class="slide-badge">+${version.slides.length - 5} more</div>` : ''}
                </div>
            </div>
        `;
    }

    detectChanges(draft, published) {
        if (!published) {
            return { count: 1, isNew: true };
        }

        const changes = {
            count: 0,
            title: draft.title !== published.title,
            subtitle: draft.subtitle !== published.subtitle,
            metadata: draft.level !== published.level || draft.duration !== published.duration,
            objectives: JSON.stringify(draft.learning_objectives) !== JSON.stringify(published.learning_objectives),
            slideCount: draft.slides?.length !== published.slides?.length,
            slideChanges: {}
        };

        if (changes.title) changes.count++;
        if (changes.subtitle) changes.count++;
        if (changes.metadata) changes.count++;
        if (changes.objectives) changes.count++;
        if (changes.slideCount) changes.count++;

        // Detect slide-level changes
        const maxSlides = Math.max(draft.slides?.length || 0, published.slides?.length || 0);
        for (let i = 0; i < maxSlides; i++) {
            const draftSlide = draft.slides?.[i];
            const pubSlide = published.slides?.[i];

            if (!pubSlide && draftSlide) {
                changes.slideChanges[i] = 'new';
                changes.count++;
            } else if (draftSlide && pubSlide) {
                if (JSON.stringify(draftSlide) !== JSON.stringify(pubSlide)) {
                    changes.slideChanges[i] = 'modified';
                    changes.count++;
                }
            }
        }

        return changes;
    }

    async approveLesson(lessonId) {
        if (!confirm(`Approve and publish changes for ${lessonId}?\n\nThis will make the draft version live for all students.`)) {
            return;
        }

        try {
            console.log(`✅ Approving lesson: ${lessonId}`);

            const response = await fetch('/api/publish-lesson', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lessonId })
            });

            if (response.ok) {
                alert(`✅ Lesson ${lessonId} published successfully!`);
                // Reload to refresh the list
                window.location.reload();
            } else {
                const error = await response.json();
                throw new Error(error.details || 'Failed to publish');
            }
        } catch (error) {
            console.error('Error approving lesson:', error);
            alert(`Error publishing lesson: ${error.message}`);
        }
    }

    async rejectLesson(lessonId) {
        const reason = prompt(`Why are you rejecting changes for ${lessonId}?\n\nThis feedback will be saved for the content creator.`);

        if (!reason) return;

        try {
            console.log(`❌ Rejecting lesson: ${lessonId}`);

            // Save rejection note
            await fetch('/api/reject-lesson', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lessonId, reason, timestamp: new Date().toISOString() })
            });

            alert(`Rejection recorded. The content creator will be notified.`);

            // Remove from pending list
            this.drafts = this.drafts.filter(d => d.lessonId !== lessonId);
            this.updateStats();
            this.renderPendingLessons();
        } catch (error) {
            console.error('Error rejecting lesson:', error);
            alert(`Error recording rejection: ${error.message}`);
        }
    }

    previewLesson(lessonId) {
        // Open preview in new tab
        window.open(`/index.html?preview=${lessonId}&draft=true`, '_blank');
    }
}

// Initialize admin review system
let adminReview;

window.addEventListener('DOMContentLoaded', () => {
    adminReview = new AdminReviewSystem();
});
