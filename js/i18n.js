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
     * Check if page is in a subfolder (pages_specs)
     */
    isInSubfolder() {
        const path = window.location.pathname;
        return path.includes('/pages_specs/');
    },

    /**
     * Get base path for assets
     */
    getBasePath() {
        return this.isInSubfolder() ? '../' : '';
    },

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
            const basePath = this.getBasePath();
            const response = await fetch(`${basePath}lang/${lang}.json`);
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
        const elements = document.querySelectorAll('[data-i18n]');
        let translatedCount = 0;
        
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (!key) return;
            
            const translation = this.t(key);
            
            // Only update if translation is different from key (meaning it was found)
            if (translation !== key) {
                // Check if we should use innerHTML or textContent
                if (element.hasAttribute('data-i18n-html')) {
                    element.innerHTML = translation;
                } else {
                    element.textContent = translation;
                }
                translatedCount++;
            } else {
                console.warn(`Translation not found for key: ${key}`);
            }
        });
        
        if (translatedCount > 0) {
            console.log(`Translated ${translatedCount} elements`);
        }

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

        // Translate select options
        document.querySelectorAll('option[data-i18n]').forEach(option => {
            const key = option.getAttribute('data-i18n');
            const translation = this.t(key);
            if (translation !== key) {
                option.textContent = translation;
            }
        });

        // Translate optgroup labels
        document.querySelectorAll('optgroup[data-i18n]').forEach(optgroup => {
            const key = optgroup.getAttribute('data-i18n');
            const translation = this.t(key);
            if (translation !== key) {
                optgroup.label = translation;
            }
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
document.addEventListener('DOMContentLoaded', async () => {
    await I18n.init();
    // Trigger event when translations are ready
    window.dispatchEvent(new CustomEvent('translationsReady'));
});
