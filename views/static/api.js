// Backend API Integration for Cyber Club - Google Auth Only
// Global variables
let isLoggedIn = false;
let currentUser = null;
let authToken = null;

// API functions
const API_BASE = window.location.origin;

async function apiRequest(endpoint, options = {}) {
    const defaultHeaders = {
        'Content-Type': 'application/json',
    };
    
    if (authToken) {
        defaultHeaders['Authorization'] = `Bearer ${authToken}`;
    }
    
    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Request failed');
    }
    
    return response.json();
}

// Google Authentication function
async function handleGoogleSignIn(user) {
    try {
        const response = await apiRequest('/auth/google-login', {
            method: 'POST',
            body: JSON.stringify({
                email: user.email,
                name: user.displayName,
                google_id: user.uid
            }),
        });
        
        authToken = response.access_token;
        currentUser = response.user;
        isLoggedIn = true;
        
        // Store in localStorage
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        updateUIForLogin();
        showMessage(`Welcome, ${currentUser.name}!`, 'success');
        return response;
    } catch (error) {
        console.error('Google login error:', error);
        showMessage('Login failed: ' + error.message, 'error');
        throw error;
    }
}

function logout() {
    authToken = null;
    currentUser = null;
    isLoggedIn = false;
    
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    
    updateUIForLogout();
    showMessage('Logged out successfully', 'info');
}

// Project management functions
async function loadProjects() {
    try {
        const projects = await apiRequest('/projects/');
        displayAvailableProjects(projects);
        return projects;
    } catch (error) {
        console.error('Error loading projects:', error);
        return [];
    }
}

async function createProject(projectData) {
    try {
        const project = await apiRequest('/projects/', {
            method: 'POST',
            body: JSON.stringify(projectData),
        });
        
        showMessage('Project created successfully!', 'success');
        loadMyProjects(); // Refresh the project list
        loadProjects(); // Refresh available projects
        return project;
    } catch (error) {
        console.error('Error creating project:', error);
        showMessage('Error creating project: ' + error.message, 'error');
    }
}

async function applyToProject(projectId, reason) {
    try {
        const application = await apiRequest(`/projects/${projectId}/apply`, {
            method: 'POST',
            body: JSON.stringify({
                project_id: projectId,
                reason: reason
            }),
        });
        
        showMessage('Application submitted successfully!', 'success');
        loadMyApplications(); // Refresh applications
        return application;
    } catch (error) {
        console.error('Error applying to project:', error);
        showMessage('Error applying to project: ' + error.message, 'error');
    }
}

async function loadMyProjects() {
    try {
        const projects = await apiRequest('/user/me/projects');
        displayMyProjects(projects);
        return projects;
    } catch (error) {
        console.error('Error loading my projects:', error);
        return [];
    }
}

async function loadMyApplications() {
    try {
        const applications = await apiRequest('/user/me/applications');
        displayMyApplications(applications);
        return applications;
    } catch (error) {
        console.error('Error loading my applications:', error);
        return [];
    }
}

// UI functions
function updateUIForLogin() {
    const profileIcon = document.getElementById('profile-icon');
    if (profileIcon) {
        profileIcon.style.display = 'block';
    }
    
    // Show project management section
    showProjectManagement();
    hideGoogleLoginSection();
}

function updateUIForLogout() {
    const profileIcon = document.getElementById('profile-icon');
    if (profileIcon) {
        profileIcon.style.display = 'none';
    }
    
    // Hide project management
    hideProjectManagement();
    showGoogleLoginSection();
}

function showProjectManagement() {
    let dashboard = document.getElementById('project-dashboard');
    if (dashboard) {
        dashboard.style.display = 'block';
        return;
    }
    
    const dashboardHtml = `
        <section id="project-dashboard" class="dashboard-section" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; margin: 20px 0; color: white;">
            <div style="max-width: 1200px; margin: 0 auto;">
                <h2 style="text-align: center; margin-bottom: 15px; font-size: 2.5em; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">🚀 Project Management Hub</h2>
                <p style="text-align: center; color: #f0f0f0; margin-bottom: 30px; font-size: 1.2em;">Welcome back, ${currentUser.name}! Ready to build something amazing?</p>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 25px;">
                    
                    <!-- Create Project -->
                    <div class="dashboard-card" style="background: rgba(255,255,255,0.95); padding: 25px; border-radius: 15px; box-shadow: 0 8px 16px rgba(0,0,0,0.1); backdrop-filter: blur(10px);">
                        <h3 style="color: #667eea; margin-bottom: 20px; display: flex; align-items: center; font-size: 1.4em;">
                            🎯 Create New Project
                        </h3>
                        <form id="create-project-form">
                            <input type="text" id="project-name" placeholder="Project Name" required 
                                   style="width: 100%; margin: 10px 0; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 14px; transition: border-color 0.3s;">
                            <textarea id="project-description" placeholder="Describe your amazing project idea..." required 
                                      style="width: 100%; margin: 10px 0; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; height: 100px; font-size: 14px; resize: vertical; transition: border-color 0.3s;"></textarea>
                            <select id="project-type" required 
                                    style="width: 100%; margin: 10px 0; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 14px; transition: border-color 0.3s;">
                                <option value="">🔧 Select Project Type</option>
                                <option value="web-development">🌐 Web Development</option>
                                <option value="data-science">📊 Data Science</option>
                                <option value="mobile-app">📱 Mobile App</option>
                                <option value="ai-ml">🤖 AI/Machine Learning</option>
                                <option value="cybersecurity">🔒 Cybersecurity</option>
                                <option value="iot">🌐 Internet of Things</option>
                                <option value="blockchain">⛓️ Blockchain</option>
                                <option value="game-dev">🎮 Game Development</option>
                                <option value="other">🔗 Other</option>
                            </select>
                            <button type="submit" 
                                    style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; width: 100%; font-size: 16px; font-weight: bold; margin-top: 10px; transition: transform 0.2s; box-shadow: 0 4px 8px rgba(0,0,0,0.2);"
                                    onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                                ✨ Create Project
                            </button>
                        </form>
                    </div>
                    
                    <!-- My Projects -->
                    <div class="dashboard-card" style="background: rgba(255,255,255,0.95); padding: 25px; border-radius: 15px; box-shadow: 0 8px 16px rgba(0,0,0,0.1); backdrop-filter: blur(10px);">
                        <h3 style="color: #4ecdc4; margin-bottom: 20px; display: flex; align-items: center; font-size: 1.4em;">
                            📂 My Projects
                        </h3>
                        <div id="my-projects-list" style="max-height: 300px; overflow-y: auto;">Loading...</div>
                        <button onclick="loadMyProjects()" 
                                style="background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%); color: white; border: none; padding: 10px 16px; border-radius: 8px; cursor: pointer; margin-top: 15px; width: 100%; transition: transform 0.2s;"
                                onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                            🔄 Refresh Projects
                        </button>
                    </div>
                    
                    <!-- My Applications -->
                    <div class="dashboard-card" style="background: rgba(255,255,255,0.95); padding: 25px; border-radius: 15px; box-shadow: 0 8px 16px rgba(0,0,0,0.1); backdrop-filter: blur(10px);">
                        <h3 style="color: #f7b801; margin-bottom: 20px; display: flex; align-items: center; font-size: 1.4em;">
                            📝 My Applications
                        </h3>
                        <div id="my-applications-list" style="max-height: 300px; overflow-y: auto;">Loading...</div>
                        <button onclick="loadMyApplications()" 
                                style="background: linear-gradient(135deg, #f7b801 0%, #f18701 100%); color: white; border: none; padding: 10px 16px; border-radius: 8px; cursor: pointer; margin-top: 15px; width: 100%; transition: transform 0.2s;"
                                onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                            🔄 Refresh Applications
                        </button>
                    </div>
                </div>
                
                <!-- Available Projects -->
                <div class="dashboard-card" style="background: rgba(255,255,255,0.95); padding: 25px; border-radius: 15px; box-shadow: 0 8px 16px rgba(0,0,0,0.1); margin-top: 25px; backdrop-filter: blur(10px);">
                    <h3 style="color: #e17055; margin-bottom: 20px; display: flex; align-items: center; font-size: 1.4em;">
                        🌟 Available Projects to Join
                    </h3>
                    <div id="available-projects-list">Loading...</div>
                    <button onclick="loadProjects()" 
                            style="background: linear-gradient(135deg, #e17055 0%, #d63031 100%); color: white; border: none; padding: 10px 16px; border-radius: 8px; cursor: pointer; margin-top: 15px; transition: transform 0.2s;"
                            onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                        🔄 Refresh Available Projects
                    </button>
                </div>
                
                <div style="margin-top: 30px; text-align: center;">
                    <button onclick="logout()" 
                            style="background: linear-gradient(135deg, #636e72 0%, #2d3436 100%); color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 16px; transition: transform 0.2s;"
                            onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                        👋 Logout
                    </button>
                </div>
            </div>
        </section>
    `;
    
    // Insert after the first section
    const firstSection = document.querySelector('section');
    if (firstSection) {
        firstSection.insertAdjacentHTML('afterend', dashboardHtml);
    }
    
    // Add form handler
    document.getElementById('create-project-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const projectData = {
            name: document.getElementById('project-name').value,
            description: document.getElementById('project-description').value,
            type: document.getElementById('project-type').value,
            status: 'open'
        };
        
        await createProject(projectData);
        
        // Reset form
        e.target.reset();
    });
    
    // Load initial data
    loadMyProjects();
    loadMyApplications();
    loadProjects();
}

function hideProjectManagement() {
    const dashboard = document.getElementById('project-dashboard');
    if (dashboard) {
        dashboard.style.display = 'none';
    }
}

function showGoogleLoginSection() {
    let loginSection = document.getElementById('google-login-section');
    if (loginSection) {
        loginSection.style.display = 'block';
        return;
    }
    
    const loginHtml = `
        <section id="google-login-section" style="background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%); padding: 60px 20px; margin: 20px 0; text-align: center; color: white;">
            <div style="max-width: 500px; margin: 0 auto;">
                <h2 style="font-size: 2.5em; margin-bottom: 20px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">🎓 Join Cyber Club</h2>
                <p style="margin-bottom: 40px; color: #f0f0f0; font-size: 1.2em;">Sign in with your Krea email to access exclusive projects, collaborate with peers, and showcase your skills!</p>
                
                <div style="background: rgba(255,255,255,0.15); padding: 40px; border-radius: 20px; box-shadow: 0 8px 16px rgba(0,0,0,0.2); backdrop-filter: blur(10px);">
                    <div style="margin-bottom: 30px;">
                        <img src="static/images/Cyber Club Logo.png" alt="Cyber Club" style="max-width: 120px; height: auto; border-radius: 50%; box-shadow: 0 4px 8px rgba(0,0,0,0.3);">
                    </div>
                    <h3 style="margin-bottom: 25px; color: #fff;">🚀 Ready to Start Building?</h3>
                    <div id="google-signin-button" style="display: flex; justify-content: center; margin-bottom: 20px;">
                        <!-- Google Sign-In button will be inserted here by Firebase -->
                    </div>
                    <p style="font-size: 0.9em; color: #ddd; margin-top: 20px;">
                        🔒 Only Krea University emails (@krea.edu.in, @krea.ac.in) are allowed
                    </p>
                </div>
                
                <div style="margin-top: 40px; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; text-align: center;">
                    <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px;">
                        <h4 style="color: #00cec9;">🛠️ Create Projects</h4>
                        <p style="font-size: 0.9em; color: #ddd;">Start your own projects and find collaborators</p>
                    </div>
                    <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px;">
                        <h4 style="color: #a29bfe;">🤝 Join Teams</h4>
                        <p style="font-size: 0.9em; color: #ddd;">Apply to existing projects and contribute</p>
                    </div>
                    <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px;">
                        <h4 style="color: #fd79a8;">📈 Grow Skills</h4>
                        <p style="font-size: 0.9em; color: #ddd;">Learn from peers and build your portfolio</p>
                    </div>
                </div>
            </div>
        </section>
    `;
    
    const firstSection = document.querySelector('section');
    if (firstSection) {
        firstSection.insertAdjacentHTML('afterend', loginHtml);
    }
}

function hideGoogleLoginSection() {
    const loginSection = document.getElementById('google-login-section');
    if (loginSection) {
        loginSection.style.display = 'none';
    }
}

function displayMyProjects(projects) {
    const container = document.getElementById('my-projects-list');
    if (!container) return;
    
    if (projects.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 20px; color: #999; background: #f8f9fa; border-radius: 8px;"><p>🚀 No projects yet!</p><p style="font-size: 0.9em;">Create your first project above to get started</p></div>';
        return;
    }
    
    container.innerHTML = projects.map(project => `
        <div style="border: 2px solid #e3f2fd; padding: 20px; margin: 15px 0; border-radius: 12px; background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%); box-shadow: 0 4px 8px rgba(0,0,0,0.1); transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
            <h4 style="margin: 0 0 10px 0; color: #333; display: flex; align-items: center;">
                <span style="margin-right: 10px;">${getProjectIcon(project.type)}</span>
                ${project.name}
            </h4>
            <p style="margin: 5px 0; color: #666; font-size: 14px; line-height: 1.4;">${project.description}</p>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px; flex-wrap: wrap; gap: 10px;">
                <span style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 5px 10px; border-radius: 15px; font-size: 12px; font-weight: bold;">${project.type}</span>
                <span style="background: ${getStatusColor(project.status)}; color: white; padding: 5px 10px; border-radius: 15px; font-size: 12px; font-weight: bold; text-transform: uppercase;">${project.status}</span>
            </div>
            <small style="color: #999; margin-top: 10px; display: block;">📅 Created: ${new Date(project.date).toLocaleDateString()}</small>
        </div>
    `).join('');
}

function displayMyApplications(applications) {
    const container = document.getElementById('my-applications-list');
    if (!container) return;
    
    if (applications.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 20px; color: #999; background: #f8f9fa; border-radius: 8px;"><p>📝 No applications yet!</p><p style="font-size: 0.9em;">Browse available projects below and apply to join teams</p></div>';
        return;
    }
    
    container.innerHTML = applications.map(app => {
        const statusColor = app.status === 'approved' ? '#00b894' : app.status === 'rejected' ? '#e17055' : '#f39c12';
        const statusIcon = app.status === 'approved' ? '✅' : app.status === 'rejected' ? '❌' : '⏳';
        return `
            <div style="border: 2px solid #fff3cd; padding: 20px; margin: 15px 0; border-radius: 12px; background: linear-gradient(135deg, #fff9e6 0%, #ffffff 100%); box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <h5 style="margin: 0; color: #333;">📁 Project ID: ${app.project_id}</h5>
                    <span style="background: ${statusColor}; color: white; padding: 5px 10px; border-radius: 15px; font-size: 12px; font-weight: bold; display: flex; align-items: center; gap: 5px;">
                        ${statusIcon} ${app.status.toUpperCase()}
                    </span>
                </div>
                <p style="margin: 10px 0; color: #666; font-style: italic; background: #f8f9fa; padding: 10px; border-radius: 6px;">"${app.reason}"</p>
                <small style="color: #999;">📅 Applied: ${new Date(app.applied_date).toLocaleDateString()}</small>
            </div>
        `;
    }).join('');
}

function displayAvailableProjects(projects) {
    const container = document.getElementById('available-projects-list');
    if (!container) return;
    
    // Filter out user's own projects
    const availableProjects = projects.filter(project => project.user_id !== (currentUser ? currentUser.id : null));
    
    if (availableProjects.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 40px; color: #999; background: #f8f9fa; border-radius: 12px;"><h4>🌟 No available projects</h4><p>Be the first to create an exciting project for others to join!</p></div>';
        return;
    }
    
    container.innerHTML = availableProjects.map(project => `
        <div style="border: 2px solid #e8f5e8; padding: 25px; margin: 20px 0; border-radius: 15px; background: linear-gradient(135deg, #f1f8e9 0%, #ffffff 100%); box-shadow: 0 6px 12px rgba(0,0,0,0.1); transition: transform 0.3s;" onmouseover="this.style.transform='translateY(-3px)'" onmouseout="this.style.transform='translateY(0)'">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px; flex-wrap: wrap; gap: 15px;">
                <h4 style="margin: 0; color: #2d3436; display: flex; align-items: center; font-size: 1.3em;">
                    <span style="margin-right: 12px; font-size: 1.5em;">${getProjectIcon(project.type)}</span>
                    ${project.name}
                </h4>
                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                    <span style="background: linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%); color: white; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;">${project.type}</span>
                    <span style="background: ${getStatusColor(project.status)}; color: white; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase;">${project.status}</span>
                </div>
            </div>
            <p style="margin: 15px 0; color: #636e72; line-height: 1.5; font-size: 15px;">${project.description}</p>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 20px; flex-wrap: wrap; gap: 15px;">
                <small style="color: #74b9ff; font-weight: bold;">📅 Created: ${new Date(project.date).toLocaleDateString()}</small>
                <button onclick="showApplicationModal(${project.id}, '${project.name.replace(/'/g, "\\'")}', '${project.type}')" 
                        style="background: linear-gradient(135deg, #00b894 0%, #00cec9 100%); color: white; border: none; padding: 12px 24px; border-radius: 25px; cursor: pointer; font-weight: bold; transition: all 0.3s; box-shadow: 0 4px 8px rgba(0,184,148,0.3);"
                        onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 6px 12px rgba(0,184,148,0.4)'" 
                        onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 8px rgba(0,184,148,0.3)'">
                    🚀 Apply to Join
                </button>
            </div>
        </div>
    `).join('');
}

function getProjectIcon(type) {
    const icons = {
        'web-development': '🌐',
        'data-science': '📊',
        'mobile-app': '📱',
        'ai-ml': '🤖',
        'cybersecurity': '🔒',
        'iot': '🌐',
        'blockchain': '⛓️',
        'game-dev': '🎮',
        'other': '🔗'
    };
    return icons[type] || '🔗';
}

function getStatusColor(status) {
    const colors = {
        'open': '#00b894',
        'closed': '#e17055',
        'in-progress': '#f39c12',
        'completed': '#6c5ce7'
    };
    return colors[status] || '#74b9ff';
}

function showApplicationModal(projectId, projectName, projectType) {
    const modalHtml = `
        <div id="application-modal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 1000; display: flex; justify-content: center; align-items: center; backdrop-filter: blur(5px);">
            <div style="background: white; padding: 40px; border-radius: 20px; max-width: 600px; width: 90%; box-shadow: 0 20px 40px rgba(0,0,0,0.3); position: relative;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h3 style="margin: 0 0 10px 0; color: #2d3436; font-size: 1.8em;">
                        ${getProjectIcon(projectType)} Apply to "${projectName}"
                    </h3>
                    <p style="color: #636e72; margin: 0;">Tell us why you'd be a great addition to this project!</p>
                </div>
                
                <form id="application-form">
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; color: #2d3436; font-weight: bold;">Why do you want to join this project?</label>
                        <textarea id="application-reason" 
                                  placeholder="Share your motivation, relevant skills, experience, and what you hope to contribute to this project..." 
                                  required 
                                  style="width: 100%; height: 150px; margin: 0; padding: 15px; border: 2px solid #ddd; border-radius: 10px; resize: vertical; font-family: inherit; font-size: 14px; line-height: 1.5; transition: border-color 0.3s;"
                                  onmouseover="this.style.borderColor='#74b9ff'" 
                                  onmouseout="this.style.borderColor='#ddd'"
                                  onfocus="this.style.borderColor='#0984e3'"
                                  onblur="this.style.borderColor='#ddd'"></textarea>
                    </div>
                    
                    <div style="display: flex; gap: 15px; justify-content: flex-end; margin-top: 30px;">
                        <button type="button" onclick="closeApplicationModal()" 
                                style="background: #636e72; color: white; border: none; padding: 12px 24px; border-radius: 10px; cursor: pointer; font-size: 16px; transition: all 0.3s;"
                                onmouseover="this.style.background='#2d3436'" 
                                onmouseout="this.style.background='#636e72'">
                            Cancel
                        </button>
                        <button type="submit" 
                                style="background: linear-gradient(135deg, #00b894 0%, #00cec9 100%); color: white; border: none; padding: 12px 24px; border-radius: 10px; cursor: pointer; font-size: 16px; font-weight: bold; transition: all 0.3s; box-shadow: 0 4px 8px rgba(0,184,148,0.3);"
                                onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 12px rgba(0,184,148,0.4)'" 
                                onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 8px rgba(0,184,148,0.3)'">
                            🚀 Submit Application
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    document.getElementById('application-reason').focus();
    
    document.getElementById('application-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const reason = document.getElementById('application-reason').value;
        
        try {
            await applyToProject(projectId, reason);
            closeApplicationModal();
            loadMyApplications(); // Refresh applications
        } catch (error) {
            // Error already handled in applyToProject
        }
    });
}

function closeApplicationModal() {
    const modal = document.getElementById('application-modal');
    if (modal) {
        modal.remove();
    }
}

function showMessage(message, type = 'info') {
    const colors = {
        'success': '#00b894',
        'error': '#e17055',
        'info': '#74b9ff'
    };
    
    const icons = {
        'success': '✅',
        'error': '❌',
        'info': 'ℹ️'
    };
    
    const messageHtml = `
        <div id="message-toast" style="position: fixed; top: 20px; right: 20px; padding: 15px 20px; border-radius: 10px; color: white; z-index: 1001; 
             background: ${colors[type]}; box-shadow: 0 4px 8px rgba(0,0,0,0.2); display: flex; align-items: center; gap: 10px; max-width: 400px; animation: slideIn 0.3s ease-out;">
            <span style="font-size: 18px;">${icons[type]}</span>
            <span>${message}</span>
        </div>
        <style>
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        </style>
    `;
    
    document.body.insertAdjacentHTML('beforeend', messageHtml);
    
    setTimeout(() => {
        const toast = document.getElementById('message-toast');
        if (toast) {
            toast.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => toast.remove(), 300);
        }
    }, 4000);
}

// Override the existing Google Sign-In function to integrate with our backend
window.originalSignInWithGoogle = window.signInWithGoogle;
window.signInWithGoogle = function() {
    // This will be called by the existing Firebase setup
    // We'll handle the response in a Firebase auth state listener
    if (window.originalSignInWithGoogle) {
        window.originalSignInWithGoogle();
    }
};

// Check for existing session on page load
document.addEventListener('DOMContentLoaded', function() {
    // Check for stored authentication
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('currentUser');
    
    if (storedToken && storedUser) {
        authToken = storedToken;
        currentUser = JSON.parse(storedUser);
        isLoggedIn = true;
        updateUIForLogin();
    } else {
        showGoogleLoginSection();
    }
});

// Expose functions globally
window.loadProjects = loadProjects;
window.loadMyProjects = loadMyProjects;
window.loadMyApplications = loadMyApplications;
window.logout = logout;
window.showApplicationModal = showApplicationModal;
window.closeApplicationModal = closeApplicationModal;
window.handleGoogleSignIn = handleGoogleSignIn; 