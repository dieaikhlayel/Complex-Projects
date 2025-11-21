// scripts/app.js
class CipherForgeApp {
    constructor() {
        this.uiManager = null;
        this.init();
    }

    init() {
        try {
            // Wait a bit to ensure all dependencies are loaded
            setTimeout(() => {
                this.initializeApp();
            }, 100);
        } catch (error) {
            console.error('Failed to initialize CipherForge:', error);
            this.showError('Failed to initialize the application. Please refresh the page.');
        }
    }

    initializeApp() {
        try {
            // Check if required classes are available
            if (typeof UIManager === 'undefined') {
                throw new Error('UIManager class not found. Make sure ui.js is loaded.');
            }

            if (typeof ClassicalCiphers === 'undefined') {
                throw new Error('ClassicalCiphers class not found. Make sure classical.js is loaded.');
            }

            if (typeof ModernEncoders === 'undefined') {
                throw new Error('ModernEncoders class not found. Make sure modern.js is loaded.');
            }

            // Initialize UI Manager
            this.uiManager = new UIManager();

            // Add some sample text for demonstration
            this.addSampleText();

            // Test that ciphers are working
            this.testCiphers();

            console.log('🔐 CipherForge initialized successfully!');
            
        } catch (error) {
            console.error('Initialization error:', error);
            this.showError(`Initialization error: ${error.message}`);
        }
    }

    addSampleText() {
        const inputText = document.getElementById('inputText');
        if (inputText) {
            const sampleText = `Welcome to CipherForge!

This is a sample text that you can use to test various encoding methods.

Try encoding this text with different ciphers and see the results!`;
            
            inputText.value = sampleText;
            
            // Update text counts if UIManager is ready
            if (this.uiManager && this.uiManager.updateTextCounts) {
                this.uiManager.updateTextCounts();
            }
        }
    }

    testCiphers() {
        // Quick test to verify ciphers are working
        const testText = "Hello";
        try {
            const caesarResult = ClassicalCiphers.caesarCipher(testText, 4, true);
            console.log('✅ Caesar cipher test:', testText, '→', caesarResult);
            
            const base64Result = ModernEncoders.base64Encode(testText);
            console.log('✅ Base64 test:', testText, '→', base64Result);
            
        } catch (error) {
            console.error('❌ Cipher test failed:', error);
        }
    }

    showError(message) {
        // Create error message display
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #dc2626;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 10000;
            font-family: Arial, sans-serif;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        `;
        errorDiv.innerHTML = `
            <strong>Error:</strong> ${message}
            <br><small>Check console for details</small>
        `;
        
        document.body.appendChild(errorDiv);
        
        // Remove after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }
}

// Enhanced initialization with dependency checking
function initializeCipherForge() {
    // Check if all required dependencies are loaded
    const requiredClasses = ['UIManager', 'ClassicalCiphers', 'ModernEncoders', 'CustomCiphers', 'TextUtils'];
    const missingClasses = requiredClasses.filter(cls => typeof window[cls] === 'undefined');
    
    if (missingClasses.length > 0) {
        console.warn('Missing classes:', missingClasses);
        
        // Try again in 500ms if classes are missing
        setTimeout(initializeCipherForge, 500);
        return;
    }
    
    // All dependencies are loaded, initialize the app
    try {
        window.cipherForgeApp = new CipherForgeApp();
    } catch (error) {
        console.error('Failed to create CipherForgeApp:', error);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Starting CipherForge initialization...');
    
    // Start initialization with a small delay to ensure all scripts are loaded
    setTimeout(initializeCipherForge, 100);
});

// Add global error handler for better debugging
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CipherForgeApp };
}