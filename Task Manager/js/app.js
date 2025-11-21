// Main Application Controller
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Task Manager
    const taskManager = new TaskManager();
    const dragDropManager = new DragDropManager(taskManager);
    
    // DOM Elements
    const themeToggle = document.getElementById('theme-toggle');
    const addCategoryBtn = document.getElementById('add-category-btn');
    const taskModal = document.getElementById('task-modal');
    const categoryModal = document.getElementById('category-modal');
    const closeButtons = document.querySelectorAll('.close');
    const cancelTaskBtn = document.getElementById('cancel-task');
    const cancelCategoryBtn = document.getElementById('cancel-category');
    const taskForm = document.getElementById('task-form');
    const categoryForm = document.getElementById('category-form');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const taskSearch = document.getElementById('task-search');
    const addFirstTaskBtn = document.getElementById('add-first-task');
    
    // Theme Toggle
    themeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        themeToggle.textContent = document.body.classList.contains('dark-mode') 
            ? 'Light Mode' 
            : 'Dark Mode';
        
        // Save theme preference
        localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
    });
    
    // Load saved theme preference
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
        themeToggle.textContent = 'Light Mode';
    }
    
    // Modal Controls
    addCategoryBtn.addEventListener('click', function() {
        categoryModal.classList.add('active');
    });
    
    addFirstTaskBtn.addEventListener('click', function() {
        taskManager.openAddTaskModal();
    });
    
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            taskModal.classList.remove('active');
            categoryModal.classList.remove('active');
        });
    });
    
    cancelTaskBtn.addEventListener('click', function() {
        taskModal.classList.remove('active');
    });
    
    cancelCategoryBtn.addEventListener('click', function() {
        categoryModal.classList.remove('active');
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === taskModal) {
            taskModal.classList.remove('active');
        }
        if (e.target === categoryModal) {
            categoryModal.classList.remove('active');
        }
    });
    
    // Task Form Submission
    taskForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const taskData = {
            title: document.getElementById('task-title').value,
            description: document.getElementById('task-description').value,
            priority: document.getElementById('task-priority').value,
            dueDate: document.getElementById('task-due-date').value || null,
            category: document.getElementById('task-category').value
        };
        
        const editId = taskForm.getAttribute('data-edit-id');
        
        if (editId) {
            // Editing existing task
            taskManager.editTask(editId, taskData);
            taskForm.removeAttribute('data-edit-id');
        } else {
            // Adding new task
            taskManager.addTask(taskData);
        }
        
        taskModal.classList.remove('active');
    });
    
    // Category Form Submission
    categoryForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const categoryData = {
            name: document.getElementById('category-name').value,
            color: document.getElementById('category-color').value
        };
        
        taskManager.addCategory(categoryData);
        categoryModal.classList.remove('active');
        categoryForm.reset();
        document.getElementById('category-color').value = '#4a6fa5';
    });
    
    // Filter Buttons
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            
            // Update active state
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Apply filter
            taskManager.filterTasks(filter);
        });
    });
    
    // Search Functionality
    taskSearch.addEventListener('input', function() {
        taskManager.searchTasks(this.value);
    });
    
    // Keyboard Shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + N to add new task
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            taskManager.openAddTaskModal();
        }
        
        // Escape to close modals
        if (e.key === 'Escape') {
            taskModal.classList.remove('active');
            categoryModal.classList.remove('active');
        }
    });
    
    // Export task manager for global access (for debugging)
    window.taskManager = taskManager;
});