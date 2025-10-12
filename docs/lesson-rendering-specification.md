# Lesson Content Rendering Specification

## Overview
This document outlines the comprehensive JSON structure support and rendering specifications for the SATify lesson content renderer. The renderer uses a Hawaiian sea theme optimized for high school students with focus on progressive disclosure and cognitive load management.

## Color Palette - Hawaiian Sea Theme
- **Deep Ocean Blue**: `#0369a1` - Primary headers, important UI elements
- **Turquoise**: `#06b6d4` - Secondary accents, interactive elements
- **Sea Foam**: `#a7f3d0` - Success states, highlights
- **Coral**: `#f97316` - Warnings, important callouts
- **Pearl White**: `#ffffff` - Background, content areas
- **Seafoam Green**: `#f0fdf4` - Light backgrounds for examples

## Typography & UX Principles
- **Font**: System fonts optimized for readability
- **Line Height**: 1.6 for easy reading by high school students
- **Progressive Disclosure**: Complex content revealed step-by-step
- **Mobile-First**: Responsive design for all screen sizes
- **Cognitive Load Management**: Simple, clear visual hierarchy

## Supported JSON Content Structures

### 1. Basic Content Fields

#### `heading`
```json
{
  "heading": "PHASE 1: Define the Context"
}
```
**Rendering**: Large header with Deep Ocean Blue color (#0369a1)

#### `subtitle`
```json
{
  "subtitle": "Ditch the Details—Focus on Core Logic"
}
```
**Rendering**: Smaller italic text in medium gray

#### `text`
```json
{
  "text": "The Master Strategy transforms transitions from guesswork into a 3-Phase proof system."
}
```
**Rendering**: Standard paragraph with 1.6 line height

#### `bullet_points`
```json
{
  "bullet_points": [
    "Decode the flow",
    "Define the logical bridge",
    "Apply the 3-Phase Master Strategy for 100% confidence"
  ]
}
```
**Rendering**: Bulleted list with proper spacing and Sea theme styling

### 2. Strategy Teaching Components

#### `strategy_steps`
```json
{
  "strategy_steps": [
    {
      "step": 1,
      "title": "Simplify the Text",
      "description": "Strip away jargon, names, and complex terminology",
      "points": [
        "Idea A (Before blank): What's the core claim?",
        "Idea B (After blank): What's the core claim?"
      ],
      "examples": [
        "Addition → 'Also' or 'Additionally'",
        "Contrast → 'However' or 'But'"
      ]
    }
  ]
}
```
**Rendering**:
- Numbered cards with Sea theme styling
- Step title in Turquoise (#06b6d4)
- Description and points with proper hierarchy
- Examples in light gray backgrounds

#### `tactics`
```json
{
  "tactics": [
    {
      "name": "Tactic 1: Rhetorical Purpose Check",
      "description": "Does the word match the author's precise intent?",
      "application": "Test each choice against your target category from Phase 2",
      "red_flags": [
        "Wrong purpose (e.g., concession when you need restatement)",
        "Close but not precise (e.g., 'granted' vs 'however')"
      ]
    }
  ]
}
```
**Rendering**:
- Individual tactic cards with proper spacing
- Name highlighted in Sea theme colors
- Red flags listed with warning styling

### 3. Examples and Analysis

#### `example` with `breakdown`
```json
{
  "example": {
    "text": "Aristotle disagreed, positing that knowledge is best obtained through direct engagement with the material world; ______ sensory experience of the material is the ultimate source of knowledge.",
    "breakdown": {
      "idea_a": "Knowledge comes from direct engagement with material world",
      "idea_b": "Sensory experience is the ultimate source of knowledge",
      "relationship": "Restatement/Clarification (B defines what A means)"
    }
  }
}
```
**Rendering**:
- Example in yellow-tinted container with 📝 icon
- Breakdown in green-tinted container with 🔍 icon
- Color-coded sections for Idea A (blue), Idea B (purple), Relationship (green)

#### `worked_example`

**Purpose**: Interactive question-and-answer component with click-to-reveal analysis

**Required Fields**:
- `text` or `question`: The passage/problem text
- `choices`: Object with keys A, B, C, D containing choice data

**Optional Fields in Each Choice**:
- `text`: The choice text (required)
- `category`: Classification of this answer type (optional)
- `flaw`: Explanation of why this answer is wrong (optional)
- `validation`: Explanation of why this answer is correct (optional)

```json
{
  "worked_example": {
    "text": "When one looks at the dark craggy vistas in Hitoshi Fugo's evocative photo series, one's mind might wander off to the cratered surfaces of faraway planets. ______ it's the series's title, Flying Frying Pan, that brings one back to Earth, reminding the viewer that each photo is actually a close-up view of a familiar household object: a frying pan.",
    "question": "Which choice completes the text with the most logical transition?",
    "choices": {
      "A": {
        "text": "Consequently,"
      },
      "B": {
        "text": "Alternatively,"
      },
      "C": {
        "text": "Ultimately,",
        "category": "Contrast/Reversal",
        "validation": "✅ Perfect - signals a reversal from faraway planets back to Earth"
      },
      "D": {
        "text": "Additionally,",
        "category": "Addition",
        "flaw": "Wrong purpose—adds new info rather than contrasting ideas"
      }
    }
  }
}
```

**Rendering Behavior**:
- If `text` field present: Passage text displayed in yellow/sand box (#f59e0b border)
- If `question` field present: Question text displayed in turquoise box (#06b6d4 border), centered, bold italic
- Both fields can be used together (passage + question) or just one
- Instruction text: "👆 Click each answer choice to reveal category and analysis"
- Interactive clickable choice cards with hover effects
- Hidden analysis sections revealed on click
- Flaws highlighted in coral background (#f97316)
- Validations highlighted in sea foam background (#a7f3d0)
- Minimum structure: Only `text` field required per choice
- Enhanced structure: Add `category`, `flaw`, or `validation` for detailed analysis

**Important Notes**:
- DO NOT use standalone `passage`, `question`, `choices` fields in content
- ALWAYS wrap them in a `worked_example` object
- The `text` field in `worked_example` serves as the passage/problem text
- Each choice must be an object with at least `{ "text": "..." }`
- Click-to-reveal only works when `category`, `flaw`, or `validation` are present

### 4. Conceptual Teaching Elements

#### `steps`
```json
{
  "steps": [
    {
      "step": "Step 1: FOLLOW the Logical Flow",
      "detail": "Identify the relationship between ideas in sentences."
    }
  ]
}
```
**Rendering**: Sequential step cards with numbering and clear hierarchy

#### `key_points`
```json
{
  "key_points": [
    {
      "title": "Phase 1: Context",
      "description": "Simplify to core logic—Idea A and Idea B—then identify the relationship"
    }
  ]
}
```
**Rendering**:
- Individual cards with Sea theme backgrounds
- Titles in Turquoise (#06b6d4)
- Clean, readable descriptions

#### `core_principle`
```json
{
  "core_principle": {
    "title": "Context Is King",
    "description": "We must find the word that is 100% provable—not just 'sounds good'"
  }
}
```
**Rendering**:
- Prominent display with Deep Ocean Blue background (#0369a1)
- White text for high contrast
- Centered and emphasized

#### `key_insight`
```json
{
  "key_insight": "🎯 Predicting BEFORE looking at choices prevents the SAT from manipulating your thinking"
}
```
**Rendering**:
- Highlighted text with Sea Foam background (#a7f3d0)
- Coral border (#f97316) for emphasis
- Icon support maintained

### 5. Reference Materials

#### `categories`
```json
{
  "categories": {
    "Addition/Continuation": [
      "Furthermore",
      "Additionally",
      "Moreover",
      "Also"
    ],
    "Contrast/Reversal": [
      "However",
      "Nevertheless",
      "In contrast"
    ]
  }
}
```
**Rendering**:
- Grid layout for multiple categories
- Category headers in Turquoise (#06b6d4)
- Items in comma-separated lists

#### `table`
```json
{
  "table": {
    "columns": [
      "Logical Trap / Red Flag",
      "How the Strategy Addresses It"
    ],
    "rows": [
      [
        "Trap 1: Choosing a word that 'vibes' right",
        "Phase 2: Predict BEFORE looking at choices to avoid manipulation"
      ]
    ]
  }
}
```
**Rendering**:
- Responsive table with Sea theme styling
- Alternating row colors for readability
- Headers with Deep Ocean Blue background (#0369a1)

### 6. Interactive Elements

#### `interactions`
```json
{
  "interactions": [
    {
      "type": "step_by_step_reveal",
      "auto_advance": false
    },
    {
      "type": "reveal_on_click",
      "elements": [
        {
          "trigger": "Show category examples",
          "reveal": "Having these categories memorized helps you instantly recognize what you need"
        }
      ]
    },
    {
      "type": "interactive_elimination",
      "show_flaw_analysis": true
    },
    {
      "type": "mastery_assessment",
      "required_for_completion": true,
      "retry_limit": 3
    }
  ]
}
```
**Rendering**:
- Progressive disclosure based on interaction type
- Click-to-reveal elements with visual feedback
- Assessment components with retry logic

## Technical Implementation

### Renderer Class Structure
```javascript
class LessonContentRenderer {
  constructor() {
    this.initializeStyles();
  }

  renderSlideContent(slide) {
    // Main rendering entry point
  }

  renderContentSections(content) {
    // Handles all content type routing
  }

  // Specialized rendering methods for each content type
  renderHeading(heading) {}
  renderStrategySteps(steps) {}
  renderExample(example) {}
  renderWorkedExample(workedExample) {}
  renderTactics(tactics) {}
  renderCategories(categories) {}
  renderTable(table) {}
  // ... etc
}
```

### Integration Points
- **Interactive Lessons**: `js/interactive-lessons.js` calls `window.lessonContentRenderer.renderSlideContent(slide)`
- **HTML Loading**: Script loaded in `index.html` before interactive lessons
- **Fallback Handling**: Graceful degradation if renderer unavailable

### Style Management
- All styles are programmatically generated
- Hawaiian sea theme colors consistent across all elements
- Mobile-responsive design with breakpoints
- High contrast ratios for accessibility

## Usage Examples

### Basic Slide Rendering
```javascript
const slide = {
  content: {
    heading: "Learning Objectives",
    bullet_points: [
      "Master transition words",
      "Create coherent structure",
      "Apply proven strategies"
    ]
  }
};

const html = window.lessonContentRenderer.renderSlideContent(slide);
```

### Complex Strategy Slide
```javascript
const slide = {
  content: {
    heading: "PHASE 1: Define the Context",
    subtitle: "Focus on Core Logic",
    strategy_steps: [
      {
        step: 1,
        title: "Simplify the Text",
        description: "Strip away complex terminology",
        points: ["Identify Idea A", "Identify Idea B"]
      }
    ],
    key_insight: "🎯 Context is everything"
  }
};
```

## Browser Compatibility
- Modern browsers supporting ES6+
- Responsive design for mobile/tablet/desktop
- Graceful fallback for older browsers
- MathJax integration for mathematical content

## Performance Considerations
- Minimal DOM manipulation
- Efficient string concatenation
- CSS-in-JS for dynamic styling
- Lazy loading for complex content

## Accessibility Features
- High contrast color ratios
- Semantic HTML structure
- Screen reader compatible
- Keyboard navigation support
- Focus management for interactive elements