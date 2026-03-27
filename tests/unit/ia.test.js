/**
 * Tests unitaires — Page IA Agentique (Story #9)
 * AgileVizion 2
 *
 * Couvre :
 * - Hero : accroche "perdent du temps", placeholder vidéo 16:9, CTA
 * - Section "Le problème" : 3 KPI cards (40%, 68%, ×3) + sources + conséquences
 * - Section "L'employé augmenté" : 4 verbes + message clé
 * - Section "Exemple concret" : 2 phases workflow + résultats tags
 * - Section "Applicable à tous les métiers" : 7 job cards avec listes
 * - Section "Notre approche" : 3 étapes numérotées
 * - Section "Résultats" : 3 KPI boxes
 * - CTA final : Calendly + email
 * - Traductions FR/EN : clés ia.*
 * - Animations .animate-in sur tous les éléments clés
 * - Structure HTML (standalone, SEO, accessibilité)
 * - Sécurité (XSS, liens externes)
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../../');
const iaHtml = fs.readFileSync(path.join(ROOT, 'ia.html'), 'utf8');

const frJson = JSON.parse(fs.readFileSync(path.join(ROOT, 'lang/fr.json'), 'utf8'));
const enJson = JSON.parse(fs.readFileSync(path.join(ROOT, 'lang/en.json'), 'utf8'));

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
const HERO_HTML         = extractSection(iaHtml, 'hero');
const PROBLEME_HTML     = extractSection(iaHtml, 'probleme');
const AUGMENTE_HTML     = extractSection(iaHtml, 'employe-augmente');
const EXEMPLE_HTML      = extractSection(iaHtml, 'exemple');
const METIERS_HTML      = extractSection(iaHtml, 'metiers');
const APPROCHE_HTML     = extractSection(iaHtml, 'approche');
const RESULTATS_HTML    = extractSection(iaHtml, 'resultats');
const CONTACT_HTML      = extractSection(iaHtml, 'contact');


// ====================================================================
// HERO
// ====================================================================
describe('Hero — ia.html (#hero)', () => {

    beforeEach(() => { setupDOM(HERO_HTML); });

    test('section#hero existe', () => {
        expect(HERO_HTML.length).toBeGreaterThan(50);
        expect(HERO_HTML).toContain('id="hero"');
    });

    test('classe hero-page présente', () => {
        const section = document.querySelector('section');
        expect(section.classList.contains('hero-page')).toBe(true);
    });

    test('h1 hero-title présent', () => {
        const h1 = document.querySelector('.hero-title');
        expect(h1).not.toBeNull();
        expect(h1.textContent.trim().length).toBeGreaterThan(10);
    });

    test('h1 contient la notion de perte de temps (accroche story #9)', () => {
        const h1 = document.querySelector('.hero-title');
        const text = h1.textContent;
        expect(text).toMatch(/perd|temps|tâche|IA/i);
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

    test('bouton email dans le hero : href mailto correct', () => {
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
        expect(h1.getAttribute('data-i18n')).toContain('ia.');
    });
});


// ====================================================================
// SECTION "LE PROBLÈME" — 3 KPI cards + sources + conséquences
// ====================================================================
describe('Section "Le problème" — ia.html (#probleme)', () => {

    beforeEach(() => { setupDOM(PROBLEME_HTML); });

    test('section#probleme existe', () => {
        expect(PROBLEME_HTML.length).toBeGreaterThan(50);
        expect(PROBLEME_HTML).toContain('id="probleme"');
    });

    test('titre de section présent avec animate-in', () => {
        const h2 = document.querySelector('.section-title');
        expect(h2).not.toBeNull();
        expect(h2.classList.contains('animate-in')).toBe(true);
    });

    test('exactement 3 KPI cards (.kpi-card)', () => {
        const cards = document.querySelectorAll('.kpi-card');
        expect(cards.length).toBe(3);
    });

    test('KPI 1 : 40% (McKinsey 2023)', () => {
        const cards = document.querySelectorAll('.kpi-card');
        const text = cards[0].textContent;
        expect(text).toContain('40%');
    });

    test('KPI 2 : 68% (Microsoft 2024)', () => {
        const cards = document.querySelectorAll('.kpi-card');
        const text = cards[1].textContent;
        expect(text).toContain('68%');
    });

    test('KPI 3 : ×3 (HBR)', () => {
        const cards = document.querySelectorAll('.kpi-card');
        const text = cards[2].textContent;
        expect(text).toMatch(/[×x]3/i);
    });

    test('source McKinsey visible sous le KPI 1', () => {
        const cards = document.querySelectorAll('.kpi-card');
        const source = cards[0].querySelector('.kpi-source');
        expect(source).not.toBeNull();
        expect(source.textContent).toMatch(/McKinsey/i);
    });

    test('source Microsoft visible sous le KPI 2', () => {
        const cards = document.querySelectorAll('.kpi-card');
        const source = cards[1].querySelector('.kpi-source');
        expect(source).not.toBeNull();
        expect(source.textContent).toMatch(/Microsoft/i);
    });

    test('source HBR (Harvard Business Review) visible sous le KPI 3', () => {
        const cards = document.querySelectorAll('.kpi-card');
        const source = cards[2].querySelector('.kpi-source');
        expect(source).not.toBeNull();
        expect(source.textContent).toMatch(/Harvard|HBR/i);
    });

    test('section conséquences présente (.ia-consequences)', () => {
        const cons = document.querySelector('.ia-consequences');
        expect(cons).not.toBeNull();
    });

    test('au moins 3 conséquences listées', () => {
        const items = document.querySelectorAll('.ia-consequences-list li');
        expect(items.length).toBeGreaterThanOrEqual(3);
    });

    test('conséquence "délais" présente', () => {
        const list = document.querySelector('.ia-consequences-list');
        expect(list.textContent.toLowerCase()).toMatch(/délai|retard/i);
    });

    test('conséquence "erreurs" présente', () => {
        const list = document.querySelector('.ia-consequences-list');
        expect(list.textContent.toLowerCase()).toMatch(/erreur|oubli/i);
    });

    test('conséquence "talents sous-utilisés" présente', () => {
        const list = document.querySelector('.ia-consequences-list');
        expect(list.textContent.toLowerCase()).toMatch(/talent|sous-util/i);
    });

    test('chaque KPI card a la classe animate-in', () => {
        const cards = document.querySelectorAll('.kpi-card');
        cards.forEach(card => {
            expect(card.classList.contains('animate-in')).toBe(true);
        });
    });

    test('section a la classe section-alt', () => {
        const section = document.querySelector('section');
        expect(section.classList.contains('section-alt')).toBe(true);
    });

    test('section a aria-labelledby pour l\'accessibilité', () => {
        const section = document.querySelector('section');
        expect(section.getAttribute('aria-labelledby')).toBeTruthy();
    });
});


// ====================================================================
// SECTION "L'EMPLOYÉ AUGMENTÉ" — 4 verbes + message clé
// ====================================================================
describe('Section "L\'employé augmenté" — ia.html (#employe-augmente)', () => {

    beforeEach(() => { setupDOM(AUGMENTE_HTML); });

    test('section#employe-augmente existe', () => {
        expect(AUGMENTE_HTML.length).toBeGreaterThan(50);
        expect(AUGMENTE_HTML).toContain('id="employe-augmente"');
    });

    test('titre de section présent avec animate-in', () => {
        const h2 = document.querySelector('.section-title');
        expect(h2).not.toBeNull();
        expect(h2.classList.contains('animate-in')).toBe(true);
    });

    test('exactement 4 verb cards (.ia-verb-card)', () => {
        const cards = document.querySelectorAll('.ia-verb-card');
        expect(cards.length).toBe(4);
    });

    test('verbe "Prépare" présent', () => {
        const verbs = document.querySelectorAll('.ia-verb');
        const texts = Array.from(verbs).map(v => v.textContent.trim());
        expect(texts.some(t => /prépare|prepare/i.test(t))).toBe(true);
    });

    test('verbe "Produit" présent', () => {
        const verbs = document.querySelectorAll('.ia-verb');
        const texts = Array.from(verbs).map(v => v.textContent.trim());
        expect(texts.some(t => /produit/i.test(t))).toBe(true);
    });

    test('verbe "Vérifie" présent', () => {
        const verbs = document.querySelectorAll('.ia-verb');
        const texts = Array.from(verbs).map(v => v.textContent.trim());
        expect(texts.some(t => /vérifie|verifie/i.test(t))).toBe(true);
    });

    test('verbe "Apprend" présent', () => {
        const verbs = document.querySelectorAll('.ia-verb');
        const texts = Array.from(verbs).map(v => v.textContent.trim());
        expect(texts.some(t => /apprend/i.test(t))).toBe(true);
    });

    test('chaque verb card a une icône Font Awesome', () => {
        const cards = document.querySelectorAll('.ia-verb-card');
        cards.forEach(card => {
            const icon = card.querySelector('i[class*="fa-"]');
            expect(icon).not.toBeNull();
        });
    });

    test('chaque verb card a une description p non vide', () => {
        const cards = document.querySelectorAll('.ia-verb-card');
        cards.forEach(card => {
            const p = card.querySelector('p');
            expect(p).not.toBeNull();
            expect(p.textContent.trim().length).toBeGreaterThan(10);
        });
    });

    test('message clé "Le collaborateur reste aux commandes" présent', () => {
        const msg = document.querySelector('.ia-key-message');
        expect(msg).not.toBeNull();
        expect(msg.textContent).toMatch(/collaborateur|commandes/i);
    });

    test('message clé a la classe animate-in', () => {
        const msg = document.querySelector('.ia-key-message');
        expect(msg.classList.contains('animate-in')).toBe(true);
    });

    test('chaque verb card a la classe animate-in', () => {
        const cards = document.querySelectorAll('.ia-verb-card');
        cards.forEach(card => {
            expect(card.classList.contains('animate-in')).toBe(true);
        });
    });

    test('section a aria-labelledby', () => {
        const section = document.querySelector('section');
        expect(section.getAttribute('aria-labelledby')).toBeTruthy();
    });
});


// ====================================================================
// SECTION "EXEMPLE CONCRET" — 2 phases workflow + résultats
// ====================================================================
describe('Section "Exemple concret" — ia.html (#exemple)', () => {

    beforeEach(() => { setupDOM(EXEMPLE_HTML); });

    test('section#exemple existe', () => {
        expect(EXEMPLE_HTML.length).toBeGreaterThan(50);
        expect(EXEMPLE_HTML).toContain('id="exemple"');
    });

    test('titre de section présent avec animate-in', () => {
        const h2 = document.querySelector('.section-title');
        expect(h2).not.toBeNull();
        expect(h2.classList.contains('animate-in')).toBe(true);
    });

    test('titre mentionne "Audit GRC"', () => {
        const h2 = document.querySelector('.section-title');
        expect(h2.textContent).toMatch(/audit|GRC/i);
    });

    test('exactement 2 phases workflow (.workflow-phase)', () => {
        const phases = document.querySelectorAll('.workflow-phase');
        expect(phases.length).toBe(2);
    });

    test('Phase 1 — Sourcing : titre présent', () => {
        const phases = document.querySelectorAll('.workflow-phase');
        const text = phases[0].textContent;
        expect(text).toMatch(/phase.*1|sourcing/i);
    });

    test('Phase 1 : 7 critères qualité mentionnés', () => {
        const phases = document.querySelectorAll('.workflow-phase');
        const text = phases[0].textContent;
        expect(text).toMatch(/7[\s\xa0]*crit[eè]re/i);
    });

    test('Phase 1 : mention normes (DORA, NIS 2, ISO)', () => {
        const phases = document.querySelectorAll('.workflow-phase');
        const text = phases[0].textContent;
        expect(text).toMatch(/DORA|NIS|ISO/);
    });

    test('Phase 2 — Production : titre présent', () => {
        const phases = document.querySelectorAll('.workflow-phase');
        const text = phases[1].textContent;
        expect(text).toMatch(/phase.*2|production/i);
    });

    test('Phase 2 : mention pré-remplissage', () => {
        const phases = document.querySelectorAll('.workflow-phase');
        const text = phases[1].textContent;
        expect(text).toMatch(/pr[eé]-?rempli|pr[eé]rempl/i);
    });

    test('Phase 2 : consultant revoit mentionné', () => {
        const phases = document.querySelectorAll('.workflow-phase');
        const text = phases[1].textContent;
        expect(text).toMatch(/consultant|revoit|jugement/i);
    });

    test('bloc résultats (.workflow-results) présent', () => {
        const results = document.querySelector('.workflow-results');
        expect(results).not.toBeNull();
    });

    test('tag "×4 plus rapide" dans les résultats', () => {
        const results = document.querySelector('.workflow-results');
        expect(results.textContent).toMatch(/[×x]4/i);
    });

    test('tag "3+ normes en parallèle" dans les résultats', () => {
        const results = document.querySelector('.workflow-results');
        expect(results.textContent).toMatch(/3\+|parall[eè]le/i);
    });

    test('tag "0 oubli" dans les résultats', () => {
        const results = document.querySelector('.workflow-results');
        expect(results.textContent).toMatch(/0[\s\xa0]*oubli/i);
    });

    test('les result-tags ont la classe tag-accent', () => {
        const accent = document.querySelectorAll('.tag-accent');
        expect(accent.length).toBeGreaterThanOrEqual(1);
    });

    test('section a la classe section-alt', () => {
        const section = document.querySelector('section');
        expect(section.classList.contains('section-alt')).toBe(true);
    });
});


// ====================================================================
// SECTION "APPLICABLE À TOUS LES MÉTIERS" — 7 job cards
// ====================================================================
describe('Section "Applicable à tous les métiers" — ia.html (#metiers)', () => {

    beforeEach(() => { setupDOM(METIERS_HTML); });

    test('section#metiers existe', () => {
        expect(METIERS_HTML.length).toBeGreaterThan(50);
        expect(METIERS_HTML).toContain('id="metiers"');
    });

    test('titre de section présent avec animate-in', () => {
        const h2 = document.querySelector('.section-title');
        expect(h2).not.toBeNull();
        expect(h2.classList.contains('animate-in')).toBe(true);
    });

    test('exactement 7 job cards (.job-detail-card)', () => {
        const cards = document.querySelectorAll('.job-detail-card');
        expect(cards.length).toBe(7);
    });

    test('card "Consultant GRC" présente', () => {
        const cards = document.querySelectorAll('.job-detail-card');
        const texts = Array.from(cards).map(c => c.textContent);
        expect(texts.some(t => /consultant.*GRC|GRC.*consultant/i.test(t))).toBe(true);
    });

    test('card "Développeur" présente (profil technique couvert)', () => {
        const cards = document.querySelectorAll('.job-detail-card');
        const texts = Array.from(cards).map(c => c.textContent);
        expect(texts.some(t => /d[eé]veloppeur/i.test(t))).toBe(true);
    });

    test('card "Juriste" présente', () => {
        const cards = document.querySelectorAll('.job-detail-card');
        const texts = Array.from(cards).map(c => c.textContent);
        expect(texts.some(t => /juriste/i.test(t))).toBe(true);
    });

    test('card "Comptable" présente', () => {
        const cards = document.querySelectorAll('.job-detail-card');
        const texts = Array.from(cards).map(c => c.textContent);
        expect(texts.some(t => /comptable/i.test(t))).toBe(true);
    });

    test('card "Ressources Humaines" / "RH" présente', () => {
        const cards = document.querySelectorAll('.job-detail-card');
        const texts = Array.from(cards).map(c => c.textContent);
        expect(texts.some(t => /ressources[\s\xa0]humaines|RH/i.test(t))).toBe(true);
    });

    test('card "Commercial" présente', () => {
        const cards = document.querySelectorAll('.job-detail-card');
        const texts = Array.from(cards).map(c => c.textContent);
        expect(texts.some(t => /commercial/i.test(t))).toBe(true);
    });

    test('card "Direction" présente', () => {
        const cards = document.querySelectorAll('.job-detail-card');
        const texts = Array.from(cards).map(c => c.textContent);
        expect(texts.some(t => /direction/i.test(t))).toBe(true);
    });

    test('chaque card a une icône Font Awesome (.job-detail-icon)', () => {
        const cards = document.querySelectorAll('.job-detail-card');
        cards.forEach(card => {
            const icon = card.querySelector('.job-detail-icon i[class*="fa-"]');
            expect(icon).not.toBeNull();
        });
    });

    test('chaque card a un h3 non vide', () => {
        const cards = document.querySelectorAll('.job-detail-card');
        cards.forEach(card => {
            const h3 = card.querySelector('h3');
            expect(h3).not.toBeNull();
            expect(h3.textContent.trim().length).toBeGreaterThan(3);
        });
    });

    test('chaque card a une liste de tâches (ul > li, au moins 2)', () => {
        const cards = document.querySelectorAll('.job-detail-card');
        cards.forEach(card => {
            const items = card.querySelectorAll('ul li');
            expect(items.length).toBeGreaterThanOrEqual(2);
        });
    });

    test('chaque card a la classe animate-in', () => {
        const cards = document.querySelectorAll('.job-detail-card');
        cards.forEach(card => {
            expect(card.classList.contains('animate-in')).toBe(true);
        });
    });

    test('card Développeur mentionne des tâches concrètes (code ou test ou doc)', () => {
        const cards = document.querySelectorAll('.job-detail-card');
        const devCard = Array.from(cards).find(c => /d[eé]veloppeur/i.test(c.textContent));
        expect(devCard).not.toBeUndefined();
        const text = devCard.textContent.toLowerCase();
        expect(text).toMatch(/code|test|doc|vuln[eé]rabilit[eé]/i);
    });
});


// ====================================================================
// SECTION "NOTRE APPROCHE" — 3 étapes numérotées
// ====================================================================
describe('Section "Notre approche" — ia.html (#approche)', () => {

    beforeEach(() => { setupDOM(APPROCHE_HTML); });

    test('section#approche existe', () => {
        expect(APPROCHE_HTML.length).toBeGreaterThan(50);
        expect(APPROCHE_HTML).toContain('id="approche"');
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

    test('étape 1 : Diagnostic (1-2 jours)', () => {
        const steps = document.querySelectorAll('.step-card');
        const text = steps[0].textContent.toLowerCase();
        expect(text).toMatch(/diagnostic/i);
        expect(text).toMatch(/1|2|jour/i);
    });

    test('étape 2 : Construction (1-3 semaines)', () => {
        const steps = document.querySelectorAll('.step-card');
        const text = steps[1].textContent.toLowerCase();
        expect(text).toMatch(/construction/i);
        expect(text).toMatch(/semaine|d[eé]velopp/i);
    });

    test('étape 3 : Déploiement continu (formation, ajustements)', () => {
        const steps = document.querySelectorAll('.step-card');
        const text = steps[2].textContent.toLowerCase();
        expect(text).toMatch(/d[eé]ploiement|formation/i);
    });

    test('chaque step-card a un h3 non vide', () => {
        const steps = document.querySelectorAll('.step-card');
        steps.forEach(step => {
            const h3 = step.querySelector('h3');
            expect(h3).not.toBeNull();
            expect(h3.textContent.trim().length).toBeGreaterThan(3);
        });
    });

    test('chaque step-card a la classe animate-in', () => {
        const steps = document.querySelectorAll('.step-card');
        steps.forEach(step => {
            expect(step.classList.contains('animate-in')).toBe(true);
        });
    });

    test('section approche a la classe section-alt', () => {
        const section = document.querySelector('section');
        expect(section.classList.contains('section-alt')).toBe(true);
    });
});


// ====================================================================
// SECTION "RÉSULTATS" — 3 KPI boxes
// ====================================================================
describe('Section "Résultats" — ia.html (#resultats)', () => {

    beforeEach(() => { setupDOM(RESULTATS_HTML); });

    test('section#resultats existe', () => {
        expect(RESULTATS_HTML.length).toBeGreaterThan(50);
        expect(RESULTATS_HTML).toContain('id="resultats"');
    });

    test('titre de section présent avec animate-in', () => {
        const h2 = document.querySelector('.section-title');
        expect(h2).not.toBeNull();
        expect(h2.classList.contains('animate-in')).toBe(true);
    });

    test('exactement 3 KPI cards', () => {
        const cards = document.querySelectorAll('.kpi-card');
        expect(cards.length).toBe(3);
    });

    test('KPI 1 : "×2 à ×4" plus rapide', () => {
        const cards = document.querySelectorAll('.kpi-card');
        expect(cards[0].textContent).toMatch(/[×x]2|[×x]4/i);
    });

    test('KPI 2 : "-70%" temps production documentaire', () => {
        const cards = document.querySelectorAll('.kpi-card');
        expect(cards[1].textContent).toMatch(/70|−70|documentaire/i);
    });

    test('KPI 3 : "0 oubli"', () => {
        const cards = document.querySelectorAll('.kpi-card');
        expect(cards[2].textContent).toMatch(/0[\s\xa0]*oubli/i);
    });

    test('chaque KPI card a un .kpi-value non vide', () => {
        const values = document.querySelectorAll('.kpi-value');
        expect(values.length).toBe(3);
        values.forEach(v => {
            expect(v.textContent.trim().length).toBeGreaterThan(0);
        });
    });

    test('chaque KPI card a un .kpi-label non vide', () => {
        const labels = document.querySelectorAll('.kpi-label');
        expect(labels.length).toBe(3);
        labels.forEach(l => {
            expect(l.textContent.trim().length).toBeGreaterThan(5);
        });
    });

    test('chaque KPI card a la classe animate-in', () => {
        const cards = document.querySelectorAll('.kpi-card');
        cards.forEach(card => {
            expect(card.classList.contains('animate-in')).toBe(true);
        });
    });
});


// ====================================================================
// CTA FINAL
// ====================================================================
describe('CTA final — ia.html (#contact)', () => {

    beforeEach(() => { setupDOM(CONTACT_HTML); });

    test('section#contact existe', () => {
        expect(CONTACT_HTML.length).toBeGreaterThan(50);
        expect(CONTACT_HTML).toContain('id="contact"');
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

    test('bouton Calendly mentionne "diagnostic IA"', () => {
        const btn = document.querySelector('button[onclick="openCalendly()"]');
        expect(btn.textContent).toMatch(/diagnostic|IA/i);
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

    test('sous-titre mentionne diagnostic gratuit', () => {
        const sub = document.querySelector('.section-subtitle');
        expect(sub.textContent.toLowerCase()).toMatch(/diagnostic|gratuit/i);
    });
});


// ====================================================================
// TRADUCTIONS FR — clés ia.*
// ====================================================================
describe('Traductions FR (lang/fr.json) — ia.*', () => {

    const REQUIRED_KEYS = [
        'title', 'hero_h1', 'hero_subtitle', 'hero_cta',
        'problems_title', 'problems_subtitle',
        'kpi_p1_value', 'kpi_p1_label', 'kpi_p1_source',
        'kpi_p2_value', 'kpi_p2_label', 'kpi_p2_source',
        'kpi_p3_value', 'kpi_p3_label', 'kpi_p3_source',
        'consequences_title',
        'consequence_1', 'consequence_2', 'consequence_3',
        'augmented_title', 'augmented_subtitle',
        'verb_1', 'verb_1_desc', 'verb_2', 'verb_2_desc',
        'verb_3', 'verb_3_desc', 'verb_4', 'verb_4_desc',
        'augmented_key_message',
        'example_title', 'example_subtitle',
        'phase_1_title', 'phase_2_title',
        'result_tag_1', 'result_tag_2', 'result_tag_3',
        'jobs_title', 'jobs_subtitle',
        'job_1_title', 'job_2_title', 'job_3_title', 'job_4_title',
        'job_5_title', 'job_6_title', 'job_7_title',
        'approach_title',
        'approach_1_title', 'approach_1_text',
        'approach_2_title', 'approach_2_text',
        'approach_3_title', 'approach_3_text',
        'results_title', 'results_subtitle',
        'result_kpi_1_value', 'result_kpi_1_label',
        'result_kpi_2_value', 'result_kpi_2_label',
        'result_kpi_3_value', 'result_kpi_3_label',
        'cta_title', 'cta_subtitle', 'cta_btn',
    ];

    test('objet "ia" présent dans fr.json', () => {
        expect(frJson.ia).toBeDefined();
    });

    REQUIRED_KEYS.forEach(key => {
        test(`clé ia.${key} présente et non vide (FR)`, () => {
            expect(frJson.ia[key]).toBeDefined();
            expect(String(frJson.ia[key]).trim()).not.toBe('');
        });
    });

    test('ia.kpi_p1_value contient "40"', () => {
        expect(frJson.ia.kpi_p1_value).toContain('40');
    });

    test('ia.kpi_p2_value contient "68"', () => {
        expect(frJson.ia.kpi_p2_value).toContain('68');
    });

    test('ia.kpi_p1_source mentionne McKinsey', () => {
        expect(frJson.ia.kpi_p1_source).toMatch(/McKinsey/i);
    });

    test('ia.kpi_p2_source mentionne Microsoft', () => {
        expect(frJson.ia.kpi_p2_source).toMatch(/Microsoft/i);
    });

    test('ia.kpi_p3_source mentionne Harvard ou HBR', () => {
        expect(frJson.ia.kpi_p3_source).toMatch(/Harvard|HBR/i);
    });

    test('ia.augmented_key_message contient "commandes"', () => {
        expect(frJson.ia.augmented_key_message).toMatch(/commandes/i);
    });
});


// ====================================================================
// TRADUCTIONS EN — clés ia.*
// ====================================================================
describe('Traductions EN (lang/en.json) — ia.*', () => {

    const REQUIRED_KEYS = [
        'hero_h1', 'hero_subtitle', 'hero_cta',
        'problems_title', 'kpi_p1_value', 'kpi_p2_value', 'kpi_p3_value',
        'kpi_p1_source', 'kpi_p2_source', 'kpi_p3_source',
        'augmented_title', 'verb_1', 'verb_2', 'verb_3', 'verb_4',
        'augmented_key_message',
        'example_title', 'phase_1_title', 'phase_2_title',
        'jobs_title',
        'job_1_title', 'job_2_title', 'job_3_title', 'job_4_title',
        'job_5_title', 'job_6_title', 'job_7_title',
        'approach_title',
        'approach_1_title', 'approach_2_title', 'approach_3_title',
        'results_title',
        'result_kpi_1_value', 'result_kpi_2_value', 'result_kpi_3_value',
        'cta_title', 'cta_btn',
    ];

    test('objet "ia" présent dans en.json', () => {
        expect(enJson.ia).toBeDefined();
    });

    REQUIRED_KEYS.forEach(key => {
        test(`clé ia.${key} présente et non vide (EN)`, () => {
            expect(enJson.ia[key]).toBeDefined();
            expect(String(enJson.ia[key]).trim()).not.toBe('');
        });
    });

    test('ia.kpi_p1_value identique en FR et EN (chiffre universel)', () => {
        expect(enJson.ia.kpi_p1_value).toContain('40');
    });

    test('ia.kpi_p2_value identique en FR et EN', () => {
        expect(enJson.ia.kpi_p2_value).toContain('68');
    });
});


// ====================================================================
// ANIMATIONS — .animate-in sur tous les éléments clés
// ====================================================================
describe('Animations .animate-in — ia.html', () => {

    beforeEach(() => { setupDOM(iaHtml); });

    test('la page a au moins 15 éléments .animate-in', () => {
        const animated = document.querySelectorAll('.animate-in');
        expect(animated.length).toBeGreaterThanOrEqual(15);
    });

    test('chaque .section-title a la classe animate-in', () => {
        const titles = document.querySelectorAll('.section-title');
        titles.forEach(title => {
            expect(title.classList.contains('animate-in')).toBe(true);
        });
    });

    test('le placeholder vidéo dans le hero a animate-in', () => {
        const video = document.querySelector('.hero-video, .placeholder-video');
        expect(video).not.toBeNull();
        expect(video.classList.contains('animate-in')).toBe(true);
    });
});


// ====================================================================
// PAGE STANDALONE — ia.html lisible sans contexte landing
// ====================================================================
describe('Page standalone — ia.html auto-explicative', () => {

    beforeEach(() => { setupDOM(iaHtml); });

    test('la page a un <title> propre mentionnant IA et AgileVizion', () => {
        expect(iaHtml).toMatch(/<title[^>]*>.*IA.*AgileVizion.*<\/title>/i);
    });

    test('la page a une meta description autonome (>50 chars)', () => {
        const match = iaHtml.match(/<meta\s+name="description"\s+content="([^"]+)"/i);
        expect(match).not.toBeNull();
        expect(match[1].length).toBeGreaterThan(50);
    });

    test('la page a une navbar avec lien vers la landing (/)', () => {
        const home = document.querySelector('a[href="/"], a[href="index.html"]');
        expect(home).not.toBeNull();
    });

    test('le lien "IA Agentique" dans la navbar a la classe active', () => {
        const activeLink = document.querySelector('.nav-menu a.active');
        expect(activeLink).not.toBeNull();
        expect(activeLink.getAttribute('href')).toContain('ia');
    });

    test('la page a un footer complet (email, téléphone, LinkedIn)', () => {
        const footer = document.querySelector('footer');
        expect(footer).not.toBeNull();
        expect(footer.innerHTML.toLowerCase()).toContain('linkedin');
        expect(footer.querySelector('a[href^="mailto:"]')).not.toBeNull();
    });

    test('la page a au moins 7 sections distinctes', () => {
        const sections = document.querySelectorAll('section');
        expect(sections.length).toBeGreaterThanOrEqual(7);
    });

    test('la page a un JSON-LD structuré (schema.org Service)', () => {
        expect(iaHtml).toContain('"@type": "Service"');
        expect(iaHtml).toContain('AgileVizion');
    });

    test('la page a des Open Graph meta tags', () => {
        expect(iaHtml).toContain('og:title');
        expect(iaHtml).toContain('og:description');
    });

    test('la page est auto-explicative (définit ce qu\'est un agent IA)', () => {
        // La section employe-augmente doit définir le concept
        setupDOM(AUGMENTE_HTML);
        const sub = document.querySelector('.section-subtitle, p');
        expect(sub).not.toBeNull();
        expect(sub.textContent.toLowerCase()).toMatch(/agent|autonome|tâche/i);
    });
});


// ====================================================================
// STRUCTURE HTML
// ====================================================================
describe('Structure HTML — ia.html', () => {

    test('balise HTML présente avec lang="fr"', () => {
        expect(iaHtml).toContain('<html lang="fr">');
    });

    test('charset UTF-8 déclaré', () => {
        expect(iaHtml).toContain('charset="UTF-8"');
    });

    test('viewport meta tag présent (responsive)', () => {
        expect(iaHtml).toContain('viewport');
        expect(iaHtml).toContain('width=device-width');
    });

    test('CSS variables.css chargé', () => {
        expect(iaHtml).toContain('css/variables.css');
    });

    test('CSS animations.css chargé', () => {
        expect(iaHtml).toContain('css/animations.css');
    });

    test('js/animations.js chargé', () => {
        expect(iaHtml).toContain('js/animations.js');
    });

    test('js/i18n.js chargé', () => {
        expect(iaHtml).toContain('js/i18n.js');
    });

    test('Font Awesome CDN chargé', () => {
        expect(iaHtml).toContain('font-awesome');
    });

    test('Calendly CDN widget.js présent', () => {
        expect(iaHtml).toContain('calendly.com');
    });

    test('pas de style inline interdit (exception : cookie-banner display:none)', () => {
        const inlineStyles = iaHtml.match(/style="[^"]+"/g) || [];
        const forbidden = inlineStyles.filter(s => !s.includes('display:none') && !s.includes('display: none'));
        expect(forbidden.length).toBe(0);
    });

    test('pas de credentials ou tokens dans le code', () => {
        expect(iaHtml).not.toMatch(/password|token|secret|api[_-]?key/i);
    });
});


// ====================================================================
// SÉCURITÉ
// ====================================================================
describe('Sécurité — ia.html', () => {

    test('aucun <script> inline dans le body (hors scripts légitimes)', () => {
        const bodyStart = iaHtml.indexOf('<body');
        const bodyContent = iaHtml.slice(bodyStart);
        const inlineScripts = bodyContent.match(
            /<script(?![^>]*(?:src=|type="application\/ld\+json"))[^>]*>[\s\S]*?<\/script>/gi
        ) || [];
        expect(inlineScripts.length).toBe(0);
    });

    test('pas d\'iframes (vecteur XSS possible)', () => {
        expect(iaHtml.toLowerCase()).not.toContain('<iframe');
    });

    test('liens externes ont rel="noopener" (protection tabnapping)', () => {
        setupDOM(iaHtml);
        const externalLinks = document.querySelectorAll('a[target="_blank"]');
        externalLinks.forEach(link => {
            const rel = link.getAttribute('rel') || '';
            expect(rel).toMatch(/noopener/);
        });
    });

    test('pas de credentials dans les commentaires HTML', () => {
        const comments = iaHtml.match(/<!--[\s\S]*?-->/g) || [];
        comments.forEach(comment => {
            expect(comment).not.toMatch(/password|secret|token/i);
        });
    });

    test('pas de javascript: dans les href/src', () => {
        setupDOM(iaHtml);
        const elems = document.querySelectorAll('[href], [src]');
        elems.forEach(el => {
            const href = el.getAttribute('href') || '';
            const src = el.getAttribute('src') || '';
            expect(href.toLowerCase().startsWith('javascript:')).toBe(false);
            expect(src.toLowerCase().startsWith('javascript:')).toBe(false);
        });
    });
});
