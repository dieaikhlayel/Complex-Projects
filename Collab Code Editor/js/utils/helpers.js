// Utility Helper Functions
class Helpers {
    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    static debounce(func, wait, immediate) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func.apply(this, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(this, args);
        };
    }
    
    static throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    static escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
    
    static formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    static formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) { // Less than 1 minute
            return 'Just now';
        } else if (diff < 3600000) { // Less than 1 hour
            return Math.floor(diff / 60000) + ' minutes ago';
        } else if (diff < 86400000) { // Less than 1 day
            return Math.floor(diff / 3600000) + ' hours ago';
        } else {
            return date.toLocaleDateString();
        }
    }
    
    static copyToClipboard(text) {
        return new Promise((resolve, reject) => {
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(text).then(resolve).catch(reject);
            } else {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.opacity = '0';
                document.body.appendChild(textArea);
                textArea.select();
                try {
                    document.execCommand('copy');
                    resolve();
                } catch (err) {
                    reject(err);
                }
                document.body.removeChild(textArea);
            }
        });
    }
    
    static downloadFile(filename, content, type = 'text/plain') {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    static parseJSON(jsonString, fallback = {}) {
        try {
            return JSON.parse(jsonString);
        } catch {
            return fallback;
        }
    }
    
    static stringifyJSON(obj, fallback = '{}') {
        try {
            return JSON.stringify(obj, null, 2);
        } catch {
            return fallback;
        }
    }
    
    static validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    static validatePassword(password) {
        return password.length >= 8;
    }
    
    static getFileExtension(filename) {
        return filename.split('.').pop().toLowerCase();
    }
    
    static getLanguageFromExtension(extension) {
        const languageMap = {
            'html': 'html',
            'htm': 'html',
            'css': 'css',
            'js': 'javascript',
            'jsx': 'javascript',
            'ts': 'typescript',
            'tsx': 'typescript',
            'py': 'python',
            'java': 'java',
            'cpp': 'cpp',
            'c': 'c',
            'php': 'php',
            'rb': 'ruby',
            'go': 'go',
            'rs': 'rust',
            'json': 'json',
            'xml': 'xml',
            'md': 'markdown',
            'sql': 'sql'
        };
        return languageMap[extension] || 'text';
    }
    
    static detectIndentation(text) {
        const lines = text.split('\n');
        let spaces = 0;
        let tabs = 0;
        
        for (const line of lines) {
            const leading = line.match(/^\s*/)[0];
            if (leading.includes('\t')) tabs++;
            if (leading.includes(' ')) spaces++;
        }
        
        return tabs > spaces ? 'tab' : 'space';
    }
    
    static countLines(text) {
        return text.split('\n').length;
    }
    
    static countWords(text) {
        return text.trim() ? text.trim().split(/\s+/).length : 0;
    }
    
    static highlightSearch(text, searchTerm) {
        if (!searchTerm) return this.escapeHtml(text);
        
        const regex = new RegExp(`(${this.escapeRegex(searchTerm)})`, 'gi');
        return this.escapeHtml(text).replace(regex, '<mark>$1</mark>');
    }
    
    static escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    
    static generateColorFromString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        
        const hue = hash % 360;
        return `hsl(${hue}, 70%, 60%)`;
    }
    
    static async hashString(str) {
        const encoder = new TextEncoder();
        const data = encoder.encode(str);
        const hash = await crypto.subtle.digest('SHA-256', data);
        return Array.from(new Uint8Array(hash))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }
}