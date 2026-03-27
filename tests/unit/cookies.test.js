/**
 * Tests unitaires — cookies.js (Story #14)
 * Bannière cookies RGPD — AgileVizion 2
 *
 * Couvre TOUS les critères d'acceptation et edge cases :
 * - _localStorageAvailable() : disponible, indisponible (navigation privée stricte)
 * - _getConsent() : null si absent, valeur si présent, null si expiré (>365j), null si JSON invalide
 * - _setConsent() : stocke {value, timestamp} en JSON sous la clé cookie_consent
 * - _hideBanner() : ajoute .cookie-banner--hidden, puis display:none après 300ms
 * - acceptCookies() : consent 'accepted' + banner masquée
 * - refuseCookies() : consent 'refused' + banner masquée
 * - DOMContentLoaded : affiche la banner si null, ne fait rien si consent présent
 * - Edge cases : localStorage absent, consent expiré, JSON corrompu, banner absente du DOM
 * - Sécurité : injection XSS dans localStorage
 * - CSS : position fixed bottom, z-index élevé, semi-transparente, 2 boutons
 */

'use strict';

const fs = require('fs');
const path = require('path');

const COOKIES_JS = fs.readFileSync(
    path.resolve(__dirname, '../../js/cookies.js'),
    'utf8'
);
const COOKIES_CSS = fs.readFileSync(
    path.resolve(__dirname, '../../css/cookies.css'),
    'utf8'
);

// ====================================================================
// Cleanup infrastructure — évite l'accumulation d'état entre tests
// ====================================================================
let _docListeners = [];
const _origDocAdd = document.addEventListener.bind(document);
const _origDocRemove = document.removeEventListener.bind(document);

document.addEventListener = function (type, handler, options) {
    _docListeners.push({ type, handler });
    return _origDocAdd(type, handler, options);
};

afterEach(() => {
    _docListeners.forEach(({ type, handler }) => _origDocRemove(type, handler));
    _docListeners = [];
    document.body.innerHTML = '';
    localStorage.clear();
    jest.clearAllTimers();
    jest.useRealTimers();
    // Nettoyer les globales exposées par le module
    delete window.acceptCookies;
    delete window.refuseCookies;
    delete window.COOKIE_KEY;
    delete window.COOKIE_TTL_MS;
});

// ====================================================================
// Helpers
// ====================================================================

/** Injecte le HTML minimal de la bannière dans le body */
function setupBannerDOM() {
    document.body.innerHTML = `
        <div id="cookie-banner" class="cookie-banner" style="display:none;" role="dialog">
            <p>Ce site utilise des cookies essentiels pour son fonctionnement.
               <a href="#legal">Mentions légales</a></p>
            <div class="cookie-actions">
                <button onclick="acceptCookies()" class="btn btn-accept">Accepter</button>
                <button onclick="refuseCookies()" class="btn btn-refuse">Refuser</button>
            </div>
        </div>
    `;
}

/** Évalue le module en scope global (indirect eval) et déclenche DOMContentLoaded */
function loadModule() {
    // eslint-disable-next-line no-eval
    (0, eval)(COOKIES_JS); // indirect eval → scope global (window) → fonctions accessibles
    document.dispatchEvent(new Event('DOMContentLoaded'));
}

/** Stocke un consentement avec timestamp custom dans localStorage */
function storeConsent(value, daysAgo = 0) {
    const timestamp = Date.now() - daysAgo * 24 * 60 * 60 * 1000;
    localStorage.setItem('cookie_consent', JSON.stringify({ value, timestamp }));
}

// ====================================================================
// CSS — Structure et design de la bannière
// ====================================================================
describe('CSS — .cookie-banner structure', () => {
    test('CSS contient position: fixed pour .cookie-banner', () => {
        expect(COOKIES_CSS).toMatch(/\.cookie-banner\s*\{[^}]*position\s*:\s*fixed/s);
    });

    test('CSS positionne la bannière en bas (bottom: 0)', () => {
        expect(COOKIES_CSS).toMatch(/\.cookie-banner\s*\{[^}]*bottom\s*:\s*0/s);
    });

    test('CSS couvre toute la largeur (left: 0, right: 0)', () => {
        expect(COOKIES_CSS).toMatch(/\.cookie-banner\s*\{[^}]*left\s*:\s*0/s);
        expect(COOKIES_CSS).toMatch(/\.cookie-banner\s*\{[^}]*right\s*:\s*0/s);
    });

    test('CSS z-index est élevé (≥ 1000)', () => {
        const match = COOKIES_CSS.match(/\.cookie-banner\s*\{[^}]*z-index\s*:\s*(\d+)/s);
        expect(match).not.toBeNull();
        expect(parseInt(match[1], 10)).toBeGreaterThanOrEqual(1000);
    });

    test('CSS fond semi-transparent (rgba)', () => {
        expect(COOKIES_CSS).toMatch(/\.cookie-banner\s*\{[^}]*background\s*:\s*rgba/s);
    });

    test('CSS contient transition pour l\'animation de masquage', () => {
        expect(COOKIES_CSS).toContain('transition');
    });

    test('CSS .cookie-banner--hidden contient transform: translateY(100%)', () => {
        expect(COOKIES_CSS).toMatch(/\.cookie-banner--hidden\s*\{[^}]*transform\s*:\s*translateY\(100%\)/s);
    });

    test('CSS .cookie-banner--hidden contient opacity: 0', () => {
        expect(COOKIES_CSS).toMatch(/\.cookie-banner--hidden\s*\{[^}]*opacity\s*:\s*0/s);
    });

    test('CSS définit des styles pour .btn-accept', () => {
        expect(COOKIES_CSS).toContain('.btn-accept');
    });

    test('CSS définit des styles pour .btn-refuse', () => {
        expect(COOKIES_CSS).toContain('.btn-refuse');
    });

    test('CSS contient media query pour mobile (max-width: 480px)', () => {
        expect(COOKIES_CSS).toContain('480px');
    });
});

// ====================================================================
// JS — Structure du module
// ====================================================================
describe('JS — Structure du module cookies.js', () => {
    test('le fichier définit la clé COOKIE_KEY', () => {
        expect(COOKIES_JS).toContain('cookie_consent');
    });

    test('le fichier définit une TTL de 365 jours', () => {
        expect(COOKIES_JS).toContain('365');
    });

    test('le fichier expose acceptCookies()', () => {
        expect(COOKIES_JS).toContain('function acceptCookies');
    });

    test('le fichier expose refuseCookies()', () => {
        expect(COOKIES_JS).toContain('function refuseCookies');
    });

    test('le fichier utilise DOMContentLoaded', () => {
        expect(COOKIES_JS).toContain('DOMContentLoaded');
    });

    test('le fichier utilise localStorage', () => {
        expect(COOKIES_JS).toContain('localStorage');
    });

    test('le fichier teste la disponibilité de localStorage', () => {
        // Doit avoir un try/catch pour détecter les navigateurs en mode privé strict
        expect(COOKIES_JS).toContain('try');
        expect(COOKIES_JS).toContain('catch');
    });

    test('le fichier parse JSON pour lire le consentement', () => {
        expect(COOKIES_JS).toContain('JSON.parse');
    });

    test('le fichier stringify JSON pour écrire le consentement', () => {
        expect(COOKIES_JS).toContain('JSON.stringify');
    });

    test('le fichier stocke le timestamp avec le consentement', () => {
        expect(COOKIES_JS).toContain('timestamp');
    });

    test('le fichier vérifie l\'expiration du consentement', () => {
        expect(COOKIES_JS).toContain('Date.now()');
    });

    test('aucun import de librairie externe', () => {
        expect(COOKIES_JS).not.toContain('require(');
        expect(COOKIES_JS).not.toContain('import ');
    });
});

// ====================================================================
// JS — localStorage disponible (nominal)
// ====================================================================
describe('JS — localStorage disponible', () => {
    test('localStorage est disponible dans jsdom', () => {
        expect(() => {
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
        }).not.toThrow();
    });

    test('DOMContentLoaded : banner affichée si aucun consentement stocké', () => {
        setupBannerDOM();
        localStorage.clear();
        loadModule();

        const banner = document.getElementById('cookie-banner');
        expect(banner.style.display).toBe('flex');
    });

    test('DOMContentLoaded : banner non affichée si consentement "accepted"', () => {
        setupBannerDOM();
        storeConsent('accepted');
        loadModule();

        const banner = document.getElementById('cookie-banner');
        expect(banner.style.display).not.toBe('flex');
    });

    test('DOMContentLoaded : banner non affichée si consentement "refused"', () => {
        setupBannerDOM();
        storeConsent('refused');
        loadModule();

        const banner = document.getElementById('cookie-banner');
        expect(banner.style.display).not.toBe('flex');
    });

    test('DOMContentLoaded : banner affichée si banner présente avec display:none par défaut', () => {
        setupBannerDOM();
        const banner = document.getElementById('cookie-banner');
        expect(banner.style.display).toBe('none'); // état initial HTML
        loadModule();
        expect(banner.style.display).toBe('flex');
    });
});

// ====================================================================
// JS — acceptCookies()
// ====================================================================
describe('JS — acceptCookies()', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    test('acceptCookies() stocke "accepted" dans localStorage', () => {
        setupBannerDOM();
        loadModule();
        window.acceptCookies();

        const raw = localStorage.getItem('cookie_consent');
        expect(raw).not.toBeNull();
        const data = JSON.parse(raw);
        expect(data.value).toBe('accepted');
    });

    test('acceptCookies() stocke un timestamp récent (< 1s)', () => {
        setupBannerDOM();
        loadModule();
        const before = Date.now();
        window.acceptCookies();
        const after = Date.now();

        const data = JSON.parse(localStorage.getItem('cookie_consent'));
        expect(data.timestamp).toBeGreaterThanOrEqual(before);
        expect(data.timestamp).toBeLessThanOrEqual(after + 100);
    });

    test('acceptCookies() ajoute .cookie-banner--hidden à la bannière', () => {
        setupBannerDOM();
        loadModule();
        window.acceptCookies();

        const banner = document.getElementById('cookie-banner');
        expect(banner.classList.contains('cookie-banner--hidden')).toBe(true);
    });

    test('acceptCookies() → display:none après 300ms', () => {
        setupBannerDOM();
        loadModule();
        window.acceptCookies();

        const banner = document.getElementById('cookie-banner');
        expect(banner.style.display).not.toBe('none'); // encore visible juste après

        jest.advanceTimersByTime(300);
        expect(banner.style.display).toBe('none');
    });

    test('acceptCookies() : pas d\'erreur si banner absente du DOM', () => {
        document.body.innerHTML = ''; // pas de bannière
        loadModule();
        expect(() => window.acceptCookies()).not.toThrow();
    });
});

// ====================================================================
// JS — refuseCookies()
// ====================================================================
describe('JS — refuseCookies()', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    test('refuseCookies() stocke "refused" dans localStorage', () => {
        setupBannerDOM();
        loadModule();
        window.refuseCookies();

        const raw = localStorage.getItem('cookie_consent');
        expect(raw).not.toBeNull();
        const data = JSON.parse(raw);
        expect(data.value).toBe('refused');
    });

    test('refuseCookies() stocke un timestamp récent', () => {
        setupBannerDOM();
        loadModule();
        const before = Date.now();
        window.refuseCookies();

        const data = JSON.parse(localStorage.getItem('cookie_consent'));
        expect(data.timestamp).toBeGreaterThanOrEqual(before);
    });

    test('refuseCookies() ajoute .cookie-banner--hidden à la bannière', () => {
        setupBannerDOM();
        loadModule();
        window.refuseCookies();

        const banner = document.getElementById('cookie-banner');
        expect(banner.classList.contains('cookie-banner--hidden')).toBe(true);
    });

    test('refuseCookies() → display:none après 300ms', () => {
        setupBannerDOM();
        loadModule();
        window.refuseCookies();

        jest.advanceTimersByTime(300);
        const banner = document.getElementById('cookie-banner');
        expect(banner.style.display).toBe('none');
    });

    test('refuseCookies() : pas d\'erreur si banner absente du DOM', () => {
        document.body.innerHTML = '';
        loadModule();
        expect(() => window.refuseCookies()).not.toThrow();
    });
});

// ====================================================================
// JS — Edge case : consentement expiré (> 365 jours)
// ====================================================================
describe('JS — Expiration du consentement (> 12 mois)', () => {
    test('consentement de 366 jours → banner réapparaît', () => {
        setupBannerDOM();
        storeConsent('accepted', 366); // 366 jours dans le passé
        loadModule();

        const banner = document.getElementById('cookie-banner');
        expect(banner.style.display).toBe('flex');
    });

    test('consentement de 364 jours (dans la TTL) → banner NE réapparaît PAS', () => {
        setupBannerDOM();
        // 364 jours = clairement dans la TTL (TTL = 365j strictement >)
        // On évite d'utiliser 365j exact car quelques ms d'exécution suffisent
        // à franchir la boundary et rendre le test non-déterministe
        storeConsent('accepted', 364);
        loadModule();

        const banner = document.getElementById('cookie-banner');
        expect(banner.style.display).not.toBe('flex');
    });

    test('consentement de 364 jours → banner NE réapparaît PAS', () => {
        setupBannerDOM();
        storeConsent('accepted', 364);
        loadModule();

        const banner = document.getElementById('cookie-banner');
        expect(banner.style.display).not.toBe('flex');
    });

    test('consentement expiré → entrée localStorage supprimée', () => {
        setupBannerDOM();
        storeConsent('accepted', 400);
        loadModule();

        // Après getConsent, la clé doit être supprimée
        const raw = localStorage.getItem('cookie_consent');
        expect(raw).toBeNull();
    });
});

// ====================================================================
// JS — Edge case : localStorage indisponible
// ====================================================================
describe('JS — localStorage indisponible (navigation privée stricte)', () => {
    let origLocalStorage;

    beforeEach(() => {
        // Sauvegarder localStorage
        origLocalStorage = Object.getOwnPropertyDescriptor(window, 'localStorage');

        // Simuler l'indisponibilité : getItem lève une exception
        Object.defineProperty(window, 'localStorage', {
            get: () => {
                throw new Error('localStorage is not available');
            },
            configurable: true,
        });
    });

    afterEach(() => {
        if (origLocalStorage) {
            Object.defineProperty(window, 'localStorage', origLocalStorage);
        }
    });

    test('si localStorage indisponible : la banner est affichée (toujours visible)', () => {
        setupBannerDOM();
        loadModule();

        const banner = document.getElementById('cookie-banner');
        // Sans localStorage, getConsent() retourne null → banner affichée
        expect(banner.style.display).toBe('flex');
    });

    test('si localStorage indisponible : acceptCookies() ne lève pas d\'erreur', () => {
        setupBannerDOM();
        loadModule();
        expect(() => window.acceptCookies()).not.toThrow();
    });

    test('si localStorage indisponible : refuseCookies() ne lève pas d\'erreur', () => {
        setupBannerDOM();
        loadModule();
        expect(() => window.refuseCookies()).not.toThrow();
    });
});

// ====================================================================
// JS — Edge case : JSON corrompu dans localStorage
// ====================================================================
describe('JS — JSON corrompu dans localStorage', () => {
    test('JSON invalide → consent null → banner affichée', () => {
        setupBannerDOM();
        localStorage.setItem('cookie_consent', 'not json {{{');
        loadModule();

        const banner = document.getElementById('cookie-banner');
        expect(banner.style.display).toBe('flex');
    });

    test('JSON valide mais structure incorrecte (sans value) → consent null', () => {
        setupBannerDOM();
        localStorage.setItem('cookie_consent', JSON.stringify({ foo: 'bar' }));
        loadModule();

        const banner = document.getElementById('cookie-banner');
        expect(banner.style.display).toBe('flex');
    });

    test('JSON valide mais sans timestamp → consent null', () => {
        setupBannerDOM();
        localStorage.setItem('cookie_consent', JSON.stringify({ value: 'accepted' }));
        loadModule();

        const banner = document.getElementById('cookie-banner');
        expect(banner.style.display).toBe('flex');
    });

    test('valeur null dans localStorage → banner affichée', () => {
        setupBannerDOM();
        localStorage.setItem('cookie_consent', 'null');
        loadModule();

        const banner = document.getElementById('cookie-banner');
        expect(banner.style.display).toBe('flex');
    });

    test('chaîne vide dans localStorage → banner affichée', () => {
        setupBannerDOM();
        localStorage.setItem('cookie_consent', '');
        loadModule();

        const banner = document.getElementById('cookie-banner');
        expect(banner.style.display).toBe('flex');
    });
});

// ====================================================================
// JS — Persistance inter-pages (même localStorage)
// ====================================================================
describe('JS — Persistance du consentement entre "pages"', () => {
    test('consentement stocké sur page 1 est disponible sur page 2 (même localStorage)', () => {
        // Simule page 1 : accepte
        setupBannerDOM();
        loadModule();
        window.acceptCookies();

        // Simule page 2 : nettoie les listeners mais conserve localStorage
        _docListeners.forEach(({ type, handler }) => _origDocRemove(type, handler));
        _docListeners = [];
        document.body.innerHTML = '';
        delete window.acceptCookies;
        delete window.refuseCookies;

        // Recharge le module (nouvelle page)
        setupBannerDOM();
        // eslint-disable-next-line no-eval
        (0, eval)(COOKIES_JS);
        document.dispatchEvent(new Event('DOMContentLoaded'));

        const banner = document.getElementById('cookie-banner');
        expect(banner.style.display).not.toBe('flex');
    });
});

// ====================================================================
// JS — Sécurité : inputs malveillants
// ====================================================================
describe('JS — Sécurité inputs malveillants', () => {
    test('valeur XSS dans localStorage ne cause pas d\'erreur', () => {
        setupBannerDOM();
        localStorage.setItem('cookie_consent', JSON.stringify({
            value: '<script>alert(1)</script>',
            timestamp: Date.now()
        }));
        // La valeur XSS ne sera pas "accepted" ou "refused", donc la banner apparaîtra
        // mais pas d'exécution de script
        expect(() => loadModule()).not.toThrow();
    });

    test('injection HTML dans localStorage ne cause pas d\'erreur', () => {
        setupBannerDOM();
        localStorage.setItem('cookie_consent', JSON.stringify({
            value: '<img src=x onerror=alert(1)>',
            timestamp: Date.now()
        }));
        expect(() => loadModule()).not.toThrow();
    });

    test('path traversal dans localStorage ne cause pas d\'erreur', () => {
        setupBannerDOM();
        localStorage.setItem('cookie_consent', JSON.stringify({
            value: '../../etc/passwd',
            timestamp: Date.now()
        }));
        expect(() => loadModule()).not.toThrow();
    });

    test('valeur très longue dans localStorage ne cause pas d\'erreur', () => {
        setupBannerDOM();
        localStorage.setItem('cookie_consent', JSON.stringify({
            value: 'a'.repeat(100000),
            timestamp: Date.now()
        }));
        expect(() => loadModule()).not.toThrow();
    });
});

// ====================================================================
// JS — Clé localStorage conforme à la story
// ====================================================================
describe('JS — Clé localStorage "cookie_consent"', () => {
    test('le consentement est stocké sous la clé exacte "cookie_consent"', () => {
        setupBannerDOM();
        loadModule();
        window.acceptCookies();

        expect(localStorage.getItem('cookie_consent')).not.toBeNull();
    });

    test('aucune autre clé créée dans localStorage', () => {
        setupBannerDOM();
        loadModule();
        window.acceptCookies();

        // Seule la clé cookie_consent doit exister
        const keys = Object.keys(localStorage);
        // Filtrer les clés de test
        const cookieKeys = keys.filter(k => k !== '__ls_test__');
        expect(cookieKeys).toEqual(['cookie_consent']);
    });
});

// ====================================================================
// JS — Pas d'analytics (MVP)
// ====================================================================
describe('JS — Pas de tracking analytics', () => {
    test('cookies.js ne contient pas d\'appel à Google Analytics', () => {
        expect(COOKIES_JS).not.toContain('gtag');
        expect(COOKIES_JS).not.toContain('ga(');
        expect(COOKIES_JS).not.toContain('google-analytics');
        expect(COOKIES_JS).not.toContain('fbq');
        expect(COOKIES_JS).not.toContain('_gaq');
    });

    test('cookies.js ne charge aucun script tiers', () => {
        expect(COOKIES_JS).not.toContain('createElement(\'script\')');
        expect(COOKIES_JS).not.toContain('createElement("script")');
    });
});
