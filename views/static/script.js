/* ===== CYBER CLUB WEBSITE - DARK THEME JAVASCRIPT ===== */

// Global State Management
class AppState {
    constructor() {
        this.user = null;
        this.projects = [];
        this.notifications = [];
        this.isAuthenticated = false;
        this.currentView = 'home';
        this.config = {};
    }

    setUser(user) {
        this.user = user;
        this.isAuthenticated = !!user;
        this.saveToLocalStorage();
        this.notifyStateChange();
    }

    setProjects(projects) {
        this.projects = projects;
        this.notifyStateChange();
    }

    addNotification(notification) {
        this.notifications.unshift(notification);
        this.notifyStateChange();
    }

    removeNotification(id) {
        this.notifications = this.notifications.filter(n => n.id !== id);
        this.notifyStateChange();
    }

    saveToLocalStorage() {
        localStorage.setItem('cyberclub_user', JSON.stringify(this.user));
        localStorage.setItem('cyberclub_auth', this.isAuthenticated);
    }

    loadFromLocalStorage() {
        const savedUser = localStorage.getItem('cyberclub_user');
        const savedAuth = localStorage.getItem('cyberclub_auth');
        
        if (savedUser && savedAuth === 'true') {
            this.user = JSON.parse(savedUser);
            this.isAuthenticated = true;
        }
    }

    notifyStateChange() {
        document.dispatchEvent(new CustomEvent('appStateChanged', { 
            detail: { state: this } 
        }));
    }
}

// Initialize global state
const appState = new AppState();

// Utility Functions
const utils = {
    // DOM helpers
    $: (selector) => document.querySelector(selector),
    $$: (selector) => document.querySelectorAll(selector),
    
    // Create element with attributes and children
    createElement: (tag, attributes = {}, children = []) => {
        const element = document.createElement(tag);
        
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'innerHTML') {
                element.innerHTML = value;
            } else if (key.startsWith('data-')) {
                element.setAttribute(key, value);
            } else {
                element[key] = value;
            }
        });
        
        children.forEach(child => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
    } else {
                element.appendChild(child);
            }
        });
        
        return element;
    },

    // Format date
    formatDate: (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },

    // Debounce function
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Truncate text
    truncateText: (text, maxLength) => {
        if (text.length <= maxLength) return text;
        return text.substr(0, maxLength) + '...';
    },

    // Get category color and icon
    getCategoryInfo: (category) => {
        const categoryMap = {
            'web-development': { color: '#6366f1', icon: '🌐', name: 'Web Dev' },
            'ai-ml': { color: '#8b5cf6', icon: '🤖', name: 'AI/ML' },
            'mobile-app': { color: '#10b981', icon: '📱', name: 'Mobile' },
            'data-science': { color: '#f59e0b', icon: '📊', name: 'Data Science' },
            'cybersecurity': { color: '#ef4444', icon: '🔒', name: 'Security' },
            'blockchain': { color: '#6366f1', icon: '⛓️', name: 'Blockchain' },
            'iot': { color: '#06b6d4', icon: '🔗', name: 'IoT' },
            'game-dev': { color: '#f97316', icon: '🎮', name: 'Game Dev' },
            'cloud-computing': { color: '#84cc16', icon: '☁️', name: 'Cloud' },
            'robotics': { color: '#ec4899', icon: '🤖', name: 'Robotics' },
            'other': { color: '#6b7280', icon: '⚡', name: 'Other' }
        };
        return categoryMap[category] || categoryMap.other;
    }
};

// Enhanced Notification System for Dark Theme
class NotificationManager {
    constructor() {
        this.container = null;
        this.init();
    }

    init() {
        this.container = utils.createElement('div', {
            id: 'notification-container',
            style: `
                position: fixed; 
                top: 20px; 
                right: 20px; 
                z-index: 10000; 
                max-width: 400px;
                pointer-events: none;
            `
        });
        document.body.appendChild(this.container);
    }

    show(message, type = 'info', duration = 5000) {
        const id = Date.now().toString();
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#6366f1'
        };

        const notification = utils.createElement('div', {
            className: `notification ${type}`,
            style: `
                background: #1e293b;
                border: 1px solid #334155;
                border-left: 4px solid ${colors[type]};
                color: #f8fafc;
                padding: 16px;
                margin-bottom: 12px;
                border-radius: 12px;
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 10px 10px -5px rgba(0, 0, 0, 0.5);
                transform: translateX(420px);
                transition: all 0.3s ease;
                opacity: 0;
                pointer-events: auto;
                backdrop-filter: blur(10px);
            `,
            innerHTML: `
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <div style="display: flex; align-items: center;">
                        <span style="margin-right: 12px; font-size: 18px;">${icons[type]}</span>
                        <span style="color: #cbd5e1; font-weight: 500; font-size: 14px;">${message}</span>
                    </div>
                    <button class="notification-close" style="
                        margin-left: 16px; 
                        background: none; 
                        border: none; 
                        color: #94a3b8; 
                        cursor: pointer; 
                        font-size: 20px; 
                        padding: 4px;
                        border-radius: 4px;
                        transition: all 0.2s ease;
                    ">×</button>
                </div>
            `
        });

        // Add hover effects
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('mouseenter', () => {
            closeBtn.style.backgroundColor = '#334155';
            closeBtn.style.color = '#f8fafc';
        });
        closeBtn.addEventListener('mouseleave', () => {
            closeBtn.style.backgroundColor = 'transparent';
            closeBtn.style.color = '#94a3b8';
        });

        // Add event listener for close button
        closeBtn.addEventListener('click', () => {
            this.hide(notification);
        });

        this.container.appendChild(notification);

        // Animate in
        requestAnimationFrame(() => {
            notification.style.transform = 'translateX(0)';
            notification.style.opacity = '1';
        });

        // Auto-hide after duration
        if (duration > 0) {
            setTimeout(() => {
                this.hide(notification);
            }, duration);
        }

        return notification;
    }

    hide(notification) {
        notification.style.transform = 'translateX(420px)';
        notification.style.opacity = '0';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }
}

// API Manager
class ApiManager {
    constructor() {
        this.baseURL = '';
        this.token = localStorage.getItem('auth_token');
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        if (this.token) {
            config.headers['Authorization'] = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(url, config);
            
            if (response.status === 401) {
                this.handleUnauthorized();
                throw new Error('Unauthorized');
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `HTTP ${response.status}`);
            }

            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            }
            
            return await response.text();
        } catch (error) {
            console.error(`API Error (${endpoint}):`, error);
            throw error;
        }
    }

    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }

    setToken(token) {
        this.token = token;
        localStorage.setItem('auth_token', token);
    }

    clearToken() {
        this.token = null;
        localStorage.removeItem('auth_token');
    }

    handleUnauthorized() {
        this.clearToken();
        appState.setUser(null);
        window.location.reload();
    }
}

// Google Authentication Manager
class GoogleAuthManager {
    constructor() {
        this.isInitialized = false;
        this.clientId = null;
    }

    async initialize() {
        try {
            // Load config from API
            const config = await api.get('/api/config');
            this.clientId = config.google_client_id;
            
            if (!this.clientId) {
                console.warn('Google Client ID not configured');
                return false;
            }

            // Load Google Identity Services
            await this.loadGoogleScript();
            
            // Initialize Google Sign-In
            window.google.accounts.id.initialize({
                client_id: this.clientId,
                callback: this.handleCredentialResponse.bind(this),
                auto_select: false,
                cancel_on_tap_outside: false
            });

            this.isInitialized = true;
            return true;
        } catch (error) {
            console.error('Failed to initialize Google Auth:', error);
            return false;
        }
    }

    loadGoogleScript() {
        return new Promise((resolve, reject) => {
            if (window.google) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    async handleCredentialResponse(response) {
        const loadingNotification = notifications.show('Signing in with Google...', 'info', 0);
        try {
            const result = await api.post('/auth/google-login', {
                credential: response.credential
            });

            if (result.access_token) {
                api.setToken(result.access_token);
                
                // Get user info to confirm
                await api.get('/user/me');
                
                if(loadingNotification) notifications.hide(loadingNotification);
                notifications.show('Successfully signed in! Welcome back! 🎉', 'success');
                
                // Refresh page to reset state and show user info
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
                
            } else {
                throw new Error('No access token received');
            }
        } catch (error) {
            console.error('Google sign-in error:', error);
            if(loadingNotification) notifications.hide(loadingNotification);
            notifications.show(`Sign-in failed: ${error.message || 'Please try again.'}`, 'error');
        }
    }

    showSignInButton() {
        if (!this.isInitialized) {
            console.warn('Google Auth not initialized, deferring button render.');
            return;
        }

        const authContainer = utils.$('#auth-container');
        if (authContainer) {
            if (!this.clientId) {
                authContainer.innerHTML = `
                    <div style="
                        padding: 10px 16px; 
                        background: var(--bg-secondary); 
                        color: var(--text-muted); 
                        text-align: center; 
                        font-size: 13px; 
                        border: 1px solid var(--border-color); 
                        border-radius: var(--border-radius); 
                        max-width: 280px; 
                        margin: 0 auto;
                        cursor: not-allowed;
                    ">
                        Google Sign-In is not configured
                    </div>`;
                return;
            }

            authContainer.innerHTML = '';
            
            const buttonContainer = utils.createElement('div', {
                id: 'google-signin-button'
            });
            
            authContainer.appendChild(buttonContainer);
            
            window.google.accounts.id.renderButton(buttonContainer, {
                theme: 'filled_black',
                size: 'large',
                text: 'signin_with',
                shape: 'rectangular',
                logo_alignment: 'left',
                width: 280
            });
        }
    }

    async signOut() {
        try {
            // Sign out from Google
            if (window.google && window.google.accounts) {
                window.google.accounts.id.disableAutoSelect();
            }
            
            // Clear local auth
            api.clearToken();
            appState.setUser(null);
            
            notifications.show('Successfully signed out', 'success');
            
            // Refresh page to reset state
            setTimeout(() => {
                window.location.reload();
            }, 1000);
            
        } catch (error) {
            console.error('Sign out error:', error);
            notifications.show('Error signing out', 'error');
        }
    }

    updateUI() {
        const authContainer = utils.$('#auth-container');
        const userInfo = utils.$('#user-info');
        
        if (appState.isAuthenticated && appState.user) {
            // Hide auth container
            if (authContainer) authContainer.style.display = 'none';
            
            // Show user info
            if (userInfo) {
                userInfo.style.display = 'flex';
                this.renderUserInfo();
            }
            } else {
            // Show auth container
            if (authContainer) {
                authContainer.style.display = 'block';
                this.showSignInButton();
            }
            
            // Hide user info
            if (userInfo) userInfo.style.display = 'none';
        }
    }

    renderUserInfo() {
        const userInfo = utils.$('#user-info');
        if (!userInfo || !appState.user) return;

        userInfo.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <div style="
                    width: 32px; 
                    height: 32px; 
                    border-radius: 50%; 
                    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                    display: flex; 
                    align-items: center; 
                    justify-content: center;
                    color: white;
                    font-weight: 600;
                    font-size: 14px;
                ">
                    ${appState.user.name.charAt(0).toUpperCase()}
                </div>
                <span style="color: #cbd5e1; font-weight: 500; font-size: 14px;">
                    ${appState.user.name}
                </span>
                <button onclick="googleAuth.signOut()" style="
                    background: #374151; 
                    color: #cbd5e1; 
                    border: 1px solid #4b5563; 
                    padding: 6px 12px; 
                    border-radius: 6px; 
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                " onmouseover="this.style.background='#4b5563'" onmouseout="this.style.background='#374151'">
                    Sign Out
                </button>
            </div>
        `;
    }
}

// Enhanced Project Manager for Dark Theme
class ProjectManager {
    constructor() {
        this.projects = [];
        this.filteredProjects = [];
        this.currentFilter = 'all';
        this.searchQuery = '';
    }

    async loadProjects() {
        try {
            const projects = await api.get('/projects/');
            this.projects = projects;
            this.filteredProjects = projects;
            appState.setProjects(projects);
            this.renderProjects();
        } catch (error) {
            console.error('Error loading projects:', error);
            notifications.show('Failed to load projects', 'error');
        }
    }

    async createProject(projectData) {
        try {
            const newProject = await api.post('/projects/', projectData);
            notifications.show('Project created successfully! 🎉', 'success');
            this.loadProjects(); // Refresh list
            return newProject;
        } catch (error) {
            console.error('Error creating project:', error);
            notifications.show(`Failed to create project: ${error.message}`, 'error');
            throw error;
        }
    }

    async applyToProject(projectId, applicationData) {
        try {
            const result = await api.post(`/projects/${projectId}/apply`, applicationData);
            notifications.show('Application submitted successfully! 🎉', 'success');
            return result;
        } catch (error) {
            console.error('Error applying to project:', error);
            notifications.show(`Failed to submit application: ${error.message}`, 'error');
            throw error;
        }
    }

    renderProjects() {
        const container = utils.$('#projects-container');
        if (!container) return;

        if (this.filteredProjects.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 60px 20px; color: #94a3b8;">
                    <div style="font-size: 64px; margin-bottom: 16px; opacity: 0.5;">🔍</div>
                    <h3 style="color: #cbd5e1; margin-bottom: 8px;">No projects found</h3>
                    <p style="color: #94a3b8;">Try adjusting your search or filter criteria</p>
                </div>
            `;
            return;
        }

        const projectsHTML = this.filteredProjects.map(project => 
            this.createProjectCard(project)
        ).join('');

        container.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 24px;">
                ${projectsHTML}
            </div>
        `;
    }

    createProjectCard(project) {
        const categoryInfo = utils.getCategoryInfo(project.category);
        const isRecruiting = project.is_recruiting ? 
            '<span style="color: #10b981; font-size: 12px;">🟢 Recruiting</span>' : 
            '<span style="color: #94a3b8; font-size: 12px;">⭕ Closed</span>';

        return `
            <div class="project-card" style="
                background: #1e293b;
                border: 1px solid #334155;
                border-radius: 16px;
                padding: 24px;
                transition: all 0.3s ease;
                position: relative;
                overflow: hidden;
                cursor: pointer;
            " onclick="projectManager.viewProject(${project.id})"
            onmouseover="this.style.transform='translateY(-4px)'; this.style.borderColor='#6366f1'; this.style.boxShadow='0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 0 30px rgba(99, 102, 241, 0.3)'"
            onmouseout="this.style.transform='translateY(0)'; this.style.borderColor='#334155'; this.style.boxShadow='0 4px 6px -1px rgba(0, 0, 0, 0.4)'">
                
                <div style="position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);"></div>
                
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
                    <div>
                        <h3 style="color: #f8fafc; margin: 0 0 8px 0; font-size: 18px; font-weight: 600;">
                            ${project.title}
                        </h3>
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <span style="
                                background: ${categoryInfo.color}20;
                                color: ${categoryInfo.color};
                                padding: 4px 8px;
                                border-radius: 6px;
                                font-size: 12px;
                                font-weight: 500;
                                display: flex;
                                align-items: center;
                                gap: 4px;
                            ">
                                ${categoryInfo.icon} ${categoryInfo.name}
                            </span>
                            ${isRecruiting}
                        </div>
                    </div>
                </div>
                
                <p style="color: #cbd5e1; margin-bottom: 20px; line-height: 1.6; font-size: 14px;">
                    ${utils.truncateText(project.description, 120)}
                </p>
                
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; align-items: center; gap: 16px; font-size: 12px; color: #94a3b8;">
                        <span>👥 ${project.max_members || 5} max</span>
                        <span>👀 ${project.views || 0}</span>
                        <span>❤️ ${project.likes || 0}</span>
                    </div>
                    <div style="font-size: 12px; color: #94a3b8;">
                        ${utils.formatDate(project.created_at)}
                    </div>
                </div>
                
                ${appState.isAuthenticated && project.is_recruiting ? `
                    <button onclick="event.stopPropagation(); projectManager.openApplicationModal(${project.id})" style="
                        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 8px;
                        font-weight: 500;
                        font-size: 14px;
                        cursor: pointer;
                        margin-top: 16px;
                        width: 100%;
                        transition: all 0.2s ease;
                    " onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
                        Apply to Join
                    </button>
                ` : ''}
            </div>
        `;
    }

    setFilter(filter) {
        this.currentFilter = filter;
        this.applyFilters();
    }

    setSearchQuery(query) {
        this.searchQuery = query.toLowerCase();
        this.applyFilters();
    }

    applyFilters() {
        this.filteredProjects = this.projects.filter(project => {
            const matchesFilter = this.currentFilter === 'all' || project.category === this.currentFilter;
            const matchesSearch = !this.searchQuery || 
                project.title.toLowerCase().includes(this.searchQuery) ||
                project.description.toLowerCase().includes(this.searchQuery);
            
            return matchesFilter && matchesSearch;
        });
        
        this.renderProjects();
    }

    openApplicationModal(projectId) {
        if (!appState.isAuthenticated) {
            notifications.show('Please sign in to apply for projects', 'warning');
            return;
        }

        const project = this.projects.find(p => p.id === projectId);
        if (!project) return;

        const modal = utils.createElement('div', {
            className: 'modal active',
            style: `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(10px);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
            `,
            innerHTML: `
                <div style="
                    background: #1e293b;
                    border: 1px solid #334155;
                    border-radius: 16px;
                    padding: 32px;
                    max-width: 500px;
                    width: 90%;
                    max-height: 90vh;
                    overflow-y: auto;
                ">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                        <h2 style="color: #f8fafc; margin: 0;">Apply to ${project.title}</h2>
                        <button onclick="this.closest('.modal').remove()" style="
                            background: none;
                            border: none;
                            color: #94a3b8;
                            font-size: 24px;
                            cursor: pointer;
                            padding: 4px;
                        ">×</button>
                    </div>
                    
                    <form id="application-form">
                        <div style="margin-bottom: 20px;">
                            <label style="display: block; margin-bottom: 8px; color: #cbd5e1; font-weight: 500;">
                                Why do you want to join this project?
                            </label>
                            <textarea name="reason" required style="
                                width: 100%;
                                padding: 12px;
                                background: #0f172a;
                                border: 1px solid #334155;
                                border-radius: 8px;
                                color: #f8fafc;
                                font-size: 14px;
                                font-family: inherit;
                                resize: vertical;
                                min-height: 120px;
                            " placeholder="Tell us about your interest, relevant skills, and what you can contribute..."></textarea>
                        </div>
                        
                        <div style="display: flex; gap: 12px; justify-content: flex-end;">
                            <button type="button" onclick="this.closest('.modal').remove()" style="
                                background: #374151;
                                color: #cbd5e1;
                                border: 1px solid #4b5563;
                                padding: 10px 20px;
                                border-radius: 8px;
                                cursor: pointer;
                                font-size: 14px;
                            ">Cancel</button>
                            <button type="submit" style="
                                background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                                color: white;
                                border: none;
                                padding: 10px 20px;
                                border-radius: 8px;
                                cursor: pointer;
                                font-weight: 500;
                                font-size: 14px;
                            ">Submit Application</button>
                        </div>
                    </form>
                </div>
            `
        });

        // Handle form submission
        const form = modal.querySelector('#application-form');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const reason = formData.get('reason');

            try {
                await this.applyToProject(projectId, { 
                    project_id: projectId, 
                    reason: reason 
                });
                modal.remove();
            } catch (error) {
                // Error already handled in applyToProject
            }
        });

        document.body.appendChild(modal);
    }

    viewProject(projectId) {
        const project = this.projects.find(p => p.id === projectId);
        if (!project) return;

        const categoryInfo = utils.getCategoryInfo(project.category);
        
        const modal = utils.createElement('div', {
            className: 'modal active',
            style: `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(10px);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
            `,
            innerHTML: `
                <div style="
                    background: #1e293b;
                    border: 1px solid #334155;
                    border-radius: 16px;
                    padding: 32px;
                    max-width: 600px;
                    width: 90%;
                    max-height: 90vh;
                    overflow-y: auto;
                ">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px;">
                        <div>
                            <h1 style="color: #f8fafc; margin: 0 0 12px 0; font-size: 24px;">${project.title}</h1>
                            <div style="display: flex; align-items: center; gap: 12px;">
                                <span style="
                                    background: ${categoryInfo.color}20;
                                    color: ${categoryInfo.color};
                                    padding: 6px 12px;
                                    border-radius: 8px;
                                    font-size: 14px;
                                    font-weight: 500;
                                    display: flex;
                                    align-items: center;
                                    gap: 6px;
                                ">
                                    ${categoryInfo.icon} ${categoryInfo.name}
                                </span>
                                <span style="color: ${project.is_recruiting ? '#10b981' : '#94a3b8'}; font-size: 14px;">
                                    ${project.is_recruiting ? '🟢 Recruiting' : '⭕ Closed'}
                                </span>
                            </div>
                        </div>
                        <button onclick="this.closest('.modal').remove()" style="
                            background: none;
                            border: none;
                            color: #94a3b8;
                            font-size: 24px;
                            cursor: pointer;
                            padding: 4px;
                        ">×</button>
                    </div>
                    
                    <div style="margin-bottom: 24px;">
                        <h3 style="color: #cbd5e1; margin-bottom: 12px;">Description</h3>
                        <p style="color: #94a3b8; line-height: 1.6;">${project.description}</p>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; margin-bottom: 24px;">
                        <div style="background: #0f172a; padding: 16px; border-radius: 8px; text-align: center;">
                            <div style="color: #6366f1; font-size: 24px; margin-bottom: 4px;">👥</div>
                            <div style="color: #cbd5e1; font-size: 12px;">Max Members</div>
                            <div style="color: #f8fafc; font-weight: 600;">${project.max_members || 5}</div>
                        </div>
                        <div style="background: #0f172a; padding: 16px; border-radius: 8px; text-align: center;">
                            <div style="color: #6366f1; font-size: 24px; margin-bottom: 4px;">👀</div>
                            <div style="color: #cbd5e1; font-size: 12px;">Views</div>
                            <div style="color: #f8fafc; font-weight: 600;">${project.views || 0}</div>
                        </div>
                        <div style="background: #0f172a; padding: 16px; border-radius: 8px; text-align: center;">
                            <div style="color: #6366f1; font-size: 24px; margin-bottom: 4px;">❤️</div>
                            <div style="color: #cbd5e1; font-size: 12px;">Likes</div>
                            <div style="color: #f8fafc; font-weight: 600;">${project.likes || 0}</div>
                        </div>
                        <div style="background: #0f172a; padding: 16px; border-radius: 8px; text-align: center;">
                            <div style="color: #6366f1; font-size: 24px; margin-bottom: 4px;">📅</div>
                            <div style="color: #cbd5e1; font-size: 12px;">Created</div>
                            <div style="color: #f8fafc; font-weight: 600; font-size: 11px;">${utils.formatDate(project.created_at)}</div>
                        </div>
                    </div>
                    
                    ${appState.isAuthenticated && project.is_recruiting ? `
                        <button onclick="event.stopPropagation(); this.closest('.modal').remove(); projectManager.openApplicationModal(${project.id})" style="
                            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                            color: white;
                            border: none;
                            padding: 12px 24px;
                            border-radius: 8px;
                            font-weight: 500;
                            font-size: 16px;
                            cursor: pointer;
                            width: 100%;
                            transition: all 0.2s ease;
                        ">
                            Apply to Join This Project
                        </button>
                    ` : ''}
                </div>
            `
        });

        document.body.appendChild(modal);
    }
}

// Initialize managers
const notifications = new NotificationManager();
const api = new ApiManager();
const googleAuth = new GoogleAuthManager();
const projectManager = new ProjectManager();

// Global functions for HTML onclick handlers
function signInWithGoogle() {
    googleAuth.showSignInButton();
}

function showMessage(message, type = 'info') {
    notifications.show(message, type);
}

function toggleMobileMenu() {
    const menu = utils.$('.nav-menu');
    if (menu) {
        menu.style.display = menu.style.display === 'flex' ? 'none' : 'flex';
    }
}

// Application initialization
async function initializeApp() {
    try {
        console.log('🚀 Initializing Cyber Club App...');
        
        // Load saved state
        appState.loadFromLocalStorage();
        
        // Initialize Google Auth
        const googleInitialized = await googleAuth.initialize();
        if (!googleInitialized) {
            console.warn('Google Auth initialization failed');
        }
        
        // Load initial data
        await loadInitialData();
        
        // Setup event listeners
        setupEventListeners();
        
        // Update UI based on auth state
        googleAuth.updateUI();
        
        console.log('✅ App initialized successfully');
        
    } catch (error) {
        console.error('❌ App initialization failed:', error);
        notifications.show('Failed to initialize app', 'error');
    }
}

function setupEventListeners() {
    // App state changes
    document.addEventListener('appStateChanged', (event) => {
        googleAuth.updateUI();
    });
    
    // Scroll effects for navbar
    let lastScrollY = window.scrollY;
    window.addEventListener('scroll', () => {
        const navbar = utils.$('.navbar');
        if (navbar) {
            if (window.scrollY > 100) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }
        lastScrollY = window.scrollY;
    });
    
    // Search functionality
    const searchInput = utils.$('#search-projects');
    if (searchInput) {
        searchInput.addEventListener('input', utils.debounce((e) => {
            projectManager.setSearchQuery(e.target.value);
        }, 300));
    }
    
    // Filter functionality
    const filterButtons = utils.$$('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            projectManager.setFilter(btn.dataset.filter);
        });
    });
    
    // Close modals on background click
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.remove();
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Escape to close modals
        if (e.key === 'Escape') {
            const modal = utils.$('.modal');
            if (modal) modal.remove();
        }
        
        // Ctrl/Cmd + K for search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = utils.$('#search-projects');
            if (searchInput) searchInput.focus();
        }
    });
}

async function loadInitialData() {
    try {
        // Load projects
        await projectManager.loadProjects();
        
        // Validate existing token if present
        if (api.token && appState.isAuthenticated) {
            try {
                const userInfo = await api.get('/user/me');
                appState.setUser(userInfo);
            } catch (error) {
                console.log('Token validation failed, clearing auth state');
                api.clearToken();
                appState.setUser(null);
            }
        }
        
    } catch (error) {
        console.error('Error loading initial data:', error);
    }
}

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}



