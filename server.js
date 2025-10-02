#!/usr/bin/env node

/**
 * Creator Studio Server
 * Handles lesson publishing to GitHub automatically
 */

const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.static('.'));

// Serve the main app on the same server to avoid CORS issues
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// CORS for local development
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Creator Studio Server is running' });
});

// Commit lesson to GitHub
app.post('/api/commit-lesson', async (req, res) => {
    try {
        console.log('Received lesson commit request');
        const { message, lessonData, filepath, manifest } = req.body;

        if (!message || !lessonData || !filepath || !manifest) {
            return res.status(400).json({
                error: 'Missing required fields: message, lessonData, filepath, manifest'
            });
        }

        console.log('Writing lesson files...');

        // Ensure directory exists
        const lessonDir = path.dirname(filepath);
        await fs.mkdir(lessonDir, { recursive: true });

        // Write lesson file
        await fs.writeFile(filepath, JSON.stringify(lessonData, null, 2), 'utf8');
        console.log(`Lesson file written: ${filepath}`);

        // Write manifest file
        await fs.writeFile('lessons/manifest.json', JSON.stringify(manifest, null, 2), 'utf8');
        console.log('Manifest file updated');

        // Git operations
        console.log('Performing git operations...');

        // Add files to git
        await execAsync(`git add "${filepath}" lessons/manifest.json`);
        console.log('Files added to git');

        // Commit with the provided message
        const commitMessage = `${message}\n\n🤖 Generated with [Claude Code](https://claude.ai/code)\n\nCo-Authored-By: Claude <noreply@anthropic.com>`;
        await execAsync(`git commit -m "${commitMessage}"`);
        console.log('Git commit successful');

        // Push to GitHub
        await execAsync('git push origin main');
        console.log('Pushed to GitHub successfully');

        res.json({
            success: true,
            message: 'Lesson published to GitHub successfully',
            filepath: filepath,
            commitMessage: message
        });

    } catch (error) {
        console.error('Error committing lesson:', error);

        // Provide more specific error messages
        let errorMessage = error.message;
        if (error.message.includes('not a git repository')) {
            errorMessage = 'Not a git repository. Please ensure you are in a git-enabled directory.';
        } else if (error.message.includes('nothing to commit')) {
            errorMessage = 'No changes to commit. Lesson may already exist with same content.';
        } else if (error.message.includes('Permission denied')) {
            errorMessage = 'Permission denied. Please check file system permissions.';
        }

        res.status(500).json({
            error: 'Failed to commit lesson to GitHub',
            details: errorMessage,
            filepath: req.body.filepath
        });
    }
});

// Write lesson file (alternative endpoint)
app.post('/api/write-lesson', async (req, res) => {
    try {
        const { filepath, content } = req.body;

        if (!filepath || !content) {
            return res.status(400).json({
                error: 'Missing filepath or content'
            });
        }

        // Ensure directory exists
        const dir = path.dirname(filepath);
        await fs.mkdir(dir, { recursive: true });

        // Write file
        await fs.writeFile(filepath, content, 'utf8');

        res.json({
            success: true,
            message: 'File written successfully',
            filepath: filepath
        });

    } catch (error) {
        console.error('Error writing file:', error);
        res.status(500).json({
            error: 'Failed to write file',
            details: error.message
        });
    }
});

// Create GitHub Issue for lesson publishing
app.post('/api/create-github-issue', async (req, res) => {
    try {
        const { title, body, labels } = req.body;

        // Use gh CLI to create the issue
        const labelsStr = labels.join(',');
        const command = `gh issue create --title "${title}" --body "${body}" --label "${labelsStr}"`;

        const { stdout } = await execAsync(command);
        const issueUrl = stdout.trim();

        res.json({
            success: true,
            html_url: issueUrl,
            message: 'GitHub issue created successfully'
        });
    } catch (error) {
        console.error('Error creating GitHub issue:', error);
        res.status(500).json({
            error: 'Failed to create GitHub issue',
            details: error.message
        });
    }
});

// Get lessons manifest
app.get('/api/lessons', async (req, res) => {
    try {
        const manifestPath = 'lessons/manifest.json';
        const manifestExists = await fs.access(manifestPath).then(() => true).catch(() => false);

        if (!manifestExists) {
            return res.json({
                version: "1.0",
                lastUpdated: new Date().toISOString(),
                totalLessons: 0,
                lessons: {}
            });
        }

        const manifestContent = await fs.readFile(manifestPath, 'utf8');
        const manifest = JSON.parse(manifestContent);

        res.json(manifest);
    } catch (error) {
        console.error('Error reading lessons manifest:', error);
        res.status(500).json({
            error: 'Failed to read lessons manifest',
            details: error.message
        });
    }
});

// Save draft endpoint
app.post('/api/save-draft', async (req, res) => {
    try {
        console.log('📝 Saving draft lesson...');
        const lesson = req.body;

        if (!lesson.id) {
            return res.status(400).json({ error: 'Lesson ID is required' });
        }

        // Save to drafts folder
        const draftPath = path.join(__dirname, 'lessons', 'drafts', `${lesson.id}.json`);
        await fs.writeFile(draftPath, JSON.stringify(lesson, null, 2));

        // Create version snapshot
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const versionPath = path.join(__dirname, 'lessons', 'drafts', 'versions', `${lesson.id}_${timestamp}.json`);
        await fs.writeFile(versionPath, JSON.stringify(lesson, null, 2));

        console.log(`✅ Draft saved: ${draftPath}`);
        console.log(`📸 Version snapshot: ${versionPath}`);

        res.json({
            success: true,
            message: 'Draft saved successfully',
            paths: {
                draft: draftPath,
                version: versionPath
            }
        });
    } catch (error) {
        console.error('❌ Error saving draft:', error);
        res.status(500).json({
            error: 'Failed to save draft',
            details: error.message
        });
    }
});

// Load draft endpoint
app.get('/api/load-draft/:lessonId', async (req, res) => {
    try {
        const { lessonId } = req.params;
        const draftPath = path.join(__dirname, 'lessons', 'drafts', `${lessonId}.json`);

        const content = await fs.readFile(draftPath, 'utf-8');
        const lesson = JSON.parse(content);

        res.json(lesson);
    } catch (error) {
        console.error('Error loading draft:', error);
        res.status(404).json({
            error: 'Draft not found',
            details: error.message
        });
    }
});

// List versions endpoint
app.get('/api/versions/:lessonId', async (req, res) => {
    try {
        const { lessonId } = req.params;
        const versionsDir = path.join(__dirname, 'lessons', 'drafts', 'versions');
        const files = await fs.readdir(versionsDir);

        const versions = files
            .filter(f => f.startsWith(lessonId) && f.endsWith('.json'))
            .map(f => {
                const match = f.match(/_(\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2})/);
                return {
                    filename: f,
                    timestamp: match ? match[1].replace(/-/g, ':').replace('T', ' ') : 'unknown'
                };
            })
            .sort((a, b) => b.timestamp.localeCompare(a.timestamp));

        res.json(versions);
    } catch (error) {
        console.error('Error listing versions:', error);
        res.status(500).json({
            error: 'Failed to list versions',
            details: error.message
        });
    }
});

// Publish draft endpoint (admin only)
app.post('/api/publish-lesson', async (req, res) => {
    try {
        console.log('📢 Publishing lesson...');
        const { lessonId } = req.body;

        const draftPath = path.join(__dirname, 'lessons', 'drafts', `${lessonId}.json`);
        const publishPath = path.join(__dirname, 'lessons', `${lessonId}.json`);

        // Backup current published version
        try {
            const currentContent = await fs.readFile(publishPath, 'utf-8');
            const backupPath = path.join(__dirname, 'lessons', 'backup', 'published', `${lessonId}_backup.json`);
            await fs.writeFile(backupPath, currentContent);
            console.log(`💾 Backup created: ${backupPath}`);
        } catch (err) {
            console.log('No existing published version to backup');
        }

        // Copy draft to published
        const draftContent = await fs.readFile(draftPath, 'utf-8');
        await fs.writeFile(publishPath, draftContent);

        console.log(`✅ Lesson published: ${publishPath}`);

        res.json({
            success: true,
            message: 'Lesson published successfully',
            publishPath
        });
    } catch (error) {
        console.error('❌ Error publishing lesson:', error);
        res.status(500).json({
            error: 'Failed to publish lesson',
            details: error.message
        });
    }
});

// Rollback endpoint
app.post('/api/rollback-lesson', async (req, res) => {
    try {
        console.log('⏪ Rolling back lesson...');
        const { lessonId } = req.body;

        const backupPath = path.join(__dirname, 'lessons', 'backup', 'published', `${lessonId}_backup.json`);
        const publishPath = path.join(__dirname, 'lessons', `${lessonId}.json`);

        // Restore from backup
        const backupContent = await fs.readFile(backupPath, 'utf-8');
        await fs.writeFile(publishPath, backupContent);

        console.log(`✅ Lesson rolled back: ${publishPath}`);

        res.json({
            success: true,
            message: 'Lesson rolled back successfully'
        });
    } catch (error) {
        console.error('❌ Error rolling back lesson:', error);
        res.status(500).json({
            error: 'Failed to rollback lesson',
            details: error.message
        });
    }
});

// Reject lesson endpoint
app.post('/api/reject-lesson', async (req, res) => {
    try {
        console.log('❌ Rejecting lesson...');
        const { lessonId, reason, timestamp } = req.body;

        // Create rejections directory if it doesn't exist
        const rejectionsDir = path.join(__dirname, 'lessons', 'drafts', 'rejections');
        await fs.mkdir(rejectionsDir, { recursive: true });

        // Save rejection note
        const rejectionData = {
            lessonId,
            reason,
            timestamp,
            reviewer: 'admin'
        };

        const rejectionPath = path.join(rejectionsDir, `${lessonId}_rejection.json`);
        await fs.writeFile(rejectionPath, JSON.stringify(rejectionData, null, 2));

        console.log(`✅ Rejection recorded: ${rejectionPath}`);

        res.json({
            success: true,
            message: 'Rejection recorded successfully',
            rejectionPath
        });
    } catch (error) {
        console.error('❌ Error recording rejection:', error);
        res.status(500).json({
            error: 'Failed to record rejection',
            details: error.message
        });
    }
});

// Git backup endpoint - commit all drafts to GitHub
app.post('/api/git-backup-drafts', async (req, res) => {
    try {
        console.log('☁️ Backing up drafts to GitHub...');

        // Check if there are any changes to commit
        const { stdout: statusOutput } = await execAsync('git status --porcelain lessons/drafts/');

        if (!statusOutput || statusOutput.trim().length === 0) {
            console.log('📭 No draft changes to commit');
            return res.json({
                success: true,
                message: 'No draft changes to backup',
                committed: false
            });
        }

        console.log('📝 Found draft changes to commit');

        // Add all draft files
        await execAsync('git add lessons/drafts/');
        console.log('✅ Added draft files to git');

        // Create commit with timestamp
        const timestamp = new Date().toLocaleString('en-US', {
            timeZone: 'America/New_York',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const commitMessage = `Backup lesson drafts - ${timestamp}

Auto-backup of lesson drafts and version snapshots.

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>`;

        await execAsync(`git commit -m "${commitMessage}"`);
        console.log('✅ Created git commit');

        // Push to GitHub
        await execAsync('git push origin main');
        console.log('✅ Pushed to GitHub');

        res.json({
            success: true,
            message: 'Drafts backed up to GitHub successfully',
            committed: true,
            timestamp
        });

    } catch (error) {
        console.error('❌ Error backing up drafts:', error);

        // Check if it's a "nothing to commit" error (which is actually OK)
        if (error.message.includes('nothing to commit')) {
            return res.json({
                success: true,
                message: 'No changes to backup',
                committed: false
            });
        }

        res.status(500).json({
            error: 'Failed to backup drafts to GitHub',
            details: error.message
        });
    }
});

// Get last backup time
app.get('/api/git-backup-status', async (req, res) => {
    try {
        // Get last commit that modified drafts folder
        const { stdout } = await execAsync('git log -1 --format="%ai|%s" -- lessons/drafts/');

        if (!stdout || stdout.trim().length === 0) {
            return res.json({
                lastBackup: null,
                message: 'No backup commits found'
            });
        }

        const [timestamp, message] = stdout.trim().split('|');

        res.json({
            lastBackup: timestamp,
            commitMessage: message,
            message: 'Backup status retrieved'
        });

    } catch (error) {
        console.error('Error getting backup status:', error);
        res.json({
            lastBackup: null,
            error: error.message
        });
    }
});

// Hourly auto-backup of drafts to GitHub
let backupInterval;

function startAutoBackup() {
    console.log('🕐 Starting hourly auto-backup to GitHub...');

    // Run backup every hour (3600000 ms)
    backupInterval = setInterval(async () => {
        try {
            console.log('⏰ Running scheduled backup...');

            const { stdout: statusOutput } = await execAsync('git status --porcelain lessons/drafts/');

            if (statusOutput && statusOutput.trim().length > 0) {
                await execAsync('git add lessons/drafts/');

                const timestamp = new Date().toLocaleString('en-US', {
                    timeZone: 'America/New_York',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });

                const commitMessage = `Auto-backup lesson drafts - ${timestamp}

Hourly automatic backup of lesson drafts and version snapshots.

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>`;

                await execAsync(`git commit -m "${commitMessage}"`);
                await execAsync('git push origin main');

                console.log(`✅ Auto-backup completed at ${timestamp}`);
            } else {
                console.log('📭 No changes to backup');
            }
        } catch (error) {
            if (!error.message.includes('nothing to commit')) {
                console.error('❌ Auto-backup error:', error.message);
            }
        }
    }, 3600000); // 1 hour

    console.log('✅ Auto-backup scheduled (runs every hour)');
}

// Start server
app.listen(PORT, () => {
    console.log(`Creator Studio Server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
    console.log('Ready to handle lesson publishing requests');
    console.log('📝 Draft API endpoints available');

    // Start auto-backup
    startAutoBackup();
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('Received SIGTERM, shutting down gracefully');
    if (backupInterval) clearInterval(backupInterval);
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('Received SIGINT, shutting down gracefully');
    if (backupInterval) clearInterval(backupInterval);
    process.exit(0);
});