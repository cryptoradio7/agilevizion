/**
 * AgileVizion - Components (Header & Footer)
 * Generates dynamic header and footer, integrated with i18n
 */

const Components = {
    CONFIG: {
        email: 'emmanuel.genesteix@agilevizion.com',
        phone: '+352.661.78.08.07',
        linkedin: 'https://www.linkedin.com/in/genesteix-emmanuel/',
        calendly: 'https://calendly.com/emmanuel-genesteix-agilevizion/diagnostic-agilevizion'
    },

    MENU_ITEMS: [
        { href: 'index.html', id: 'grc', i18n: 'nav.grc' },
        { href: 'pages/service-management.html', id: 'itsm', i18n: 'nav.itsm' },
        { href: 'pages/simulator.html', id: 'simulator', i18n: 'nav.simulator' },
        { href: 'pages/why-me.html', id: 'why', i18n: 'nav.why' }
    ],

    /**
     * Detect if we're in a subdirectory
     */
    isInSubfolder() {
        const path = window.location.pathname;
        return path.includes('/pages/');
    },

    /**
     * Get the base path prefix
     */
    getBasePath() {
        return this.isInSubfolder() ? '../' : '';
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
     * Generate the navigation header
     */
    generateHeader() {
        const currentPage = this.detectCurrentPage();
        const currentLang = window.I18n ? window.I18n.getLang() : 'en';
        const basePath = this.getBasePath();

        // Build menu items with correct paths
        let menuHtml = this.MENU_ITEMS.map(item => {
            const activeClass = item.id === currentPage ? ' class="active"' : '';
            const label = window.I18n ? window.I18n.t(item.i18n) : item.id;
            const href = basePath + item.href;
            return `<a href="${href}"${activeClass}>${label}</a>`;
        }).join('\n            ');

        // Language switch
        const frActiveClass = currentLang === 'fr' ? ' class="active-lang"' : '';
        const enActiveClass = currentLang === 'en' ? ' class="active-lang"' : '';

        return `
    <nav class="navbar">
        <a href="${basePath}index.html" class="navbar-brand" data-i18n-html="common.brand">Agile<span>Vizion</span></a>
        <div class="navbar-menu">
            ${menuHtml}
            <div class="lang-switch">
                <a href="javascript:void(0)" onclick="I18n.switchLanguage('fr')"${frActiveClass}>FR</a>
                <a href="javascript:void(0)" onclick="I18n.switchLanguage('en')"${enActiveClass}>EN</a>
            </div>
        </div>
    </nav>`;
    },

    /**
     * Generate the footer with contact info
     */
    generateFooter() {
        const contactTitle = window.I18n ? window.I18n.t('common.contact_title') : 'Contact me';
        const location = window.I18n ? window.I18n.t('common.location') : 'Luxembourg';
        const copyright = window.I18n ? window.I18n.t('common.copyright') : '© AgileVizion';

        return `
    <div class="contact-info">
        <div style="max-width: 1200px; margin: 0 auto;">
            <h2 style="margin-bottom: 20px;">${contactTitle}</h2>
            <p style="font-size: 1.2em; margin-bottom: 10px;">📱 ${this.CONFIG.phone} · ✉️ <a href="mailto:${this.CONFIG.email}" style="color: white;">${this.CONFIG.email}</a></p>
            <p style="font-size: 1.2em;">📍 ${location}</p>
            <div class="social-links">
                <a href="${this.CONFIG.linkedin}" target="_blank" title="LinkedIn"><i class="fa-brands fa-linkedin"></i></a>
            </div>
        </div>
    </div>
    <footer class="footer">
        <p>${copyright}</p>
    </footer>`;
    },

    /**
     * Inject header and footer into the page
     */
    inject() {
        const headerPlaceholder = document.getElementById('header-placeholder');
        if (headerPlaceholder) {
            headerPlaceholder.innerHTML = this.generateHeader();
        }

        const footerPlaceholder = document.getElementById('footer-placeholder');
        if (footerPlaceholder) {
            footerPlaceholder.innerHTML = this.generateFooter();
        }
    },

    /**
     * Update components when language changes
     */
    updateOnLanguageChange() {
        this.inject();
    },

    /**
     * Initialize components
     */
    init() {
        // Wait for i18n to be ready
        if (window.I18n && window.I18n.translations && Object.keys(window.I18n.translations).length > 0) {
            this.inject();
        } else {
            // If i18n not ready, inject basic version and update later
            this.inject();
        }

        // Listen for language changes
        window.addEventListener('languageChanged', () => {
            this.updateOnLanguageChange();
        });
    }
};

// Export for use in other modules
window.Components = Components;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure i18n is loaded first
    setTimeout(() => {
        Components.init();
    }, 100);
});
