# 🚀 GitHub Pages Deployment Guide

## Overview

The **GitHub Edition** of the SATify Creator Studio allows multiple content creators to edit lessons directly from GitHub Pages without needing to run a local server. It uses the GitHub REST API to read and write lesson files.

---

## Features

✅ **No Server Required** - Runs entirely in the browser
✅ **Multi-Author Support** - Multiple creators can work simultaneously
✅ **GitHub Authentication** - Secure access with Personal Access Tokens
✅ **Same UI** - Identical interface to the local Creator Studio
✅ **Version Control** - Every save is a Git commit
✅ **Pull Requests** - Publish requests create PRs for review
✅ **Free Hosting** - GitHub Pages hosts it for free

---

## Step 1: Enable GitHub Pages

### Method A: Using GitHub Actions (Recommended)

1. Go to your repository: https://github.com/gravishankar/SATify/settings/pages
2. Under **"Build and deployment"**:
   - **Source**: Select **"GitHub Actions"** from dropdown
3. The workflow will automatically deploy when you push to `main`
4. Wait 1-2 minutes for first deployment
5. Your site will be live at: `https://gravishankar.github.io/SATify/`

### Method B: Deploy from Branch (Alternative)

1. Go to: https://github.com/gravishankar/SATify/settings/pages
2. Under **"Build and deployment"**:
   - **Source**: Select **"Deploy from a branch"**
   - **Branch**: Select `main` and `/ (root)`
   - Click **"Save"**
3. Wait 1-2 minutes for deployment

**Note**: If the Save button is disabled, use Method A (GitHub Actions) instead.

---

## Step 2: Access the Creator Studio

Once GitHub Pages is enabled:

**URL**: `https://gravishankar.github.io/SATify/creator-github.html`

Bookmark this URL for easy access.

---

## Step 3: Create a GitHub Personal Access Token

Each content creator needs their own token:

### For Content Creators:

1. Go to GitHub.com and login
2. Click your profile picture → **Settings**
3. Scroll down to **Developer settings** (bottom left)
4. Click **Personal access tokens** → **Tokens (classic)**
5. Click **Generate new token** → **Generate new token (classic)**
6. Fill in:
   - **Note**: `SATify Creator Studio`
   - **Expiration**: 90 days (or custom)
   - **Scopes**: Check ✅ **repo** (Full control of private repositories)
7. Click **Generate token** at the bottom
8. **COPY THE TOKEN** (you can't see it again!)
9. Save it somewhere secure (password manager)

### Token Permissions Required:

```
✅ repo
   ✅ repo:status
   ✅ repo_deployment
   ✅ public_repo
   ✅ repo:invite
   ✅ security_events
```

---

## Step 4: Login to Creator Studio

1. Open `https://gravishankar.github.io/SATify/creator-github.html`
2. You'll see an authentication prompt
3. Paste your GitHub Personal Access Token
4. Click **Authenticate**
5. Token is saved in your browser (localStorage)

**Security Note**: The token is only stored in YOUR browser, never sent anywhere except to GitHub's API.

---

## Step 5: Using the Creator Studio

### Same Interface, Different Backend

The GitHub Edition looks **exactly the same** as the local version:

- **Left Panel**: Lesson selector
- **Center Panel**: Editor with metadata and slides
- **Right Panel**: Live preview

### Key Differences from Local Version:

| Feature | Local Version | GitHub Edition |
|---------|--------------|----------------|
| **Save Draft** | → Server file | → Git commit |
| **Backup** | Manual button | Auto (every commit) |
| **Publish** | Admin approval | Pull Request |
| **Authentication** | None | GitHub token |

---

## Workflow for Content Creators

### 1. **Select a Lesson**
- Click any lesson from the left sidebar
- Loads from GitHub repository

### 2. **Edit Content**
- Modify metadata or slides
- See live preview on the right
- Changes tracked with 🔴 "Unsaved changes" status

### 3. **Commit Your Changes**
- Click **"💾 Commit to GitHub"**
- Creates a Git commit to `lessons/drafts/[lesson_id].json`
- Also creates a version snapshot for rollback
- Status shows 🟢 "All changes saved"

### 4. **Request Publish**
- When ready, click **"✅ Create Pull Request"**
- Creates a new branch: `publish-[lesson_id]-[timestamp]`
- Commits lesson to published path
- Opens Pull Request for admin review
- You get a PR URL to share

### 5. **Admin Reviews**
- Admin sees PR on GitHub
- Reviews changes
- Merges (approves) or requests changes
- Once merged, lesson goes live!

---

## Example: Editing the Transitions Lesson

```
1. Open: https://gravishankar.github.io/SATify/creator-github.html
2. Click "Transitions" in left sidebar
3. Change duration from "20-25 min" to "25-30 min"
4. Click "💾 Commit to GitHub"
   → Commits to: lessons/drafts/lesson_05.json
   → Commit message: "Update draft: Transitions & Flow - Oct 5, 2025, 10:30 AM"
5. Click "✅ Create Pull Request"
   → Creates branch: publish-lesson_05-1728142200000
   → Creates PR: "📚 Publish Request: Transitions & Flow"
   → Returns PR URL: https://github.com/gravishankar/SATify/pull/42
6. Share PR URL with admin for review
```

---

## Admin Workflow

### Reviewing Pull Requests

1. Go to: https://github.com/gravishankar/SATify/pulls
2. Click on the publish request PR
3. Review the **Files changed** tab
4. See diff between current and proposed version
5. Options:
   - **Approve & Merge**: Changes go live
   - **Request Changes**: Add comments, creator fixes
   - **Close**: Reject the changes

### Merging a PR

```bash
# Option 1: Use GitHub web interface
Click "Merge pull request" → "Confirm merge"

# Option 2: Use command line
git checkout main
git pull origin publish-lesson_05-1728142200000
git merge --squash publish-lesson_05-1728142200000
git push origin main
```

---

## Advantages Over Local Version

### For Content Creators:

✅ No installation required
✅ Works from any computer
✅ Works on tablets/Chromebooks
✅ Always up-to-date (no pulling)
✅ Changes tracked in Git automatically

### For Admins:

✅ Built-in approval workflow (PRs)
✅ See exactly what changed (diffs)
✅ Can revert easily
✅ Contributors visible in Git history
✅ No server maintenance

---

## Limitations

❌ **Requires Internet** - Can't work offline (local version can)
❌ **GitHub Rate Limits** - 5000 API calls/hour (plenty for normal use)
❌ **Token Expiration** - Tokens expire after 90 days (re-authenticate)
❌ **No Auto-Backup Button** - Every save is already a commit (backup is built-in)

---

## Security

### Token Storage

- Tokens stored in browser `localStorage`
- Only accessible to `gravishankar.github.io` domain
- Never sent to any server except `api.github.com`
- Can logout anytime to clear token

### Permissions

- Token needs `repo` scope to read/write files
- Token tied to creator's GitHub account
- Git commits show creator's username
- Admin can see who made each change

### Best Practices

1. **Use short-lived tokens** (90 days max)
2. **Don't share tokens** (each creator gets their own)
3. **Logout on shared computers**
4. **Revoke tokens** if compromised:
   - GitHub Settings → Developer Settings → Tokens → Delete

---

## Troubleshooting

### 404 Error - "File not found" for creator-github.html

**Problem**: GitHub Pages deployed from old commit without creator-github.html OR Jekyll is processing files
**Solution**:
1. Check if `.nojekyll` file exists in root directory
   - If missing: Create empty `.nojekyll` file and commit
   - This disables Jekyll processing
2. Verify GitHub Pages source is set correctly:
   - Go to: https://github.com/gravishankar/SATify/settings/pages
   - Source should be: **"GitHub Actions"** or **"Deploy from a branch: main/(root)"**
3. Force re-deployment:
   - Make any commit to main branch (e.g., update README)
   - Wait 2-3 minutes for redeployment
   - Check: https://gravishankar.github.io/SATify/creator-github.html

### "Not authenticated" Error

**Problem**: Token expired or invalid
**Solution**:
1. Click **Logout** button
2. Create new token (Step 3)
3. Login again

### "Failed to load lesson"

**Problem**: GitHub API rate limit or network issue
**Solution**:
1. Wait 1 minute
2. Refresh page
3. Check internet connection

### "Failed to commit"

**Problem**: Merge conflict or permissions issue
**Solution**:
1. Check if another creator edited the same lesson
2. Refresh and try again
3. Contact admin if persists

### Changes Not Showing

**Problem**: Browser cache
**Solution**:
1. Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
2. Clear browser cache for GitHub Pages site

---

## Comparison: Local vs GitHub Edition

| Feature | Local (creator-enhanced.html) | GitHub (creator-github.html) |
|---------|-------------------------------|------------------------------|
| **Installation** | Requires Node.js, npm install | Just open URL |
| **Authentication** | None | GitHub token |
| **Backend** | server.js (Express) | GitHub REST API |
| **Saves To** | lessons/drafts/ folder | Git commit |
| **Backup** | Manual button + hourly cron | Every save is a commit |
| **Publish** | Admin manual merge | Pull Request |
| **Multi-User** | File locking needed | Built-in (Git) |
| **Offline** | Yes | No |
| **Best For** | Solo development | Multiple creators |

---

## Next Steps

1. ✅ Enable GitHub Pages (Step 1)
2. ✅ Create Personal Access Tokens for all creators (Step 3)
3. ✅ Share Creator Studio URL with team
4. ✅ Test by editing a lesson
5. ✅ Review PR workflow with admin

---

## Support

**Questions?** Check:
- Full User Guide: `CREATOR_STUDIO_USER_GUIDE.md`
- Quick Reference: `CREATOR_QUICK_REFERENCE.md`
- Technical Docs: `CREATOR_STUDIO_TECHNICAL.md`

**Need Help?**
- Open an issue: https://github.com/gravishankar/SATify/issues
- Contact admin: [your-email@domain.com]

---

**Happy Creating! 🎨**

*Now with GitHub-powered collaboration!*
