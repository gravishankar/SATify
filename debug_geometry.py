#!/usr/bin/env python3
import json

# Load all questions and find geometry problems
all_questions = []
for chunk_file in ['part-000.json', 'part-001.json', 'part-002.json']:
    with open(f'data/chunks/{chunk_file}', 'r') as f:
        questions = json.load(f)
        all_questions.extend(questions)

print(f"=== DEBUGGING GEOMETRY PROBLEMS ===")

# Find geometry questions
geometry_questions = [q for q in all_questions if 'geometry' in (q.get('primary_class_cd_desc', '')).lower()]

print(f"Total geometry questions found: {len(geometry_questions)}")

# Check first few geometry questions in detail
for i, q in enumerate(geometry_questions[:5]):
    print(f"\n--- Geometry Question {i+1} ---")
    print(f"ID: {q.get('uId')}")
    print(f"Domain: {q.get('primary_class_cd_desc')}")
    print(f"Skill: {q.get('skill_desc')}")
    print(f"Question Type: {q.get('question_type')}")
    print(f"Choices: {q.get('choices')}")
    print(f"Choices count: {len(q.get('choices', []))}")
    
    # Check for figures/images in stem
    stem = q.get('stem_html', '')
    has_figure = any(tag in stem.lower() for tag in ['<figure>', '<img>', '<svg>', '<image'])
    print(f"Has figure/image tags: {has_figure}")
    
    # Show first 200 chars of stem to see structure
    print(f"Stem preview: {stem[:200]}...")
    
    # Check if this looks like a corrupted choice issue
    choices = q.get('choices', [])
    if choices:
        problematic = any('numerical answer' in str(choice).lower() for choice in choices)
        if problematic:
            print("❌ PROBLEMATIC: Contains 'Numerical answer' in choices")

# Check for specific geometry issues
print(f"\n=== GEOMETRY ANALYSIS ===")

# Count by choice structure
choice_structures = {}
for q in geometry_questions:
    choices = q.get('choices', [])
    choice_count = len(choices)
    
    if choice_count == 0:
        structure = "no_choices"
    elif any('numerical answer' in str(choice).lower() for choice in choices):
        structure = "numerical_mixed"
    elif choice_count == 4:
        structure = "normal_mcq"
    else:
        structure = f"{choice_count}_choices"
    
    choice_structures[structure] = choice_structures.get(structure, 0) + 1

print("Choice structure distribution:")
for structure, count in choice_structures.items():
    print(f"  {structure}: {count} questions")

# Look for figure-related problems
figure_problems = [q for q in geometry_questions if any(tag in q.get('stem_html', '').lower() for tag in ['<figure>', '<img>', '<svg>'])]
print(f"\nQuestions with figure tags: {len(figure_problems)}")

if figure_problems:
    print("Sample figure question:")
    q = figure_problems[0]
    print(f"  ID: {q.get('uId')}")
    print(f"  Choices: {q.get('choices')}")
    print(f"  Stem excerpt: {q.get('stem_html', '')[:300]}...")