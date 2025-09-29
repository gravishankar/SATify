#!/usr/bin/env python3
"""
Batch Lesson Converter for SATify
Converts multiple lessons between JSON and text/Word formats.

Usage:
    python batch_convert.py json_to_text ../lessons/
    python batch_convert.py text_to_json ../lessons/
    python batch_convert.py json_to_word ../lessons/
"""

import os
import sys
import glob
from pathlib import Path
from lesson_converter import LessonConverter


def batch_convert(action: str, directory: str):
    """Convert all files in directory based on action."""
    converter = LessonConverter()
    directory = Path(directory)

    if not directory.exists():
        print(f"❌ Directory not found: {directory}")
        return

    success_count = 0
    error_count = 0

    if action == 'json_to_text':
        pattern = "*.json"
        convert_func = converter.json_to_text
    elif action == 'json_to_word':
        pattern = "*.json"
        convert_func = converter.json_to_word
    elif action == 'text_to_json':
        pattern = "*.txt"
        convert_func = converter.text_to_json
    elif action == 'word_to_json':
        pattern = "*.docx"
        convert_func = converter.word_to_json
    else:
        print(f"❌ Unknown action: {action}")
        return

    # Find matching files
    files = list(directory.glob(pattern))

    if not files:
        print(f"⚠️ No {pattern} files found in {directory}")
        return

    print(f"🔄 Converting {len(files)} files...")
    print()

    for file_path in files:
        try:
            result = convert_func(str(file_path))
            if result:
                print(f"✅ {file_path.name} → {Path(result).name}")
                success_count += 1
            else:
                print(f"❌ Failed: {file_path.name}")
                error_count += 1
        except Exception as e:
            print(f"❌ Error converting {file_path.name}: {e}")
            error_count += 1

    print()
    print(f"📊 Conversion complete:")
    print(f"   ✅ Success: {success_count}")
    print(f"   ❌ Errors: {error_count}")


def main():
    """Command-line interface for batch converter."""
    if len(sys.argv) < 3:
        print("Batch Lesson Converter")
        print()
        print("Usage:")
        print("  python batch_convert.py json_to_text <directory>")
        print("  python batch_convert.py json_to_word <directory>")
        print("  python batch_convert.py text_to_json <directory>")
        print("  python batch_convert.py word_to_json <directory>")
        print()
        print("Examples:")
        print("  python batch_convert.py json_to_text ../lessons/")
        print("  python batch_convert.py text_to_json ../lessons/")
        return

    action = sys.argv[1]
    directory = sys.argv[2]

    batch_convert(action, directory)


if __name__ == '__main__':
    main()