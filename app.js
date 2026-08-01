// ===== Main Application =====
class PlannificateurMaison {
    constructor() {
        this.currentSection = 'home';
        this.tasks = [];
        this.appointments = [];
        this.menus = {};
        this.currentDate = new Date();
        this.currentWeekStart = this.getWeekStart(new Date());
        this.currentMonth = this.currentDate.getMonth();
        this.currentYear = this.currentDate.getFullYear();
        
        this.init();
    }
    
    init() {
        this.loadData();
        this.setupEventListeners();
        this.renderCalendar();
        this.updateWeekDates();
        this.updateStats();
        this.showSection(this.currentSection);
    }
    
    // ===== Data Management =====
    loadData() {
        // Load from localStorage if available
        const savedTasks = localStorage.getItem('plannificateur_tasks');
        const savedAppointments = localStorage.getItem('plannificateur_appointments');
        const savedMenus = localStorage.getItem('plannificateur_menus');
        
        if (savedTasks) this.tasks = JSON.parse(savedTasks);
        if (savedAppointments) this.appointments = JSON.parse(savedAppointments);
        if (savedMenus) this.menus = JSON.parse(savedMenus);
    }
    
    saveData() {
        localStorage.setItem('plannificateur_tasks', JSON.stringify(this.tasks));
        localStorage.setItem('plannificateur_appointments', JSON.stringify(this.appointments));
        localStorage.setItem('plannificateur_menus', JSON.stringify(this.menus));
    }
    
    // ===== Navigation =====
    setupEventListeners() {
        // Navigation buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const section = e.target.closest('.nav-btn').dataset.section;
                this.showSection(section);
            });
        });
        
        // Feature cards on home page
        document.querySelectorAll('.feature-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('button')) {
                    const section = card.dataset.section;
                    this.showSection(section);
                }
            });
        });
        
        // Feature card buttons
        document.querySelectorAll('.feature-card .btn-primary').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const section = btn.closest('.feature-card').dataset.section;
                this.showSection(section);
            });
        });
        
        // Task category filters
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.renderTasks(e.target.dataset.category);
            });
        });
        
        // Appointment type filters
        document.querySelectorAll('.type-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.renderAppointments(e.target.dataset.type);
            });
        });
        
        // Add buttons
        document.getElementById('add-task-btn').addEventListener('click', () => this.openModal('add-task-modal'));
        document.getElementById('add-appointment-btn').addEventListener('click', () => this.openModal('add-appointment-modal'));
        document.getElementById('add-menu-btn').addEventListener('click', () => {
            // For menu, we need to know which day and meal type
            this.openMenuModalForDay('monday', 'lunch');
        });
        
        // Calendar navigation
        document.getElementById('prev-month').addEventListener('click', () => this.changeMonth(-1));
        document.getElementById('next-month').addEventListener('click', () => this.changeMonth(1));
        
        // Week navigation
        document.getElementById('prev-week').addEventListener('click', () => this.changeWeek(-7));
        document.getElementById('next-week').addEventListener('click', () => this.changeWeek(7));
        
        // Today button
        document.getElementById('today-btn').addEventListener('click', () => {
            this.currentDate = new Date();
            this.currentMonth = this.currentDate.getMonth();
            this.currentYear = this.currentDate.getFullYear();
            this.renderCalendar();
            this.renderEventsForDate(this.currentDate);
        });
        
        // Week view button
        document.getElementById('week-btn').addEventListener('click', () => {
            alert('Vue semaine: Cette fonctionnalité sera implémentée dans une prochaine version.');
        });
        
        // Month view button
        document.getElementById('month-btn').addEventListener('click', () => {
            alert('Vue mois: Cette fonctionnalité sera implémentée dans une prochaine version.');
        });
        
        // Modal close buttons
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => this.closeAllModals());
        });
        
        // Modal overlay click
        document.getElementById('modal-overlay').addEventListener('click', (e) => {
            if (e.target.id === 'modal-overlay') {
                this.closeAllModals();
            }
        });
        
        // Form submissions
        document.getElementById('task-form').addEventListener('submit', (e) => this.handleTaskSubmit(e));
        document.getElementById('appointment-form').addEventListener('submit', (e) => this.handleAppointmentSubmit(e));
        document.getElementById('menu-form').addEventListener('submit', (e) => this.handleMenuSubmit(e));
        
        // Cancel buttons
        document.getElementById('cancel-task').addEventListener('click', () => this.closeAllModals());
        document.getElementById('cancel-appointment').addEventListener('click', () => this.closeAllModals());
        document.getElementById('cancel-menu').addEventListener('click', () => this.closeAllModals());
        
        // Recurring task checkbox
        document.getElementById('task-recurring').addEventListener('change', (e) => {
            document.getElementById('recurring-options').style.display = e.target.checked ? 'block' : 'none';
        });
        
        // Menu meal content click
        document.querySelectorAll('.meal-content').forEach(content => {
            content.addEventListener('click', (e) => {
                const day = content.dataset.day;
                const meal = content.dataset.meal;
                this.openMenuModalForDay(day, meal);
            });
        });
        
        // Clear shopping list
        document.getElementById('clear-shopping-list').addEventListener('click', () => {
            if (confirm('Êtes-vous sûr de vouloir vider la liste de courses ?')) {
                this.clearShoppingList();
            }
        });
        
        // Calendar day click
        document.getElementById('calendar-days').addEventListener('click', (e) => {
            const dayElement = e.target.closest('.calendar-day');
            if (dayElement && !dayElement.classList.contains('disabled')) {
                const day = parseInt(dayElement.textContent);
                const date = new Date(this.currentYear, this.currentMonth, day);
                this.currentDate = date;
                this.renderCalendar();
                this.renderEventsForDate(date);
            }
        });
    }
    
    showSection(section) {
        // Update current section
        this.currentSection = section;
        
        // Update nav buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.section === section);
        });
        
        // Show/hide sections
        document.querySelectorAll('.section').forEach(s => {
            s.classList.toggle('active', s.id === section);
        });
        
        // Render section content
        switch (section) {
            case 'home':
                this.updateStats();
                break;
            case 'tasks':
                this.renderTasks('all');
                break;
            case 'appointments':
                this.renderAppointments('all');
                break;
            case 'schedule':
                this.renderCalendar();
                this.renderEventsForDate(this.currentDate);
                break;
            case 'menus':
                this.renderMenus();
                this.updateWeekDates();
                break;
        }
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    // ===== Tasks Management =====
    renderTasks(category = 'all') {
        const taskList = document.getElementById('task-list');
        const filteredTasks = category === 'all' 
            ? this.tasks 
            : this.tasks.filter(task => task.category === category);
        
        if (filteredTasks.length === 0) {
            taskList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clipboard-list"></i>
                    <p>Aucune tâche pour le moment</p>
                    <p class="subtitle">Ajoutez votre première tâche pour commencer</p>
                </div>
            `;
            return;
        }
        
        taskList.innerHTML = filteredTasks.map(task => this.createTaskElement(task)).join('');
    }
    
    createTaskElement(task) {
        const dueDate = new Date(task.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const isOverdue = dueDate < today && !task.completed;
        const priorityClass = `priority-${task.priority}`;
        const statusClass = task.completed ? 'status-done' : 'status-todo';
        
        return `
            <div class="task-item ${priorityClass} ${statusClass}" data-task-id="${task.id}">
                <div class="task-checkbox ${task.completed ? 'checked' : ''}" onclick="app.toggleTaskStatus('${task.id}')">
                    ${task.completed ? '<i class="fas fa-check"></i>' : ''}
                </div>
                <div class="task-info">
                    <div class="task-title">${task.title}</div>
                    ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
                    <div class="task-meta">
                        <span class="task-category">${this.getCategoryLabel(task.category)}</span>
                        <span class="task-priority ${task.priority}">
                            <i class="fas fa-exclamation-circle"></i>
                            ${this.getPriorityLabel(task.priority)}
                        </span>
                        ${task.dueDate ? `<span class="task-due-date ${isOverdue ? 'overdue' : ''}">
                            <i class="fas fa-calendar"></i>
                            ${this.formatDate(dueDate)}
                        </span>` : ''}
                        ${task.assignedTo ? `<span class="task-assigned"><i class="fas fa-user"></i> ${task.assignedTo}</span>` : ''}
                    </div>
                </div>
                <div class="task-actions">
                    <button class="task-action-btn edit" onclick="app.editTask('${task.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="task-action-btn delete" onclick="app.deleteTask('${task.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }
    
    handleTaskSubmit(e) {
        e.preventDefault();
        
        const task = {
            id: Date.now().toString(),
            title: document.getElementById('task-title').value,
            description: document.getElementById('task-description').value,
            category: document.getElementById('task-category').value,
            priority: document.getElementById('task-priority').value,
            dueDate: document.getElementById('task-due-date').value,
            assignedTo: document.getElementById('task-assigned').value,
            completed: false,
            recurring: document.getElementById('task-recurring').checked,
            recurringFrequency: document.getElementById('task-recurring').checked ? 
                document.getElementById('recurring-frequency').value : null,
            createdAt: new Date().toISOString()
        };
        
        this.tasks.push(task);
        this.saveData();
        this.renderTasks('all');
        this.updateStats();
        this.closeAllModals();
        this.resetForm('task-form');
    }
    
    toggleTaskStatus(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            this.saveData();
            this.renderTasks(document.querySelector('.category-btn.active')?.dataset.category || 'all');
            this.updateStats();
        }
    }
    
    editTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        document.getElementById('task-title').value = task.title;
        document.getElementById('task-description').value = task.description || '';
        document.getElementById('task-category').value = task.category;
        document.getElementById('task-priority').value = task.priority;
        document.getElementById('task-due-date').value = task.dueDate || '';
        document.getElementById('task-assigned').value = task.assignedTo || 'lucie';
        document.getElementById('task-recurring').checked = task.recurring || false;
        
        if (task.recurring) {
            document.getElementById('recurring-options').style.display = 'block';
            document.getElementById('recurring-frequency').value = task.recurringFrequency || 'daily';
        }
        
        // Store the task ID for update
        document.getElementById('task-form').dataset.taskId = task.id;
        
        this.openModal('add-task-modal');
    }
    
    deleteTask(taskId) {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
            this.tasks = this.tasks.filter(t => t.id !== taskId);
            this.saveData();
            this.renderTasks('all');
            this.updateStats();
        }
    }
    
    // ===== Appointments Management =====
    renderAppointments(type = 'all') {
        const appointmentList = document.getElementById('appointment-list');
        const filteredAppointments = type === 'all' 
            ? this.appointments 
            : this.appointments.filter(appt => appt.type === type);
        
        if (filteredAppointments.length === 0) {
            appointmentList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar-plus"></i>
                    <p>Aucun rendez-vous planifié</p>
                    <p class="subtitle">Ajoutez votre premier rendez-vous</p>
                </div>
            `;
            return;
        }
        
        // Sort by date and time
        filteredAppointments.sort((a, b) => {
            const dateA = new Date(a.date + 'T' + a.time);
            const dateB = new Date(b.date + 'T' + b.time);
            return dateA - dateB;
        });
        
        appointmentList.innerHTML = filteredAppointments.map(appt => this.createAppointmentElement(appt)).join('');
    }
    
    createAppointmentElement(appt) {
        const date = new Date(appt.date + 'T' + appt.time);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const isPast = date < today;
        
        return `
            <div class="appointment-item ${isPast ? 'past' : ''}" data-appointment-id="${appt.id}">
                <div class="appointment-date-time">
                    <div class="appointment-date">${date.getDate()}</div>
                    <div class="appointment-time">${this.formatTime(appt.time)}</div>
                </div>
                <div class="appointment-info">
                    <div class="appointment-title">${appt.title}</div>
                    ${appt.description ? `<div class="appointment-description">${appt.description}</div>` : ''}
                    <div class="appointment-meta">
                        <span class="appointment-type ${appt.type}">${this.getAppointmentTypeLabel(appt.type)}</span>
                        ${appt.location ? `<span class="appointment-location"><i class="fas fa-map-marker-alt"></i> ${appt.location}</span>` : ''}
                    </div>
                </div>
                <div class="appointment-actions">
                    <button class="task-action-btn edit" onclick="app.editAppointment('${appt.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="task-action-btn delete" onclick="app.deleteAppointment('${appt.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }
    
    handleAppointmentSubmit(e) {
        e.preventDefault();
        
        const appointment = {
            id: Date.now().toString(),
            title: document.getElementById('appointment-title').value,
            description: document.getElementById('appointment-description').value,
            date: document.getElementById('appointment-date').value,
            time: document.getElementById('appointment-time').value,
            type: document.getElementById('appointment-type').value,
            location: document.getElementById('appointment-location').value,
            reminder: document.getElementById('appointment-reminder').value,
            createdAt: new Date().toISOString()
        };
        
        this.appointments.push(appointment);
        this.saveData();
        this.renderAppointments('all');
        this.updateStats();
        this.closeAllModals();
        this.resetForm('appointment-form');
    }
    
    editAppointment(appointmentId) {
        const appt = this.appointments.find(a => a.id === appointmentId);
        if (!appt) return;
        
        document.getElementById('appointment-title').value = appt.title;
        document.getElementById('appointment-description').value = appt.description || '';
        document.getElementById('appointment-date').value = appt.date;
        document.getElementById('appointment-time').value = appt.time;
        document.getElementById('appointment-type').value = appt.type;
        document.getElementById('appointment-location').value = appt.location || '';
        document.getElementById('appointment-reminder').value = appt.reminder || 'none';
        
        // Store the appointment ID for update
        document.getElementById('appointment-form').dataset.appointmentId = appt.id;
        
        this.openModal('add-appointment-modal');
    }
    
    deleteAppointment(appointmentId) {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce rendez-vous ?')) {
            this.appointments = this.appointments.filter(a => a.id !== appointmentId);
            this.saveData();
            this.renderAppointments('all');
            this.updateStats();
        }
    }
    
    // ===== Calendar Management =====
    renderCalendar() {
        const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                          'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
        
        // Update month display
        document.getElementById('current-month').textContent = 
            `${monthNames[this.currentMonth]} ${this.currentYear}`;
        
        // Get first day of month and total days
        const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
        const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
        const daysInPrevMonth = new Date(this.currentYear, this.currentMonth, 0).getDate();
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let html = '';
        
        // Previous month days
        for (let i = firstDay - 1; i >= 0; i--) {
            const day = daysInPrevMonth - i;
            html += `<div class="calendar-day disabled">${day}</div>`;
        }
        
        // Current month days
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(this.currentYear, this.currentMonth, day);
            const isToday = date.getTime() === today.getTime();
            const isSelected = this.currentDate && 
                date.getTime() === this.currentDate.getTime();
            
            // Check if there are events on this day
            const hasEvent = this.appointments.some(appt => {
                const apptDate = new Date(appt.date);
                return apptDate.getDate() === day && 
                       apptDate.getMonth() === this.currentMonth && 
                       apptDate.getFullYear() === this.currentYear;
            });
            
            let classes = 'calendar-day';
            if (isToday) classes += ' today';
            if (isSelected) classes += ' selected';
            if (hasEvent) classes += ' has-event';
            
            html += `<div class="${classes}">${day}</div>`;
        }
        
        // Next month days
        const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
        const remainingCells = totalCells - (firstDay + daysInMonth);
        
        for (let day = 1; day <= remainingCells; day++) {
            html += `<div class="calendar-day disabled">${day}</div>`;
        }
        
        document.getElementById('calendar-days').innerHTML = html;
    }
    
    changeMonth(delta) {
        this.currentMonth += delta;
        
        if (this.currentMonth < 0) {
            this.currentMonth = 11;
            this.currentYear--;
        } else if (this.currentMonth > 11) {
            this.currentMonth = 0;
            this.currentYear++;
        }
        
        this.renderCalendar();
    }
    
    renderEventsForDate(date) {
        const eventsList = document.getElementById('events-list');
        const dateStr = date.toISOString().split('T')[0];
        
        const events = this.appointments.filter(appt => appt.date === dateStr);
        
        if (events.length === 0) {
            eventsList.innerHTML = `
                <div class="empty-state small">
                    <i class="fas fa-info-circle"></i>
                    <p>Aucun événement pour cette date</p>
                </div>
            `;
            return;
        }
        
        eventsList.innerHTML = events.map(appt => `
            <div class="event-item">
                <div class="event-time">${this.formatTime(appt.time)}</div>
                <div class="event-title">${appt.title}</div>
                <div class="event-type">${this.getAppointmentTypeLabel(appt.type)}</div>
            </div>
        `).join('');
    }
    
    // ===== Menus Management =====
    openMenuModalForDay(day, mealType) {
        // Set the day and meal type in the form
        document.getElementById('menu-day').value = day;
        document.getElementById('menu-meal-type').value = mealType;
        
        // If there's already a menu for this day and meal, populate the form
        const menuKey = `${day}_${mealType}`;
        if (this.menus[menuKey]) {
            const menu = this.menus[menuKey];
            document.getElementById('menu-recipe').value = menu.recipe;
            document.getElementById('menu-ingredients').value = menu.ingredients ? menu.ingredients.join(', ') : '';
            document.getElementById('menu-servings').value = menu.servings || 4;
            document.getElementById('menu-prep-time').value = menu.prepTime || 30;
            document.getElementById('menu-notes').value = menu.notes || '';
        } else {
            this.resetForm('menu-form');
        }
        
        this.openModal('add-menu-modal');
    }
    
    handleMenuSubmit(e) {
        e.preventDefault();
        
        const day = document.getElementById('menu-day').value;
        const mealType = document.getElementById('menu-meal-type').value;
        const menuKey = `${day}_${mealType}`;
        
        const menu = {
            recipe: document.getElementById('menu-recipe').value,
            ingredients: document.getElementById('menu-ingredients').value
                .split(',')
                .map(i => i.trim())
                .filter(i => i),
            servings: parseInt(document.getElementById('menu-servings').value) || 4,
            prepTime: parseInt(document.getElementById('menu-prep-time').value) || 30,
            notes: document.getElementById('menu-notes').value
        };
        
        this.menus[menuKey] = menu;
        this.saveData();
        this.renderMenus();
        this.closeAllModals();
    }
    
    renderMenus() {
        // Update all meal content displays
        document.querySelectorAll('.meal-content').forEach(content => {
            const day = content.dataset.day;
            const meal = content.dataset.meal;
            const menuKey = `${day}_${meal}`;
            const menu = this.menus[menuKey];
            
            if (menu) {
                content.classList.add('has-meal');
                content.innerHTML = `
                    <div class="meal-info">
                        <div class="meal-title">${menu.recipe}</div>
                        ${menu.prepTime ? `<div class="meal-details"><i class="fas fa-clock"></i> ${menu.prepTime} min</div>` : ''}
                        ${menu.servings ? `<div class="meal-details"><i class="fas fa-users"></i> ${menu.servings} pers.</div>` : ''}
                    </div>
                    <div class="meal-actions">
                        <button class="meal-action-btn edit" onclick="app.editMenu('${day}', '${meal}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="meal-action-btn delete" onclick="app.deleteMenu('${day}', '${meal}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;
            } else {
                content.classList.remove('has-meal');
                content.innerHTML = '<span class="meal-placeholder">Ajouter un repas</span>';
            }
        });
        
        // Update shopping list
        this.renderShoppingList();
    }
    
    editMenu(day, mealType) {
        this.openMenuModalForDay(day, mealType);
    }
    
    deleteMenu(day, mealType) {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce menu ?')) {
            const menuKey = `${day}_${mealType}`;
            delete this.menus[menuKey];
            this.saveData();
            this.renderMenus();
        }
    }
    
    renderShoppingList() {
        const shoppingList = document.getElementById('shopping-list');
        
        // Collect all ingredients from all menus
        const allIngredients = [];
        
        Object.values(this.menus).forEach(menu => {
            if (menu.ingredients) {
                menu.ingredients.forEach(ingredient => {
                    // Check if ingredient already exists
                    const existing = allIngredients.find(i => 
                        i.name.toLowerCase() === ingredient.toLowerCase()
                    );
                    
                    if (existing) {
                        existing.quantity += menu.servings || 1;
                    } else {
                        allIngredients.push({
                            name: ingredient,
                            quantity: menu.servings || 1
                        });
                    }
                });
            }
        });
        
        if (allIngredients.length === 0) {
            shoppingList.innerHTML = `
                <div class="empty-state small">
                    <i class="fas fa-shopping-basket"></i>
                    <p>Aucun ingrédient dans la liste de courses</p>
                </div>
            `;
            return;
        }
        
        // Sort ingredients alphabetically
        allIngredients.sort((a, b) => a.name.localeCompare(b.name, 'fr'));
        
        shoppingList.innerHTML = allIngredients.map(ingredient => `
            <div class="shopping-item">
                <input type="checkbox" id="ingredient-${ingredient.name}">
                <label for="ingredient-${ingredient.name}">
                    <span>${ingredient.name}</span>
                    <span class="quantity">x ${ingredient.quantity}</span>
                </label>
            </div>
        `).join('');
    }
    
    clearShoppingList() {
        this.menus = {};
        this.saveData();
        this.renderMenus();
    }
    
    updateWeekDates() {
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        const dayNames = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
        
        // Update week selector
        const weekStart = this.currentWeekStart;
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        const startDateStr = weekStart.toLocaleDateString('fr-FR', options);
        const endDateStr = weekEnd.toLocaleDateString('fr-FR', options);
        
        document.getElementById('current-week').textContent = 
            `Semaine du ${startDateStr} au ${endDateStr}`;
        
        // Update each day's date
        days.forEach((day, index) => {
            const date = new Date(weekStart);
            date.setDate(date.getDate() + index);
            
            const dateStr = date.toLocaleDateString('fr-FR', { 
                day: 'numeric', 
                month: 'long' 
            });
            
            document.getElementById(`${day}-date`).textContent = dateStr;
        });
    }
    
    changeWeek(days) {
        this.currentWeekStart.setDate(this.currentWeekStart.getDate() + days);
        this.updateWeekDates();
    }
    
    // ===== Stats =====
    updateStats() {
        // Task count
        const pendingTasks = this.tasks.filter(t => !t.completed).length;
        document.getElementById('task-count').textContent = pendingTasks;
        
        // Appointment count for today
        const today = new Date().toISOString().split('T')[0];
        const todayAppointments = this.appointments.filter(appt => appt.date === today).length;
        document.getElementById('appointment-count').textContent = todayAppointments;
        
        // Menu count
        const menuCount = Object.keys(this.menus).length;
        document.getElementById('menu-count').textContent = menuCount;
    }
    
    // ===== Modals =====
    openModal(modalId) {
        document.getElementById('modal-overlay').classList.add('active');
        document.getElementById(modalId).style.display = 'block';
    }
    
    closeAllModals() {
        document.getElementById('modal-overlay').classList.remove('active');
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    }
    
    resetForm(formId) {
        document.getElementById(formId).reset();
        // Hide recurring options
        document.getElementById('recurring-options').style.display = 'none';
        // Remove any stored IDs
        delete document.getElementById(formId).dataset.taskId;
        delete document.getElementById(formId).dataset.appointmentId;
    }
    
    // ===== Utilities =====
    getCategoryLabel(category) {
        const labels = {
            'menage': 'Ménage',
            'courses': 'Courses',
            'jardin': 'Jardin',
            'autres': 'Autres'
        };
        return labels[category] || category;
    }
    
    getPriorityLabel(priority) {
        const labels = {
            'high': 'Haute',
            'medium': 'Moyenne',
            'low': 'Basse'
        };
        return labels[priority] || priority;
    }
    
    getAppointmentTypeLabel(type) {
        const labels = {
            'medical': 'Médical',
            'professional': 'Professionnel',
            'personal': 'Personnel'
        };
        return labels[type] || type;
    }
    
    formatDate(date) {
        if (!date) return '';
        
        const d = new Date(date);
        return d.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    }
    
    formatTime(time) {
        if (!time) return '';
        const [hours, minutes] = time.split(':');
        return `${hours}:${minutes}`;
    }
    
    getWeekStart(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday as first day
        return new Date(d.setDate(diff));
    }
}

// Initialize the application
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new PlannificateurMaison();
});

// Make app available globally for onclick handlers
window.app = null;
