#!/usr/bin/env python3
"""
prepare_data.py
---------------
Offline transformer to convert the large cb-digital-questions.json (25–30MB) into static chunks + manifest
so the app can be hosted on GitHub Pages (no Flask).

Usage:
  python prepare_data.py --input path/to/cb-digital-questions.json --out ./data --chunk 1000

It will produce:
  data/
    manifest.json
    chunks/
      part-000.json
      part-001.json
      ...

And (optionally) a derived lookup.json with distinct facets.
"""
import json, os, argparse, math, re
from collections import defaultdict

def load_any(input_path:str):
  txt = open(input_path, "r", encoding="utf-8").read().strip()
  # Try to detect structure: either a dict of {id: obj} or a clean JSON array
  if txt.startswith("{") and txt.endswith("}"):
    try:
      data = json.loads(txt)
      # If it's a dict of id->obj, convert to list
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

  # Fallback: attempt to wrap dict-without-braces pattern (keyed entries separated by commas)
  try:
    wrapped = "{%s}" % txt.strip().strip(",")
    wrapped = re.sub(r',\s*}', '}', wrapped)  # trailing comma fix
    data = json.loads(wrapped)
    if isinstance(data, dict):
      items = []
      for k, v in data.items():
        if isinstance(v, dict):
          v.setdefault("uId", k)
        items.append(v)
      return items
  except Exception:
    pass

  # Last resort: NDJSON (one object per line)
  try:
    items = []
    for line in txt.splitlines():
      line = line.strip().rstrip(",")
      if not line: continue
      obj = json.loads(line)
      items.append(obj)
    return items
  except Exception as e:
    raise SystemExit(f"Could not parse input JSON: {e}")

def normalize_module(module_str):
  """Normalize module values to match frontend expectations"""
  if not module_str:
    return "reading-writing"
  module_str = str(module_str).lower()
  if module_str in ["math", "mathematics"]:
    return "math"
  elif module_str in ["english", "reading", "writing", "reading-writing", "rw"]:
    return "reading-writing"
  else:
    return "reading-writing"  # default

def normalize(x:dict)->dict:
  # Extract content from nested structure if present
  content = x.get("content", {})
  
  # Get question stem from various possible locations
  stimulus = content.get("stimulus", "")
  stem = content.get("stem", "")
  prompt = content.get("prompt", "")  # Alternative location for math questions
  
  # For Reading & Writing, stimulus is the main passage, stem is the question
  # For Math, stem or prompt contains the full question
  if stimulus and stem:
    stem_html = stimulus + "\n" + stem
  else:
    stem_html = stimulus or stem or prompt or x.get("stem_html", "")
  
  # Handle different question types
  choices = None
  correct_choice_index = None
  
  # Check if this is a multiple choice question (Reading & Writing)
  answer_options = content.get("answerOptions", [])
  if answer_options:
    # This is a Reading & Writing multiple choice question
    choices = [option.get("content", "") for option in answer_options]
    
    # Find correct answer index
    correct_answer_ids = content.get("keys", [])
    if correct_answer_ids:
      correct_id = correct_answer_ids[0] if isinstance(correct_answer_ids, list) else correct_answer_ids
      # Find the index of the correct answer
      for i, option in enumerate(answer_options):
        if option.get("id") == correct_id:
          correct_choice_index = i
          break
  elif content.get("keys"):
    # This is a Math question with numerical answers (format 1)
    math_keys = content.get("keys", [])
    if isinstance(math_keys, list) and len(math_keys) > 0:
      # For math questions, show the acceptable answer formats as "choices"
      choices = [f"Numerical answer (e.g., {key.strip()})" for key in math_keys[:3]]
      correct_choice_index = 0  # Any of the formats is correct
  elif content.get("answer"):
    # This is a Math question with numerical answer (format 2)
    answer = content.get("answer", "")
    if answer:
      # Handle different answer formats
      if isinstance(answer, dict):
        # Complex answer format - extract from multiple choice or correct_choice
        if answer.get("choices"):
          # Multiple choice format - extract choices
          mc_choices = answer.get("choices", {})
          if isinstance(mc_choices, dict):
            choices = []
            correct_choice = answer.get("correct_choice", "a")
            for key, choice_data in mc_choices.items():
              if isinstance(choice_data, dict) and "body" in choice_data:
                # Extract text from HTML body, removing HTML tags and entities
                import re
                import html
                body_text = choice_data["body"]
                # Remove HTML tags
                clean_text = re.sub(r'<[^>]+>', '', body_text)
                # Decode HTML entities
                clean_text = html.unescape(clean_text)
                # Clean up whitespace and empty content
                clean_text = clean_text.strip()
                # Skip empty or meaningless choices
                if clean_text and clean_text not in ['', ' ', '&nbsp;', '\u00a0']:
                  choices.append(clean_text)
                if key == correct_choice:
                  correct_choice_index = len(choices) - 1
            
            if not choices:
              # Fallback to simple numerical format
              choices = ["Numerical answer"]
              correct_choice_index = 0
          else:
            choices = ["Numerical answer"]
            correct_choice_index = 0
        else:
          # Try to extract a simple numerical value from the dict
          choices = ["Numerical answer"]
          correct_choice_index = 0
      else:
        # Simple answer format - use as numerical example
        clean_answer = str(answer).strip()
        choices = [f"Numerical answer (e.g., {clean_answer})"]
        correct_choice_index = 0
  
  # Get explanation from various locations  
  explanation = (x.get("explanation_html") or 
                 x.get("explanation") or
                 content.get("rationale") or
                 content.get("explanation") or
                 "")
  
  return {
    "uId": x.get("uId") or x.get("id") or x.get("questionId"),
    "questionId": x.get("questionId") or x.get("id") or x.get("uId"),
    "module": normalize_module(x.get("module") or ("math" if "math" in (x.get("category","").lower()) else "reading-writing")),
    "primary_class_cd_desc": x.get("primary_class_cd_desc") or x.get("domain") or "",
    "skill_cd": x.get("skill_cd") or "",
    "skill_desc": x.get("skill_desc") or "",
    "difficulty": x.get("difficulty") or x.get("diff") or "",
    "score_band_range_cd": x.get("score_band_range_cd") or x.get("band"),
    "stem_html": stem_html,
    "choices": choices,
    "correct_choice_index": correct_choice_index,
    "explanation_html": explanation,
    "question_type": "mcq" if answer_options else "numerical"
  }

def build_lookup(items):
  facets = defaultdict(set)
  for x in items:
    facets["module"].add(x.get("module") or "")
    facets["domain"].add(x.get("primary_class_cd_desc") or "")
    facets["difficulty"].add(x.get("difficulty") or "")
    facets["skill"].add(x.get("skill_desc") or "")
  return {k: sorted([v for v in vals if v]) for k, vals in facets.items()}

def main():
  ap = argparse.ArgumentParser()
  ap.add_argument("--input", required=True)
  ap.add_argument("--out", default="./data")
  ap.add_argument("--chunk", type=int, default=1000)
  args = ap.parse_args()

  os.makedirs(args.out, exist_ok=True)
  chunks_dir = os.path.join(args.out, "chunks")
  os.makedirs(chunks_dir, exist_ok=True)

  raw = load_any(args.input)
  items = [normalize(x) for x in raw if (x.get("uId") or x.get("id") or x.get("questionId"))]

  # shard
  N = len(items)
  csize = max(1, args.chunk)
  n_parts = math.ceil(N / csize)
  manifest = {"version":1, "count": N, "chunks":[]}
  for i in range(n_parts):
    part = items[i*csize:(i+1)*csize]
    rel = f"chunks/part-{i:03d}.json"
    with open(os.path.join(chunks_dir, f"part-{i:03d}.json"), "w", encoding="utf-8") as f:
      json.dump(part, f, separators=(",",":"))
    manifest["chunks"].append({"path": rel, "count": len(part)})

  with open(os.path.join(args.out, "manifest.json"), "w", encoding="utf-8") as f:
    json.dump(manifest, f, indent=2)

  # optional lookup
  lookup = build_lookup(items)
  with open(os.path.join(args.out, "lookup.json"), "w", encoding="utf-8") as f:
    json.dump(lookup, f, indent=2)

  print(f"Wrote {N} items across {n_parts} chunks into {args.out}")
  print("Done. Ship the entire 'data' dir to GitHub along with index.html/styles.css/app.js.")
if __name__ == "__main__":
  main()
