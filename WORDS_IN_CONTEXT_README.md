# Words in Context Integration

This document describes the Words in Context practice feature integration with the SAT Practice Pro app.

## Features Implemented

### 1. Words in Context Tab
- Added a new navigation tab "Words in Context" to the main app
- Dedicated practice interface for vocabulary questions
- Strategy breakdown functionality

### 2. Question Data Structure
- Created `data/chunks/words-in-context.json` with 10 sample questions
- Each question includes:
  - Standard SAT question format (stem_html, choices, correct_choice_index)
  - Strategy breakdown with 5-step analysis
  - Pattern recognition (TENSION_DETAIL, CONTRAST, PROCESS_RESULT, etc.)

### 3. Strategy System
- **Text-based strategy breakdowns** with 5-step methodology:
  1. Context Analysis - Identify the question pattern
  2. Bridge Word - Key signal in the passage
  3. Word Cluster - Type of word to look for
  4. Process of Elimination - Red flags to avoid
  5. Verification - Why the correct answer works

- **Dynamic strategy generation** for questions without pre-made strategies
- **Pattern recognition engine** that identifies:
  - TENSION_DETAIL (tension + colon structure)
  - CONTRAST (However, Despite, While signals)
  - PROCESS_RESULT (study findings)
  - EVIDENCE_DETAIL (colon + examples)
  - EVALUATION (praise/criticism tone)
  - DESCRIPTION (general context)

### 4. User Interface
- **Strategy Button** (🎯) next to bookmark and flag buttons
- **Strategy Modal** with step-by-step breakdown
- **Visual feedback** for correct/incorrect answers
- **Toast notifications** for user actions
- **Responsive design** for mobile devices

## File Structure

```
sat-practice-pro/
├── data/chunks/
│   └── words-in-context.json          # Question data with strategies
├── js/
│   ├── words-in-context.js            # Main WIC practice module
│   └── strategy-generator.js          # Pattern recognition & strategy generation
├── styles.css                         # Updated with WIC-specific styles
└── index.html                         # Updated with WIC tab and modal
```

## Usage

1. **Access**: Click the "Words in Context" tab in the main navigation
2. **Practice**: Answer questions using multiple choice selection
3. **Strategy**: Click the strategy button (🎯) for detailed breakdown
4. **Navigation**: Use Previous/Next buttons to move between questions

## Strategy Pattern Examples

### TENSION_DETAIL Pattern
```
"The work derives power from tension among his ______ influences"
→ Look for words showing difference/variety (disparate, diverse)
→ Avoid words showing harmony (complementary, uniform)
```

### CONTRAST Pattern
```
"While some praised it, others were less ______ about the results"
→ Contrast signal requires opposite meaning
→ If "praised" = positive, blank should be negative or neutral
```

### PROCESS_RESULT Pattern
```
"The study found that kindness can ______ prosocial behavior"
→ Research results need logical outcomes
→ Positive study results suggest positive effects (foster, promote)
```

## Future Enhancements

### Voice Integration (Planned)
- **ElevenLabs API integration** for voice cloning
- **Socratic dialogue** between tutor and student characters
- **Audio strategy breakdowns** with character voices
- **Text-to-speech fallback** for accessibility

### Integration Points
- The strategy generator is designed to work with the existing podcast components
- `generateSocraticScript()` method ready for voice synthesis
- Modular design allows easy addition of voice features

## Technical Implementation

### Strategy Generator Class
```javascript
// Initialize strategy generator
const generator = new StrategyGenerator();

// Analyze question and generate strategy
const strategy = generator.generateTextStrategy(questionData);

// Generate dialogue script for future voice integration
const script = generator.generateSocraticScript(analysis);
```

### Words in Context Practice Class
```javascript
// Access the practice module
window.satApp.wordsInContextPractice

// Check progress
const progress = wordsInContextPractice.getProgress();
// Returns: { totalQuestions, answeredQuestions, correctAnswers, accuracy }
```

## Data Format

### Question Structure
```json
{
  "uId": "unique-id",
  "questionId": "question-id",
  "module": "reading-writing",
  "primary_class_cd_desc": "Words in Context",
  "stem_html": "<p>Passage with <span aria-hidden=\"true\">______</span> blank</p>",
  "choices": ["choice1", "choice2", "choice3", "choice4"],
  "correct_choice_index": 2,
  "explanation_html": "<p>Explanation text</p>",
  "strategy": {
    "pattern": "PATTERN_NAME",
    "step1": "Context analysis step",
    "step2": "Bridge word identification",
    "step3": "Word cluster prediction",
    "step4": "Elimination strategy",
    "step5": "Verification reasoning"
  }
}
```

## Testing

To test the integration:

1. Open the SAT Practice Pro app
2. Click the "Words in Context" tab
3. Verify questions load properly
4. Test answer selection and submission
5. Click the strategy button (🎯) to verify modal opens
6. Check that strategy steps display correctly
7. Test navigation between questions

## Notes

- All functionality is built in vanilla JavaScript for compatibility
- Strategy data extracted from enhanced_csv_output-3.txt
- Ready for voice cloning integration with minimal changes
- Responsive design works on mobile devices
- Toast notifications provide user feedback