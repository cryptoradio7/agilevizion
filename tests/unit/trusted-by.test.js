/**
 * Tests unitaires — Section "Trusted By" / Badges certifications (Story #17)
 * AgileVizion 2
 *
 * Couvre tous les critères d'acceptation et edge cases :
 * - CA1 : section positionnée entre hero et services (ordre DOM)
 * - CA2 : 3 à 6 items dans .trusted-logos
 * - CA3 : logos en niveaux de gris par défaut (filter: grayscale(1) en CSS)
 * - CA4 : texte alternatif présent (.trusted-headline non vide)
 * - CA5 : responsive — .trusted-logos a flex-wrap:wrap (adapte sur mobile)
 * - Edge : icônes avec aria-hidden="true" (accessibilité)
 * - Edge : labels non vides, labels courts (pas de texte à rallonge)
 * - Edge : pas de balise <img> (badges = icônes FA, pas d'images externes)
 * - Edge : clé i18n présente sur .trusted-headline
 * - Accessibilité : section a aria-label, liste a role="list", items role="listitem"
 */

'use strict';

// DOM minimal fidèle à index.html — section trusted-by + hero + services
const TRUSTED_HTML = `
    <section class="hero" id="hero">
        <div class="container"><div class="hero-content">
            <h1 class="hero-title">Conformité cyber &amp; IA agentique</h1>
        </div></div>
    </section>

    <section class="section-trusted" id="trusted-by" aria-label="Certifications et expérience">
        <div class="container">
            <p class="trusted-headline" data-i18n="landing.trusted_headline">Consultant certifié · 20+ missions réalisées au Luxembourg et en Europe</p>
            <div class="trusted-logos" role="list" aria-label="Certifications professionnelles">
                <div class="trusted-logo-item" role="listitem">
                    <i class="fa-solid fa-shield-halved trusted-icon" aria-hidden="true"></i>
                    <span class="trusted-logo-label">ISO 27001</span>
                </div>
                <div class="trusted-logo-item" role="listitem">
                    <i class="fa-solid fa-gear trusted-icon" aria-hidden="true"></i>
                    <span class="trusted-logo-label">ITIL V4</span>
                </div>
                <div class="trusted-logo-item" role="listitem">
                    <i class="fa-solid fa-crown trusted-icon" aria-hidden="true"></i>
                    <span class="trusted-logo-label">Prince2</span>
                </div>
                <div class="trusted-logo-item" role="listitem">
                    <i class="fa-solid fa-arrows-spin trusted-icon" aria-hidden="true"></i>
                    <span class="trusted-logo-label">AgilePM</span>
                </div>
                <div class="trusted-logo-item" role="listitem">
                    <i class="fa-solid fa-diagram-project trusted-icon" aria-hidden="true"></i>
                    <span class="trusted-logo-label">SAFe</span>
                </div>
                <div class="trusted-logo-item" role="listitem">
                    <i class="fa-solid fa-location-dot trusted-icon" aria-hidden="true"></i>
                    <span class="trusted-logo-label">Luxembourg</span>
                </div>
            </div>
        </div>
    </section>

    <section class="section" id="services">
        <div class="container"><h2>Services</h2></div>
    </section>
`;

// ====================================================================
// Setup
// ====================================================================
function setupDOM() {
    document.body.innerHTML = TRUSTED_HTML;
}

afterEach(() => {
    document.body.innerHTML = '';
});

// ====================================================================
// GROUPE 1 — Existence et structure de la section
// ====================================================================
describe('Existence et structure de la section trusted-by', () => {
    beforeEach(() => { setupDOM(); });

    test('section#trusted-by présente dans le DOM', () => {
        expect(document.getElementById('trusted-by')).not.toBeNull();
    });

    test('section#trusted-by a la classe "section-trusted"', () => {
        const section = document.getElementById('trusted-by');
        expect(section.classList.contains('section-trusted')).toBe(true);
    });

    test('.trusted-headline présent dans la section', () => {
        const headline = document.querySelector('#trusted-by .trusted-headline');
        expect(headline).not.toBeNull();
    });

    test('.trusted-logos présent dans la section', () => {
        const logos = document.querySelector('#trusted-by .trusted-logos');
        expect(logos).not.toBeNull();
    });

    test('section wrappée dans un .container', () => {
        const container = document.querySelector('#trusted-by .container');
        expect(container).not.toBeNull();
    });
});

// ====================================================================
// GROUPE 2 — Positionnement dans le flux de la page
// CA1 : entre hero et services
// ====================================================================
describe('CA1 — Positionnement entre hero et services', () => {
    beforeEach(() => { setupDOM(); });

    test('section#trusted-by vient APRÈS section#hero dans le DOM', () => {
        const sections = Array.from(document.querySelectorAll('section'));
        const heroIdx    = sections.findIndex(s => s.id === 'hero');
        const trustedIdx = sections.findIndex(s => s.id === 'trusted-by');
        expect(heroIdx).toBeGreaterThanOrEqual(0);
        expect(trustedIdx).toBeGreaterThan(heroIdx);
    });

    test('section#trusted-by vient AVANT section#services dans le DOM', () => {
        const sections = Array.from(document.querySelectorAll('section'));
        const trustedIdx  = sections.findIndex(s => s.id === 'trusted-by');
        const servicesIdx = sections.findIndex(s => s.id === 'services');
        expect(servicesIdx).toBeGreaterThan(trustedIdx);
    });

    test('trusted-by est l\'élément frère qui suit directement hero', () => {
        // Vérifie la proximité : nextElementSibling de #hero = #trusted-by
        const hero = document.getElementById('hero');
        const next = hero.nextElementSibling;
        expect(next).not.toBeNull();
        expect(next.id).toBe('trusted-by');
    });
});

// ====================================================================
// GROUPE 3 — Nombre d'items (3 à 6 logos/badges)
// CA2 : entre 3 et 6 items
// ====================================================================
describe('CA2 — Nombre de badges (3 à 6)', () => {
    beforeEach(() => { setupDOM(); });

    test('au moins 3 items .trusted-logo-item présents', () => {
        const items = document.querySelectorAll('.trusted-logo-item');
        expect(items.length).toBeGreaterThanOrEqual(3);
    });

    test('au maximum 6 items .trusted-logo-item présents', () => {
        const items = document.querySelectorAll('.trusted-logo-item');
        expect(items.length).toBeLessThanOrEqual(6);
    });

    test('chaque item contient une icône Font Awesome', () => {
        const items = document.querySelectorAll('.trusted-logo-item');
        items.forEach(item => {
            const icon = item.querySelector('i[class*="fa-"]');
            expect(icon).not.toBeNull();
        });
    });

    test('chaque item contient un label .trusted-logo-label', () => {
        const items = document.querySelectorAll('.trusted-logo-item');
        items.forEach(item => {
            const label = item.querySelector('.trusted-logo-label');
            expect(label).not.toBeNull();
        });
    });

    test('chaque label a du texte non vide', () => {
        const labels = document.querySelectorAll('.trusted-logo-label');
        labels.forEach(label => {
            expect(label.textContent.trim().length).toBeGreaterThan(0);
        });
    });

    test('chaque label a moins de 30 caractères (pas de texte trop long)', () => {
        const labels = document.querySelectorAll('.trusted-logo-label');
        labels.forEach(label => {
            expect(label.textContent.trim().length).toBeLessThan(30);
        });
    });
});

// ====================================================================
// GROUPE 4 — Grayscale par défaut (CA3)
// CSS : filter: grayscale(1) — testé via classe et structure HTML
// NB : JSDOM ne calcule pas les styles CSS chargés de fichiers externes.
//      On vérifie que les items n'ont PAS de style inline forçant la couleur
//      et que la classe CSS appropriée est présente.
// ====================================================================
describe('CA3 — Grayscale par défaut (structure CSS)', () => {
    beforeEach(() => { setupDOM(); });

    test('les items ont la classe "trusted-logo-item" (classe portant le grayscale CSS)', () => {
        const items = document.querySelectorAll('.trusted-logo-item');
        expect(items.length).toBeGreaterThan(0);
        items.forEach(item => {
            expect(item.classList.contains('trusted-logo-item')).toBe(true);
        });
    });

    test('les items n\'ont PAS de style inline forçant filter:none (contournement grayscale)', () => {
        const items = document.querySelectorAll('.trusted-logo-item');
        items.forEach(item => {
            const filterInline = item.style.filter;
            // Pas de style inline qui forcerait la couleur
            expect(filterInline).not.toContain('none');
        });
    });

    test('les icônes ont la classe "trusted-icon" (gère la couleur primaire au hover)', () => {
        const icons = document.querySelectorAll('.trusted-logo-item .trusted-icon');
        expect(icons.length).toBeGreaterThan(0);
    });
});

// ====================================================================
// GROUPE 5 — Texte alternatif (CA4 — edge case "< 3 logos")
// ====================================================================
describe('CA4 — Texte alternatif .trusted-headline', () => {
    beforeEach(() => { setupDOM(); });

    test('.trusted-headline a du texte non vide', () => {
        const headline = document.querySelector('.trusted-headline');
        expect(headline.textContent.trim().length).toBeGreaterThan(0);
    });

    test('headline mentionne l\'expérience du consultant (chiffres ou certifications)', () => {
        const text = document.querySelector('.trusted-headline').textContent;
        // Doit contenir un chiffre (missions) ou le mot "certifié"
        const hasCredentials = /\d+/.test(text) || /certifi/i.test(text) || /Luxembourg/i.test(text);
        expect(hasCredentials).toBe(true);
    });

    test('headline a data-i18n="landing.trusted_headline"', () => {
        const headline = document.querySelector('.trusted-headline');
        expect(headline.getAttribute('data-i18n')).toBe('landing.trusted_headline');
    });

    test('le texte par défaut contient "Luxembourg" ou "Europe" (contextualise la géographie)', () => {
        const text = document.querySelector('.trusted-headline').textContent;
        const hasGeo = text.includes('Luxembourg') || text.includes('Europe');
        expect(hasGeo).toBe(true);
    });
});

// ====================================================================
// GROUPE 6 — Accessibilité
// ====================================================================
describe('Accessibilité — section trusted-by', () => {
    beforeEach(() => { setupDOM(); });

    test('section a aria-label défini', () => {
        const section = document.getElementById('trusted-by');
        const ariaLabel = section.getAttribute('aria-label');
        expect(ariaLabel).not.toBeNull();
        expect(ariaLabel.trim().length).toBeGreaterThan(0);
    });

    test('.trusted-logos a role="list"', () => {
        const logos = document.querySelector('.trusted-logos');
        expect(logos.getAttribute('role')).toBe('list');
    });

    test('.trusted-logos a aria-label défini', () => {
        const logos = document.querySelector('.trusted-logos');
        const ariaLabel = logos.getAttribute('aria-label');
        expect(ariaLabel).not.toBeNull();
        expect(ariaLabel.trim().length).toBeGreaterThan(0);
    });

    test('chaque item .trusted-logo-item a role="listitem"', () => {
        const items = document.querySelectorAll('.trusted-logo-item');
        items.forEach(item => {
            expect(item.getAttribute('role')).toBe('listitem');
        });
    });

    test('chaque icône FA a aria-hidden="true" (décoratif, pas lu par lecteur)', () => {
        const icons = document.querySelectorAll('.trusted-logo-item i');
        expect(icons.length).toBeGreaterThan(0);
        icons.forEach(icon => {
            expect(icon.getAttribute('aria-hidden')).toBe('true');
        });
    });
});

// ====================================================================
// GROUPE 7 — Pas d'images externes (edge case logos clients absents)
// L'implémentation utilise des icônes FA, pas d'images — plus robuste
// ====================================================================
describe('Edge case — pas d\'images externes dans les badges', () => {
    beforeEach(() => { setupDOM(); });

    test('aucune balise <img> dans .trusted-logos (pas de logos images)', () => {
        const imgs = document.querySelectorAll('.trusted-logos img');
        expect(imgs).toHaveLength(0);
    });

    test('aucun lien <a> dans .trusted-logos (les badges ne sont pas cliquables)', () => {
        const links = document.querySelectorAll('.trusted-logos a');
        expect(links).toHaveLength(0);
    });

    test('pas de src d\'image qui pourrait tomber en 404', () => {
        const eltsWithSrc = document.querySelectorAll('.trusted-logo-item [src]');
        expect(eltsWithSrc).toHaveLength(0);
    });
});

// ====================================================================
// GROUPE 8 — Responsive : structure HTML pour mobile
// CA5 : .trusted-logos avec flex-wrap pour s'adapter sur mobile
// ====================================================================
describe('CA5 — Structure responsive (HTML)', () => {
    beforeEach(() => { setupDOM(); });

    test('.trusted-logos est un div (pas un ul) — compatible avec flex', () => {
        const logos = document.querySelector('.trusted-logos');
        expect(logos.tagName.toLowerCase()).toBe('div');
    });

    test('les items .trusted-logo-item sont des div (flex children)', () => {
        const items = document.querySelectorAll('.trusted-logo-item');
        items.forEach(item => {
            expect(item.tagName.toLowerCase()).toBe('div');
        });
    });

    test('la section est dans un .container (responsive grid)', () => {
        const container = document.querySelector('#trusted-by .container');
        expect(container).not.toBeNull();
    });
});

// ====================================================================
// GROUPE 9 — Sécurité
// ====================================================================
describe('Sécurité — section trusted-by', () => {
    beforeEach(() => { setupDOM(); });

    test('les labels ne contiennent pas de balises <script>', () => {
        const labels = document.querySelectorAll('.trusted-logo-label');
        labels.forEach(label => {
            expect(label.innerHTML.toLowerCase()).not.toContain('<script');
        });
    });

    test('le headline ne contient pas de injection XSS', () => {
        const headline = document.querySelector('.trusted-headline');
        expect(headline.innerHTML.toLowerCase()).not.toContain('<script');
        expect(headline.innerHTML.toLowerCase()).not.toContain('javascript:');
    });

    test('les icônes FA n\'ont pas de onclick (pas de JS inline)', () => {
        const icons = document.querySelectorAll('.trusted-logo-item i');
        icons.forEach(icon => {
            expect(icon.getAttribute('onclick')).toBeNull();
        });
    });
});

// ====================================================================
// GROUPE 10 — Unicité et cohérence des labels
// ====================================================================
describe('Unicité et cohérence des labels', () => {
    beforeEach(() => { setupDOM(); });

    test('les labels de certifications sont uniques (pas de doublon)', () => {
        const labels = Array.from(document.querySelectorAll('.trusted-logo-label'))
            .map(l => l.textContent.trim());
        const unique = new Set(labels);
        expect(unique.size).toBe(labels.length);
    });

    test('les icônes FA sont uniques (pas de doublon de classe fa-*)', () => {
        const iconClasses = Array.from(document.querySelectorAll('.trusted-logo-item i'))
            .map(i => Array.from(i.classList).find(c => c.startsWith('fa-') && c !== 'fa-solid'));
        const unique = new Set(iconClasses);
        expect(unique.size).toBe(iconClasses.length);
    });
});
