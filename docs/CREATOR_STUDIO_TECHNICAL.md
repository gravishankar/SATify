# SATify Creator Studio - Technical Documentation

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [System Components](#system-components)
3. [API Reference](#api-reference)
4. [Data Models](#data-models)
5. [File Structure](#file-structure)
6. [Workflow & State Management](#workflow--state-management)
7. [Security & Data Protection](#security--data-protection)
8. [Development Guide](#development-guide)
9. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

### System Design
The Creator Studio follows a client-server architecture with multiple layers of data protection:

```
┌─────────────────────────────────────────────────────────┐
│                    Client Layer                         │
├─────────────────────────────────────────────────────────┤
│  Creator Studio UI  │  Admin Review UI  │  Preview UI  │
│  (creator-enhanced) │  (admin-review)   │  (lesson)    │
└──────────────┬──────────────────┬───────────────────────┘
               │                  │
               ▼                  ▼
┌─────────────────────────────────────────────────────────┐
│                   API Layer (Express.js)                │
├─────────────────────────────────────────────────────────┤
│  Draft Management  │  Publish  │  Rollback  │  Reject  │
└──────────────┬──────────────────┬───────────────────────┘
               │                  │
               ▼                  ▼
┌─────────────────────────────────────────────────────────┐
│                   Data Layer                            │
├─────────────────────────────────────────────────────────┤
│  Published Lessons  │  Drafts  │  Versions  │  Backups │
│  /lessons/*.json    │  /drafts │  /versions │  /backup │
└─────────────────────────────────────────────────────────┘
```

### Technology Stack
- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Backend**: Node.js, Express.js
- **Storage**: File-based JSON (lessons/, drafts/, backups/)
- **State Management**: Class-based with localStorage caching
- **UI Framework**: Custom component system

---

## System Components

### 1. Enhanced Creator Studio (`creator-enhanced.html` + `js/creator-enhanced.js`)

**Purpose**: Visual lesson editor for content creators

**Key Classes**:
```javascript
class EnhancedCreatorStudio {
    constructor()
    async init()
    async loadLessons()
    async loadLesson(lessonId)
    populateForm(lesson)
    renderSlides(slides)

    // Auto-save
    startAutoSave()
    autoSaveToLocalStorage()
    saveToLocalStorage()
    restoreFromLocalStorage()
    async saveDraft()

    // Slide Management
    openSlideEditor(slide, index)
    createSlideEditorModal(slide, index)
    updateSlideTypeFields(slideType)
    saveSlide()
    deleteSlide(index)
    addSlide()

    // Drag & Drop
    handleDragStart(event, index)
    handleDragOver(event)
    handleDrop(event, targetIndex)
    handleDragEnd(event)

    // Preview
    updatePreview()
    renderPreviewSlides(slides)
    renderSlidePreviewContent(slide)
    openFullPreview()

    // UI Management
    updateStatus(status, text)
    setupChangeListeners()
    setupUnloadWarning()
}
```

**State Management**:
```javascript
{
    currentLesson: Object,      // Currently loaded lesson
    autoSaveInterval: Number,   // Interval ID for auto-save
    lastSaved: Date,            // Last save timestamp
    hasUnsavedChanges: Boolean, // Dirty flag
    lessons: Array,             // All available lessons
    draggedIndex: Number,       // Current dragged slide index
    currentSlideIndex: Number,  // Slide being edited
    currentSlideData: Object    // Slide data in modal
}
```

**Auto-Save Flow**:
```
Every 30 seconds:
├─ Check hasUnsavedChanges
├─ If true → saveToLocalStorage()
├─ Update status indicator
└─ Log timestamp

On form change:
├─ Set hasUnsavedChanges = true
├─ Update status to "unsaved"
└─ Trigger saveToLocalStorage()

On manual save:
├─ Call saveDraft() API
├─ Create version snapshot
├─ Clear hasUnsavedChanges
└─ Update status to "saved"
```

### 2. Admin Review Dashboard (`admin-review.html` + `js/admin-review.js`)

**Purpose**: Review and approve lesson changes before publishing

**Key Classes**:
```javascript
class AdminReviewSystem {
    constructor()
    async init()
    async loadDrafts()
    async loadPublished()
    updateStats()
    renderPendingLessons()

    // Comparison
    renderLessonCard(lessonId, draft, published)
    renderVersionContent(version, changes, isDraft)
    detectChanges(draft, published)

    // Actions
    async approveLesson(lessonId)
    async rejectLesson(lessonId)
    previewLesson(lessonId)
}
```

**Change Detection Algorithm**:
```javascript
function detectChanges(draft, published) {
    if (!published) return { count: 1, isNew: true };

    const changes = {
        count: 0,
        title: draft.title !== published.title,
        subtitle: draft.subtitle !== published.subtitle,
        metadata: draft.level !== published.level ||
                  draft.duration !== published.duration,
        objectives: JSON.stringify(draft.learning_objectives) !==
                    JSON.stringify(published.learning_objectives),
        slideCount: draft.slides?.length !== published.slides?.length,
        slideChanges: {}
    };

    // Count field-level changes
    Object.keys(changes).forEach(key => {
        if (key !== 'count' && key !== 'slideChanges' && changes[key]) {
            changes.count++;
        }
    });

    // Detect slide-level changes
    for (let i = 0; i < Math.max(draft.slides.length, published.slides.length); i++) {
        const draftSlide = draft.slides[i];
        const pubSlide = published.slides[i];

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
```

### 3. Backend API Server (`server.js`)

**Express.js Configuration**:
```javascript
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json({ limit: '10mb' }));
app.use(express.static('.'));

// CORS for local development
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});
```

---

## API Reference

### Draft Management

#### `POST /api/save-draft`
Save lesson draft with automatic version snapshot.

**Request**:
```json
{
  "id": "lesson_05",
  "title": "Transitions & Flow",
  "subtitle": "Expression of Ideas",
  "level": "Foundation",
  "duration": "20-25 min",
  "skill_codes": ["TRA"],
  "learning_objectives": ["Objective 1", "Objective 2"],
  "slides": [...],
  "metadata": {
    "last_updated": "2025-10-02T07:00:00.000Z",
    "content_version": "1.0"
  }
}
```

**Response**:
```json
{
  "success": true,
  "message": "Draft saved successfully",
  "paths": {
    "draft": "/Users/.../lessons/drafts/lesson_05.json",
    "version": "/Users/.../lessons/drafts/versions/lesson_05_2025-10-02T02-08-23-551Z.json"
  }
}
```

#### `POST /api/git-backup-drafts`
Backup all draft lessons to GitHub repository.

**Purpose**: Creates a Git commit with all changes in `lessons/drafts/` folder and pushes to remote repository.

**Request**: No body required (POST only)

**Response**:
```json
{
  "success": true,
  "message": "Drafts backed up to GitHub successfully",
  "committed": true,
  "timestamp": "Oct 2, 2025, 03:45 PM"
}
```

**Response (no changes)**:
```json
{
  "success": true,
  "message": "No draft changes to backup",
  "committed": false
}
```

**Error Response**:
```json
{
  "error": "Failed to backup drafts to GitHub",
  "details": "error message"
}
```

**Implementation Details**:
- Checks for uncommitted changes with `git status --porcelain lessons/drafts/`
- Only commits if changes exist
- Commit message includes timestamp and Claude Code attribution
- Automatically pushes to `origin main` branch
- Handles "nothing to commit" gracefully

#### `GET /api/git-backup-status`
Get the timestamp of the last Git backup.

**Purpose**: Retrieves the last commit time that modified the `lessons/drafts/` folder.

**Request**: No parameters

**Response**:
```json
{
  "lastBackup": "2025-10-02 15:45:23 -0400",
  "commitMessage": "Backup lesson drafts - Oct 2, 2025, 03:45 PM",
  "message": "Backup status retrieved"
}
```

**Response (no backups)**:
```json
{
  "lastBackup": null,
  "message": "No backup commits found"
}
```

**Implementation Details**:
- Uses `git log -1 --format="%ai|%s" -- lessons/drafts/`
- Parses timestamp and commit message
- Returns null if no backup commits exist
- Client displays time in "X ago" format (e.g., "5m ago", "2h ago")

**Implementation**:
```javascript
app.post('/api/save-draft', async (req, res) => {
    try {
        const lesson = req.body;

        // Save to drafts folder
        const draftPath = path.join(__dirname, 'lessons', 'drafts', `${lesson.id}.json`);
        await fs.writeFile(draftPath, JSON.stringify(lesson, null, 2));

        // Create version snapshot
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const versionPath = path.join(__dirname, 'lessons', 'drafts', 'versions',
                                       `${lesson.id}_${timestamp}.json`);
        await fs.writeFile(versionPath, JSON.stringify(lesson, null, 2));

        res.json({
            success: true,
            message: 'Draft saved successfully',
            paths: { draft: draftPath, version: versionPath }
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to save draft',
            details: error.message
        });
    }
});
```

#### `GET /api/load-draft/:lessonId`
Load a specific lesson draft.

**Response**:
```json
{
  "id": "lesson_05",
  "title": "Transitions & Flow",
  ...
}
```

#### `GET /api/versions/:lessonId`
List all version snapshots for a lesson.

**Response**:
```json
[
  {
    "filename": "lesson_05_2025-10-02T02-08-23-551Z.json",
    "timestamp": "2025-10-02 02:08:23"
  },
  ...
]
```

### Publishing Workflow

#### `POST /api/publish-lesson`
Publish a draft lesson to production (creates backup).

**Request**:
```json
{
  "lessonId": "lesson_05"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Lesson published successfully",
  "publishPath": "/Users/.../lessons/lesson_05.json"
}
```

**Implementation**:
```javascript
app.post('/api/publish-lesson', async (req, res) => {
    try {
        const { lessonId } = req.body;
        const draftPath = path.join(__dirname, 'lessons', 'drafts', `${lessonId}.json`);
        const publishPath = path.join(__dirname, 'lessons', `${lessonId}.json`);

        // Backup current published version
        try {
            const currentContent = await fs.readFile(publishPath, 'utf-8');
            const backupPath = path.join(__dirname, 'lessons', 'backup', 'published',
                                          `${lessonId}_backup.json`);
            await fs.writeFile(backupPath, currentContent);
        } catch (err) {
            console.log('No existing published version to backup');
        }

        // Copy draft to published
        const draftContent = await fs.readFile(draftPath, 'utf-8');
        await fs.writeFile(publishPath, draftContent);

        res.json({
            success: true,
            message: 'Lesson published successfully',
            publishPath
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to publish lesson',
            details: error.message
        });
    }
});
```

#### `POST /api/rollback-lesson`
Restore a lesson to its previous published version.

**Request**:
```json
{
  "lessonId": "lesson_05"
}
```

#### `POST /api/reject-lesson`
Reject a lesson draft with feedback.

**Request**:
```json
{
  "lessonId": "lesson_05",
  "reason": "Please fix the grammar in slide 3",
  "timestamp": "2025-10-02T07:00:00.000Z"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Rejection recorded successfully",
  "rejectionPath": "/Users/.../lessons/drafts/rejections/lesson_05_rejection.json"
}
```

### Utility Endpoints

#### `GET /api/health`
Health check endpoint.

**Response**:
```json
{
  "status": "ok",
  "message": "Creator Studio Server is running"
}
```

#### `GET /api/lessons`
Get lessons manifest with all lesson metadata.

**Response**:
```json
{
  "version": "2.1",
  "created": "2024-09-27",
  "updated": "2024-12-01",
  "lessons": {
    "lesson_02": {
      "id": "lesson_02",
      "title": "Sentence Structure",
      "subtitle": "Sentence Structure",
      "level": "Foundation",
      "duration": "20-25 min",
      "skill_codes": ["FSS"],
      ...
    },
    ...
  }
}
```

---

## Data Models

### Lesson Schema
```javascript
{
  "id": String,                    // Unique identifier (e.g., "lesson_05")
  "title": String,                 // Display title
  "subtitle": String,              // Subtitle/category
  "level": String,                 // "Foundation" | "Intermediate" | "Advanced"
  "duration": String,              // Estimated duration (e.g., "20-25 min")
  "skill_codes": Array<String>,    // SAT skill codes (e.g., ["TRA"])
  "learning_objectives": Array<String>,  // List of objectives
  "slides": Array<Slide>,          // Lesson slides
  "metadata": {
    "last_updated": String,        // ISO timestamp
    "content_version": String      // Version number
  },
  "success_criteria": {            // Optional
    "mastery_threshold": Number,
    "min_accuracy": Number,
    "required_slides": String
  }
}
```

### Slide Schema
```javascript
{
  "id": String,                    // Slide identifier (e.g., "slide_01")
  "type": String,                  // Slide type (see below)
  "title": String,                 // Slide title
  "duration_estimate": Number,     // Optional, in seconds
  "content": Object,               // Type-specific content (see below)
  "interactions": Array<Object>    // Optional, user interactions
}
```

### Slide Types & Content Schemas

#### 1. Strategy Teaching
```javascript
{
  "type": "strategy_teaching",
  "content": {
    "main_heading": String,
    "steps": Array<String>,
    "summary": String
  }
}
```

#### 2. Worked Example
```javascript
{
  "type": "worked_example",
  "content": {
    "passage_text": String,
    "question_text": String,
    "choices": Array<{
      "id": String,              // "A", "B", "C", "D"
      "text": String,
      "category": String,        // Optional
      "flaw": String,            // Optional
      "validation": String       // Optional
    }>,
    "correct_answer": String,
    "explanation": String
  }
}
```

#### 3. Concept Teaching
```javascript
{
  "type": "concept_teaching",
  "content": {
    "main_concept": String,
    "bullet_points": Array<String>,
    "examples": Array<{
      "label": String,
      "text": String
    }>
  }
}
```

#### 4. Practice Prompt
```javascript
{
  "type": "practice_prompt",
  "content": {
    "prompt_text": String,
    "button_text": String
  }
}
```

#### 5. Learning Objectives
```javascript
{
  "type": "learning_objectives",
  "content": {
    "objectives": Array<String>
  }
}
```

#### 6. Generic Content
```javascript
{
  "type": "content",
  "content": {
    // Any custom structure
  }
}
```

---

## File Structure

```
SATify/
├── server.js                          # Express.js API server
├── creator-enhanced.html              # Creator Studio UI
├── admin-review.html                  # Admin review dashboard
├── index.html                         # Main app (lesson viewer)
│
├── js/
│   ├── creator-enhanced.js            # Creator Studio logic
│   ├── admin-review.js                # Admin review logic
│   ├── lesson-content-renderer.js     # Lesson rendering
│   └── interactive-lessons.js         # Lesson navigation
│
├── lessons/
│   ├── lesson_01.json                 # Published lessons
│   ├── lesson_02.json
│   ├── ...
│   ├── manifest.json                  # Lessons index
│   │
│   ├── drafts/                        # Draft storage
│   │   ├── lesson_XX.json             # Current drafts
│   │   ├── versions/                  # Version history
│   │   │   └── lesson_XX_TIMESTAMP.json
│   │   └── rejections/                # Rejection notes
│   │       └── lesson_XX_rejection.json
│   │
│   └── backup/
│       └── published/                 # Pre-publish backups
│           └── lesson_XX_backup.json
│
└── docs/
    ├── CREATOR_STUDIO_TECHNICAL.md    # This file
    └── CREATOR_STUDIO_USER_GUIDE.md   # User documentation
```

---

## Workflow & State Management

### Complete Workflow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    CONTENT CREATION                         │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
                    Creator opens Editor
                            │
                            ▼
                ┌───────────────────────┐
                │  Load Lesson          │
                │  (draft or published) │
                └───────────┬───────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │  Edit Content         │
                │  - Metadata           │
                │  - Slides             │
                │  - Drag & Drop        │
                └───────────┬───────────┘
                            │
                ┌───────────┴───────────┐
                │                       │
                ▼                       ▼
        Auto-Save (30s)          Manual Save
        localStorage             Server Draft
                │                       │
                └───────────┬───────────┘
                            │
                            ▼
                  Version Snapshot Created
                            │
                ┌───────────┴───────────┐
                │                       │
                ▼                       ▼
        Hourly Auto-Backup        Manual Backup
        to GitHub (every 1h)      (☁️ Button)
                │                       │
                └───────────┬───────────┘
                            │
                            ▼
                  Git Commit & Push
                  (Remote Backup)
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   ADMIN REVIEW                              │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
                  Admin Opens Dashboard
                            │
                            ▼
                ┌───────────────────────┐
                │  Load Pending Drafts  │
                │  Compare with         │
                │  Published Versions   │
                └───────────┬───────────┘
                            │
                ┌───────────┴───────────┐
                │                       │
                ▼                       ▼
           ┌─────────┐            ┌─────────┐
           │ APPROVE │            │ REJECT  │
           └────┬────┘            └────┬────┘
                │                      │
                ▼                      ▼
        ┌───────────────┐      Save Rejection
        │ Create Backup │      with Feedback
        └───────┬───────┘              │
                │                      │
                ▼                      ▼
        ┌───────────────┐      Notify Creator
        │ Publish Live  │      (Future feature)
        └───────┬───────┘
                │
                ▼
┌─────────────────────────────────────────────────────────────┐
│                    LIVE & ROLLBACK                          │
└─────────────────────────────────────────────────────────────┘
                │
                ▼
        Students See Changes
                │
                ▼
        (If issues found)
                │
                ▼
        ┌───────────────┐
        │ ROLLBACK      │
        │ Restore Backup│
        └───────────────┘
```

### State Transitions

**Creator Studio States**:
```
LOADING → LOADED → EDITING → SAVING → SAVED
                      ↓
                   UNSAVED ──→ AUTO-SAVING → SAVED
                      ↓
                   PUBLISHING → PUBLISHED
```

**Admin Review States**:
```
PENDING → REVIEWING → APPROVING → PUBLISHED
                  ↓
                REJECTING → REJECTED
```

---

## Security & Data Protection

### Multi-Layer Protection

#### Layer 1: Browser localStorage
- **Purpose**: Immediate protection against browser crashes
- **Trigger**: Every 30 seconds + on every change
- **Storage**: Browser localStorage
- **Retention**: 24 hours
- **Recovery**: Automatic on page reload

#### Layer 2: Server Drafts
- **Purpose**: Cross-device access and collaboration
- **Trigger**: Manual save button
- **Storage**: `lessons/drafts/lesson_XX.json`
- **Retention**: Until published or deleted
- **Recovery**: Load from draft selector

#### Layer 3: Version Snapshots
- **Purpose**: Time-travel debugging and audit trail
- **Trigger**: Every server save
- **Storage**: `lessons/drafts/versions/lesson_XX_TIMESTAMP.json`
- **Retention**: Indefinite
- **Recovery**: Admin can restore specific version

#### Layer 4: Git Backup to GitHub
- **Purpose**: Remote backup protection against hardware failure or computer loss
- **Trigger**:
  - **Automatic**: Every hour (background task)
  - **Manual**: Click "☁️ Backup to GitHub" button
- **Storage**: GitHub repository (`origin main` branch)
- **Scope**: All files in `lessons/drafts/` folder
- **Retention**: Indefinite (Git history)
- **Recovery**: Git restore or clone repository
- **Implementation**:
  ```javascript
  // Hourly auto-backup (server.js)
  let backupInterval;

  function startAutoBackup() {
      console.log('🕐 Starting hourly auto-backup to GitHub...');

      backupInterval = setInterval(async () => {
          const { stdout: statusOutput } = await execAsync('git status --porcelain lessons/drafts/');

          if (statusOutput && statusOutput.trim().length > 0) {
              await execAsync('git add lessons/drafts/');

              const timestamp = new Date().toLocaleString('en-US', {
                  timeZone: 'America/New_York',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
              });

              const commitMessage = `Auto-backup lesson drafts - ${timestamp}

  Hourly automatic backup of lesson drafts and version snapshots.

  🤖 Generated with [Claude Code](https://claude.ai/code)

  Co-Authored-By: Claude <noreply@anthropic.com>`;

              await execAsync(`git commit -m "${commitMessage}"`);
              await execAsync('git push origin main');

              console.log(`✅ Auto-backup completed at ${timestamp}`);
          }
      }, 3600000); // 1 hour = 3600000ms
  }

  // Start on server boot
  app.listen(PORT, () => {
      console.log(`Creator Studio Server running on port ${PORT}`);
      startAutoBackup();
  });

  // Cleanup on shutdown
  process.on('SIGTERM', () => {
      if (backupInterval) clearInterval(backupInterval);
      process.exit(0);
  });
  ```
- **UI Integration**:
  - Last backup time displayed in editor header
  - Time formatted as relative ("5m ago", "2h ago", "3d ago")
  - Manual backup button with loading state
  - Success/error alerts on manual backup
- **Benefits**:
  - ✅ Protects against hard drive failure
  - ✅ Protects against computer theft/loss
  - ✅ Enables recovery on any machine with Git access
  - ✅ Complete history of all draft changes
  - ✅ No action required (hourly automatic)
  - ✅ On-demand backup available (manual button)

#### Layer 5: Pre-Publish Backups
- **Purpose**: One-click rollback
- **Trigger**: Before every publish
- **Storage**: `lessons/backup/published/lesson_XX_backup.json`
- **Retention**: Until next publish (overwritten)
- **Recovery**: Rollback API endpoint

### Data Flow Security

```javascript
// Input validation example
function validateLesson(lesson) {
    if (!lesson.id || typeof lesson.id !== 'string') {
        throw new Error('Invalid lesson ID');
    }

    if (!lesson.title || lesson.title.trim().length === 0) {
        throw new Error('Lesson title is required');
    }

    if (!Array.isArray(lesson.slides)) {
        throw new Error('Slides must be an array');
    }

    // Validate each slide
    lesson.slides.forEach((slide, index) => {
        if (!slide.id || !slide.type || !slide.title) {
            throw new Error(`Invalid slide at index ${index}`);
        }
    });

    return true;
}
```

### File System Permissions
```bash
# Recommended directory permissions
lessons/              755
lessons/drafts/       755
lessons/versions/     755
lessons/backup/       755

# Recommended file permissions
*.json                644
```

---

## Development Guide

### Setup

1. **Install Dependencies**:
```bash
npm install express
```

2. **Create Directory Structure**:
```bash
mkdir -p lessons/drafts/versions
mkdir -p lessons/drafts/rejections
mkdir -p lessons/backup/published
```

3. **Start Server**:
```bash
npm start
# Server runs on http://localhost:3001
```

4. **Access UIs**:
- Creator Studio: `http://localhost:3001/creator-enhanced.html`
- Admin Review: `http://localhost:3001/admin-review.html`
- Lesson Viewer: `http://localhost:3001/index.html`

### Adding New Slide Types

1. **Update Slide Type Enum** in `creator-enhanced.js`:
```javascript
const SLIDE_TYPES = {
    STRATEGY_TEACHING: 'strategy_teaching',
    WORKED_EXAMPLE: 'worked_example',
    CONCEPT_TEACHING: 'concept_teaching',
    PRACTICE_PROMPT: 'practice_prompt',
    LEARNING_OBJECTIVES: 'learning_objectives',
    YOUR_NEW_TYPE: 'your_new_type'  // Add here
};
```

2. **Add Type to Dropdown** in `createSlideEditorModal()`:
```javascript
<option value="your_new_type">Your New Type</option>
```

3. **Create Type-Specific Fields** in `updateSlideTypeFields()`:
```javascript
case 'your_new_type':
    fieldsHTML = `
        <div class="form-group">
            <label>Your Field</label>
            <input type="text" id="yourField" value="${content.your_field || ''}">
        </div>
    `;
    break;
```

4. **Handle Save** in `saveSlide()`:
```javascript
case 'your_new_type':
    slide.content = {
        your_field: document.getElementById('yourField').value
    };
    break;
```

5. **Update Renderer** in `lesson-content-renderer.js`:
```javascript
renderSlide_YourNewType(slide) {
    const { your_field } = slide.content;

    return `
        <div class="your-new-type-container">
            ${your_field}
        </div>
    `;
}
```

### Debugging

**Enable Debug Logging**:
```javascript
// In creator-enhanced.js
const DEBUG = true;

if (DEBUG) {
    console.log('Current lesson state:', this.currentLesson);
    console.log('Has unsaved changes:', this.hasUnsavedChanges);
}
```

**Check Auto-Save Status**:
```javascript
// In browser console
localStorage.getItem('satify_draft')
localStorage.getItem('satify_draft_timestamp')
```

**Inspect Draft Files**:
```bash
# View draft
cat lessons/drafts/lesson_05.json | python3 -m json.tool

# List versions
ls -lh lessons/drafts/versions/

# View specific version
cat lessons/drafts/versions/lesson_05_2025-10-02T02-08-23-551Z.json | python3 -m json.tool
```

### Testing

**Test Auto-Save**:
1. Open Creator Studio
2. Load a lesson
3. Make a change
4. Wait 30 seconds
5. Check console for "Auto-saved at HH:MM"
6. Refresh page
7. Verify changes are restored

**Test Drag & Drop**:
1. Load a lesson with multiple slides
2. Drag slide 3 to position 1
3. Verify slide order updates
4. Check preview panel reflects new order
5. Save draft
6. Reload and verify order persists

**Test Admin Review**:
1. Create a draft with changes
2. Open admin review dashboard
3. Verify draft appears in pending list
4. Check side-by-side comparison shows diffs
5. Test approve → verify file moves to published
6. Test reject → verify rejection note saved

**Test Preview Functionality**:
1. Open Creator Studio
2. Load a lesson (e.g., lesson_02)
3. Click "👁️ Preview" button (main action bar)
4. Verify preview window opens with draft badge
5. Check all slides render correctly
6. Click "🚀 Open Full Preview" (in preview panel)
7. Verify same preview window appears
8. Test with unsaved changes to verify current state is shown

---

## Troubleshooting

### Common Issues

#### 1. Auto-Save Not Working
**Symptoms**: Status stays "unsaved", no auto-save messages in console

**Solutions**:
```javascript
// Check if auto-save is running
console.log(studio.autoSaveInterval);  // Should be a number

// Check if changes are detected
console.log(studio.hasUnsavedChanges);  // Should be true after editing

// Restart auto-save
clearInterval(studio.autoSaveInterval);
studio.startAutoSave();
```

#### 2. Drafts Not Loading
**Symptoms**: 404 error when loading drafts

**Solutions**:
```bash
# Check directory exists
ls -la lessons/drafts/

# Check file permissions
chmod 755 lessons/drafts/
chmod 644 lessons/drafts/*.json

# Check file content
cat lessons/drafts/lesson_XX.json | python3 -m json.tool
```

#### 3. Slide Editor Modal Not Appearing
**Symptoms**: Clicking "Edit" does nothing

**Solutions**:
```javascript
// Check for JavaScript errors in console
// Common issue: onclick handler not bound

// Fix by ensuring studio is global
window.studio = new EnhancedCreatorStudio();

// Check modal creation
studio.openSlideEditor(slide, 0);
```

#### 4. Drag & Drop Not Working
**Symptoms**: Slides won't drag or drop in wrong position

**Solutions**:
```javascript
// Ensure draggable attribute is set
document.querySelectorAll('.slide-editor').forEach(slide => {
    console.log(slide.draggable);  // Should be true
});

// Check drag handlers are bound
console.log(typeof studio.handleDragStart);  // Should be 'function'
```

#### 5. API Endpoints Returning 404
**Symptoms**: "Cannot POST /api/save-draft"

**Solutions**:
```bash
# Restart server to load updated endpoints
npm start

# Check server logs
# Should see: "📝 Draft API endpoints available"

# Test endpoint directly
curl http://localhost:3001/api/health
```

#### 6. Preview Shows "No Preview Data"
**Symptoms**: Preview window shows error message instead of lesson

**Solutions**:
```javascript
// Check localStorage keys
console.log(localStorage.getItem('preview_lesson_data'));
console.log(localStorage.getItem('preview_lesson_id'));

// If null, the preview button didn't save correctly
// Verify you loaded a lesson first before clicking preview

// Clear and retry
localStorage.removeItem('preview_lesson_data');
localStorage.removeItem('preview_lesson_id');
// Then reload lesson and try preview again
```

**Root Causes**:
- No lesson loaded before clicking preview
- localStorage keys mismatch (old code used different key names)
- Browser localStorage disabled or full

**Fix**:
Ensure both preview functions use same localStorage keys:
```javascript
// Both previewLesson() and openFullPreview() must use:
localStorage.setItem('preview_lesson_data', JSON.stringify(lesson));
localStorage.setItem('preview_lesson_id', lesson.id);
```

#### 7. Lesson Loading Error - "event.target is undefined"
**Symptoms**: Clicking lesson in sidebar shows error, lesson doesn't load

**Solutions**:
```javascript
// Ensure onclick passes event object
onclick="studio.loadLesson('${lesson.id}', event)"

// Function signature must accept event parameter
async loadLesson(lessonId, event) {
    // Add null check before using event
    if (event && event.target) {
        // Safe to use event.target
    }
}
```

**Root Cause**:
Function tried to access `event.target` without event parameter being passed.

#### 8. Preview Rendering Error - "renderer.loadLesson is not a function"
**Symptoms**: Preview opens but shows error instead of lesson content

**Solutions**:
The `LessonContentRenderer` class only renders individual slides, not full lessons.

**Correct Approach**:
```javascript
const renderer = new LessonContentRenderer();
const slides = lesson.slides || [];

slides.forEach((slide, index) => {
    const slideHTML = renderer.renderSlideContent(slide);
    // Append to container
});
```

**Do NOT try to call**:
```javascript
renderer.loadLesson(lesson);  // ❌ This method doesn't exist
```

### Performance Optimization

**Large Lesson Files**:
```javascript
// Debounce auto-save for large lessons
debounce(function() {
    studio.autoSaveToLocalStorage();
}, 30000);

// Lazy load version history
async loadVersionsOnDemand(lessonId) {
    // Only load when admin clicks "View History"
}

// Compress version snapshots
// Store only diffs instead of full copies
```

**Browser localStorage Limits**:
```javascript
// Check localStorage size
function getLocalStorageSize() {
    let total = 0;
    for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
            total += localStorage[key].length + key.length;
        }
    }
    return (total / 1024).toFixed(2) + ' KB';
}

console.log('localStorage size:', getLocalStorageSize());

// Clear old auto-saves if needed
if (total > 5000000) {  // 5MB
    localStorage.removeItem('satify_draft');
}
```

---

## Appendix

### Keyboard Shortcuts (Future Enhancement)
```javascript
// Recommended shortcuts
Ctrl/Cmd + S    →  Save Draft
Ctrl/Cmd + P    →  Preview
Ctrl/Cmd + Z    →  Undo
Ctrl/Cmd + Y    →  Redo
Esc             →  Close Modal
```

### Metrics & Analytics (Future Enhancement)
```javascript
// Track creator activity
{
    "creator_id": "user123",
    "lesson_id": "lesson_05",
    "action": "draft_saved",
    "timestamp": "2025-10-02T07:00:00.000Z",
    "session_duration": 1800,  // seconds
    "changes_count": 15
}
```

### Version History Viewer (Future Enhancement)
```javascript
// Visual timeline of versions
async function loadVersionTimeline(lessonId) {
    const versions = await fetch(`/api/versions/${lessonId}`);
    // Display as interactive timeline with diff view
}
```

---

## Support

For technical support or to report issues:
- GitHub Issues: https://github.com/gravishankar/SATify/issues
- Email: support@satify.com (replace with actual)

## License

Copyright © 2024 SATify. All rights reserved.
