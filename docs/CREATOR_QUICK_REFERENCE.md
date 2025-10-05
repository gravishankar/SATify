# ⚡ Creator Studio Quick Reference Card

## The Essential Workflow

```
1. Select lesson from left sidebar
2. Edit metadata or slides in center panel
3. Watch live preview update on right
4. Click "💾 Save Draft" (every 10-15 min)
5. Click "🚀 Open Full Preview" to test
6. Click "☁️ Backup to GitHub" when done
7. Click "✅ Request Publish" when ready
```

---

## Status Icons

| Icon | Meaning | What to Do |
|------|---------|------------|
| 🟢 | Saved | Nothing - you're safe! |
| 🟡 | Saving | Wait a moment |
| 🔴 | Unsaved | Save soon! |
| ⏳ | Loading | Wait for load |

---

## 3 Panels Explained

### Left: Lesson Selector
- Click any lesson to load it
- Shows title, skill code, slide count
- Active lesson highlighted in blue

### Center: Editor
- **Top:** Metadata (title, level, objectives, etc.)
- **Bottom:** Slides list with Edit/Delete buttons
- **Actions:** Save, Preview, Publish buttons

### Right: Live Preview
- Updates as you type
- Shows metadata summary
- Lists all slides
- "🚀 Open Full Preview" button

---

## Editing Slides

1. Click **Edit** button on any slide
2. Modal opens with slide fields
3. Change type/title/content
4. Click **Save Slide**
5. Modal closes, preview updates

**💡 Tip:** JSON content must use double quotes `"` not single `'`

---

## Save Methods

| Method | When | Where |
|--------|------|-------|
| Auto-save | Every 30s | Browser only |
| Manual save | Click button | Server + version |
| Git backup | Hourly or click | GitHub (remote) |
| Pre-publish | Before publish | Rollback safety |

**Best Practice:** Manual save every 10-15 min, backup when done for the day

---

## Common Tasks

### Add New Slide
1. Scroll to slides section
2. Click "+ Add Slide" button
3. Fill in new slide modal
4. Save

### Reorder Slides
1. Click and hold ☰ (drag handle)
2. Drag up or down
3. Drop in new position
4. Auto-saves order

### Delete Slide
1. Click "Delete" on slide
2. Confirm deletion
3. Slide removed (undo: reload lesson)

### Change Lesson Title
1. Find "Title" field at top
2. Type new title
3. Right preview updates instantly
4. Save when done

---

## Before You Publish Checklist

- [ ] Made all intended changes
- [ ] Saved draft (🟢 status)
- [ ] Opened full preview
- [ ] Read through EVERY slide
- [ ] No typos or errors
- [ ] Slide order makes sense
- [ ] Examples are clear
- [ ] Backed up to GitHub

---

## Slide Types Reference

| Type | Use For |
|------|---------|
| `strategy_teaching` | Step-by-step strategies |
| `concept_teaching` | Explaining concepts |
| `worked_example` | Interactive examples |
| `practice_prompt` | Direct to practice |
| `learning_objectives` | Lesson goals (slide 1) |
| `concept_reinforcement` | Summary/recap |

---

## Emergency Fixes

**Lost unsaved work?**
→ Refresh page, reload lesson (loads published version)

**Preview shows wrong content?**
→ Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Win)

**JSON error when saving slide?**
→ Check: double quotes, no trailing commas, matching braces

**Can't find backup button?**
→ Top right corner of editor, next to status indicator

---

## Keyboard Tips

- **Tab** - Next field
- **Shift+Tab** - Previous field
- **Esc** - Close modal
- **Cmd/Ctrl+S** - Save (coming soon)

---

## Time Estimates

| Task | Time |
|------|------|
| Quick text edit | 2 min |
| Edit one slide | 5 min |
| Add new slide | 10 min |
| Major revision | 1-2 hrs |
| Full lesson creation | 3-4 hrs |

---

## Support

📘 **Full Guide:** `CREATOR_STUDIO_USER_GUIDE.md`
🔧 **Technical:** `CREATOR_STUDIO_TECHNICAL.md`
📖 **Workflow:** `CREATOR_WORKFLOW_QUICKSTART.md`
📋 **Changes:** `CHANGELOG.md`

---

**💡 Remember:** Every save creates a version snapshot. Don't be afraid to experiment!
