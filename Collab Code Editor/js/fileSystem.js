// File System Management Class
class FileSystem {
    constructor() {
        this.files = new Map();
        this.currentFile = null;
        this.projectStructure = null;
        
        this.init();
    }
    
    init() {
        this.loadProjectStructure();
        this.loadFilesFromStorage();
    }
    
    loadProjectStructure() {
        this.projectStructure = {
            name: 'My Project',
            files: [
                { name: 'index.html', type: 'file', path: '/index.html' },
                { name: 'styles.css', type: 'file', path: '/styles.css' },
                { name: 'app.js', type: 'file', path: '/app.js' },
                { name: 'src', type: 'folder', path: '/src', children: [
                    { name: 'components', type: 'folder', path: '/src/components', children: [] },
                    { name: 'utils', type: 'folder', path: '/src/utils', children: [] }
                ]},
                { name: 'public', type: 'folder', path: '/public', children: [
                    { name: 'index.html', type: 'file', path: '/public/index.html' },
                    { name: 'favicon.ico', type: 'file', path: '/public/favicon.ico' }
                ]},
                { name: 'package.json', type: 'file', path: '/package.json' },
                { name: 'README.md', type: 'file', path: '/README.md' }
            ]
        };
    }
    
    loadFilesFromStorage() {
        const savedFiles = localStorage.getItem('collabcode_files');
        if (savedFiles) {
            this.files = new Map(JSON.parse(savedFiles));
        } else {
            this.initializeDefaultFiles();
        }
    }
    
    initializeDefaultFiles() {
        const defaultFiles = {
            '/index.html': `<!DOCTYPE html>
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
</html>`,
            
            '/styles.css': `body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 20px;
    background-color: #f5f5f5;
}

h1 {
    color: #333;
}

p {
    color: #666;
    line-height: 1.6;
}`,
            
            '/app.js': `// Main application script
console.log('Hello from CollabCode!');

function init() {
    // Initialize your application here
    console.log('Application initialized');
}

document.addEventListener('DOMContentLoaded', init);`,
            
            '/package.json': `{
  "name": "my-project",
  "version": "1.0.0",
  "description": "A collaborative coding project",
  "main": "app.js",
  "scripts": {
    "start": "node app.js",
    "dev": "nodemon app.js"
  },
  "dependencies": {},
  "devDependencies": {}
}`,
            
            '/README.md': `# My Project

This is a collaborative coding project created with CollabCode.

## Features

- Real-time collaboration
- Syntax highlighting
- Version control
- Live preview

## Getting Started

1. Open the project in CollabCode
2. Start coding with your team
3. Deploy when ready!`
        };
        
        Object.entries(defaultFiles).forEach(([path, content]) => {
            this.files.set(path, {
                name: path.split('/').pop(),
                path: path,
                content: content,
                lastModified: Date.now()
            });
        });
        
        this.saveFilesToStorage();
    }
    
    saveFilesToStorage() {
        const filesArray = Array.from(this.files.entries());
        localStorage.setItem('collabcode_files', JSON.stringify(filesArray));
    }
    
    getFile(path) {
        return this.files.get(path);
    }
    
    getAllFiles() {
        return Array.from(this.files.values());
    }
    
    createFile(path, content = '') {
        const file = {
            name: path.split('/').pop(),
            path: path,
            content: content,
            lastModified: Date.now()
        };
        
        this.files.set(path, file);
        this.saveFilesToStorage();
        
        if (this.onFileCreateCallback) {
            this.onFileCreateCallback(file);
        }
        
        return file;
    }
    
    updateFile(path, content) {
        const file = this.files.get(path);
        if (file) {
            file.content = content;
            file.lastModified = Date.now();
            this.files.set(path, file);
            this.saveFilesToStorage();
            
            if (this.onFileUpdateCallback) {
                this.onFileUpdateCallback(file);
            }
        }
    }
    
    deleteFile(path) {
        this.files.delete(path);
        this.saveFilesToStorage();
        
        if (this.onFileDeleteCallback) {
            this.onFileDeleteCallback(path);
        }
    }
    
    selectFile(fileName) {
        // Find file by name (simplified - should use full path)
        for (let [path, file] of this.files) {
            if (file.name === fileName) {
                this.currentFile = file;
                
                if (this.onFileSelectCallback) {
                    this.onFileSelectCallback(file);
                }
                return;
            }
        }
    }
    
    getProjectStructure() {
        return this.projectStructure;
    }
    
    // Callback registration
    onFileSelect(callback) {
        this.onFileSelectCallback = callback;
    }
    
    onFileCreate(callback) {
        this.onFileCreateCallback = callback;
    }
    
    onFileUpdate(callback) {
        this.onFileUpdateCallback = callback;
    }
    
    onFileDelete(callback) {
        this.onFileDeleteCallback = callback;
    }
    
    // Search functionality
    searchFiles(query) {
        const results = [];
        
        for (let [path, file] of this.files) {
            if (file.name.toLowerCase().includes(query.toLowerCase()) || 
                file.content.toLowerCase().includes(query.toLowerCase())) {
                results.push(file);
            }
        }
        
        return results;
    }
    
    // File operations
    renameFile(oldPath, newPath) {
        const file = this.files.get(oldPath);
        if (file) {
            file.path = newPath;
            file.name = newPath.split('/').pop();
            this.files.delete(oldPath);
            this.files.set(newPath, file);
            this.saveFilesToStorage();
        }
    }
    
    duplicateFile(path, newPath) {
        const originalFile = this.files.get(path);
        if (originalFile) {
            const duplicatedFile = {
                ...originalFile,
                path: newPath,
                name: newPath.split('/').pop(),
                lastModified: Date.now()
            };
            
            this.files.set(newPath, duplicatedFile);
            this.saveFilesToStorage();
            
            return duplicatedFile;
        }
        return null;
    }
}