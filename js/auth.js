/**
 * SATify - Authentication Module
 * Handles user authentication and account management
 */

class SATAuth {
    constructor(app) {
        this.app = app;
        this.init();
    }

    init() {
        this.setupAuthEventListeners();
    }

    setupAuthEventListeners() {
        // Auth modal controls
        document.getElementById('closeAuth')?.addEventListener('click', () => {
            // Don't allow closing if no user is logged in
            if (this.app.currentUser) {
                this.app.hideAuthModal();
            }
        });

        // Form switching
        document.getElementById('showSignup')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showSignupForm();
        });

        document.getElementById('showLogin')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showLoginForm();
        });

        // Login form
        document.getElementById('loginFormElement')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin(e);
        });

        // Signup form
        document.getElementById('signupFormElement')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSignup(e);
        });

        // Prevent modal close when clicking content
        document.querySelector('.modal-content')?.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        // Close modal when clicking backdrop (only if user is logged in)
        document.getElementById('authModal')?.addEventListener('click', () => {
            if (this.app.currentUser) {
                this.app.hideAuthModal();
            }
        });
    }

    showLoginForm() {
        document.getElementById('loginForm').classList.remove('hidden');
        document.getElementById('signupForm').classList.add('hidden');
        document.getElementById('authTitle').textContent = 'Welcome Back';
    }

    showSignupForm() {
        document.getElementById('loginForm').classList.add('hidden');
        document.getElementById('signupForm').classList.remove('hidden');
        document.getElementById('authTitle').textContent = 'Create Your Account';
    }

    handleLogin(event) {
        const formData = new FormData(event.target);
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;

        if (!this.validateEmail(email)) {
            this.app.showToast('Please enter a valid email address', 'error');
            return;
        }

        if (!password) {
            this.app.showToast('Please enter your password', 'error');
            return;
        }

        const success = this.app.login(email, password);
        if (success) {
            // Clear form
            event.target.reset();
        }
    }

    handleSignup(event) {
        const name = document.getElementById('signupName').value.trim();
        const email = document.getElementById('signupEmail').value.trim();
        const password = document.getElementById('signupPassword').value;
        const targetScore = document.getElementById('targetScore').value;

        // Validation
        if (!name || name.length < 2) {
            this.app.showToast('Please enter a valid name (at least 2 characters)', 'error');
            return;
        }

        if (!this.validateEmail(email)) {
            this.app.showToast('Please enter a valid email address', 'error');
            return;
        }

        if (!this.validatePassword(password)) {
            this.app.showToast('Password must be at least 8 characters with letters and numbers', 'error');
            return;
        }

        const userData = {
            name,
            email,
            password,
            targetScore: parseInt(targetScore)
        };

        const success = this.app.signup(userData);
        if (success) {
            // Clear form
            event.target.reset();
        }
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    validatePassword(password) {
        // At least 8 characters, contains letters and numbers
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
        return passwordRegex.test(password);
    }

    // Demo accounts for testing
    createDemoAccounts() {
        const demoUsers = {
            'demo@satpractice.com': {
                id: 'demo1',
                name: 'Demo Student',
                email: 'demo@satpractice.com',
                password: 'demo123456',
                targetScore: 1400,
                joinDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                stats: {
                    questionsCompleted: 150,
                    correctAnswers: 120,
                    streak: 5,
                    lastActivity: new Date().toISOString(),
                    estimatedScore: 1380
                }
            },
            'student@example.com': {
                id: 'demo2',
                name: 'Jane Smith',
                email: 'student@example.com',
                password: 'student123',
                targetScore: 1500,
                joinDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
                stats: {
                    questionsCompleted: 75,
                    correctAnswers: 58,
                    streak: 2,
                    lastActivity: new Date().toISOString(),
                    estimatedScore: 1290
                }
            }
        };

        const existingUsers = JSON.parse(localStorage.getItem('satapp_users') || '{}');
        const mergedUsers = { ...existingUsers, ...demoUsers };
        localStorage.setItem('satapp_users', JSON.stringify(mergedUsers));

        // Create some sample session data for demo user
        this.createDemoSessionData('demo1');
        this.createDemoSessionData('demo2');
    }

    createDemoSessionData(userId) {
        const key = `satapp_userData_${userId}`;
        const sampleSessions = [
            {
                id: 'session1',
                mode: 'practice',
                date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                totalQuestions: 10,
                correctAnswers: 8,
                score: 80,
                timeSpent: 15 * 60 * 1000, // 15 minutes
                questions: [] // Would contain actual question data
            },
            {
                id: 'session2',
                mode: 'practice',
                date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                totalQuestions: 15,
                correctAnswers: 12,
                score: 80,
                timeSpent: 20 * 60 * 1000, // 20 minutes
                questions: []
            },
            {
                id: 'session3',
                mode: 'timed',
                date: new Date().toISOString(),
                totalQuestions: 20,
                correctAnswers: 17,
                score: 85,
                timeSpent: 25 * 60 * 1000, // 25 minutes
                questions: []
            }
        ];

        const userData = {
            sessions: sampleSessions,
            streak: Math.floor(Math.random() * 10) + 1,
            preferences: {
                preferredSubjects: ['math', 'reading-writing'],
                studyReminders: true,
                difficulty: 'adaptive'
            }
        };

        localStorage.setItem(key, JSON.stringify(userData));
    }

    // Guest mode functionality
    enableGuestMode() {
        const guestUser = {
            id: 'guest',
            name: 'Guest User',
            email: 'guest@local',
            targetScore: 1400,
            joinDate: new Date().toISOString(),
            isGuest: true,
            stats: {
                questionsCompleted: 0,
                correctAnswers: 0,
                streak: 0,
                lastActivity: null,
                estimatedScore: 1200
            }
        };

        this.app.currentUser = guestUser;
        this.app.hideAuthModal();
        this.app.showDashboard();
        this.app.updateUserInfo();
        this.app.showToast('Continuing as guest - your progress will not be saved', 'warning');
    }

    // Social login placeholders (for future implementation)
    loginWithGoogle() {
        this.app.showToast('Google login coming soon!', 'info');
    }

    loginWithApple() {
        this.app.showToast('Apple login coming soon!', 'info');
    }

    // Password reset functionality
    resetPassword(email) {
        if (!this.validateEmail(email)) {
            this.app.showToast('Please enter a valid email address', 'error');
            return;
        }

        // In a real app, this would send a reset email
        this.app.showToast('Password reset instructions sent to your email', 'success');
    }

    // Account management
    updateProfile(userData) {
        if (!this.app.currentUser || this.app.currentUser.isGuest) {
            this.app.showToast('Please create an account to update profile', 'error');
            return false;
        }

        // Update user data
        const updatedUser = { ...this.app.currentUser, ...userData };
        localStorage.setItem('satapp_user', JSON.stringify(updatedUser));
        this.app.currentUser = updatedUser;

        // Update in users database
        const users = JSON.parse(localStorage.getItem('satapp_users') || '{}');
        if (users[updatedUser.email]) {
            users[updatedUser.email] = { ...users[updatedUser.email], ...userData };
            localStorage.setItem('satapp_users', JSON.stringify(users));
        }

        this.app.showToast('Profile updated successfully', 'success');
        this.app.updateUserInfo();
        return true;
    }

    deleteAccount() {
        if (!this.app.currentUser || this.app.currentUser.isGuest) {
            return false;
        }

        if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            const users = JSON.parse(localStorage.getItem('satapp_users') || '{}');
            delete users[this.app.currentUser.email];
            localStorage.setItem('satapp_users', JSON.stringify(users));

            // Remove user data
            const userDataKey = `satapp_userData_${this.app.currentUser.id}`;
            localStorage.removeItem(userDataKey);
            localStorage.removeItem('satapp_user');

            this.app.showToast('Account deleted successfully', 'success');
            this.app.logout();
            return true;
        }

        return false;
    }

    // Export user data (GDPR compliance)
    exportUserData() {
        if (!this.app.currentUser || this.app.currentUser.isGuest) {
            this.app.showToast('No user data to export', 'error');
            return;
        }

        const userData = this.app.getUserData();
        const exportData = {
            user: this.app.currentUser,
            userData,
            exportDate: new Date().toISOString()
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `sat-practice-data-${this.app.currentUser.id}.json`;
        link.click();

        this.app.showToast('User data exported successfully', 'success');
    }
}

// Initialize authentication when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait for main app to initialize
    setTimeout(() => {
        if (window.satApp) {
            window.satAuth = new SATAuth(window.satApp);
            
            // Create demo accounts for testing
            window.satAuth.createDemoAccounts();
            
            // Add guest mode button to auth modal
            const authModal = document.querySelector('.modal-body');
            if (authModal && !document.getElementById('guestModeBtn')) {
                const guestBtn = document.createElement('div');
                guestBtn.className = 'text-center';
                guestBtn.style.marginTop = '1rem';
                guestBtn.innerHTML = `
                    <button id="guestModeBtn" class="btn btn-secondary" style="width: 100%;">
                        Continue as Guest
                    </button>
                    <p style="margin-top: 0.5rem; color: var(--text-secondary); font-size: 0.9rem;">
                        Try the app without creating an account
                    </p>
                `;
                authModal.appendChild(guestBtn);
                
                document.getElementById('guestModeBtn').addEventListener('click', () => {
                    window.satAuth.enableGuestMode();
                });
            }
        }
    }, 100);
});