// ===== Plannificateur Maison - Full Application =====

class PlannificateurMaison {
    constructor() {
        this.currentSection = 'home';
        this.currentAdminTab = 'members';
        this.currentAppointmentTab = 'upcoming';
        
        // Data storage
        this.members = JSON.parse(localStorage.getItem('members')) || [];
        this.stores = JSON.parse(localStorage.getItem('stores')) || [];
        this.meals = JSON.parse(localStorage.getItem('meals')) || [];
        this.appointments = JSON.parse(localStorage.getItem('appointments')) || [];
        this.medicationOrders = JSON.parse(localStorage.getItem('medicationOrders')) || [];
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        
        // Task filters
        this.currentTaskFilter = 'all';
        this.currentTaskView = 'list';
        
        // Current editing item
        this.currentEditIndex = null;
        this.currentEditType = null;
        
        // Days of week
        this.daysOfWeek = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
        this.statusOptions = ['Sur site', 'Télétravail', "À l'école", 'En congés'];
        
        // Months
        this.months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
        this.monthNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
        
        // Reminder options
        this.reminderOptions = [1, 2, 3, 4];
        
        // Task categories
        this.taskCategories = [
            { value: 'menage', label: 'Ménage', color: '#E3F2FD', textColor: '#1565C0' },
            { value: 'courses', label: 'Courses', color: '#F3E5F5', textColor: '#6A1B9A' },
            { value: 'jardinage', label: 'Jardinage', color: '#E8F5E9', textColor: '#2E7D32' },
            { value: 'reparation', label: 'Réparation', color: '#FFF3E0', textColor: '#E65100' },
            { value: 'organisation', label: 'Organisation', color: '#FCE4EC', textColor: '#C2185B' },
            { value: 'autre', label: 'Autre', color: '#F5F5F5', textColor: '#616161' }
        ];
        
        // Task recurrence options
        this.recurrenceOptions = [
            { value: 'once', label: 'Une seule fois' },
            { value: 'daily', label: 'Quotidienne' },
            { value: 'weekly', label: 'Hebdomadaire' },
            { value: 'biweekly', label: 'Tous les 15 jours' },
            { value: 'monthly', label: 'Mensuelle' },
            { value: 'yearly', label: 'Annuelle' }
        ];
        
        // Priority levels
        this.priorityLevels = [
            { value: 1, label: 'Très basse', color: '#2E7D32', bgColor: '#E8F5E9' },
            { value: 2, label: 'Basse', color: '#558B2F', bgColor: '#F1F8E9' },
            { value: 3, label: 'Normale', color: '#F57F17', bgColor: '#FFF8E1' },
            { value: 4, label: 'Haute', color: '#FF8F00', bgColor: '#FFECB3' },
            { value: 5, label: 'Urgente', color: '#C62828', bgColor: '#FFEBEE' }
        ];
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.showSection(this.currentSection);
        this.renderAllAdminData();
        this.initializeAppointmentForms();
        
        // Set current date for calendar
        this.currentCalendarDate = new Date();
    }
    
    setupEventListeners() {
        // Navigation buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.showSection(btn.dataset.section);
            });
        });
        
        // Feature cards on home page
        document.querySelectorAll('.feature-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('button')) {
                    const section = card.dataset.section;
                    if (section) {
                        this.showSection(section);
                    }
                }
            });
        });
        
        // Admin tab buttons
        document.querySelectorAll('.admin-tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchAdminTab(btn.dataset.tab);
            });
        });
        
        // Add buttons
        document.getElementById('addMemberBtn')?.addEventListener('click', () => {
            this.openMemberForm();
        });
        
        document.getElementById('addStoreBtn')?.addEventListener('click', () => {
            this.openStoreForm();
        });
        
        document.getElementById('addMealBtn')?.addEventListener('click', () => {
            this.openMealForm();
        });
        
        // Form overlay close
        document.querySelectorAll('.form-close').forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeAllForms();
            });
        });
        
        // Close form when clicking outside
        document.querySelectorAll('.form-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.closeAllForms();
                }
            });
        });
        
        // Birthday date change - auto calculate age
        document.getElementById('memberBirthday')?.addEventListener('change', (e) => {
            this.calculateAgeFromBirthday(e.target.value);
        });
        
        // Appointment tabs
        document.querySelectorAll('.appointment-tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchAppointmentTab(btn.dataset.tab);
            });
        });
        
        // Add appointment buttons
        document.getElementById('addAppointmentBtn')?.addEventListener('click', () => {
            this.openAppointmentForm();
        });
        
        document.getElementById('addScheduledAppointmentBtn')?.addEventListener('click', () => {
            this.openScheduledAppointmentForm();
        });
        
        document.getElementById('addMedicationOrderBtn')?.addEventListener('click', () => {
            this.openMedicationOrderForm();
        });
        
        // Calendar navigation
        document.getElementById('prevMonth')?.addEventListener('click', () => {
            this.navigateCalendar(-1);
        });
        
        document.getElementById('nextMonth')?.addEventListener('click', () => {
            this.navigateCalendar(1);
        });
        
        // Calendar view toggle
        document.getElementById('calendarViewToggle')?.addEventListener('change', (e) => {
            if (e.target.checked) {
                this.switchAppointmentTab('calendar');
            } else {
                this.switchAppointmentTab('upcoming');
            }
        });
        
        // Task buttons
        document.getElementById('addTaskBtn')?.addEventListener('click', () => {
            this.openTaskForm();
        });
        
        document.getElementById('distributeTasksBtn')?.addEventListener('click', () => {
            this.distributeTasks();
        });
        
        // Task filter buttons
        document.querySelectorAll('.filter-btn')?.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTaskFilter(btn.dataset.filter);
            });
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
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // If switching to admin, ensure members tab is active
        if (section === 'admin') {
            this.switchAdminTab(this.currentAdminTab);
        }
        
        // If switching to appointments, ensure upcoming tab is active
        if (section === 'appointments') {
            this.switchAppointmentTab('upcoming');
        }
        
        // If switching to tasks, render tasks
        if (section === 'tasks') {
            this.renderTasks();
        }
    }
    
    switchAdminTab(tab) {
        this.currentAdminTab = tab;
        
        // Update tab buttons
        document.querySelectorAll('.admin-tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });
        
        // Update tab panes
        document.querySelectorAll('.admin-tab-pane').forEach(pane => {
            pane.classList.toggle('active', pane.id === tab);
        });
    }
    
    switchAppointmentTab(tab) {
        this.currentAppointmentTab = tab;
        
        // Update tab buttons
        document.querySelectorAll('.appointment-tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });
        
        // Update tab panes
        document.querySelectorAll('.appointment-tab-pane').forEach(pane => {
            pane.classList.toggle('active', pane.id === tab);
        });
        
        // Render content based on tab
        if (tab === 'upcoming') {
            this.renderUpcomingAppointments();
        } else if (tab === 'scheduled') {
            this.renderScheduledAppointments();
        } else if (tab === 'medications') {
            this.renderMedicationOrders();
        } else if (tab === 'calendar') {
            this.renderCalendar();
        }
    }
    
    // ===== Utility Functions =====
    calculateAgeFromBirthday(birthday) {
        if (!birthday) {
            document.getElementById('memberAge').value = '';
            return 0;
        }
        
        const birthDate = new Date(birthday);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        document.getElementById('memberAge').value = age;
        return age;
    }
    
    getDayStatus(member, dayIndex) {
        if (member.schedule && member.schedule[dayIndex]) {
            return member.schedule[dayIndex];
        }
        return 'Sur site'; // Default
    }
    
    // ===== Members Management =====
    openMemberForm(member = null, index = null) {
        const overlay = document.getElementById('memberFormOverlay');
        
        if (member) {
            // Edit mode
            this.currentEditIndex = index;
            this.currentEditType = 'member';
            document.getElementById('memberFormTitle').textContent = 'Modifier le membre';
            document.getElementById('memberName').value = member.name || '';
            document.getElementById('memberBirthday').value = member.birthday || '';
            this.calculateAgeFromBirthday(member.birthday || '');
            document.getElementById('memberFatigue').value = member.fatigue || 1;
            document.getElementById('memberStress').value = member.stress || 1;
            
            // Set schedule
            this.renderScheduleInputs(member.schedule || {});
        } else {
            // Add mode
            this.currentEditIndex = null;
            this.currentEditType = null;
            document.getElementById('memberFormTitle').textContent = 'Ajouter un membre';
            document.getElementById('memberName').value = '';
            document.getElementById('memberBirthday').value = '';
            document.getElementById('memberAge').value = '';
            document.getElementById('memberFatigue').value = 1;
            document.getElementById('memberStress').value = 1;
            
            // Set default schedule
            const defaultSchedule = {};
            this.daysOfWeek.forEach((day, idx) => {
                defaultSchedule[idx] = 'Sur site';
            });
            this.renderScheduleInputs(defaultSchedule);
        }
        
        overlay.classList.add('active');
    }
    
    renderScheduleInputs(schedule) {
        const container = document.getElementById('memberSchedule');
        container.innerHTML = '';
        
        this.daysOfWeek.forEach((day, index) => {
            const row = document.createElement('div');
            row.className = 'schedule-row';
            row.innerHTML = `
                <span class="day-label">${day}</span>
                <select class="status-select" data-day="${index}">
                    ${this.statusOptions.map(opt => `
                        <option value="${opt}" ${schedule[index] === opt ? 'selected' : ''}>${opt}</option>
                    `).join('')}
                </select>
            `;
            container.appendChild(row);
        });
    }
    
    saveMember() {
        const name = document.getElementById('memberName').value.trim();
        const birthday = document.getElementById('memberBirthday').value;
        const fatigue = parseInt(document.getElementById('memberFatigue').value) || 1;
        const stress = parseInt(document.getElementById('memberStress').value) || 1;
        
        if (!name) {
            alert('Veuillez entrer un prénom pour le membre');
            return;
        }
        
        // Get schedule
        const schedule = {};
        document.querySelectorAll('#memberSchedule .status-select').forEach(select => {
            const dayIndex = parseInt(select.dataset.day);
            schedule[dayIndex] = select.value;
        });
        
        // Calculate age
        const age = this.calculateAgeFromBirthday(birthday);
        
        const member = { name, birthday, age, fatigue, stress, schedule };
        
        if (this.currentEditIndex !== null) {
            // Update existing
            this.members[this.currentEditIndex] = member;
        } else {
            // Add new
            this.members.push(member);
        }
        
        this.saveData();
        this.closeAllForms();
        this.renderMembers();
    }
    
    deleteMember(index) {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce membre ?')) {
            this.members.splice(index, 1);
            this.saveData();
            this.renderMembers();
        }
    }
    
    renderMembers() {
        const container = document.getElementById('membersList');
        
        if (this.members.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-users"></i>
                    <p>Aucun membre ajouté pour l'instant</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.members.map((member, index) => {
            const birthday = member.birthday ? new Date(member.birthday) : null;
            const birthdayStr = birthday ? birthday.toLocaleDateString('fr-FR') : 'Non spécifié';
            
            return `
            <div class="member-card">
                <div class="member-header">
                    <span class="member-name">${this.escapeHtml(member.name)}</span>
                    <div class="card-actions">
                        <button class="btn-edit" onclick="app.editMember(${index})">
                            <i class="fas fa-edit"></i> Modifier
                        </button>
                        <button class="btn-delete" onclick="app.deleteMember(${index})">
                            <i class="fas fa-trash"></i> Supprimer
                        </button>
                    </div>
                </div>
                <div class="member-info">
                    <div class="info-item">
                        <i class="fas fa-birthday-cake"></i>
                        <span><strong>Âge:</strong> ${member.age || 'Non spécifié'} ans</span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-calendar"></i>
                        <span><strong>Anniversaire:</strong> ${birthdayStr}</span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-tired"></i>
                        <span><strong>Fatigue:</strong> ${member.fatigue}/5 
                        <span class="fatigue-indicator fatigue-${member.fatigue}"></span>
                        </span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-brain"></i>
                        <span><strong>Stress:</strong> ${member.stress}/5 
                        <span class="stress-indicator stress-${member.stress}"></span>
                        </span>
                    </div>
                </div>
                <div class="member-schedule">
                    <h4>Emploi du temps hebdomadaire</h4>
                    <div class="schedule-grid">
                        ${this.daysOfWeek.map((day, idx) => {
                            const status = this.getDayStatus(member, idx);
                            const statusClass = this.getStatusClass(status);
                            return `
                                <div class="schedule-day">
                                    <span class="day-name">${day}</span>
                                    <span class="status-badge ${statusClass}">${status}</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
        `}).join('');
    }
    
    getStatusClass(status) {
        const classes = {
            'Sur site': 'status-site',
            'Télétravail': 'status-remote',
            "À l'école": 'status-school',
            'En congés': 'status-vacation'
        };
        return classes[status] || 'status-site';
    }
    
    editMember(index) {
        this.openMemberForm(this.members[index], index);
    }
    
    // ===== Stores Management =====
    openStoreForm(store = null, index = null) {
        const overlay = document.getElementById('storeFormOverlay');
        
        if (store) {
            // Edit mode
            this.currentEditIndex = index;
            this.currentEditType = 'store';
            document.getElementById('storeFormTitle').textContent = 'Modifier le magasin';
            document.getElementById('storeName').value = store.name || '';
        } else {
            // Add mode
            this.currentEditIndex = null;
            this.currentEditType = null;
            document.getElementById('storeFormTitle').textContent = 'Ajouter un magasin';
            document.getElementById('storeName').value = '';
        }
        
        overlay.classList.add('active');
    }
    
    saveStore() {
        const name = document.getElementById('storeName').value.trim();
        
        if (!name) {
            alert('Veuillez entrer un nom pour le magasin');
            return;
        }
        
        const store = { name };
        
        if (this.currentEditIndex !== null) {
            // Update existing
            this.stores[this.currentEditIndex] = store;
        } else {
            // Add new
            this.stores.push(store);
        }
        
        this.saveData();
        this.closeAllForms();
        this.renderStores();
    }
    
    deleteStore(index) {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce magasin ?')) {
            this.stores.splice(index, 1);
            this.saveData();
            this.renderStores();
        }
    }
    
    renderStores() {
        const container = document.getElementById('storesList');
        
        if (this.stores.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-store"></i>
                    <p>Aucun magasin ajouté pour l'instant</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.stores.map((store, index) => `
            <div class="store-card">
                <div class="store-header">
                    <span class="store-name">${this.escapeHtml(store.name)}</span>
                    <div class="card-actions">
                        <button class="btn-edit" onclick="app.editStore(${index})">
                            <i class="fas fa-edit"></i> Modifier
                        </button>
                        <button class="btn-delete" onclick="app.deleteStore(${index})">
                            <i class="fas fa-trash"></i> Supprimer
                        </button>
                    </div>
                </div>
                <div class="store-info">
                    <div class="info-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>Magasin enregistré pour les courses</span>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    editStore(index) {
        this.openStoreForm(this.stores[index], index);
    }
    
    // ===== Meals Management =====
    openMealForm(meal = null, index = null) {
        const overlay = document.getElementById('mealFormOverlay');
        
        if (meal) {
            // Edit mode
            this.currentEditIndex = index;
            this.currentEditType = 'meal';
            document.getElementById('mealFormTitle').textContent = 'Modifier le repas';
            document.getElementById('mealTitle').value = meal.title || '';
            document.getElementById('mealPrepTime').value = meal.prepTime || '';
            document.getElementById('mealServings').value = meal.servings || 1;
            document.getElementById('mealIngredients').value = meal.ingredients?.join('\n') || '';
            document.getElementById('mealSteps').value = meal.steps?.join('\n') || '';
            
            // Set months
            this.renderMonthCheckboxes(meal.months || []);
        } else {
            // Add mode
            this.currentEditIndex = null;
            this.currentEditType = null;
            document.getElementById('mealFormTitle').textContent = 'Ajouter un repas';
            document.getElementById('mealTitle').value = '';
            document.getElementById('mealPrepTime').value = '';
            document.getElementById('mealServings').value = 1;
            document.getElementById('mealIngredients').value = '';
            document.getElementById('mealSteps').value = '';
            
            // Set months
            this.renderMonthCheckboxes([]);
        }
        
        overlay.classList.add('active');
    }
    
    renderMonthCheckboxes(selectedMonths) {
        const container = document.getElementById('mealMonths');
        container.innerHTML = '';
        
        const allMonths = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
        allMonths.forEach(month => {
            const label = document.createElement('label');
            label.style.display = 'inline-block';
            label.style.marginRight = '10px';
            label.innerHTML = `
                <input type="checkbox" value="${month}" ${selectedMonths.includes(month) ? 'checked' : ''}> ${month}
            `;
            container.appendChild(label);
        });
    }
    
    saveMeal() {
        const title = document.getElementById('mealTitle').value.trim();
        const prepTime = document.getElementById('mealPrepTime').value.trim();
        const servings = parseInt(document.getElementById('mealServings').value) || 1;
        const ingredients = document.getElementById('mealIngredients').value
            .split('\n')
            .map(i => i.trim())
            .filter(i => i);
        const steps = document.getElementById('mealSteps').value
            .split('\n')
            .map(s => s.trim())
            .filter(s => s);
        
        // Get selected months
        const months = [];
        document.querySelectorAll('#mealMonths input[type="checkbox"]:checked').forEach(cb => {
            months.push(cb.value);
        });
        
        if (!title) {
            alert('Veuillez entrer un titre pour le repas');
            return;
        }
        
        if (ingredients.length === 0) {
            alert('Veuillez ajouter au moins un ingrédient');
            return;
        }
        
        if (steps.length === 0) {
            alert('Veuillez ajouter au moins une étape');
            return;
        }
        
        const meal = { title, prepTime, servings, ingredients, steps, months };
        
        if (this.currentEditIndex !== null) {
            // Update existing
            this.meals[this.currentEditIndex] = meal;
        } else {
            // Add new
            this.meals.push(meal);
        }
        
        this.saveData();
        this.closeAllForms();
        this.renderMeals();
    }
    
    deleteMeal(index) {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce repas ?')) {
            this.meals.splice(index, 1);
            this.saveData();
            this.renderMeals();
        }
    }
    
    renderMeals() {
        const container = document.getElementById('mealsList');
        
        if (this.meals.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-utensils"></i>
                    <p>Aucun repas ajouté pour l'instant</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.meals.map((meal, index) => `
            <div class="meal-card">
                <div class="meal-header">
                    <span class="meal-title">${this.escapeHtml(meal.title)}</span>
                    <div class="card-actions">
                        <button class="btn-edit" onclick="app.editMeal(${index})">
                            <i class="fas fa-edit"></i> Modifier
                        </button>
                        <button class="btn-delete" onclick="app.deleteMeal(${index})">
                            <i class="fas fa-trash"></i> Supprimer
                        </button>
                    </div>
                </div>
                <div class="meal-info">
                    <div class="info-item">
                        <i class="fas fa-clock"></i>
                        <span><strong>Préparation:</strong> ${meal.prepTime || 'Non spécifié'}</span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-users"></i>
                        <span><strong>Portions:</strong> ${meal.servings}</span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-calendar"></i>
                        <span><strong>Mois:</strong> 
                        ${meal.months?.length > 0 ? meal.months.map(m => `<span class="month-tag">${m}</span>`).join('') : 'Tous'}
                        </span>
                    </div>
                </div>
                <div class="meal-details">
                    <div class="meal-section">
                        <h4>Ingrédients (${meal.ingredients?.length || 0})</h4>
                        <ul class="ingredients-list">
                            ${meal.ingredients?.map(ing => `<li>${this.escapeHtml(ing)}</li>`).join('') || ''}
                        </ul>
                    </div>
                    <div class="meal-section">
                        <h4>Étapes (${meal.steps?.length || 0})</h4>
                        <ol class="steps-list">
                            ${meal.steps?.map((step, i) => `<li>${i + 1}. ${this.escapeHtml(step)}</li>`).join('') || ''}
                        </ol>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    editMeal(index) {
        this.openMealForm(this.meals[index], index);
    }
    
    // ===== Appointment Management =====
    openAppointmentForm(appointment = null, index = null) {
        const overlay = document.getElementById('appointmentFormOverlay');
        
        if (appointment) {
            // Edit mode
            this.currentEditIndex = index;
            this.currentEditType = 'appointment';
            document.getElementById('appointmentFormTitle').textContent = 'Modifier le rendez-vous à planifier';
            document.getElementById('appointmentTitle').value = appointment.title || '';
            document.getElementById('appointmentLocation').value = appointment.location || '';
            document.getElementById('appointmentTargetMonth').value = appointment.targetMonth || '';
            document.getElementById('appointmentReminder').value = appointment.reminderMonths || '';
            this.renderChecklistInputs('appointmentChecklist', appointment.checklist || []);
        } else {
            // Add mode
            this.currentEditIndex = null;
            this.currentEditType = null;
            document.getElementById('appointmentFormTitle').textContent = 'Ajouter un rendez-vous à planifier';
            document.getElementById('appointmentTitle').value = '';
            document.getElementById('appointmentLocation').value = '';
            document.getElementById('appointmentTargetMonth').value = '';
            document.getElementById('appointmentReminder').value = '';
            this.renderChecklistInputs('appointmentChecklist', []);
        }
        
        overlay.classList.add('active');
    }
    
    openScheduledAppointmentForm(appointment = null, index = null) {
        const overlay = document.getElementById('scheduledAppointmentFormOverlay');
        
        if (appointment) {
            // Edit mode
            this.currentEditIndex = index;
            this.currentEditType = 'scheduledAppointment';
            document.getElementById('scheduledAppointmentFormTitle').textContent = 'Modifier le rendez-vous pris';
            document.getElementById('scheduledTitle').value = appointment.title || '';
            document.getElementById('scheduledLocation').value = appointment.location || '';
            document.getElementById('scheduledDate').value = appointment.date || '';
            document.getElementById('scheduledTime').value = appointment.time || '';
            this.renderChecklistInputs('scheduledChecklist', appointment.checklist || []);
        } else {
            // Add mode
            this.currentEditIndex = null;
            this.currentEditType = null;
            document.getElementById('scheduledAppointmentFormTitle').textContent = 'Ajouter un rendez-vous pris';
            document.getElementById('scheduledTitle').value = '';
            document.getElementById('scheduledLocation').value = '';
            document.getElementById('scheduledDate').value = '';
            document.getElementById('scheduledTime').value = '';
            this.renderChecklistInputs('scheduledChecklist', []);
        }
        
        overlay.classList.add('active');
    }
    
    openMedicationOrderForm(order = null, index = null) {
        const overlay = document.getElementById('medicationOrderFormOverlay');
        
        if (order) {
            // Edit mode
            this.currentEditIndex = index;
            this.currentEditType = 'medicationOrder';
            document.getElementById('medicationOrderFormTitle').textContent = 'Modifier la commande de médicament';
            document.getElementById('medicationName').value = order.medicationName || '';
            document.getElementById('medicationPerson').value = order.personIndex || '';
            document.getElementById('medicationFrequency').value = order.frequency || '';
            document.getElementById('medicationStartDate').value = order.startDate || '';
            document.getElementById('medicationNotes').value = order.notes || '';
        } else {
            // Add mode
            this.currentEditIndex = null;
            this.currentEditType = null;
            document.getElementById('medicationOrderFormTitle').textContent = 'Ajouter une commande de médicament';
            document.getElementById('medicationName').value = '';
            document.getElementById('medicationPerson').value = '';
            document.getElementById('medicationFrequency').value = '';
            document.getElementById('medicationStartDate').value = '';
            document.getElementById('medicationNotes').value = '';
        }
        
        overlay.classList.add('active');
    }
    
    renderChecklistInputs(containerId, checklist) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';
        
        checklist.forEach((item, index) => {
            const row = document.createElement('div');
            row.className = 'checklist-input-row';
            row.innerHTML = `
                <input type="text" value="${this.escapeHtml(item)}" data-index="${index}" placeholder="Élément de la checklist">
                <button type="button" class="remove-item" onclick="app.removeChecklistItem('${containerId}', ${index})">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            container.appendChild(row);
        });
    }
    
    addChecklistItem(containerId) {
        const container = document.getElementById(containerId);
        const rows = container.querySelectorAll('.checklist-input-row');
        const index = rows.length;
        
        const row = document.createElement('div');
        row.className = 'checklist-input-row';
        row.innerHTML = `
            <input type="text" value="" data-index="${index}" placeholder="Élément de la checklist">
            <button type="button" class="remove-item" onclick="app.removeChecklistItem('${containerId}', ${index})">
                <i class="fas fa-trash"></i>
            </button>
        `;
        container.appendChild(row);
    }
    
    removeChecklistItem(containerId, index) {
        const container = document.getElementById(containerId);
        const row = container.querySelector(`.checklist-input-row input[data-index="${index}"]`).parentElement;
        if (row) {
            row.remove();
            // Re-index remaining items
            container.querySelectorAll('.checklist-input-row').forEach((r, i) => {
                r.querySelector('input').dataset.index = i;
                r.querySelector('.remove-item').setAttribute('onclick', `app.removeChecklistItem('${containerId}', ${i})`);
            });
        }
    }
    
    getChecklistFromContainer(containerId) {
        const container = document.getElementById(containerId);
        const checklist = [];
        container.querySelectorAll('.checklist-input-row input').forEach(input => {
            const value = input.value.trim();
            if (value) {
                checklist.push(value);
            }
        });
        return checklist;
    }
    
    saveAppointment() {
        const title = document.getElementById('appointmentTitle').value.trim();
        const location = document.getElementById('appointmentLocation').value.trim();
        const targetMonth = parseInt(document.getElementById('appointmentTargetMonth').value);
        const reminderMonths = parseInt(document.getElementById('appointmentReminder').value);
        const checklist = this.getChecklistFromContainer('appointmentChecklist');
        
        if (!title) {
            alert('Veuillez entrer un titre pour le rendez-vous');
            return;
        }
        
        if (isNaN(targetMonth)) {
            alert('Veuillez sélectionner un mois cible');
            return;
        }
        
        if (isNaN(reminderMonths)) {
            alert('Veuillez sélectionner une période de rappel');
            return;
        }
        
        const appointment = {
            title,
            location,
            targetMonth,
            reminderMonths,
            checklist,
            createdAt: new Date().toISOString()
        };
        
        if (this.currentEditIndex !== null) {
            this.appointments[this.currentEditIndex] = appointment;
        } else {
            this.appointments.push(appointment);
        }
        
        this.saveData();
        this.closeAllForms();
        this.renderUpcomingAppointments();
    }
    
    saveScheduledAppointment() {
        const title = document.getElementById('scheduledTitle').value.trim();
        const location = document.getElementById('scheduledLocation').value.trim();
        const date = document.getElementById('scheduledDate').value;
        const time = document.getElementById('scheduledTime').value;
        const checklist = this.getChecklistFromContainer('scheduledChecklist');
        
        if (!title) {
            alert('Veuillez entrer un titre pour le rendez-vous');
            return;
        }
        
        if (!date) {
            alert('Veuillez sélectionner une date');
            return;
        }
        
        const appointment = {
            title,
            location,
            date,
            time,
            checklist,
            createdAt: new Date().toISOString()
        };
        
        if (this.currentEditIndex !== null) {
            this.appointments[this.currentEditIndex] = appointment;
        } else {
            this.appointments.push(appointment);
        }
        
        this.saveData();
        this.closeAllForms();
        this.renderScheduledAppointments();
    }
    
    saveMedicationOrder() {
        const medicationName = document.getElementById('medicationName').value.trim();
        const personIndex = parseInt(document.getElementById('medicationPerson').value);
        const frequency = parseInt(document.getElementById('medicationFrequency').value);
        const startDate = document.getElementById('medicationStartDate').value;
        const notes = document.getElementById('medicationNotes').value.trim();
        
        if (!medicationName) {
            alert('Veuillez entrer un nom pour le médicament');
            return;
        }
        
        if (isNaN(personIndex)) {
            alert('Veuillez sélectionner une personne');
            return;
        }
        
        if (isNaN(frequency)) {
            alert('Veuillez sélectionner une fréquence');
            return;
        }
        
        const order = {
            medicationName,
            personIndex,
            frequency,
            startDate,
            notes,
            createdAt: new Date().toISOString()
        };
        
        if (this.currentEditIndex !== null) {
            this.medicationOrders[this.currentEditIndex] = order;
        } else {
            this.medicationOrders.push(order);
        }
        
        this.saveData();
        this.closeAllForms();
        this.renderMedicationOrders();
    }
    
    editAppointment(index) {
        this.openAppointmentForm(this.appointments[index], index);
    }
    
    editScheduledAppointment(index) {
        this.openScheduledAppointmentForm(this.appointments[index], index);
    }
    
    editMedicationOrder(index) {
        this.openMedicationOrderForm(this.medicationOrders[index], index);
    }
    
    deleteAppointment(index) {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce rendez-vous à planifier ?')) {
            this.appointments.splice(index, 1);
            this.saveData();
            this.renderUpcomingAppointments();
        }
    }
    
    deleteScheduledAppointment(index) {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce rendez-vous ?')) {
            this.appointments.splice(index, 1);
            this.saveData();
            this.renderScheduledAppointments();
        }
    }
    
    deleteMedicationOrder(index) {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette commande de médicament ?')) {
            this.medicationOrders.splice(index, 1);
            this.saveData();
            this.renderMedicationOrders();
        }
    }
    
    renderUpcomingAppointments() {
        const container = document.getElementById('upcomingAppointmentsList');
        
        if (this.appointments.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar-plus"></i>
                    <p>Aucun rendez-vous à planifier pour l'instant</p>
                </div>
            `;
            return;
        }
        
        // Filter appointments that don't have a specific date (only target month)
        const upcomingAppointments = this.appointments.filter(appt => !appt.date);
        
        if (upcomingAppointments.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar-plus"></i>
                    <p>Aucun rendez-vous à planifier pour l'instant</p>
                </div>
            `;
            return;
        }
        
        // Sort by target month
        upcomingAppointments.sort((a, b) => a.targetMonth - b.targetMonth);
        
        container.innerHTML = upcomingAppointments.map((appt, index) => {
            const targetMonthName = this.months[appt.targetMonth] || 'Mois inconnu';
            const actualIndex = this.appointments.indexOf(appt);
            
            return `
            <div class="appointment-card upcoming">
                <div class="appointment-header">
                    <div>
                        <div class="appointment-title">${this.escapeHtml(appt.title)}</div>
                        ${appt.location ? `<div class="appointment-meta"><i class="fas fa-map-marker-alt"></i> ${this.escapeHtml(appt.location)}</div>` : ''}
                    </div>
                    <div class="card-actions">
                        <button class="btn-edit" onclick="app.editAppointment(${actualIndex})">
                            <i class="fas fa-edit"></i> Modifier
                        </button>
                        <button class="btn-delete" onclick="app.deleteAppointment(${actualIndex})">
                            <i class="fas fa-trash"></i> Supprimer
                        </button>
                    </div>
                </div>
                <div class="appointment-meta">
                    <span><i class="fas fa-calendar"></i> <strong>Mois cible:</strong> ${targetMonthName}</span>
                    <span><i class="fas fa-bell"></i> <strong>Rappel:</strong> ${appt.reminderMonths} mois avant</span>
                </div>
                ${appt.checklist && appt.checklist.length > 0 ? `
                <div class="appointment-checklist">
                    <h4>Checklist pour le rendez-vous</h4>
                    <ul class="checklist-items">
                        ${appt.checklist.map(item => `
                            <li>
                                <input type="checkbox" id="check-${actualIndex}-${appt.checklist.indexOf(item)}">
                                <label for="check-${actualIndex}-${appt.checklist.indexOf(item)}">${this.escapeHtml(item)}</label>
                            </li>
                        `).join('')}
                    </ul>
                </div>
                ` : ''}
                <button class="btn-primary" onclick="app.convertToScheduled(${actualIndex})" style="margin-top: 15px; width: 100%;">
                    <i class="fas fa-calendar-check"></i> Convertir en rendez-vous pris
                </button>
            </div>
        `}).join('');
    }
    
    renderScheduledAppointments() {
        const container = document.getElementById('scheduledAppointmentsList');
        
        if (this.appointments.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar-check"></i>
                    <p>Aucun rendez-vous pris pour l'instant</p>
                </div>
            `;
            return;
        }
        
        // Filter appointments that have a specific date
        const scheduledAppointments = this.appointments.filter(appt => appt.date);
        
        if (scheduledAppointments.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar-check"></i>
                    <p>Aucun rendez-vous pris pour l'instant</p>
                </div>
            `;
            return;
        }
        
        // Sort by date
        scheduledAppointments.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        container.innerHTML = scheduledAppointments.map((appt, index) => {
            const actualIndex = this.appointments.indexOf(appt);
            const dateObj = new Date(appt.date);
            const formattedDate = dateObj.toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            return `
            <div class="appointment-card scheduled">
                <div class="appointment-header">
                    <div>
                        <div class="appointment-title">${this.escapeHtml(appt.title)}</div>
                        ${appt.location ? `<div class="appointment-meta"><i class="fas fa-map-marker-alt"></i> ${this.escapeHtml(appt.location)}</div>` : ''}
                    </div>
                    <div class="card-actions">
                        <button class="btn-edit" onclick="app.editScheduledAppointment(${actualIndex})">
                            <i class="fas fa-edit"></i> Modifier
                        </button>
                        <button class="btn-delete" onclick="app.deleteScheduledAppointment(${actualIndex})">
                            <i class="fas fa-trash"></i> Supprimer
                        </button>
                    </div>
                </div>
                <div class="appointment-meta">
                    <span class="appointment-date"><i class="fas fa-calendar-alt"></i> ${formattedDate}</span>
                    ${appt.time ? `<span><i class="fas fa-clock"></i> ${appt.time}</span>` : ''}
                </div>
                ${appt.checklist && appt.checklist.length > 0 ? `
                <div class="appointment-checklist">
                    <h4>Checklist pour le rendez-vous</h4>
                    <ul class="checklist-items">
                        ${appt.checklist.map(item => `
                            <li>
                                <input type="checkbox" id="check-scheduled-${actualIndex}-${appt.checklist.indexOf(item)}">
                                <label for="check-scheduled-${actualIndex}-${appt.checklist.indexOf(item)}">${this.escapeHtml(item)}</label>
                            </li>
                        `).join('')}
                    </ul>
                </div>
                ` : ''}
            </div>
        `}).join('');
    }
    
    renderMedicationOrders() {
        const container = document.getElementById('medicationOrdersList');
        
        if (this.medicationOrders.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-pills"></i>
                    <p>Aucune commande de médicament pour l'instant</p>
                </div>
            `;
            return;
        }
        
        // Sort by next order date
        const now = new Date();
        this.medicationOrders.forEach(order => {
            if (order.startDate) {
                const startDate = new Date(order.startDate);
                const monthsPassed = (now.getFullYear() - startDate.getFullYear()) * 12 +
                                    (now.getMonth() - startDate.getMonth());
                const nextOrderIn = order.frequency - (monthsPassed % order.frequency);
                order.nextOrderDate = new Date(startDate);
                order.nextOrderDate.setMonth(startDate.getMonth() + Math.ceil(monthsPassed / order.frequency) * order.frequency);
            } else {
                order.nextOrderDate = now;
            }
        });
        
        this.medicationOrders.sort((a, b) => a.nextOrderDate - b.nextOrderDate);
        
        container.innerHTML = this.medicationOrders.map((order, index) => {
            const person = this.members[order.personIndex] || { name: 'Inconnu' };
            const formattedNextDate = order.nextOrderDate ? order.nextOrderDate.toLocaleDateString('fr-FR') : 'À déterminer';
            
            let frequencyText = '';
            switch(order.frequency) {
                case 1: frequencyText = 'Tous les mois'; break;
                case 2: frequencyText = 'Tous les 2 mois'; break;
                case 3: frequencyText = 'Tous les 3 mois'; break;
                case 6: frequencyText = 'Tous les 6 mois'; break;
                case 12: frequencyText = 'Tous les ans'; break;
                default: frequencyText = `Tous les ${order.frequency} mois`;
            }
            
            return `
            <div class="medication-card">
                <div class="appointment-header">
                    <div>
                        <div class="medication-name">${this.escapeHtml(order.medicationName)}</div>
                        <div class="medication-info">
                            <div class="medication-info-item">
                                <i class="fas fa-user"></i>
                                <span><strong>Personne:</strong> ${this.escapeHtml(person.name)}</span>
                            </div>
                            <div class="medication-info-item">
                                <i class="fas fa-sync-alt"></i>
                                <span class="medication-frequency">${frequencyText}</span>
                            </div>
                            ${order.startDate ? `
                            <div class="medication-info-item">
                                <i class="fas fa-calendar"></i>
                                <span><strong>Prochaine commande:</strong> ${formattedNextDate}</span>
                            </div>
                            ` : ''}
                            ${order.notes ? `
                            <div class="medication-info-item">
                                <i class="fas fa-sticky-note"></i>
                                <span><strong>Notes:</strong> ${this.escapeHtml(order.notes)}</span>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                    <div class="card-actions">
                        <button class="btn-edit" onclick="app.editMedicationOrder(${index})">
                            <i class="fas fa-edit"></i> Modifier
                        </button>
                        <button class="btn-delete" onclick="app.deleteMedicationOrder(${index})">
                            <i class="fas fa-trash"></i> Supprimer
                        </button>
                    </div>
                </div>
            </div>
        `}).join('');
    }
    
    convertToScheduled(index) {
        const appt = this.appointments[index];
        if (!appt) return;
        
        // Remove from appointments (will be re-added with date)
        this.appointments.splice(index, 1);
        
        // Open the scheduled form with pre-filled data
        this.currentEditIndex = null;
        this.currentEditType = null;
        
        document.getElementById('scheduledTitle').value = appt.title || '';
        document.getElementById('scheduledLocation').value = appt.location || '';
        document.getElementById('scheduledDate').value = '';
        document.getElementById('scheduledTime').value = '';
        this.renderChecklistInputs('scheduledChecklist', appt.checklist || []);
        
        document.getElementById('scheduledAppointmentFormOverlay').classList.add('active');
        
        // Store the original appointment data temporarily
        this.tempAppointmentData = appt;
    }
    
    // ===== Calendar Management =====
    currentCalendarDate = new Date();
    
    renderCalendar() {
        const container = document.getElementById('calendarDays');
        const title = document.getElementById('calendarTitle');
        
        const year = this.currentCalendarDate.getFullYear();
        const month = this.currentCalendarDate.getMonth();
        
        // Update title
        const monthName = this.months[month];
        title.textContent = `${monthName} ${year}`;
        
        // Get first day of month and total days
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startingDay = firstDay.getDay();
        const totalDays = lastDay.getDate();
        
        // Get appointments and medication orders for this month
        const monthAppointments = this.appointments.filter(appt => {
            if (appt.date) {
                const apptDate = new Date(appt.date);
                return apptDate.getFullYear() === year && apptDate.getMonth() === month;
            }
            return false;
        });
        
        const monthMedications = this.medicationOrders.filter(order => {
            if (order.startDate && order.nextOrderDate) {
                const nextDate = new Date(order.nextOrderDate);
                return nextDate.getFullYear() === year && nextDate.getMonth() === month;
            }
            return false;
        });
        
        // Create calendar days
        let html = '';
        
        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startingDay; i++) {
            html += '<div class="calendar-day empty"></div>';
        }
        
        // Add days of the month
        const today = new Date();
        for (let day = 1; day <= totalDays; day++) {
            const date = new Date(year, month, day);
            const isToday = date.toDateString() === today.toDateString();
            
            // Check for appointments
            const dayAppointments = monthAppointments.filter(appt => {
                const apptDate = new Date(appt.date);
                return apptDate.getDate() === day;
            });
            
            // Check for medication orders
            const dayMedications = monthMedications.filter(order => {
                if (order.nextOrderDate) {
                    const orderDate = new Date(order.nextOrderDate);
                    return orderDate.getDate() === day;
                }
                return false;
            });
            
            const hasAppointment = dayAppointments.length > 0;
            const hasMedication = dayMedications.length > 0;
            const dayClass = isToday ? 'today' : (hasAppointment || hasMedication ? 'has-appointment' : '');
            
            html += `
                <div class="calendar-day ${dayClass}">
                    <span>${day}</span>
                    ${hasAppointment || hasMedication ? `
                        <div class="calendar-day-appointments">
                            ${dayAppointments.map(() => '<span></span>').join('')}
                            ${dayMedications.map(() => '<span class="medication"></span>').join('')}
                        </div>
                    ` : ''}
                </div>
            `;
        }
        
        container.innerHTML = html;
    }
    
    navigateCalendar(direction) {
        this.currentCalendarDate.setMonth(this.currentCalendarDate.getMonth() + direction);
        this.renderCalendar();
    }
    
    // ===== Tasks Management =====
    switchTaskFilter(filter) {
        this.currentTaskFilter = filter;
        
        // Update filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        
        this.renderTasks();
    }
    
    openTaskForm(task = null, index = null) {
        const overlay = document.getElementById('taskFormOverlay');
        
        // Initialize assigned to select
        this.initializeTaskAssignedSelect();
        
        if (task) {
            // Edit mode
            this.currentEditIndex = index;
            this.currentEditType = 'task';
            document.getElementById('taskFormTitle').textContent = 'Modifier la tâche';
            document.getElementById('taskTitle').value = task.title || '';
            document.getElementById('taskDescription').value = task.description || '';
            document.getElementById('taskDuration').value = task.duration || 30;
            document.getElementById('taskMinAge').value = task.minAge || 0;
            document.getElementById('taskPriority').value = task.priority || 3;
            document.getElementById('taskRecurrence').value = task.recurrence || 'once';
            document.getElementById('taskRecurrenceEnd').value = task.recurrenceEnd || '';
            document.getElementById('taskCategory').value = task.category || 'menage';
            document.getElementById('taskDueDate').value = task.dueDate || '';
            document.getElementById('taskAssignedTo').value = task.assignedTo || '';
        } else {
            // Add mode
            this.currentEditIndex = null;
            this.currentEditType = null;
            document.getElementById('taskFormTitle').textContent = 'Ajouter une tâche';
            document.getElementById('taskTitle').value = '';
            document.getElementById('taskDescription').value = '';
            document.getElementById('taskDuration').value = 30;
            document.getElementById('taskMinAge').value = 0;
            document.getElementById('taskPriority').value = 3;
            document.getElementById('taskRecurrence').value = 'once';
            document.getElementById('taskRecurrenceEnd').value = '';
            document.getElementById('taskCategory').value = 'menage';
            document.getElementById('taskDueDate').value = '';
            document.getElementById('taskAssignedTo').value = '';
        }
        
        overlay.classList.add('active');
    }
    
    initializeTaskAssignedSelect() {
        const select = document.getElementById('taskAssignedTo');
        if (select) {
            select.innerHTML = '<option value="">Non affectée (répartition automatique)</option>' +
                this.members.map((member, index) => `
                    <option value="${index}">${member.name}</option>
                `).join('');
        }
    }
    
    saveTask() {
        const title = document.getElementById('taskTitle').value.trim();
        const description = document.getElementById('taskDescription').value.trim();
        const duration = parseInt(document.getElementById('taskDuration').value) || 30;
        const minAge = parseInt(document.getElementById('taskMinAge').value) || 0;
        const priority = parseInt(document.getElementById('taskPriority').value) || 3;
        const recurrence = document.getElementById('taskRecurrence').value || 'once';
        const recurrenceEnd = document.getElementById('taskRecurrenceEnd').value || '';
        const category = document.getElementById('taskCategory').value || 'menage';
        const dueDate = document.getElementById('taskDueDate').value || '';
        const assignedTo = document.getElementById('taskAssignedTo').value || '';
        
        if (!title) {
            alert('Veuillez entrer un titre pour la tâche');
            return;
        }
        
        const task = {
            title,
            description,
            duration,
            minAge,
            priority,
            recurrence,
            recurrenceEnd,
            category,
            dueDate,
            assignedTo: assignedTo === '' ? null : parseInt(assignedTo),
            createdAt: new Date().toISOString(),
            completed: false
        };
        
        if (this.currentEditIndex !== null) {
            // Update existing
            this.tasks[this.currentEditIndex] = task;
        } else {
            // Add new
            this.tasks.push(task);
        }
        
        this.saveData();
        this.closeAllForms();
        this.renderTasks();
    }
    
    editTask(index) {
        this.openTaskForm(this.tasks[index], index);
    }
    
    deleteTask(index) {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
            this.tasks.splice(index, 1);
            this.saveData();
            this.renderTasks();
        }
    }
    
    toggleTaskComplete(index) {
        this.tasks[index].completed = !this.tasks[index].completed;
        this.saveData();
        this.renderTasks();
    }
    
    reassignTask(index) {
        const task = this.tasks[index];
        if (task) {
            task.assignedTo = null;
            this.saveData();
            this.renderTasks();
        }
    }
    
    getPriorityLabel(priority) {
        const labels = { 1: 'Très basse', 2: 'Basse', 3: 'Normale', 4: 'Haute', 5: 'Urgente' };
        return labels[priority] || 'Normale';
    }
    
    getPriorityColor(priority) {
        const colors = { 1: 'priority-1', 2: 'priority-2', 3: 'priority-3', 4: 'priority-4', 5: 'priority-5' };
        return colors[priority] || 'priority-3';
    }
    
    getCategoryClass(category) {
        return `category-${category}`;
    }
    
    getCategoryLabel(category) {
        const labels = {
            menage: 'Ménage',
            courses: 'Courses',
            jardinage: 'Jardinage',
            reparation: 'Réparation',
            organisation: 'Organisation',
            autre: 'Autre'
        };
        return labels[category] || 'Autre';
    }
    
    getRecurrenceLabel(recurrence) {
        const labels = {
            once: 'Une fois',
            daily: 'Quotidienne',
            weekly: 'Hebdomadaire',
            biweekly: 'Tous les 15 jours',
            monthly: 'Mensuelle',
            yearly: 'Annuelle'
        };
        return labels[recurrence] || 'Une fois';
    }
    
    getAssignedMemberName(assignedTo) {
        if (assignedTo === null || assignedTo === undefined || assignedTo === '') {
            return 'Non affectée';
        }
        const member = this.members[assignedTo];
        return member ? member.name : 'Membre inconnu';
    }
    
    isTaskDueSoon(task) {
        if (!task.dueDate) return false;
        
        const dueDate = new Date(task.dueDate);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        return dueDate <= tomorrow && !task.completed;
    }
    
    isTaskOverdue(task) {
        if (!task.dueDate) return false;
        
        const dueDate = new Date(task.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        return dueDate < today && !task.completed;
    }
    
    filterTasks() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const weekFromNow = new Date(today);
        weekFromNow.setDate(weekFromNow.getDate() + 7);
        
        return this.tasks.filter(task => {
            switch (this.currentTaskFilter) {
                case 'today':
                    if (!task.dueDate) return false;
                    const taskDate = new Date(task.dueDate);
                    return taskDate <= tomorrow && taskDate >= today;
                case 'week':
                    if (!task.dueDate) return false;
                    const taskDate = new Date(task.dueDate);
                    return taskDate <= weekFromNow && taskDate >= today;
                case 'assigned':
                    return task.assignedTo !== null && task.assignedTo !== undefined && task.assignedTo !== '';
                case 'unassigned':
                    return task.assignedTo === null || task.assignedTo === undefined || task.assignedTo === '';
                default:
                    return true;
            }
        });
    }
    
    renderTasks() {
        const container = document.getElementById('tasksList');
        const filteredTasks = this.filterTasks();
        
        if (filteredTasks.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-tasks"></i>
                    <p>Aucune tâche ${this.currentTaskFilter === 'all' ? '' : 'correspondant au filtre'} pour l'instant</p>
                </div>
            `;
            return;
        }
        
        // Render distribution summary
        const distribution = this.getTaskDistribution();
        const distributionHtml = `
            <div class="distribution-summary">
                <h3><i class="fas fa-chart-pie"></i> Répartition des tâches</h3>
                <div class="distribution-grid">
                    ${Object.entries(distribution).map(([memberIndex, count]) => {
                        const member = this.members[parseInt(memberIndex)];
                        const memberName = member ? member.name : 'Non affectées';
                        return `
                            <div class="distribution-item">
                                <span class="member-name">${this.escapeHtml(memberName)}</span>
                                <span class="task-count">${count}</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
        
        // Sort tasks by priority (descending), then by due date
        filteredTasks.sort((a, b) => {
            if (b.priority !== a.priority) return b.priority - a.priority;
            if (a.dueDate && b.dueDate) return new Date(a.dueDate) - new Date(b.dueDate);
            return 0;
        });
        
        container.innerHTML = distributionHtml + filteredTasks.map((task, index) => {
            const actualIndex = this.tasks.indexOf(task);
            const dueSoon = this.isTaskDueSoon(task);
            const overdue = this.isTaskOverdue(task);
            const cardClass = task.completed ? 'task-card completed' : (overdue ? 'task-card overdue' : (dueSoon ? 'task-card due-soon' : 'task-card'));
            
            return `
            <div class="${cardClass}">
                <div class="task-header">
                    <div>
                        <div class="task-title">${this.escapeHtml(task.title)}</div>
                        ${task.completed ? '<span class="status-badge" style="background-color: var(--success-color); color: white;">Terminée</span>' : ''}
                    </div>
                    <div class="card-actions">
                        <button class="btn-edit" onclick="app.editTask(${actualIndex})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-delete" onclick="app.deleteTask(${actualIndex})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                
                ${task.description ? `<div class="task-description">${this.escapeHtml(task.description)}</div>` : ''}
                
                <div class="task-meta">
                    <span><i class="fas fa-clock"></i> ${task.duration} min</span>
                    <span><i class="fas fa-child"></i> ${task.minAge}+ ans</span>
                    <span><i class="fas fa-exclamation-circle"></i> <span class="priority-badge ${this.getPriorityColor(task.priority)}">${this.getPriorityLabel(task.priority)}</span></span>
                    <span><i class="fas fa-repeat"></i> ${this.getRecurrenceLabel(task.recurrence)}</span>
                </div>
                
                <div class="task-meta" style="margin-top: 8px;">
                    <span><i class="fas fa-tag"></i> <span class="category-badge ${this.getCategoryClass(task.category)}">${this.getCategoryLabel(task.category)}</span></span>
                    ${task.dueDate ? `<span><i class="fas fa-calendar"></i> ${new Date(task.dueDate).toLocaleDateString('fr-FR')}</span>` : ''}
                </div>
                
                <div class="assigned-to">
                    <i class="fas fa-user"></i>
                    <span>${this.getAssignedMemberName(task.assignedTo)}</span>
                </div>
                
                <div class="task-card-actions">
                    ${!task.completed ? `
                        <button class="btn-primary btn-complete" onclick="app.toggleTaskComplete(${actualIndex})">
                            <i class="fas fa-check"></i> Marquer comme terminée
                        </button>
                    ` : `
                        <button class="btn-secondary" onclick="app.toggleTaskComplete(${actualIndex})">
                            <i class="fas fa-undo"></i> Réactiver
                        </button>
                    `}
                    ${task.assignedTo !== null && task.assignedTo !== undefined && task.assignedTo !== '' ? `
                        <button class="btn-secondary btn-reassign" onclick="app.reassignTask(${actualIndex})">
                            <i class="fas fa-random"></i> Réaffecter
                        </button>
                    ` : ''}
                </div>
            </div>
        `}).join('');
    }
    
    getTaskDistribution() {
        const distribution = {};
        
        // Count unassigned tasks
        const unassignedCount = this.tasks.filter(t => t.assignedTo === null || t.assignedTo === undefined || t.assignedTo === '').length;
        if (unassignedCount > 0) {
            distribution['unassigned'] = unassignedCount;
        }
        
        // Count tasks per member
        this.members.forEach((member, index) => {
            const count = this.tasks.filter(t => t.assignedTo === index).length;
            if (count > 0) {
                distribution[index] = count;
            }
        });
        
        return distribution;
    }
    
    distributeTasks() {
        if (this.members.length === 0) {
            alert('Veuillez ajouter des membres avant de répartir les tâches');
            return;
        }
        
        const unassignedTasks = this.tasks.filter(t => t.assignedTo === null || t.assignedTo === undefined || t.assignedTo === '');
        
        if (unassignedTasks.length === 0) {
            alert('Toutes les tâches sont déjà affectées');
            return;
        }
        
        // Sort tasks by priority (descending) and duration (descending)
        unassignedTasks.sort((a, b) => {
            if (b.priority !== a.priority) return b.priority - a.priority;
            return b.duration - a.duration;
        });
        
        // Get available members for each task
        unassignedTasks.forEach(task => {
            const availableMembers = this.getAvailableMembersForTask(task);
            
            if (availableMembers.length > 0) {
                // Find the member with the least tasks and lowest stress
                let bestMember = null;
                let bestScore = Infinity;
                
                availableMembers.forEach(memberIndex => {
                    const member = this.members[memberIndex];
                    const currentTaskCount = this.tasks.filter(t => t.assignedTo === memberIndex).length;
                    
                    // Score: lower is better
                    // Consider: number of tasks, stress level, fatigue level
                    const score = currentTaskCount * 100 + member.stress * 20 + member.fatigue * 10;
                    
                    if (score < bestScore) {
                        bestScore = score;
                        bestMember = memberIndex;
                    }
                });
                
                if (bestMember !== null) {
                    const taskIndex = this.tasks.indexOf(task);
                    this.tasks[taskIndex].assignedTo = bestMember;
                }
            }
        });
        
        this.saveData();
        this.renderTasks();
        alert(`Répartition terminée ! ${unassignedTasks.length} tâches ont été affectées.`);
    }
    
    getAvailableMembersForTask(task) {
        return this.members
            .map((member, index) => ({ member, index }))
            .filter(({ member }) => {
                // Check if member is old enough
                if (member.age < task.minAge) return false;
                
                // Check if member is available (not on vacation)
                const today = new Date();
                const dayOfWeek = today.getDay();
                const memberStatus = member.schedule ? member.schedule[dayOfWeek] : 'Sur site';
                
                // Members on vacation or at school might not be available for certain tasks
                if (memberStatus === 'En congés') return false;
                if (memberStatus === "À l'école" && task.category === 'jardinage') return false;
                
                return true;
            })
            .map(({ index }) => index);
    }
    
    // ===== Data Management =====
    saveData() {
        localStorage.setItem('members', JSON.stringify(this.members));
        localStorage.setItem('stores', JSON.stringify(this.stores));
        localStorage.setItem('meals', JSON.stringify(this.meals));
        localStorage.setItem('appointments', JSON.stringify(this.appointments));
        localStorage.setItem('medicationOrders', JSON.stringify(this.medicationOrders));
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }
    
    renderAllAdminData() {
        this.renderMembers();
        this.renderStores();
        this.renderMeals();
    }
    
    initializeAppointmentForms() {
        // Initialize month options for appointment form
        const monthSelect = document.getElementById('appointmentTargetMonth');
        if (monthSelect) {
            monthSelect.innerHTML = '<option value="">Sélectionnez un mois</option>' +
                this.months.map((month, index) => `
                    <option value="${index}">${month}</option>
                `).join('');
        }
        
        // Initialize reminder options
        const reminderSelect = document.getElementById('appointmentReminder');
        if (reminderSelect) {
            reminderSelect.innerHTML = '<option value="">Sélectionnez une période de rappel</option>' +
                this.reminderOptions.map(months => `
                    <option value="${months}">${months} mois avant</option>
                `).join('');
        }
        
        // Initialize person options for medication form
        const personSelect = document.getElementById('medicationPerson');
        if (personSelect) {
            personSelect.innerHTML = '<option value="">Sélectionnez une personne</option>' +
                this.members.map((member, index) => `
                    <option value="${index}">${member.name}</option>
                `).join('');
        }
        
        // Initialize task assigned to select
        this.initializeTaskAssignedSelect();
    }
    
    closeAllForms() {
        document.querySelectorAll('.form-overlay').forEach(overlay => {
            overlay.classList.remove('active');
        });
        this.currentEditIndex = null;
        this.currentEditType = null;
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.app = new PlannificateurMaison();
});
