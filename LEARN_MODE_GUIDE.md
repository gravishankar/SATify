# Learn Mode Developer Guide 📚

## Overview

The Learn Mode feature provides interactive, step-by-step lessons that teach concepts before students practice. It includes a seamless learn-to-practice flow where students can navigate between conceptual learning and targeted practice.

## Architecture

### Core Components

1. **LearnPage Class** (`js/learn-page.js`)
   - Main controller for the Learn page functionality
   - Handles lesson navigation, progress tracking, and skill management

2. **TopicLoader Class** (`js/topic-loader.js`)
   - Dynamically loads lesson content from JSON files
   - Renders lesson slides with interactive elements

3. **Learn Page Styles** (`styles.css`)
   - Skills grid layout and styling
   - Lesson slide animations and responsive design
   - Button states and visual feedback

4. **Topic Data** (`data/topics/`)
   - JSON files containing structured lesson content
   - Slide definitions with content, examples, and interactions

## File Structure

```
js/
├── learn-page.js          # Main Learn page controller
├── topic-loader.js        # Dynamic content loading
└── words-in-context.js    # Practice integration

data/topics/
└── craft-and-structure.json  # Lesson content

styles.css                # Learn mode styling
index.html                # Learn page HTML structure
```

## Key Features

### 1. Skills Grid
- Visual skill cards with progress tracking
- Clickable cards to start lessons
- Progress indicators (Start Learning, In Progress, Completed)
- Hover effects and visual feedback

### 2. Interactive Lessons
- Multi-slide lessons with navigation
- Progress bar and slide indicators
- Keyboard navigation support (←/→ arrows, Esc)
- Dynamic height adjustment for content

### 3. Learn-to-Practice Flow
- "Learn This Concept" button in practice mode
- Automatic lesson start from slide 0
- "Start Practice" button after lesson completion
- Seamless navigation between modes

### 4. Progress Tracking
- Local storage for lesson progress
- Skill completion status
- Analytics tracking for lesson events

## Adding New Topics

### 1. Create Topic JSON File
Create a new file in `data/topics/your-topic-id.json`:

```json
{
  "id": "your-topic-id",
  "title": "Your Topic Title",
  "subtitle": "Brief description",
  "category": "Reading & Writing",
  "difficulty": "medium",
  "slides": [
    {
      "id": "intro",
      "type": "introduction",
      "content": {
        "title": "Welcome to Topic",
        "subtitle": "What you'll learn",
        "points": [
          "Key concept 1",
          "Key concept 2"
        ]
      }
    },
    {
      "id": "concept",
      "type": "concept",
      "content": {
        "title": "Main Concept",
        "explanation": "Detailed explanation...",
        "example": "Example content..."
      }
    }
    // ... more slides
  ]
}
```

### 2. Add Skill Card to HTML
Add a new skill card in `index.html`:

```html
<div class="skill-card clickable" data-skill="your-topic-id">
    <div class="skill-header">
        <div class="skill-icon">🎯</div>
        <div class="skill-badge">Active</div>
    </div>
    <h3>Your Topic Title</h3>
    <p>Brief description of the topic</p>
    <div class="skill-meta">
        <span class="duration">⏱️ X min lesson</span>
        <span class="questions">📝 Y practice questions</span>
    </div>
    <div class="skill-progress">
        <div class="progress-bar">
            <div class="progress-fill" style="width: 0%"></div>
        </div>
        <span class="progress-text">Start Learning</span>
    </div>
</div>
```

### 3. Update Practice Integration
For new practice modules, update the `getCurrentTopic()` method in the practice class:

```javascript
getCurrentTopic() {
    // Logic to determine current topic based on practice context
    // Return the topic ID that matches your JSON filename
    return 'your-topic-id';
}
```

## Slide Types and Content Structure

### Introduction Slide
```json
{
  "type": "introduction",
  "content": {
    "title": "Lesson Title",
    "subtitle": "What you'll learn",
    "points": ["Point 1", "Point 2", "Point 3"]
  }
}
```

### Concept Slide
```json
{
  "type": "concept",
  "content": {
    "title": "Concept Name",
    "explanation": "Detailed explanation",
    "example": "Example or illustration"
  }
}
```

### Strategy Slide
```json
{
  "type": "strategy",
  "content": {
    "title": "Strategy Steps",
    "steps": [
      "Step 1: Action to take",
      "Step 2: Next action",
      "Step 3: Final step"
    ]
  }
}
```

### Example Slide
```json
{
  "type": "example",
  "content": {
    "title": "Practice Example",
    "question": "Sample question text",
    "walkthrough": [
      "Analysis step 1",
      "Analysis step 2",
      "Final answer explanation"
    ]
  }
}
```

## Event System

### Lesson Events
The Learn Mode dispatches several events for analytics and integration:

- `lesson_started` - When a lesson begins
- `lesson_completed` - When a lesson is finished
- `slide_viewed` - For each slide interaction
- `learn_concept_clicked` - When navigating from practice to learn

### Progress Events
- `skill_progress_updated` - When skill status changes
- `lesson_progress_saved` - When progress is persisted

## Navigation Methods

### Core Navigation
```javascript
// Start a specific lesson
learnPage.startLesson('topic-id');

// Navigate between slides
learnPage.nextSlide();
learnPage.previousSlide();
learnPage.goToSlide(slideIndex);

// Return to skills grid
learnPage.showSkillsGrid();
```

### Practice Integration
```javascript
// Navigate to practice after lesson
learnPage.goToPractice();

// Navigate to lesson from practice
wordsInContextPractice.goToLearnConcept();
```

## Styling Guidelines

### Responsive Design
- Mobile-first approach with responsive breakpoints
- Grid layout adapts from 1 column (mobile) to multiple columns (desktop)
- Touch-friendly button sizes (minimum 44px)

### Visual Hierarchy
- Clear distinction between skill categories
- Progress indicators with consistent color coding
- Smooth animations for slide transitions

### Accessibility
- Keyboard navigation support
- Screen reader friendly markup
- High contrast ratios for text
- Focus indicators for interactive elements

## Testing Checklist

### Functionality
- [ ] Skill cards are clickable and start lessons
- [ ] Lesson navigation works (next/previous/indicators)
- [ ] Keyboard shortcuts function properly
- [ ] Progress is saved and restored correctly
- [ ] Learn-to-practice flow works seamlessly

### Responsive Design
- [ ] Skills grid adapts to different screen sizes
- [ ] Lesson slides are readable on mobile
- [ ] Navigation buttons are touch-friendly
- [ ] Text scales appropriately

### Cross-browser Compatibility
- [ ] Chrome, Safari, Firefox, Edge support
- [ ] Mobile browser testing
- [ ] Progressive enhancement for older browsers

## Performance Considerations

### Content Loading
- Lessons are loaded on-demand to reduce initial bundle size
- Images and media are optimized for web
- JSON files are cached for offline access

### Memory Management
- Event listeners are properly cleaned up
- Local storage is used efficiently
- Slide content is managed to prevent memory leaks

## Future Enhancements

### Planned Features
- Interactive exercises within slides
- Video and audio content support
- Adaptive lesson paths based on performance
- Social features (sharing progress, group challenges)

### Extension Points
- Custom slide types can be added easily
- Third-party content integration
- Advanced analytics and learning insights
- Gamification elements

## Troubleshooting

### Common Issues
1. **Slides not loading**: Check JSON file format and path
2. **Navigation not working**: Verify event listeners are attached
3. **Progress not saving**: Check localStorage permissions
4. **Styling issues**: Ensure CSS variables are properly defined

### Debug Mode
Enable console logging by setting:
```javascript
window.DEBUG_LEARN_MODE = true;
```

This provides detailed logs for navigation, content loading, and progress tracking.