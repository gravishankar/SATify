/**
 * Role Manager - Simple role-based access control
 * Manages instructor vs student permissions
 */

class RoleManager {
    constructor() {
        this.roles = {
            STUDENT: 'student',
            INSTRUCTOR: 'instructor'
        };
        this.init();
    }

    init() {
        // Initialize role from localStorage or default to student
        this.currentRole = localStorage.getItem('user_role') || this.roles.STUDENT;
        console.log('RoleManager initialized with role:', this.currentRole);
        this.updateUIBasedOnRole();
    }

    // Get current user role
    getCurrentRole() {
        return this.currentRole;
    }

    // Check if current user is instructor
    isInstructor() {
        return this.currentRole === this.roles.INSTRUCTOR;
    }

    // Check if current user is student
    isStudent() {
        return this.currentRole === this.roles.STUDENT;
    }

    // Set user role (for demo purposes, later will be server-side)
    setRole(role) {
        if (Object.values(this.roles).includes(role)) {
            this.currentRole = role;
            localStorage.setItem('user_role', role);
            this.updateUIBasedOnRole();
            console.log(`Role set to: ${role}`);

            // Dispatch custom event for other components
            window.dispatchEvent(new CustomEvent('roleChanged', {
                detail: { role: role, isInstructor: this.isInstructor() }
            }));
        } else {
            console.error('Invalid role:', role);
        }
    }

    // Toggle role for development/demo
    toggleRole() {
        const newRole = this.isInstructor() ? this.roles.STUDENT : this.roles.INSTRUCTOR;
        this.setRole(newRole);
        return newRole;
    }

    // Update UI elements based on current role
    updateUIBasedOnRole() {
        console.log('Updating UI for role:', this.currentRole, 'Is instructor:', this.isInstructor());

        // Show/hide Creator Studio tab
        const creatorStudioTab = document.querySelector('[data-page="creatorStudio"]');
        console.log('Creator Studio tab found:', !!creatorStudioTab);
        if (creatorStudioTab) {
            if (this.isInstructor()) {
                creatorStudioTab.style.display = 'flex';
                console.log('Showing Creator Studio tab');
            } else {
                creatorStudioTab.style.display = 'none';
                console.log('Hiding Creator Studio tab');
            }
        }

        // Update role indicator if it exists
        const roleIndicator = document.getElementById('roleIndicator');
        if (roleIndicator) {
            roleIndicator.textContent = this.isInstructor() ? '👨‍🏫 Instructor' : '👨‍🎓 Student';
            roleIndicator.className = `role-badge ${this.currentRole}`;
        }

        // Show role toggle button in development
        const roleToggle = document.getElementById('roleToggle');
        if (roleToggle) {
            roleToggle.style.display = 'block';
            roleToggle.textContent = `Switch to ${this.isInstructor() ? 'Student' : 'Instructor'}`;
        }

        // Update user menu role display
        this.updateUserMenuRole();
    }

    // Update role display in user menu
    updateUserMenuRole() {
        const userMenuRole = document.getElementById('userMenuRole');
        if (userMenuRole) {
            userMenuRole.textContent = this.isInstructor() ? 'Instructor Mode' : 'Student Mode';
        }

        // Update settings page toggle button
        const settingsToggle = document.getElementById('roleToggle');
        if (settingsToggle) {
            settingsToggle.textContent = `Switch to ${this.isInstructor() ? 'Student' : 'Instructor'}`;
            settingsToggle.onclick = () => this.toggleRole();
        }

        // Update navigation toggle button
        const navToggle = document.getElementById('navRoleToggle');
        if (navToggle) {
            navToggle.textContent = `Switch to ${this.isInstructor() ? 'Student' : 'Instructor'}`;
        }
    }

    // Check permissions for specific actions
    hasPermission(action) {
        const permissions = {
            [this.roles.STUDENT]: [
                'view_lessons',
                'practice_questions',
                'view_progress',
                'use_strategy_breakdown'
            ],
            [this.roles.INSTRUCTOR]: [
                'view_lessons',
                'practice_questions',
                'view_progress',
                'use_strategy_breakdown',
                'create_content',
                'edit_content',
                'delete_content',
                'manage_topics',
                'access_creator_studio',
                'preview_content'
            ]
        };

        return permissions[this.currentRole]?.includes(action) || false;
    }

    // Initialize role-based features after DOM load
    initializeRoleFeatures() {
        console.log('Initializing role features...');

        // Add role toggle button for development
        this.addRoleToggleButton();

        // Set up Creator Studio access
        this.setupCreatorStudioAccess();

        console.log('Role features initialized');
    }

    // Add development role toggle button
    addRoleToggleButton() {
        // Always try to create navigation toggle
        const existingNavToggle = document.getElementById('navRoleToggle');
        if (existingNavToggle) {
            console.log('Navigation role toggle already exists, updating it');
            existingNavToggle.textContent = `Switch to ${this.isInstructor() ? 'Student' : 'Instructor'}`;
            return;
        }

        console.log('Creating navigation role toggle button...');
        const roleToggle = document.createElement('button');
        roleToggle.id = 'navRoleToggle';
        roleToggle.className = 'role-toggle-btn';
        roleToggle.textContent = `Switch to ${this.isInstructor() ? 'Student' : 'Instructor'}`;
        roleToggle.addEventListener('click', () => {
            console.log('Navigation role toggle clicked');
            this.toggleRole();
        });

        // Add to navigation
        const nav = document.querySelector('.nav-menu');
        console.log('Navigation menu found:', !!nav);
        if (nav) {
            const toggleContainer = document.createElement('div');
            toggleContainer.className = 'role-toggle-container';
            toggleContainer.appendChild(roleToggle);
            nav.appendChild(toggleContainer);
            console.log('Role toggle button added to navigation');
        } else {
            console.error('Navigation menu not found - cannot add role toggle');
        }

        // Also ensure settings toggle works
        this.setupSettingsToggle();
    }

    // Setup settings page toggle button
    setupSettingsToggle() {
        const settingsToggle = document.getElementById('roleToggle');
        if (settingsToggle) {
            console.log('Setting up settings page toggle button');
            settingsToggle.onclick = () => {
                console.log('Settings role toggle clicked');
                this.toggleRole();
            };
        }
    }

    // Set up Creator Studio access controls
    setupCreatorStudioAccess() {
        // This will be called when Creator Studio is accessed
        if (!this.hasPermission('access_creator_studio')) {
            console.warn('Access denied: Creator Studio requires instructor role');
            return false;
        }
        return true;
    }

    // Get role-appropriate welcome message
    getWelcomeMessage() {
        if (this.isInstructor()) {
            return {
                title: 'Welcome back, Instructor!',
                subtitle: 'Create engaging lessons and track student progress',
                primaryAction: 'Open Creator Studio',
                primaryActionPage: 'creator-studio'
            };
        } else {
            return {
                title: 'Welcome back, Student!',
                subtitle: 'Continue your SAT preparation journey',
                primaryAction: 'Continue Practice',
                primaryActionPage: 'words-in-context'
            };
        }
    }

    // Force ensure navigation toggle exists
    ensureNavigationToggle() {
        console.log('Ensuring navigation toggle exists...');

        const nav = document.querySelector('.nav-menu');
        if (!nav) {
            console.error('Navigation menu not found!');
            return;
        }

        // Remove any existing toggle to avoid duplicates
        const existing = document.getElementById('navRoleToggle');
        if (existing) {
            console.log('Removing existing navigation toggle');
            existing.remove();
        }

        // Create new toggle
        console.log('Creating fresh navigation role toggle...');
        const toggleContainer = document.createElement('div');
        toggleContainer.className = 'role-toggle-container';

        const roleToggle = document.createElement('button');
        roleToggle.id = 'navRoleToggle';
        roleToggle.className = 'role-toggle-btn';
        roleToggle.textContent = `Switch to ${this.isInstructor() ? 'Student' : 'Instructor'}`;
        roleToggle.style.cssText = `
            padding: 8px 16px;
            background: #3b82f6;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            margin-left: 16px;
        `;

        roleToggle.addEventListener('click', () => {
            console.log('Navigation role toggle clicked!');
            this.toggleRole();
        });

        toggleContainer.appendChild(roleToggle);
        nav.appendChild(toggleContainer);

        console.log('Navigation toggle created and added');

        // Also ensure settings toggle works
        this.ensureSettingsToggle();
    }

    // Ensure settings toggle works
    ensureSettingsToggle() {
        console.log('Ensuring settings toggle works...');
        const settingsToggle = document.getElementById('roleToggle');
        if (settingsToggle) {
            console.log('Found settings toggle, attaching click handler');
            settingsToggle.onclick = (e) => {
                e.preventDefault();
                console.log('Settings role toggle clicked!');
                this.toggleRole();
            };
            // Update text
            settingsToggle.textContent = `Switch to ${this.isInstructor() ? 'Student' : 'Instructor'}`;
        } else {
            console.log('Settings toggle not found yet');
        }
    }
}

// Initialize role manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing role manager...');
    if (!window.roleManager) {
        window.roleManager = new RoleManager();

        // Initialize role features after a brief delay to ensure DOM is ready
        setTimeout(() => {
            console.log('Setting up role features...');
            window.roleManager.initializeRoleFeatures();

            // Force create navigation toggle if it doesn't exist
            setTimeout(() => {
                window.roleManager.ensureNavigationToggle();
            }, 200);
        }, 100);
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RoleManager;
}

// Manual helpers for debugging
window.debugRoles = {
    switchToInstructor: () => {
        console.log('Manually switching to instructor...');
        if (window.roleManager) {
            window.roleManager.setRole('instructor');
            console.log('Switched to instructor mode');
        } else {
            console.error('Role manager not found');
        }
    },
    switchToStudent: () => {
        console.log('Manually switching to student...');
        if (window.roleManager) {
            window.roleManager.setRole('student');
            console.log('Switched to student mode');
        } else {
            console.error('Role manager not found');
        }
    },
    forceCreateToggle: () => {
        console.log('Manually creating toggle...');
        if (window.roleManager) {
            window.roleManager.ensureNavigationToggle();
        } else {
            console.error('Role manager not found');
        }
    },
    getCurrentRole: () => {
        if (window.roleManager) {
            const role = window.roleManager.getCurrentRole();
            console.log('Current role:', role);
            return role;
        } else {
            console.error('Role manager not found');
        }
    }
};