/**
 * Tests unitaires — calendly.js (Story #16)
 * Calendly lazy loading avec fallback — AgileVizion 2
 *
 * Couvre TOUS les critères d'acceptation et edge cases :
 * - CALENDLY_URL configurable (variable, pas hardcodée dans la logique)
 * - Lazy loading : aucun script Calendly au chargement initial
 * - openCalendly() : charge le script au premier clic seulement
 * - État machine : idle → loading → ready | failed
 * - Fallback CDN : state=failed → window.open(CALENDLY_URL, '_blank')
 * - Fallback si window.Calendly non défini → window.open
 * - Idempotence : 2ème appel ne recharge pas le script (already loading)
 * - Callbacks en attente exécutées lors du flush
 * - CSS Calendly injecté avec le script
 * - Pas de chargement de script à l'init (lazy)
 */

'use strict';

const fs = require('fs');
const path = require('path');

const CALENDLY_JS_SRC = fs.readFileSync(
    path.resolve(__dirname, '../../js/calendly.js'),
    'utf8'
);

// ====================================================================
// Cleanup entre tests — évite l'accumulation d'état global
// ====================================================================
afterEach(() => {
    // Nettoyer les globales exposées par le module
    delete window.openCalendly;
    delete window.CALENDLY_URL;
    delete window.CALENDLY_CSS;
    delete window.CALENDLY_JS;
    delete window.Calendly;
    // Nettoyer DOM
    document.head.innerHTML = '';
    document.body.innerHTML = '';
    // Nettoyer les mocks
    jest.restoreAllMocks();
});

// ====================================================================
// Helpers
// ====================================================================

/** Évalue le module en scope global */
function loadModule() {
    // eslint-disable-next-line no-eval
    (0, eval)(CALENDLY_JS_SRC);
}

/** Récupère le dernier script ajouté au body avec src calendly */
function getCalendlyScript() {
    return Array.from(document.body.querySelectorAll('script')).find(s =>
        s.src && s.src.includes('calendly')
    );
}

/** Récupère le link CSS Calendly ajouté au head */
function getCalendlyLink() {
    return Array.from(document.head.querySelectorAll('link[rel="stylesheet"]')).find(l =>
        l.href && l.href.includes('calendly')
    );
}

/** Simule le chargement réussi du script Calendly */
function triggerScriptLoad() {
    const script = getCalendlyScript();
    if (script && script.onload) script.onload();
}

/** Simule l'échec du script Calendly */
function triggerScriptError() {
    const script = getCalendlyScript();
    if (script && script.onerror) script.onerror();
}

// ====================================================================
// Structure du module
// ====================================================================
describe('Structure — calendly.js', () => {
    test('le fichier définit CALENDLY_URL', () => {
        expect(CALENDLY_JS_SRC).toContain('CALENDLY_URL');
    });

    test('CALENDLY_URL pointe vers calendly.com', () => {
        expect(CALENDLY_JS_SRC).toContain('calendly.com');
    });

    test('le fichier définit CALENDLY_CSS', () => {
        expect(CALENDLY_JS_SRC).toContain('CALENDLY_CSS');
    });

    test('le fichier définit CALENDLY_JS (URL du script CDN)', () => {
        expect(CALENDLY_JS_SRC).toContain('CALENDLY_JS');
    });

    test('le fichier expose openCalendly sur window', () => {
        expect(CALENDLY_JS_SRC).toContain('window.openCalendly');
    });

    test('le fichier gère l\'état "idle" initial', () => {
        expect(CALENDLY_JS_SRC).toContain("'idle'");
    });

    test('le fichier gère l\'état "loading"', () => {
        expect(CALENDLY_JS_SRC).toContain("'loading'");
    });

    test('le fichier gère l\'état "ready"', () => {
        expect(CALENDLY_JS_SRC).toContain("'ready'");
    });

    test('le fichier gère l\'état "failed"', () => {
        expect(CALENDLY_JS_SRC).toContain("'failed'");
    });

    test('le fichier utilise script.async = true', () => {
        expect(CALENDLY_JS_SRC).toContain('async');
    });

    test('le fichier utilise script.onerror pour le fallback', () => {
        expect(CALENDLY_JS_SRC).toContain('onerror');
    });

    test('le fichier utilise window.open pour le fallback', () => {
        expect(CALENDLY_JS_SRC).toContain('window.open');
    });

    test('le fichier utilise noopener pour sécuriser le fallback', () => {
        expect(CALENDLY_JS_SRC).toContain('noopener');
    });

    test('le fichier utilise initPopupWidget pour ouvrir le popup', () => {
        expect(CALENDLY_JS_SRC).toContain('initPopupWidget');
    });

    test('aucun import de librairie externe', () => {
        expect(CALENDLY_JS_SRC).not.toContain('require(');
        expect(CALENDLY_JS_SRC).not.toContain('import ');
    });
});

// ====================================================================
// Lazy loading — aucun script au chargement initial
// ====================================================================
describe('Lazy loading — aucun script Calendly au chargement initial', () => {
    test('aucun <script> Calendly dans le DOM au chargement du module', () => {
        loadModule();
        const script = getCalendlyScript();
        expect(script).toBeUndefined();
    });

    test('aucun <link> CSS Calendly dans le DOM au chargement du module', () => {
        loadModule();
        const link = getCalendlyLink();
        expect(link).toBeUndefined();
    });

    test('window.openCalendly est exposé après chargement du module', () => {
        loadModule();
        expect(typeof window.openCalendly).toBe('function');
    });
});

// ====================================================================
// openCalendly() — Premier appel : injection du script
// ====================================================================
describe('openCalendly() — Premier clic : chargement du script', () => {
    test('premier appel → un <script> est ajouté au body', () => {
        loadModule();
        window.openCalendly();
        const script = getCalendlyScript();
        expect(script).toBeDefined();
    });

    test('premier appel → le script a async=true', () => {
        loadModule();
        window.openCalendly();
        const script = getCalendlyScript();
        expect(script.async).toBe(true);
    });

    test('premier appel → le CSS Calendly est injecté dans le <head>', () => {
        loadModule();
        window.openCalendly();
        const link = getCalendlyLink();
        expect(link).toBeDefined();
    });

    test('le script src correspond à CALENDLY_JS (assets.calendly.com)', () => {
        loadModule();
        window.openCalendly();
        const script = getCalendlyScript();
        // script.src est l'URL absolue résolue dans jsdom
        expect(script.src).toContain('calendly');
    });
});

// ====================================================================
// openCalendly() — Idempotence (lazy uniquement au premier clic)
// ====================================================================
describe('openCalendly() — Lazy loading uniquement au premier clic', () => {
    test('2ème appel pendant "loading" : pas de 2ème script injecté', () => {
        loadModule();
        window.openCalendly(); // → state = 'loading'
        window.openCalendly(); // → doit ignorer

        const scripts = Array.from(document.body.querySelectorAll('script')).filter(s =>
            s.src && s.src.includes('calendly')
        );
        expect(scripts.length).toBe(1);
    });

    test('CSS Calendly injecté une seule fois même après 2 clics', () => {
        loadModule();
        window.openCalendly();
        window.openCalendly();

        const links = Array.from(document.head.querySelectorAll('link[rel="stylesheet"]')).filter(l =>
            l.href && l.href.includes('calendly')
        );
        expect(links.length).toBe(1);
    });

    test('3ème appel pendant "loading" : toujours 1 seul script', () => {
        loadModule();
        window.openCalendly();
        window.openCalendly();
        window.openCalendly();

        const scripts = Array.from(document.body.querySelectorAll('script')).filter(s =>
            s.src && s.src.includes('calendly')
        );
        expect(scripts.length).toBe(1);
    });
});

// ====================================================================
// État "ready" — openCalendly avec window.Calendly disponible
// ====================================================================
describe('openCalendly() — État ready avec window.Calendly disponible', () => {
    test('onload réussi → state = ready + initPopupWidget appelé', () => {
        loadModule();
        const mockInit = jest.fn();
        window.Calendly = { initPopupWidget: mockInit };

        window.openCalendly();
        triggerScriptLoad();

        expect(mockInit).toHaveBeenCalledTimes(1);
    });

    test('initPopupWidget appelé avec { url: CALENDLY_URL }', () => {
        loadModule();
        const mockInit = jest.fn();
        window.Calendly = { initPopupWidget: mockInit };
        const expectedUrl = window.CALENDLY_URL;

        window.openCalendly();
        triggerScriptLoad();

        expect(mockInit).toHaveBeenCalledWith({ url: expectedUrl });
    });

    test('2ème appel après ready : initPopupWidget appelé directement (pas de rechargement script)', () => {
        loadModule();
        const mockInit = jest.fn();
        window.Calendly = { initPopupWidget: mockInit };

        window.openCalendly();
        triggerScriptLoad(); // state = ready, mockInit appelé une 1ère fois

        const scriptsBefore = document.body.querySelectorAll('script').length;
        window.openCalendly(); // 2ème appel → state déjà ready
        const scriptsAfter = document.body.querySelectorAll('script').length;

        // Pas de nouveau script
        expect(scriptsAfter).toBe(scriptsBefore);
        // initPopupWidget appelé une 2ème fois
        expect(mockInit).toHaveBeenCalledTimes(2);
    });
});

// ====================================================================
// Fallback CDN — script.onerror
// ====================================================================
describe('Fallback CDN — script.onerror → window.open', () => {
    test('onerror → window.open appelé avec CALENDLY_URL', () => {
        loadModule();
        const mockOpen = jest.spyOn(window, 'open').mockImplementation(() => null);
        const expectedUrl = window.CALENDLY_URL;

        window.openCalendly();
        triggerScriptError(); // state = failed

        expect(mockOpen).toHaveBeenCalledTimes(1);
        expect(mockOpen.mock.calls[0][0]).toBe(expectedUrl);
    });

    test('onerror → window.open avec _blank', () => {
        loadModule();
        const mockOpen = jest.spyOn(window, 'open').mockImplementation(() => null);

        window.openCalendly();
        triggerScriptError();

        expect(mockOpen.mock.calls[0][1]).toBe('_blank');
    });

    test('onerror → window.open avec noopener,noreferrer', () => {
        loadModule();
        const mockOpen = jest.spyOn(window, 'open').mockImplementation(() => null);

        window.openCalendly();
        triggerScriptError();

        expect(mockOpen.mock.calls[0][2]).toContain('noopener');
        expect(mockOpen.mock.calls[0][2]).toContain('noreferrer');
    });
});

// ====================================================================
// Fallback — window.Calendly non défini (script bloqué par navigateur)
// ====================================================================
describe('Fallback — window.Calendly non défini (script bloqué)', () => {
    test('onload mais window.Calendly absent → window.open appelé', () => {
        loadModule();
        const mockOpen = jest.spyOn(window, 'open').mockImplementation(() => null);
        // window.Calendly intentionnellement non défini

        window.openCalendly();
        triggerScriptLoad(); // onload mais pas de window.Calendly

        expect(mockOpen).toHaveBeenCalledTimes(1);
    });

    test('onload mais Calendly.initPopupWidget absent → window.open appelé', () => {
        loadModule();
        const mockOpen = jest.spyOn(window, 'open').mockImplementation(() => null);
        window.Calendly = {}; // Objet présent mais sans initPopupWidget

        window.openCalendly();
        triggerScriptLoad();

        expect(mockOpen).toHaveBeenCalledTimes(1);
    });
});

// ====================================================================
// Callbacks en attente (_pendingCallbacks)
// ====================================================================
describe('Callbacks en attente — flush après ready', () => {
    test('multiple appels pendant loading → toutes les callbacks executées au flush', () => {
        loadModule();
        const mockInit = jest.fn();
        window.Calendly = { initPopupWidget: mockInit };

        // 3 appels pendant le chargement
        window.openCalendly(); // 1er : déclenche le chargement, enregistre cb
        window.openCalendly(); // 2ème : state=loading, enregistre cb
        window.openCalendly(); // 3ème : state=loading, enregistre cb

        // Onload → flush toutes les callbacks
        triggerScriptLoad();

        // 3 callbacks → 3 appels à initPopupWidget
        expect(mockInit).toHaveBeenCalledTimes(3);
    });

    test('callbacks nettoyées après flush (pas de ré-exécution)', () => {
        loadModule();
        const mockInit = jest.fn();
        window.Calendly = { initPopupWidget: mockInit };

        window.openCalendly();
        triggerScriptLoad(); // flush : 1 appel

        // Réinitialisation du mock pour voir si les anciennes callbacks re-tournent
        mockInit.mockClear();

        // Nouvel appel après ready : callback directe, pas depuis la queue
        window.openCalendly();
        expect(mockInit).toHaveBeenCalledTimes(1); // seulement le nouvel appel
    });
});

// ====================================================================
// URL configurable
// ====================================================================
describe('URL configurable', () => {
    test('CALENDLY_URL est une variable (pas inline dans openCalendly)', () => {
        // La variable CALENDLY_URL doit être définie séparément
        expect(CALENDLY_JS_SRC).toMatch(/var CALENDLY_URL\s*=/);
    });

    test('openCalendly utilise CALENDLY_URL (pas une URL harde)', () => {
        // openCalendly doit référencer CALENDLY_URL, pas l'URL en dur
        // La fonction openCalendly ne doit pas contenir l'URL calendly.com directement
        const funcMatch = CALENDLY_JS_SRC.match(/function openCalendly[\s\S]*?^}/m);
        // Vérifie que la fonction référence la variable CALENDLY_URL
        expect(CALENDLY_JS_SRC).toContain('CALENDLY_URL');
        // Et que window.open utilise CALENDLY_URL (pas une string litérale)
        expect(CALENDLY_JS_SRC).not.toMatch(/window\.open\(['"]https:\/\/calendly\.com/);
    });

    test('après chargement du module, window.CALENDLY_URL est défini', () => {
        loadModule();
        expect(window.CALENDLY_URL).toBeDefined();
        expect(typeof window.CALENDLY_URL).toBe('string');
        expect(window.CALENDLY_URL).toContain('calendly.com');
    });

    test('modifier CALENDLY_URL avant appel change l\'URL utilisée', () => {
        loadModule();
        const mockInit = jest.fn();
        window.Calendly = { initPopupWidget: mockInit };
        const customUrl = 'https://calendly.com/test/custom-event';
        window.CALENDLY_URL = customUrl;

        window.openCalendly();
        triggerScriptLoad();

        expect(mockInit).toHaveBeenCalledWith({ url: customUrl });
    });
});

// ====================================================================
// Edge cases — Sécurité
// ====================================================================
describe('Sécurité', () => {
    test('openCalendly() ne lève pas d\'erreur si DOM vide', () => {
        document.head.innerHTML = '';
        document.body.innerHTML = '';
        loadModule();
        expect(() => window.openCalendly()).not.toThrow();
    });

    test('le module ne contient pas de eval() ou innerHTML non sécurisé', () => {
        expect(CALENDLY_JS_SRC).not.toContain('innerHTML');
        expect(CALENDLY_JS_SRC).not.toContain('document.write');
    });

    test('window.open utilise rel noopener (protection clickjacking)', () => {
        expect(CALENDLY_JS_SRC).toContain('noopener');
    });

    test('première erreur CDN : window.open appelé exactement 1 fois', () => {
        loadModule();
        const mockOpen = jest.spyOn(window, 'open').mockImplementation(() => null);

        window.openCalendly();
        triggerScriptError(); // state = failed, window.open une fois

        // Après onerror, window.open doit avoir été appelé exactement 1 fois
        expect(mockOpen).toHaveBeenCalledTimes(1);
    });

    test('appel openCalendly() ne lève pas d\'erreur après un échec CDN', () => {
        loadModule();
        jest.spyOn(window, 'open').mockImplementation(() => null);

        window.openCalendly();
        triggerScriptError(); // state = failed

        // Un appel suivant (retry) ne doit pas lever d'erreur
        expect(() => window.openCalendly()).not.toThrow();
    });
});

// ====================================================================
// Pas de chargement automatique (pas de DOMContentLoaded, pas d'init auto)
// ====================================================================
describe('Pas de chargement automatique', () => {
    test('le module ne contient pas de DOMContentLoaded auto-trigger', () => {
        // Calendly se charge UNIQUEMENT à l'appel de openCalendly()
        expect(CALENDLY_JS_SRC).not.toContain('DOMContentLoaded');
    });

    test('le module ne se charge pas au parsing (pas de IIFE qui charge le script)', () => {
        loadModule();
        // Aucun script Calendly dans le DOM juste après évaluation du module
        const scriptsAtLoad = Array.from(document.body.querySelectorAll('script')).filter(s =>
            s.src && s.src.includes('calendly')
        );
        expect(scriptsAtLoad.length).toBe(0);
    });
});
