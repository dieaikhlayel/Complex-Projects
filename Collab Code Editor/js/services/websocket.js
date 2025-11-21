// WebSocket Service for Real-time Communication
class WebSocketService {
    constructor() {
        this.socket = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
        this.isConnected = false;
        this.messageQueue = [];
        this.eventHandlers = new Map();
        
        this.init();
    }
    
    init() {
        this.setupEventHandlers();
    }
    
    connect(projectId, userId) {
        if (this.socket) {
            this.disconnect();
        }
        
        // In a real implementation, this would connect to a WebSocket server
        // For this demo, we'll simulate WebSocket behavior using localStorage
        console.log('Simulating WebSocket connection for project:', projectId);
        
        this.isConnected = true;
        this.projectId = projectId;
        this.userId = userId;
        
        // Simulate connection established
        setTimeout(() => {
            this.triggerEvent('connected', { projectId, userId });
        }, 100);
        
        // Start listening for messages from other tabs
        this.startMessagePolling();
    }
    
    disconnect() {
        this.isConnected = false;
        this.stopMessagePolling();
        
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
        
        this.triggerEvent('disconnected');
    }
    
    send(message) {
        if (!this.isConnected) {
            this.messageQueue.push(message);
            return false;
        }
        
        // Simulate sending message
        const messageData = {
            ...message,
            timestamp: Date.now(),
            userId: this.userId,
            projectId: this.projectId
        };
        
        // Store message in localStorage for other tabs
        storage.set('websocket_outgoing', messageData);
        
        // Simulate network delay
        setTimeout(() => {
            this.handleIncomingMessage(messageData);
        }, Math.random() * 100);
        
        return true;
    }
    
    handleIncomingMessage(message) {
        this.triggerEvent('message', message);
        
        // Route specific message types
        switch (message.type) {
            case 'content_change':
                this.triggerEvent('contentChange', message);
                break;
            case 'cursor_move':
                this.triggerEvent('cursorMove', message);
                break;
            case 'user_join':
                this.triggerEvent('userJoin', message);
                break;
            case 'user_leave':
                this.triggerEvent('userLeave', message);
                break;
            case 'chat_message':
                this.triggerEvent('chatMessage', message);
                break;
            case 'file_operation':
                this.triggerEvent('fileOperation', message);
                break;
        }
    }
    
    // Event handling
    on(event, handler) {
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, []);
        }
        this.eventHandlers.get(event).push(handler);
    }
    
    off(event, handler) {
        if (this.eventHandlers.has(event)) {
            const handlers = this.eventHandlers.get(event);
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
            }
        }
    }
    
    triggerEvent(event, data) {
        if (this.eventHandlers.has(event)) {
            this.eventHandlers.get(event).forEach(handler => {
                try {
                    handler(data);
                } catch (error) {
                    console.error('Error in event handler:', error);
                }
            });
        }
    }
    
    // Simulated WebSocket methods
    startMessagePolling() {
        this.pollingInterval = setInterval(() => {
            const incoming = storage.get('websocket_incoming', null);
            if (incoming && incoming.projectId === this.projectId) {
                this.handleIncomingMessage(incoming);
                storage.remove('websocket_incoming');
            }
        }, 100);
    }
    
    stopMessagePolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
    }
    
    // Specific message types
    sendContentChange(change) {
        this.send({
            type: 'content_change',
            change,
            fileId: change.fileId,
            position: change.position
        });
    }
    
    sendCursorMove(position) {
        this.send({
            type: 'cursor_move',
            position,
            userId: this.userId
        });
    }
    
    sendChatMessage(message) {
        this.send({
            type: 'chat_message',
            message,
            userId: this.userId
        });
    }
    
    sendFileOperation(operation, file) {
        this.send({
            type: 'file_operation',
            operation,
            file,
            userId: this.userId
        });
    }
    
    // Presence management
    updatePresence(status) {
        this.send({
            type: 'presence_update',
            status,
            userId: this.userId
        });
    }
    
    // Connection management
    reconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            setTimeout(() => {
                this.connect(this.projectId, this.userId);
            }, this.reconnectDelay * this.reconnectAttempts);
        }
    }
    
    getConnectionStatus() {
        return {
            isConnected: this.isConnected,
            reconnectAttempts: this.reconnectAttempts,
            messageQueueLength: this.messageQueue.length
        };
    }
    
    // Cleanup
    destroy() {
        this.disconnect();
        this.eventHandlers.clear();
        this.messageQueue = [];
    }
}

// Create global WebSocket instance
window.websocket = new WebSocketService();