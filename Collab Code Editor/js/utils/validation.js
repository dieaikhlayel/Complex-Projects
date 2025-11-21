// Validation Utilities
class Validator {
    static validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    static validatePassword(password) {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        
        return {
            isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers,
            issues: {
                tooShort: password.length < minLength,
                noUpperCase: !hasUpperCase,
                noLowerCase: !hasLowerCase,
                noNumbers: !hasNumbers,
                noSpecialChar: !hasSpecialChar
            }
        };
    }
    
    static validateUsername(username) {
        const minLength = 3;
        const maxLength = 20;
        const validChars = /^[a-zA-Z0-9_-]+$/;
        
        return {
            isValid: username.length >= minLength && 
                     username.length <= maxLength && 
                     validChars.test(username),
            issues: {
                tooShort: username.length < minLength,
                tooLong: username.length > maxLength,
                invalidChars: !validChars.test(username)
            }
        };
    }
    
    static validateProjectName(name) {
        const minLength = 1;
        const maxLength = 50;
        const invalidChars = /[<>:"/\\|?*]/;
        
        return {
            isValid: name.length >= minLength && 
                     name.length <= maxLength && 
                     !invalidChars.test(name),
            issues: {
                tooShort: name.length < minLength,
                tooLong: name.length > maxLength,
                invalidChars: invalidChars.test(name)
            }
        };
    }
    
    static validateFileName(filename) {
        const maxLength = 255;
        const invalidChars = /[<>:"/\\|?*]/;
        const reservedNames = ['CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM2', 'COM3', 'COM4', 
                              'COM5', 'COM6', 'COM7', 'COM8', 'COM9', 'LPT1', 'LPT2', 
                              'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'];
        
        const nameWithoutExt = filename.split('.').slice(0, -1).join('.');
        const extension = filename.split('.').pop();
        
        return {
            isValid: filename.length <= maxLength && 
                     !invalidChars.test(filename) &&
                     !reservedNames.includes(nameWithoutExt.toUpperCase()),
            issues: {
                tooLong: filename.length > maxLength,
                invalidChars: invalidChars.test(filename),
                reservedName: reservedNames.includes(nameWithoutExt.toUpperCase())
            }
        };
    }
    
    static validateFileSize(size, maxSize = 10 * 1024 * 1024) { // 10MB default
        return {
            isValid: size <= maxSize,
            issues: {
                tooLarge: size > maxSize
            }
        };
    }
    
    static validateJSON(jsonString) {
        try {
            JSON.parse(jsonString);
            return { isValid: true, error: null };
        } catch (error) {
            return { isValid: false, error: error.message };
        }
    }
    
    static validateURL(url) {
        try {
            new URL(url);
            return { isValid: true, error: null };
        } catch (error) {
            return { isValid: false, error: 'Invalid URL format' };
        }
    }
    
    static validateHexColor(color) {
        const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
        return hexRegex.test(color);
    }
    
    static validateGitBranchName(branchName) {
        const invalidRegex = /\.\.|[:~^?*\\\s]|^[/-]|[/-]$|@\{|\.lock$/;
        const maxLength = 255;
        
        return {
            isValid: branchName.length > 0 && 
                     branchName.length <= maxLength && 
                     !invalidRegex.test(branchName),
            issues: {
                tooLong: branchName.length > maxLength,
                invalidChars: invalidRegex.test(branchName),
                empty: branchName.length === 0
            }
        };
    }
    
    static validateCommitMessage(message) {
        const minLength = 1;
        const maxLength = 500;
        
        return {
            isValid: message.length >= minLength && message.length <= maxLength,
            issues: {
                tooShort: message.length < minLength,
                tooLong: message.length > maxLength
            }
        };
    }
    
    static sanitizeHTML(html) {
        const temp = document.createElement('div');
        temp.textContent = html;
        return temp.innerHTML;
    }
    
    static sanitizeFilename(filename) {
        return filename.replace(/[<>:"/\\|?*]/g, '_');
    }
    
    // Form validation
    static validateForm(formData, rules) {
        const errors = {};
        let isValid = true;
        
        for (const [field, rule] of Object.entries(rules)) {
            const value = formData[field];
            const fieldErrors = [];
            
            if (rule.required && (!value || value.trim() === '')) {
                fieldErrors.push('This field is required');
            }
            
            if (value && rule.minLength && value.length < rule.minLength) {
                fieldErrors.push(`Must be at least ${rule.minLength} characters`);
            }
            
            if (value && rule.maxLength && value.length > rule.maxLength) {
                fieldErrors.push(`Must be at most ${rule.maxLength} characters`);
            }
            
            if (value && rule.pattern && !rule.pattern.test(value)) {
                fieldErrors.push(rule.message || 'Invalid format');
            }
            
            if (value && rule.validate && !rule.validate(value)) {
                fieldErrors.push(rule.message || 'Invalid value');
            }
            
            if (fieldErrors.length > 0) {
                errors[field] = fieldErrors;
                isValid = false;
            }
        }
        
        return { isValid, errors };
    }
    
    // Real-time validation with debouncing
    static createLiveValidator(rules) {
        const validate = Helpers.debounce((field, value, callback) => {
            const fieldRules = rules[field];
            if (!fieldRules) {
                callback([]);
                return;
            }
            
            const errors = [];
            
            if (fieldRules.required && (!value || value.trim() === '')) {
                errors.push('This field is required');
            }
            
            if (value && fieldRules.minLength && value.length < fieldRules.minLength) {
                errors.push(`Must be at least ${fieldRules.minLength} characters`);
            }
            
            if (value && fieldRules.maxLength && value.length > fieldRules.maxLength) {
                errors.push(`Must be at most ${fieldRules.maxLength} characters`);
            }
            
            if (value && fieldRules.pattern && !fieldRules.pattern.test(value)) {
                errors.push(fieldRules.message || 'Invalid format');
            }
            
            if (value && fieldRules.validate && !fieldRules.validate(value)) {
                errors.push(fieldRules.message || 'Invalid value');
            }
            
            callback(errors);
        }, 300);
        
        return validate;
    }
}