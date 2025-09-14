# SAT Practice Pro - API Reference

This document provides comprehensive technical reference for the SAT Practice Pro application's internal APIs, data structures, and extension points.

## 📋 Table of Contents

- [Core Classes](#core-classes)
- [Data Structures](#data-structures)  
- [Event System](#event-system)
- [Storage APIs](#storage-apis)
- [Extension Points](#extension-points)
- [Utility Functions](#utility-functions)

## 🏗 Core Classes

### `SATApp` - Main Application Controller

The central application controller that manages the overall application state and coordinates between modules.

```javascript
class SATApp {
    constructor() {
        this.questions = [];
        this.currentQuestion = null;
        this.manifest = null;
        this.settings = new Settings();
        this.auth = new Auth(this);
        this.analytics = new Analytics(this);
        this.practice = new PracticeSession(this);
        this.adaptive = new AdaptiveLearning(this);
    }
}
```

#### Methods

##### `async init()`
Initializes the application and loads essential data.

```javascript
await app.init();
```

**Returns**: `Promise<void>`

**Throws**: `Error` if manifest loading fails

##### `async loadManifest()`
Loads the question bank manifest from the server.

```javascript
const manifest = await app.loadManifest();
```

**Returns**: `Promise<Object>` - Manifest object with chunk information

##### `async loadQuestionChunk(chunkIndex)`
Loads a specific chunk of questions.

```javascript
const questions = await app.loadQuestionChunk(0); // Load first 1000 questions
```

**Parameters**:
- `chunkIndex` (number): Index of the chunk to load (0-based)

**Returns**: `Promise<Array>` - Array of question objects

##### `displayQuestion(question)`
Renders a question in the UI with proper formatting.

```javascript
app.displayQuestion(questionObject);
```

**Parameters**:
- `question` (Object): Question object following the standard schema

**Returns**: `void`

##### `submitAnswer(answer)`
Processes user answer submission and updates analytics.

```javascript
const result = app.submitAnswer({
    answer: 2,              // Selected choice index or numerical value
    timeSpent: 45000,       // Time in milliseconds
    hintsUsed: 1           // Number of hints used
});
```

**Parameters**:
- `answer` (Object): Answer submission data

**Returns**: `Object` - Result object with correctness and feedback

---

### `Auth` - Authentication Manager

Handles user authentication, registration, and session management.

```javascript
class Auth {
    constructor(app) {
        this.app = app;
        this.currentUser = null;
        this.isGuest = false;
    }
}
```

#### Methods

##### `async login(email, password)`
Authenticates user with email and password.

```javascript
try {
    const user = await auth.login('user@example.com', 'password123');
    console.log('Logged in as:', user.name);
} catch (error) {
    console.error('Login failed:', error.message);
}
```

**Parameters**:
- `email` (string): User's email address
- `password` (string): User's password

**Returns**: `Promise<Object>` - User object on success

**Throws**: `AuthError` with specific error message

##### `async register(userData)`
Creates a new user account.

```javascript
const newUser = await auth.register({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'securePassword123',
    targetScore: 1400
});
```

**Parameters**:
- `userData` (Object): User registration data

**Returns**: `Promise<Object>` - Created user object

##### `loginAsGuest()`
Starts a guest session without creating an account.

```javascript
auth.loginAsGuest();
// User can now practice without registration
```

**Returns**: `Object` - Guest user object

##### `logout()`
Ends the current session and clears user data.

```javascript
auth.logout();
```

**Returns**: `void`

##### `getCurrentUser()`
Returns the currently authenticated user.

```javascript
const user = auth.getCurrentUser();
if (user && !auth.isGuest) {
    console.log('Welcome back,', user.name);
}
```

**Returns**: `Object|null` - Current user or null if not authenticated

---

### `PracticeSession` - Practice Management

Manages practice sessions, question flow, and session state.

```javascript
class PracticeSession {
    constructor(app) {
        this.app = app;
        this.currentSession = null;
        this.sessionHistory = [];
    }
}
```

#### Methods

##### `startSession(options)`
Begins a new practice session with specified parameters.

```javascript
const session = practice.startSession({
    mode: 'adaptive',           // 'adaptive', 'random', 'timed', 'topic'
    questionCount: 20,          // Number of questions (optional)
    timeLimit: 1800,            // Time limit in seconds (optional)
    topicFilter: 'Algebra',     // Filter by topic (optional)
    difficultyFilter: 'M',      // Filter by difficulty (optional)
    modulesFilter: ['math']     // Filter by modules (optional)
});
```

**Parameters**:
- `options` (Object): Session configuration

**Returns**: `Object` - Session configuration object

##### `getCurrentQuestion()`
Returns the current question in the active session.

```javascript
const question = practice.getCurrentQuestion();
if (question) {
    app.displayQuestion(question);
}
```

**Returns**: `Object|null` - Current question or null

##### `submitAnswer(answer)`
Submits an answer for the current question.

```javascript
const result = practice.submitAnswer({
    selectedChoice: 2,
    confidence: 'medium',
    timeSpent: 67000
});
```

**Parameters**:
- `answer` (Object): Answer data

**Returns**: `Object` - Answer result with feedback

##### `nextQuestion()`
Advances to the next question in the session.

```javascript
const hasNext = practice.nextQuestion();
if (!hasNext) {
    // Session complete
    const summary = practice.getSessionSummary();
}
```

**Returns**: `boolean` - True if there's a next question

##### `previousQuestion()`
Returns to the previous question (if allowed).

```javascript
const hasPrevious = practice.previousQuestion();
```

**Returns**: `boolean` - True if successfully moved to previous

##### `pauseSession()`
Pauses the current session, saving state.

```javascript
practice.pauseSession();
// User can resume later
```

**Returns**: `void`

##### `resumeSession()`
Resumes a paused session.

```javascript
practice.resumeSession();
```

**Returns**: `boolean` - True if session was successfully resumed

##### `endSession()`
Ends the current session and generates summary.

```javascript
const summary = practice.endSession();
console.log(`Session complete: ${summary.correctAnswers}/${summary.totalQuestions}`);
```

**Returns**: `Object` - Session summary with statistics

---

### `Analytics` - Performance Tracking

Tracks user performance, generates insights, and provides recommendations.

```javascript
class Analytics {
    constructor(app) {
        this.app = app;
        this.history = this.loadHistory();
    }
}
```

#### Methods

##### `recordAnswer(questionData, userResponse, metadata)`
Records a user's answer for analytics tracking.

```javascript
analytics.recordAnswer(
    questionObject,                    // The question that was answered
    { answer: 2, isCorrect: true },   // User's response
    { timeSpent: 45000, hintsUsed: 1 } // Additional metadata
);
```

**Parameters**:
- `questionData` (Object): The question object
- `userResponse` (Object): User's answer and correctness
- `metadata` (Object): Additional data like time and hints

**Returns**: `void`

##### `getPerformanceInsights()`
Generates comprehensive performance analysis.

```javascript
const insights = analytics.getPerformanceInsights();
console.log('Overall accuracy:', insights.overallStats.accuracy);
console.log('Weak areas:', insights.recommendations.focusAreas);
```

**Returns**: `Object` - Detailed performance insights

```javascript
{
    overallStats: {
        accuracy: 0.78,
        totalQuestions: 245,
        averageTime: 67.5,
        streak: { current: 5, longest: 12 }
    },
    topicBreakdown: {
        'Algebra': { accuracy: 0.85, count: 45, mastery: 'strong' },
        'Geometry': { accuracy: 0.62, count: 32, mastery: 'developing' }
    },
    difficultyProgression: {
        'E': { accuracy: 0.92, count: 98 },
        'M': { accuracy: 0.74, count: 87 },
        'H': { accuracy: 0.56, count: 60 }
    },
    recommendations: {
        focusAreas: ['Geometry', 'Statistics'],
        nextDifficulty: 'M',
        suggestedPracticeTime: 25
    },
    projectedScore: 1285
}
```

##### `getTopicMastery(topic)`
Returns detailed mastery information for a specific topic.

```javascript
const algebraMastery = analytics.getTopicMastery('Algebra');
console.log('Mastery level:', algebraMastery.level); // 'developing', 'proficient', 'advanced'
```

**Parameters**:
- `topic` (string): Topic name to analyze

**Returns**: `Object` - Topic mastery data

##### `exportData(format)`
Exports user's practice data in specified format.

```javascript
const csvData = analytics.exportData('csv');
const jsonData = analytics.exportData('json');
```

**Parameters**:
- `format` (string): 'json' or 'csv'

**Returns**: `string` - Formatted data for download

---

### `AdaptiveLearning` - Intelligent Question Selection

Implements adaptive learning algorithms for personalized question selection.

```javascript
class AdaptiveLearning {
    constructor(app) {
        this.app = app;
        this.analytics = app.analytics;
    }
}
```

#### Methods

##### `selectNextQuestion(availableQuestions, userHistory)`
Selects the optimal next question based on user performance.

```javascript
const nextQuestion = adaptive.selectNextQuestion(
    availableQuestions,  // Array of possible questions
    userHistory         // User's practice history
);
```

**Parameters**:
- `availableQuestions` (Array): Questions to choose from
- `userHistory` (Array): User's answer history

**Returns**: `Object` - Selected question object

##### `calculateDifficulty(userPerformance)`
Determines appropriate difficulty level for the user.

```javascript
const targetDifficulty = adaptive.calculateDifficulty(userPerformance);
// Returns: 'E', 'M', or 'H'
```

**Parameters**:
- `userPerformance` (Object): Performance metrics

**Returns**: `string` - Difficulty level

##### `getSpacedRepetitionCandidates(history)`
Identifies questions that should be reviewed based on spaced repetition.

```javascript
const reviewQuestions = adaptive.getSpacedRepetitionCandidates(userHistory);
```

**Parameters**:
- `history` (Array): User's practice history

**Returns**: `Array` - Questions due for review

## 📊 Data Structures

### Question Object Schema

Standard format for all questions in the system.

```javascript
{
    // Unique identifiers
    "uId": "550e8400-e29b-41d4-a716-446655440000",
    "questionId": "math_algebra_001",
    
    // Classification
    "module": "math",                    // "math" | "reading-writing"
    "primary_class_cd_desc": "Algebra",  // Domain/topic area
    "skill_cd": "H.A.",                 // Internal skill code
    "skill_desc": "Linear equations in one variable",
    "difficulty": "M",                   // "E" | "M" | "H"
    "score_band_range_cd": 4,           // 1-8 scoring band
    
    // Content
    "stem_html": "<p>If 3x + 7 = 22, what is the value of x?</p>",
    "choices": [                        // null for grid-in questions
        "<p>3</p>",
        "<p>5</p>", 
        "<p>7</p>",
        "<p>15</p>"
    ],
    "correct_choice_index": 1,          // 0-based index, null for grid-in
    "explanation_html": "<p>Step-by-step solution...</p>",
    "question_type": "mcq"              // "mcq" | "numerical"
}
```

### User Performance Record

Structure for individual answer records.

```javascript
{
    "timestamp": 1635724800000,         // Unix timestamp
    "sessionId": "session_123",         // Practice session identifier
    "questionId": "550e8400-...",       // Question unique ID
    "module": "math",
    "topic": "Algebra", 
    "skill": "Linear equations in one variable",
    "difficulty": "M",
    "userAnswer": 1,                    // User's selected choice or numerical answer
    "correctAnswer": 1,                 // Correct choice index or numerical answer
    "isCorrect": true,                  // Boolean correctness
    "timeSpent": 45000,                 // Milliseconds spent on question
    "hintsUsed": 0,                     // Number of hints accessed
    "confidence": "high",               // User's self-reported confidence
    "bookmarked": false,               // Whether user bookmarked this question
    "flagged": false                   // Whether user flagged for review
}
```

### Session Summary Object

Complete session statistics and performance data.

```javascript
{
    "sessionId": "session_123",
    "startTime": 1635724800000,
    "endTime": 1635726600000,
    "duration": 1800000,               // Total duration in milliseconds
    "mode": "adaptive",                // Practice mode used
    "totalQuestions": 20,
    "questionsAnswered": 18,
    "correctAnswers": 14,
    "accuracy": 0.78,                  // Percentage correct
    "averageTimePerQuestion": 67500,   // Average time in milliseconds
    "topicBreakdown": {
        "Algebra": { "total": 8, "correct": 7 },
        "Geometry": { "total": 6, "correct": 4 },
        "Statistics": { "total": 4, "correct": 3 }
    },
    "difficultyBreakdown": {
        "E": { "total": 6, "correct": 6 },
        "M": { "total": 8, "correct": 6 },
        "H": { "total": 4, "correct": 2 }
    },
    "streaks": {
        "longest": 5,                  // Longest consecutive correct answers
        "current": 0                   // Current streak at session end
    },
    "hintsUsed": 3,
    "questionsBookmarked": 2,
    "questionsFlagged": 1
}
```

### User Profile Object

Complete user account and preference data.

```javascript
{
    // Account information
    "userId": "user_12345",
    "email": "student@example.com",
    "name": "John Doe",
    "createdAt": 1635724800000,
    "isGuest": false,
    
    // Preferences and goals
    "targetScore": 1400,
    "targetTestDate": "2024-03-15",
    "preferences": {
        "theme": "light",              // "light" | "dark" | "auto"
        "soundEnabled": true,
        "hintsEnabled": true,
        "timerEnabled": false,
        "keyboardShortcuts": true,
        "practiceReminders": true
    },
    
    // Study settings
    "studyGoals": {
        "dailyQuestions": 20,
        "weeklyHours": 10,
        "focusAreas": ["Geometry", "Statistics"]
    },
    
    // Progress tracking
    "stats": {
        "totalQuestions": 1247,
        "totalCorrect": 931,
        "overallAccuracy": 0.746,
        "studyStreak": 12,
        "longestStreak": 28,
        "totalStudyTime": 45600000,    // Milliseconds
        "sessionsCompleted": 67,
        "currentProjectedScore": 1285
    },
    
    // Recent activity
    "lastLoginAt": 1635724800000,
    "lastPracticeAt": 1635724800000,
    "recentSessions": ["session_456", "session_455", "session_454"]
}
```

## ⚡ Event System

The application uses a custom event system for loose coupling between components.

### Event Types

#### `questionDisplayed`
Fired when a new question is rendered in the UI.

```javascript
document.addEventListener('questionDisplayed', (event) => {
    const question = event.detail.question;
    const questionNumber = event.detail.questionNumber;
    console.log(`Question ${questionNumber} displayed:`, question.stem_html);
});
```

**Detail Object**:
```javascript
{
    question: Object,      // The question object
    questionNumber: number, // Current question number in session
    totalQuestions: number, // Total questions in session
    timeStarted: number    // Timestamp when question was displayed
}
```

#### `answerSubmitted`
Fired when user submits an answer.

```javascript
document.addEventListener('answerSubmitted', (event) => {
    const { isCorrect, timeSpent, question } = event.detail;
    if (isCorrect) {
        showSuccessAnimation();
    }
});
```

**Detail Object**:
```javascript
{
    question: Object,       // The answered question
    userAnswer: any,       // User's submitted answer
    isCorrect: boolean,    // Whether answer was correct
    timeSpent: number,     // Time spent on question (ms)
    hintsUsed: number,     // Number of hints accessed
    sessionId: string      // Current session ID
}
```

#### `sessionStarted`
Fired when a practice session begins.

```javascript
document.addEventListener('sessionStarted', (event) => {
    const { mode, questionCount, filters } = event.detail;
    console.log(`Started ${mode} session with ${questionCount} questions`);
});
```

#### `sessionEnded`
Fired when a practice session completes.

```javascript
document.addEventListener('sessionEnded', (event) => {
    const summary = event.detail.summary;
    displaySessionResults(summary);
});
```

#### `performanceUpdated`
Fired when analytics data is updated.

```javascript
document.addEventListener('performanceUpdated', (event) => {
    const insights = event.detail.insights;
    updateDashboard(insights);
});
```

### Custom Event Dispatching

```javascript
// Dispatch custom events
app.dispatchEvent('customEvent', {
    data: 'example',
    timestamp: Date.now()
});

// With optional target element
app.dispatchEvent('elementEvent', eventData, targetElement);
```

## 💾 Storage APIs

### LocalStorage Management

The app provides utilities for managing localStorage data with proper serialization and error handling.

#### `StorageManager` Class

```javascript
class StorageManager {
    static set(key, value, options = {}) {
        // Stores data with optional encryption and expiration
    }
    
    static get(key, defaultValue = null) {
        // Retrieves data with type preservation
    }
    
    static remove(key) {
        // Removes specific key
    }
    
    static clear(prefix = null) {
        // Clears all data or data with specific prefix
    }
}
```

#### Usage Examples

```javascript
// Store user preferences
StorageManager.set('user-preferences', {
    theme: 'dark',
    soundEnabled: true
}, { encrypt: true });

// Retrieve with default fallback
const prefs = StorageManager.get('user-preferences', {
    theme: 'light',
    soundEnabled: false
});

// Store session data with expiration (24 hours)
StorageManager.set('current-session', sessionData, {
    expiration: 24 * 60 * 60 * 1000
});

// Clear all analytics data
StorageManager.clear('analytics-');
```

### Data Synchronization

For users with accounts, data can be synchronized across devices.

```javascript
class DataSync {
    static async syncToCloud(userId, data) {
        // Synchronize local data to cloud storage
    }
    
    static async syncFromCloud(userId) {
        // Retrieve and merge cloud data with local data
    }
    
    static async resolveConflicts(localData, cloudData) {
        // Handle data conflicts between local and cloud versions
    }
}
```

## 🔌 Extension Points

### Custom Question Types

Add support for new question formats by extending the question renderer.

```javascript
// Register custom question type handler
app.registerQuestionRenderer('custom-type', (question, container) => {
    // Custom rendering logic
    const customElement = createCustomQuestionElement(question);
    container.appendChild(customElement);
    
    return {
        getAnswer: () => extractCustomAnswer(customElement),
        validate: () => validateCustomAnswer(customElement),
        cleanup: () => cleanupCustomElement(customElement)
    };
});
```

### Custom Analytics Metrics

Extend the analytics system with custom performance metrics.

```javascript
// Add custom metric calculator
analytics.addMetricCalculator('custom-metric', (history, options) => {
    // Calculate custom metric from history data
    return {
        value: calculatedValue,
        trend: 'improving', // 'improving', 'declining', 'stable'
        confidence: 'high'  // 'high', 'medium', 'low'
    };
});

// Use custom metric in insights
const insights = analytics.getInsights(['custom-metric']);
```

### Custom Practice Modes

Add new practice modes with custom question selection logic.

```javascript
// Register custom practice mode
practice.registerMode('custom-mode', {
    name: 'Custom Practice Mode',
    description: 'Questions selected using custom algorithm',
    
    selectQuestions: (availableQuestions, options) => {
        // Custom question selection logic
        return selectedQuestions;
    },
    
    shouldContinue: (session, currentQuestion) => {
        // Custom continuation logic
        return boolean;
    },
    
    getNextQuestion: (session, history) => {
        // Custom next question logic
        return nextQuestion;
    }
});
```

### UI Theme Extensions

Add custom themes and styling options.

```javascript
// Register custom theme
app.registerTheme('custom-theme', {
    name: 'Custom Theme',
    variables: {
        '--primary-color': '#your-color',
        '--secondary-color': '#your-secondary',
        '--background-color': '#your-background'
    },
    styles: `
        .custom-styles {
            /* Your custom CSS */
        }
    `
});
```

## 🛠 Utility Functions

### Math Utilities

```javascript
// Mathematical calculations and formatting
const MathUtils = {
    // Calculate percentile rank
    calculatePercentile: (score, distribution) => number,
    
    // Format numbers for display
    formatNumber: (num, options = {}) => string,
    
    // Calculate confidence intervals
    calculateConfidenceInterval: (data, confidence = 0.95) => [number, number],
    
    // Statistical analysis
    calculateStats: (data) => {
        mean: number,
        median: number,
        standardDeviation: number,
        variance: number
    }
};
```

### Time Utilities

```javascript
// Time formatting and calculations
const TimeUtils = {
    // Format milliseconds to human readable
    formatDuration: (ms, format = 'long') => string,
    
    // Calculate time ago
    timeAgo: (timestamp) => string,
    
    // Parse time strings
    parseTimeString: (timeStr) => number,
    
    // Get optimal practice times
    getOptimalPracticeTimes: (userHistory) => Array
};
```

### Validation Utilities

```javascript
// Input validation and sanitization
const ValidationUtils = {
    // Validate email format
    isValidEmail: (email) => boolean,
    
    // Validate password strength  
    validatePassword: (password) => {
        isValid: boolean,
        strength: 'weak' | 'medium' | 'strong',
        issues: Array<string>
    },
    
    // Sanitize HTML content
    sanitizeHTML: (html) => string,
    
    // Validate question object
    validateQuestion: (question) => {
        isValid: boolean,
        errors: Array<string>
    }
};
```

### Performance Utilities

```javascript
// Performance monitoring and optimization
const PerformanceUtils = {
    // Measure function execution time
    measure: (fn, label) => any,
    
    // Debounce function calls
    debounce: (fn, delay) => Function,
    
    // Throttle function calls
    throttle: (fn, limit) => Function,
    
    // Check if user prefers reduced motion
    prefersReducedMotion: () => boolean,
    
    // Memory usage information
    getMemoryInfo: () => Object
};
```

### Error Handling

```javascript
// Centralized error handling
const ErrorHandler = {
    // Log error with context
    logError: (error, context = {}) => void,
    
    // Show user-friendly error message
    showUserError: (message, options = {}) => void,
    
    // Handle network errors
    handleNetworkError: (error) => void,
    
    // Report error to analytics (anonymously)
    reportError: (error, metadata = {}) => void
};
```

## 🔄 Integration Examples

### Adding a Custom Study Mode

```javascript
// 1. Define the custom mode
const customMode = {
    name: 'Speed Drill',
    description: 'Quick-fire questions with 30-second time limit',
    
    config: {
        timePerQuestion: 30000,      // 30 seconds
        questionsPerSession: 15,
        difficultyProgression: true,
        allowHints: false
    },
    
    selectQuestions: (available, userHistory) => {
        // Select questions user has seen before but needs reinforcement
        return available.filter(q => 
            userHistory.some(h => 
                h.questionId === q.uId && 
                h.isCorrect && 
                Date.now() - h.timestamp > 7 * 24 * 60 * 60 * 1000 // 7 days
            )
        ).slice(0, 15);
    }
};

// 2. Register the mode
practice.registerMode('speed-drill', customMode);

// 3. Use the mode
practice.startSession({
    mode: 'speed-drill',
    customOptions: { focusWeakAreas: true }
});
```

### Creating Custom Analytics Dashboard

```javascript
// 1. Create custom metric calculators
analytics.addMetricCalculator('focus-score', (history) => {
    // Calculate how well user maintains focus during sessions
    const sessions = groupBySession(history);
    return sessions.map(session => {
        const timeVariance = calculateTimeVariance(session);
        return 1 / (1 + timeVariance); // Lower variance = higher focus
    }).reduce((sum, score) => sum + score, 0) / sessions.length;
});

// 2. Create dashboard component
class CustomDashboard {
    constructor(analytics) {
        this.analytics = analytics;
    }
    
    render() {
        const insights = this.analytics.getInsights(['focus-score']);
        return `
            <div class="custom-dashboard">
                <div class="metric-card">
                    <h3>Focus Score</h3>
                    <div class="score">${insights.focusScore.toFixed(2)}</div>
                    <div class="trend">${insights.focusScoreTrend}</div>
                </div>
            </div>
        `;
    }
}

// 3. Integrate with main app
const customDash = new CustomDashboard(app.analytics);
document.getElementById('custom-metrics').innerHTML = customDash.render();
```

This API reference provides comprehensive documentation for extending and integrating with the SAT Practice Pro application. For more specific implementation details, refer to the source code and developer guide.