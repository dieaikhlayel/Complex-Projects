// Code Editor Class
class CodeEditor {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.content = '';
        this.language = 'html';
        this.isFocused = false;
        
        this.init();
    }
    
    init() {
        this.setupEditor();
        this.setupEventListeners();
        this.loadInitialContent();
    }
    
    setupEditor() {
        this.container.setAttribute('contenteditable', 'true');
        this.container.setAttribute('spellcheck', 'false');
        this.container.classList.add('code-editor');
    }
    
    setupEventListeners() {
        // Input events
        this.container.addEventListener('input', (e) => {
            this.content = e.target.innerText;
            this.highlightSyntax();
            if (this.onChangeCallback) {
                this.onChangeCallback(this.content);
            }
        });
        
        // Focus events
        this.container.addEventListener('focus', () => {
            this.isFocused = true;
            this.container.classList.add('focused');
        });
        
        this.container.addEventListener('blur', () => {
            this.isFocused = false;
            this.container.classList.remove('focused');
        });
        
        // Tab key handling
        this.container.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                e.preventDefault();
                this.insertTab();
            }
            
            // Auto-indent on enter
            if (e.key === 'Enter') {
                setTimeout(() => {
                    this.autoIndent();
                }, 0);
            }
        });
        
        // Paste event for cleaning up pasted text
        this.container.addEventListener('paste', (e) => {
            e.preventDefault();
            const text = e.clipboardData.getData('text/plain');
            this.insertText(text);
        });
    }
    
    loadInitialContent() {
        const initialContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Project</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <h1>Welcome to CollabCode!</h1>
    <p>Start coding collaboratively...</p>
    <script src="app.js"></script>
</body>
</html>`;
        
        this.setContent(initialContent);
    }
    
    setContent(content) {
        this.content = content;
        this.container.innerText = content;
        this.highlightSyntax();
    }
    
    getContent() {
        return this.content;
    }
    
    setLanguage(language) {
        this.language = language;
        this.highlightSyntax();
    }
    
    onChange(callback) {
        this.onChangeCallback = callback;
    }
    
    insertTab() {
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        
        const tabNode = document.createTextNode('  '); // 2 spaces
        range.insertNode(tabNode);
        
        // Move cursor after the tab
        range.setStartAfter(tabNode);
        range.setEndAfter(tabNode);
        selection.removeAllRanges();
        selection.addRange(range);
    }
    
    insertText(text) {
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        
        // Clean up the text (remove formatting)
        const cleanText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        const textNode = document.createTextNode(cleanText);
        
        range.deleteContents();
        range.insertNode(textNode);
        
        // Move cursor to the end of inserted text
        range.setStartAfter(textNode);
        range.setEndAfter(textNode);
        selection.removeAllRanges();
        selection.addRange(range);
    }
    
    autoIndent() {
        // Basic auto-indent implementation
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        const lineStart = this.getLineStartPosition(range.startContainer, range.startOffset);
        
        // Get indentation of previous line
        const previousLine = this.getPreviousLine(range.startContainer);
        if (previousLine) {
            const indent = this.getLineIndentation(previousLine);
            this.insertText(indent);
        }
    }
    
    getLineStartPosition(node, offset) {
        // Implementation for finding line start position
        // This is a simplified version
        return { node, offset };
    }
    
    getPreviousLine(node) {
        // Implementation for getting previous line
        // This is a simplified version
        return null;
    }
    
    getLineIndentation(line) {
        // Implementation for getting line indentation
        // This is a simplified version
        return '  ';
    }
    
    highlightSyntax() {
        if (!this.content) return;
        
        let highlighted = this.content;
        
        // Basic syntax highlighting based on language
        switch (this.language) {
            case 'html':
                highlighted = this.highlightHTML(highlighted);
                break;
            case 'css':
                highlighted = this.highlightCSS(highlighted);
                break;
            case 'javascript':
                highlighted = this.highlightJavaScript(highlighted);
                break;
            case 'python':
                highlighted = this.highlightPython(highlighted);
                break;
            case 'java':
                highlighted = this.highlightJava(highlighted);
                break;
        }
        
        // Preserve cursor position
        const selection = window.getSelection();
        const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
        
        this.container.innerHTML = highlighted;
        
        // Restore cursor position
        if (range) {
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }
    
    highlightHTML(code) {
        return code
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/(&lt;\/?)(\w+)/g, '$1<span class="keyword">$2</span>')
            .replace(/(\w+)=/g, '<span class="attribute">$1</span>=')
            .replace(/(".*?"|'.*?')/g, '<span class="string">$1</span>')
            .replace(/&lt;!--.*?--&gt;/g, '<span class="comment">$&</span>');
    }
    
    highlightCSS(code) {
        return code
            .replace(/(\.[\w-]+|#[\w-]+|[\w-]+)\s*{/g, '<span class="selector">$1</span>{')
            .replace(/([\w-]+)\s*:/g, '<span class="property">$1</span>:')
            .replace(/:\s*([^;]+);/g, ': <span class="value">$1</span>;')
            .replace(/\/\*.*?\*\//g, '<span class="comment">$&</span>');
    }
    
    highlightJavaScript(code) {
        return code
            .replace(/\b(function|var|let|const|if|else|for|while|return|class|import|export|from)\b/g, '<span class="keyword">$1</span>')
            .replace(/\b(\d+)\b/g, '<span class="number">$1</span>')
            .replace(/(".*?"|'.*?')/g, '<span class="string">$1</span>')
            .replace(/(\/\/.*$|\/\*[\s\S]*?\*\/)/gm, '<span class="comment">$1</span>')
            .replace(/\b([A-Z][\w]*)\b/g, '<span class="class">$1</span>')
            .replace(/(\w+)\s*\(/g, '<span class="function">$1</span>(');
    }
    
    highlightPython(code) {
        return code
            .replace(/\b(def|class|if|else|elif|for|while|import|from|as|return|try|except|with)\b/g, '<span class="keyword">$1</span>')
            .replace(/\b(\d+)\b/g, '<span class="number">$1</span>')
            .replace(/("""[\s\S]*?"""|'''[\s\S]*?'''|".*?"|'.*?')/g, '<span class="string">$1</span>')
            .replace/(#.*$)/gm, '<span class="comment">$1</span>');
    }
    
    highlightJava(code) {
        return code
            .replace(/\b(public|private|protected|class|interface|extends|implements|static|final|void|int|String|boolean|if|else|for|while|return|new|this)\b/g, '<span class="keyword">$1</span>')
            .replace(/\b(\d+)\b/g, '<span class="number">$1</span>')
            .replace(/(".*?")/g, '<span class="string">$1</span>')
            .replace(/(\/\/.*$|\/\*[\s\S]*?\*\/)/gm, '<span class="comment">$1</span>')
            .replace(/(\w+)\s*\(/g, '<span class="function">$1</span>(');
    }
    
    formatCode() {
        // Basic code formatting
        let formatted = this.content;
        
        switch (this.language) {
            case 'html':
                formatted = this.formatHTML(formatted);
                break;
            case 'css':
                formatted = this.formatCSS(formatted);
                break;
            case 'javascript':
                formatted = this.formatJavaScript(formatted);
                break;
        }
        
        this.setContent(formatted);
    }
    
    formatHTML(code) {
        // Basic HTML formatting
        return code
            .replace(/>\s+</g, '>\n<')
            .replace(/\s+/g, ' ')
            .trim();
    }
    
    formatCSS(code) {
        // Basic CSS formatting
        return code
            .replace(/\s*{\s*/g, ' {\n  ')
            .replace(/;\s*/g, ';\n  ')
            .replace(/\s*}\s*/g, '\n}\n')
            .replace(/\s+/g, ' ')
            .trim();
    }
    
    formatJavaScript(code) {
        // Basic JavaScript formatting
        return code
            .replace(/\s*{\s*/g, ' {\n  ')
            .replace(/;\s*/g, ';\n')
            .replace(/\s*}\s*/g, '\n}\n')
            .replace(/\s+/g, ' ')
            .trim();
    }
    
    applyRemoteChanges(changes) {
        // Apply changes from remote collaborators
        this.setContent(changes.content);
    }
    
    getCursorPosition() {
        const selection = window.getSelection();
        if (selection.rangeCount === 0) return { line: 0, column: 0 };
        
        const range = selection.getRangeAt(0);
        const preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(this.container);
        preCaretRange.setEnd(range.endContainer, range.endOffset);
        
        const text = preCaretRange.toString();
        const lines = text.split('\n');
        const line = lines.length;
        const column = lines[lines.length - 1].length + 1;
        
        return { line, column };
    }
    
    setCursorPosition(line, column) {
        // Implementation for setting cursor position
        // This is a simplified version
        this.container.focus();
    }
}