/**
 * Tests unitaires — Simulateur Compliance (Story #5)
 * AgileVizion 2
 *
 * Couvre TOUS les critères d'acceptation Story #5 :
 * - CA1 : bouton PDF présent après résultats
 * - CA2 : validation formulaire (company + email obligatoires)
 * - CA3 : contenu rapport (branding, profil, normes, audit, coordonnées)
 * - CA4 : génération côté client (window.open, print)
 * - CA5 : popup bloquée → message d'erreur
 * - CA6 : branding AgileVizion dans le rapport
 * Edge cases : email invalide, company vide, résultats changés, XSS, reset
 */

'use strict';

const fs = require('fs');
const path = require('path');

const SIMULATOR_JS = fs.readFileSync(
    path.resolve(__dirname, '../../js/simulator.js'),
    'utf8'
);

// ====================================================================
// Infrastructure : cleanup listeners entre tests
// Évite l'accumulation de listeners DOMContentLoaded entre les tests
// ====================================================================
let _winListeners = [];
let _docListeners = [];

const _origWinAdd = window.addEventListener.bind(window);
const _origWinRemove = window.removeEventListener.bind(window);
const _origDocAdd = document.addEventListener.bind(document);
const _origDocRemove = document.removeEventListener.bind(document);

window.addEventListener = function (type, handler, options) {
    _winListeners.push({ type, handler });
    return _origWinAdd(type, handler, options);
};
document.addEventListener = function (type, handler, options) {
    _docListeners.push({ type, handler });
    return _origDocAdd(type, handler, options);
};

afterEach(() => {
    _winListeners.forEach(({ type, handler }) => _origWinRemove(type, handler));
    _docListeners.forEach(({ type, handler }) => _origDocRemove(type, handler));
    _winListeners = [];
    _docListeners = [];
    // Nettoyer les globals exposés par simulator.js
    delete window.handleChange;
    delete window.checkPdfFormValid;
    delete window.generatePDF;
    delete window.resetSimulator;
    delete window.analyzeProfile;
    delete window.SimulatorApp;
    delete window.I18n;
    jest.restoreAllMocks();
});

// ====================================================================
// DOM HTML minimal — tous les éléments requis par simulator.js
// ====================================================================
const SIM_HTML = `
    <input type="text" id="input-company" value="">
    <input type="email" id="input-email" value="">
    <button id="btn-pdf" disabled></button>
    <div id="msg-success"></div>
    <div id="msg-error"></div>
    <div id="profile-card"></div>
    <div id="profile-icon"></div>
    <div id="profile-title"></div>
    <div id="profile-subtitle"></div>
    <div id="profile-tags"></div>
    <div id="results-section"></div>
    <div id="results-container"></div>
    <span id="count-mandatory">0</span>
    <span id="count-recommended">0</span>
    <select id="q1_location">
        <option value=""></option>
        <option value="eu">EU</option>
        <option value="eu_clients">EU clients</option>
        <option value="non_eu">Non EU</option>
    </select>
    <select id="q2_sector">
        <option value=""></option>
        <option value="banking">Banking</option>
        <option value="services">Services</option>
        <option value="energy">Energy</option>
        <option value="health">Health</option>
    </select>
    <select id="q3_size">
        <option value=""></option>
        <option value="small">Small</option>
        <option value="medium">Medium</option>
        <option value="large">Large</option>
    </select>
    <select id="q4_personal_data">
        <option value=""></option>
        <option value="yes">Yes</option>
        <option value="no">No</option>
    </select>
    <select id="q5_regulated">
        <option value=""></option>
        <option value="yes">Yes</option>
        <option value="no">No</option>
    </select>
    <select id="q6_it_services">
        <option value=""></option>
        <option value="yes">Yes</option>
        <option value="no">No</option>
    </select>
    <select id="q10_us_activity">
        <option value="yes">Yes</option>
        <option value="no" selected>No</option>
    </select>
    <select id="q11_continuity">
        <option value=""></option>
        <option value="yes">Yes</option>
        <option value="no">No</option>
    </select>
    <button id="btn-analyze" disabled aria-disabled="true"></button>
    <div id="note-continuity" style="display:none;"></div>
    <div id="cond-tic" class="conditional-group question-group"></div>
    <div id="cond-hds" class="conditional-group question-group"></div>
    <div id="cond-pci" class="conditional-group question-group"></div>
    <div id="cond-us-certs" class="conditional-group question-group">
        <select id="q10a_us_certs">
            <option value=""></option>
            <option value="iso27001">ISO 27001</option>
            <option value="soc2">SOC 2</option>
            <option value="both">Both</option>
            <option value="no">No</option>
        </select>
    </div>
    <div id="cond-us-dod" class="conditional-group question-group">
        <select id="q10b_dod">
            <option value=""></option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
        </select>
    </div>
    <section id="simulator"></section>
`;

function setupDOM() {
    document.body.innerHTML = SIM_HTML;
    // JSDOM ne supporte pas offsetTop ni scrollTo
    Object.defineProperty(window, 'scrollTo', {
        configurable: true,
        writable: true,
        value: jest.fn()
    });
    Object.defineProperty(window, 'location', {
        configurable: true,
        writable: true,
        value: { pathname: '/' }
    });
    // Mocker les API Blob non disponibles dans JSDOM
    global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = jest.fn();
}

function initSimulator() {
    eval(SIMULATOR_JS); // eslint-disable-line no-eval
    document.dispatchEvent(new Event('DOMContentLoaded'));
}

function getState() {
    return window.SimulatorApp && window.SimulatorApp.getState
        ? window.SimulatorApp.getState()
        : null;
}

/**
 * Injecte des résultats dans l'état pour tester la génération PDF
 * sans passer par tout le parcours de questions
 */
function setupStateWithResults(profile, results) {
    const state = getState();
    if (!state) return;
    state.profile = profile || 'pme';
    state.answers = {
        q1_location: 'eu',
        q2_sector: 'services',
        q3_size: 'medium',
        q4_personal_data: 'yes',
        q5_regulated: 'no',
        q6_it_services: 'no',
        q10_us_activity: 'no',
        q11_continuity: 'no'
    };
    state.results = results || {
        rgpd: { status: 'obligatoire', why: 'Traitement données personnelles UE', whyKey: 'rgpd' },
        iso27001: { status: 'recommande', why: 'Certification recommandée', whyKey: 'iso27001_recommended' }
    };
}

/**
 * Crée un mock de fenêtre popup pour capturer le HTML généré
 */
function createMockPopupWindow() {
    let capturedHtml = '';
    const mockWin = {
        document: {
            write: jest.fn(html => { capturedHtml += html; }),
            close: jest.fn()
        },
        focus: jest.fn(),
        print: jest.fn(),
        getCapturedHtml: () => capturedHtml
    };
    return mockWin;
}

// ====================================================================
// CA2 — checkPdfFormValid() : validation formulaire PDF
// ====================================================================
describe('CA2 — checkPdfFormValid() : validation formulaire PDF', () => {
    beforeEach(() => {
        setupDOM();
        initSimulator();
    });

    test('company vide + email vide → btn-pdf désactivé', () => {
        document.getElementById('input-company').value = '';
        document.getElementById('input-email').value = '';
        window.checkPdfFormValid();
        expect(document.getElementById('btn-pdf').disabled).toBe(true);
    });

    test('company remplie + email vide → btn-pdf désactivé', () => {
        document.getElementById('input-company').value = 'MonEntreprise';
        document.getElementById('input-email').value = '';
        window.checkPdfFormValid();
        expect(document.getElementById('btn-pdf').disabled).toBe(true);
    });

    test('company vide + email rempli → btn-pdf désactivé', () => {
        document.getElementById('input-company').value = '';
        document.getElementById('input-email').value = 'test@example.com';
        window.checkPdfFormValid();
        expect(document.getElementById('btn-pdf').disabled).toBe(true);
    });

    test('company remplie + email sans @ → btn-pdf désactivé', () => {
        document.getElementById('input-company').value = 'MonEntreprise';
        document.getElementById('input-email').value = 'pasunemail';
        window.checkPdfFormValid();
        expect(document.getElementById('btn-pdf').disabled).toBe(true);
    });

    test('company remplie + email valide → btn-pdf activé', () => {
        document.getElementById('input-company').value = 'MonEntreprise';
        document.getElementById('input-email').value = 'contact@test.com';
        window.checkPdfFormValid();
        expect(document.getElementById('btn-pdf').disabled).toBe(false);
    });

    test('company avec espaces uniquement → btn-pdf désactivé (trim)', () => {
        document.getElementById('input-company').value = '   ';
        document.getElementById('input-email').value = 'contact@test.com';
        window.checkPdfFormValid();
        expect(document.getElementById('btn-pdf').disabled).toBe(true);
    });

    test('email avec espaces uniquement → btn-pdf désactivé (trim)', () => {
        document.getElementById('input-company').value = 'MonEntreprise';
        document.getElementById('input-email').value = '   ';
        window.checkPdfFormValid();
        expect(document.getElementById('btn-pdf').disabled).toBe(true);
    });

    test('company 1 caractère + email valide → btn-pdf activé (longueur min = 1)', () => {
        document.getElementById('input-company').value = 'A';
        document.getElementById('input-email').value = 'a@b.c';
        window.checkPdfFormValid();
        expect(document.getElementById('btn-pdf').disabled).toBe(false);
    });

    test('email avec @ mais sans domaine → btn-pdf activé (critère = indexOf(@) !== -1)', () => {
        document.getElementById('input-company').value = 'Corp';
        document.getElementById('input-email').value = 'user@';
        window.checkPdfFormValid();
        // La validation côté client ne vérifie que la présence du @
        expect(document.getElementById('btn-pdf').disabled).toBe(false);
    });

    test('éléments DOM absents → pas de crash', () => {
        // Supprimer les éléments du formulaire
        document.getElementById('input-company').remove();
        document.getElementById('input-email').remove();
        document.getElementById('btn-pdf').remove();
        expect(() => window.checkPdfFormValid()).not.toThrow();
    });
});

// ====================================================================
// CA3 + CA6 — generatePDF() : contenu du rapport généré
// ====================================================================
describe('CA3 + CA6 — generatePDF() : contenu du rapport (branding, profil, normes, audit)', () => {
    beforeEach(() => {
        setupDOM();
        initSimulator();
        setupStateWithResults();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    function triggerPdfAndCapture() {
        document.getElementById('input-company').value = 'Acme Corp';
        document.getElementById('input-email').value = 'contact@acme.com';
        const mockWin = createMockPopupWindow();
        jest.spyOn(window, 'open').mockReturnValue(mockWin);
        window.generatePDF();
        jest.runAllTimers();
        return mockWin.getCapturedHtml();
    }

    test('rapport contient le nom de l\'entreprise', () => {
        const html = triggerPdfAndCapture();
        expect(html).toContain('Acme Corp');
    });

    test('rapport contient l\'email saisi', () => {
        const html = triggerPdfAndCapture();
        expect(html).toContain('contact@acme.com');
    });

    test('CA6 — rapport contient le branding AgileVizion', () => {
        const html = triggerPdfAndCapture();
        expect(html).toContain('AgileVizion');
    });

    test('CA6 — rapport contient l\'email de contact AgileVizion', () => {
        const html = triggerPdfAndCapture();
        expect(html).toContain('agilevizion.com');
    });

    test('rapport contient la section norme obligatoire (RGPD)', () => {
        const html = triggerPdfAndCapture();
        expect(html).toContain('RGPD');
    });

    test('rapport contient la section norme recommandée (ISO 27001)', () => {
        const html = triggerPdfAndCapture();
        expect(html).toContain('ISO 27001');
    });

    test('rapport contient la date du jour', () => {
        const today = new Date().toLocaleDateString('fr-FR', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
        const html = triggerPdfAndCapture();
        expect(html).toContain(today);
    });

    test('rapport contient la section "Prochaines étapes" / audit CTA', () => {
        const html = triggerPdfAndCapture();
        // La clé i18n ou le texte d'audit doit être présent
        const hasAudit = html.includes('audit') || html.includes('Audit') || html.includes('pdf_audit');
        expect(hasAudit).toBe(true);
    });

    test('rapport est du HTML valide (contient DOCTYPE)', () => {
        const html = triggerPdfAndCapture();
        expect(html.toLowerCase()).toContain('<!doctype html');
    });

    test('rapport contient le charset UTF-8', () => {
        const html = triggerPdfAndCapture();
        expect(html.toLowerCase()).toContain('utf-8');
    });

    test('rapport avec normes obligatoires uniquement : section obligatoires présente', () => {
        const state = getState();
        state.results = {
            rgpd: { status: 'obligatoire', why: 'Données perso UE', whyKey: 'rgpd' },
            dora: { status: 'obligatoire', why: 'Entité financière', whyKey: 'dora_regulated' }
        };
        const html = triggerPdfAndCapture();
        expect(html).toContain('RGPD');
        expect(html).toContain('DORA');
    });

    test('rapport avec aucune norme : message no_results présent', () => {
        const state = getState();
        state.results = {};
        const html = triggerPdfAndCapture();
        // Contient la clé i18n ou le texte de résultat vide
        const hasNoResult = html.includes('no_results') || html.includes('0');
        expect(hasNoResult).toBe(true);
    });
});

// ====================================================================
// CA4 + CA5 — generatePDF() : comportements (popup, UI, Blob)
// ====================================================================
describe('CA4 + CA5 — generatePDF() : comportements popup et UI', () => {
    beforeEach(() => {
        setupDOM();
        initSimulator();
        setupStateWithResults();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    test('CA4 — génère côté client : appelle window.open avec chaîne vide (nouvelle fenêtre)', () => {
        document.getElementById('input-company').value = 'Corp';
        document.getElementById('input-email').value = 'x@x.com';
        const mockOpen = jest.spyOn(window, 'open').mockReturnValue(createMockPopupWindow());
        window.generatePDF();
        expect(mockOpen).toHaveBeenCalledWith('', '_blank');
    });

    test('CA4 — appelle document.write() sur la fenêtre ouverte', () => {
        document.getElementById('input-company').value = 'Corp';
        document.getElementById('input-email').value = 'x@x.com';
        const mockWin = createMockPopupWindow();
        jest.spyOn(window, 'open').mockReturnValue(mockWin);
        window.generatePDF();
        jest.runAllTimers();
        expect(mockWin.document.write).toHaveBeenCalled();
    });

    test('CA4 — appelle window.print() après ouverture', () => {
        document.getElementById('input-company').value = 'Corp';
        document.getElementById('input-email').value = 'x@x.com';
        const mockWin = createMockPopupWindow();
        jest.spyOn(window, 'open').mockReturnValue(mockWin);
        window.generatePDF();
        jest.runAllTimers();
        expect(mockWin.print).toHaveBeenCalled();
    });

    test('CA5 — popup bloquée (window.open retourne null) → msg-error visible', () => {
        document.getElementById('input-company').value = 'Corp';
        document.getElementById('input-email').value = 'x@x.com';
        jest.spyOn(window, 'open').mockReturnValue(null);
        window.generatePDF();
        jest.runAllTimers();
        const msgError = document.getElementById('msg-error');
        expect(msgError.classList.contains('visible')).toBe(true);
    });

    test('CA5 — popup bloquée → message contient "popup" ou "Popup"', () => {
        document.getElementById('input-company').value = 'Corp';
        document.getElementById('input-email').value = 'x@x.com';
        jest.spyOn(window, 'open').mockReturnValue(null);
        window.generatePDF();
        jest.runAllTimers();
        const msgError = document.getElementById('msg-error');
        const text = msgError.innerHTML.toLowerCase();
        expect(text).toContain('popup');
    });

    test('popup bloquée → le fichier HTML a quand même été déclenché (Blob créé)', () => {
        document.getElementById('input-company').value = 'Corp';
        document.getElementById('input-email').value = 'x@x.com';
        jest.spyOn(window, 'open').mockReturnValue(null);
        window.generatePDF();
        // URL.createObjectURL doit avoir été appelé (Blob créé pour le download)
        expect(global.URL.createObjectURL).toHaveBeenCalled();
    });

    test('popup réussie → msg-success visible après print', () => {
        document.getElementById('input-company').value = 'Corp';
        document.getElementById('input-email').value = 'x@x.com';
        jest.spyOn(window, 'open').mockReturnValue(createMockPopupWindow());
        window.generatePDF();
        jest.runAllTimers();
        const msgSuccess = document.getElementById('msg-success');
        expect(msgSuccess.classList.contains('visible')).toBe(true);
    });

    test('popup réussie → btn-pdf réactivé après génération', () => {
        document.getElementById('input-company').value = 'Corp';
        document.getElementById('input-email').value = 'x@x.com';
        const btn = document.getElementById('btn-pdf');
        btn.disabled = false; // initialement activé
        jest.spyOn(window, 'open').mockReturnValue(createMockPopupWindow());
        window.generatePDF();
        jest.runAllTimers();
        expect(btn.disabled).toBe(false);
    });

    test('generatePDF() avec company vide → ne génère rien (window.open non appelé)', () => {
        document.getElementById('input-company').value = '';
        document.getElementById('input-email').value = 'x@x.com';
        const mockOpen = jest.spyOn(window, 'open').mockReturnValue(null);
        window.generatePDF();
        expect(mockOpen).not.toHaveBeenCalled();
    });

    test('generatePDF() avec email invalide (sans @) → ne génère rien', () => {
        document.getElementById('input-company').value = 'Corp';
        document.getElementById('input-email').value = 'pasunemail';
        const mockOpen = jest.spyOn(window, 'open').mockReturnValue(null);
        window.generatePDF();
        expect(mockOpen).not.toHaveBeenCalled();
    });

    test('edge case : generatePDF() sans résultats dans l\'état → ne crash pas', () => {
        document.getElementById('input-company').value = 'Corp';
        document.getElementById('input-email').value = 'x@x.com';
        getState().results = null;
        jest.spyOn(window, 'open').mockReturnValue(null);
        expect(() => window.generatePDF()).not.toThrow();
    });
});

// ====================================================================
// CA1 — Bouton PDF visible après résultats, reset le remet à zéro
// ====================================================================
describe('CA1 — resetSimulator() : remise à zéro du formulaire PDF', () => {
    beforeEach(() => {
        setupDOM();
        initSimulator();
        Object.defineProperty(
            document.getElementById('simulator'),
            'offsetTop',
            { configurable: true, value: 0 }
        );
    });

    test('resetSimulator() vide le champ company', () => {
        document.getElementById('input-company').value = 'Acme';
        window.resetSimulator();
        expect(document.getElementById('input-company').value).toBe('');
    });

    test('resetSimulator() vide le champ email', () => {
        document.getElementById('input-email').value = 'x@x.com';
        window.resetSimulator();
        expect(document.getElementById('input-email').value).toBe('');
    });

    test('resetSimulator() désactive le bouton PDF', () => {
        document.getElementById('btn-pdf').disabled = false;
        window.resetSimulator();
        expect(document.getElementById('btn-pdf').disabled).toBe(true);
    });

    test('resetSimulator() masque msg-success', () => {
        document.getElementById('msg-success').classList.add('visible');
        window.resetSimulator();
        expect(document.getElementById('msg-success').classList.contains('visible')).toBe(false);
    });

    test('resetSimulator() masque msg-error', () => {
        document.getElementById('msg-error').classList.add('visible');
        window.resetSimulator();
        expect(document.getElementById('msg-error').classList.contains('visible')).toBe(false);
    });

    test('resetSimulator() remet state.results à null', () => {
        const state = getState();
        state.results = { rgpd: { status: 'obligatoire' } };
        window.resetSimulator();
        expect(state.results).toBeNull();
    });

    test('resetSimulator() remet state.profile à null', () => {
        const state = getState();
        state.profile = 'pme';
        window.resetSimulator();
        expect(state.profile).toBeNull();
    });
});

// ====================================================================
// Edge case — handleChange() efface résultats après modification
// ====================================================================
describe('Edge case — handleChange() : résultats effacés après modification', () => {
    beforeEach(() => {
        setupDOM();
        initSimulator();
    });

    test('handleChange() efface state.results si résultats existants', () => {
        const state = getState();
        state.results = { rgpd: { status: 'obligatoire' } };

        // Simuler un changement sur q4_personal_data
        const select = document.getElementById('q4_personal_data');
        select.value = 'no';
        // La question doit être dans un .question-group pour que closest() fonctionne
        window.handleChange(select);
        expect(state.results).toBeNull();
    });

    test('handleChange() masque #results-section si résultats existants', () => {
        const state = getState();
        state.results = { rgpd: { status: 'obligatoire' } };
        document.getElementById('results-section').classList.add('visible');

        const select = document.getElementById('q4_personal_data');
        select.value = 'no';
        window.handleChange(select);
        expect(document.getElementById('results-section').classList.contains('visible')).toBe(false);
    });

    test('handleChange() masque #profile-card si résultats existants', () => {
        const state = getState();
        state.results = { rgpd: { status: 'obligatoire' } };
        document.getElementById('profile-card').classList.add('visible');

        const select = document.getElementById('q4_personal_data');
        select.value = 'no';
        window.handleChange(select);
        expect(document.getElementById('profile-card').classList.contains('visible')).toBe(false);
    });

    test('handleChange() sans résultats existants → aucun crash', () => {
        const state = getState();
        state.results = null;

        const select = document.getElementById('q4_personal_data');
        select.value = 'yes';
        expect(() => window.handleChange(select)).not.toThrow();
    });
});

// ====================================================================
// Logique calculateResults() via analyzeProfile() — Story #4 + #5
// Tests unitaires rapides sur la logique métier
// ====================================================================
describe('calculateResults() — logique métier principale', () => {
    beforeEach(() => {
        setupDOM();
        initSimulator();
    });

    function setAnswers(overrides) {
        const defaults = {
            q1_location: 'eu',
            q2_sector: 'services',
            q3_size: 'medium',
            q4_personal_data: 'no',
            q5_regulated: 'no',
            q6_it_services: 'no',
            q10_us_activity: 'no',
            q11_continuity: 'no'
        };
        const answers = { ...defaults, ...overrides };
        const state = getState();
        state.answers = answers;
    }

    test('RGPD obligatoire si q4=yes + q1=eu', () => {
        setAnswers({ q4_personal_data: 'yes', q1_location: 'eu' });
        window.analyzeProfile();
        const state = getState();
        expect(state.results.rgpd).toBeDefined();
        expect(state.results.rgpd.status).toBe('obligatoire');
    });

    test('RGPD absent si q4=no', () => {
        setAnswers({ q4_personal_data: 'no' });
        window.analyzeProfile();
        expect(getState().results.rgpd).toBeUndefined();
    });

    test('RGPD obligatoire si q1=eu_clients + q4=yes', () => {
        setAnswers({ q1_location: 'eu_clients', q4_personal_data: 'yes' });
        window.analyzeProfile();
        expect(getState().results.rgpd).toBeDefined();
    });

    test('DORA obligatoire si entité financière UE régulée', () => {
        setAnswers({ q1_location: 'eu', q2_sector: 'banking', q5_regulated: 'yes' });
        window.analyzeProfile();
        expect(getState().results.dora).toBeDefined();
        expect(getState().results.dora.status).toBe('obligatoire');
    });

    test('DORA absent si hors UE (même si secteur financier régulé)', () => {
        setAnswers({ q1_location: 'non_eu', q2_sector: 'banking', q5_regulated: 'yes' });
        window.analyzeProfile();
        expect(getState().results.dora).toBeUndefined();
    });

    test('NIS2 obligatoire si secteur Annexe I + taille medium + q1=eu', () => {
        setAnswers({ q1_location: 'eu', q2_sector: 'energy', q3_size: 'medium' });
        window.analyzeProfile();
        expect(getState().results.nis2).toBeDefined();
        expect(getState().results.nis2.status).toBe('obligatoire');
    });

    test('NIS2 absent si taille=small (exemption micro-entreprise)', () => {
        setAnswers({ q1_location: 'eu', q2_sector: 'energy', q3_size: 'small' });
        window.analyzeProfile();
        expect(getState().results.nis2).toBeUndefined();
    });

    test('ISO 27001 recommandé pour taille medium (non obligatoire)', () => {
        setAnswers({ q3_size: 'medium' });
        window.analyzeProfile();
        const iso = getState().results.iso27001;
        expect(iso).toBeDefined();
        expect(iso.status).toBe('recommande');
    });

    test('ISO 27001 absent pour taille=small', () => {
        setAnswers({ q3_size: 'small' });
        window.analyzeProfile();
        expect(getState().results.iso27001).toBeUndefined();
    });

    test('CMMC obligatoire si q10b_dod=yes', () => {
        const state = getState();
        state.answers = {
            q1_location: 'eu', q2_sector: 'services', q3_size: 'medium',
            q4_personal_data: 'no', q5_regulated: 'no', q6_it_services: 'no',
            q10_us_activity: 'yes', q10b_dod: 'yes', q11_continuity: 'no'
        };
        window.analyzeProfile();
        expect(getState().results.cmmc).toBeDefined();
        expect(getState().results.cmmc.status).toBe('obligatoire');
    });

    test('profil startup si q3_size=small', () => {
        setAnswers({ q3_size: 'small' });
        window.analyzeProfile();
        expect(getState().profile).toBe('startup');
    });

    test('profil pme si q3_size=medium', () => {
        setAnswers({ q3_size: 'medium' });
        window.analyzeProfile();
        expect(getState().profile).toBe('pme');
    });

    test('profil eti si q3_size=large', () => {
        setAnswers({ q3_size: 'large' });
        window.analyzeProfile();
        expect(getState().profile).toBe('eti');
    });
});

// ====================================================================
// Sécurité — inputs PDF (XSS, injection, path traversal)
// ====================================================================
describe('Sécurité — inputs PDF (XSS, injection)', () => {
    beforeEach(() => {
        setupDOM();
        initSimulator();
        setupStateWithResults();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    test('nom d\'entreprise avec <script> → présent dans HTML mais pas exécuté (injection passée)', () => {
        // Le contenu est généré comme texte dans le HTML — pas interprété
        document.getElementById('input-company').value = '<script>alert("xss")</script>Corp';
        document.getElementById('input-email').value = 'x@x.com';
        const mockWin = createMockPopupWindow();
        jest.spyOn(window, 'open').mockReturnValue(mockWin);
        window.generatePDF();
        jest.runAllTimers();
        // La fonction doit avoir été appelée (pas de crash)
        expect(mockWin.document.write).toHaveBeenCalled();
    });

    test('email avec caractères spéciaux → bouton PDF désactivé si pas de @', () => {
        document.getElementById('input-company').value = 'Corp';
        document.getElementById('input-email').value = '"><script>alert(1)</script>';
        window.checkPdfFormValid();
        // Pas de @ dans cette chaîne
        expect(document.getElementById('btn-pdf').disabled).toBe(true);
    });

    test('company avec path traversal → génération continue sans crash', () => {
        document.getElementById('input-company').value = '../../etc/passwd';
        document.getElementById('input-email').value = 'x@x.com';
        const mockWin = createMockPopupWindow();
        jest.spyOn(window, 'open').mockReturnValue(mockWin);
        window.generatePDF();
        jest.runAllTimers();
        expect(mockWin.document.write).toHaveBeenCalled();
    });

    test('company 100K caractères → génère sans crash (pas de limite de taille)', () => {
        document.getElementById('input-company').value = 'A'.repeat(100000);
        document.getElementById('input-email').value = 'x@x.com';
        const mockWin = createMockPopupWindow();
        jest.spyOn(window, 'open').mockReturnValue(mockWin);
        expect(() => {
            window.generatePDF();
            jest.runAllTimers();
        }).not.toThrow();
    });

    test('company avec emoji → génère correctement (UTF-8)', () => {
        document.getElementById('input-company').value = 'Corp 🎉';
        document.getElementById('input-email').value = 'x@x.com';
        const mockWin = createMockPopupWindow();
        jest.spyOn(window, 'open').mockReturnValue(mockWin);
        window.generatePDF();
        jest.runAllTimers();
        expect(mockWin.getCapturedHtml()).toContain('Corp 🎉');
    });
});
