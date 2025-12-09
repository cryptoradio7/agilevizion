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
        // Normalize path: remove trailing slash and check for pages_specs
        const normalizedPath = path.replace(/\/$/, '');
        return normalizedPath.includes('/pages_specs/') || normalizedPath.endsWith('/pages_specs');
    },

    /**
     * Get base path for assets (../ if in subfolder, empty if at root)
     * Uses absolute path from root to avoid issues on mobile
     */
    getBasePath() {
        if (this.isInSubfolder()) {
            return '../';
        }
        // For root pages, ensure we use relative paths that work on mobile
        const path = window.location.pathname;
        // If path ends with /, we're at root, use empty string
        // If path ends with index.html or is empty, we're at root
        if (path === '/' || path.endsWith('/') || path.endsWith('index.html') || path === '') {
            return '';
        }
        return '';
    },

    /**
     * Load an HTML file and inject it into a placeholder
     */
    async loadComponent(url, placeholderId) {
        try {
            const basePath = this.getBasePath();
            // Construct full URL - ensure it starts with / for absolute path from root
            let fullUrl = url.startsWith('/') ? url : basePath + url;
            // Normalize: remove any double slashes except after protocol
            fullUrl = fullUrl.replace(/([^:]\/)\/+/g, '$1');
            
            const response = await fetch(fullUrl);
            if (!response.ok) {
                // Try with absolute path from root as fallback (for mobile compatibility)
                const pathFromRoot = url.startsWith('/') ? url : '/' + url.replace(/^\.\.\//, '');
                const fallbackResponse = await fetch(pathFromRoot);
                if (!fallbackResponse.ok) {
                    throw new Error(`Failed to load ${url} (tried ${fullUrl} and ${pathFromRoot})`);
                }
                const html = await fallbackResponse.text();
                this._adjustPathsInHtml(html, placeholderId);
                return true;
            }
            
            let html = await response.text();
            this._adjustPathsInHtml(html, placeholderId);
            return true;
        } catch (error) {
            console.error(`Error loading component: ${error.message}`);
            return false;
        }
    },

    /**
     * Adjust paths in loaded HTML based on current page location
     */
    _adjustPathsInHtml(html, placeholderId) {
        // Adjust paths if in subfolder
        if (this.isInSubfolder()) {
            // Fix href paths for links
            html = html.replace(/href="index\.html/g, 'href="../index.html');
            html = html.replace(/href="pages_specs\//g, 'href="');
        } else {
            // When at root, use absolute paths from root for better mobile compatibility
            // This ensures links work whether URL is /, /index.html, or /index.html?lang=fr
            html = html.replace(/href="index\.html/g, 'href="/index.html"');
            // Ensure pages_specs links use absolute paths too
            html = html.replace(/href="pages_specs\//g, 'href="/pages_specs/');
        }
        this._injectHtml(html, placeholderId);
    },

    /**
     * Inject HTML into placeholder element
     */
    _injectHtml(html, placeholderId) {
        const placeholder = document.getElementById(placeholderId);
        if (placeholder) {
            placeholder.innerHTML = html;
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
