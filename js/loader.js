/**
 * AgileVizion - Component Loader
 * Loads header.html and footer.html into pages
 * Works with i18n.js for translations
 */

const Loader = {
    /**
     * Detect if current page is in a subfolder (pages_specs)
     */
    isInSubfolder() {
        const path = window.location.pathname;
        return path.includes('/pages_specs/');
    },

    /**
     * Get base path for assets (../ if in subfolder, empty if at root)
     */
    getBasePath() {
        return this.isInSubfolder() ? '../' : '';
    },

    /**
     * Load an HTML file and inject it into a placeholder
     */
    async loadComponent(url, placeholderId) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Failed to load ${url}`);
            let html = await response.text();
            
            // Adjust paths if in subfolder
            if (this.isInSubfolder()) {
                // Fix href paths for links
                html = html.replace(/href="index\.html/g, 'href="../index.html');
                html = html.replace(/href="pages_specs\//g, 'href="');
            }
            
            const placeholder = document.getElementById(placeholderId);
            if (placeholder) {
                placeholder.innerHTML = html;
            }
            return true;
        } catch (error) {
            console.error(`Error loading component: ${error.message}`);
            return false;
        }
    },

    /**
     * Detect current page from URL
     */
    detectCurrentPage() {
        const path = window.location.pathname;
        const filename = path.split('/').pop() || 'index.html';
        
        if (filename.includes('index') || filename === '') return 'grc';
        if (filename.includes('service-management')) return 'itsm';
        if (filename.includes('simulator')) return 'simulator';
        if (filename.includes('why-me')) return 'why';
        return 'grc';
    },

    /**
     * Mark active menu item based on current page
     */
    setActiveMenu() {
        const currentPage = this.detectCurrentPage();
        const menuLinks = document.querySelectorAll('.navbar-menu a[data-page]');
        
        menuLinks.forEach(link => {
            if (link.getAttribute('data-page') === currentPage) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    },

    /**
     * Update language switch buttons to show active language
     */
    updateLanguageSwitch() {
        const currentLang = window.I18n ? window.I18n.getLang() : 'en';
        const langLinks = document.querySelectorAll('.lang-switch a[data-lang]');
        
        langLinks.forEach(link => {
            if (link.getAttribute('data-lang') === currentLang) {
                link.classList.add('active-lang');
            } else {
                link.classList.remove('active-lang');
            }
        });
    },

    /**
     * Initialize: load components, set active states, translate
     */
    async init() {
        const basePath = this.getBasePath();
        
        // Load header (includes menu)
        await this.loadComponent(`${basePath}pages_gen/header.html`, 'header-placeholder');
        
        // Load footer
        await this.loadComponent(`${basePath}pages_gen/footer.html`, 'footer-placeholder');

        // Set active menu item
        this.setActiveMenu();

        // Update language switch
        this.updateLanguageSwitch();

        // Apply translations if i18n is loaded
        if (window.I18n && window.I18n.translations) {
            window.I18n.translatePage();
        }

        // Listen for language changes to update components
        window.addEventListener('languageChanged', () => {
            this.updateLanguageSwitch();
        });
    }
};

// Export for global access
window.Loader = Loader;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    // Wait for i18n to load first (if present)
    if (window.I18n) {
        // Small delay to let i18n initialize
        await new Promise(resolve => setTimeout(resolve, 50));
    }
    await Loader.init();
});
