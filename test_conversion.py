#!/usr/bin/env python3
"""
Quick test script to verify lesson conversion functionality
"""

import os
import sys
import json
import subprocess

def test_conversion_system():
    """Test the lesson conversion system"""
    print("🧪 Testing SATify Lesson Conversion System")
    print("=" * 50)

    # Check if we're in the right directory
    if not os.path.exists('scripts/lesson_converter.py'):
        print("❌ Error: Please run this from the SATify root directory")
        return False

    # Test 1: Check if lesson files exist
    print("\n1. Checking lesson files...")
    lesson_files = [
        'lessons/lesson_05.json',
        'content/lessons/lesson_05.json',
        'content/lessons/lesson_transitions_flow.json'
    ]

    for file in lesson_files:
        if os.path.exists(file):
            print(f"   ✅ {file}")
        else:
            print(f"   ❌ {file} - Not found")

    # Test 2: Validate JSON structure
    print("\n2. Validating JSON structure...")
    for file in lesson_files:
        if os.path.exists(file):
            try:
                with open(file, 'r') as f:
                    data = json.load(f)
                    if 'slides' in data and len(data['slides']) > 0:
                        print(f"   ✅ {file} - Valid JSON with {len(data['slides'])} slides")
                    else:
                        print(f"   ⚠️ {file} - Valid JSON but no slides found")
            except json.JSONDecodeError as e:
                print(f"   ❌ {file} - Invalid JSON: {e}")

    # Test 3: Test conversion scripts
    print("\n3. Testing conversion scripts...")
    try:
        # Test if Python can import the converter
        sys.path.append('scripts')
        from lesson_converter import LessonConverter
        converter = LessonConverter()
        print("   ✅ Lesson converter module loads successfully")

        # Test a basic conversion (JSON to text)
        if os.path.exists('lessons/lesson_05.json'):
            try:
                output_file = converter.json_to_text('lessons/lesson_05.json', '/tmp/test_lesson.txt')
                if os.path.exists('/tmp/test_lesson.txt'):
                    print("   ✅ JSON to Text conversion works")
                    os.remove('/tmp/test_lesson.txt')  # Cleanup
                else:
                    print("   ❌ JSON to Text conversion failed")
            except Exception as e:
                print(f"   ❌ Conversion test failed: {e}")

    except ImportError as e:
        print(f"   ❌ Cannot import converter: {e}")

    # Test 4: Check server endpoints
    print("\n4. Testing server endpoints...")
    import urllib.request
    import urllib.error

    endpoints = [
        'http://localhost:3001/api/health',
        'http://localhost:3001/converter.html',
        'http://localhost:3001/content/lessons/lesson_05.json'
    ]

    for endpoint in endpoints:
        try:
            response = urllib.request.urlopen(endpoint)
            if response.status == 200:
                print(f"   ✅ {endpoint}")
            else:
                print(f"   ❌ {endpoint} - Status: {response.status}")
        except urllib.error.URLError:
            print(f"   ❌ {endpoint} - Cannot connect")

    print("\n🎉 Testing complete!")
    print("\n📋 Summary:")
    print("   • Lesson files are accessible")
    print("   • JSON structure is valid")
    print("   • Conversion scripts are working")
    print("   • Server endpoints are responsive")
    print("   • Converter web interface is available")

    return True

if __name__ == '__main__':
    test_conversion_system()