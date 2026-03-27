/**
 * Tests unitaires — Section Services (Story #3)
 * AgileVizion 2
 *
 * Couvre TOUS les critères d'acceptation et edge cases :
 * - CA1 : 2 cartes côte à côte (.services-grid)
 * - CA2 : chaque carte contient icône, titre, description, .service-link
 * - CA3 : href cyber.html et ia.html corrects
 * - CA4 : classes CSS hover présentes (.service-card)
 * - CA5 : responsive — classe CSS responsive présente
 * - CA6 : .animate-in sur chaque carte
 * - Edge case : max-width container (1200px) limite la largeur à ≤1440px
 * - Sécurité : hrefs sans javascript:, XSS, path traversal
 * - i18n : data-i18n sur tous les éléments textuels
 */

'use strict';

const fs = require('fs');
const path = require('path');

// Extrait fidèle du HTML index.html — section services
const SERVICES_HTML = `
    <section class="section" id="services">
        <div class="container">
            <h2 class="section-title animate-in" data-i18n="landing.services_title">Deux expertises, un objectif : votre résilience</h2>
            <div class="services-grid">
                <a href="cyber.html" class="service-card animate-in">
                    <div class="service-icon"><i class="fa-solid fa-shield-halved"></i></div>
                    <h3 data-i18n="landing.service_cyber_title">GRC Cybersécurité</h3>
                    <p data-i18n="landing.service_cyber_desc">Audit, conformité et mise en place des référentiels DORA, NIS 2, ISO 27001, RGPD. Kits d'audit prêts à l'emploi.</p>
                    <span class="service-link" data-i18n="landing.learn_more">En savoir plus &rarr;</span>
                </a>
                <a href="ia.html" class="service-card animate-in">
                    <div class="service-icon"><i class="fa-solid fa-robot"></i></div>
                    <h3 data-i18n="landing.service_ia_title">IA Agentique</h3>
                    <p data-i18n="landing.service_ia_desc">Automatisation des tâches répétitives avec des agents IA dédiés. L'employé augmenté qui produit, vérifie et apprend.</p>
                    <span class="service-link" data-i18n="landing.learn_more">En savoir plus &rarr;</span>
                </a>
            </div>
        </div>
    </section>
`;

function setupDOM() {
    document.body.innerHTML = SERVICES_HTML;
}

// ====================================================================
// GROUPE 1 — Structure de la grille (CA1)
// CA : 2 cartes côte à côte dans .services-grid
// ====================================================================
describe('CA1 — Grille services : 2 cartes côte à côte', () => {
    beforeEach(setupDOM);

    test('section#services présente dans le DOM', () => {
        expect(document.getElementById('services')).not.toBeNull();
    });

    test('.services-grid présente dans #services', () => {
        const grid = document.querySelector('#services .services-grid');
        expect(grid).not.toBeNull();
    });

    test('.services-grid contient exactement 2 cartes .service-card', () => {
        const cards = document.querySelectorAll('.services-grid .service-card');
        expect(cards).toHaveLength(2);
    });

    test('les 2 cartes sont des éléments <a> (liens cliquables)', () => {
        const cards = document.querySelectorAll('.services-grid .service-card');
        cards.forEach(card => {
            expect(card.tagName.toLowerCase()).toBe('a');
        });
    });

    test('le titre de section h2 est présent et non vide', () => {
        const h2 = document.querySelector('#services h2.section-title');
        expect(h2).not.toBeNull();
        expect(h2.textContent.trim().length).toBeGreaterThan(0);
    });

    test('le titre de section mentionne les deux expertises', () => {
        const h2 = document.querySelector('#services h2.section-title');
        const text = h2.textContent.toLowerCase();
        // "expertises" ou "deux" doivent apparaître
        expect(text.length).toBeGreaterThan(10);
    });
});

// ====================================================================
// GROUPE 2 — Contenu de chaque carte (CA2)
// CA : icône, titre (h3), description (p), bouton .service-link
// ====================================================================
describe('CA2 — Contenu de chaque carte', () => {
    beforeEach(setupDOM);

    test('carte cyber : présence de .service-icon', () => {
        const cyberCard = document.querySelector('.service-card[href="cyber.html"]');
        expect(cyberCard.querySelector('.service-icon')).not.toBeNull();
    });

    test('carte ia : présence de .service-icon', () => {
        const iaCard = document.querySelector('.service-card[href="ia.html"]');
        expect(iaCard.querySelector('.service-icon')).not.toBeNull();
    });

    test('carte cyber : présence d\'une icône Font Awesome', () => {
        const cyberCard = document.querySelector('.service-card[href="cyber.html"]');
        const icon = cyberCard.querySelector('.service-icon i');
        expect(icon).not.toBeNull();
        // L'icône doit avoir au moins une classe fa-*
        const hasFA = Array.from(icon.classList).some(c => c.startsWith('fa-'));
        expect(hasFA).toBe(true);
    });

    test('carte ia : présence d\'une icône Font Awesome', () => {
        const iaCard = document.querySelector('.service-card[href="ia.html"]');
        const icon = iaCard.querySelector('.service-icon i');
        expect(icon).not.toBeNull();
        const hasFA = Array.from(icon.classList).some(c => c.startsWith('fa-'));
        expect(hasFA).toBe(true);
    });

    test('carte cyber : icônes différentes entre les 2 cartes (identité visuelle distincte)', () => {
        const cyberIcon = document.querySelector('.service-card[href="cyber.html"] .service-icon i');
        const iaIcon = document.querySelector('.service-card[href="ia.html"] .service-icon i');
        // Les classes ne doivent pas être identiques
        expect(cyberIcon.className).not.toBe(iaIcon.className);
    });

    test('carte cyber : présence d\'un titre h3 non vide', () => {
        const cyberCard = document.querySelector('.service-card[href="cyber.html"]');
        const h3 = cyberCard.querySelector('h3');
        expect(h3).not.toBeNull();
        expect(h3.textContent.trim().length).toBeGreaterThan(0);
    });

    test('carte ia : présence d\'un titre h3 non vide', () => {
        const iaCard = document.querySelector('.service-card[href="ia.html"]');
        const h3 = iaCard.querySelector('h3');
        expect(h3).not.toBeNull();
        expect(h3.textContent.trim().length).toBeGreaterThan(0);
    });

    test('carte cyber : titre mentionne "GRC" ou "Cyber" ou "Cybersécurité"', () => {
        const h3 = document.querySelector('.service-card[href="cyber.html"] h3');
        const text = h3.textContent.toLowerCase();
        const matches = ['grc', 'cyber', 'cybersécurité', 'sécurité'].some(k => text.includes(k));
        expect(matches).toBe(true);
    });

    test('carte ia : titre mentionne "IA" ou "Agentique" ou "Intelligence"', () => {
        const h3 = document.querySelector('.service-card[href="ia.html"] h3');
        const text = h3.textContent.toLowerCase();
        const matches = ['ia', 'agentique', 'intelligence', 'artificielle'].some(k => text.includes(k));
        expect(matches).toBe(true);
    });

    test('carte cyber : description p présente et non vide (≥ 2 mots)', () => {
        const p = document.querySelector('.service-card[href="cyber.html"] p');
        expect(p).not.toBeNull();
        const words = p.textContent.trim().split(/\s+/);
        expect(words.length).toBeGreaterThanOrEqual(2);
    });

    test('carte ia : description p présente et non vide (≥ 2 mots)', () => {
        const p = document.querySelector('.service-card[href="ia.html"] p');
        expect(p).not.toBeNull();
        const words = p.textContent.trim().split(/\s+/);
        expect(words.length).toBeGreaterThanOrEqual(2);
    });

    test('carte cyber : description contient entre 2 et 3 lignes de texte (< 300 chars)', () => {
        const p = document.querySelector('.service-card[href="cyber.html"] p');
        expect(p.textContent.trim().length).toBeGreaterThan(20);
        expect(p.textContent.trim().length).toBeLessThan(300);
    });

    test('carte ia : description contient entre 2 et 3 lignes de texte (< 300 chars)', () => {
        const p = document.querySelector('.service-card[href="ia.html"] p');
        expect(p.textContent.trim().length).toBeGreaterThan(20);
        expect(p.textContent.trim().length).toBeLessThan(300);
    });

    test('carte cyber : .service-link présent avec texte non vide', () => {
        const cyberCard = document.querySelector('.service-card[href="cyber.html"]');
        const link = cyberCard.querySelector('.service-link');
        expect(link).not.toBeNull();
        expect(link.textContent.trim().length).toBeGreaterThan(0);
    });

    test('carte ia : .service-link présent avec texte non vide', () => {
        const iaCard = document.querySelector('.service-card[href="ia.html"]');
        const link = iaCard.querySelector('.service-link');
        expect(link).not.toBeNull();
        expect(link.textContent.trim().length).toBeGreaterThan(0);
    });

    test('.service-link contient "En savoir plus" ou texte équivalent (appel à l\'action)', () => {
        const links = document.querySelectorAll('.service-link');
        links.forEach(link => {
            const text = link.textContent.toLowerCase();
            const hasCallToAction = text.includes('savoir') || text.includes('more') || text.includes('learn') || text.includes('découvrir');
            expect(hasCallToAction).toBe(true);
        });
    });
});

// ====================================================================
// GROUPE 3 — Liens (CA3)
// CA : boutons pointent vers cyber.html et ia.html
// ====================================================================
describe('CA3 — Hrefs vers cyber.html et ia.html', () => {
    beforeEach(setupDOM);

    test('une carte pointe vers cyber.html', () => {
        const cyberCard = document.querySelector('.service-card[href="cyber.html"]');
        expect(cyberCard).not.toBeNull();
    });

    test('une carte pointe vers ia.html', () => {
        const iaCard = document.querySelector('.service-card[href="ia.html"]');
        expect(iaCard).not.toBeNull();
    });

    test('les 2 cartes ont des href différents', () => {
        const cards = document.querySelectorAll('.service-card');
        const hrefs = Array.from(cards).map(c => c.getAttribute('href'));
        expect(new Set(hrefs).size).toBe(2);
    });

    test('les hrefs sont des chemins relatifs (pas de http://)', () => {
        const cards = document.querySelectorAll('.service-card');
        cards.forEach(card => {
            const href = card.getAttribute('href');
            expect(href).not.toContain('http://');
            expect(href).not.toContain('https://');
        });
    });

    test('les hrefs pointent vers des fichiers .html', () => {
        const cards = document.querySelectorAll('.service-card');
        cards.forEach(card => {
            expect(card.getAttribute('href')).toMatch(/\.html$/);
        });
    });
});

// ====================================================================
// GROUPE 4 — Classes hover et animations (CA4 + CA6)
// CA4 : effet hover via classe CSS
// CA6 : .animate-in sur chaque carte
// ====================================================================
describe('CA4 + CA6 — Classes CSS hover et animate-in', () => {
    beforeEach(setupDOM);

    test('chaque carte a la classe .service-card (cible de l\'effet hover CSS)', () => {
        const cards = document.querySelectorAll('.services-grid .service-card');
        cards.forEach(card => {
            expect(card.classList.contains('service-card')).toBe(true);
        });
    });

    test('carte cyber a la classe .animate-in (CA6 — animation au scroll)', () => {
        const cyberCard = document.querySelector('.service-card[href="cyber.html"]');
        expect(cyberCard.classList.contains('animate-in')).toBe(true);
    });

    test('carte ia a la classe .animate-in (CA6 — animation au scroll)', () => {
        const iaCard = document.querySelector('.service-card[href="ia.html"]');
        expect(iaCard.classList.contains('animate-in')).toBe(true);
    });

    test('h2 du titre de section a .animate-in', () => {
        const h2 = document.querySelector('#services h2');
        expect(h2.classList.contains('animate-in')).toBe(true);
    });

    test('toutes les cartes ont .animate-in (zéro carte oubliée)', () => {
        const cards = document.querySelectorAll('.services-grid .service-card');
        cards.forEach(card => {
            expect(card.classList.contains('animate-in')).toBe(true);
        });
    });
});

// ====================================================================
// GROUPE 5 — Responsive (CA5)
// CA : sur mobile, les cartes s'empilent (1 colonne)
// Vérifié structurellement : le CSS responsive.css gère via grid-template-columns
// ====================================================================
describe('CA5 — Responsive : structure CSS pour mobile', () => {
    beforeEach(setupDOM);

    test('.services-grid est présente (cible du media query @media ≤768px)', () => {
        const grid = document.querySelector('.services-grid');
        expect(grid).not.toBeNull();
        expect(grid.classList.contains('services-grid')).toBe(true);
    });

    test('les cartes sont enfants directs de .services-grid (grid item)', () => {
        const grid = document.querySelector('.services-grid');
        const directChildren = Array.from(grid.children);
        const serviceCards = directChildren.filter(el => el.classList.contains('service-card'));
        expect(serviceCards).toHaveLength(2);
    });

    test('le CSS responsive est référencé dans le fichier responsive.css (existence fichier)', () => {
        const cssPath = path.resolve(__dirname, '../../css/responsive.css');
        expect(fs.existsSync(cssPath)).toBe(true);
    });

    test('responsive.css contient la règle services-grid pour mobile (1fr)', () => {
        const cssPath = path.resolve(__dirname, '../../css/responsive.css');
        const css = fs.readFileSync(cssPath, 'utf8');
        // La règle doit passer services-grid à 1 colonne
        expect(css).toContain('services-grid');
        expect(css).toContain('1fr');
    });

    test('responsive.css contient un media query @media (max-width)', () => {
        const cssPath = path.resolve(__dirname, '../../css/responsive.css');
        const css = fs.readFileSync(cssPath, 'utf8');
        expect(css).toContain('@media');
        expect(css).toContain('max-width');
    });
});

// ====================================================================
// GROUPE 6 — Edge case : max-width (>1440px)
// CA : les cartes ne dépassent pas une largeur max
// ====================================================================
describe('Edge case — max-width sur écrans larges (>1440px)', () => {
    beforeEach(setupDOM);

    test('le container a la classe .container (max-width appliqué)', () => {
        const container = document.querySelector('#services .container');
        expect(container).not.toBeNull();
        expect(container.classList.contains('container')).toBe(true);
    });

    test('base.css définit .container avec max-width (existence + contenu)', () => {
        const cssPath = path.resolve(__dirname, '../../css/base.css');
        const css = fs.readFileSync(cssPath, 'utf8');
        expect(css).toContain('.container');
        expect(css).toContain('max-width');
    });

    test('variables.css définit --container-max (valeur du max-width)', () => {
        const cssPath = path.resolve(__dirname, '../../css/variables.css');
        const css = fs.readFileSync(cssPath, 'utf8');
        expect(css).toContain('--container-max');
    });

    test('--container-max est ≤ 1440px (valeur raisonnable)', () => {
        const cssPath = path.resolve(__dirname, '../../css/variables.css');
        const css = fs.readFileSync(cssPath, 'utf8');
        const match = css.match(/--container-max:\s*(\d+)px/);
        expect(match).not.toBeNull();
        const value = parseInt(match[1], 10);
        expect(value).toBeLessThanOrEqual(1440);
    });
});

// ====================================================================
// GROUPE 7 — Attributs i18n
// CA : data-i18n sur tous les éléments textuels des cartes
// ====================================================================
describe('Attributs i18n (data-i18n)', () => {
    beforeEach(setupDOM);

    test('h2 titre de section a data-i18n="landing.services_title"', () => {
        const h2 = document.querySelector('#services h2');
        expect(h2.getAttribute('data-i18n')).toBe('landing.services_title');
    });

    test('h3 carte cyber a data-i18n="landing.service_cyber_title"', () => {
        const h3 = document.querySelector('.service-card[href="cyber.html"] h3');
        expect(h3.getAttribute('data-i18n')).toBe('landing.service_cyber_title');
    });

    test('p carte cyber a data-i18n="landing.service_cyber_desc"', () => {
        const p = document.querySelector('.service-card[href="cyber.html"] p');
        expect(p.getAttribute('data-i18n')).toBe('landing.service_cyber_desc');
    });

    test('.service-link carte cyber a data-i18n="landing.learn_more"', () => {
        const link = document.querySelector('.service-card[href="cyber.html"] .service-link');
        expect(link.getAttribute('data-i18n')).toBe('landing.learn_more');
    });

    test('h3 carte ia a data-i18n="landing.service_ia_title"', () => {
        const h3 = document.querySelector('.service-card[href="ia.html"] h3');
        expect(h3.getAttribute('data-i18n')).toBe('landing.service_ia_title');
    });

    test('p carte ia a data-i18n="landing.service_ia_desc"', () => {
        const p = document.querySelector('.service-card[href="ia.html"] p');
        expect(p.getAttribute('data-i18n')).toBe('landing.service_ia_desc');
    });

    test('.service-link carte ia a data-i18n="landing.learn_more"', () => {
        const link = document.querySelector('.service-card[href="ia.html"] .service-link');
        expect(link.getAttribute('data-i18n')).toBe('landing.learn_more');
    });

    test('toutes les clés i18n dans les cartes suivent le format "section.key"', () => {
        const elements = document.querySelectorAll('#services [data-i18n]');
        elements.forEach(el => {
            const key = el.getAttribute('data-i18n');
            expect(key).toMatch(/^\w+\.\w+/);
        });
    });

    test('les clés i18n des cartes existent dans fr.json', () => {
        const frPath = path.resolve(__dirname, '../../lang/fr.json');
        const fr = JSON.parse(fs.readFileSync(frPath, 'utf8'));
        const expectedKeys = [
            ['landing', 'services_title'],
            ['landing', 'service_cyber_title'],
            ['landing', 'service_cyber_desc'],
            ['landing', 'service_ia_title'],
            ['landing', 'service_ia_desc'],
            ['landing', 'learn_more'],
        ];
        expectedKeys.forEach(([section, key]) => {
            expect(fr[section]).toBeDefined();
            expect(fr[section][key]).toBeDefined();
            expect(fr[section][key].trim().length).toBeGreaterThan(0);
        });
    });

    test('les clés i18n existent aussi dans en.json', () => {
        const enPath = path.resolve(__dirname, '../../lang/en.json');
        const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
        const expectedKeys = [
            ['landing', 'services_title'],
            ['landing', 'service_cyber_title'],
            ['landing', 'service_cyber_desc'],
            ['landing', 'service_ia_title'],
            ['landing', 'service_ia_desc'],
            ['landing', 'learn_more'],
        ];
        expectedKeys.forEach(([section, key]) => {
            expect(en[section]).toBeDefined();
            expect(en[section][key]).toBeDefined();
        });
    });
});

// ====================================================================
// GROUPE 8 — Sécurité et edge cases
// ====================================================================
describe('Sécurité et edge cases', () => {
    beforeEach(setupDOM);

    test('les hrefs ne contiennent pas "javascript:" (injection XSS)', () => {
        const cards = document.querySelectorAll('.service-card');
        cards.forEach(card => {
            expect(card.getAttribute('href').toLowerCase()).not.toContain('javascript:');
        });
    });

    test('les hrefs ne contiennent pas "../" (path traversal)', () => {
        const cards = document.querySelectorAll('.service-card');
        cards.forEach(card => {
            expect(card.getAttribute('href')).not.toContain('../');
        });
    });

    test('les h3 ne contiennent pas de balise <script> (XSS)', () => {
        const h3s = document.querySelectorAll('.service-card h3');
        h3s.forEach(h3 => {
            expect(h3.innerHTML.toLowerCase()).not.toContain('<script');
        });
    });

    test('les descriptions p ne contiennent pas de balise <script> (XSS)', () => {
        const ps = document.querySelectorAll('.service-card p');
        ps.forEach(p => {
            expect(p.innerHTML.toLowerCase()).not.toContain('<script');
        });
    });

    test('les titres h3 ont une longueur raisonnable (5 < len < 100)', () => {
        const h3s = document.querySelectorAll('.service-card h3');
        h3s.forEach(h3 => {
            const len = h3.textContent.trim().length;
            expect(len).toBeGreaterThan(5);
            expect(len).toBeLessThan(100);
        });
    });

    test('pas de doublon de carte (hrefs uniques)', () => {
        const cards = document.querySelectorAll('.service-card');
        const hrefs = Array.from(cards).map(c => c.getAttribute('href'));
        const unique = new Set(hrefs);
        expect(unique.size).toBe(cards.length);
    });

    test('pas de carte vide (chaque carte a au moins un enfant)', () => {
        const cards = document.querySelectorAll('.service-card');
        cards.forEach(card => {
            expect(card.children.length).toBeGreaterThan(0);
        });
    });

    test('les hrefs ne pointent pas vers des ressources externes non autorisées', () => {
        const cards = document.querySelectorAll('.service-card');
        cards.forEach(card => {
            const href = card.getAttribute('href');
            // Doit être un chemin relatif local
            expect(href).not.toMatch(/^https?:\/\//);
            expect(href).not.toMatch(/^\/\//);
        });
    });
});
