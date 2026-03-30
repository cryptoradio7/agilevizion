/**
 * AgileVizion 2 — Internationalization (i18n) Module
 * Migré de v1 — adapté v2 :
 *   - Suppression isInSubfolder() (plus de sous-dossiers)
 *   - Langue par défaut : FR
 */

var I18n = {
    currentLang: 'fr',
    translations: {},
    defaultLang: 'fr',
    supportedLangs: ['fr', 'en'],

    /**
     * Initialiser le module i18n
     */
    init: function () {
        var self = this;
        this.currentLang = this.detectLanguage();
        return this.loadTranslations(this.currentLang).then(function () {
            self.translatePage();
            self.updateHtmlLang();
        });
    },

    /**
     * Détecter la langue : URL → localStorage → navigateur → FR
     */
    detectLanguage: function () {
        var urlParams = new URLSearchParams(window.location.search);
        var urlLang = urlParams.get('lang');
        if (urlLang && this.supportedLangs.indexOf(urlLang) !== -1) {
            localStorage.setItem('agilevizion_lang', urlLang);
            return urlLang;
        }

        var storedLang = localStorage.getItem('agilevizion_lang');
        if (storedLang && this.supportedLangs.indexOf(storedLang) !== -1) {
            return storedLang;
        }

        var browserLang = (navigator.language || '').split('-')[0];
        if (this.supportedLangs.indexOf(browserLang) !== -1) {
            return browserLang;
        }

        return this.defaultLang;
    },

    /**
     * Charger le fichier JSON de traductions
     */
    loadTranslations: function (lang) {
        var self = this;
        return fetch('lang/' + lang + '.json')
            .then(function (response) {
                if (!response.ok) throw new Error('Failed to load ' + lang + '.json');
                return response.json();
            })
            .then(function (data) {
                self.translations = data;
            })
            .catch(function (error) {
                console.error('i18n: error loading translations', error);
                if (lang !== self.defaultLang) {
                    return self.loadTranslations(self.defaultLang);
                }
            });
    },

    /**
     * Obtenir une traduction par clé (supporte "section.key")
     */
    t: function (key) {
        var keys = key.split('.');
        var value = this.translations;

        for (var i = 0; i < keys.length; i++) {
            if (value && typeof value === 'object' && keys[i] in value) {
                value = value[keys[i]];
            } else {
                return key;
            }
        }

        if (typeof value === 'string') {
            value = value.replace('{year}', new Date().getFullYear());
            return value;
        }

        // Valeur non-string non-null (ex: number, boolean) — ne devrait pas arriver en pratique
        return key;
    },

    /**
     * Traduire tous les éléments data-i18n du DOM
     */
    translatePage: function () {
        var self = this;

        document.querySelectorAll('[data-i18n]').forEach(function (el) {
            var key = el.getAttribute('data-i18n');
            if (!key) return;
            // Skip option/optgroup — handled separately below
            var tag = el.tagName.toLowerCase();
            if (tag === 'option' || tag === 'optgroup') return;
            var translation = self.t(key);
            if (translation === key) return;
            if (el.hasAttribute('data-i18n-html')) {
                el.innerHTML = translation;
            } else {
                el.textContent = translation;
            }
        });

        document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
            if (el.hasAttribute('data-i18n')) return; // already handled above
            var key = el.getAttribute('data-i18n-html');
            if (!key) return;
            var translation = self.t(key);
            if (translation !== key) {
                el.innerHTML = translation;
            }
        });

        document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
            var key = el.getAttribute('data-i18n-placeholder');
            var translation = self.t(key);
            if (translation !== key) el.placeholder = translation;
        });

        document.querySelectorAll('[data-i18n-title]').forEach(function (el) {
            var key = el.getAttribute('data-i18n-title');
            var translation = self.t(key);
            if (translation !== key) el.title = translation;
        });

        document.querySelectorAll('option[data-i18n]').forEach(function (option) {
            var key = option.getAttribute('data-i18n');
            var translation = self.t(key);
            if (translation !== key) option.textContent = translation;
        });

        document.querySelectorAll('optgroup[data-i18n]').forEach(function (optgroup) {
            var key = optgroup.getAttribute('data-i18n');
            var translation = self.t(key);
            if (translation !== key) optgroup.label = translation;
        });

        var pageTitleKey = document.body.getAttribute('data-page-title');
        if (pageTitleKey) {
            var title = self.t(pageTitleKey);
            if (title !== pageTitleKey) document.title = title;
        }
    },

    /**
     * Mettre à jour l'attribut lang de <html>
     */
    updateHtmlLang: function () {
        document.documentElement.lang = this.currentLang;
    },

    /**
     * Changer de langue sans rechargement
     */
    switchLanguage: function (lang) {
        var self = this;
        if (this.supportedLangs.indexOf(lang) === -1) return;

        localStorage.setItem('agilevizion_lang', lang);
        this.currentLang = lang;
        return this.loadTranslations(lang).then(function () {
            self.translatePage();
            self.updateHtmlLang();

            var url = new URL(window.location.href);
            url.searchParams.set('lang', lang);
            window.history.replaceState({}, '', url);

            window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: lang } }));
        });
    },

    getLang: function () {
        return this.currentLang;
    }
};

window.I18n = I18n;

document.addEventListener('DOMContentLoaded', function () {
    I18n.init().then(function () {
        window.dispatchEvent(new CustomEvent('translationsReady'));
    });
});
