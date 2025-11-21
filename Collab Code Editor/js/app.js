// Main Application Controller
class CollabCodeApp {
    constructor() {
        this.currentUser = null;
        this.currentProject = null;
        this.collaborators = [];
        this.isConnected = false;
        this.editor = null;
        this.fileSystem = null;
        this.gitIntegration = null;
        
        this.init();
    }
    
    init() {
        this.initializeAuth();
        this.initializeEventListeners();
        this.initializeEditor();
        this.initializeFileSystem();
        this.initializeGitIntegration();
        this.initializeCollaboration();
        
        // Check if user is already authenticated
        this.checkAuthStatus();
    }
    
    initializeAuth() {
        // Auth event listeners
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });
        
        document.getElementById('register-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });
        
        // Auth tabs
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.target.getAttribute('data-tab');
                this.switchAuthTab(tabName);
            });
        });
    }
    
    initializeEventListeners() {
        // Sidebar toggle
        document.getElementById('sidebar-toggle').addEventListener('click', () => {
            this.toggleSidebar();
        });
        
        // Terminal toggle
        document.getElementById('terminal-toggle').addEventListener('click', () => {
            this.toggleTerminal();
        });
        
        document.getElementById('terminal-close').addEventListener('click', () => {
            this.toggleTerminal();
        });
        
        // Share modal
        document.getElementById('share-btn').addEventListener('click', () => {
            this.openShareModal();
        });
        
        document.querySelector('#share-modal .close').addEventListener('click', () => {
            this.closeShareModal();
        });
        
        // Theme toggle
        document.getElementById('theme-select').addEventListener('change', (e) => {
            this.changeTheme(e.target.value);
        });
        
        // File tree interactions
        this.initializeFileTree();
        
        // Branch selector
        document.getElementById('branch-select').addEventListener('change', (e) => {
            this.switchBranch(e.target.value);
        });
        
        document.getElementById('new-branch-btn').addEventListener('click', () => {
            this.createNewBranch();
        });
    }
    
    initializeEditor() {
        this.editor = new CodeEditor('code-editor');
        this.editor.onChange((content) => {
            this.handleFileChange(content);
        });
        
        // Format button
        document.getElementById('format-btn').addEventListener('click', () => {
            this.editor.formatCode();
        });
        
        // Language selector
        document.getElementById('language-select').addEventListener('change', (e) => {
            this.editor.setLanguage(e.target.value);
        });
    }
    
    initializeFileSystem() {
        this.fileSystem = new FileSystem();
        this.fileSystem.onFileSelect((file) => {
            this.openFile(file);
        });
    }
    
    initializeGitIntegration() {
        this.gitIntegration = new GitIntegration();
        this.gitIntegration.onCommit(() => {
            this.refreshGitStatus();
        });
        
        // Git buttons
        document.getElementById('git-commit').addEventListener('click', () => {
            this.gitIntegration.commitChanges();
        });
        
        document.getElementById('git-push').addEventListener('click', () => {
            this.gitIntegration.pushToRemote();
        });
        
        document.getElementById('git-pull').addEventListener('click', () => {
            this.gitIntegration.pullFromRemote();
        });
    }
    
    initializeCollaboration() {
        this.collaboration = new Collaboration();
        this.collaboration.onUserJoin((user) => {
            this.addCollaborator(user);
        });
        
        this.collaboration.onUserLeave((userId) => {
            this.removeCollaborator(userId);
        });
        
        this.collaboration.onContentChange((changes) => {
            this.editor.applyRemoteChanges(changes);
        });
        
        // Chat
        document.getElementById('send-message').addEventListener('click', () => {
            this.sendChatMessage();
        });
        
        document.getElementById('chat-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendChatMessage();
            }
        });
    }
    
    initializeFileTree() {
        // File tree expansion
        document.querySelectorAll('.file-header').forEach(header => {
            header.addEventListener('click', (e) => {
                const folder = e.target.closest('.folder');
                if (folder) {
                    folder.classList.toggle('expanded');
                    const icon = folder.querySelector('.fa-chevron-right, .fa-chevron-down');
                    if (icon) {
                        if (folder.classList.contains('expanded')) {
                            icon.classList.replace('fa-chevron-right', 'fa-chevron-down');
                        } else {
                            icon.classList.replace('fa-chevron-down', 'fa-chevron-right');
                        }
                    }
                }
            });
        });
        
        // File selection
        document.querySelectorAll('.file-item.file').forEach(file => {
            file.addEventListener('click', (e) => {
                document.querySelectorAll('.file-item.file').forEach(f => f.classList.remove('active'));
                file.classList.add('active');
                
                const fileName = file.querySelector('span').textContent;
                this.fileSystem.selectFile(fileName);
            });
        });
    }
    
    // Authentication Methods
    async handleLogin() {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        try {
            // Simulate API call
            const user = await this.mockLogin(email, password);
            this.currentUser = user;
            this.showApp();
        } catch (error) {
            this.showError('Login failed: ' + error.message);
        }
    }
    
    async handleRegister() {
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const confirm = document.getElementById('register-confirm').value;
        
        if (password !== confirm) {
            this.showError('Passwords do not match');
            return;
        }
        
        try {
            // Simulate API call
            const user = await this.mockRegister(name, email, password);
            this.currentUser = user;
            this.showApp();
        } catch (error) {
            this.showError('Registration failed: ' + error.message);
        }
    }
    
    switchAuthTab(tabName) {
        document.querySelectorAll('.auth-tab').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
        
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`${tabName}-form`).classList.add('active');
    }
    
    checkAuthStatus() {
        const savedUser = localStorage.getItem('collabcode_user');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.showApp();
        }
    }
    
    showApp() {
        document.getElementById('auth-modal').classList.remove('active');
        document.getElementById('app').classList.add('active');
        
        // Update UI with user info
        document.getElementById('username').textContent = this.currentUser.name;
        document.getElementById('user-avatar').textContent = this.currentUser.name.charAt(0).toUpperCase();
        
        // Initialize collaboration
        this.collaboration.connect(this.currentUser);
    }
    
    // Mock authentication methods (replace with real API calls)
    async mockLogin(email, password) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (email && password) {
                    const user = {
                        id: 'user_' + Date.now(),
                        name: email.split('@')[0],
                        email: email,
                        avatar: email.charAt(0).toUpperCase()
                    };
                    localStorage.setItem('collabcode_user', JSON.stringify(user));
                    resolve(user);
                } else {
                    reject(new Error('Invalid credentials'));
                }
            }, 1000);
        });
    }
    
    async mockRegister(name, email, password) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (name && email && password) {
                    const user = {
                        id: 'user_' + Date.now(),
                        name: name,
                        email: email,
                        avatar: name.charAt(0).toUpperCase()
                    };
                    localStorage.setItem('collabcode_user', JSON.stringify(user));
                    resolve(user);
                } else {
                    reject(new Error('Registration failed'));
                }
            }, 1000);
        });
    }
    
    // UI Methods
    toggleSidebar() {
        document.getElementById('sidebar').classList.toggle('collapsed');
    }
    
    toggleTerminal() {
        document.getElementById('terminal').classList.toggle('active');
    }
    
    openShareModal() {
        document.getElementById('share-modal').classList.add('active');
        // Generate share URL
        const shareUrl = `${window.location.origin}${window.location.pathname}?project=${this.currentProject?.id || 'default'}`;
        document.getElementById('share-url').value = shareUrl;
    }
    
    closeShareModal() {
        document.getElementById('share-modal').classList.remove('active');
    }
    
    changeTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        localStorage.setItem('collabcode_theme', theme);
    }
    
    // File Methods
    openFile(file) {
        this.editor.setContent(file.content || '');
        this.editor.setLanguage(this.getLanguageFromFile(file.name));
        
        // Update active tab
        this.updateEditorTab(file.name);
    }
    
    updateEditorTab(fileName) {
        const tabsContainer = document.getElementById('editor-tabs');
        let existingTab = Array.from(tabsContainer.children).find(tab => 
            tab.getAttribute('data-file') === fileName
        );
        
        if (!existingTab) {
            existingTab = document.createElement('div');
            existingTab.className = 'editor-tab active';
            existingTab.setAttribute('data-file', fileName);
            existingTab.innerHTML = `
                <span>${fileName}</span>
                <button class="tab-close">&times;</button>
            `;
            tabsContainer.appendChild(existingTab);
            
            // Add close event
            existingTab.querySelector('.tab-close').addEventListener('click', (e) => {
                e.stopPropagation();
                this.closeTab(fileName);
            });
        }
        
        // Set active tab
        document.querySelectorAll('.editor-tab').forEach(tab => tab.classList.remove('active'));
        existingTab.classList.add('active');
    }
    
    closeTab(fileName) {
        const tab = document.querySelector(`[data-file="${fileName}"]`);
        if (tab) {
            tab.remove();
        }
    }
    
    getLanguageFromFile(fileName) {
        const extension = fileName.split('.').pop();
        const languageMap = {
            'html': 'html',
            'css': 'css',
            'js': 'javascript',
            'py': 'python',
            'java': 'java',
            'json': 'javascript'
        };
        return languageMap[extension] || 'text';
    }
    
    handleFileChange(content) {
        if (this.currentFile) {
            this.fileSystem.updateFile(this.currentFile, content);
            this.gitIntegration.addChange(this.currentFile, content);
            this.collaboration.broadcastChange(content);
        }
    }
    
    // Git Methods
    switchBranch(branchName) {
        this.gitIntegration.switchBranch(branchName);
        this.refreshGitStatus();
    }
    
    createNewBranch() {
        const branchName = prompt('Enter new branch name:');
        if (branchName) {
            this.gitIntegration.createBranch(branchName);
            this.refreshBranchSelector();
        }
    }
    
    refreshBranchSelector() {
        const selector = document.getElementById('branch-select');
        selector.innerHTML = '';
        
        this.gitIntegration.getBranches().forEach(branch => {
            const option = document.createElement('option');
            option.value = branch;
            option.textContent = branch;
            if (branch === this.gitIntegration.currentBranch) {
                option.selected = true;
            }
            selector.appendChild(option);
        });
    }
    
    refreshGitStatus() {
        const changes = this.gitIntegration.getChanges();
        this.updateChangesList(changes);
        
        const commits = this.gitIntegration.getRecentCommits();
        this.updateCommitList(commits);
    }
    
    updateChangesList(changes) {
        const changesList = document.getElementById('changes-list');
        changesList.innerHTML = '';
        
        changes.forEach(change => {
            const item = document.createElement('div');
            item.className = 'change-item';
            item.innerHTML = `
                <div class="change-status ${change.status}"></div>
                <div class="change-file">${change.file}</div>
            `;
            changesList.appendChild(item);
        });
    }
    
    updateCommitList(commits) {
        const commitList = document.getElementById('commit-list');
        commitList.innerHTML = '';
        
        commits.forEach(commit => {
            const item = document.createElement('div');
            item.className = 'commit-item';
            item.innerHTML = `
                <div class="commit-hash">${commit.hash.substring(0, 7)}</div>
                <div class="commit-message">${commit.message}</div>
                <div class="commit-author">${commit.author} • ${commit.date}</div>
            `;
            commitList.appendChild(item);
        });
    }
    
    // Collaboration Methods
    addCollaborator(user) {
        this.collaborators.push(user);
        this.updateCollaboratorsList();
        this.updateOnlineUsers();
    }
    
    removeCollaborator(userId) {
        this.collaborators = this.collaborators.filter(user => user.id !== userId);
        this.updateCollaboratorsList();
        this.updateOnlineUsers();
    }
    
    updateCollaboratorsList() {
        const list = document.getElementById('collaborators-list');
        list.innerHTML = '';
        
        this.collaborators.forEach(user => {
            const collaborator = document.createElement('div');
            collaborator.className = 'collaborator';
            collaborator.innerHTML = `
                <div class="collaborator-avatar">${user.avatar}</div>
                <div class="collaborator-info">
                    <div class="collaborator-name">${user.name}</div>
                    <div class="collaborator-role">Collaborator</div>
                </div>
            `;
            list.appendChild(collaborator);
        });
    }
    
    updateOnlineUsers() {
        const count = this.collaborators.length + 1; // +1 for current user
        document.getElementById('online-users').textContent = `${count} users online`;
    }
    
    sendChatMessage() {
        const input = document.getElementById('chat-input');
        const message = input.value.trim();
        
        if (message) {
            this.collaboration.sendMessage(message);
            input.value = '';
        }
    }
    
    // Utility Methods
    showError(message) {
        alert(message); // Replace with better error UI
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new CollabCodeApp();
});