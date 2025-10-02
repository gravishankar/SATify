# SATify Changelog

## 2025-10-02 - Bug Fixes and Infrastructure Improvements

### Lesson Fixes
- **lesson_05 (Transitions)**: Added missing slide_11 (completion slide)
- **lesson_10 (Words in Context)**: Fixed JSON syntax errors with quoted strings
- **lesson_12 (Purpose)**: Created new lesson, corrected title and metadata
- **All lessons**: Validated JSON syntax - all 12 lessons verified

### Creator Studio Improvements
- **Lesson Loading**: Fixed to use `filepath` from manifest instead of assuming `lessons/{id}.json`
- **Error Handling**: Added robust handling for null/undefined values in lesson renderer
- **Cache Busting**: Added version parameter to JavaScript files to force browser refresh
- **Git Backup**: Added error handling for backup status endpoint with cache bypass

### Git Backup System (NEW)
- **Automatic Backup**: Hourly automatic Git commits for all drafts
- **Manual Backup**: "☁️ Backup to GitHub" button in Creator Studio
- **Backup Status**: Displays last backup time in editor header
- **API Endpoints**:
  - `POST /api/git-backup-drafts`: Manually trigger backup
  - `GET /api/git-backup-status`: Get last backup timestamp

### Lesson Content Renderer
- **Analysis Breakdown**: Changed color scheme from green to blue ocean theme
- **Null Safety**: Added checks for missing `choices` in worked examples
- **Consistent Theming**: All UI elements now use cohesive blue/turquoise theme

### Code Quality
- Cleaned up drafts directory (removed old test drafts)
- Removed unused version snapshots
- Improved error messages and logging
- Added comprehensive input validation

### Documentation Updates
- Updated CREATOR_STUDIO_USER_GUIDE.md with Git backup feature
- Updated CREATOR_STUDIO_TECHNICAL.md with API documentation
- Added Layer 4 (Git Backup) to security/data protection section

## Files Modified
- `lessons/lesson_05.json` - Added slide_11
- `lessons/lesson_10.json` - Fixed JSON syntax
- `lessons/lesson_12.json` - New lesson file
- `lessons/manifest.json` - Updated lesson_12 filepath
- `server.js` - Added Git backup endpoints and auto-backup
- `js/creator-enhanced.js` - Fixed lesson loading, added backup UI
- `js/lesson-content-renderer.js` - Fixed null handling, updated colors
- `creator-enhanced.html` - Added cache busting parameter
- `docs/*` - Updated documentation

## Lessons Status
Total: 12 lessons, all validated
- lesson_01: Central Ideas & Details (9 slides)
- lesson_02: Sentence Structure (9 slides)
- lesson_03: Punctuation Mastery (9 slides)
- lesson_04: Verb Forms & Agreement (9 slides)
- lesson_05: Transitions & Flow (11 slides)
- lesson_06: Text Structure & Organization (9 slides)
- lesson_07: Command of Evidence (9 slides)
- lesson_08: Making Inferences (9 slides)
- lesson_09: Rhetorical Synthesis (9 slides)
- lesson_10: Words in Context (9 slides)
- lesson_11: Cross-Text Connections (9 slides)
- lesson_12: Purpose (9 slides)
