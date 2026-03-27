/**
 * Tests unitaires — Module i18n FR/EN (Story #10)
 * AgileVizion 2
 *
 * Couvre :
 * - t() : résolution de clés, clés manquantes, substitution {year}, clés imbriquées
 * - detectLanguage() : priorité URL → localStorage → navigateur → FR défaut
 * - translatePage() : data-i18n (textContent), data-i18n-html (innerHTML), data-i18n-placeholder
 * - switchLanguage() : localStorage, URL, événement languageChanged
 * - loadTranslations() : succès, échec, fallback FR
 * - Edge cases sécurité : clé injectée, langue non supportée
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../../');

// ── Chargement des vraies traductions (source de vérité) ─────────────────────
const frTranslations = JSON.parse(fs.readFileSync(path.join(ROOT, 'lang/fr.json'), 'utf8'));
const enTranslations = JSON.parse(fs.readFileSync(path.join(ROOT, 'lang/en.json'), 'utf8'));

// ── Mock fetch global ────────────────────────────────────────────────────────
global.fetch = jest.fn();

function mockFetch(lang) {
    const data = lang === 'en' ? enTranslations : frTranslations;
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => data });
}

function mockFetchFail() {
    global.fetch.mockRejectedValueOnce(new Error('Network error'));
}

// ── Mock localStorage ────────────────────────────────────────────────────────
const localStorageStore = {};
const localStorageMock = {
    getItem:    jest.fn(k => localStorageStore[k] ?? null),
    setItem:    jest.fn((k, v) => { localStorageStore[k] = String(v); }),
    removeItem: jest.fn(k => { delete localStorageStore[k]; }),
    clear:      jest.fn(() => { Object.keys(localStorageStore).forEach(k => delete localStorageStore[k]); }),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: false });

// ── Mock navigator.language ──────────────────────────────────────────────────
let mockBrowserLang = 'fr-FR';
Object.defineProperty(window.navigator, 'language', {
    get: () => mockBrowserLang,
    configurable: true,
});

// ── Chargement du module i18n ────────────────────────────────────────────────
// require() une seule fois ; jest isole le module entre fichiers de test
require(path.join(ROOT, 'js/i18n.js'));
const I18n = window.I18n;

// ── Setup / teardown ─────────────────────────────────────────────────────────
beforeEach(() => {
    global.fetch.mockReset();
    localStorageMock.clear();
    Object.keys(localStorageStore).forEach(k => delete localStorageStore[k]);
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    mockBrowserLang = 'fr-FR';
    document.body.innerHTML = '';
    document.documentElement.lang = '';
    // Réinitialiser l'état I18n
    I18n.currentLang  = 'fr';
    I18n.translations = {};
    // Supprimer le param ?lang de l'URL pour chaque test
    window.history.replaceState({}, '', '/');
});


// ====================================================================
// t() — Résolution de clés de traduction
// ====================================================================
describe('I18n.t() — résolution de clés', () => {

    beforeEach(() => {
        I18n.translations = frTranslations;
    });

    test('clé simple : common.book_call retourne la valeur FR', () => {
        expect(I18n.t('common.book_call')).toBe('Réserver un appel');
    });

    test('clé imbriquée 3 niveaux : simulator.norms.rgpd.fullName', () => {
        const val = I18n.t('simulator.norms.rgpd.fullName');
        expect(val).toContain('Règlement Général');
    });

    test('clé inexistante → retourne la clé elle-même (pas d\'erreur)', () => {
        const key = 'section.cle.inexistante';
        expect(I18n.t(key)).toBe(key);
    });

    test('clé partiellement valide → retourne la clé (pas de crash)', () => {
        const key = 'common.inexistante';
        expect(I18n.t(key)).toBe(key);
    });

    test('clé vide → retourne la chaîne vide ou la clé', () => {
        const result = I18n.t('');
        // ne doit pas lever d'exception
        expect(typeof result).toBe('string');
    });

    test('clé qui pointe sur un objet (pas une string) → retourne la clé', () => {
        // 'simulator.norms.rgpd' est un objet {fullName, sanctions, deadline}
        const key = 'simulator.norms.rgpd';
        expect(I18n.t(key)).toBe(key);
    });

    test('{year} est substitué par l\'année en cours', () => {
        I18n.translations = { footer: { copyright: 'AgileVizion {year}' } };
        const result = I18n.t('footer.copyright');
        expect(result).toContain(String(new Date().getFullYear()));
        expect(result).not.toContain('{year}');
    });

    test('traductions vides → retourne toujours la clé', () => {
        I18n.translations = {};
        expect(I18n.t('nav.home')).toBe('nav.home');
    });

    test('clé avec caractères spéciaux unicode → pas de crash', () => {
        I18n.translations = { test: { 'clé-unicode': 'valeur 🎉' } };
        expect(typeof I18n.t('test.clé-unicode')).toBe('string');
    });
});


// ====================================================================
// detectLanguage() — Priorité URL → localStorage → navigateur → FR
// ====================================================================
describe('I18n.detectLanguage() — priorité de détection', () => {

    test('paramètre URL ?lang=en → retourne "en"', () => {
        window.history.replaceState({}, '', '/?lang=en');
        const lang = I18n.detectLanguage();
        expect(lang).toBe('en');
    });

    test('paramètre URL ?lang=fr → retourne "fr"', () => {
        window.history.replaceState({}, '', '/?lang=fr');
        const lang = I18n.detectLanguage();
        expect(lang).toBe('fr');
    });

    test('paramètre URL lang non supporté (?lang=de) → ignoré, fallback suivant', () => {
        window.history.replaceState({}, '', '/?lang=de');
        localStorageMock.getItem.mockReturnValueOnce(null);
        mockBrowserLang = 'fr-FR';
        const lang = I18n.detectLanguage();
        expect(lang).toBe('fr');
    });

    test('URL sans lang + localStorage "en" → retourne "en"', () => {
        localStorageStore['agilevizion_lang'] = 'en';
        localStorageMock.getItem.mockImplementation(k => localStorageStore[k] ?? null);
        const lang = I18n.detectLanguage();
        expect(lang).toBe('en');
    });

    test('URL sans lang + localStorage "fr" → retourne "fr"', () => {
        localStorageStore['agilevizion_lang'] = 'fr';
        localStorageMock.getItem.mockImplementation(k => localStorageStore[k] ?? null);
        const lang = I18n.detectLanguage();
        expect(lang).toBe('fr');
    });

    test('localStorage avec valeur non supportée ("de") → ignoré, fallback navigateur', () => {
        localStorageStore['agilevizion_lang'] = 'de';
        localStorageMock.getItem.mockImplementation(k => localStorageStore[k] ?? null);
        mockBrowserLang = 'en-US';
        const lang = I18n.detectLanguage();
        expect(lang).toBe('en');
    });

    test('navigateur "en-US" → retourne "en" (prend le code ISO à 2 lettres)', () => {
        mockBrowserLang = 'en-US';
        const lang = I18n.detectLanguage();
        expect(lang).toBe('en');
    });

    test('navigateur "fr-FR" → retourne "fr"', () => {
        mockBrowserLang = 'fr-FR';
        const lang = I18n.detectLanguage();
        expect(lang).toBe('fr');
    });

    test('navigateur allemand "de-DE" → fallback FR (langue non supportée)', () => {
        mockBrowserLang = 'de-DE';
        const lang = I18n.detectLanguage();
        expect(lang).toBe('fr');
    });

    test('navigateur japonais "ja-JP" → fallback FR', () => {
        mockBrowserLang = 'ja-JP';
        const lang = I18n.detectLanguage();
        expect(lang).toBe('fr');
    });

    test('URL lang=en persiste dans localStorage', () => {
        window.history.replaceState({}, '', '/?lang=en');
        I18n.detectLanguage();
        expect(localStorageMock.setItem).toHaveBeenCalledWith('agilevizion_lang', 'en');
    });
});


// ====================================================================
// translatePage() — DOM → data-i18n, data-i18n-html, data-i18n-placeholder
// ====================================================================
describe('I18n.translatePage() — translation du DOM', () => {

    beforeEach(() => {
        I18n.translations = {
            nav:    { home: 'Accueil', services: 'Services' },
            hero:   { title: '<strong>Titre</strong> en gras' },
            common: { email: 'contact@example.com' },
            form:   { placeholder: 'Tapez ici…' },
        };
    });

    test('data-i18n → textContent mis à jour', () => {
        document.body.innerHTML = '<h1 data-i18n="nav.home">Placeholder</h1>';
        I18n.translatePage();
        expect(document.querySelector('h1').textContent).toBe('Accueil');
    });

    test('data-i18n sur deux éléments → les deux sont traduits', () => {
        document.body.innerHTML = `
            <a data-i18n="nav.home">X</a>
            <a data-i18n="nav.services">X</a>
        `;
        I18n.translatePage();
        const links = document.querySelectorAll('a');
        expect(links[0].textContent).toBe('Accueil');
        expect(links[1].textContent).toBe('Services');
    });

    test('data-i18n + data-i18n-html → innerHTML mis à jour (pas textContent)', () => {
        document.body.innerHTML = '<p data-i18n="hero.title" data-i18n-html>X</p>';
        I18n.translatePage();
        const p = document.querySelector('p');
        expect(p.innerHTML).toContain('<strong>');
        expect(p.textContent).toContain('Titre');
    });

    test('data-i18n-placeholder → placeholder de l\'input mis à jour', () => {
        document.body.innerHTML = '<input data-i18n-placeholder="form.placeholder">';
        I18n.translatePage();
        expect(document.querySelector('input').placeholder).toBe('Tapez ici…');
    });

    test('clé manquante dans data-i18n → élément inchangé (pas d\'erreur)', () => {
        document.body.innerHTML = '<span data-i18n="inexistant.clé">Texte original</span>';
        I18n.translatePage();
        // L'élément ne doit pas être modifié (clé retournée = clé originale)
        const span = document.querySelector('span');
        expect(span.textContent).toBe('Texte original');
    });

    test('aucun element data-i18n dans le DOM → pas d\'erreur', () => {
        document.body.innerHTML = '<div><p>Texte statique</p></div>';
        expect(() => I18n.translatePage()).not.toThrow();
    });

    test('translatePage() avec traductions vides → DOM inchangé, pas de crash', () => {
        I18n.translations = {};
        document.body.innerHTML = '<h1 data-i18n="nav.home">Original</h1>';
        I18n.translatePage();
        expect(document.querySelector('h1').textContent).toBe('Original');
    });

    test('data-page-title sur body → document.title mis à jour', () => {
        I18n.translations = { page: { title: 'Titre de la page' } };
        document.body.setAttribute('data-page-title', 'page.title');
        I18n.translatePage();
        expect(document.title).toBe('Titre de la page');
        document.body.removeAttribute('data-page-title');
    });

    test('updateHtmlLang() → attribut lang de <html> mis à jour', () => {
        I18n.currentLang = 'en';
        I18n.updateHtmlLang();
        expect(document.documentElement.lang).toBe('en');
    });
});


// ====================================================================
// loadTranslations() — fetch JSON, fallback FR
// ====================================================================
describe('I18n.loadTranslations() — chargement des traductions', () => {

    test('chargement FR réussi → I18n.translations peuplé', async () => {
        mockFetch('fr');
        await I18n.loadTranslations('fr');
        expect(I18n.translations).toHaveProperty('common');
        expect(I18n.translations.common.book_call).toBe('Réserver un appel');
    });

    test('chargement EN réussi → traductions anglaises', async () => {
        mockFetch('en');
        await I18n.loadTranslations('en');
        expect(I18n.translations.common.book_call).toBe('Book a call');
    });

    test('fetch retourne 404 (response.ok = false) → pas de crash', async () => {
        global.fetch.mockResolvedValueOnce({ ok: false });
        mockFetch('fr'); // fallback vers FR
        await expect(I18n.loadTranslations('en')).resolves.not.toThrow();
    });

    test('fetch échoue réseau → pas de crash (catch silencieux)', async () => {
        mockFetchFail();
        mockFetch('fr'); // fallback FR
        await expect(I18n.loadTranslations('en')).resolves.toBeUndefined();
    });

    test('fetch appelé avec le bon chemin lang/fr.json', async () => {
        mockFetch('fr');
        await I18n.loadTranslations('fr');
        expect(global.fetch).toHaveBeenCalledWith('lang/fr.json');
    });

    test('fetch appelé avec le bon chemin lang/en.json', async () => {
        mockFetch('en');
        await I18n.loadTranslations('en');
        expect(global.fetch).toHaveBeenCalledWith('lang/en.json');
    });

    test('échec sur lang=en → fallback sur lang=fr (deuxième fetch)', async () => {
        global.fetch
            .mockResolvedValueOnce({ ok: false })  // EN échoue
            .mockResolvedValueOnce({ ok: true, json: async () => frTranslations }); // FR réussit
        await I18n.loadTranslations('en');
        expect(global.fetch).toHaveBeenCalledTimes(2);
        expect(global.fetch).toHaveBeenLastCalledWith('lang/fr.json');
    });

    test('échec sur lang=fr (defaut) → pas de boucle infinie', async () => {
        mockFetchFail();
        // Ne doit pas rappeler loadTranslations récursivement
        await expect(I18n.loadTranslations('fr')).resolves.toBeUndefined();
        expect(global.fetch).toHaveBeenCalledTimes(1);
    });
});


// ====================================================================
// switchLanguage() — changement dynamique
// ====================================================================
describe('I18n.switchLanguage() — changement de langue', () => {

    test('switchLanguage("en") met à jour currentLang', async () => {
        mockFetch('en');
        await I18n.switchLanguage('en');
        expect(I18n.currentLang).toBe('en');
    });

    test('switchLanguage("fr") met à jour currentLang', async () => {
        I18n.currentLang = 'en';
        mockFetch('fr');
        await I18n.switchLanguage('fr');
        expect(I18n.currentLang).toBe('fr');
    });

    test('switchLanguage persiste dans localStorage', async () => {
        mockFetch('en');
        await I18n.switchLanguage('en');
        expect(localStorageMock.setItem).toHaveBeenCalledWith('agilevizion_lang', 'en');
    });

    test('switchLanguage met à jour l\'URL avec ?lang=', async () => {
        mockFetch('en');
        await I18n.switchLanguage('en');
        expect(window.location.search).toContain('lang=en');
    });

    test('switchLanguage dispatche l\'événement "languageChanged"', async () => {
        mockFetch('en');
        const handler = jest.fn();
        window.addEventListener('languageChanged', handler);
        await I18n.switchLanguage('en');
        window.removeEventListener('languageChanged', handler);
        expect(handler).toHaveBeenCalledTimes(1);
        const event = handler.mock.calls[0][0];
        expect(event.detail.lang).toBe('en');
    });

    test('switchLanguage avec langue non supportée → retourne undefined sans action', () => {
        const result = I18n.switchLanguage('de');
        expect(result).toBeUndefined();
        expect(I18n.currentLang).toBe('fr'); // inchangé
    });

    test('switchLanguage traduit le DOM après chargement', async () => {
        document.body.innerHTML = '<h1 data-i18n="nav.home">Accueil</h1>';
        mockFetch('en');
        await I18n.switchLanguage('en');
        expect(document.querySelector('h1').textContent).toBe('Home');
    });

    test('switchLanguage met à jour <html lang>', async () => {
        mockFetch('en');
        await I18n.switchLanguage('en');
        expect(document.documentElement.lang).toBe('en');
    });
});


// ====================================================================
// getLang() — accesseur courant
// ====================================================================
describe('I18n.getLang()', () => {

    test('retourne la langue courante', () => {
        I18n.currentLang = 'en';
        expect(I18n.getLang()).toBe('en');
    });

    test('retourne "fr" par défaut', () => {
        I18n.currentLang = 'fr';
        expect(I18n.getLang()).toBe('fr');
    });
});


// ====================================================================
// Intégrité des fichiers JSON — clés cohérentes FR/EN
// ====================================================================
describe('Cohérence FR ↔ EN — lang/fr.json et lang/en.json', () => {

    function getAllKeys(obj, prefix = '') {
        return Object.keys(obj).reduce((keys, key) => {
            const fullKey = prefix ? `${prefix}.${key}` : key;
            if (typeof obj[key] === 'object' && obj[key] !== null) {
                return keys.concat(getAllKeys(obj[key], fullKey));
            }
            return keys.concat(fullKey);
        }, []);
    }

    const frKeys = getAllKeys(frTranslations);
    const enKeys = getAllKeys(enTranslations);

    test('fr.json est un objet JSON valide', () => {
        expect(typeof frTranslations).toBe('object');
        expect(frTranslations).not.toBeNull();
    });

    test('en.json est un objet JSON valide', () => {
        expect(typeof enTranslations).toBe('object');
        expect(enTranslations).not.toBeNull();
    });

    test('fr.json contient au moins 50 clés de traduction', () => {
        expect(frKeys.length).toBeGreaterThanOrEqual(50);
    });

    test('en.json contient au moins 50 clés de traduction', () => {
        expect(enKeys.length).toBeGreaterThanOrEqual(50);
    });

    test('fr.json et en.json ont le même nombre de clés', () => {
        expect(frKeys.length).toBe(enKeys.length);
    });

    test('toutes les clés FR existent dans EN', () => {
        const enKeySet = new Set(enKeys);
        const missingInEn = frKeys.filter(k => !enKeySet.has(k));
        expect(missingInEn).toEqual([]);
    });

    test('toutes les clés EN existent dans FR', () => {
        const frKeySet = new Set(frKeys);
        const missingInFr = enKeys.filter(k => !frKeySet.has(k));
        expect(missingInFr).toEqual([]);
    });

    test('sections obligatoires présentes dans les deux fichiers', () => {
        const required = ['common', 'nav', 'landing', 'why', 'simulator', 'grc', 'ia', 'cookies'];
        required.forEach(section => {
            expect(frTranslations).toHaveProperty(section);
            expect(enTranslations).toHaveProperty(section);
        });
    });

    test('aucune valeur vide dans fr.json', () => {
        const emptyFr = frKeys.filter(k => {
            const parts = k.split('.');
            let val = frTranslations;
            parts.forEach(p => { val = val && val[p]; });
            return val === '' || val === null || val === undefined;
        });
        expect(emptyFr).toEqual([]);
    });

    test('aucune valeur vide dans en.json', () => {
        const emptyEn = enKeys.filter(k => {
            const parts = k.split('.');
            let val = enTranslations;
            parts.forEach(p => { val = val && val[p]; });
            return val === '' || val === null || val === undefined;
        });
        expect(emptyEn).toEqual([]);
    });

    test('la clé common.book_call est différente en FR et EN', () => {
        expect(frTranslations.common.book_call).not.toBe(enTranslations.common.book_call);
    });

    test('la clé nav.home est différente en FR et EN', () => {
        expect(frTranslations.nav.home).not.toBe(enTranslations.nav.home);
    });
});


// ====================================================================
// Sécurité — edge cases inputs malveillants
// ====================================================================
describe('Sécurité i18n — inputs malveillants', () => {

    test('clé contenant <script> → pas d\'exécution (retourne la clé)', () => {
        I18n.translations = {};
        const maliciousKey = '<script>alert(1)</script>';
        const result = I18n.t(maliciousKey);
        expect(result).toBe(maliciousKey);
        // Le DOM ne doit pas contenir de script exécuté
        const scripts = document.querySelectorAll('script');
        expect(scripts.length).toBe(0);
    });

    test('clé contenant "../../../etc/passwd" → pas de path traversal', () => {
        I18n.translations = {};
        const result = I18n.t('../../../etc/passwd');
        expect(result).toBe('../../../etc/passwd');
    });

    test('valeur de traduction XSS via data-i18n → textContent échappe le HTML', () => {
        I18n.translations = { test: { xss: '<img src=x onerror=alert(1)>' } };
        document.body.innerHTML = '<div data-i18n="test.xss"></div>';
        I18n.translatePage();
        const div = document.querySelector('div');
        // textContent ne doit pas créer d'élément img exécutable
        expect(div.querySelector('img')).toBeNull();
        expect(div.textContent).toContain('<img');
    });

    test('switchLanguage avec injection de code → langue ignorée (non supportée)', () => {
        const result = I18n.switchLanguage('"; DROP TABLE--');
        expect(result).toBeUndefined();
        expect(I18n.currentLang).toBe('fr');
    });

    test('localStorage corrompu (valeur null) → pas de crash', () => {
        localStorageMock.getItem.mockReturnValueOnce(null);
        expect(() => I18n.detectLanguage()).not.toThrow();
    });

    test('localStorage corrompu (JSON invalide) → pas de crash', () => {
        localStorageMock.getItem.mockReturnValueOnce('{"broken":');
        expect(() => I18n.detectLanguage()).not.toThrow();
    });
});


// ====================================================================
// Structure i18n — présence des attributs data-i18n dans les pages HTML
// ====================================================================
describe('Présence data-i18n dans les fichiers HTML', () => {

    const pages = ['index.html', 'cyber.html', 'ia.html'];

    pages.forEach(page => {
        test(`${page} contient des attributs data-i18n`, () => {
            const html = fs.readFileSync(path.join(ROOT, page), 'utf8');
            expect(html).toMatch(/data-i18n="/);
        });

        test(`${page} charge js/i18n.js`, () => {
            const html = fs.readFileSync(path.join(ROOT, page), 'utf8');
            expect(html).toContain('js/i18n.js');
        });
    });

    test('index.html a data-i18n-placeholder sur les inputs du simulateur', () => {
        const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
        expect(html).toMatch(/data-i18n-placeholder="/);
    });

    test('les 3 pages ont un sélecteur de langue (.lang-switch ou [data-lang])', () => {
        pages.forEach(page => {
            const html = fs.readFileSync(path.join(ROOT, page), 'utf8');
            const hasLangSwitch = html.includes('lang-switch') ||
                                  html.includes('data-lang') ||
                                  html.includes('switchLanguage');
            expect(hasLangSwitch).toBe(true);
        });
    });
});
