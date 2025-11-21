// Drag and Drop functionality
class DragDropManager {
    constructor(taskManager) {
        this.taskManager = taskManager;
        this.draggedTask = null;
        this.init();
    }
    
    init() {
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        const taskList = document.getElementById('task-list');
        
        taskList.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('task-card')) {
                this.draggedTask = e.target;
                e.target.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', e.target.getAttribute('data-task-id'));
            }
        });
        
        taskList.addEventListener('dragend', (e) => {
            if (e.target.classList.contains('task-card')) {
                e.target.classList.remove('dragging');
                this.draggedTask = null;
            }
        });
        
        taskList.addEventListener('dragover', (e) => {
            e.preventDefault();
            const afterElement = this.getDragAfterElement(taskList, e.clientY);
            const draggable = document.querySelector('.dragging');
            
            if (draggable) {
                if (afterElement == null) {
                    taskList.appendChild(draggable);
                } else {
                    taskList.insertBefore(draggable, afterElement);
                }
            }
        });
        
        taskList.addEventListener('drop', (e) => {
            e.preventDefault();
            if (this.draggedTask) {
                // In a real application, you would update the task order in your data model
                // For this demo, we'll just visually reorder the tasks
                console.log('Task reordered:', this.draggedTask.getAttribute('data-task-id'));
            }
        });
    }
    
    getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.task-card:not(.dragging)')];
        
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }
}