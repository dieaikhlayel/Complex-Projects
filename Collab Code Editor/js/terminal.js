// Terminal Emulation Class
class Terminal {
    constructor() {
        this.history = [];
        this.historyIndex = -1;
        this.currentDirectory = '/project';
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.showWelcomeMessage();
    }
    
    setupEventListeners() {
        const terminalInput = document.getElementById('terminal-input');
        const terminalOutput = document.getElementById('terminal-output');
        
        terminalInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.executeCommand(terminalInput.value);
                terminalInput.value = '';
                this.historyIndex = -1;
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.navigateHistory(-1);
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.navigateHistory(1);
            } else if (e.key === 'Tab') {
                e.preventDefault();
                this.autoComplete(terminalInput);
            }
        });
    }
    
    executeCommand(command) {
        if (!command.trim()) return;
        
        this.addToHistory(command);
        this.displayCommand(command);
        
        const [cmd, ...args] = command.trim().split(' ');
        const output = this.processCommand(cmd, args);
        
        this.displayOutput(output);
        this.scrollToBottom();
    }
    
    processCommand(command, args) {
        const commands = {
            'ls': () => this.listFiles(),
            'cd': () => this.changeDirectory(args[0]),
            'pwd': () => this.currentDirectory,
            'cat': () => this.readFile(args[0]),
            'mkdir': () => this.createDirectory(args[0]),
            'touch': () => this.createFile(args[0]),
            'rm': () => this.removeFile(args[0]),
            'git': () => this.gitCommand(args),
            'npm': () => this.npmCommand(args),
            'node': () => this.nodeCommand(args),
            'clear': () => this.clearTerminal(),
            'help': () => this.showHelp(),
            'echo': () => args.join(' ')
        };
        
        if (commands[command]) {
            try {
                return commands[command]();
            } catch (error) {
                return `Error: ${error.message}`;
            }
        } else {
            return `Command not found: ${command}. Type 'help' for available commands.`;
        }
    }
    
    listFiles() {
        const fileSystem = window.app?.fileSystem;
        if (!fileSystem) return 'No file system available';
        
        const files = fileSystem.getAllFiles();
        const fileList = files.map(file => {
            const isDirectory = file.path.includes('/') && file.path.split('/').length > 2;
            return isDirectory ? `${file.name}/` : file.name;
        }).join('  ');
        
        return fileList || 'No files in directory';
    }
    
    changeDirectory(path) {
        if (!path) return 'Usage: cd <directory>';
        
        if (path === '..') {
            this.currentDirectory = this.currentDirectory.split('/').slice(0, -1).join('/') || '/';
        } else if (path === '/') {
            this.currentDirectory = '/';
        } else {
            this.currentDirectory = `${this.currentDirectory}/${path}`.replace('//', '/');
        }
        
        return `Changed directory to ${this.currentDirectory}`;
    }
    
    readFile(filename) {
        if (!filename) return 'Usage: cat <filename>';
        
        const fileSystem = window.app?.fileSystem;
        if (!fileSystem) return 'No file system available';
        
        const file = fileSystem.getFile(`${this.currentDirectory}/${filename}`.replace('//', '/'));
        if (!file) return `File not found: ${filename}`;
        
        return file.content;
    }
    
    createDirectory(dirname) {
        if (!dirname) return 'Usage: mkdir <directory>';
        
        // In a real implementation, this would create a directory
        return `Created directory: ${dirname}`;
    }
    
    createFile(filename) {
        if (!filename) return 'Usage: touch <filename>';
        
        const fileSystem = window.app?.fileSystem;
        if (!fileSystem) return 'No file system available';
        
        const filePath = `${this.currentDirectory}/${filename}`.replace('//', '/');
        fileSystem.createFile(filePath, '');
        
        return `Created file: ${filename}`;
    }
    
    removeFile(filename) {
        if (!filename) return 'Usage: rm <filename>';
        
        // In a real implementation, this would delete the file
        return `Removed: ${filename}`;
    }
    
    gitCommand(args) {
        const git = window.app?.gitIntegration;
        if (!git) return 'Git integration not available';
        
        const subCommand = args[0];
        
        switch (subCommand) {
            case 'status':
                const changes = git.getChanges();
                if (changes.length === 0) {
                    return 'On branch ' + git.currentBranch + '\nNothing to commit, working tree clean';
                } else {
                    return changes.map(change => 
                        `${change.status.charAt(0).toUpperCase() + change.status.slice(1)}: ${change.file}`
                    ).join('\n');
                }
                
            case 'add':
                if (args[1]) {
                    git.stageFile(args[1]);
                    return `Staged: ${args[1]}`;
                } else {
                    return 'Usage: git add <file>';
                }
                
            case 'commit':
                const message = args.slice(1).join(' ').replace(/^"-m\s+"/, '').replace(/"$/, '');
                try {
                    const commit = git.commitChanges(message || 'Update files');
                    return `Committed: ${commit.hash.substring(0, 7)} - ${commit.message}`;
                } catch (error) {
                    return error.message;
                }
                
            case 'log':
                const commits = git.getRecentCommits(10);
                return commits.map(commit => 
                    `commit ${commit.hash}\nAuthor: ${commit.author}\nDate: ${commit.date}\n\n    ${commit.message}`
                ).join('\n\n');
                
            case 'branch':
                const branches = git.getBranches();
                return branches.map(branch => 
                    branch === git.currentBranch ? `* ${branch}` : `  ${branch}`
                ).join('\n');
                
            default:
                return `Git subcommand not supported: ${subCommand}`;
        }
    }
    
    npmCommand(args) {
        const subCommand = args[0];
        
        switch (subCommand) {
            case 'install':
                return 'Installing dependencies...\n' + 
                       'added 125 packages, and audited 126 packages in 3s\n' +
                       'found 0 vulnerabilities';
                
            case 'start':
                return 'Starting development server...\n' +
                       'Server running at http://localhost:3000';
                
            case 'run':
                const script = args[1];
                return `Running script: ${script}\nScript executed successfully`;
                
            default:
                return `npm ${subCommand} executed`;
        }
    }
    
    nodeCommand(args) {
        if (args[0]) {
            return `Executing ${args[0]} with Node.js\nOutput would appear here...`;
        } else {
            return 'Usage: node <filename>';
        }
    }
    
    clearTerminal() {
        document.getElementById('terminal-output').innerHTML = '';
        return '';
    }
    
    showHelp() {
        return `Available commands:
ls - List files
cd <dir> - Change directory
pwd - Show current directory
cat <file> - Display file content
mkdir <dir> - Create directory
touch <file> - Create file
rm <file> - Remove file
git <command> - Git operations
npm <command> - Node package manager
node <file> - Execute JavaScript file
clear - Clear terminal
help - Show this help message
echo <text> - Display text`;
    }
    
    showWelcomeMessage() {
        this.displayOutput('Welcome to CollabCode Terminal!\nType "help" for available commands.');
    }
    
    addToHistory(command) {
        this.history.push(command);
        if (this.history.length > 50) {
            this.history.shift();
        }
    }
    
    navigateHistory(direction) {
        const terminalInput = document.getElementById('terminal-input');
        
        if (direction === -1 && this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
        } else if (direction === 1 && this.historyIndex > 0) {
            this.historyIndex--;
        } else if (direction === 1 && this.historyIndex === 0) {
            this.historyIndex = -1;
            terminalInput.value = '';
            return;
        }
        
        if (this.historyIndex >= 0) {
            terminalInput.value = this.history[this.history.length - 1 - this.historyIndex];
        }
    }
    
    autoComplete(input) {
        // Basic auto-complete implementation
        const value = input.value;
        const commands = ['ls', 'cd', 'pwd', 'cat', 'mkdir', 'touch', 'rm', 'git', 'npm', 'node', 'clear', 'help', 'echo'];
        
        const matching = commands.filter(cmd => cmd.startsWith(value));
        if (matching.length === 1) {
            input.value = matching[0] + ' ';
        } else if (matching.length > 1) {
            this.displayOutput(matching.join('  '));
        }
    }
    
    displayCommand(command) {
        this.displayOutput(`<div class="terminal-output-line">$ <span style="color: #fff;">${command}</span></div>`);
    }
    
    displayOutput(output, isError = false) {
        const terminalOutput = document.getElementById('terminal-output');
        const outputClass = isError ? 'error' : '';
        
        if (typeof output === 'string') {
            const lines = output.split('\n');
            lines.forEach(line => {
                const outputLine = document.createElement('div');
                outputLine.className = `terminal-output-line ${outputClass}`;
                outputLine.textContent = line;
                terminalOutput.appendChild(outputLine);
            });
        }
    }
    
    scrollToBottom() {
        const terminalOutput = document.getElementById('terminal-output');
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
    }
}

// Initialize terminal when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.terminal = new Terminal();
});