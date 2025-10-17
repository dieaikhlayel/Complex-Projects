// ClipCache Popup Script
// Handles the UI interactions and communication with background script

class ClipCachePopup {
    constructor() {
        this.history = [];
        this.filteredHistory = [];
        this.settings = this.loadSettings();
        this.isCompactView = false;
        
        this.initializeElements();
        this.bindEvents();
        this.loadHistory();
    }

    // Initialize DOM element references
    initializeElements() {
        // Main containers
        this.elements = {
            emptyState: document.getElementById('emptyState'),
            historySection: document.getElementById('historySection'),
            loadingState: document.getElementById('loadingState'),
            historyList: document.getElementById('historyList'),
            itemCount: document.getElementById('itemCount'),
            lastUpdated: document.getElementById('lastUpdated'),
            
            // Buttons
            clearAllBtn: document.getElementById('clearAllBtn'),
            refreshBtn: document.getElementById('refreshBtn'),
            settingsBtn: document.getElementById('settingsBtn'),
            toggleViewBtn: document.getElementById('toggleViewBtn'),
            
            // Search
            searchInput: document.getElementById('searchInput'),
            
            // Settings modal
            settingsModal: document.getElementById('settingsModal'),
            closeSettings: document.getElementById('closeSettings'),
            saveSettings: document.getElementById('saveSettings'),
            resetSettings: document.getElementById('resetSettings'),
            autoRefresh: document.getElementById('autoRefresh'),
            compactView: document.getElementById('compactView'),
            maxItems: document.getElementById('maxItems'),
            fontSize: document.getElementById('fontSize'),
            
            // Tooltip
            tooltip: document.getElementById('tooltip'),
            tooltipText: document.getElementById('tooltipText')
        };
    }

    // Bind event listeners
    bindEvents() {
        // Button events
        this.elements.clearAllBtn.addEventListener('click', () => this.clearAllHistory());
        this.elements.refreshBtn.addEventListener('click', () => this.loadHistory());
        this.elements.settingsBtn.addEventListener('click', () => this.openSettings());
        this.elements.toggleViewBtn.addEventListener('click', () => this.toggleView());
        
        // Search events
        this.elements.searchInput.addEventListener('input', (e) => this.filterHistory(e.target.value));
        this.elements.searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                e.target.value = '';
                this.filterHistory('');
            }
        });
        
        // Settings modal events
        this.elements.closeSettings.addEventListener('click', () => this.closeSettings());
        this.elements.saveSettings.addEventListener('click', () => this.saveSettings());
        this.elements.resetSettings.addEventListener('click', () => this.resetSettings());
        
        // Close modal when clicking outside
        this.elements.settingsModal.addEventListener('click', (e) => {
            if (e.target === this.elements.settingsModal) {
                this.closeSettings();
            }
        });
        
        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.elements.settingsModal.style.display !== 'none') {
                this.closeSettings();
            }
        });
        
        // Listen for messages from background script (for auto-refresh)
        chrome.runtime.onMessage.addListener((message) => {
            if (message.type === 'historyUpdated' && this.settings.autoRefresh) {
                this.loadHistory();
            }
        });
    }

    // Load clipboard history from background script
    async loadHistory() {
        this.showLoading();
        
        try {
            // Send message to background script to get history
            const response = await chrome.runtime.sendMessage({ type: 'getHistory' });
            
            if (response && response.history) {
                this.history = response.history;
                this.filteredHistory = [...this.history];
                this.renderHistory();
                this.updateLastUpdated();
            } else {
                throw new Error('No history data received');
            }
        } catch (error) {
            console.error('Error loading history:', error);
            this.showError('Failed to load clipboard history');
        }
    }

    // Render the history list
    renderHistory() {
        if (this.filteredHistory.length === 0) {
            this.showEmptyState();
            return;
        }

        this.elements.historyList.innerHTML = '';
        this.elements.itemCount.textContent = this.filteredHistory.length;
        
        this.filteredHistory.forEach((item, index) => {
            const historyItem = this.createHistoryItem(item, index);
            this.elements.historyList.appendChild(historyItem);
        });

        this.showHistory();
    }

    // Create a single history item element
    createHistoryItem(item, index) {
        const itemEl = document.createElement('div');
        itemEl.className = `history-item ${this.isCompactView ? 'compact' : ''}`;
        itemEl.setAttribute('data-index', index);
        
        // Truncate long content for display
        const displayContent = this.truncateText(item.content, this.isCompactView ? 120 : 200);
        const domain = this.extractDomain(item.url);
        
        itemEl.innerHTML = `
            <div class="history-item-content">${this.escapeHtml(displayContent)}</div>
            ${!this.isCompactView ? `
                <div class="history-item-meta">
                    <div class="history-item-source">
                        <span class="source-domain">${domain}</span>
                        <span>•</span>
                        <span class="item-time">${this.formatTime(item.timestamp)}</span>
                    </div>
                    <div class="history-item-actions">
                        <button class="delete-item-btn" title="Delete this item">✕</button>
                    </div>
                </div>
            ` : ''}
        `;
        
        // Add click event to copy text
        itemEl.addEventListener('click', (e) => {
            if (!e.target.classList.contains('delete-item-btn')) {
                this.copyToClipboard(item.content, itemEl);
            }
        });
        
        // Add delete button event
        const deleteBtn = itemEl.querySelector('.delete-item-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteItem(index);
            });
        }
        
        return itemEl;
    }

    // Copy text to clipboard
    async copyToClipboard(text, itemEl) {
        try {
            await navigator.clipboard.writeText(text);
            
            // Visual feedback
            itemEl.classList.add('copied');
            this.showTooltip('Copied to clipboard!', itemEl);
            
            setTimeout(() => {
                itemEl.classList.remove('copied');
            }, 1000);
            
        } catch (error) {
            console.error('Failed to copy text:', error);
            this.showTooltip('Failed to copy', itemEl);
        }
    }

    // Delete a specific item
    async deleteItem(index) {
        const originalIndex = this.history.findIndex(item => 
            item === this.filteredHistory[index]
        );
        
        if (originalIndex !== -1) {
            try {
                await chrome.runtime.sendMessage({ 
                    type: 'deleteItem', 
                    index: originalIndex 
                });
                
                this.history.splice(originalIndex, 1);
                this.filteredHistory = this.applySearchFilter(this.filteredHistory);
                this.renderHistory();
                
            } catch (error) {
                console.error('Error deleting item:', error);
                this.showTooltip('Failed to delete item');
            }
        }
    }

    // Clear all history
    async clearAllHistory() {
        if (!confirm('Are you sure you want to clear all clipboard history? This cannot be undone.')) {
            return;
        }
        
        try {
            await chrome.runtime.sendMessage({ type: 'clearHistory' });
            this.history = [];
            this.filteredHistory = [];
            this.renderHistory();
            this.showTooltip('History cleared');
        } catch (error) {
            console.error('Error clearing history:', error);
            this.showTooltip('Failed to clear history');
        }
    }

    // Filter history based on search input
    filterHistory(searchTerm) {
        if (!searchTerm.trim()) {
            this.filteredHistory = [...this.history];
        } else {
            const term = searchTerm.toLowerCase();
            this.filteredHistory = this.history.filter(item => 
                item.content.toLowerCase().includes(term) ||
                item.url.toLowerCase().includes(term) ||
                (item.title && item.title.toLowerCase().includes(term))
            );
        }
        this.renderHistory();
    }

    applySearchFilter(items) {
        const searchTerm = this.elements.searchInput.value.toLowerCase().trim();
        if (!searchTerm) return items;
        
        return items.filter(item => 
            item.content.toLowerCase().includes(searchTerm)
        );
    }

    // Toggle between compact and detailed view
    toggleView() {
        this.isCompactView = !this.isCompactView;
        this.elements.toggleViewBtn.title = this.isCompactView ? 'Switch to detailed view' : 'Switch to compact view';
        this.elements.toggleViewBtn.textContent = this.isCompactView ? '📐' : '📏';
        this.renderHistory();
    }

    // Settings management
    openSettings() {
        this.loadCurrentSettings();
        this.elements.settingsModal.style.display = 'flex';
    }

    closeSettings() {
        this.elements.settingsModal.style.display = 'none';
    }

    loadCurrentSettings() {
        this.elements.autoRefresh.checked = this.settings.autoRefresh;
        this.elements.compactView.checked = this.settings.compactView;
        this.elements.maxItems.value = this.settings.maxItems;
        this.elements.fontSize.value = this.settings.fontSize;
    }

    saveSettings() {
        this.settings = {
            autoRefresh: this.elements.autoRefresh.checked,
            compactView: this.elements.compactView.checked,
            maxItems: parseInt(this.elements.maxItems.value),
            fontSize: this.elements.fontSize.value
        };
        
        this.saveSettingsToStorage();
        this.applySettings();
        this.closeSettings();
        this.showTooltip('Settings saved');
    }

    resetSettings() {
        this.settings = this.getDefaultSettings();
        this.saveSettingsToStorage();
        this.loadCurrentSettings();
        this.applySettings();
        this.showTooltip('Settings reset');
    }

    loadSettings() {
        const saved = localStorage.getItem('clipcache-settings');
        return saved ? { ...this.getDefaultSettings(), ...JSON.parse(saved) } : this.getDefaultSettings();
    }

    getDefaultSettings() {
        return {
            autoRefresh: true,
            compactView: false,
            maxItems: 50,
            fontSize: 'medium'
        };
    }

    saveSettingsToStorage() {
        localStorage.setItem('clipcache-settings', JSON.stringify(this.settings));
    }

    applySettings() {
        this.isCompactView = this.settings.compactView;
        document.body.style.fontSize = this.getFontSizeValue(this.settings.fontSize);
        this.renderHistory();
    }

    getFontSizeValue(size) {
        const sizes = { small: '12px', medium: '14px', large: '16px' };
        return sizes[size] || '14px';
    }

    // UI state management
    showLoading() {
        this.elements.loadingState.style.display = 'flex';
        this.elements.emptyState.style.display = 'none';
        this.elements.historySection.style.display = 'none';
    }

    showEmptyState() {
        this.elements.loadingState.style.display = 'none';
        this.elements.emptyState.style.display = 'flex';
        this.elements.historySection.style.display = 'none';
    }

    showHistory() {
        this.elements.loadingState.style.display = 'none';
        this.elements.emptyState.style.display = 'none';
        this.elements.historySection.style.display = 'block';
    }

    showError(message) {
        this.elements.loadingState.style.display = 'none';
        this.elements.emptyState.innerHTML = `
            <div class="empty-icon">❌</div>
            <h3>Error</h3>
            <p>${message}</p>
        `;
        this.elements.emptyState.style.display = 'flex';
        this.elements.historySection.style.display = 'none';
    }

    // Utility functions
    showTooltip(message, targetElement = null) {
        this.elements.tooltipText.textContent = message;
        this.elements.tooltip.style.display = 'block';
        
        if (targetElement) {
            const rect = targetElement.getBoundingClientRect();
            this.elements.tooltip.style.left = rect.left + 'px';
            this.elements.tooltip.style.top = (rect.top - 35) + 'px';
        } else {
            this.elements.tooltip.style.left = '50%';
            this.elements.tooltip.style.top = '50%';
            this.elements.tooltip.style.transform = 'translate(-50%, -50%)';
        }
        
        setTimeout(() => {
            this.elements.tooltip.style.display = 'none';
        }, 2000);
    }

    updateLastUpdated() {
        this.elements.lastUpdated.textContent = `Updated: ${new Date().toLocaleTimeString()}`;
    }

    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    extractDomain(url) {
        try {
            const domain = new URL(url).hostname.replace('www.', '');
            return domain.length > 20 ? domain.substring(0, 20) + '...' : domain;
        } catch {
            return 'unknown';
        }
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return date.toLocaleDateString();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the popup when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ClipCachePopup();
});

// Handle popup window being closed
window.addEventListener('beforeunload', () => {
    // Cleanup if needed
});