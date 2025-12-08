/**
 * AgileVizion - Internationalization (i18n) Module
 * Handles language detection, switching, and content translation
 */

const I18n = {
    currentLang: 'en',
    translations: {},
    defaultLang: 'en',
    supportedLangs: ['en', 'fr'],

    /**
     * Initialize the i18n module
     */
    async init() {
        this.currentLang = this.detectLanguage();
        await this.loadTranslations(this.currentLang);
        this.translatePage();
        this.updateHtmlLang();
    },

    /**
     * Detect language from URL parameter, localStorage, or browser
     */
    detectLanguage() {
        // 1. Check URL parameter (?lang=fr)
        const urlParams = new URLSearchParams(window.location.search);
        const urlLang = urlParams.get('lang');
        if (urlLang && this.supportedLangs.includes(urlLang)) {
            localStorage.setItem('agilevizion_lang', urlLang);
            return urlLang;
        }

        // 2. Check localStorage
        const storedLang = localStorage.getItem('agilevizion_lang');
        if (storedLang && this.supportedLangs.includes(storedLang)) {
            return storedLang;
        }

        // 3. Check browser language
        const browserLang = navigator.language.split('-')[0];
        if (this.supportedLangs.includes(browserLang)) {
            return browserLang;
        }

        return this.defaultLang;
    },

    /**
     * Load translations from JSON file
     */
    async loadTranslations(lang) {
        try {
            const response = await fetch(`lang/${lang}.json`);
            if (!response.ok) throw new Error(`Failed to load ${lang}.json`);
            this.translations = await response.json();
        } catch (error) {
            console.error('Error loading translations:', error);
            // Fallback to default language if not already trying it
            if (lang !== this.defaultLang) {
                await this.loadTranslations(this.defaultLang);
            }
        }
    },

    /**
     * Get a translation by key (supports nested keys like "grc.hero_h1")
     */
    t(key) {
        const keys = key.split('.');
        let value = this.translations;
        
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                console.warn(`Translation missing for key: ${key}`);
                return key;
            }
        }

        // Handle dynamic replacements like {year}
        if (typeof value === 'string') {
            value = value.replace('{year}', new Date().getFullYear());
        }

        return value;
    },

    /**
     * Translate all elements with data-i18n attribute
     */
    translatePage() {
        // Translate elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.t(key);
            
            // Check if we should use innerHTML or textContent
            if (element.hasAttribute('data-i18n-html')) {
                element.innerHTML = translation;
            } else {
                element.textContent = translation;
            }
        });

        // Translate placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            element.placeholder = this.t(key);
        });

        // Translate titles
        document.querySelectorAll('[data-i18n-title]').forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            element.title = this.t(key);
        });

        // Update page title if specified
        const pageTitleKey = document.body.getAttribute('data-page-title');
        if (pageTitleKey) {
            document.title = this.t(pageTitleKey);
        }
    },

    /**
     * Update HTML lang attribute
     */
    updateHtmlLang() {
        document.documentElement.lang = this.currentLang;
    },

    /**
     * Switch to a different language
     */
    async switchLanguage(lang) {
        if (!this.supportedLangs.includes(lang)) {
            console.error(`Language ${lang} not supported`);
            return;
        }

        localStorage.setItem('agilevizion_lang', lang);
        this.currentLang = lang;
        await this.loadTranslations(lang);
        this.translatePage();
        this.updateHtmlLang();

        // Update URL without reloading
        const url = new URL(window.location);
        url.searchParams.set('lang', lang);
        window.history.replaceState({}, '', url);

        // Trigger custom event for components that need to update
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
    },

    /**
     * Get current language
     */
    getLang() {
        return this.currentLang;
    },

    /**
     * Check if current language is RTL (for future support)
     */
    isRTL() {
        const rtlLangs = ['ar', 'he', 'fa'];
        return rtlLangs.includes(this.currentLang);
    }
};

// Export for use in other modules
window.I18n = I18n;

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    I18n.init();
});
