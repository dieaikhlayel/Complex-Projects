// ClipCache Content Script
// Injected into every web page to listen for copy events

console.log('ClipCache content script loaded on:', window.location.hostname);

// Track the last copied text to avoid duplicates in rapid succession
let lastCopiedText = '';
let duplicateCooldown = false;

// Listen for the copy event on the entire document
document.addEventListener('copy', handleCopyEvent);

// Also listen for mouseup events on selections (as a fallback)
document.addEventListener('mouseup', handleMouseUp);

function handleCopyEvent(event) {
    // Use a small delay to ensure the clipboard has been updated
    setTimeout(() => {
        // Get the currently selected text
        const selectedText = window.getSelection().toString().trim();
        
        if (isValidCopy(selectedText)) {
            processCopiedText(selectedText, 'copy-event');
        }
    }, 10);
}

function handleMouseUp(event) {
    // Only process if there's a text selection
    const selectedText = window.getSelection().toString().trim();
    
    if (selectedText && isValidCopy(selectedText)) {
        // Check if this might be a copy action (user selected text, might copy it)
        // We'll use this as a secondary method to catch copies
        processCopiedText(selectedText, 'mouse-selection');
    }
}

function isValidCopy(text) {
    // Basic validation checks
    if (!text || text.length < 2) {
        return false; // Too short
    }
    
    if (text.length > 10000) {
        console.log('ClipCache: Text too long, skipping');
        return false; // Too long (avoid storing huge documents)
    }
    
    // Check if this is the same as the last copied text (avoid duplicates)
    if (text === lastCopiedText && !duplicateCooldown) {
        return false;
    }
    
    // Check if it's mostly whitespace
    if (text.trim().length === 0) {
        return false;
    }
    
    return true;
}

function processCopiedText(text, source) {
    // Update last copied text and set cooldown
    lastCopiedText = text;
    duplicateCooldown = true;
    
    // Reset cooldown after a short period
    setTimeout(() => {
        duplicateCooldown = false;
    }, 1000);
    
    // Prepare the data to send to background script
    const copyData = {
        type: 'text',
        content: text,
        url: window.location.href,
        title: document.title || 'Untitled Page',
        hostname: window.location.hostname,
        source: source,
        timestamp: new Date().toISOString()
    };
    
    console.log('ClipCache: Captured text:', {
        source: source,
        length: text.length,
        preview: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
        hostname: window.location.hostname
    });
    
    // Send the copied text to the background script
    sendToBackground(copyData);
}

function sendToBackground(data) {
    chrome.runtime.sendMessage({
        type: 'newCopy',
        data: data
    })
    .then(response => {
        if (response && response.success) {
            console.log('ClipCache: Successfully sent to background');
        } else {
            console.warn('ClipCache: No response from background script');
        }
    })
    .catch(error => {
        // This often happens when the extension is reloading or not available
        console.log('ClipCache: Could not send to background (normal during development):', error);
    });
}

// Enhanced copy detection for rich text editors (like Gmail, Google Docs)
function enhanceRichTextEditors() {
    // Look for common rich text editor elements
    const selectors = [
        '[contenteditable="true"]',
        '.ql-editor', // Quill.js
        '.ProseMirror', // TipTap/ProseMirror
        '.cke_editable', // CKEditor
        '.wysihtml5-editor',
        'iframe.body' // Older editors
    ];
    
    selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            if (!element.hasAttribute('data-clipcache-enhanced')) {
                element.setAttribute('data-clipcache-enhanced', 'true');
                element.addEventListener('copy', handleRichEditorCopy);
                element.addEventListener('cut', handleRichEditorCopy);
            }
        });
    });
}

function handleRichEditorCopy(event) {
    // For rich editors, we need to wait a bit longer for the clipboard to update
    setTimeout(() => {
        // Try to get text from clipboard API if available
        if (navigator.clipboard && navigator.clipboard.readText) {
            navigator.clipboard.readText().then(text => {
                if (isValidCopy(text)) {
                    processCopiedText(text, 'rich-editor');
                }
            }).catch(err => {
                // Fallback to selection method
                const selectedText = window.getSelection().toString().trim();
                if (isValidCopy(selectedText)) {
                    processCopiedText(selectedText, 'rich-editor-fallback');
                }
            });
        } else {
            // Fallback for browsers without clipboard API
            const selectedText = window.getSelection().toString().trim();
            if (isValidCopy(selectedText)) {
                processCopiedText(selectedText, 'rich-editor-fallback');
            }
        }
    }, 50);
}

// Initialize enhanced detection for rich text editors
document.addEventListener('DOMContentLoaded', enhanceRichTextEditors);

// Also try to enhance editors that load after DOMContentLoaded
const observer = new MutationObserver((mutations) => {
    let shouldEnhance = false;
    
    mutations.forEach((mutation) => {
        if (mutation.addedNodes.length) {
            shouldEnhance = true;
        }
    });
    
    if (shouldEnhance) {
        setTimeout(enhanceRichTextEditors, 100);
    }
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});

// Add a small style to indicate when ClipCache is active (optional)
const style = document.createElement('style');
style.textContent = `
    .clipcache-highlight {
        background-color: rgba(100, 200, 255, 0.1) !important;
        transition: background-color 0.3s ease !important;
    }
`;
document.head.appendChild(style);

// Optional: Provide a way for websites to disable ClipCache if needed
window.clipCacheDisabled = false;

// Safety: Don't run on sensitive pages (banking, etc.)
const sensitiveHostnames = [
    'onlinebanking',
    'portal',
    'secure.',
    'admin',
    'localhost',
    '127.0.0.1'
];

function isSensitivePage() {
    const url = window.location.href.toLowerCase();
    const hostname = window.location.hostname.toLowerCase();
    
    return sensitiveHostnames.some(sensitive => 
        hostname.includes(sensitive) || url.includes(sensitive)
    );
}

// Only activate if not on a sensitive page
if (!isSensitivePage()) {
    console.log('ClipCache: Active on this page');
} else {
    console.log('ClipCache: Disabled on sensitive page');
    // Remove event listeners on sensitive pages
    document.removeEventListener('copy', handleCopyEvent);
    document.removeEventListener('mouseup', handleMouseUp);
}