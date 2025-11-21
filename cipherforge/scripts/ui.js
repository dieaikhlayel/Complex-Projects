// scripts/ui.js
class UIManager {
    constructor() {
        this.currentMethod = null;
        this.methodChain = [];
        this.methods = {};
        this.methodChainBuilder = null;
        this.init();
    }

    init() {
        this.loadMethodCategories();
        this.setupEventListeners();
        this.updateTextCounts();
    }

    loadMethodCategories() {
        const methods = {
            classical: [
                {
                    id: 'caesar',
                    name: 'Caesar Cipher',
                    description: 'Shift letters by a fixed number',
                    config: { shift: 3 }
                },
                {
                    id: 'atbash',
                    name: 'Atbash Cipher',
                    description: 'Reverse alphabet substitution'
                },
                {
                    id: 'reverse',
                    name: 'Reverse Text',
                    description: 'Simply reverse the entire text'
                },
                {
                    id: 'vigenere',
                    name: 'Vigenère Cipher',
                    description: 'Polyalphabetic substitution with a key',
                    config: { key: 'secret' }
                },
                {
                    id: 'railFence',
                    name: 'Rail Fence Cipher',
                    description: 'Transposition cipher using rails',
                    config: { rails: 3 }
                }
            ],
            modern: [
                {
                    id: 'base64',
                    name: 'Base64',
                    description: 'Binary to text encoding scheme'
                },
                {
                    id: 'url',
                    name: 'URL Encoding',
                    description: 'Percent-encoding for URLs'
                },
                {
                    id: 'html',
                    name: 'HTML Entities',
                    description: 'Encode special HTML characters'
                },
                {
                    id: 'rot13',
                    name: 'ROT13',
                    description: 'Shift letters by 13 positions'
                },
                {
                    id: 'xor',
                    name: 'XOR Cipher',
                    description: 'Bitwise XOR operation with key',
                    config: { key: 'key' }
                }
            ],
            custom: [
                {
                    id: 'fibonacci',
                    name: 'Fibonacci Cipher',
                    description: 'Uses Fibonacci sequence for shifting',
                    category: 'custom'
                },
                {
                    id: 'prime',
                    name: 'Prime Number Cipher',
                    description: 'Uses prime numbers for shifting',
                    category: 'custom'
                },
                {
                    id: 'binary',
                    name: 'Binary Converter',
                    description: 'Converts text to binary and back',
                    category: 'custom'
                },
                {
                    id: 'morse',
                    name: 'Morse Code',
                    description: 'Converts text to Morse code',
                    category: 'custom'
                },
                {
                    id: 'pattern',
                    name: 'Pattern Cipher',
                    description: 'Uses custom pattern for encoding',
                    config: { pattern: 'secret' },
                    category: 'custom'
                },
                {
                    id: 'leet',
                    name: 'Leet Speak',
                    description: 'Converts to 1337 (leet) speak',
                    category: 'custom'
                }
            ],
            chain: [
                {
                    id: 'custom-chain',
                    name: 'Custom Method Chain',
                    description: 'Build your own encoding sequence',
                    category: 'chain'
                }
            ]
        };

        this.methods = methods;
        this.methodChainBuilder = new MethodChainBuilder();
        this.showCategory('classical');
    }

    showCategory(category) {
        const methods = this.methods[category] || [];
        const container = document.getElementById('methodsContainer');
        
        container.innerHTML = methods.map(method => `
            <div class="method-card" data-method="${method.id}" data-category="${category}">
                <h4>${method.name}</h4>
                <p>${method.description}</p>
                <span class="method-badge badge-${category}">${category}</span>
            </div>
        `).join('');

        // Add click listeners to method cards
        container.querySelectorAll('.method-card').forEach(card => {
            card.addEventListener('click', () => this.selectMethod(card.dataset.method, card.dataset.category));
        });
    }

    selectMethod(methodId, category) {
        this.currentMethod = { methodId, category };
        
        // Update UI
        document.querySelectorAll('.method-card').forEach(card => {
            card.classList.remove('active');
        });
        
        const selectedCard = document.querySelector(`[data-method="${methodId}"]`);
        if (selectedCard) {
            selectedCard.classList.add('active');
        }

        this.showMethodConfig(methodId, category);
    }

    showMethodConfig(methodId, category) {
        const method = this.methods[category]?.find(m => m.id === methodId);
        const configPanel = document.getElementById('configPanel');
        
        if (!method) {
            configPanel.innerHTML = '<p>Method not found.</p>';
            return;
        }

        // Hide chain section when selecting regular methods
        const chainSection = document.getElementById('chainSection');
        if (chainSection) {
            chainSection.classList.add('hidden');
        }

        if (method.id === 'custom-chain') {
            this.showChainBuilder();
            return;
        }

        if (method.config) {
            let configHTML = '<h3>Configuration</h3>';
            
            if (method.config.shift !== undefined) {
                configHTML += `
                    <div class="config-group">
                        <label for="shiftValue">Shift Value:</label>
                        <input type="number" id="shiftValue" value="${method.config.shift}" min="1" max="25">
                    </div>
                `;
            }
            
            if (method.config.key !== undefined) {
                configHTML += `
                    <div class="config-group">
                        <label for="keyValue">Key:</label>
                        <input type="text" id="keyValue" value="${method.config.key}">
                    </div>
                `;
            }

            if (method.config.rails !== undefined) {
                configHTML += `
                    <div class="config-group">
                        <label for="railsValue">Number of Rails:</label>
                        <input type="number" id="railsValue" value="${method.config.rails}" min="2" max="10">
                    </div>
                `;
            }

            // New custom method configs
            if (method.config.pattern !== undefined) {
                configHTML += `
                    <div class="config-group">
                        <label for="patternValue">Encoding Pattern:</label>
                        <input type="text" id="patternValue" value="${method.config.pattern}" placeholder="Enter pattern (e.g., 'secret')">
                        <small>Use letters to create a custom shift pattern</small>
                    </div>
                `;
            }

            configPanel.innerHTML = configHTML;
        } else {
            configPanel.innerHTML = '<p>No configuration needed for this method.</p>';
        }
    }

    showChainBuilder() {
        const configPanel = document.getElementById('configPanel');
        const chainSection = document.getElementById('chainSection');
        
        if (!configPanel || !chainSection) {
            console.error('Required DOM elements not found for chain builder');
            return;
        }
        
        configPanel.innerHTML = `
            <h3>Method Chain Builder</h3>
            <p>Build a custom sequence of encoding methods</p>
            <div class="config-group">
                <label for="chainName">Preset Name:</label>
                <input type="text" id="chainName" placeholder="My Custom Chain">
            </div>
            <div class="chain-actions">
                <button id="saveChainBtn" class="btn btn-primary">Save Chain</button>
                <button id="loadChainBtn" class="btn btn-outline">Load Preset</button>
                <button id="clearChainBtn" class="btn btn-outline">Clear Chain</button>
            </div>
        `;
        
        chainSection.classList.remove('hidden');
        this.updateChainDisplay();
        
        // Add chain builder event listeners
        const addStepBtn = document.getElementById('addStepBtn');
        const saveChainBtn = document.getElementById('saveChainBtn');
        const loadChainBtn = document.getElementById('loadChainBtn');
        const clearChainBtn = document.getElementById('clearChainBtn');

        if (addStepBtn) {
            addStepBtn.addEventListener('click', () => this.showAddStepModal());
        }
        if (saveChainBtn) {
            saveChainBtn.addEventListener('click', () => this.saveChain());
        }
        if (loadChainBtn) {
            loadChainBtn.addEventListener('click', () => this.showLoadPresetModal());
        }
        if (clearChainBtn) {
            clearChainBtn.addEventListener('click', () => this.clearChain());
        }
    }

    showAddStepModal() {
        // Simple implementation - you can enhance this with a proper modal
        const methodId = prompt('Enter method ID (caesar, base64, morse, etc.):');
        if (methodId) {
            const config = {};
            
            // Simple config collection - enhance this based on method type
            if (methodId === 'caesar') {
                const shift = prompt('Shift value (1-25):', '3');
                if (shift) config.shift = parseInt(shift);
            } else if (methodId === 'vigenere' || methodId === 'xor') {
                const key = prompt('Enter key:', 'secret');
                if (key) config.key = key;
            } else if (methodId === 'pattern') {
                const pattern = prompt('Enter pattern:', 'secret');
                if (pattern) config.pattern = pattern;
            }
            
            this.methodChainBuilder.addStep(methodId, config);
            this.updateChainDisplay();
        }
    }

    showLoadPresetModal() {
        const presets = JSON.parse(localStorage.getItem('cipherforge_chains') || '[]');
        if (presets.length === 0) {
            alert('No saved presets found.');
            return;
        }
        
        const presetNames = presets.map(p => p.name).join('\n');
        const presetName = prompt(`Available presets:\n\n${presetNames}\n\nEnter preset name to load:`);
        
        if (presetName) {
            const preset = presets.find(p => p.name === presetName);
            if (preset) {
                this.methodChainBuilder.load(preset.id);
                this.updateChainDisplay();
                alert(`Loaded preset: ${presetName}`);
            } else {
                alert('Preset not found.');
            }
        }
    }

    saveChain() {
        const chainName = document.getElementById('chainName')?.value;
        if (!chainName) {
            alert('Please enter a name for your chain preset.');
            return;
        }

        if (this.methodChainBuilder.getChain().length === 0) {
            alert('Please add at least one step to the chain before saving.');
            return;
        }

        this.methodChainBuilder.save(chainName);
        alert(`Chain "${chainName}" saved successfully!`);
    }

    clearChain() {
        if (confirm('Are you sure you want to clear the current chain?')) {
            this.methodChainBuilder.clear();
            this.updateChainDisplay();
        }
    }

    updateChainDisplay() {
        const chainSteps = document.getElementById('chainSteps');
        if (!chainSteps) return;

        const steps = this.methodChainBuilder.getChain();
        
        chainSteps.innerHTML = steps.map((step, index) => `
            <div class="chain-step" data-step-id="${step.id}">
                <div class="step-number">${index + 1}</div>
                <div class="step-method">
                    <strong>${this.getMethodName(step.method)}</strong>
                    ${step.config.pattern ? `<br><small>Pattern: ${step.config.pattern}</small>` : ''}
                    ${step.config.key ? `<br><small>Key: ${step.config.key}</small>` : ''}
                    ${step.config.shift ? `<br><small>Shift: ${step.config.shift}</small>` : ''}
                </div>
                <div class="step-actions">
                    <button class="btn btn-small move-up" data-step-id="${step.id}">↑</button>
                    <button class="btn btn-small move-down" data-step-id="${step.id}">↓</button>
                    <button class="btn btn-small remove-step" data-step-id="${step.id}">×</button>
                </div>
            </div>
        `).join('') || '<p class="no-steps">No steps added yet. Click "Add Step" to begin.</p>';

        // Add step action listeners
        chainSteps.querySelectorAll('.move-up').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.methodChainBuilder.moveStep(e.target.dataset.stepId, 'up');
                this.updateChainDisplay();
            });
        });

        chainSteps.querySelectorAll('.move-down').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.methodChainBuilder.moveStep(e.target.dataset.stepId, 'down');
                this.updateChainDisplay();
            });
        });

        chainSteps.querySelectorAll('.remove-step').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.methodChainBuilder.removeStep(e.target.dataset.stepId);
                this.updateChainDisplay();
            });
        });
    }

    getMethodName(methodId) {
        // Search through all categories to find method name
        for (const category in this.methods) {
            const method = this.methods[category].find(m => m.id === methodId);
            if (method) return method.name;
        }
        return methodId;
    }

    setupEventListeners() {
        // Category tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.showCategory(btn.dataset.category);
            });
        });

        // Control buttons
        const encodeBtn = document.getElementById('encodeBtn');
        const decodeBtn = document.getElementById('decodeBtn');
        const clearBtn = document.getElementById('clearBtn');
        const copyBtn = document.getElementById('copyBtn');
        const downloadBtn = document.getElementById('downloadBtn');
        const inputText = document.getElementById('inputText');

        if (encodeBtn) encodeBtn.addEventListener('click', () => this.processText(true));
        if (decodeBtn) decodeBtn.addEventListener('click', () => this.processText(false));
        if (clearBtn) clearBtn.addEventListener('click', () => this.clearAll());
        if (copyBtn) copyBtn.addEventListener('click', () => this.copyOutput());
        if (downloadBtn) downloadBtn.addEventListener('click', () => this.downloadOutput());
        if (inputText) inputText.addEventListener('input', () => this.updateTextCounts());
    }

    updateTextCounts() {
        const text = document.getElementById('inputText')?.value || '';
        const charCount = document.getElementById('charCount');
        const wordCount = document.getElementById('wordCount');

        if (charCount) charCount.textContent = `${TextUtils.countCharacters(text)} characters`;
        if (wordCount) wordCount.textContent = `${TextUtils.countWords(text)} words`;
    }

    processText(encode) {
        // Check if we're using method chain
        if (this.currentMethod?.methodId === 'custom-chain') {
            this.processChainText(encode);
            return;
        }

        // Regular single method processing
        if (!this.currentMethod) {
            alert('Please select an encoding method first!');
            return;
        }

        const inputText = document.getElementById('inputText')?.value;
        if (!inputText?.trim()) {
            alert('Please enter some text to process!');
            return;
        }

        const config = this.getCurrentConfig();
        let output;

        try {
            output = this.applyMethod(this.currentMethod.methodId, inputText, encode, config);
            this.setOutputText(output);
            
            // Save to history
            StorageManager.saveHistory({
                method: this.currentMethod.methodId,
                input: inputText,
                output: output,
                encode: encode,
                config: config
            });
        } catch (error) {
            this.setOutputText(`Error: ${error.message}`);
        }
    }

    processChainText(encode) {
        const inputText = document.getElementById('inputText')?.value;
        if (!inputText?.trim()) {
            alert('Please enter some text to process!');
            return;
        }

        if (this.methodChainBuilder.getChain().length === 0) {
            alert('Please add at least one step to the method chain!');
            return;
        }

        try {
            const output = this.methodChainBuilder.process(inputText, encode);
            this.setOutputText(output);
            
            // Save to history
            StorageManager.saveHistory({
                method: 'custom-chain',
                input: inputText,
                output: output,
                encode: encode,
                config: { steps: this.methodChainBuilder.getChain() }
            });
        } catch (error) {
            this.setOutputText(`Error: ${error.message}`);
        }
    }

    setOutputText(text) {
        const outputText = document.getElementById('outputText');
        if (outputText) {
            outputText.value = text;
        }
    }

    getCurrentConfig() {
        const config = {};
        
        const shiftInput = document.getElementById('shiftValue');
        if (shiftInput) config.shift = parseInt(shiftInput.value) || 3;
        
        const keyInput = document.getElementById('keyValue');
        if (keyInput) config.key = keyInput.value || 'key';
        
        const railsInput = document.getElementById('railsValue');
        if (railsInput) config.rails = parseInt(railsInput.value) || 3;

        const patternInput = document.getElementById('patternValue');
        if (patternInput) config.pattern = patternInput.value || 'secret';

        return config;
    }

    applyMethod(methodId, text, encode, config) {
        // First try classical ciphers
        if (ClassicalCiphers[methodId]) {
            return ClassicalCiphers[methodId](text, encode, config);
        }
        
        // Then try modern encoders
        if (ModernEncoders[methodId]) {
            return ModernEncoders[methodId](text, encode, config);
        }
        
        // Finally try custom ciphers
        if (CustomCiphers.applyMethod) {
            return CustomCiphers.applyMethod(methodId, text, encode, config);
        }
        
        return text;
    }

    clearAll() {
        const inputText = document.getElementById('inputText');
        const outputText = document.getElementById('outputText');
        
        if (inputText) inputText.value = '';
        if (outputText) outputText.value = '';
        
        this.updateTextCounts();
    }

    copyOutput() {
        const output = document.getElementById('outputText')?.value;
        if (output) {
            TextUtils.copyToClipboard(output);
        } else {
            alert('No output text to copy!');
        }
    }

    downloadOutput() {
        const output = document.getElementById('outputText')?.value;
        if (output) {
            TextUtils.downloadText(output);
        } else {
            alert('No output text to download!');
        }
    }
}