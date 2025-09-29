#!/usr/bin/env python3
"""
Interactive Demo for SATify Lesson Converter
Demonstrates the conversion workflow with a simple interface.
"""

import os
import sys
from pathlib import Path
from lesson_converter import LessonConverter


def show_menu():
    """Display the main menu."""
    print("\n" + "="*60)
    print("🎓 SATify Lesson Converter - Interactive Demo")
    print("="*60)
    print("1. Convert JSON lesson to Text (for editing)")
    print("2. Convert Text back to JSON (after editing)")
    print("3. Convert JSON lesson to Word document")
    print("4. Convert Word document back to JSON")
    print("5. Batch convert all JSON lessons to Text")
    print("6. Show example lesson structure")
    print("7. Validate JSON lesson file")
    print("0. Exit")
    print("-"*60)


def list_files(directory: str, extension: str) -> list:
    """List files with given extension in directory."""
    path = Path(directory)
    if not path.exists():
        return []
    return list(path.glob(f"*{extension}"))


def choose_file(files: list, file_type: str) -> str:
    """Let user choose from available files."""
    if not files:
        print(f"❌ No {file_type} files found.")
        return None

    print(f"\nAvailable {file_type} files:")
    for i, file in enumerate(files, 1):
        print(f"{i}. {file.name}")

    try:
        choice = int(input(f"\nChoose {file_type} file (1-{len(files)}): "))
        if 1 <= choice <= len(files):
            return str(files[choice - 1])
        else:
            print("❌ Invalid choice.")
            return None
    except ValueError:
        print("❌ Please enter a number.")
        return None


def validate_json(file_path: str):
    """Validate JSON lesson file structure."""
    import json

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        # Check required fields
        required_fields = ['id', 'title', 'skill_codes', 'slides']
        missing_fields = [field for field in required_fields if field not in data]

        if missing_fields:
            print(f"❌ Missing required fields: {', '.join(missing_fields)}")
            return False

        # Check slides
        slides = data.get('slides', [])
        if not slides:
            print("❌ No slides found in lesson.")
            return False

        print(f"✅ Valid lesson file!")
        print(f"   - ID: {data['id']}")
        print(f"   - Title: {data['title']}")
        print(f"   - Skill Codes: {', '.join(data['skill_codes'])}")
        print(f"   - Slides: {len(slides)}")

        return True

    except json.JSONDecodeError as e:
        print(f"❌ Invalid JSON: {e}")
        return False
    except Exception as e:
        print(f"❌ Error reading file: {e}")
        return False


def show_example_structure():
    """Show example lesson structure."""
    print("\n📋 Example Lesson Structure:")
    print("-"*40)

    example = """
## Basic Lesson Structure ##

{
  "id": "lesson_example",
  "title": "Example Lesson",
  "subtitle": "Learning Subtitle",
  "level": "Foundation",
  "duration": "20-25 min",
  "skill_codes": ["CID"],
  "learning_objectives": [
    "Objective 1",
    "Objective 2"
  ],
  "success_criteria": {
    "mastery_threshold": 0.75,
    "min_accuracy": 0.7,
    "required_slides": "all"
  },
  "slides": [
    {
      "id": "slide_01",
      "type": "introduction",
      "title": "Slide Title",
      "duration_estimate": 180,
      "content": {
        "heading": "Slide Heading",
        "text": "Slide content text",
        "bullet_points": [
          "Point 1",
          "Point 2"
        ]
      }
    }
  ]
}

## Supported Slide Types ##
- introduction: Lesson intro and objectives
- concept_teaching: Teaching core concepts
- strategy_teaching: Teaching specific strategies
- guided_example: Walkthrough examples
- independent_practice: Student practice
- concept_reinforcement: Review and reinforcement
- mastery_check: Assessment and validation
"""
    print(example)


def main():
    """Main demo loop."""
    converter = LessonConverter()
    lessons_dir = "../lessons"

    while True:
        show_menu()

        try:
            choice = input("Choose an option (0-7): ").strip()

            if choice == "0":
                print("\n👋 Thanks for using SATify Lesson Converter!")
                break

            elif choice == "1":
                # JSON to Text
                json_files = list_files(lessons_dir, ".json")
                json_file = choose_file(json_files, "JSON")
                if json_file:
                    try:
                        output_file = converter.json_to_text(json_file)
                        print(f"\n✅ Converted to text format!")
                        print(f"📄 Edit this file: {output_file}")
                        print(f"💡 Then use option 2 to convert back to JSON")
                    except Exception as e:
                        print(f"❌ Error: {e}")

            elif choice == "2":
                # Text to JSON
                txt_files = list_files(lessons_dir, ".txt")
                txt_file = choose_file(txt_files, "Text")
                if txt_file:
                    try:
                        output_file = converter.text_to_json(txt_file)
                        print(f"\n✅ Converted back to JSON format!")
                        print(f"📄 Generated: {output_file}")
                    except Exception as e:
                        print(f"❌ Error: {e}")

            elif choice == "3":
                # JSON to Word
                json_files = list_files(lessons_dir, ".json")
                json_file = choose_file(json_files, "JSON")
                if json_file:
                    try:
                        output_file = converter.json_to_word(json_file)
                        if output_file:
                            print(f"\n✅ Converted to Word document!")
                            print(f"📄 Edit this file: {output_file}")
                            print(f"💡 Then use option 4 to convert back to JSON")
                    except Exception as e:
                        print(f"❌ Error: {e}")

            elif choice == "4":
                # Word to JSON
                docx_files = list_files(lessons_dir, ".docx")
                docx_file = choose_file(docx_files, "Word")
                if docx_file:
                    try:
                        output_file = converter.word_to_json(docx_file)
                        if output_file:
                            print(f"\n✅ Converted back to JSON format!")
                            print(f"📄 Generated: {output_file}")
                    except Exception as e:
                        print(f"❌ Error: {e}")

            elif choice == "5":
                # Batch convert
                print(f"\n🔄 Converting all JSON files in {lessons_dir} to text...")
                json_files = list_files(lessons_dir, ".json")

                if not json_files:
                    print("❌ No JSON files found.")
                    continue

                success = 0
                for json_file in json_files:
                    try:
                        converter.json_to_text(str(json_file))
                        success += 1
                    except Exception as e:
                        print(f"❌ Error converting {json_file.name}: {e}")

                print(f"\n📊 Batch conversion complete!")
                print(f"   ✅ Converted: {success}/{len(json_files)} files")

            elif choice == "6":
                # Show example
                show_example_structure()

            elif choice == "7":
                # Validate JSON
                json_files = list_files(lessons_dir, ".json")
                json_file = choose_file(json_files, "JSON")
                if json_file:
                    validate_json(json_file)

            else:
                print("❌ Invalid option. Please choose 0-7.")

        except KeyboardInterrupt:
            print("\n\n👋 Goodbye!")
            break
        except Exception as e:
            print(f"❌ Unexpected error: {e}")


if __name__ == '__main__':
    main()