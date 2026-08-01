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
    
    // ===== Members Management =====
    openMemberForm(member = null, index = null) {
        const form = document.getElementById('memberForm');
        const overlay = document.getElementById('memberFormOverlay');
        
        if (member) {
            // Edit mode
            this.currentEditIndex = index;
            this.currentEditType = 'member';
            document.getElementById('memberFormTitle').textContent = 'Modifier le membre';
            document.getElementById('memberName').value = member.name || '';
            document.getElementById('memberAge').value = member.age || '';
            document.getElementById('memberFatigue').value = member.fatigue || 1;
            document.getElementById('memberStress').value = member.stress || 1;
        } else {
            // Add mode
            this.currentEditIndex = null;
            this.currentEditType = null;
            document.getElementById('memberFormTitle').textContent = 'Ajouter un membre';
            document.getElementById('memberName').value = '';
            document.getElementById('memberAge').value = '';
            document.getElementById('memberFatigue').value = 1;
            document.getElementById('memberStress').value = 1;
        }
        
        overlay.classList.add('active');
    }
    
    saveMember() {
        const name = document.getElementById('memberName').value.trim();
        const age = parseInt(document.getElementById('memberAge').value) || 0;
        const fatigue = parseInt(document.getElementById('memberFatigue').value) || 1;
        const stress = parseInt(document.getElementById('memberStress').value) || 1;
        
        if (!name) {
            alert('Veuillez entrer un prénom pour le membre');
            return;
        }
        
        const member = { name, age, fatigue, stress };
        
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
        
        container.innerHTML = this.members.map((member, index) => `
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
                        <span><strong>Âge:</strong> ${member.age} ans</span>
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
            </div>
        `).join('');
    }
    
    editMember(index) {
        this.openMemberForm(this.members[index], index);
    }
    
    // ===== Stores Management =====
    openStoreForm(store = null, index = null) {
        const form = document.getElementById('storeForm');
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
        const form = document.getElementById('mealForm');
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
            const monthsContainer = document.getElementById('mealMonths');
            monthsContainer.innerHTML = '';
            const allMonths = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
            allMonths.forEach(month => {
                const checkbox = document.createElement('label');
                checkbox.style.display = 'inline-block';
                checkbox.style.marginRight = '10px';
                checkbox.innerHTML = `
                    <input type="checkbox" value="${month}" ${meal.months?.includes(month) ? 'checked' : ''}> ${month}
                `;
                monthsContainer.appendChild(checkbox);
            });
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
            const monthsContainer = document.getElementById('mealMonths');
            monthsContainer.innerHTML = '';
            const allMonths = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
            allMonths.forEach(month => {
                const checkbox = document.createElement('label');
                checkbox.style.display = 'inline-block';
                checkbox.style.marginRight = '10px';
                checkbox.innerHTML = `
                    <input type="checkbox" value="${month}"> ${month}
                `;
                monthsContainer.appendChild(checkbox);
            });
        }
        
        overlay.classList.add('active');
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
