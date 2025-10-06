/**
 * GitHub API Adapter for SATify Creator Studio
 * Replaces server.js API calls with GitHub REST API calls
 * Enables Creator Studio to work on GitHub Pages
 */

class GitHubAPIAdapter {
    constructor() {
        this.owner = 'gravishankar';  // GitHub username
        this.repo = 'SATify';          // Repository name
        this.branch = 'main';          // Branch to commit to
        this.token = null;             // GitHub Personal Access Token
        this.authenticated = false;
    }

    /**
     * Initialize authentication
     */
    async init() {
        // Check if token exists in localStorage
        this.token = localStorage.getItem('github_token');

        if (this.token) {
            // Verify token is still valid
            const isValid = await this.verifyToken();
            if (isValid) {
                this.authenticated = true;
                return true;
            } else {
                // Token invalid, remove it
                localStorage.removeItem('github_token');
                this.token = null;
            }
        }

        return false;
    }

    /**
     * Verify GitHub token
     */
    async verifyToken() {
        try {
            const response = await fetch('https://api.github.com/user', {
                headers: {
                    'Authorization': `token ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            return response.ok;
        } catch (error) {
            console.error('Token verification failed:', error);
            return false;
        }
    }

    /**
     * Prompt user to authenticate
     */
    authenticate() {
        const token = prompt(
            'Enter your GitHub Personal Access Token:\n\n' +
            'To create a token:\n' +
            '1. Go to GitHub Settings → Developer settings → Personal access tokens\n' +
            '2. Click "Generate new token (classic)"\n' +
            '3. Give it a name like "SATify Creator Studio"\n' +
            '4. Select scopes: "repo" (full control of private repositories)\n' +
            '5. Click "Generate token"\n' +
            '6. Copy the token and paste it here\n\n' +
            'Your token will be saved locally in your browser.'
        );

        if (token) {
            this.token = token;
            localStorage.setItem('github_token', token);
            this.authenticated = true;
            return true;
        }

        return false;
    }

    /**
     * Logout (clear token)
     */
    logout() {
        this.token = null;
        this.authenticated = false;
        localStorage.removeItem('github_token');
    }

    /**
     * Get file from GitHub
     */
    async getFile(path) {
        if (!this.authenticated) {
            throw new Error('Not authenticated. Please login first.');
        }

        try {
            const response = await fetch(
                `https://api.github.com/repos/${this.owner}/${this.repo}/contents/${path}?ref=${this.branch}`,
                {
                    headers: {
                        'Authorization': `token ${this.token}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                }
            );

            if (!response.ok) {
                if (response.status === 404) {
                    return null; // File doesn't exist
                }
                throw new Error(`GitHub API error: ${response.status}`);
            }

            const data = await response.json();

            // Decode base64 content
            const content = atob(data.content.replace(/\n/g, ''));
            return {
                content: JSON.parse(content),
                sha: data.sha // Needed for updating the file
            };
        } catch (error) {
            console.error(`Error getting file ${path}:`, error);
            throw error;
        }
    }

    /**
     * Save file to GitHub
     */
    async saveFile(path, content, message, sha = null) {
        if (!this.authenticated) {
            throw new Error('Not authenticated. Please login first.');
        }

        try {
            // Encode content as base64
            const contentString = typeof content === 'string'
                ? content
                : JSON.stringify(content, null, 2);
            const encodedContent = btoa(contentString);

            const body = {
                message: message,
                content: encodedContent,
                branch: this.branch
            };

            // If sha provided, this is an update
            if (sha) {
                body.sha = sha;
            }

            const response = await fetch(
                `https://api.github.com/repos/${this.owner}/${this.repo}/contents/${path}`,
                {
                    method: 'PUT',
                    headers: {
                        'Authorization': `token ${this.token}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(body)
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`GitHub API error: ${errorData.message || response.status}`);
            }

            const data = await response.json();
            return {
                success: true,
                sha: data.content.sha,
                commit: data.commit.sha
            };
        } catch (error) {
            console.error(`Error saving file ${path}:`, error);
            throw error;
        }
    }

    /**
     * Load manifest
     */
    async loadManifest() {
        const result = await this.getFile('lessons/manifest.json');
        return result ? result.content : null;
    }

    /**
     * Load lesson (draft or published)
     */
    async loadLesson(lessonId, filepath) {
        // Try draft first
        let result = await this.getFile(`lessons/drafts/${lessonId}.json`);

        if (result) {
            console.log(`📝 Loaded draft for ${lessonId} from GitHub`);
            return { data: result.content, isDraft: true, sha: result.sha };
        }

        // Fallback to published version
        result = await this.getFile(filepath);

        if (result) {
            console.log(`📚 Loaded published version of ${lessonId} from GitHub`);
            return { data: result.content, isDraft: false, sha: result.sha };
        }

        throw new Error(`Lesson ${lessonId} not found`);
    }

    /**
     * Save draft
     */
    async saveDraft(lesson) {
        const path = `lessons/drafts/${lesson.id}.json`;

        // Get current file SHA if it exists
        let sha = null;
        try {
            const existing = await this.getFile(path);
            sha = existing ? existing.sha : null;
            console.log(`📄 Found existing draft, SHA: ${sha}`);
        } catch (error) {
            console.log(`📝 No existing draft found, creating new file`);
            // File doesn't exist, sha remains null for creation
        }

        const timestamp = new Date().toLocaleString('en-US', {
            timeZone: 'America/New_York',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const commitMessage = `Update draft: ${lesson.title} - ${timestamp}

Lesson ID: ${lesson.id}
Slides: ${lesson.slides?.length || 0}

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>`;

        return await this.saveFile(path, lesson, commitMessage, sha);
    }

    /**
     * Create version snapshot
     */
    async createVersionSnapshot(lesson) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const path = `lessons/drafts/versions/${lesson.id}_${timestamp}.json`;

        const commitMessage = `Version snapshot: ${lesson.title} - ${timestamp}

Automated version snapshot for rollback capability.

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>`;

        try {
            return await this.saveFile(path, lesson, commitMessage);
        } catch (error) {
            console.warn('Failed to create version snapshot:', error);
            // Don't fail the save if snapshot fails
            return { success: false, error: error.message };
        }
    }

    /**
     * Request publish (create pull request)
     */
    async requestPublish(lesson, publishPath) {
        // First, save the draft
        await this.saveDraft(lesson);

        // Create a branch for the publish request
        const branchName = `publish-${lesson.id}-${Date.now()}`;

        try {
            // Get the current main branch SHA
            const mainRef = await fetch(
                `https://api.github.com/repos/${this.owner}/${this.repo}/git/ref/heads/${this.branch}`,
                {
                    headers: {
                        'Authorization': `token ${this.token}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                }
            );
            const mainData = await mainRef.json();
            const mainSha = mainData.object.sha;

            // Create new branch
            await fetch(
                `https://api.github.com/repos/${this.owner}/${this.repo}/git/refs`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `token ${this.token}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        ref: `refs/heads/${branchName}`,
                        sha: mainSha
                    })
                }
            );

            // Commit lesson to new branch
            this.branch = branchName; // Temporarily switch branch
            await this.saveFile(publishPath, lesson, `Publish request: ${lesson.title}`);
            this.branch = 'main'; // Switch back

            // Create pull request
            const prResponse = await fetch(
                `https://api.github.com/repos/${this.owner}/${this.repo}/pulls`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `token ${this.token}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        title: `📚 Publish Request: ${lesson.title}`,
                        body: `## Lesson Details
- **ID**: ${lesson.id}
- **Title**: ${lesson.title}
- **Subtitle**: ${lesson.subtitle || 'N/A'}
- **Level**: ${lesson.level}
- **Slides**: ${lesson.slides?.length || 0}

## Requested Changes
Please review and approve this lesson for publication.

🤖 Generated with [Claude Code](https://claude.ai/code)`,
                        head: branchName,
                        base: 'main'
                    })
                }
            );

            const prData = await prResponse.json();

            if (prResponse.ok) {
                return {
                    success: true,
                    pr_number: prData.number,
                    pr_url: prData.html_url
                };
            } else {
                throw new Error(`Failed to create PR: ${prData.message}`);
            }
        } catch (error) {
            console.error('Error creating publish request:', error);
            throw error;
        }
    }

    /**
     * Get last backup time
     * (For GitHub version, this is the last commit time to drafts folder)
     */
    async getLastBackupTime() {
        try {
            const response = await fetch(
                `https://api.github.com/repos/${this.owner}/${this.repo}/commits?path=lessons/drafts&per_page=1`,
                {
                    headers: {
                        'Authorization': `token ${this.token}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                }
            );

            if (response.ok) {
                const commits = await response.json();
                if (commits.length > 0) {
                    return {
                        lastBackup: commits[0].commit.committer.date,
                        message: commits[0].commit.message
                    };
                }
            }

            return { lastBackup: null };
        } catch (error) {
            console.error('Error getting last backup time:', error);
            return { lastBackup: null };
        }
    }
}

// Global instance
window.githubAPI = new GitHubAPIAdapter();
