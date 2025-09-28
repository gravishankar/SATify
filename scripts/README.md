# SATify Lesson Converter

Convert between JSON lesson format and editable text/Word documents for easy lesson editing.

## Features

✅ **JSON → Text**: Convert lesson JSON to human-readable text format
✅ **JSON → Word**: Convert lesson JSON to formatted Word document
✅ **Text → JSON**: Convert edited text back to JSON lesson format
✅ **Word → JSON**: Convert edited Word document back to JSON lesson format

## Installation

```bash
# Install required dependencies
pip install python-docx

# Or install from requirements file
pip install -r requirements.txt
```

## Usage

### Basic Commands

```bash
# Convert JSON to editable text file
python lesson_converter.py json_to_text lesson_01.json

# Convert JSON to Word document
python lesson_converter.py json_to_word lesson_01.json

# Convert edited text back to JSON
python lesson_converter.py text_to_json lesson_01.txt

# Convert edited Word document back to JSON
python lesson_converter.py word_to_json lesson_01.docx
```

### With Custom Output Files

```bash
# Specify custom output filename
python lesson_converter.py json_to_text lesson_01.json my_edited_lesson.txt
python lesson_converter.py text_to_json my_edited_lesson.txt new_lesson.json
```

## Workflow Examples

### Text Editing Workflow

1. **Convert to text for editing:**
   ```bash
   python lesson_converter.py json_to_text lessons/lesson_01.json
   ```

2. **Edit the generated text file** (`lesson_01.txt`) in any text editor

3. **Convert back to JSON:**
   ```bash
   python lesson_converter.py text_to_json lessons/lesson_01.txt lessons/lesson_01_updated.json
   ```

### Word Document Workflow

1. **Convert to Word document:**
   ```bash
   python lesson_converter.py json_to_word lessons/lesson_01.json
   ```

2. **Edit the Word document** (`lesson_01.docx`) with rich formatting

3. **Convert back to JSON:**
   ```bash
   python lesson_converter.py word_to_json lessons/lesson_01.docx lessons/lesson_01_updated.json
   ```

## Text Format Structure

The text format is designed to be human-readable and easily editable:

```
================================================================================
SATIFY LESSON EDITOR
================================================================================

# LESSON INFORMATION
ID: lesson_01
Title: SAT Reading Fundamentals
Subtitle: Central Ideas & Details
Level: Foundation
Duration: 20-25 min
Skill Codes: CID

# LEARNING OBJECTIVES
1. Identify main ideas in reading passages
2. Distinguish between central ideas and supporting details

# SUCCESS CRITERIA
Mastery Threshold: 0.75
Minimum Accuracy: 0.7
Required Slides: all

# SLIDES

## SLIDE: slide_01
Type: introduction
Title: Welcome to SAT Reading Fundamentals
Duration: 180 seconds

### CONTENT
Heading: Learning Objectives
Text:
    In this lesson, you'll master the skill of identifying central ideas...
Bullet Points:
    • Understand what makes an idea 'central' vs. supporting
    • Learn the 3-step method for finding main ideas

### INTERACTIONS
Type: click_to_continue
Text: Ready to begin? Click to continue
---
```

## Editing Guidelines

### Safe to Edit
- ✅ **Text content**: Change any lesson text, headings, descriptions
- ✅ **Bullet points**: Add, remove, or modify bullet points
- ✅ **Duration**: Adjust slide timing
- ✅ **Learning objectives**: Modify or add objectives
- ✅ **Strategy steps**: Edit step descriptions and examples

### Keep Structure
- ⚠️ **Section headers**: Keep `# LESSON INFORMATION`, `## SLIDE:`, etc.
- ⚠️ **Slide separators**: Keep the `---` between slides
- ⚠️ **IDs**: Only change if creating a new lesson
- ⚠️ **Field names**: Keep field names like `Title:`, `Type:`, etc.

### Advanced Editing

#### Adding New Slides
```
## SLIDE: slide_new
Type: concept_teaching
Title: New Concept
Duration: 240 seconds

### CONTENT
Heading: New Heading
Text:
    Your new content here
Bullet Points:
    • First point
    • Second point
---
```

#### Adding Strategy Steps
```
Strategy Steps:
    Step 1: First Step
        Description of first step
        Example: Example for first step
    Step 2: Second Step
        Description of second step
        Example: Example for second step
```

## Supported Slide Types

- `introduction` - Lesson intro and objectives
- `concept_teaching` - Teaching core concepts
- `strategy_teaching` - Teaching specific strategies
- `guided_example` - Walkthrough examples
- `independent_practice` - Student practice
- `concept_reinforcement` - Review and reinforcement
- `mastery_check` - Assessment and validation

## Troubleshooting

### Common Issues

**File not found error:**
```bash
❌ File not found: lesson_01.json
```
→ Check file path and ensure file exists

**Word features disabled:**
```
Warning: python-docx not installed. Word document features will be disabled.
```
→ Install python-docx: `pip install python-docx`

**Parse error:**
```bash
❌ Error: JSON decode error
```
→ Check text format structure, ensure all required sections are present

### Validation

After conversion, validate your JSON:
```bash
# Check if JSON is valid
python -m json.tool lesson_01_updated.json
```

## Integration with SATify

The generated JSON files are fully compatible with the SATify lesson system:

1. **Place in lessons folder**: Copy converted JSON to `lessons/` directory
2. **Update manifest**: Add lesson to `lessons/manifest.json`
3. **Test in app**: Load lesson through Interactive Lessons interface

## Examples

See the `examples/` folder for:
- Sample text format files
- Before/after conversion examples
- Advanced editing patterns

## Support

For questions or issues:
1. Check the troubleshooting section above
2. Validate your text format structure
3. Ensure all required sections are present
4. Check file permissions and paths