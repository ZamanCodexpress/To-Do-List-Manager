// ======================
// State Management
// ======================
const state = {
    currentDate: new Date(),
    tasks: [],
    dailyTasks: [], // Users will add their own custom daily tasks
    currentFilter: 'all',
    editingTaskId: null,
    charts: {
        pie: null,
        bar: null
    }
};

// ======================
// Utility Functions
// ======================
const utils = {
    formatDate(date) {
        if (!date) return '';
        const d = new Date(date);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    },
    
    getDaysInMonth(year, month) {
        return new Date(year, month + 1, 0).getDate();
    },
    
    getFirstDayOfMonth(year, month) {
        return new Date(year, month, 1).getDay();
    },
    
    isToday(date, currentDate) {
        const today = new Date();
        return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
    },
    
    generateId() {
        return Date.now() + Math.random().toString(36).substr(2, 9);
    },
    
    getLastSevenDays() {
        const days = [];
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            days.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        }
        return days;
    },
    
    checkDailyReset() {
        const lastReset = localStorage.getItem('lastDailyReset');
        const today = new Date().toDateString();
        
        if (lastReset !== today) {
            // Reset all daily tasks
            state.dailyTasks.forEach(task => task.completed = false);
            localStorage.setItem('lastDailyReset', today);
            saveDailyTasks();
        }
    }
};

// ======================
// Local Storage
// ======================
const storage = {
    saveTasks() {
        localStorage.setItem('todoTasks', JSON.stringify(state.tasks));
    },
    
    loadTasks() {
        const saved = localStorage.getItem('todoTasks');
        if (saved) {
            state.tasks = JSON.parse(saved);
        }
    },
    
    saveDailyTasks() {
        localStorage.setItem('dailyTasks', JSON.stringify(state.dailyTasks));
    },
    
    loadDailyTasks() {
        const saved = localStorage.getItem('dailyTasks');
        if (saved) {
            state.dailyTasks = JSON.parse(saved);
        }
    }
};

// Shorthand functions
const saveTasks = () => storage.saveTasks();
const loadTasks = () => storage.loadTasks();
const saveDailyTasks = () => storage.saveDailyTasks();
const loadDailyTasks = () => storage.loadDailyTasks();

// ======================
// Calendar Module
// ======================
const calendar = {
    init() {
        this.render();
        this.attachEvents();
    },
    
    render() {
        const year = state.currentDate.getFullYear();
        const month = state.currentDate.getMonth();
        
        // Update title
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                          'July', 'August', 'September', 'October', 'November', 'December'];
        document.getElementById('calendarTitle').textContent = `${monthNames[month]} ${year}`;
        
        // Generate dates
        const datesContainer = document.getElementById('calendarDates');
        datesContainer.innerHTML = '';
        
        const daysInMonth = utils.getDaysInMonth(year, month);
        const firstDay = utils.getFirstDayOfMonth(year, month);
        const prevMonthDays = utils.getDaysInMonth(year, month - 1);
        
        // Previous month's trailing dates
        for (let i = firstDay - 1; i >= 0; i--) {
            const dateDiv = document.createElement('div');
            dateDiv.className = 'calendar-date other-month';
            dateDiv.textContent = prevMonthDays - i;
            datesContainer.appendChild(dateDiv);
        }
        
        // Current month dates
        for (let day = 1; day <= daysInMonth; day++) {
            const dateDiv = document.createElement('div');
            dateDiv.className = 'calendar-date';
            dateDiv.textContent = day;
            
            const currentDateObj = new Date(year, month, day);
            if (utils.isToday(currentDateObj, state.currentDate)) {
                dateDiv.classList.add('today');
            }
            
            datesContainer.appendChild(dateDiv);
        }
        
        // Next month's leading dates
        const totalCells = datesContainer.children.length;
        const remainingCells = 42 - totalCells; // 6 rows x 7 days
        for (let day = 1; day <= remainingCells; day++) {
            const dateDiv = document.createElement('div');
            dateDiv.className = 'calendar-date other-month';
            dateDiv.textContent = day;
            datesContainer.appendChild(dateDiv);
        }
    },
    
    attachEvents() {
        document.getElementById('prevMonth').addEventListener('click', () => {
            state.currentDate.setMonth(state.currentDate.getMonth() - 1);
            this.render();
        });
        
        document.getElementById('nextMonth').addEventListener('click', () => {
            state.currentDate.setMonth(state.currentDate.getMonth() + 1);
            this.render();
        });
    }
};

// ======================
// Daily Tasks Module
// ======================
const dailyTasks = {
    MAX_TASKS: 5,
    
    init() {
        utils.checkDailyReset();
        this.render();
        this.attachFormEvents();
    },
    
    addTask(taskName) {
        if (state.dailyTasks.length >= this.MAX_TASKS) {
            alert(`You can only have ${this.MAX_TASKS} daily tasks. Please remove one to add a new task.`);
            return;
        }
        
        if (!taskName.trim()) {
            return;
        }
        
        const newTask = {
            id: Date.now(),
            name: taskName.trim(),
            completed: false
        };
        
        state.dailyTasks.push(newTask);
        saveDailyTasks();
        this.render();
    },
    
    deleteTask(id) {
        state.dailyTasks = state.dailyTasks.filter(t => t.id !== id);
        saveDailyTasks();
        this.render();
    },
    
    editTask(id, newName) {
        const task = state.dailyTasks.find(t => t.id === id);
        if (task && newName.trim()) {
            task.name = newName.trim();
            saveDailyTasks();
            this.render();
        }
    },
    
    render() {
        const container = document.getElementById('dailyTasksList');
        container.innerHTML = '';
        
        if (state.dailyTasks.length === 0) {
            container.innerHTML = '<div class="empty-daily-tasks">No daily tasks yet. Add your first one above!</div>';
            this.updateProgress();
            return;
        }
        
        state.dailyTasks.forEach(task => {
            const taskDiv = document.createElement('div');
            taskDiv.className = `daily-task-item ${task.completed ? 'completed' : ''}`;
            
            taskDiv.innerHTML = `
                <div class="daily-task-checkbox ${task.completed ? 'checked' : ''}" data-id="${task.id}"></div>
                <span class="daily-task-name" data-id="${task.id}">${task.name}</span>
                <div class="daily-task-actions">
                    <button class="daily-task-action-btn edit-daily-btn" data-id="${task.id}" title="Edit task">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13M18.5 2.5C18.8978 2.1022 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.1022 21.5 2.5C21.8978 2.8978 22.1213 3.43737 22.1213 4C22.1213 4.56263 21.8978 5.1022 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                    <button class="daily-task-action-btn delete-daily-btn delete" data-id="${task.id}" title="Delete task">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 6H5H21M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>
            `;
            
            container.appendChild(taskDiv);
        });
        
        this.updateProgress();
        this.attachTaskEvents();
    },
    
    updateProgress() {
        const completed = state.dailyTasks.filter(t => t.completed).length;
        const total = state.dailyTasks.length;
        document.getElementById('dailyProgress').textContent = `${completed}/${total}`;
        
        // Update add button state
        const addBtn = document.querySelector('.add-daily-btn');
        if (addBtn) {
            addBtn.disabled = state.dailyTasks.length >= this.MAX_TASKS;
        }
    },
    
    toggleTask(id) {
        const task = state.dailyTasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            saveDailyTasks();
            this.render();
        }
    },
    
    attachFormEvents() {
        const form = document.getElementById('addDailyTaskForm');
        const input = document.getElementById('dailyTaskInput');
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTask(input.value);
            input.value = '';
        });
    },
    
    attachTaskEvents() {
        // Checkbox toggles
        document.querySelectorAll('.daily-task-checkbox').forEach(checkbox => {
            checkbox.addEventListener('click', (e) => {
                this.toggleTask(parseInt(e.target.dataset.id));
            });
        });
        
        // Edit buttons
        document.querySelectorAll('.edit-daily-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.dataset.id);
                const task = state.dailyTasks.find(t => t.id === id);
                if (task) {
                    const newName = prompt('Edit daily task:', task.name);
                    if (newName !== null) {
                        this.editTask(id, newName);
                    }
                }
            });
        });
        
        // Delete buttons
        document.querySelectorAll('.delete-daily-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.dataset.id);
                const confirmed = confirm('Remove this daily task?');
                if (confirmed) {
                    this.deleteTask(id);
                }
            });
        });
    }
};

// ======================
// Task Manager Module
// ======================
const taskManager = {
    init() {
        this.render();
        this.attachEvents();
    },
    
    addTask(taskData) {
        const task = {
            id: utils.generateId(),
            title: taskData.title,
            description: taskData.description || '',
            dueDate: taskData.dueDate || '',
            priority: taskData.priority || 'medium',
            completed: false,
            createdAt: new Date().toISOString(),
            completedAt: null
        };
        
        state.tasks.unshift(task);
        saveTasks();
        this.render();
        analytics.updateCharts();
    },
    
    editTask(id, taskData) {
        const task = state.tasks.find(t => t.id === id);
        if (task) {
            task.title = taskData.title;
            task.description = taskData.description || '';
            task.dueDate = taskData.dueDate || '';
            task.priority = taskData.priority || 'medium';
            saveTasks();
            this.render();
        }
    },
    
    deleteTask(id) {
        const confirmed = confirm('Are you sure you want to delete this task?');
        if (confirmed) {
            state.tasks = state.tasks.filter(t => t.id !== id);
            saveTasks();
            this.render();
            analytics.updateCharts();
        }
    },
    
    toggleComplete(id) {
        const task = state.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            task.completedAt = task.completed ? new Date().toISOString() : null;
            saveTasks();
            this.render();
            analytics.updateCharts();
        }
    },
    
    getFilteredTasks() {
        switch (state.currentFilter) {
            case 'active':
                return state.tasks.filter(t => !t.completed);
            case 'completed':
                return state.tasks.filter(t => t.completed);
            default:
                return state.tasks;
        }
    },
    
    render() {
        const container = document.getElementById('tasksList');
        const filteredTasks = this.getFilteredTasks();
        
        if (filteredTasks.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <p>No tasks to display</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = '';
        
        filteredTasks.forEach(task => {
            const taskDiv = document.createElement('div');
            taskDiv.className = `task-item ${task.completed ? 'completed' : ''}`;
            
            taskDiv.innerHTML = `
                <div class="task-checkbox ${task.completed ? 'checked' : ''}" data-id="${task.id}"></div>
                <div class="task-content">
                    <div class="task-title">${task.title}</div>
                    ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
                    <div class="task-meta">
                        ${task.dueDate ? `<span class="task-due-date">📅 ${utils.formatDate(task.dueDate)}</span>` : ''}
                        <span class="task-priority ${task.priority}">${task.priority}</span>
                    </div>
                </div>
                <div class="task-actions">
                    <button class="task-action-btn edit-btn" data-id="${task.id}" title="Edit task">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13M18.5 2.5C18.8978 2.1022 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.1022 21.5 2.5C21.8978 2.8978 22.1213 3.43737 22.1213 4C22.1213 4.56263 21.8978 5.1022 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                    <button class="task-action-btn delete-btn delete" data-id="${task.id}" title="Delete task">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 6H5H21M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>
            `;
            
            container.appendChild(taskDiv);
        });
        
        this.attachTaskEvents();
    },
    
    attachEvents() {
        // Add task form
        document.getElementById('addTaskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const taskData = {
                title: document.getElementById('taskTitle').value,
                description: document.getElementById('taskDescription').value,
                dueDate: document.getElementById('taskDueDate').value,
                priority: document.getElementById('taskPriority').value
            };
            
            this.addTask(taskData);
            e.target.reset();
        });
        
        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                state.currentFilter = e.target.dataset.filter;
                this.render();
            });
        });
        
        // Edit modal
        document.getElementById('closeEditModal').addEventListener('click', () => {
            this.closeEditModal();
        });
        
        document.getElementById('cancelEdit').addEventListener('click', () => {
            this.closeEditModal();
        });
        
        document.getElementById('editTaskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const taskData = {
                title: document.getElementById('editTaskTitle').value,
                description: document.getElementById('editTaskDescription').value,
                dueDate: document.getElementById('editTaskDueDate').value,
                priority: document.getElementById('editTaskPriority').value
            };
            
            this.editTask(state.editingTaskId, taskData);
            this.closeEditModal();
        });
        
        // Close modal on background click
        document.getElementById('editModal').addEventListener('click', (e) => {
            if (e.target.id === 'editModal') {
                this.closeEditModal();
            }
        });
    },
    
    attachTaskEvents() {
        // Checkbox toggles
        document.querySelectorAll('.task-checkbox').forEach(checkbox => {
            checkbox.addEventListener('click', (e) => {
                this.toggleComplete(e.target.dataset.id);
            });
        });
        
        // Edit buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = e.currentTarget.dataset.id;
                this.openEditModal(taskId);
            });
        });
        
        // Delete buttons
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = e.currentTarget.dataset.id;
                this.deleteTask(taskId);
            });
        });
    },
    
    openEditModal(taskId) {
        const task = state.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        state.editingTaskId = taskId;
        
        document.getElementById('editTaskTitle').value = task.title;
        document.getElementById('editTaskDescription').value = task.description;
        document.getElementById('editTaskDueDate').value = task.dueDate;
        document.getElementById('editTaskPriority').value = task.priority;
        
        document.getElementById('editModal').classList.add('active');
    },
    
    closeEditModal() {
        document.getElementById('editModal').classList.remove('active');
        state.editingTaskId = null;
        document.getElementById('editTaskForm').reset();
    }
};

// ======================
// Analytics Module
// ======================
const analytics = {
    init() {
        this.createCharts();
    },
    
    createCharts() {
        this.createPieChart();
        this.createBarChart();
    },
    
    createPieChart() {
        const ctx = document.getElementById('pieChart').getContext('2d');
        
        const completed = state.tasks.filter(t => t.completed).length;
        const pending = state.tasks.filter(t => !t.completed).length;
        
        if (state.charts.pie) {
            state.charts.pie.destroy();
        }
        
        state.charts.pie = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Completed', 'Pending'],
                datasets: [{
                    data: [completed, pending],
                    backgroundColor: [
                        'rgba(0, 212, 255, 0.8)',
                        'rgba(99, 102, 241, 0.8)'
                    ],
                    borderColor: [
                        'rgba(0, 212, 255, 1)',
                        'rgba(99, 102, 241, 1)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#e0e7ff',
                            padding: 15,
                            font: {
                                size: 12,
                                family: 'Inter'
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(10, 14, 39, 0.9)',
                        titleColor: '#00d4ff',
                        bodyColor: '#e0e7ff',
                        borderColor: '#00d4ff',
                        borderWidth: 1,
                        padding: 12,
                        displayColors: true
                    }
                },
                animation: {
                    animateScale: true,
                    animateRotate: true
                }
            }
        });
    },
    
    createBarChart() {
        const ctx = document.getElementById('barChart').getContext('2d');
        
        const last7Days = utils.getLastSevenDays();
        const tasksPerDay = this.getTasksPerDay(last7Days);
        
        if (state.charts.bar) {
            state.charts.bar.destroy();
        }
        
        state.charts.bar = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: last7Days,
                datasets: [{
                    label: 'Tasks Completed',
                    data: tasksPerDay,
                    backgroundColor: 'rgba(0, 212, 255, 0.6)',
                    borderColor: 'rgba(0, 212, 255, 1)',
                    borderWidth: 2,
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: '#94a3b8',
                            font: {
                                size: 11,
                                family: 'Inter'
                            },
                            stepSize: 1
                        },
                        grid: {
                            color: 'rgba(0, 212, 255, 0.1)'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#94a3b8',
                            font: {
                                size: 10,
                                family: 'Inter'
                            }
                        },
                        grid: {
                            display: false
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(10, 14, 39, 0.9)',
                        titleColor: '#00d4ff',
                        bodyColor: '#e0e7ff',
                        borderColor: '#00d4ff',
                        borderWidth: 1,
                        padding: 12
                    }
                },
                animation: {
                    duration: 1000,
                    easing: 'easeInOutQuart'
                }
            }
        });
    },
    
    getTasksPerDay(days) {
        return days.map(day => {
            const dayDate = new Date(day);
            return state.tasks.filter(task => {
                if (!task.completedAt) return false;
                const completedDate = new Date(task.completedAt);
                return completedDate.toDateString() === dayDate.toDateString();
            }).length;
        });
    },
    
    updateCharts() {
        this.createPieChart();
        this.createBarChart();
    }
};

// ======================
// App Initialization
// ======================
document.addEventListener('DOMContentLoaded', () => {
    // Load saved data
    loadTasks();
    loadDailyTasks();
    
    // Initialize modules
    calendar.init();
    dailyTasks.init();
    taskManager.init();
    analytics.init();
    
    // Set minimum date for date pickers to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('taskDueDate').setAttribute('min', today);
    document.getElementById('editTaskDueDate').setAttribute('min', today);
});
