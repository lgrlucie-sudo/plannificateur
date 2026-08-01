// ===== Plannificateur Maison - Full Application =====

class PlannificateurMaison {
    constructor() {
        this.currentSection = 'home';
        this.currentAdminTab = 'members';
        
        // Data storage
        this.members = JSON.parse(localStorage.getItem('members')) || [];
        this.stores = JSON.parse(localStorage.getItem('stores')) || [];
        this.meals = JSON.parse(localStorage.getItem('meals')) || [];
        
        // Current editing item
        this.currentEditIndex = null;
        this.currentEditType = null;
        
        // Days of week
        this.daysOfWeek = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
        this.statusOptions = ['Sur site', 'Télétravail', "À l'école", 'En congés'];
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.showSection(this.currentSection);
        this.renderAllAdminData();
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
    
    // ===== Data Management =====
    saveData() {
        localStorage.setItem('members', JSON.stringify(this.members));
        localStorage.setItem('stores', JSON.stringify(this.stores));
        localStorage.setItem('meals', JSON.stringify(this.meals));
    }
    
    renderAllAdminData() {
        this.renderMembers();
        this.renderStores();
        this.renderMeals();
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
