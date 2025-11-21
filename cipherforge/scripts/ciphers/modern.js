// scripts/ciphers/modern.js
class ModernEncoders {
    static base64Encode(text) {
        if (typeof text !== 'string') return '';
        try {
            return btoa(unescape(encodeURIComponent(text)));
        } catch {
            return 'Error: Cannot encode to Base64';
        }
    }

    static base64Decode(text) {
        if (typeof text !== 'string') return '';
        try {
            return decodeURIComponent(escape(atob(text)));
        } catch {
            return 'Error: Invalid Base64 string';
        }
    }

    static urlEncode(text) {
        if (typeof text !== 'string') return '';
        try {
            return encodeURIComponent(text);
        } catch {
            return 'Error: Cannot URL encode';
        }
    }

    static urlDecode(text) {
        if (typeof text !== 'string') return '';
        try {
            return decodeURIComponent(text);
        } catch {
            return 'Error: Invalid URL encoded string';
        }
    }

    static htmlEncode(text) {
        if (typeof text !== 'string') return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    static htmlDecode(text) {
        if (typeof text !== 'string') return '';
        const div = document.createElement('div');
        div.innerHTML = text;
        return div.textContent || div.innerText || '';
    }

    static rot13(text) {
        if (typeof text !== 'string') return '';
        return text.replace(/[a-z]/gi, char => {
            const isUpperCase = char === char.toUpperCase();
            const base = isUpperCase ? 'A'.charCodeAt(0) : 'a'.charCodeAt(0);
            if (char.match(/[a-z]/i)) {
                const currentPos = char.charCodeAt(0) - base;
                const newPos = (currentPos + 13) % 26;
                return String.fromCharCode(base + newPos);
            }
            return char;
        });
    }

    static xorCipher(text, key) {
        if (typeof text !== 'string') return '';
        if (!key) key = 'key';
        
        key = key.toString();
        let result = '';
        for (let i = 0; i < text.length; i++) {
            const keyChar = key.charCodeAt(i % key.length);
            result += String.fromCharCode(text.charCodeAt(i) ^ keyChar);
        }
        return result;
    }
}