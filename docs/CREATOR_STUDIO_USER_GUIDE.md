# SATify Creator Studio - User Guide

**Welcome to the SATify Creator Studio!** 🎨

This guide will help you create and edit interactive lessons for SATify students. No technical knowledge required!

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Creating Your First Lesson](#creating-your-first-lesson)
3. [Understanding the Interface](#understanding-the-interface)
4. [Working with Slides](#working-with-slides)
5. [Using the Preview Panel](#using-the-preview-panel)
6. [Saving Your Work](#saving-your-work)
7. [Publishing Workflow](#publishing-workflow)
8. [Best Practices](#best-practices)
9. [FAQ](#faq)

---

## Getting Started

### Accessing Creator Studio

1. Open your web browser
2. Navigate to: `http://localhost:3001/creator-enhanced.html`
3. You'll see the Creator Studio with three panels:
   - **Left**: Lesson selector
   - **Center**: Lesson editor
   - **Right**: Live preview

### Your First Login

The Creator Studio automatically loads all available lessons. You can:
- ✏️ Edit existing lessons
- ➕ Create new lessons
- 👁️ Preview your work
- 💾 Save drafts

---

## Creating Your First Lesson

### Method 1: Edit an Existing Lesson

1. **Select a Lesson**
   - Click on any lesson in the left sidebar
   - The lesson will load in the editor
   - You'll see a green "🟢 Lesson loaded" indicator

2. **Make Your Changes**
   - Edit the title, subtitle, or learning objectives
   - Add, edit, or delete slides
   - Watch the live preview update

3. **Save Your Work**
   - Click "💾 Save Draft" button
   - Your changes are saved to the server
   - A version snapshot is automatically created

### Method 2: Create a New Lesson

1. **Click "+ New Lesson"** button in the left sidebar
2. **Fill in Lesson Details**:
   - **Lesson ID**: Unique identifier (e.g., `lesson_13`)
   - **Title**: Main title (e.g., "Main Ideas & Details")
   - **Subtitle**: Category (e.g., "Reading Comprehension")
   - **Level**: Foundation, Intermediate, or Advanced
   - **Duration**: Estimated time (e.g., "20-25 min")
   - **Skill Codes**: SAT skills (e.g., "CID, INF")
   - **Learning Objectives**: What students will learn

3. **Add Slides** (see [Working with Slides](#working-with-slides))

---

## Understanding the Interface

### Three-Panel Layout

```
┌──────────────┬──────────────────────────┬──────────────┐
│   LESSON     │      EDITOR PANEL        │   PREVIEW    │
│   SELECTOR   │                          │   PANEL      │
│              │  📋 Lesson Metadata      │              │
│ 📚 Lessons   │  ├─ Title               │  👁️ Live     │
│   • Lesson 1 │  ├─ Subtitle            │  Preview     │
│   • Lesson 2 │  ├─ Level               │              │
│   • Lesson 3 │  ├─ Duration            │  Shows how   │
│              │  ├─ Skills              │  students    │
│ + New Lesson │  └─ Objectives          │  will see    │
│              │                          │  your lesson │
│              │  📑 Slides               │              │
│              │  ├─ Slide 1             │              │
│              │  ├─ Slide 2             │              │
│              │  └─ + Add Slide         │              │
│              │                          │              │
│              │  💾 Save | 👁️ Preview   │              │
└──────────────┴──────────────────────────┴──────────────┘
```

### Status Indicators

| Indicator | Meaning |
|-----------|---------|
| 🟢 All changes saved | Your work is saved |
| 🟡 Saving... | Currently saving to server |
| 🔴 Unsaved changes | You have unsaved work |
| ⏳ Loading... | Loading lesson data |

### Auto-Save Feature

Creator Studio automatically saves your work to your browser every 30 seconds! This means:
- ✅ You won't lose work if your browser crashes
- ✅ You can continue where you left off
- ✅ Your draft is protected even if you forget to save

**Note**: Auto-save saves to your browser only. Click "💾 Save Draft" to save to the server for access from other devices.

---

## Working with Slides

### Understanding Slide Types

SATify supports 6 types of interactive slides:

#### 1. 📚 Strategy Teaching
**Best for**: Teaching step-by-step strategies

**Contains**:
- Main heading
- Numbered steps
- Summary

**Example Use**: "The 3-Phase Master Strategy for Transitions"

**How to Create**:
1. Click "+ Add Slide"
2. Select "Strategy Teaching"
3. Fill in:
   - **Main Heading**: "PHASE 1: Define the Context"
   - **Steps** (one per line):
     ```
     Read the sentence before the blank
     Read the sentence after the blank
     Identify the logical relationship
     ```
   - **Summary**: "Focus on logic, not details"
4. Click "Save Slide"

---

#### 2. 🎯 Worked Example
**Best for**: Interactive practice questions with detailed analysis

**Contains**:
- Passage text
- Question text
- Multiple choice answers (A, B, C, D)
- Each choice has:
  - Category (what type of answer it is)
  - Flaw (why it's wrong)
  - Validation (why the correct answer is right)
- Explanation

**Example Use**: Demonstrating how to eliminate wrong answers

**How to Create**:
1. Click "+ Add Slide"
2. Select "Worked Example"
3. Fill in:
   - **Passage Text**: The reading passage
   - **Question Text**: The question students see
   - **Answer Choices**: Click to reveal a text area with JSON format:
   ```json
   [
     {
       "id": "A",
       "text": "However",
       "category": "Contrast",
       "flaw": "The sentences agree, not contrast",
       "validation": ""
     },
     {
       "id": "B",
       "text": "Therefore",
       "category": "Cause-Effect",
       "flaw": "No causal relationship exists",
       "validation": ""
     },
     {
       "id": "C",
       "text": "Additionally",
       "category": "Addition",
       "flaw": "",
       "validation": "Correctly adds supporting evidence"
     },
     {
       "id": "D",
       "text": "Instead",
       "category": "Replacement",
       "flaw": "No replacement logic present",
       "validation": ""
     }
   ]
   ```
   - **Correct Answer**: "C"
   - **Explanation**: Summary of why C is correct
4. Click "Save Slide"

**💡 Tip**: Students can click on each answer choice to reveal the category, flaw, and validation!

---

#### 3. 💡 Concept Teaching
**Best for**: Explaining key concepts with examples

**Contains**:
- Main concept name
- Bullet points
- Examples with labels

**Example Use**: "What are transition words?"

**How to Create**:
1. Click "+ Add Slide"
2. Select "Concept Teaching"
3. Fill in:
   - **Main Concept**: "Transition Words: Logical Bridges"
   - **Bullet Points** (one per line):
     ```
     Connect ideas between sentences
     Show relationships (cause, contrast, addition)
     Guide the reader's understanding
     ```
   - **Examples** (JSON format):
   ```json
   [
     {
       "label": "Cause-Effect",
       "text": "therefore, thus, consequently, as a result"
     },
     {
       "label": "Contrast",
       "text": "however, nevertheless, on the other hand"
     },
     {
       "label": "Addition",
       "text": "additionally, furthermore, moreover"
     }
   ]
   ```
4. Click "Save Slide"

---

#### 4. ✏️ Practice Prompt
**Best for**: Directing students to practice questions

**Contains**:
- Prompt text
- Button text

**Example Use**: "You've learned the strategy, now practice!"

**How to Create**:
1. Click "+ Add Slide"
2. Select "Practice Prompt"
3. Fill in:
   - **Prompt Text**: "Ready to apply what you've learned? Let's practice with real questions!"
   - **Button Text**: "Start Practice Questions"
4. Click "Save Slide"

---

#### 5. 🎯 Learning Objectives
**Best for**: Showing students what they'll learn

**Contains**:
- List of objectives

**Example Use**: First slide of a lesson

**How to Create**:
1. Click "+ Add Slide"
2. Select "Learning Objectives"
3. Fill in **Objectives** (one per line):
   ```
   Master transition words for logical flow
   Create coherent paragraph structure
   Apply the 3-Phase Master Strategy
   ```
4. Click "Save Slide"

---

#### 6. 📄 Generic Content
**Best for**: Custom content when other types don't fit

**Contains**:
- Any custom JSON structure

**Example Use**: Special interactive elements

**How to Create**:
1. Click "+ Add Slide"
2. Select "Content"
3. Edit the JSON directly:
   ```json
   {
     "heading": "Your custom heading",
     "body": "Your custom content",
     "custom_field": "Any data you need"
   }
   ```
4. Click "Save Slide"

---

### Editing an Existing Slide

1. Find the slide in the **📑 Slides** section
2. Click the **Edit** button
3. Make your changes in the modal
4. Click **Save Slide**

**💡 Tip**: Changes to slides update the preview in real-time!

---

### Deleting a Slide

1. Find the slide in the **📑 Slides** section
2. Click the **Delete** button
3. Confirm deletion
4. The slide is removed and preview updates

**⚠️ Warning**: Deletion is permanent once you save the draft!

---

### Reordering Slides (Drag & Drop)

1. **Hover** over a slide in the **📑 Slides** section
2. **Click and hold** the **☰** drag handle (three horizontal lines)
3. **Drag** the slide up or down
4. **Drop** it in the new position
5. The preview updates automatically!

**Visual Feedback**:
- Dragging: Slide becomes semi-transparent
- Hovering: Blue line shows drop position
- Dropped: Slide order updates instantly

---

## Using the Preview Panel

### What is the Preview Panel?

The right panel shows exactly how students will see your lesson.

### Features

1. **Metadata Summary**
   - Title, subtitle, level, duration
   - Color-coded for easy reading

2. **Learning Objectives**
   - Displayed with 🎯 icon
   - Bulleted list format

3. **Slide Cards**
   - Each slide shown as a card
   - Icons indicate slide type:
     - 📚 Strategy Teaching
     - 🎯 Worked Example
     - 💡 Concept Teaching
     - ✏️ Practice Prompt
     - 🎯 Learning Objectives
     - 📄 Generic Content
   - Hover over cards for visual highlight
   - Click **Edit** to quickly edit a slide

4. **Slide Statistics**
   - Shows key metrics for each slide:
     - Strategy Teaching: number of steps
     - Worked Example: number of choices, correct answer
     - Concept Teaching: number of bullet points

5. **Full Preview Button**
   - Click **🚀 Open Full Preview** to see the lesson exactly as students will experience it
   - Opens in a new window
   - Navigate through slides like a real lesson

### Using Full Preview

1. Click **🚀 Open Full Preview** in the preview panel
2. A new window opens showing your lesson
3. Use **Previous** and **Next** buttons to navigate
4. Experience all interactive features
5. Close window when done

**💡 Tip**: Use full preview to test your lesson before requesting publication!

---

## Saving Your Work

### Three Ways Your Work is Protected

#### 1. Auto-Save (Every 30 seconds)
- Saves to your **browser** automatically
- No action needed
- Protects against crashes
- Lasts 24 hours
- **Limitation**: Only accessible on this device/browser

#### 2. Manual Save Draft (Click button)
- Saves to the **server**
- Click "💾 Save Draft" button
- Accessible from any device
- Creates a version snapshot
- **Recommendation**: Save frequently!

#### 3. Version Snapshots (Automatic)
- Created every time you save a draft
- Timestamped for history tracking
- Admin can restore any version
- Unlimited retention

### When to Save

| Situation | Action |
|-----------|--------|
| Made significant changes | Click "💾 Save Draft" |
| Taking a break | Click "💾 Save Draft" |
| Finished editing | Click "💾 Save Draft" |
| About to close browser | Click "💾 Save Draft" |
| Minor changes | Wait for auto-save (30s) |

### Checking Save Status

Look at the status indicator:
- 🟢 **All changes saved** = You're safe!
- 🟡 **Saving...** = Wait a moment
- 🔴 **Unsaved changes** = Click "💾 Save Draft" soon!

### Unsaved Changes Warning

If you try to close the browser with unsaved changes, you'll see:
```
⚠️ You have unsaved changes!
   Are you sure you want to leave?
```

Click **Stay on Page** to continue editing and save your work.

---

## Publishing Workflow

### Overview

```
YOU (Creator) → Save Draft → Request Publish
                                ↓
                           ADMIN Reviews
                                ↓
                    ┌───────────┴───────────┐
                    ↓                       ↓
                 APPROVED                REJECTED
                    ↓                       ↓
               Published Live         Get Feedback
                                           ↓
                                      Make Changes
                                           ↓
                                   Request Publish Again
```

### Step 1: Save Your Draft

1. Make all your changes
2. Click "💾 Save Draft"
3. Verify status shows 🟢 "All changes saved"

### Step 2: Preview Your Lesson

1. Click "🚀 Open Full Preview"
2. Go through every slide
3. Check for:
   - Spelling and grammar
   - Correct slide order
   - All content displays properly
   - Interactive elements work

### Step 3: Request Publish

1. Click "✅ Request Publish" button
2. Confirm your request
3. You'll see: "Publish request submitted! Admin will review."

### Step 4: Wait for Admin Review

The admin will:
- Compare your draft to the published version
- Check all changes
- Test the lesson
- Either **approve** or **reject**

### Step 5: If Approved ✅

- Your lesson goes live immediately
- Students can access it
- A backup is created for rollback
- You'll be notified (future feature)

### Step 6: If Rejected ❌

- You'll receive feedback explaining why
- Make the requested changes
- Save your draft again
- Request publish again

---

## Best Practices

### Lesson Design

1. **Start with Learning Objectives**
   - Always include a Learning Objectives slide first
   - Be specific about what students will learn
   - Use action verbs: "Master", "Identify", "Apply"

2. **Teach Before Testing**
   - Start with strategy/concept slides
   - Then show worked examples
   - End with practice prompts

3. **Keep Slides Focused**
   - One concept per slide
   - 3-5 bullet points maximum
   - Use clear, simple language

4. **Use Worked Examples Wisely**
   - Explain why wrong answers are wrong
   - Show the thinking process
   - Validate the correct answer

5. **End with Action**
   - Final slide should be a Practice Prompt
   - Direct students to apply what they learned

### Slide Order Best Practices

**Recommended Structure**:
```
1. Learning Objectives       (🎯)
2. Concept Introduction      (💡)
3. Strategy Teaching         (📚)
4. Worked Example #1         (🎯)
5. Worked Example #2         (🎯)
6. Practice Prompt           (✏️)
```

### Writing Tips

#### For Titles
- ✅ "The 3-Phase Master Strategy"
- ❌ "Strategy"

#### For Steps
- ✅ "Read the sentence before the blank"
- ❌ "Read before"

#### For Explanations
- ✅ "This answer is wrong because the sentences show agreement, not contrast."
- ❌ "Wrong - no contrast"

#### For Learning Objectives
- ✅ "Master transition words for logical flow and rhetorical purpose"
- ❌ "Learn transitions"

### JSON Formatting Tips

When editing JSON fields (like choices in Worked Examples):

1. **Always use double quotes** for strings:
   - ✅ `"text": "However"`
   - ❌ `'text': 'However'`

2. **No trailing commas**:
   - ✅ `"id": "A"`
   - ❌ `"id": "A",` (no comma after last item)

3. **Proper nesting**:
   ```json
   [
     {
       "id": "A",
       "text": "However"
     }
   ]
   ```

4. **Test your JSON** at https://jsonlint.com/ if you get errors

---

## FAQ

### General Questions

**Q: Do I need to know how to code?**
A: No! Creator Studio is designed for non-technical users. All editing is done through forms.

**Q: What happens if my browser crashes?**
A: Auto-save protects your work! When you reopen Creator Studio, you'll be asked if you want to restore your last session.

**Q: Can I work on a lesson across multiple days?**
A: Yes! Click "💾 Save Draft" and your work is saved to the server. You can return anytime.

**Q: Can multiple people edit the same lesson?**
A: Currently, one person at a time should edit a lesson. Future versions will support collaboration.

**Q: How do I know what I changed?**
A: The admin review dashboard shows a side-by-side comparison of your draft vs. the published version with all changes highlighted.

---

### Editing Questions

**Q: I deleted a slide by mistake. Can I undo?**
A: If you haven't saved yet, refresh the page and click "Stay on Page" when warned about unsaved changes. If you already saved, contact an admin to restore from a version snapshot.

**Q: Can I copy a slide from one lesson to another?**
A: Not directly yet. You can:
1. Open both lessons in different browser tabs
2. Edit the slide in lesson 1
3. Copy the JSON content
4. Create a new slide in lesson 2
5. Paste the JSON

**Q: How do I add images to slides?**
A: Image support is coming soon! For now, use descriptive text.

**Q: The preview looks different from what I expected. Why?**
A: Click "🚀 Open Full Preview" to see exactly how students will see it. The preview panel shows a summary view.

---

### Saving & Publishing Questions

**Q: How long does admin review take?**
A: Typically 1-2 business days. Urgent changes can be flagged.

**Q: What if I need to make changes after publishing?**
A: Edit the lesson and request publish again. The admin will review the changes.

**Q: Can I save multiple versions of a lesson?**
A: Version snapshots are automatic! Every save creates a timestamped version that admins can restore.

**Q: My lesson was rejected. What now?**
A: Check the rejection feedback, make the requested changes, and request publish again.

---

### Technical Questions

**Q: Why isn't auto-save working?**
A: Check the status indicator. If it stays "unsaved", try:
1. Refresh the page (you'll be warned about unsaved changes)
2. Clear your browser cache
3. Contact support

**Q: I see a JSON error when saving. What do I do?**
A: You likely have a formatting error in a JSON field (like Worked Example choices). Check for:
- Missing quotes
- Extra commas
- Mismatched brackets
- Copy your JSON to https://jsonlint.com/ to find the error

**Q: The drag & drop isn't working. How do I reorder slides?**
A: Try:
1. Click and hold the ☰ handle (not the slide card)
2. Ensure you're dragging vertically
3. Look for the blue line showing drop position
4. Release when in the right spot

**Q: Can I access Creator Studio on my phone/tablet?**
A: Creator Studio works best on desktop/laptop computers. Mobile support is limited.

---

## Getting Help

### Contact Support

- **Email**: support@satify.com (replace with actual)
- **GitHub Issues**: https://github.com/gravishankar/SATify/issues
- **Admin Chat**: Contact your admin for lesson-specific help

### Reporting Bugs

If something isn't working:
1. Note what you were doing when it broke
2. Check the browser console (F12 → Console tab)
3. Take a screenshot
4. Email support with:
   - Description of the problem
   - Steps to reproduce
   - Screenshot
   - Console errors (if any)

---

## Quick Reference Card

### Keyboard Shortcuts (Future Feature)
```
Ctrl/Cmd + S    →  Save Draft
Ctrl/Cmd + P    →  Preview
Esc             →  Close Modal
```

### Status Indicators
```
🟢  Saved
🟡  Saving
🔴  Unsaved
⏳  Loading
```

### Slide Type Icons
```
📚  Strategy Teaching
🎯  Worked Example / Learning Objectives
💡  Concept Teaching
✏️  Practice Prompt
📄  Generic Content
```

### Common Actions
```
+ New Lesson          →  Create new lesson
Edit (slide)          →  Edit slide content
Delete (slide)        →  Remove slide
☰ (drag handle)       →  Reorder slides
💾 Save Draft         →  Save to server
👁️ Preview           →  View as student
🚀 Open Full Preview  →  Test complete lesson
✅ Request Publish    →  Submit for approval
```

---

## Appendix: Example Lesson Structure

Here's a complete example of a well-structured lesson:

### Lesson: "Transitions & Flow"

**Metadata**:
- Title: "Transitions & Flow"
- Subtitle: "Expression of Ideas"
- Level: Foundation
- Duration: 20-25 min
- Skills: TRA
- Learning Objectives:
  - Master transition words for logical flow
  - Create coherent paragraph structure
  - Apply the 3-Phase Master Strategy

**Slide Structure**:

1. **Slide 1: Learning Objectives** (🎯)
   - Type: Learning Objectives
   - Shows the 3 objectives above

2. **Slide 2: What Are Transitions?** (💡)
   - Type: Concept Teaching
   - Main Concept: "Transition Words: Logical Bridges"
   - Bullet Points: Definition, purpose, categories
   - Examples: Contrast, cause-effect, addition

3. **Slide 3: The Master Strategy** (📚)
   - Type: Strategy Teaching
   - Main Heading: "The 3-Phase Master Strategy"
   - Steps:
     1. Define the Context
     2. Identify the Relationship
     3. Validate Your Choice
   - Summary: Focus on logic, not memorization

4. **Slide 4: Worked Example #1** (🎯)
   - Type: Worked Example
   - Passage, question, 4 choices with analysis
   - Shows students how to apply the strategy

5. **Slide 5: Worked Example #2** (🎯)
   - Type: Worked Example
   - Different question type for practice

6. **Slide 6: Ready to Practice?** (✏️)
   - Type: Practice Prompt
   - Directs students to skill practice

---

**Happy Creating!** 🎉

Remember: Great lessons come from iteration. Don't be afraid to make mistakes, get feedback, and improve!
