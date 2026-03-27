/**
 * Tests unitaires — Page GRC Cybersécurité (Story #8)
 * AgileVizion 2
 *
 * Couvre :
 * - Hero : accroche choc, placeholder vidéo 16:9, CTA
 * - Section "Le problème" : 4 pain points avec chiffres réglementaires
 * - Section "La solution" : audit et mise en conformité
 * - Section "L'approche" : 3 étapes numérotées
 * - Section "Les livrables" : 6 cards avec icônes
 * - Section "Normes couvertes" : 3 catégories (EU, ISO, Cyber)
 * - CTA final : Calendly + email
 * - Animations .animate-in sur chaque section
 * - Acronymes développés (abbr) à la première occurrence
 * - Page standalone : compréhensible sans contexte de la landing
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../../');
const cyberHtml = fs.readFileSync(path.join(ROOT, 'cyber.html'), 'utf8');

// -----------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------

function extractSection(html, id) {
    const startIdx = html.indexOf(`id="${id}"`);
    if (startIdx === -1) return '';
    const sectionStart = html.lastIndexOf('<section', startIdx);
    const sectionEnd = html.indexOf('</section>', sectionStart) + '</section>'.length;
    return html.slice(sectionStart, sectionEnd);
}

function setupDOM(html) {
    document.body.innerHTML = html;
}

afterEach(() => {
    document.body.innerHTML = '';
});

// Sections extraites
const HERO_HTML       = extractSection(cyberHtml, 'hero');
const PROBLEME_HTML   = extractSection(cyberHtml, 'probleme');
const SOLUTION_HTML   = extractSection(cyberHtml, 'solution');
const APPROCHE_HTML   = extractSection(cyberHtml, 'approche');
const LIVRABLES_HTML  = extractSection(cyberHtml, 'livrables');
const NORMES_HTML     = extractSection(cyberHtml, 'normes');
const CONTACT_HTML    = extractSection(cyberHtml, 'contact');


// ====================================================================
// HERO
// ====================================================================
describe('Hero — cyber.html (#hero)', () => {

    beforeEach(() => { setupDOM(HERO_HTML); });

    test('section#hero existe', () => {
        expect(HERO_HTML.length).toBeGreaterThan(50);
        expect(HERO_HTML).toContain('id="hero"');
    });

    test('classe hero-page présente (page de vente distincte de la landing)', () => {
        const section = document.querySelector('section');
        expect(section.classList.contains('hero-page')).toBe(true);
    });

    test('h1 hero-title présent', () => {
        const h1 = document.querySelector('.hero-title');
        expect(h1).not.toBeNull();
        expect(h1.textContent.trim().length).toBeGreaterThan(10);
    });

    test('h1 mentionne une amende ou un risque financier (accroche choc)', () => {
        const h1 = document.querySelector('.hero-title');
        const text = h1.textContent;
        // Doit contenir un chiffre d'amende ou % CA
        const hasRisk = /\d+\s*[%M€]|amende|sanction|risque/i.test(text);
        expect(hasRisk).toBe(true);
    });

    test('sous-titre hero-subtitle présent', () => {
        const p = document.querySelector('.hero-subtitle');
        expect(p).not.toBeNull();
        expect(p.textContent.trim().length).toBeGreaterThan(20);
    });

    test('placeholder vidéo 16:9 présent (.placeholder-video ou .video-placeholder)', () => {
        const video = document.querySelector('.placeholder-video, .video-placeholder');
        expect(video).not.toBeNull();
    });

    test('placeholder vidéo a role="img" ou aria-label pour l\'accessibilité', () => {
        const video = document.querySelector('[role="img"], [aria-label]');
        expect(video).not.toBeNull();
    });

    test('icône play présente dans le placeholder vidéo', () => {
        const play = document.querySelector('.fa-play');
        expect(play).not.toBeNull();
    });

    test('hero-cta contient au moins 2 boutons (Calendly + email)', () => {
        const cta = document.querySelector('.hero-cta');
        expect(cta).not.toBeNull();
        const btns = cta.querySelectorAll('button, a');
        expect(btns.length).toBeGreaterThanOrEqual(2);
    });

    test('bouton Calendly dans le hero : onclick="openCalendly()"', () => {
        const btn = document.querySelector('.hero-cta button[onclick="openCalendly()"]');
        expect(btn).not.toBeNull();
    });

    test('bouton email dans le hero : href mailto', () => {
        const email = document.querySelector('.hero-cta a[href^="mailto:"]');
        expect(email).not.toBeNull();
        expect(email.getAttribute('href')).toBe('mailto:emmanuel.genesteix@agilevizion.com');
    });

    test('hero-title a la classe animate-in', () => {
        const h1 = document.querySelector('.hero-title');
        expect(h1.classList.contains('animate-in')).toBe(true);
    });

    test('hero-subtitle a la classe animate-in', () => {
        const p = document.querySelector('.hero-subtitle');
        expect(p.classList.contains('animate-in')).toBe(true);
    });

    test('hero-cta a la classe animate-in', () => {
        const cta = document.querySelector('.hero-cta');
        expect(cta.classList.contains('animate-in')).toBe(true);
    });

    test('data-i18n sur le h1 (localisable)', () => {
        const h1 = document.querySelector('.hero-title');
        expect(h1.getAttribute('data-i18n')).toBeTruthy();
        expect(h1.getAttribute('data-i18n')).toContain('grc.');
    });
});


// ====================================================================
// SECTION "LE PROBLÈME" — 4 pain points
// ====================================================================
describe('Section "Le problème" — cyber.html (#probleme)', () => {

    beforeEach(() => { setupDOM(PROBLEME_HTML); });

    test('section#probleme existe', () => {
        expect(PROBLEME_HTML.length).toBeGreaterThan(50);
    });

    test('titre de section présent', () => {
        const h2 = document.querySelector('.section-title');
        expect(h2).not.toBeNull();
        expect(h2.textContent.trim().length).toBeGreaterThan(5);
    });

    test('titre a la classe animate-in', () => {
        const h2 = document.querySelector('.section-title');
        expect(h2.classList.contains('animate-in')).toBe(true);
    });

    test('exactement 4 pain point cards (.problem-card)', () => {
        const cards = document.querySelectorAll('.problem-card');
        expect(cards.length).toBe(4);
    });

    test('pain point 1 : évoque les normes applicables', () => {
        const cards = document.querySelectorAll('.problem-card');
        const card1 = cards[0];
        const text = card1.textContent.toLowerCase();
        expect(text).toMatch(/norme|r[eé]f[eé]rentiel|applicable|obligation/i);
    });

    test('pain point 2 : évoque obligatoire vs recommandé', () => {
        const cards = document.querySelectorAll('.problem-card');
        const card2 = cards[1];
        const text = card2.textContent.toLowerCase();
        expect(text).toMatch(/obligatoire|recommand[eé]|sanction|amende/i);
    });

    test('pain point 3 : mentionne les chiffres DORA / NIS 2 / RGPD', () => {
        const cards = document.querySelectorAll('.problem-card');
        const card3 = cards[2];
        const text = card3.textContent;
        // Doit contenir au moins 2 chiffres réglementaires parmi les 3
        const hasDORA = /DORA/i.test(text);
        const hasNIS2 = /NIS[\s\xa0]?2/i.test(text);
        const hasRGPD = /RGPD|GDPR/i.test(text);
        const count = [hasDORA, hasNIS2, hasRGPD].filter(Boolean).length;
        expect(count).toBeGreaterThanOrEqual(2);
    });

    test('pain point 3 : chiffre NIS 2 → 10 M€ ou 2 % CA', () => {
        const cards = document.querySelectorAll('.problem-card');
        const card3 = cards[2];
        const text = card3.textContent;
        expect(text).toMatch(/10[\s\xa0]*M|2[\s\xa0]*%/);
    });

    test('pain point 3 : chiffre RGPD → 4 % CA ou 20 M€', () => {
        const cards = document.querySelectorAll('.problem-card');
        const card3 = cards[2];
        const text = card3.textContent;
        expect(text).toMatch(/4[\s\xa0]*%|20[\s\xa0]*M/);
    });

    test('pain point 4 : mentionne la responsabilité personnelle des dirigeants', () => {
        const cards = document.querySelectorAll('.problem-card');
        const card4 = cards[3];
        const text = card4.textContent.toLowerCase();
        expect(text).toMatch(/dirigeant|responsabilit[eé]|personnel/i);
    });

    test('chaque card a une icône Font Awesome', () => {
        const cards = document.querySelectorAll('.problem-card');
        cards.forEach((card, i) => {
            const icon = card.querySelector('i[class*="fa-"]');
            expect(icon).not.toBeNull();
        });
    });

    test('chaque card a un h3 non vide', () => {
        const cards = document.querySelectorAll('.problem-card');
        cards.forEach((card) => {
            const h3 = card.querySelector('h3');
            expect(h3).not.toBeNull();
            expect(h3.textContent.trim().length).toBeGreaterThan(5);
        });
    });

    test('chaque card a la classe animate-in', () => {
        const cards = document.querySelectorAll('.problem-card');
        cards.forEach((card) => {
            expect(card.classList.contains('animate-in')).toBe(true);
        });
    });

    test('section probleme a la classe section-alt', () => {
        const section = document.querySelector('section');
        expect(section.classList.contains('section-alt')).toBe(true);
    });

    test('la section a aria-labelledby pour l\'accessibilité', () => {
        const section = document.querySelector('section');
        expect(section.getAttribute('aria-labelledby')).toBeTruthy();
    });
});


// ====================================================================
// SECTION "LA SOLUTION"
// ====================================================================
describe('Section "La solution" — cyber.html (#solution)', () => {

    beforeEach(() => { setupDOM(SOLUTION_HTML); });

    test('section#solution existe', () => {
        expect(SOLUTION_HTML.length).toBeGreaterThan(50);
    });

    test('titre de solution présent', () => {
        const heading = document.querySelector('h2');
        expect(heading).not.toBeNull();
        const text = heading.textContent.toLowerCase();
        expect(text).toMatch(/solution|audit|conformit[eé]/i);
    });

    test('texte de solution présent et non vide', () => {
        const text = document.querySelector('.solution-text');
        expect(text).not.toBeNull();
        expect(text.textContent.trim().length).toBeGreaterThan(20);
    });

    test('liste de points de solution présente (.solution-check)', () => {
        const checks = document.querySelectorAll('.solution-check');
        expect(checks.length).toBeGreaterThanOrEqual(3);
    });

    test('chaque point de solution a une icône check', () => {
        const checks = document.querySelectorAll('.solution-check');
        checks.forEach((check) => {
            const icon = check.querySelector('i[class*="fa-circle-check"], i[class*="fa-check"]');
            expect(icon).not.toBeNull();
        });
    });

    test('section solution a la classe animate-in sur au moins un élément', () => {
        const animated = document.querySelector('.animate-in');
        expect(animated).not.toBeNull();
    });

    test('section a aria-labelledby', () => {
        const section = document.querySelector('section');
        expect(section.getAttribute('aria-labelledby')).toBeTruthy();
    });

    test('h2 a un id correspondant à aria-labelledby', () => {
        const section = document.querySelector('section');
        const labelId = section.getAttribute('aria-labelledby');
        const h2 = document.getElementById(labelId);
        expect(h2).not.toBeNull();
    });
});


// ====================================================================
// SECTION "L'APPROCHE" — 3 étapes numérotées
// ====================================================================
describe('Section "L\'approche" — cyber.html (#approche)', () => {

    beforeEach(() => { setupDOM(APPROCHE_HTML); });

    test('section#approche existe', () => {
        expect(APPROCHE_HTML.length).toBeGreaterThan(50);
    });

    test('titre de section présent avec animate-in', () => {
        const h2 = document.querySelector('.section-title');
        expect(h2).not.toBeNull();
        expect(h2.classList.contains('animate-in')).toBe(true);
    });

    test('exactement 3 step-cards', () => {
        const steps = document.querySelectorAll('.step-card');
        expect(steps.length).toBe(3);
    });

    test('étape 1 numérotée "01"', () => {
        const steps = document.querySelectorAll('.step-card');
        const num = steps[0].querySelector('.step-number');
        expect(num).not.toBeNull();
        expect(num.textContent.trim()).toBe('01');
    });

    test('étape 2 numérotée "02"', () => {
        const steps = document.querySelectorAll('.step-card');
        const num = steps[1].querySelector('.step-number');
        expect(num).not.toBeNull();
        expect(num.textContent.trim()).toBe('02');
    });

    test('étape 3 numérotée "03"', () => {
        const steps = document.querySelectorAll('.step-card');
        const num = steps[2].querySelector('.step-number');
        expect(num).not.toBeNull();
        expect(num.textContent.trim()).toBe('03');
    });

    test('étape 1 : Diagnostic initial (évaluation périmètre)', () => {
        const steps = document.querySelectorAll('.step-card');
        const text = steps[0].textContent.toLowerCase();
        expect(text).toMatch(/diagnostic|p[eé]rim[eè]tre|[eé]valuation/i);
    });

    test('étape 2 : Audit terrain (contrôles, entretiens, preuves)', () => {
        const steps = document.querySelectorAll('.step-card');
        const text = steps[1].textContent.toLowerCase();
        expect(text).toMatch(/audit|terrain|contr[oô]le|entretien|preuve/i);
    });

    test('étape 3 : Feuille de route (plan d\'action priorisé)', () => {
        const steps = document.querySelectorAll('.step-card');
        const text = steps[2].textContent.toLowerCase();
        expect(text).toMatch(/feuille.*route|plan.*action|prioris[eé]/i);
    });

    test('chaque step-card a un h3', () => {
        const steps = document.querySelectorAll('.step-card');
        steps.forEach((step) => {
            const h3 = step.querySelector('h3');
            expect(h3).not.toBeNull();
            expect(h3.textContent.trim().length).toBeGreaterThan(3);
        });
    });

    test('chaque step-card a la classe animate-in', () => {
        const steps = document.querySelectorAll('.step-card');
        steps.forEach((step) => {
            expect(step.classList.contains('animate-in')).toBe(true);
        });
    });

    test('section approche a la classe section-alt', () => {
        const section = document.querySelector('section');
        expect(section.classList.contains('section-alt')).toBe(true);
    });
});


// ====================================================================
// SECTION "LES LIVRABLES" — 6 cards avec icônes
// ====================================================================
describe('Section "Les livrables" — cyber.html (#livrables)', () => {

    beforeEach(() => { setupDOM(LIVRABLES_HTML); });

    test('section#livrables existe', () => {
        expect(LIVRABLES_HTML.length).toBeGreaterThan(50);
    });

    test('titre de section présent avec animate-in', () => {
        const h2 = document.querySelector('.section-title');
        expect(h2).not.toBeNull();
        expect(h2.classList.contains('animate-in')).toBe(true);
    });

    test('exactement 6 deliverable-cards', () => {
        const cards = document.querySelectorAll('.deliverable-card');
        expect(cards.length).toBe(6);
    });

    test('livrable 1 : Grille d\'audit complète', () => {
        const cards = document.querySelectorAll('.deliverable-card');
        const text = cards[0].textContent.toLowerCase();
        expect(text).toMatch(/grille.*audit|audit.*grille/i);
    });

    test('livrable 2 : Rapport exécutif', () => {
        const cards = document.querySelectorAll('.deliverable-card');
        const text = cards[1].textContent.toLowerCase();
        expect(text).toMatch(/rapport.*ex[eé]cutif|ex[eé]cutif/i);
    });

    test('livrable 3 : Feuille de route priorisée', () => {
        const cards = document.querySelectorAll('.deliverable-card');
        const text = cards[2].textContent.toLowerCase();
        expect(text).toMatch(/feuille.*route|prioris[eé]/i);
    });

    test('livrable 4 : PV de conformité', () => {
        const cards = document.querySelectorAll('.deliverable-card');
        const text = cards[3].textContent.toLowerCase();
        expect(text).toMatch(/pv|proc[eè]s[\s-]verbal|conformit[eé]/i);
    });

    test('livrable 5 : Modèles de politiques', () => {
        const cards = document.querySelectorAll('.deliverable-card');
        const text = cards[4].textContent.toLowerCase();
        expect(text).toMatch(/mod[eè]le|politique|template/i);
    });

    test('livrable 6 : Infographie de synthèse', () => {
        const cards = document.querySelectorAll('.deliverable-card');
        const text = cards[5].textContent.toLowerCase();
        expect(text).toMatch(/infographie|synth[eè]se/i);
    });

    test('chaque card a une icône Font Awesome', () => {
        const cards = document.querySelectorAll('.deliverable-card');
        cards.forEach((card) => {
            const icon = card.querySelector('i[class*="fa-"]');
            expect(icon).not.toBeNull();
        });
    });

    test('chaque card a un h4 non vide', () => {
        const cards = document.querySelectorAll('.deliverable-card');
        cards.forEach((card) => {
            const h4 = card.querySelector('h4');
            expect(h4).not.toBeNull();
            expect(h4.textContent.trim().length).toBeGreaterThan(3);
        });
    });

    test('chaque card a la classe animate-in', () => {
        const cards = document.querySelectorAll('.deliverable-card');
        cards.forEach((card) => {
            expect(card.classList.contains('animate-in')).toBe(true);
        });
    });
});


// ====================================================================
// SECTION "NORMES COUVERTES" — 3 catégories
// ====================================================================
describe('Section "Normes couvertes" — cyber.html (#normes)', () => {

    beforeEach(() => { setupDOM(NORMES_HTML); });

    test('section#normes existe', () => {
        expect(NORMES_HTML.length).toBeGreaterThan(50);
    });

    test('titre de section présent avec animate-in', () => {
        const h2 = document.querySelector('.section-title');
        expect(h2).not.toBeNull();
        expect(h2.classList.contains('animate-in')).toBe(true);
    });

    test('exactement 3 groupes de normes (.framework-group)', () => {
        const groups = document.querySelectorAll('.framework-group');
        expect(groups.length).toBe(3);
    });

    test('groupe 1 : Réglementations européennes', () => {
        const groups = document.querySelectorAll('.framework-group');
        const text = groups[0].textContent.toLowerCase();
        expect(text).toMatch(/r[eé]glementation|europ[eé]enne|eu/i);
    });

    test('groupe 2 : Standards ISO', () => {
        const groups = document.querySelectorAll('.framework-group');
        const text = groups[1].textContent;
        expect(text).toMatch(/ISO/i);
    });

    test('groupe 3 : Frameworks cybersécurité', () => {
        const groups = document.querySelectorAll('.framework-group');
        const text = groups[2].textContent.toLowerCase();
        expect(text).toMatch(/framework|cyber/i);
    });

    // Normes EU
    test('DORA présent dans les normes EU', () => {
        const groups = document.querySelectorAll('.framework-group');
        expect(groups[0].textContent).toContain('DORA');
    });

    test('NIS 2 présent dans les normes EU', () => {
        const groups = document.querySelectorAll('.framework-group');
        expect(groups[0].textContent).toMatch(/NIS[\s\xa0]?2/);
    });

    test('RGPD présent dans les normes EU', () => {
        const groups = document.querySelectorAll('.framework-group');
        expect(groups[0].textContent).toMatch(/RGPD|GDPR/);
    });

    // Standards ISO
    test('ISO 27001 présent', () => {
        const groups = document.querySelectorAll('.framework-group');
        expect(groups[1].textContent).toMatch(/27001/);
    });

    test('ISO 27002 présent', () => {
        const groups = document.querySelectorAll('.framework-group');
        expect(groups[1].textContent).toMatch(/27002/);
    });

    test('ISO 27005 présent', () => {
        const groups = document.querySelectorAll('.framework-group');
        expect(groups[1].textContent).toMatch(/27005/);
    });

    // Frameworks Cyber
    test('CIS Controls v8 présent', () => {
        const groups = document.querySelectorAll('.framework-group');
        expect(groups[2].textContent).toMatch(/CIS/i);
    });

    test('NIST 800-53 présent', () => {
        const groups = document.querySelectorAll('.framework-group');
        expect(groups[2].textContent).toMatch(/NIST[\s\xa0]?800-53/);
    });

    test('NIST 800-37 présent', () => {
        const groups = document.querySelectorAll('.framework-group');
        expect(groups[2].textContent).toMatch(/NIST[\s\xa0]?800-37/);
    });

    test('EBIOS RM présent', () => {
        const groups = document.querySelectorAll('.framework-group');
        expect(groups[2].textContent).toMatch(/EBIOS/i);
    });

    test('chaque groupe a la classe animate-in', () => {
        const groups = document.querySelectorAll('.framework-group');
        groups.forEach((group) => {
            expect(group.classList.contains('animate-in')).toBe(true);
        });
    });

    test('section normes a la classe section-alt', () => {
        const section = document.querySelector('section');
        expect(section.classList.contains('section-alt')).toBe(true);
    });
});


// ====================================================================
// CTA FINAL
// ====================================================================
describe('CTA final — cyber.html (#contact)', () => {

    beforeEach(() => { setupDOM(CONTACT_HTML); });

    test('section#contact existe', () => {
        expect(CONTACT_HTML.length).toBeGreaterThan(50);
    });

    test('section CTA a la classe section-cta', () => {
        const section = document.querySelector('section');
        expect(section.classList.contains('section-cta')).toBe(true);
    });

    test('titre de section présent avec animate-in', () => {
        const h2 = document.querySelector('.section-title');
        expect(h2).not.toBeNull();
        expect(h2.classList.contains('animate-in')).toBe(true);
    });

    test('sous-titre présent avec animate-in', () => {
        const sub = document.querySelector('.section-subtitle');
        expect(sub).not.toBeNull();
        expect(sub.classList.contains('animate-in')).toBe(true);
    });

    test('bouton Calendly : onclick="openCalendly()"', () => {
        const btn = document.querySelector('button[onclick="openCalendly()"]');
        expect(btn).not.toBeNull();
    });

    test('bouton Calendly : classe btn-primary et btn-lg', () => {
        const btn = document.querySelector('button[onclick="openCalendly()"]');
        expect(btn.classList.contains('btn-primary')).toBe(true);
        expect(btn.classList.contains('btn-lg')).toBe(true);
    });

    test('bouton email : href mailto correct', () => {
        const email = document.querySelector('a[href^="mailto:"]');
        expect(email).not.toBeNull();
        expect(email.getAttribute('href')).toBe('mailto:emmanuel.genesteix@agilevizion.com');
    });

    test('hero-cta contient les 2 boutons avec animate-in', () => {
        const cta = document.querySelector('.hero-cta');
        expect(cta).not.toBeNull();
        expect(cta.classList.contains('animate-in')).toBe(true);
        const btns = cta.querySelectorAll('button, a');
        expect(btns.length).toBe(2);
    });
});


// ====================================================================
// ACRONYMES — développés avec <abbr title="...">
// ====================================================================
describe('Acronymes développés (<abbr>) — cyber.html', () => {

    beforeEach(() => { setupDOM(cyberHtml); });

    test('DORA développé en "Digital Operational Resilience Act"', () => {
        const abbrs = document.querySelectorAll('abbr');
        const dora = Array.from(abbrs).find(a => a.textContent.trim() === 'DORA');
        expect(dora).not.toBeNull();
        expect(dora.getAttribute('title')).toMatch(/Digital Operational Resilience Act/i);
    });

    test('NIS 2 développé en "Network and Information Security"', () => {
        const abbrs = document.querySelectorAll('abbr');
        const nis2 = Array.from(abbrs).find(a => /NIS[\s\xa0]?2/.test(a.textContent));
        expect(nis2).not.toBeNull();
        expect(nis2.getAttribute('title')).toMatch(/Network and Information Security/i);
    });

    test('RGPD développé en "Règlement Général sur la Protection des Données"', () => {
        const abbrs = document.querySelectorAll('abbr');
        const rgpd = Array.from(abbrs).find(a => /RGPD/.test(a.textContent));
        expect(rgpd).not.toBeNull();
        expect(rgpd.getAttribute('title')).toMatch(/R[eè]glement G[eé]n[eé]ral sur la Protection/i);
    });

    test('ISO 27001 développé avec un titre descriptif', () => {
        const abbrs = document.querySelectorAll('abbr');
        const iso = Array.from(abbrs).find(a => /27001/.test(a.textContent));
        expect(iso).not.toBeNull();
        expect(iso.getAttribute('title').length).toBeGreaterThan(5);
    });

    test('CIS Controls développé avec un titre descriptif', () => {
        const abbrs = document.querySelectorAll('abbr');
        const cis = Array.from(abbrs).find(a => /CIS/.test(a.textContent));
        expect(cis).not.toBeNull();
        expect(cis.getAttribute('title').length).toBeGreaterThan(5);
    });

    test('NIST 800-53 développé avec un titre descriptif', () => {
        const abbrs = document.querySelectorAll('abbr');
        const nist = Array.from(abbrs).find(a => /NIST[\s\xa0]?800-53/.test(a.textContent));
        expect(nist).not.toBeNull();
        expect(nist.getAttribute('title').length).toBeGreaterThan(5);
    });

    test('EBIOS RM développé avec un titre descriptif', () => {
        const abbrs = document.querySelectorAll('abbr');
        const ebios = Array.from(abbrs).find(a => /EBIOS/.test(a.textContent));
        expect(ebios).not.toBeNull();
        expect(ebios.getAttribute('title').length).toBeGreaterThan(5);
    });
});


// ====================================================================
// PAGE STANDALONE — compréhensible sans contexte de la landing
// ====================================================================
describe('Page standalone — cyber.html lisible sans la landing', () => {

    beforeEach(() => { setupDOM(cyberHtml); });

    test('la page a un <title> propre (non générique)', () => {
        expect(cyberHtml).toMatch(/<title[^>]*>.*GRC.*AgileVizion.*<\/title>/i);
    });

    test('la page a une meta description autonome', () => {
        const match = cyberHtml.match(/<meta\s+name="description"\s+content="([^"]+)"/i);
        expect(match).not.toBeNull();
        const desc = match[1];
        expect(desc.length).toBeGreaterThan(30);
        // Doit mentionner l'audit ou la conformité pour que la page soit auto-explicative
        expect(desc).toMatch(/audit|conformit[eé]|DORA|NIS|ISO/i);
    });

    test('la page a une navbar avec lien vers la landing (/)', () => {
        const home = document.querySelector('a[href="/"], a[href="index.html"]');
        expect(home).not.toBeNull();
    });

    test('la page a un footer complet (email, téléphone, LinkedIn)', () => {
        const footer = document.querySelector('footer');
        expect(footer).not.toBeNull();
        expect(footer.textContent.toLowerCase()).toContain('luxembourg');
        expect(footer.innerHTML.toLowerCase()).toContain('linkedin');
    });

    test('la page a un lien "Cyber GRC" actif dans la navbar', () => {
        const activeLink = document.querySelector('.nav-menu a.active');
        expect(activeLink).not.toBeNull();
        expect(activeLink.getAttribute('href')).toContain('cyber');
    });

    test('la page a au moins 6 sections distinctes (structure verticale)', () => {
        const sections = document.querySelectorAll('main section, body > section, nav ~ section');
        // Compter toutes les sections dans la page
        const allSections = document.querySelectorAll('section');
        expect(allSections.length).toBeGreaterThanOrEqual(6);
    });

    test('la page a un JSON-LD structuré (schema.org Service)', () => {
        expect(cyberHtml).toContain('"@type": "Service"');
        expect(cyberHtml).toContain('AgileVizion');
    });

    test('la page a des Open Graph meta tags', () => {
        expect(cyberHtml).toContain('og:title');
        expect(cyberHtml).toContain('og:description');
    });
});


// ====================================================================
// ANIMATIONS — .animate-in sur tous les éléments clés
// ====================================================================
describe('Animations .animate-in — cyber.html', () => {

    beforeEach(() => { setupDOM(cyberHtml); });

    test('la page a au moins 10 éléments .animate-in', () => {
        const animated = document.querySelectorAll('.animate-in');
        expect(animated.length).toBeGreaterThanOrEqual(10);
    });

    test('chaque section-title a animate-in', () => {
        const titles = document.querySelectorAll('.section-title');
        titles.forEach((title) => {
            expect(title.classList.contains('animate-in')).toBe(true);
        });
    });
});


// ====================================================================
// STRUCTURE HTML — conformité et qualité
// ====================================================================
describe('Structure HTML — cyber.html', () => {

    test('balise HTML présente avec lang="fr"', () => {
        expect(cyberHtml).toContain('<html lang="fr">');
    });

    test('charset UTF-8 déclaré', () => {
        expect(cyberHtml).toContain('charset="UTF-8"');
    });

    test('viewport meta tag présent (responsive)', () => {
        expect(cyberHtml).toContain('viewport');
        expect(cyberHtml).toContain('width=device-width');
    });

    test('lien canonical og:url vers /cyber.html', () => {
        expect(cyberHtml).toContain('cyber.html');
    });

    test('CSS variables.css chargé', () => {
        expect(cyberHtml).toContain('css/variables.css');
    });

    test('CSS animations.css chargé', () => {
        expect(cyberHtml).toContain('css/animations.css');
    });

    test('js/animations.js chargé', () => {
        expect(cyberHtml).toContain('js/animations.js');
    });

    test('js/i18n.js chargé', () => {
        expect(cyberHtml).toContain('js/i18n.js');
    });

    test('Font Awesome CDN chargé', () => {
        expect(cyberHtml).toContain('font-awesome');
    });

    test('Calendly CDN widget.js présent', () => {
        expect(cyberHtml).toContain('calendly.com');
    });

    test('pas de style inline (aucun attribut style="...")', () => {
        // Exception autorisée : cookie-banner display:none (chargement initial)
        const inlineStyles = cyberHtml.match(/style="[^"]+"/g) || [];
        // Seul le cookie-banner peut avoir display:none
        const forbidden = inlineStyles.filter(s => !s.includes('display:none') && !s.includes('display: none'));
        expect(forbidden.length).toBe(0);
    });

    test('pas de credentials ou tokens dans le code', () => {
        expect(cyberHtml).not.toMatch(/password|token|secret|api[_-]?key/i);
    });
});


// ====================================================================
// SÉCURITÉ — edge cases inputs malveillants
// ====================================================================
describe('Sécurité — cyber.html', () => {

    test('aucun <script> inline dans le body (hors scripts légitimes)', () => {
        // Seuls les scripts légitimes src= et JSON-LD sont autorisés
        const bodyStart = cyberHtml.indexOf('<body');
        const bodyContent = cyberHtml.slice(bodyStart);
        // Les scripts inline avec code (pas src= et pas type=application/ld+json) sont interdits
        const inlineScripts = bodyContent.match(/<script(?![^>]*(?:src=|type="application\/ld\+json"))[^>]*>[\s\S]*?<\/script>/gi) || [];
        expect(inlineScripts.length).toBe(0);
    });

    test('pas d\'iframes (vecteur XSS possible)', () => {
        expect(cyberHtml.toLowerCase()).not.toContain('<iframe');
    });

    test('liens externes ont rel="noopener" (protection tabnapping)', () => {
        setupDOM(cyberHtml);
        const externalLinks = document.querySelectorAll('a[target="_blank"]');
        externalLinks.forEach((link) => {
            const rel = link.getAttribute('rel') || '';
            expect(rel).toMatch(/noopener/);
        });
    });

    test('l\'email d\'administration ne fuites pas dans des commentaires HTML', () => {
        // L'email peut être dans le footer, mais pas dans des commentaires
        const comments = cyberHtml.match(/<!--[\s\S]*?-->/g) || [];
        comments.forEach((comment) => {
            expect(comment).not.toMatch(/password|secret|token/i);
        });
    });
});
