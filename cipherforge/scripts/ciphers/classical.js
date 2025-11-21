// scripts/ciphers/classical.js
class ClassicalCiphers {
    static caesarCipher(text, shift, encode = true) {
        if (typeof text !== 'string') return '';
        
        shift = parseInt(shift) || 3;
        if (!encode) {
            shift = (26 - shift) % 26;
        }

        return text.replace(/[a-z]/gi, char => {
            const isUpperCase = char === char.toUpperCase();
            const base = isUpperCase ? 'A'.charCodeAt(0) : 'a'.charCodeAt(0);
            
            if (char.match(/[a-z]/i)) {
                const currentPos = char.charCodeAt(0) - base;
                const newPos = (currentPos + shift + 26) % 26;
                return String.fromCharCode(base + newPos);
            }
            return char;
        });
    }

    static atbashCipher(text) {
        if (typeof text !== 'string') return '';
        
        return text.replace(/[a-z]/gi, char => {
            const isUpperCase = char === char.toUpperCase();
            const base = isUpperCase ? 'A'.charCodeAt(0) : 'a'.charCodeAt(0);
            
            if (char.match(/[a-z]/i)) {
                const currentPos = char.charCodeAt(0) - base;
                const newPos = 25 - currentPos;
                return String.fromCharCode(base + newPos);
            }
            return char;
        });
    }

    static reverseCipher(text) {
        if (typeof text !== 'string') return '';
        return text.split('').reverse().join('');
    }

    static vigenereCipher(text, key, encode = true) {
        if (typeof text !== 'string') return '';
        if (!key) key = 'key';
        
        key = key.toString().toLowerCase().replace(/[^a-z]/g, '');
        if (key.length === 0) key = 'a';

        let keyIndex = 0;
        return text.replace(/[a-z]/gi, char => {
            const isUpperCase = char === char.toUpperCase();
            const base = isUpperCase ? 'A'.charCodeAt(0) : 'a'.charCodeAt(0);
            
            if (char.match(/[a-z]/i)) {
                const keyChar = key.charCodeAt(keyIndex % key.length) - 'a'.charCodeAt(0);
                const currentPos = char.charCodeAt(0) - base;
                
                let newPos;
                if (encode) {
                    newPos = (currentPos + keyChar) % 26;
                } else {
                    newPos = (currentPos - keyChar + 26) % 26;
                }
                
                keyIndex++;
                return String.fromCharCode(base + newPos);
            }
            return char;
        });
    }

    static railFenceCipher(text, rails, encode = true) {
        if (typeof text !== 'string') return '';
        
        rails = parseInt(rails) || 3;
        if (rails < 2) rails = 2;
        if (rails > 10) rails = 10;

        if (!encode) {
            return this._railFenceDecode(text, rails);
        }

        // Encoding
        const fence = Array.from({ length: rails }, () => []);
        let rail = 0;
        let direction = 1;

        for (let char of text) {
            fence[rail].push(char);
            rail += direction;
            if (rail === 0 || rail === rails - 1) {
                direction = -direction;
            }
        }

        return fence.flat().join('');
    }

    static _railFenceDecode(text, rails) {
        // Create the fence pattern
        const fence = Array.from({ length: rails }, () => []);
        const pattern = this._getRailPattern(text.length, rails);
        
        // Fill the fence with characters in the right order
        const chars = text.split('');
        for (let i = 0; i < rails; i++) {
            for (let j = 0; j < text.length; j++) {
                if (pattern[j] === i) {
                    fence[i].push(chars.shift());
                }
            }
        }

        // Read the fence in zigzag pattern
        const result = [];
        let rail = 0;
        let direction = 1;
        const fencePointers = Array.from({ length: rails }, () => 0);

        for (let i = 0; i < text.length; i++) {
            result.push(fence[rail][fencePointers[rail]]);
            fencePointers[rail]++;
            rail += direction;
            if (rail === 0 || rail === rails - 1) {
                direction = -direction;
            }
        }

        return result.join('');
    }

    static _getRailPattern(length, rails) {
        const pattern = [];
        let rail = 0;
        let direction = 1;

        for (let i = 0; i < length; i++) {
            pattern.push(rail);
            rail += direction;
            if (rail === 0 || rail === rails - 1) {
                direction = -direction;
            }
        }
        return pattern;
    }
}