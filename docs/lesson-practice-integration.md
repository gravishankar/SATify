# 📋 Lesson-Practice Integration Flow Documentation

## Overview
This document explains how the "Start Practice Questions" button in lesson slides connects to the correct skill-level questions in SATify.

## 🔗 Complete Integration Flow: "Start Practice Questions" → Skill-Level Questions

### 🎯 How the Practice Transition Works

#### 1. Lesson Configuration (JSON Structure)
```json
{
  "skill_codes": ["TRA"],  // Skill code in lesson
  "slides": [
    {
      "id": "slide_08",
      "type": "guided_practice",
      "content": {
        "practice_transition": {
          "text": "Ready to practice what you've learned? Let's apply these skills!",
          "button": "Start Practice Questions",
          "skill_code": "TRA",                    // Links to specific skill
          "target_skill": "TRA",
          "practice_type": "skill_practice"
        }
      },
      "interactions": [
        {
          "type": "practice_transition",
          "target_skill": "TRA",                  // Practice target
          "practice_type": "skill_practice"
        }
      ]
    }
  ]
}
```

#### 2. Button Click Handler (`interactive-lessons.js:370`)
```javascript
// When "Start Practice Questions" is clicked:
const skillCode = e.target.dataset.skillCode;  // Gets "TRA"
console.log('[Interactive Lessons] Transitioning to practice for skill:', skillCode);

// Close lesson modal and navigate to practice
this.closeLessonModal(modal);
window.app.showPage('skill-practice');

// Start skill practice with the specific skill code
window.skillPracticeUI.startSkillPractice(skillCode);
```

#### 3. Practice Session Creation (`skill-practice-ui.js:300`)
```javascript
async startSkillPractice(skillCode) {
    // Creates practice session with specific parameters
    const session = await this.manager.startPracticeSession('skill', skillCode, {
        questionLimit: 20,    // Max 20 questions per session
        shuffle: true         // Randomize question order
    });
}
```

#### 4. Question Filtering (`skill-practice-manager.js:164`)
```javascript
// If practice type is 'skill', filter questions by skill code
if (practiceType === 'skill') {
    questions = this.getQuestionsForSkill(targetId, { shuffle: true });
    sessionConfig.skillInfo = this.config.skillPracticeConfig.skillMappings[targetId];
}

// getQuestionsForSkill filters by exact skill code match
getQuestionsForSkill(skillCode, options = {}) {
    const skillQuestions = this.questionData.filter(question =>
        question.skill_cd === skillCode  // Exact match: "TRA" === "TRA"
    );

    // Optional difficulty filtering
    if (options.difficulty) {
        return skillQuestions.filter(q => q.difficulty === options.difficulty);
    }

    return skillQuestions;
}
```

## 🎯 Skill Level & Difficulty Selection

### Available Difficulty Levels:
- **"E"** - Easy (score_band_range_cd: 1-3)
- **"M"** - Medium (score_band_range_cd: 4-5)
- **"H"** - Hard (score_band_range_cd: 6-7)

### Default Behavior:
- **No difficulty filter** - All difficulty levels included
- **Questions shuffled** - Random order presentation
- **Adaptive progression** - Questions not filtered by student level initially

### Question Structure Example:
```json
{
  "skill_cd": "TRA",
  "difficulty": "M",
  "score_band_range_cd": 4,
  "primary_class_cd_desc": "Expression of Ideas",
  "skill_desc": "Transitions",
  "stem_html": "...",
  "choices": ["...", "...", "...", "..."],
  "correct_choice_index": 2
}
```

## 🔧 Skill Code Mapping

### From Config (`skill-practice-config.json`):
```json
"TRA": {
  "skillCode": "TRA",
  "skillId": "transitions",
  "skillTitle": "Transitions",
  "domainId": "expression_of_ideas",
  "domainTitle": "Expression of Ideas",
  "description": "Using appropriate transitional words and phrases to connect ideas"
}
```

### Available Skill Codes:
- **CID** - Central Ideas and Details
- **COE** - Command of Evidence
- **INF** - Inferences
- **SYN** - Rhetorical Synthesis
- **TRA** - Transitions
- **FSS** - Form, Structure, and Sense
- **BOU** - Boundaries
- **WIC** - Words in Context

## 📊 Complete Flow Summary

1. **Lesson Completion:** Student finishes transitions lesson
2. **Button Click:** "Start Practice Questions" with `data-skill-code="TRA"`
3. **Navigation:** Switches to skill-practice page
4. **Session Creation:** Creates practice session for skill "TRA"
5. **Question Filtering:** Filters question bank by `skill_cd === "TRA"`
6. **Question Selection:** Gets up to 20 TRA questions, all difficulty levels
7. **Presentation:** Shows questions in shuffled order
8. **Practice:** Student practices with transitions-specific questions

## 🎛️ Customization Options

### To Control Difficulty Level:
```javascript
// In startSkillPractice, you could add:
const session = await this.manager.startPracticeSession('skill', skillCode, {
    questionLimit: 20,
    shuffle: true,
    difficulty: 'E'  // Only Easy questions
});
```

### To Filter by Lesson Level:
```javascript
// Match lesson level to question difficulty
const lessonLevel = lesson.level; // "Foundation", "Intermediate", "Advanced"
const difficultyMap = {
    "Foundation": "E",
    "Intermediate": "M",
    "Advanced": "H"
};
```

### To Implement Progressive Difficulty:
```javascript
// Example: Start with easier questions, progress to harder
const getProgressiveDifficulty = (sessionProgress) => {
    if (sessionProgress < 0.3) return 'E';
    if (sessionProgress < 0.7) return 'M';
    return 'H';
};
```

## 🔍 Technical Implementation Details

### Key Files:
- `js/interactive-lessons.js` - Handles lesson-to-practice transition
- `js/skill-practice-ui.js` - Manages practice session UI
- `js/skill-practice-manager.js` - Handles question filtering and session management
- `data/skill-practice-config.json` - Skill code mappings and configuration

### Practice Session Configuration:
```javascript
{
    practiceType: 'skill',     // 'skill' or 'domain'
    targetId: 'TRA',           // Skill code
    questionLimit: 20,         // Max questions per session
    shuffle: true,             // Randomize order
    startTime: new Date(),     // Session start timestamp
    skillInfo: {               // Skill metadata
        skillCode: "TRA",
        skillTitle: "Transitions",
        domainTitle: "Expression of Ideas"
    }
}
```

## 🎉 Key Benefits

### ✅ **Skill Code Linking:**
The "Start Practice Questions" button uses `data-skill-code="TRA"` to link directly to Transitions questions

### ✅ **Question Filtering:**
Questions are filtered by exact skill code match (`skill_cd === "TRA"`)

### ✅ **Difficulty Levels:**
Three levels available (E/M/H) but by default, ALL levels are included for comprehensive practice

### ✅ **Adaptive Approach:**
No initial difficulty filtering - students get mixed difficulty for natural progression

### ✅ **Session Limits:**
Maximum 20 questions per practice session, shuffled for variety

## 🚀 The Integration Is Smart

1. **Seamless Transition:** Lesson → Practice with zero friction
2. **Skill-Specific:** Only relevant questions for the lesson topic
3. **Comprehensive Coverage:** All difficulty levels ensure complete skill development
4. **Randomized Order:** Prevents predictable patterns
5. **Configurable:** Easy to modify for adaptive difficulty in future

## 💡 Best Practices for Lesson Creation

### When Creating Lessons:
1. **Always include skill_codes** in lesson JSON
2. **Add practice_transition** to final slides
3. **Use correct skill codes** that match question bank
4. **Test transitions** to ensure proper question filtering

### Example Practice Transition Configuration:
```json
{
  "content": {
    "practice_transition": {
      "text": "Ready to practice what you've learned? Let's apply these skills!",
      "button": "Start Practice Questions"
    }
  },
  "interactions": [
    {
      "type": "practice_transition",
      "target_skill": "TRA",
      "practice_type": "skill_practice"
    }
  ]
}
```

---

**The lesson conversion system works perfectly with this practice integration - when students complete converted lessons, they'll get targeted questions that match exactly what they learned!** 🚀

*Last updated: September 30, 2024*