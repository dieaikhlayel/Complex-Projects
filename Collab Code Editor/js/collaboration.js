// Real-time Collaboration Class
class Collaboration {
    constructor() {
        this.socket = null;
        this.roomId = null;
        this.users = new Map();
        this.currentUser = null;
        this.isConnected = false;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Listen for storage events (simulated real-time)
        window.addEventListener('storage', (e) => {
            if (e.key === 'collabcode_changes') {
                this.handleRemoteChange(JSON.parse(e.newValue));
            }
            
            if (e.key === 'collabcode_messages') {
                this.handleRemoteMessage(JSON.parse(e.newValue));
            }
            
            if (e.key === 'collabcode_users') {
                this.handleUserUpdate(JSON.parse(e.newValue));
            }
        });
    }
    
    connect(user) {
        this.currentUser = user;
        this.roomId = this.getRoomId();
        
        // Simulate WebSocket connection
        this.socket = {
            send: (data) => {
                // Simulate network delay
                setTimeout(() => {
                    this.broadcastToOtherTabs(data);
                }, Math.random() * 100);
            }
        };
        
        this.joinRoom();
        this.isConnected = true;
        
        console.log('Connected to collaboration room:', this.roomId);
    }
    
    getRoomId() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('room') || 'default-room';
    }
    
    joinRoom() {
        const userData = {
            type: 'user_join',
            user: this.currentUser,
            roomId: this.roomId,
            timestamp: Date.now()
        };
        
        this.socket.send(JSON.stringify(userData));
        this.addUser(this.currentUser);
    }
    
    leaveRoom() {
        if (this.isConnected) {
            const userData = {
                type: 'user_leave',
                userId: this.currentUser.id,
                roomId: this.roomId,
                timestamp: Date.now()
            };
            
            this.socket.send(JSON.stringify(userData));
            this.removeUser(this.currentUser.id);
        }
    }
    
    broadcastChange(content) {
        if (!this.isConnected) return;
        
        const changeData = {
            type: 'content_change',
            content: content,
            userId: this.currentUser.id,
            roomId: this.roomId,
            timestamp: Date.now()
        };
        
        this.socket.send(JSON.stringify(changeData));
    }
    
    sendMessage(message) {
        if (!this.isConnected) return;
        
        const messageData = {
            type: 'chat_message',
            message: message,
            user: this.currentUser,
            roomId: this.roomId,
            timestamp: Date.now()
        };
        
        this.socket.send(JSON.stringify(messageData));
        this.displayMessage(messageData, true);
    }
    
    handleRemoteChange(data) {
        if (data.roomId !== this.roomId || data.userId === this.currentUser.id) return;
        
        if (this.onContentChangeCallback) {
            this.onContentChangeCallback(data);
        }
    }
    
    handleRemoteMessage(data) {
        if (data.roomId !== this.roomId || data.user.id === this.currentUser.id) return;
        
        this.displayMessage(data, false);
    }
    
    handleUserUpdate(data) {
        if (data.roomId !== this.roomId) return;
        
        if (data.type === 'user_join' && data.user.id !== this.currentUser.id) {
            this.addUser(data.user);
            if (this.onUserJoinCallback) {
                this.onUserJoinCallback(data.user);
            }
        } else if (data.type === 'user_leave') {
            this.removeUser(data.userId);
            if (this.onUserLeaveCallback) {
                this.onUserLeaveCallback(data.userId);
            }
        }
    }
    
    addUser(user) {
        this.users.set(user.id, user);
        this.updateUserStorage();
    }
    
    removeUser(userId) {
        this.users.delete(userId);
        this.updateUserStorage();
    }
    
    updateUserStorage() {
        const usersArray = Array.from(this.users.values());
        localStorage.setItem('collabcode_users', JSON.stringify(usersArray));
    }
    
    broadcastToOtherTabs(data) {
        const parsedData = JSON.parse(data);
        
        switch (parsedData.type) {
            case 'content_change':
                localStorage.setItem('collabcode_changes', data);
                break;
            case 'chat_message':
                localStorage.setItem('collabcode_messages', data);
                break;
            case 'user_join':
            case 'user_leave':
                localStorage.setItem('collabcode_users', data);
                break;
        }
        
        // Trigger storage event manually for same tab
        const event = new StorageEvent('storage', {
            key: `collabcode_${parsedData.type === 'content_change' ? 'changes' : 
                  parsedData.type === 'chat_message' ? 'messages' : 'users'}`,
            newValue: data
        });
        window.dispatchEvent(event);
    }
    
    displayMessage(messageData, isOwn = false) {
        const chatMessages = document.getElementById('chat-messages');
        const messageElement = document.createElement('div');
        messageElement.className = `chat-message ${isOwn ? 'own' : 'other'}`;
        
        const time = new Date(messageData.timestamp).toLocaleTimeString();
        
        messageElement.innerHTML = `
            ${!isOwn ? `<div class="message-sender">${messageData.user.name}</div>` : ''}
            <div class="message-text">${this.escapeHtml(messageData.message)}</div>
            <div class="message-time">${time}</div>
        `;
        
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Callback registration
    onContentChange(callback) {
        this.onContentChangeCallback = callback;
    }
    
    onUserJoin(callback) {
        this.onUserJoinCallback = callback;
    }
    
    onUserLeave(callback) {
        this.onUserLeaveCallback = callback;
    }
    
    // Utility method
    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
    
    // Cleanup
    disconnect() {
        this.leaveRoom();
        this.isConnected = false;
        this.socket = null;
    }
}