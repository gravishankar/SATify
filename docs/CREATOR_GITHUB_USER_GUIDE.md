# 📝 SATify Creator Studio - GitHub Edition User Guide

**For Content Creators and Lesson Authors**

---

## 🌐 What is the GitHub Creator Studio?

The GitHub Creator Studio is a **browser-based** lesson editing tool that lets you create and edit SATify lessons from anywhere, without installing software. All changes are automatically saved to GitHub.

**Access it here**: https://gravishankar.github.io/SATify/creator-github.html

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Get Your GitHub Token

1. Go to: https://github.com/settings/tokens
2. Click **"Generate new token (classic)"**
3. Fill in:
   - **Note**: `SATify Creator Studio`
   - **Expiration**: 90 days
   - **Scopes**: Check ✅ **repo** (all sub-items)
4. Click **"Generate token"**
5. **Copy the token** (save it somewhere safe!)

### Step 2: Login to Creator Studio

1. Open: https://gravishankar.github.io/SATify/creator-github.html
2. A popup will ask for your token
3. Paste your token and click OK
4. You're in! 🎉

### Step 3: Edit Your First Lesson

1. **Select a lesson** from the left sidebar
2. **Make changes** in the center panel
3. **See live preview** on the right
4. Click **"💾 Commit to GitHub"** to save
5. Done! Your changes are saved.

---

## 📋 The Interface

### Three Panels

```
┌─────────────┬──────────────────┬─────────────┐
│   Lessons   │      Editor      │   Preview   │
│   (Left)    │    (Center)      │   (Right)   │
│             │                  │             │
│ • Lesson 1  │ 📋 Metadata      │ 👁️ Live     │
│ • Lesson 2  │ Title, Level...  │ Preview     │
│ • Lesson 3  │                  │             │
│   ...       │ 📑 Slides        │ Shows       │
│             │ Edit, Delete     │ changes     │
│             │                  │ instantly   │
└─────────────┴──────────────────┴─────────────┘
```

### Left Panel: Lesson List
- Click any lesson to load it
- Shows: Title, Skill Code, Slide Count

### Center Panel: Editor
- **Top**: Lesson metadata (title, level, objectives, etc.)
- **Bottom**: Slides with Edit/Delete buttons
- **Buttons**:
  - 💾 **Commit to GitHub** - Save your work
  - 👁️ **Preview** - Open full preview window
  - ✅ **Create Pull Request** - Request to publish

### Right Panel: Live Preview
- Updates as you type
- Shows metadata and all slides
- Click **"🚀 Open Full Preview"** to see lesson as students will

---

## ✍️ How to Edit a Lesson

### Example: Editing "Transitions"

1. **Load the lesson**
   - Click "Transitions" in left sidebar
   - Wait for "🟢 Lesson loaded"

2. **Change metadata** (optional)
   - Modify Title, Subtitle, Duration, etc.
   - See changes update in preview instantly

3. **Edit a slide**
   - Scroll to slides section
   - Click **"Edit"** on any slide
   - Modal opens with slide details
   - Make your changes
   - Click **"Save Slide"**

4. **Preview your work**
   - Click **"👁️ Preview"** button
   - New window opens
   - Navigate through slides
   - Close when satisfied

5. **Save to GitHub**
   - Click **"💾 Commit to GitHub"**
   - Status shows "🟢 Draft saved successfully"
   - Your changes are now on GitHub!

---

## 🔄 Understanding the Workflow

### Draft → Review → Publish

1. **You edit** → Saved to `lessons/drafts/`
2. **You request publish** → Creates Pull Request
3. **Admin reviews** → Checks changes on GitHub
4. **Admin approves** → Lesson goes live to students

**Your drafts are SAFE** - they don't affect students until admin approves!

---

## 💡 Common Tasks

### Add a New Slide

1. Scroll to **"📑 Slides"** section
2. Click **"+ Add Slide"** button
3. Fill in slide details:
   - **Type**: Choose slide type (strategy, example, etc.)
   - **Title**: Slide heading
   - **Content**: Slide data (JSON format)
4. Click **"Save Slide"**

### Reorder Slides

1. Find **☰** (drag handle) on slide
2. Click and hold
3. Drag up or down
4. Release to drop
5. Order auto-saves

### Delete a Slide

1. Click **"Delete"** on slide
2. Confirm deletion
3. Slide removed (can undo by reloading lesson)

---

## 🎯 Slide Types Guide

| Type | Use For | Example |
|------|---------|---------|
| **strategy_teaching** | Step-by-step strategies | "The 3-Phase Master Strategy" |
| **concept_teaching** | Explaining concepts | "What are Transitions?" |
| **worked_example** | Interactive practice | Example with analysis |
| **practice_prompt** | Direct to practice | "Ready to practice?" |
| **learning_objectives** | Lesson goals | First slide objectives |
| **concept_reinforcement** | Summary/recap | Final slide takeaways |

---

## 🛡️ Safety & Security

### Your Token
- **Stored locally** in your browser only
- **Never shared** with anyone except GitHub
- **Can logout** anytime with 🔓 button
- **Expires** after 90 days (create new one)

### Your Changes
- **Drafts are private** - only you and admins see them
- **Version history** - every save creates a backup
- **Can't break things** - students see only approved lessons

### Best Practices
1. **Save often** - Click "💾 Commit to GitHub" every 10-15 min
2. **Preview before publishing** - Always test with full preview
3. **Use clear commit messages** - GitHub tracks who changed what
4. **Logout on shared computers** - Click 🔓 Logout button

---

## 🆘 Troubleshooting

### "Not authenticated" Error
**Fix**:
1. Click 🔓 **Logout** button
2. Create new token (Step 1 above)
3. Login again

### Preview Not Opening
**Fix**:
1. Check popup blocker (allow popups)
2. Hard refresh: `Cmd+Shift+R` or `Ctrl+Shift+R`

### "Failed to load lesson"
**Fix**:
1. Check internet connection
2. Refresh page and try again
3. Token might be expired (create new one)

### Changes Not Saving
**Fix**:
1. Ensure you loaded a lesson first
2. Check GitHub token hasn't expired
3. Try refreshing and re-login

---

## 📊 What's Different from Local Version?

| Feature | Local Studio | GitHub Studio |
|---------|--------------|---------------|
| **Access** | Need to run server | Just open URL |
| **Installation** | Requires Node.js | No installation |
| **Location** | Your computer only | Any computer |
| **Saves To** | Local files | GitHub commits |
| **Backup** | Manual | Automatic (every save) |
| **Collaboration** | One person | Multiple creators |
| **Publish** | Manual merge | Pull Request |

---

## 📚 Key Concepts

### What is a Draft?
- Your work-in-progress version of a lesson
- Stored in `lessons/drafts/` folder on GitHub
- Not visible to students
- You can edit freely

### What is a Pull Request?
- A request to publish your changes
- Admin reviews what changed
- Shows before/after comparison
- Gets approved or rejected

### What is a Commit?
- A save point in GitHub
- Like clicking "Save" but with history
- Includes who, when, and what changed
- Can be undone if needed

---

## 🎓 Tips for Success

### 1. **Work in Batches**
- Make several edits
- Preview them together
- Save once when satisfied

### 2. **Use Descriptive Titles**
- Make slide titles clear
- Students see these first
- Helps with navigation

### 3. **Test Thoroughly**
- Open full preview
- Go through EVERY slide
- Check for typos
- Verify examples work

### 4. **Keep Objectives Clear**
- Learning objectives tell students what they'll learn
- Make them specific and actionable
- Update them if lesson changes

### 5. **Follow Patterns**
- Look at existing lessons
- Match the style and format
- Consistency helps students

---

## 📞 Getting Help

### Documentation
- **This Guide**: End-user instructions
- **Quick Reference**: `docs/CREATOR_QUICK_REFERENCE.md`
- **Workflow Guide**: `docs/CREATOR_WORKFLOW_QUICKSTART.md`
- **Technical Docs**: `docs/CREATOR_STUDIO_TECHNICAL.md`
- **Deployment**: `docs/GITHUB_PAGES_DEPLOYMENT.md`

### Support
- **Questions**: Open issue on GitHub
- **Bug reports**: Create issue with details
- **Feature requests**: Discuss with admin

---

## ✅ Checklist: Before Requesting Publish

Use this checklist before clicking "✅ Create Pull Request":

- [ ] Loaded the lesson and made changes
- [ ] Saved with "💾 Commit to GitHub"
- [ ] Opened full preview (🚀 button)
- [ ] Read through EVERY slide
- [ ] No typos or grammar errors
- [ ] Slide order makes sense
- [ ] Examples are clear and correct
- [ ] Learning objectives match content
- [ ] All required fields filled

---

## 🎉 You're Ready!

**Your first task**:
1. Open: https://gravishankar.github.io/SATify/creator-github.html
2. Login with your GitHub token
3. Load "Transitions" lesson
4. Change duration from "20-25 min" to "25-30 min"
5. Save with "💾 Commit to GitHub"
6. Check GitHub to see your commit!

**Congratulations - you're now a SATify content creator!** 🎨✨

---

**Happy Creating!**

*For advanced features, see the Technical Documentation.*
