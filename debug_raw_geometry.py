#!/usr/bin/env python3
import json
import sys

# Add the original data processing
sys.path.append('/Users/gravisha/projects/habbitZ+/Data_Extractiob/sat-question-bank-main')

def load_any(input_path: str):
    txt = open(input_path, "r", encoding="utf-8").read().strip()
    if txt.startswith("{") and txt.endswith("}"):
        try:
            data = json.loads(txt)
            if isinstance(data, dict):
                items = []
                for k, v in data.items():
                    if isinstance(v, dict):
                        v.setdefault("uId", k)
                    items.append(v)
                return items
            elif isinstance(data, list):
                return data
        except Exception:
            pass
    return []

# Load the raw data
raw_data = load_any('/Users/gravisha/projects/habbitZ+/Data_Extractiob/cb-digital-questions.json')

# Find the problematic geometry question
problematic_id = "0053ca91-ad76-40ab-8f72-b5b3ced85bee"
raw_question = None

for item in raw_data:
    if item.get('uId') == problematic_id:
        raw_question = item
        break

if raw_question:
    print("=== RAW GEOMETRY QUESTION STRUCTURE ===")
    print(f"ID: {problematic_id}")
    
    content = raw_question.get("content", {})
    print(f"Content keys: {list(content.keys())}")
    
    # Check for answer options vs keys
    answer_options = content.get("answerOptions", [])
    keys = content.get("keys", [])
    answer = content.get("answer", "")
    
    print(f"answerOptions: {len(answer_options)} items")
    if answer_options:
        print("Sample answerOption:")
        print(f"  {answer_options[0]}")
    
    print(f"keys: {keys}")
    print(f"answer: {answer}")
    
    # Check question type indicators
    if 'multiple_choice' in str(raw_question).lower():
        print("Contains 'multiple_choice' indicator")
    
    # Show raw structure
    print(f"\nFull content structure:")
    import pprint
    pprint.pprint(content)
    
else:
    print(f"Could not find question {problematic_id}")
    
    # Let's search for any geometry question in raw data  
    print("Looking for geometry questions in raw data...")
    
    geometry_raw = []
    for item in raw_data[:100]:  # Check first 100
        if 'geometry' in str(item).lower():
            geometry_raw.append(item)
            if len(geometry_raw) >= 3:
                break
    
    print(f"Found {len(geometry_raw)} geometry questions in first 100 items")
    
    if geometry_raw:
        print("\nSample geometry question structure:")
        q = geometry_raw[0]
        content = q.get("content", {})
        print(f"Content keys: {list(content.keys())}")
        print(f"answerOptions: {len(content.get('answerOptions', []))} items")
        print(f"keys: {content.get('keys', [])}")
        print(f"answer: {content.get('answer', '')}")