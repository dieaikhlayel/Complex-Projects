// ClipCache Background Service Worker
// This runs in the background and manages clipboard storage

// Array to hold our clipboard history (we'll sync this with storage)
let clipHistory = [];

// Maximum number of items to keep in history
const MAX_HISTORY_ITEMS = 50;

// Initialize the extension when it's installed or updated
chrome.runtime.onInstalled.addListener(() => {
    console.log('ClipCache extension installed/updated');
    
    // Initialize storage with empty array if it doesn't exist
    chrome.storage.local.get(['history'], (result) => {
        if (!result.history) {
            chrome.storage.local.set({ history: [] });
        } else {
            clipHistory = result.history;
            console.log(`Loaded ${clipHistory.length} items from storage`);
        }
    });
});

// Listen for messages from content scripts (when user copies text)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Message received in background:', request);
    
    if (request.type === 'newCopy') {
        handleNewCopy(request.data);
        sendResponse({ success: true }); // Acknowledge receipt
    }
    
    if (request.type === 'getHistory') {
        // Send the current history back to the requester
        sendResponse({ history: clipHistory });
    }
    
    if (request.type === 'clearHistory') {
        clearHistory();
        sendResponse({ success: true });
    }
    
    if (request.type === 'deleteItem') {
        deleteItem(request.index);
        sendResponse({ success: true });
    }
    
    return true; // Important: keeps the message channel open for async response
});

// Handle new copied text
function handleNewCopy(copyData) {
    // Don't store empty copies or very short text (like single characters)
    if (!copyData.content || copyData.content.trim().length < 2) {
        console.log('Skipping empty or too short copy');
        return;
    }
    
    // Avoid duplicates - don't add if the last item is the same
    if (clipHistory.length > 0 && clipHistory[0].content === copyData.content) {
        console.log('Skipping duplicate copy');
        return;
    }
    
    // Add timestamp and unique ID to the data
    const newItem = {
        ...copyData,
        id: Date.now(), // Simple unique ID using timestamp
        timestamp: new Date().toISOString(),
        displayTime: new Date().toLocaleTimeString() // Human-readable time
    };
    
    console.log('Adding new copy to history:', newItem.content.substring(0, 50) + '...');
    
    // Add to the beginning of the array (newest first)
    clipHistory.unshift(newItem);
    
    // Limit the history size
    if (clipHistory.length > MAX_HISTORY_ITEMS) {
        clipHistory = clipHistory.slice(0, MAX_HISTORY_ITEMS);
        console.log('History trimmed to', MAX_HISTORY_ITEMS, 'items');
    }
    
    // Save to storage
    saveHistoryToStorage();
    
    // Optional: You could add a notification here
    // showCopyNotification(newItem.content);
}

// Save the current history to chrome.storage
function saveHistoryToStorage() {
    chrome.storage.local.set({ history: clipHistory }, () => {
        if (chrome.runtime.lastError) {
            console.error('Error saving to storage:', chrome.runtime.lastError);
        } else {
            console.log('History saved to storage. Total items:', clipHistory.length);
        }
    });
}

// Clear all history
function clearHistory() {
    clipHistory = [];
    chrome.storage.local.set({ history: [] }, () => {
        console.log('History cleared');
        
        // Optional: Send message to all popups to refresh
        // chrome.runtime.sendMessage({ type: 'historyCleared' });
    });
}

// Delete a specific item by index
function deleteItem(index) {
    if (index >= 0 && index < clipHistory.length) {
        const deletedItem = clipHistory.splice(index, 1)[0];
        console.log('Deleted item:', deletedItem.content.substring(0, 50) + '...');
        saveHistoryToStorage();
    }
}

// Optional: Show a small notification when text is copied
function showCopyNotification(content) {
    // Limit notification text length
    const displayText = content.length > 50 ? content.substring(0, 50) + '...' : content;
    
    chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: 'ClipCache - Text Copied',
        message: displayText,
        priority: 0
    });
}

// Load history from storage when the service worker starts
chrome.storage.local.get(['history'], (result) => {
    if (result.history) {
        clipHistory = result.history;
        console.log('Service worker started. Loaded history:', clipHistory.length, 'items');
    }
});

// Optional: Periodically clean up old items (e.g., older than 30 days)
function cleanupOldItems() {
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const initialLength = clipHistory.length;
    
    clipHistory = clipHistory.filter(item => {
        return item.id > thirtyDaysAgo; // Keep items from last 30 days
    });
    
    if (clipHistory.length < initialLength) {
        console.log(`Cleaned up ${initialLength - clipHistory.length} old items`);
        saveHistoryToStorage();
    }
}

// Run cleanup once a day (optional feature)
// setInterval(cleanupOldItems, 24 * 60 * 60 * 1000);