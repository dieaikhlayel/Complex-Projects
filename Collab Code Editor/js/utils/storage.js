// Storage Management Utilities
class StorageManager {
    constructor() {
        this.prefix = 'collabcode_';
    }
    
    set(key, value) {
        try {
            const serialized = JSON.stringify(value);
            localStorage.setItem(this.prefix + key, serialized);
            return true;
        } catch (error) {
            console.error('Storage set error:', error);
            return false;
        }
    }
    
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(this.prefix + key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Storage get error:', error);
            return defaultValue;
        }
    }
    
    remove(key) {
        try {
            localStorage.removeItem(this.prefix + key);
            return true;
        } catch (error) {
            console.error('Storage remove error:', error);
            return false;
        }
    }
    
    clear() {
        try {
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith(this.prefix)) {
                    keysToRemove.push(key);
                }
            }
            
            keysToRemove.forEach(key => localStorage.removeItem(key));
            return true;
        } catch (error) {
            console.error('Storage clear error:', error);
            return false;
        }
    }
    
    // User preferences
    setUserPreferences(preferences) {
        return this.set('user_preferences', preferences);
    }
    
    getUserPreferences() {
        return this.get('user_preferences', {
            theme: 'light',
            fontSize: 14,
            tabSize: 2,
            wordWrap: false,
            lineNumbers: true
        });
    }
    
    // Project data
    setProjectData(projectId, data) {
        return this.set(`project_${projectId}`, data);
    }
    
    getProjectData(projectId) {
        return this.get(`project_${projectId}`, null);
    }
    
    // Recent projects
    addRecentProject(project) {
        const recent = this.getRecentProjects();
        const filtered = recent.filter(p => p.id !== project.id);
        const updated = [project, ...filtered].slice(0, 10); // Keep last 10
        return this.set('recent_projects', updated);
    }
    
    getRecentProjects() {
        return this.get('recent_projects', []);
    }
    
    // Session data
    setSessionData(data) {
        return this.set('session', {
            ...data,
            timestamp: Date.now()
        });
    }
    
    getSessionData() {
        return this.get('session', {});
    }
    
    // File cache
    cacheFile(path, content) {
        return this.set(`cache_file_${path}`, {
            content,
            timestamp: Date.now()
        });
    }
    
    getCachedFile(path, maxAge = 300000) { // 5 minutes default
        const cached = this.get(`cache_file_${path}`, null);
        if (cached && Date.now() - cached.timestamp < maxAge) {
            return cached.content;
        }
        return null;
    }
    
    // Backup and restore
    exportData() {
        const data = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(this.prefix)) {
                data[key] = localStorage.getItem(key);
            }
        }
        return data;
    }
    
    importData(data) {
        try {
            Object.entries(data).forEach(([key, value]) => {
                if (key.startsWith(this.prefix)) {
                    localStorage.setItem(key, value);
                }
            });
            return true;
        } catch (error) {
            console.error('Import error:', error);
            return false;
        }
    }
    
    // Storage statistics
    getStorageStats() {
        let totalSize = 0;
        let itemCount = 0;
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(this.prefix)) {
                const value = localStorage.getItem(key);
                totalSize += key.length + value.length;
                itemCount++;
            }
        }
        
        return {
            itemCount,
            totalSize,
            totalSizeFormatted: Helpers.formatFileSize(totalSize)
        };
    }
    
    // Check storage availability
    isStorageAvailable() {
        try {
            const test = 'test';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (error) {
            return false;
        }
    }
    
    // Get storage quota
    async getStorageQuota() {
        if ('storage' in navigator && 'estimate' in navigator.storage) {
            try {
                const quota = await navigator.storage.estimate();
                return {
                    usage: quota.usage,
                    quota: quota.quota,
                    usagePercentage: ((quota.usage / quota.quota) * 100).toFixed(2)
                };
            } catch (error) {
                console.error('Storage quota error:', error);
            }
        }
        return null;
    }
}

// Create global storage instance
window.storage = new StorageManager();