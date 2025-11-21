// scripts/ciphers/custom.js
class CustomCiphers {
    static fibonacciCipher(text, encode = true) {
        if (typeof text !== 'string') return '';
        
        let sequence = [1, 1];
        let sequenceIndex = 0;
        
        const generateMore = () => {
            const next = sequence[sequence.length - 1] + sequence[sequence.length - 2];
            sequence.push(next);
        };

        return text.replace(/[a-z]/gi, char => {
            const isUpperCase = char === char.toUpperCase();
            const base = isUpperCase ? 'A'.charCodeAt(0) : 'a'.charCodeAt(0);
            
            if (char.match(/[a-z]/i)) {
                if (sequenceIndex >= sequence.length - 1) {
                    generateMore();
                }
                
                const shift = sequence[sequenceIndex] % 26;
                const currentPos = char.charCodeAt(0) - base;
                const newPos = encode ? 
                    (currentPos + shift) % 26 : 
                    (currentPos - shift + 26) % 26;
                
                sequenceIndex++;
                return String.fromCharCode(base + newPos);
            }
            return char;
        });
    }

    static primeCipher(text, encode = true) {
        if (typeof text !== 'string') return '';
        
        let primeIndex = 0;
        const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];

        return text.replace(/[a-z]/gi, char => {
            const isUpperCase = char === char.toUpperCase();
            const base = isUpperCase ? 'A'.charCodeAt(0) : 'a'.charCodeAt(0);
            
            if (char.match(/[a-z]/i)) {
                const shift = primes[primeIndex % primes.length] % 26;
                const currentPos = char.charCodeAt(0) - base;
                const newPos = encode ? 
                    (currentPos + shift) % 26 : 
                    (currentPos - shift + 26) % 26;
                
                primeIndex++;
                return String.fromCharCode(base + newPos);
            }
            return char;
        });
    }

    static binaryCipher(text, encode = true) {
        if (typeof text !== 'string') return '';
        
        if (encode) {
            return text.split('').map(char => {
                return char.charCodeAt(0).toString(2).padStart(8, '0');
            }).join(' ');
        } else {
            try {
                // Remove any spaces and split into 8-bit chunks
                const binaryString = text.replace(/\s/g, '');
                const bytes = [];
                for (let i = 0; i < binaryString.length; i += 8) {
                    bytes.push(binaryString.substr(i, 8));
                }
                return bytes.map(byte => {
                    return String.fromCharCode(parseInt(byte, 2));
                }).join('');
            } catch {
                return 'Error: Invalid binary string';
            }
        }
    }

    static morseCipher(text, encode = true) {
        if (typeof text !== 'string') return '';
        
        const morseMap = {
            'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.', 'G': '--.', 'H': '....',
            'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..', 'M': '--', 'N': '-.', 'O': '---', 'P': '.--.',
            'Q': '--.-', 'R': '.-.', 'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
            'Y': '-.--', 'Z': '--..', 
            '1': '.----', '2': '..---', '3': '...--', '4': '....-', '5': '.....',
            '6': '-....', '7': '--...', '8': '---..', '9': '----.', '0': '-----',
            ' ': '/', '.': '.-.-.-', ',': '--..--', '?': '..--..', "'": '.----.', '!': '-.-.--'
        };

        const reverseMorseMap = {};
        for (const [key, value] of Object.entries(morseMap)) {
            reverseMorseMap[value] = key;
        }

        if (encode) {
            return text.toUpperCase().split('').map(char => {
                return morseMap[char] || `[${char}]`;
            }).join(' ');
        } else {
            return text.split(' ').map(code => {
                return reverseMorseMap[code] || code;
            }).join('');
        }
    }

    static patternCipher(text, pattern, encode = true) {
        if (typeof text !== 'string') return '';
        if (!pattern) pattern = 'abc';
        
        const patternArray = pattern.toString().toLowerCase().split('').map(char => {
            return char.charCodeAt(0) - 'a'.charCodeAt(0);
        });

        let patternIndex = 0;
        
        return text.replace(/[a-z]/gi, char => {
            const isUpperCase = char === char.toUpperCase();
            const base = isUpperCase ? 'A'.charCodeAt(0) : 'a'.charCodeAt(0);
            
            if (char.match(/[a-z]/i)) {
                const shift = patternArray[patternIndex % patternArray.length];
                const currentPos = char.charCodeAt(0) - base;
                const newPos = encode ? 
                    (currentPos + shift) % 26 : 
                    (currentPos - shift + 26) % 26;
                
                patternIndex++;
                return String.fromCharCode(base + newPos);
            }
            return char;
        });
    }

    static leetCipher(text, encode = true) {
        if (typeof text !== 'string') return '';
        
        const leetMap = {
            'A': '4', 'B': '8', 'E': '3', 'G': '6', 'I': '1', 'O': '0', 'S': '5', 'T': '7', 'Z': '2',
            '4': 'A', '8': 'B', '3': 'E', '6': 'G', '1': 'I', '0': 'O', '5': 'S', '7': 'T', '2': 'Z'
        };

        if (encode) {
            return text.toUpperCase().split('').map(char => {
                return leetMap[char] || char;
            }).join('');
        } else {
            return text.split('').map(char => {
                return leetMap[char] || char;
            }).join('');
        }
    }

    static applyMethod(method, text, encode, config) {
        if (typeof text !== 'string') return '';
        
        switch (method) {
            case 'fibonacci':
                return this.fibonacciCipher(text, encode);
            case 'prime':
                return this.primeCipher(text, encode);
            case 'binary':
                return this.binaryCipher(text, encode);
            case 'morse':
                return this.morseCipher(text, encode);
            case 'pattern':
                return this.patternCipher(text, config?.pattern, encode);
            case 'leet':
                return this.leetCipher(text, encode);
            default:
                return `Error: Unknown method ${method}`;
        }
    }
}

class MethodChainBuilder {
    constructor() {
        this.steps = [];
    }

    addStep(method, config = {}) {
        this.steps.push({ 
            method, 
            config, 
            id: Date.now() + Math.random() 
        });
        return this;
    }

    removeStep(stepId) {
        this.steps = this.steps.filter(step => step.id !== stepId);
        return this;
    }

    moveStep(stepId, direction) {
        const index = this.steps.findIndex(step => step.id === stepId);
        if (index === -1) return this;

        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex >= 0 && newIndex < this.steps.length) {
            [this.steps[index], this.steps[newIndex]] = [this.steps[newIndex], this.steps[index]];
        }
        return this;
    }

    clear() {
        this.steps = [];
        return this;
    }

    process(text, encode = true) {
        let result = text;
        
        if (encode) {
            for (const step of this.steps) {
                result = CustomCiphers.applyMethod(step.method, result, true, step.config);
            }
        } else {
            for (let i = this.steps.length - 1; i >= 0; i--) {
                result = CustomCiphers.applyMethod(this.steps[i].method, result, false, this.steps[i].config);
            }
        }
        
        return result;
    }

    getChain() {
        return [...this.steps];
    }

    save(name) {
        const preset = {
            id: Date.now(),
            name: name.toString(),
            steps: this.steps,
            timestamp: new Date().toISOString()
        };
        
        const presets = JSON.parse(localStorage.getItem('cipherforge_chains') || '[]');
        presets.push(preset);
        localStorage.setItem('cipherforge_chains', JSON.stringify(presets));
        
        return preset;
    }

    load(presetId) {
        const presets = JSON.parse(localStorage.getItem('cipherforge_chains') || '[]');
        const preset = presets.find(p => p.id === presetId);
        
        if (preset) {
            this.steps = [...preset.steps];
        }
        
        return this;
    }
}