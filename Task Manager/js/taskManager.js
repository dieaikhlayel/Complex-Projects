// Task Manager Module
class TaskManager {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        this.categories = JSON.parse(localStorage.getItem('categories')) || [
            { id: 'default', name: 'Personal', color: '#4a6fa5' },
            { id: 'work', name: 'Work', color: '#ff6b6b' },
            { id: 'shopping', name: 'Shopping', color: '#51cf66' }
        ];
        this.currentFilter = 'all';
        this.currentCategory = 'all';
        this.searchQuery = '';
        
        this.init();
    }
    
    init() {
        this.renderTasks();
        this.renderCategories();
        this.updateStats();
    }
    
    // Task methods
    addTask(taskData) {
        const newTask = {
            id: Date.now().toString(),
            title: taskData.title,
            description: taskData.description,
            priority: taskData.priority,
            dueDate: taskData.dueDate,
            category: taskData.category,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        this.tasks.unshift(newTask);
        this.saveTasks();
        this.renderTasks();
        this.updateStats();
        
        return newTask;
    }
    
    editTask(taskId, updatedData) {
        const taskIndex = this.tasks.findIndex(task => task.id === taskId);
        if (taskIndex !== -1) {
            this.tasks[taskIndex] = { ...this.tasks[taskIndex], ...updatedData };
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
            return true;
        }
        return false;
    }
    
    deleteTask(taskId) {
        this.tasks = this.tasks.filter(task => task.id !== taskId);
        this.saveTasks();
        this.renderTasks();
        this.updateStats();
    }
    
    toggleTaskCompletion(taskId) {
        const task = this.tasks.find(task => task.id === taskId);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
            return true;
        }
        return false;
    }
    
    // Category methods
    addCategory(categoryData) {
        const newCategory = {
            id: Date.now().toString(),
            name: categoryData.name,
            color: categoryData.color
        };
        
        this.categories.push(newCategory);
        this.saveCategories();
        this.renderCategories();
        return newCategory;
    }
    
    deleteCategory(categoryId) {
        // Don't allow deletion of default category
        if (categoryId === 'default') return false;
        
        // Remove category from tasks
        this.tasks = this.tasks.map(task => {
            if (task.category === categoryId) {
                return { ...task, category: 'default' };
            }
            return task;
        });
        
        this.categories = this.categories.filter(cat => cat.id !== categoryId);
        this.saveCategories();
        this.saveTasks();
        this.renderCategories();
        this.renderTasks();
        return true;
    }
    
    // Filtering and searching
    filterTasks(filter) {
        this.currentFilter = filter;
        this.renderTasks();
    }
    
    searchTasks(query) {
        this.searchQuery = query.toLowerCase();
        this.renderTasks();
    }
    
    setCategory(categoryId) {
        this.currentCategory = categoryId;
        this.renderTasks();
    }
    
    // Rendering methods
    renderTasks() {
        const taskList = document.getElementById('task-list');
        const emptyState = document.getElementById('empty-state');
        
        // Filter tasks based on current filter, category, and search
        let filteredTasks = this.tasks;
        
        // Apply category filter
        if (this.currentCategory !== 'all') {
            filteredTasks = filteredTasks.filter(task => task.category === this.currentCategory);
        }
        
        // Apply status filter
        if (this.currentFilter === 'pending') {
            filteredTasks = filteredTasks.filter(task => !task.completed);
        } else if (this.currentFilter === 'completed') {
            filteredTasks = filteredTasks.filter(task => task.completed);
        } else if (this.currentFilter === 'high') {
            filteredTasks = filteredTasks.filter(task => task.priority === 'high');
        }
        
        // Apply search filter
        if (this.searchQuery) {
            filteredTasks = filteredTasks.filter(task => 
                task.title.toLowerCase().includes(this.searchQuery) || 
                task.description.toLowerCase().includes(this.searchQuery)
            );
        }
        
        // Show/hide empty state
        if (filteredTasks.length === 0) {
            taskList.innerHTML = '';
            taskList.appendChild(emptyState);
            emptyState.style.display = 'block';
            return;
        } else {
            emptyState.style.display = 'none';
        }
        
        // Render tasks
        taskList.innerHTML = '';
        filteredTasks.forEach(task => {
            const taskElement = this.createTaskElement(task);
            taskList.appendChild(taskElement);
        });
    }
    
    createTaskElement(task) {
        const taskCard = document.createElement('div');
        taskCard.className = `task-card ${task.completed ? 'completed' : ''}`;
        taskCard.setAttribute('data-task-id', task.id);
        taskCard.draggable = true;
        
        const category = this.categories.find(cat => cat.id === task.category) || this.categories[0];
        const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;
        
        taskCard.innerHTML = `
            <div class="task-header">
                <div>
                    <div class="task-title">${this.escapeHtml(task.title)}</div>
                    <span class="task-priority priority-${task.priority}">${task.priority}</span>
                </div>
                <div class="task-actions">
                    <button class="btn-icon complete-btn" title="${task.completed ? 'Mark as pending' : 'Mark as complete'}">
                        ${task.completed ? 
                            '<svg class="icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>' :
                            '<svg class="icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>'
                        }
                    </button>
                    <button class="btn-icon edit-btn" title="Edit task">
                        <svg class="icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                        </svg>
                    </button>
                    <button class="btn-icon delete-btn" title="Delete task">
                        <svg class="icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                    </button>
                </div>
            </div>
            ${task.description ? `<div class="task-description">${this.escapeHtml(task.description)}</div>` : ''}
            <div class="task-meta">
                ${task.dueDate ? `
                    <div class="task-due-date ${isOverdue ? 'overdue' : ''}">
                        <svg class="icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                        </svg>
                        ${new Date(task.dueDate).toLocaleDateString()}
                    </div>
                ` : '<div></div>'}
                <div class="task-category" style="background-color: ${category.color}20; color: ${category.color}">
                    <span class="category-color" style="background-color: ${category.color}"></span>
                    ${this.escapeHtml(category.name)}
                </div>
            </div>
        `;
        
        // Add event listeners
        const completeBtn = taskCard.querySelector('.complete-btn');
        const editBtn = taskCard.querySelector('.edit-btn');
        const deleteBtn = taskCard.querySelector('.delete-btn');
        
        completeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleTaskCompletion(task.id);
        });
        
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.openEditTaskModal(task);
        });
        
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm('Are you sure you want to delete this task?')) {
                this.deleteTask(task.id);
            }
        });
        
        taskCard.addEventListener('click', () => {
            this.openEditTaskModal(task);
        });
        
        return taskCard;
    }
    
    renderCategories() {
        const categoryList = document.getElementById('category-list');
        const categorySelect = document.getElementById('task-category');
        
        // Clear existing categories
        categoryList.innerHTML = '';
        categorySelect.innerHTML = '';
        
        // Add "All" option
        const allItem = document.createElement('li');
        allItem.className = `category-item ${this.currentCategory === 'all' ? 'active' : ''}`;
        allItem.innerHTML = `
            <span class="category-color" style="background-color: #6c757d"></span>
            All Tasks
        `;
        allItem.addEventListener('click', () => {
            this.setCategory('all');
            document.getElementById('current-category').textContent = 'All Tasks';
            document.querySelectorAll('.category-item').forEach(item => item.classList.remove('active'));
            allItem.classList.add('active');
        });
        categoryList.appendChild(allItem);
        
        // Add categories
        this.categories.forEach(category => {
            const categoryItem = document.createElement('li');
            categoryItem.className = `category-item ${this.currentCategory === category.id ? 'active' : ''}`;
            categoryItem.innerHTML = `
                <span class="category-color" style="background-color: ${category.color}"></span>
                ${this.escapeHtml(category.name)}
                ${category.id !== 'default' ? '<span class="delete-category-btn">×</span>' : ''}
            `;
            
            categoryItem.addEventListener('click', (e) => {
                if (!e.target.classList.contains('delete-category-btn')) {
                    this.setCategory(category.id);
                    document.getElementById('current-category').textContent = category.name;
                    document.querySelectorAll('.category-item').forEach(item => item.classList.remove('active'));
                    categoryItem.classList.add('active');
                }
            });
            
            // Add delete button for non-default categories
            if (category.id !== 'default') {
                const deleteBtn = categoryItem.querySelector('.delete-category-btn');
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (confirm(`Delete category "${category.name}"? Tasks in this category will be moved to Personal.`)) {
                        this.deleteCategory(category.id);
                    }
                });
            }
            
            categoryList.appendChild(categoryItem);
            
            // Add to select dropdown
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });
    }
    
    updateStats() {
        const totalTasks = this.tasks.length;
        const completedTasks = this.tasks.filter(task => task.completed).length;
        const pendingTasks = totalTasks - completedTasks;
        
        document.getElementById('total-tasks').textContent = totalTasks;
        document.getElementById('completed-tasks').textContent = completedTasks;
        document.getElementById('pending-tasks').textContent = pendingTasks;
    }
    
    // Modal methods
    openAddTaskModal() {
        document.getElementById('modal-title').textContent = 'Add New Task';
        document.getElementById('task-form').reset();
        document.getElementById('task-due-date').valueAsDate = null;
        document.getElementById('task-modal').classList.add('active');
        
        // Set focus to title field
        setTimeout(() => {
            document.getElementById('task-title').focus();
        }, 100);
    }
    
    openEditTaskModal(task) {
        document.getElementById('modal-title').textContent = 'Edit Task';
        document.getElementById('task-title').value = task.title;
        document.getElementById('task-description').value = task.description || '';
        document.getElementById('task-priority').value = task.priority;
        document.getElementById('task-due-date').value = task.dueDate || '';
        document.getElementById('task-category').value = task.category;
        
        // Store task ID for saving
        document.getElementById('task-form').setAttribute('data-edit-id', task.id);
        document.getElementById('task-modal').classList.add('active');
    }
    
    // Utility methods
    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }
    
    saveCategories() {
        localStorage.setItem('categories', JSON.stringify(this.categories));
    }
    
    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
    
    // Getter methods
    getTasks() {
        return this.tasks;
    }
    
    getCategories() {
        return this.categories;
    }
}