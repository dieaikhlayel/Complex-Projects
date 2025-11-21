// API Service for Backend Communication
class ApiService {
    constructor() {
        this.baseURL = 'https://api.collabcode.com/v1';
        this.token = localStorage.getItem('collabcode_token');
        this.isOnline = navigator.onLine;
        
        this.init();
    }
    
    init() {
        // Listen for online/offline events
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.syncOfflineChanges();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
        });
    }
    
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
                ...options.headers
            },
            ...options
        };
        
        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }
    
    // Authentication endpoints
    async login(email, password) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    }
    
    async register(userData) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }
    
    async logout() {
        return this.request('/auth/logout', {
            method: 'POST'
        });
    }
    
    async refreshToken() {
        return this.request('/auth/refresh', {
            method: 'POST'
        });
    }
    
    // Project endpoints
    async createProject(projectData) {
        return this.request('/projects', {
            method: 'POST',
            body: JSON.stringify(projectData)
        });
    }
    
    async getProjects() {
        return this.request('/projects');
    }
    
    async getProject(projectId) {
        return this.request(`/projects/${projectId}`);
    }
    
    async updateProject(projectId, updates) {
        return this.request(`/projects/${projectId}`, {
            method: 'PUT',
            body: JSON.stringify(updates)
        });
    }
    
    async deleteProject(projectId) {
        return this.request(`/projects/${projectId}`, {
            method: 'DELETE'
        });
    }
    
    // File endpoints
    async getFiles(projectId) {
        return this.request(`/projects/${projectId}/files`);
    }
    
    async createFile(projectId, fileData) {
        return this.request(`/projects/${projectId}/files`, {
            method: 'POST',
            body: JSON.stringify(fileData)
        });
    }
    
    async updateFile(projectId, fileId, content) {
        return this.request(`/projects/${projectId}/files/${fileId}`, {
            method: 'PUT',
            body: JSON.stringify({ content })
        });
    }
    
    async deleteFile(projectId, fileId) {
        return this.request(`/projects/${projectId}/files/${fileId}`, {
            method: 'DELETE'
        });
    }
    
    // Collaboration endpoints
    async inviteUser(projectId, email, role = 'collaborator') {
        return this.request(`/projects/${projectId}/invite`, {
            method: 'POST',
            body: JSON.stringify({ email, role })
        });
    }
    
    async getCollaborators(projectId) {
        return this.request(`/projects/${projectId}/collaborators`);
    }
    
    async removeCollaborator(projectId, userId) {
        return this.request(`/projects/${projectId}/collaborators/${userId}`, {
            method: 'DELETE'
        });
    }
    
    // Git endpoints
    async getCommits(projectId, branch = 'main') {
        return this.request(`/projects/${projectId}/commits?branch=${branch}`);
    }
    
    async createCommit(projectId, commitData) {
        return this.request(`/projects/${projectId}/commits`, {
            method: 'POST',
            body: JSON.stringify(commitData)
        });
    }
    
    async getBranches(projectId) {
        return this.request(`/projects/${projectId}/branches`);
    }
    
    async createBranch(projectId, branchData) {
        return this.request(`/projects/${projectId}/branches`, {
            method: 'POST',
            body: JSON.stringify(branchData)
        });
    }
    
    // Deployment endpoints
    async deployProject(projectId, config) {
        return this.request(`/projects/${projectId}/deploy`, {
            method: 'POST',
            body: JSON.stringify(config)
        });
    }
    
    async getDeployments(projectId) {
        return this.request(`/projects/${projectId}/deployments`);
    }
    
    // Real-time collaboration
    async joinRoom(projectId) {
        return this.request(`/projects/${projectId}/join`);
    }
    
    async leaveRoom(projectId) {
        return this.request(`/projects/${projectId}/leave`);
    }
    
    // Offline support
    async syncOfflineChanges() {
        const pendingChanges = storage.get('pending_changes', []);
        
        for (const change of pendingChanges) {
            try {
                await this.request(change.endpoint, change.options);
                console.log('Synced change:', change);
            } catch (error) {
                console.error('Failed to sync change:', change, error);
            }
        }
        
        // Clear successfully synced changes
        storage.set('pending_changes', []);
    }
    
    queueOfflineChange(endpoint, options) {
        const pendingChanges = storage.get('pending_changes', []);
        pendingChanges.push({ endpoint, options, timestamp: Date.now() });
        storage.set('pending_changes', pendingChanges);
    }
    
    // File upload/download
    async uploadFile(projectId, file, onProgress = null) {
        const formData = new FormData();
        formData.append('file', file);
        
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            
            if (onProgress) {
                xhr.upload.onprogress = onProgress;
            }
            
            xhr.onload = () => {
                if (xhr.status === 200) {
                    resolve(JSON.parse(xhr.responseText));
                } else {
                    reject(new Error(`Upload failed: ${xhr.statusText}`));
                }
            };
            
            xhr.onerror = () => reject(new Error('Upload failed'));
            
            xhr.open('POST', `${this.baseURL}/projects/${projectId}/upload`);
            xhr.setRequestHeader('Authorization', `Bearer ${this.token}`);
            xhr.send(formData);
        });
    }
    
    async downloadFile(projectId, fileId) {
        const response = await fetch(
            `${this.baseURL}/projects/${projectId}/files/${fileId}/download`,
            {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            }
        );
        
        if (!response.ok) {
            throw new Error('Download failed');
        }
        
        return await response.blob();
    }
    
    // Utility methods
    setToken(token) {
        this.token = token;
        localStorage.setItem('collabcode_token', token);
    }
    
    clearToken() {
        this.token = null;
        localStorage.removeItem('collabcode_token');
    }
    
    isAuthenticated() {
        return !!this.token;
    }
}

// Create global API instance
window.api = new ApiService();