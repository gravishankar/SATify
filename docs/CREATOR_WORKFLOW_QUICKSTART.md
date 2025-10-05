# 🎨 Creator Studio Quick Start Guide

## Your 5-Minute Workflow Tutorial

This guide walks you through editing a lesson using **Transitions** as a real example.

---

## 📋 The Complete Workflow

```
Open Creator Studio → Select Lesson → Edit → Preview → Save → Backup → Test → Done!
```

---

## Step-by-Step: Edit the Transitions Lesson

### **Step 1: Open Creator Studio**

1. Open your browser to: `http://localhost:3001/creator-enhanced.html`
2. You'll see **3 panels**:
   - **Left**: List of all lessons
   - **Center**: Editor (empty until you select a lesson)
   - **Right**: Live preview

**What you see:**
- Left sidebar shows all 12 lessons
- "Transitions" shows: `TRA • 11 slides`

---

### **Step 2: Load the Lesson**

1. **Click on "Transitions"** in the left sidebar
2. Watch the status indicator at the top:
   - 🟡 "Loading lesson..."
   - 🟢 "Lesson loaded" ✓

**What happens:**
- The center panel fills with lesson metadata
- The right panel shows a preview of the lesson
- You see 11 slides listed at the bottom

**Console shows:** `📚 Loaded published version of lesson_05`

---

### **Step 3: Review Current Content**

Look at what's loaded:

**Metadata Section (top of center panel):**
```
Lesson ID: lesson_05
Title: Transitions & Flow
Subtitle: Expression of Ideas
Level: Foundation
Duration: 20-25 min
Skill Codes: TRA
Learning Objectives:
  - The Core: Master transition words for logical flow
  - The Skill: Create coherent paragraph structure
  - The Problem: Multiple words may seem correct
  - Key Strategy: The 3-Phase Master Strategy
```

**Slides Section (bottom of center panel):**
- 11 slides numbered slide_01 through slide_11
- Each shows: `Slide X: [Title] • Type: [type] • ID: [id]`

**Right Preview Panel:**
- Shows title, subtitle, metadata
- Lists all 11 slides as cards
- Button: "🚀 Open Full Preview"

---

### **Step 4: Make Your First Edit**

Let's change the subtitle:

1. **Find the "Subtitle" field** in the center panel
2. Current value: `Expression of Ideas`
3. **Click in the field** and change to: `Mastering Logical Flow`
4. **Watch the status indicator** turn: 🔴 "Unsaved changes"

**Right panel updates immediately** showing new subtitle!

**💡 Pro Tip:** The right preview updates in real-time as you type.

---

### **Step 5: Edit a Slide**

Let's edit the title of Slide 2:

1. **Scroll down** to the "📑 Slides" section
2. **Find Slide 2**: "The Master Strategy: Phase 1"
3. **Click the "Edit" button** next to it

**Modal Window Opens:**
- Title: "Edit Slide: slide_02"
- Shows all slide fields:
  - Slide ID: `slide_02` (read-only)
  - Type: `strategy_teaching` (dropdown)
  - Title: `The Master Strategy: Phase 1`
  - Content: Large text area with JSON

4. **Change the title** to: `The Master Strategy: PHASE 1 - Define Context`
5. **Click "Save Slide"** at bottom of modal

**What happens:**
- Modal closes
- Status shows: 🔴 "Unsaved changes - Slide saved"
- Notification: "Slide saved successfully!"
- Right preview updates with new title

---

### **Step 6: Preview Your Changes**

**Option A: Live Preview (Right Panel)**
- Automatically updates as you edit
- Shows metadata and slide list
- Quick glance at structure

**Option B: Full Preview**
1. **Click "🚀 Open Full Preview"** in right panel
   - OR click **"👁️ Preview"** button in action buttons
2. New window opens showing **exactly** what students will see
3. All 11 slides rendered with your changes
4. Scroll through to verify everything looks right

**💡 Important:** Preview shows your CURRENT edits, even unsaved ones!

---

### **Step 7: Save Your Draft**

Your changes are only in the browser so far. Let's save to the server:

1. **Click "💾 Save Draft"** button (green, center panel)
2. Watch the status:
   - 🟡 "Saving draft..."
   - 🟢 "Draft saved successfully" ✓
3. Notification appears: "Draft saved to server ✓"

**What just happened:**
- Saved to: `lessons/drafts/lesson_05.json`
- Created version snapshot: `lessons/drafts/versions/lesson_05_[timestamp].json`
- Can now access from any device

---

### **Step 8: Backup to GitHub**

Protect your work with a remote backup:

1. **Click "☁️ Backup to GitHub"** button (top right)
2. Watch the button text change: "⏳ Backing up..."
3. Alert appears: "✅ Drafts backed up to GitHub!"
4. "Last backup" time updates: "Last backup: just now"

**What happened:**
- All drafts committed to Git
- Pushed to GitHub repository
- Protected against computer failure

**💡 Auto-Backup:** Even if you forget, backups happen every hour automatically!

---

### **Step 9: Test Your Lesson**

Before requesting publish, test it:

1. **Open Full Preview** (click 🚀 button)
2. **Read through ALL slides** as if you're a student
3. **Check for:**
   - ✅ Typos or grammar errors
   - ✅ Slide order makes sense
   - ✅ All content displays correctly
   - ✅ Learning objectives match content
   - ✅ Examples are clear

4. **If you find issues:**
   - Close preview window
   - Make corrections in Creator Studio
   - Save draft again
   - Re-test with fresh preview

---

### **Step 10: Request Publish** (When Ready)

Once satisfied with your lesson:

1. **Click "✅ Request Publish"** button (green)
2. Confirm dialog: "Request publish? This will send your draft for admin approval."
3. Click "OK"
4. Alert: "Publish request submitted! Admin will review."

**What happens next:**
- Admin receives notification
- Admin compares your draft to published version
- Admin approves ✅ → Goes live to students
- Admin rejects ❌ → You get feedback, make changes, re-submit

---

## 🎯 Common Editing Workflows

### **Workflow A: Quick Text Edit**
```
Select lesson → Edit metadata → Save → Backup → Done
⏱️ Time: 2 minutes
```

### **Workflow B: Add/Edit Slides**
```
Select lesson → Edit slides → Preview → Save → Backup → Test → Request Publish
⏱️ Time: 15-30 minutes
```

### **Workflow C: Major Revision**
```
Select lesson → Edit metadata → Reorder slides → Edit multiple slides →
Preview → Save → Backup → Test thoroughly → Request Publish
⏱️ Time: 1-2 hours
```

---

## 🔄 Auto-Save Protection

**4 Layers Keep Your Work Safe:**

1. **Browser Auto-Save** (every 30 seconds)
   - Automatic, no action needed
   - Restores if browser crashes
   - Lasts 24 hours

2. **Manual Save** (click button)
   - Saves to server
   - Creates version snapshot
   - Access from any device

3. **Git Backup** (hourly + manual)
   - Remote backup to GitHub
   - Protects against hardware failure
   - Complete history preserved

4. **Pre-Publish Backup** (automatic)
   - Created before every publish
   - Enables one-click rollback
   - Admin safety net

**💡 Best Practice:** Click "💾 Save Draft" every 10-15 minutes, and "☁️ Backup" when done for the day.

---

## 🎨 Slide Types You Can Use

When you click "Edit" on a slide, you can change its type:

| Type | Best For | Example |
|------|----------|---------|
| **strategy_teaching** | Step-by-step strategies | "The 3-Phase Master Strategy" |
| **concept_teaching** | Explaining concepts | "What are Transitions?" |
| **worked_example** | Interactive practice with analysis | Transition word examples with flaw analysis |
| **practice_prompt** | Directing to practice | "Ready to practice?" |
| **learning_objectives** | Showing lesson goals | First slide of lesson |
| **concept_reinforcement** | Summary and key takeaways | Final slide recap |

**💡 Tip:** Each type has different fields. Change the type, then fill in the fields that appear.

---

## ⚠️ Common Mistakes to Avoid

### ❌ **Mistake 1: Not Saving**
- **Problem:** Browser closes, work lost
- **Solution:** Click "💾 Save Draft" frequently

### ❌ **Mistake 2: Skipping Preview**
- **Problem:** Published lesson has errors
- **Solution:** Always test with "🚀 Open Full Preview" before requesting publish

### ❌ **Mistake 3: Invalid JSON in Slide Content**
- **Problem:** Slide won't save, shows error
- **Solution:** Use double quotes `"` not single `'`, no trailing commas

### ❌ **Mistake 4: Forgetting to Backup**
- **Problem:** Computer dies, work lost
- **Solution:** Click "☁️ Backup" when done, or rely on hourly auto-backup

### ❌ **Mistake 5: Not Testing Thoroughly**
- **Problem:** Students see confusing content
- **Solution:** Read through EVERY slide in full preview mode before publishing

---

## 🆘 Troubleshooting

### **"Unsaved changes" Warning When Closing**
- **Cause:** You edited but didn't save
- **Fix:** Click "Stay on Page" → Save Draft → Then close

### **Preview Shows Old Content**
- **Cause:** Browser cache
- **Fix:** Hard refresh (Cmd+Shift+R or Ctrl+Shift+R)

### **"Error loading lesson"**
- **Cause:** Draft is corrupted or missing
- **Fix:** Refresh page, lesson loads from published version

### **Slide Won't Save - JSON Error**
- **Cause:** Invalid JSON syntax in content field
- **Fix:** Check for:
  - Missing closing `}`
  - Single quotes instead of double quotes
  - Extra comma after last item

### **Can't Find My Changes**
- **Cause:** Forgot to save
- **Fix:** Make changes again, click "💾 Save Draft"

---

## 📊 Status Indicators Guide

| Icon | Status | Meaning | Action Needed |
|------|--------|---------|---------------|
| 🟢 | All changes saved | Your work is safe | None - you're good! |
| 🟡 | Saving... | Currently saving | Wait a moment |
| 🔴 | Unsaved changes | You have unsaved work | Click "💾 Save Draft" soon |
| ⏳ | Loading... | Loading lesson data | Wait for completion |

---

## 💡 Pro Tips for Efficient Editing

1. **Use Keyboard Shortcuts**
   - Tab: Move to next field
   - Shift+Tab: Move to previous field
   - Cmd/Ctrl+S: Save (coming soon)

2. **Work in Batches**
   - Make several edits → Preview all → Save once
   - More efficient than save after each tiny change

3. **Keep Preview Open**
   - Open preview in separate window
   - Keep it visible while editing
   - Click preview button again to refresh it

4. **Use Version Snapshots**
   - Every save creates a snapshot
   - Admin can restore any version
   - Don't be afraid to experiment!

5. **Name Your Edits**
   - When saving, make a mental note of what changed
   - Helps admin review your changes faster

---

## 🎓 Example: Complete Editing Session

**Goal:** Update the Transitions lesson with a new example

**Time:** 20 minutes

**Steps:**
1. ✅ Open Creator Studio
2. ✅ Click "Transitions" → Wait for 🟢 "Lesson loaded"
3. ✅ Scroll to Slide 4 → Click "Edit"
4. ✅ Find the worked_example section
5. ✅ Add new choice D with analysis
6. ✅ Click "Save Slide" → Modal closes
7. ✅ Click "🚀 Open Full Preview"
8. ✅ Navigate to Slide 4 in preview
9. ✅ Verify new example displays correctly
10. ✅ Close preview window
11. ✅ Click "💾 Save Draft" → See 🟢 "Draft saved"
12. ✅ Click "☁️ Backup to GitHub" → See "✅ Backed up"
13. ✅ Click "✅ Request Publish"
14. ✅ Done! ✨

---

## 🚀 Ready to Start?

**Your First Task:**
1. Open Creator Studio
2. Click on "Transitions"
3. Change the duration from "20-25 min" to "25-30 min"
4. Save
5. Backup
6. You're now a Creator Studio pro! 🎉

**Questions?**
- Check the full User Guide: `CREATOR_STUDIO_USER_GUIDE.md`
- Check technical docs: `CREATOR_STUDIO_TECHNICAL.md`
- Review changes: `CHANGELOG.md`

---

**Happy Creating! 🎨**
