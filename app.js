// ===== Simple Home Page Application =====
class PlannificateurMaison {
    constructor() {
        this.currentSection = 'home';
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.showSection(this.currentSection);
    }
    
    setupEventListeners() {
        // Navigation buttons - only home is functional
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Only home button is functional for now
                if (btn.dataset.section === 'home') {
                    this.showSection('home');
                } else {
                    // Show coming soon message for other sections
                    alert('Fonctionnalité à venir ! Cette section sera implémentée prochainement.');
                }
            });
        });
        
        // Feature cards on home page
        document.querySelectorAll('.feature-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('button')) {
                    alert('Fonctionnalité à venir ! Cette section sera implémentée prochainement.');
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
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.app = new PlannificateurMaison();
});
