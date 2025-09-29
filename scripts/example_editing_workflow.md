# Example: Editing Workflow

This guide shows how to edit a lesson using the converter tools.

## Step 1: Convert JSON to Text

```bash
python lesson_converter.py json_to_text ../lessons/lesson_01.json
```

This creates `lesson_01.txt` with editable content.

## Step 2: Edit the Text File

Open `lesson_01.txt` in any text editor. Here's what you can safely edit:

### ✅ Safe to Edit

**Lesson Information:**
```
Title: SAT Reading Fundamentals  ← Change this
Subtitle: Central Ideas & Details  ← Change this
Duration: 20-25 min  ← Change this
```

**Learning Objectives:**
```
# LEARNING OBJECTIVES
1. Identify main ideas in reading passages  ← Edit these
2. Distinguish between central ideas and supporting details  ← Edit these
3. Apply strategies for finding topic sentences  ← Add new ones
```

**Slide Content:**
```
### CONTENT
Heading: Learning Objectives  ← Change heading
Text:
    In this lesson, you'll master...  ← Edit text content
Bullet Points:
    • Understand what makes an idea 'central'  ← Edit bullets
    • Learn the 3-step method for finding main ideas  ← Add/remove bullets
```

### ⚠️ Keep Structure

**Don't change these structural elements:**
- Section headers: `# LESSON INFORMATION`, `## SLIDE:`
- Slide separators: `---`
- Field labels: `Title:`, `Type:`, `Duration:`
- Content markers: `### CONTENT`, `### INTERACTIONS`

## Step 3: Example Edit

Let's say you want to change the lesson title and add a bullet point:

**Before:**
```
Title: SAT Reading Fundamentals
...
Bullet Points:
    • Understand what makes an idea 'central' vs. supporting
    • Learn the 3-step method for finding main ideas
```

**After:**
```
Title: Mastering SAT Reading Skills
...
Bullet Points:
    • Understand what makes an idea 'central' vs. supporting
    • Learn the 3-step method for finding main ideas
    • Practice with real SAT passage examples
    • Build confidence through guided practice
```

## Step 4: Convert Back to JSON

```bash
python lesson_converter.py text_to_json lesson_01.txt lesson_01_updated.json
```

## Step 5: Verify the Changes

Check the generated JSON file:

```bash
# Validate JSON syntax
python -m json.tool lesson_01_updated.json

# Or use the demo validator
python demo.py
# Then choose option 7 to validate
```

## Common Editing Patterns

### Adding a New Slide

```
## SLIDE: slide_new
Type: concept_teaching
Title: New Concept Slide
Duration: 240 seconds

### CONTENT
Heading: New Concept
Text:
    This is a new concept we're teaching.
Bullet Points:
    • First key point
    • Second key point
    • Third key point

### INTERACTIONS
Type: click_to_continue
Text: Click to continue when ready
---
```

### Adding Strategy Steps

```
Strategy Steps:
    Step 1: Read the Question
        Carefully read what the question is asking for
        Example: "What is the main idea of the passage?"
    Step 2: Scan the Passage
        Look for topic sentences and key phrases
        Example: Look for phrases like "In conclusion" or "The main point"
    Step 3: Eliminate Wrong Answers
        Cross out obviously incorrect choices
        Example: Answers that are too specific or off-topic
```

### Editing Practice Transitions

```
Practice Transition:
    Text: Ready to practice what you've learned? Let's apply these skills!
    Button: Start Practice Questions
```

## Tips for Successful Editing

1. **Always backup** your original JSON files before editing
2. **Test small changes** first to get familiar with the format
3. **Use consistent formatting** - follow the existing patterns
4. **Validate frequently** - convert back to JSON to check for errors
5. **Keep slide durations realistic** - 180-400 seconds per slide
6. **Match skill codes** - ensure they align with your lesson content

## Troubleshooting

**Parse error after conversion:**
- Check that all section headers are intact
- Ensure slide separators (`---`) are present
- Verify field names haven't been changed

**Missing content:**
- Check indentation for text content (should be indented with 4 spaces)
- Ensure bullet points start with `• ` (bullet + space)

**Validation fails:**
- Use `python -m json.tool` to check JSON syntax
- Compare structure with a working lesson file