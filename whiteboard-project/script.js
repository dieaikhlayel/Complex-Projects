class CollaborativeWhiteboard {
    constructor() {
        this.canvas = document.getElementById('whiteboard');
        this.ctx = this.canvas.getContext('2d');
        this.currentTool = 'pencil';
        this.currentColor = '#000000';
        this.brushSize = 5;
        this.isDrawing = false;
        this.lastX = 0;
        this.lastY = 0;
        this.drawings = [];
        this.users = new Map();
        this.userId = this.generateUserId();
        this.userColor = this.generateUserColor();
        
        this.init();
        this.setupEventListeners();
        this.setupFakeWebSocket(); // Simulates real-time collaboration
        this.resizeCanvas();
    }

    init() {
        this.ctx.lineJoin = 'round';
        this.ctx.lineCap = 'round';
        this.updateRoomInfo();
        this.loadFromLocalStorage();
        this.drawExistingContent();
    }

    generateUserId() {
        return 'user_' + Math.random().toString(36).substr(2, 9);
    }

    generateUserColor() {
        const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    setupEventListeners() {
        // Canvas events
        this.canvas.addEventListener('mousedown', this.startDrawing.bind(this));
        this.canvas.addEventListener('mousemove', this.draw.bind(this));
        this.canvas.addEventListener('mouseup', this.stopDrawing.bind(this));
        this.canvas.addEventListener('mouseout', this.stopDrawing.bind(this));
        
        // Touch events for mobile
        this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this));
        this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this));
        this.canvas.addEventListener('touchend', this.stopDrawing.bind(this));

        // Tool buttons
        document.querySelectorAll('#toolButtons button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('#toolButtons button').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentTool = e.target.dataset.tool;
            });
        });

        // Color selection
        document.querySelectorAll('.color-option').forEach(option => {
            option.addEventListener('click', (e) => {
                document.querySelectorAll('.color-option').forEach(o => o.classList.remove('active'));
                e.target.classList.add('active');
                this.currentColor = e.target.dataset.color;
                document.getElementById('customColor').value = this.currentColor;
            });
        });

        document.getElementById('customColor').addEventListener('input', (e) => {
            this.currentColor = e.target.value;
            document.querySelectorAll('.color-option').forEach(o => o.classList.remove('active'));
        });

        // Brush size
        document.getElementById('brushSize').addEventListener('input', (e) => {
            this.brushSize = parseInt(e.target.value);
            document.getElementById('brushSizeValue').textContent = this.brushSize;
        });

        // Control buttons
        document.getElementById('clearBtn').addEventListener('click', this.clearCanvas.bind(this));
        document.getElementById('saveBtn').addEventListener('click', this.saveDrawing.bind(this));

        // Window resize
        window.addEventListener('resize', this.resizeCanvas.bind(this));
    }

    resizeCanvas() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
        this.drawExistingContent();
    }

    startDrawing(e) {
        this.isDrawing = true;
        const pos = this.getMousePos(e);
        [this.lastX, this.lastY] = [pos.x, pos.y];
        
        if (this.currentTool === 'rectangle' || this.currentTool === 'circle' || this.currentTool === 'line') {
            this.tempStartX = this.lastX;
            this.tempStartY = this.lastY;
        }
    }

    draw(e) {
        if (!this.isDrawing) return;

        const pos = this.getMousePos(e);
        const currentX = pos.x;
        const currentY = pos.y;

        this.ctx.strokeStyle = this.currentColor;
        this.ctx.lineWidth = this.brushSize;

        switch (this.currentTool) {
            case 'pencil':
                this.ctx.globalCompositeOperation = 'source-over';
                this.ctx.beginPath();
                this.ctx.moveTo(this.lastX, this.lastY);
                this.ctx.lineTo(currentX, currentY);
                this.ctx.stroke();
                this.addDrawing('pencil', this.lastX, this.lastY, currentX, currentY);
                [this.lastX, this.lastY] = [currentX, currentY];
                break;

            case 'eraser':
                this.ctx.globalCompositeOperation = 'destination-out';
                this.ctx.beginPath();
                this.ctx.moveTo(this.lastX, this.lastY);
                this.ctx.lineTo(currentX, currentY);
                this.ctx.stroke();
                this.addDrawing('eraser', this.lastX, this.lastY, currentX, currentY);
                [this.lastX, this.lastY] = [currentX, currentY];
                break;

            case 'line':
            case 'rectangle':
            case 'circle':
                this.drawExistingContent();
                this.drawTempShape(this.tempStartX, this.tempStartY, currentX, currentY);
                break;
        }
    }

    drawTempShape(startX, startY, endX, endY) {
        this.ctx.strokeStyle = this.currentColor;
        this.ctx.lineWidth = this.brushSize;
        this.ctx.globalCompositeOperation = 'source-over';

        switch (this.currentTool) {
            case 'line':
                this.ctx.beginPath();
                this.ctx.moveTo(startX, startY);
                this.ctx.lineTo(endX, endY);
                this.ctx.stroke();
                break;

            case 'rectangle':
                this.ctx.strokeRect(startX, startY, endX - startX, endY - startY);
                break;

            case 'circle':
                const radius = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
                this.ctx.beginPath();
                this.ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
                this.ctx.stroke();
                break;
        }
    }

    stopDrawing(e) {
        if (!this.isDrawing) return;

        if (this.currentTool === 'line' || this.currentTool === 'rectangle' || this.currentTool === 'circle') {
            const pos = this.getMousePos(e);
            this.addDrawing(this.currentTool, this.tempStartX, this.tempStartY, pos.x, pos.y);
            this.broadcastDrawing();
        } else {
            this.broadcastDrawing();
        }

        this.isDrawing = false;
        this.ctx.beginPath();
    }

    addDrawing(type, x1, y1, x2, y2, color = this.currentColor, size = this.brushSize) {
        const drawing = {
            type,
            x1, y1, x2, y2,
            color,
            size,
            userId: this.userId,
            timestamp: Date.now()
        };

        this.drawings.push(drawing);
        this.saveToLocalStorage();
    }

    drawExistingContent() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.drawings.forEach(drawing => {
            this.ctx.strokeStyle = drawing.color;
            this.ctx.lineWidth = drawing.size;
            this.ctx.globalCompositeOperation = drawing.type === 'eraser' ? 'destination-out' : 'source-over';

            switch (drawing.type) {
                case 'pencil':
                case 'eraser':
                    this.ctx.beginPath();
                    this.ctx.moveTo(drawing.x1, drawing.y1);
                    this.ctx.lineTo(drawing.x2, drawing.y2);
                    this.ctx.stroke();
                    break;

                case 'line':
                    this.ctx.beginPath();
                    this.ctx.moveTo(drawing.x1, drawing.y1);
                    this.ctx.lineTo(drawing.x2, drawing.y2);
                    this.ctx.stroke();
                    break;

                case 'rectangle':
                    this.ctx.strokeRect(drawing.x1, drawing.y1, drawing.x2 - drawing.x1, drawing.y2 - drawing.y1);
                    break;

                case 'circle':
                    const radius = Math.sqrt(Math.pow(drawing.x2 - drawing.x1, 2) + Math.pow(drawing.y2 - drawing.y1, 2));
                    this.ctx.beginPath();
                    this.ctx.arc(drawing.x1, drawing.y1, radius, 0, 2 * Math.PI);
                    this.ctx.stroke();
                    break;
            }
        });
    }

    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);
        
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    }

    handleTouchStart(e) {
        e.preventDefault();
        this.startDrawing(e.touches[0]);
    }

    handleTouchMove(e) {
        e.preventDefault();
        this.draw(e.touches[0]);
    }

    clearCanvas() {
        if (confirm('Are you sure you want to clear the canvas? This will clear for all users.')) {
            this.drawings = [];
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.saveToLocalStorage();
            this.broadcastClear();
            this.showToast('Canvas cleared for all users');
        }
    }

    saveDrawing() {
        const dataURL = this.canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `whiteboard-${new Date().toISOString().slice(0, 10)}.png`;
        link.href = dataURL;
        link.click();
        this.showToast('Drawing saved as PNG');
    }

    // Fake WebSocket simulation for collaboration
    setupFakeWebSocket() {
        // Simulate receiving drawings from other users
        setInterval(() => {
            if (Math.random() < 0.3) { // 30% chance every 2 seconds
                this.simulateOtherUserDrawing();
            }
        }, 2000);

        // Simulate user presence
        setInterval(() => {
            this.simulateUserActivity();
        }, 5000);
    }

    simulateOtherUserDrawing() {
        const tools = ['pencil', 'line', 'rectangle', 'circle'];
        const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'];
        
        const fakeDrawing = {
            type: tools[Math.floor(Math.random() * tools.length)],
            x1: Math.random() * this.canvas.width,
            y1: Math.random() * this.canvas.height,
            x2: Math.random() * this.canvas.width,
            y2: Math.random() * this.canvas.height,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: Math.floor(Math.random() * 10) + 2,
            userId: 'user_' + Math.random().toString(36).substr(2, 5),
            timestamp: Date.now()
        };

        this.drawings.push(fakeDrawing);
        this.drawExistingContent();
        this.saveToLocalStorage();
    }

    simulateUserActivity() {
        const fakeUsers = [
            { id: 'user_abc123', name: 'Alice', color: '#ff4444' },
            { id: 'user_def456', name: 'Bob', color: '#44ff44' },
            { id: 'user_ghi789', name: 'Charlie', color: '#4444ff' }
        ];

        // Randomly add/remove users
        if (Math.random() < 0.5 && this.users.size < 3) {
            const user = fakeUsers[Math.floor(Math.random() * fakeUsers.length)];
            if (!this.users.has(user.id)) {
                this.users.set(user.id, user);
                this.updateUsersList();
                this.showToast(`${user.name} joined the whiteboard`);
            }
        } else if (this.users.size > 1) {
            const usersArray = Array.from(this.users.values());
            const userToRemove = usersArray[Math.floor(Math.random() * usersArray.length)];
            if (userToRemove.id !== this.userId) {
                this.users.delete(userToRemove.id);
                this.updateUsersList();
                this.showToast(`${userToRemove.name} left the whiteboard`);
            }
        }
    }

    updateUsersList() {
        const usersList = document.getElementById('usersList');
        usersList.innerHTML = '';

        // Add current user first
        const currentUserItem = document.createElement('div');
        currentUserItem.className = 'user-item';
        currentUserItem.innerHTML = `
            <span class="user-color" style="background-color: ${this.userColor}"></span>
            <span>You (${this.userId})</span>
        `;
        usersList.appendChild(currentUserItem);

        // Add other users
        this.users.forEach(user => {
            if (user.id !== this.userId) {
                const userItem = document.createElement('div');
                userItem.className = 'user-item';
                userItem.innerHTML = `
                    <span class="user-color" style="background-color: ${user.color}"></span>
                    <span>${user.name}</span>
                `;
                usersList.appendChild(userItem);
            }
        });
    }

    broadcastDrawing() {
        // In a real app, this would send to WebSocket server
        console.log('Broadcasting drawing to other users...');
    }

    broadcastClear() {
        // In a real app, this would send to WebSocket server
        console.log('Broadcasting clear canvas to other users...');
    }

    saveToLocalStorage() {
        localStorage.setItem('whiteboard_drawings', JSON.stringify(this.drawings));
    }

    loadFromLocalStorage() {
        const saved = localStorage.getItem('whiteboard_drawings');
        if (saved) {
            this.drawings = JSON.parse(saved);
        }
    }

    updateRoomInfo() {
        document.getElementById('roomInfo').textContent = `Room: Public Whiteboard | Users: ${this.users.size + 1}`;
    }

    showToast(message) {
        const toast = new bootstrap.Toast(document.getElementById('liveToast'));
        document.getElementById('toastMessage').textContent = message;
        toast.show();
    }
}

// Initialize the whiteboard when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new CollaborativeWhiteboard();
});