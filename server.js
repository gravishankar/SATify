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

// Start server
app.listen(PORT, () => {
    console.log(`Creator Studio Server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
    console.log('Ready to handle lesson publishing requests');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('Received SIGTERM, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('Received SIGINT, shutting down gracefully');
    process.exit(0);
});