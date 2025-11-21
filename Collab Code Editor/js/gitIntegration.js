// Git Integration Class
class GitIntegration {
    constructor() {
        this.commits = [];
        this.branches = ['main', 'develop'];
        this.currentBranch = 'main';
        this.stagedChanges = new Set();
        this.unstagedChanges = new Map();
        
        this.init();
    }
    
    init() {
        this.loadCommitsFromStorage();
        this.loadBranchesFromStorage();
        this.detectChanges();
    }
    
    loadCommitsFromStorage() {
        const savedCommits = localStorage.getItem('collabcode_commits');
        if (savedCommits) {
            this.commits = JSON.parse(savedCommits);
        } else {
            this.initializeDefaultCommits();
        }
    }
    
    loadBranchesFromStorage() {
        const savedBranches = localStorage.getItem('collabcode_branches');
        if (savedBranches) {
            this.branches = JSON.parse(savedBranches);
        }
        
        const currentBranch = localStorage.getItem('collabcode_current_branch');
        if (currentBranch) {
            this.currentBranch = currentBranch;
        }
    }
    
    initializeDefaultCommits() {
        this.commits = [
            {
                hash: this.generateHash(),
                message: 'Initial commit',
                author: 'System',
                timestamp: Date.now() - 86400000, // 1 day ago
                branch: 'main',
                files: ['/index.html', '/styles.css', '/app.js']
            },
            {
                hash: this.generateHash(),
                message: 'Add project documentation',
                author: 'System',
                timestamp: Date.now() - 43200000, // 12 hours ago
                branch: 'main',
                files: ['/package.json', '/README.md']
            }
        ];
        
        this.saveCommitsToStorage();
    }
    
    generateHash() {
        return Math.random().toString(36).substring(2, 15) + 
               Math.random().toString(36).substring(2, 15);
    }
    
    saveCommitsToStorage() {
        localStorage.setItem('collabcode_commits', JSON.stringify(this.commits));
    }
    
    saveBranchesToStorage() {
        localStorage.setItem('collabcode_branches', JSON.stringify(this.branches));
        localStorage.setItem('collabcode_current_branch', this.currentBranch);
    }
    
    detectChanges() {
        // Compare current files with last commit to detect changes
        // This is a simplified implementation
        this.unstagedChanges.clear();
        
        const fileSystem = window.app?.fileSystem;
        if (fileSystem) {
            const files = fileSystem.getAllFiles();
            
            files.forEach(file => {
                // Simple change detection based on last modified
                const lastCommit = this.getFileLastCommit(file.path);
                
                if (!lastCommit || file.lastModified > lastCommit.timestamp) {
                    this.unstagedChanges.set(file.path, {
                        file: file.path,
                        status: lastCommit ? 'modified' : 'added',
                        changes: this.calculateChanges(lastCommit?.content, file.content)
                    });
                }
            });
            
            // Check for deleted files
            const lastCommitFiles = this.getLastCommitFiles();
            lastCommitFiles.forEach(filePath => {
                if (!files.find(f => f.path === filePath)) {
                    this.unstagedChanges.set(filePath, {
                        file: filePath,
                        status: 'deleted',
                        changes: []
                    });
                }
            });
        }
    }
    
    getFileLastCommit(filePath) {
        for (let i = this.commits.length - 1; i >= 0; i--) {
            if (this.commits[i].files.includes(filePath)) {
                return this.commits[i];
            }
        }
        return null;
    }
    
    getLastCommitFiles() {
        if (this.commits.length === 0) return [];
        return this.commits[this.commits.length - 1].files;
    }
    
    calculateChanges(oldContent, newContent) {
        // Simple line-based diff (in a real app, use a proper diff algorithm)
        if (!oldContent) return [{ type: 'added', line: newContent }];
        if (!newContent) return [{ type: 'deleted', line: oldContent }];
        
        const oldLines = oldContent.split('\n');
        const newLines = newContent.split('\n');
        const changes = [];
        
        const maxLength = Math.max(oldLines.length, newLines.length);
        
        for (let i = 0; i < maxLength; i++) {
            if (i >= oldLines.length) {
                changes.push({ type: 'added', line: newLines[i] });
            } else if (i >= newLines.length) {
                changes.push({ type: 'deleted', line: oldLines[i] });
            } else if (oldLines[i] !== newLines[i]) {
                changes.push(
                    { type: 'deleted', line: oldLines[i] },
                    { type: 'added', line: newLines[i] }
                );
            }
        }
        
        return changes;
    }
    
    addChange(filePath, content) {
        this.unstagedChanges.set(filePath, {
            file: filePath,
            status: 'modified',
            changes: []
        });
    }
    
    stageFile(filePath) {
        if (this.unstagedChanges.has(filePath)) {
            this.stagedChanges.add(filePath);
        }
    }
    
    unstageFile(filePath) {
        this.stagedChanges.delete(filePath);
    }
    
    commitChanges(message = 'Update files') {
        if (this.stagedChanges.size === 0 && this.unstagedChanges.size === 0) {
            throw new Error('No changes to commit');
        }
        
        const commit = {
            hash: this.generateHash(),
            message: message,
            author: window.app?.currentUser?.name || 'Unknown',
            timestamp: Date.now(),
            branch: this.currentBranch,
            files: Array.from(this.stagedChanges)
        };
        
        this.commits.push(commit);
        this.saveCommitsToStorage();
        
        // Clear staged changes
        this.stagedChanges.clear();
        this.detectChanges();
        
        if (this.onCommitCallback) {
            this.onCommitCallback(commit);
        }
        
        return commit;
    }
    
    switchBranch(branchName) {
        if (!this.branches.includes(branchName)) {
            throw new Error(`Branch ${branchName} does not exist`);
        }
        
        this.currentBranch = branchName;
        this.saveBranchesToStorage();
        
        // In a real app, this would switch the working directory
        console.log(`Switched to branch ${branchName}`);
    }
    
    createBranch(branchName) {
        if (this.branches.includes(branchName)) {
            throw new Error(`Branch ${branchName} already exists`);
        }
        
        this.branches.push(branchName);
        this.saveBranchesToStorage();
        
        console.log(`Created branch ${branchName}`);
    }
    
    deleteBranch(branchName) {
        if (branchName === 'main') {
            throw new Error('Cannot delete main branch');
        }
        
        if (this.currentBranch === branchName) {
            throw new Error('Cannot delete current branch');
        }
        
        const index = this.branches.indexOf(branchName);
        if (index > -1) {
            this.branches.splice(index, 1);
            this.saveBranchesToStorage();
        }
    }
    
    mergeBranch(sourceBranch, targetBranch = this.currentBranch) {
        // Simplified merge implementation
        console.log(`Merging ${sourceBranch} into ${targetBranch}`);
        
        // In a real app, this would handle conflicts and merge changes
        const mergeCommit = {
            hash: this.generateHash(),
            message: `Merge branch ${sourceBranch}`,
            author: window.app?.currentUser?.name || 'Unknown',
            timestamp: Date.now(),
            branch: targetBranch,
            files: [],
            merge: {
                from: sourceBranch,
                into: targetBranch
            }
        };
        
        this.commits.push(mergeCommit);
        this.saveCommitsToStorage();
        
        return mergeCommit;
    }
    
    getBranches() {
        return this.branches;
    }
    
    getChanges() {
        return Array.from(this.unstagedChanges.values());
    }
    
    getStagedChanges() {
        return Array.from(this.stagedChanges);
    }
    
    getRecentCommits(limit = 5) {
        return this.commits
            .filter(commit => commit.branch === this.currentBranch)
            .slice(-limit)
            .reverse()
            .map(commit => ({
                hash: commit.hash,
                message: commit.message,
                author: commit.author,
                date: new Date(commit.timestamp).toLocaleDateString()
            }));
    }
    
    getCommitHistory() {
        return this.commits.map(commit => ({
            ...commit,
            date: new Date(commit.timestamp).toLocaleString()
        }));
    }
    
    pushToRemote() {
        // Simulate pushing to remote repository
        console.log('Pushing changes to remote...');
        
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Successfully pushed to remote');
                resolve();
            }, 1000);
        });
    }
    
    pullFromRemote() {
        // Simulate pulling from remote repository
        console.log('Pulling changes from remote...');
        
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Successfully pulled from remote');
                resolve();
            }, 1000);
        });
    }
    
    // Callback registration
    onCommit(callback) {
        this.onCommitCallback = callback;
    }
}