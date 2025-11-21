// scripts/utils.js
class TextUtils {
    static countCharacters(text) {
        return text.length;
    }

    static countWords(text) {
        return text.trim() ? text.trim().split(/\s+/).length : 0;
    }

    static copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            alert('Text copied to clipboard!');
        });
    }

    static downloadText(text, filename = 'cipherforge_output.txt') {
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }
}

class StorageManager {
    static saveHistory(operation) {
        const history = this.getHistory();
        history.unshift({
            ...operation,
            timestamp: new Date().toISOString(),
            id: Date.now()
        });
        
        // Keep only last 50 operations
        const limitedHistory = history.slice(0, 50);
        localStorage.setItem('cipherforge_history', JSON.stringify(limitedHistory));
    }

    static getHistory() {
        return JSON.parse(localStorage.getItem('cipherforge_history') || '[]');
    }

    static savePreset(preset) {
        const presets = this.getPresets();
        presets.push({ ...preset, id: Date.now() });
        localStorage.setItem('cipherforge_presets', JSON.stringify(presets));
    }

    static getPresets() {
        return JSON.parse(localStorage.getItem('cipherforge_presets') || '[]');
    }
}