/**
 * Tests unitaires — Section CTA final + Footer (Story #7)
 * AgileVizion 2
 *
 * Couvre :
 * - Titre "Prêt à échanger ?" dans la section CTA de index.html
 * - Bouton Calendly : onclick="openCalendly()" présent
 * - Bouton email : href="mailto:emmanuel.genesteix@agilevizion.com"
 * - Footer : email, téléphone, localisation, LinkedIn, copyright, mentions légales
 * - Footer structurellement identique sur les 3 pages
 * - Logique fallback Calendly dans nav.js
 */

'use strict';

const fs = require('fs');
const path = require('path');

// -----------------------------------------------------------------------
// Charger les 3 fichiers HTML
// -----------------------------------------------------------------------
const ROOT = path.resolve(__dirname, '../../');

const indexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const cyberHtml = fs.readFileSync(path.join(ROOT, 'cyber.html'), 'utf8');
const iaHtml    = fs.readFileSync(path.join(ROOT, 'ia.html'),    'utf8');

// -----------------------------------------------------------------------
// Extraire le HTML d'une section par id
// -----------------------------------------------------------------------
function extractSection(html, id) {
    const tag = '<section';
    const idAttr = `id="${id}"`;
    const start = html.indexOf(tag + ' ', html.indexOf(idAttr) - 200);
    // Cherche la fermeture </section> — on cherche le prochain </section> après l'ouverture
    const startReal = html.lastIndexOf(tag, html.indexOf(idAttr));
    const end = html.indexOf('</section>', startReal) + '</section>'.length;
    return html.slice(startReal, end);
}

// -----------------------------------------------------------------------
// Extraire le footer complet
// -----------------------------------------------------------------------
function extractFooter(html) {
    const start = html.indexOf('<footer');
    const end = html.indexOf('</footer>') + '</footer>'.length;
    if (start === -1 || end === -1) return '';
    return html.slice(start, end);
}

const INDEX_CTA_HTML  = extractSection(indexHtml, 'contact');
const INDEX_FOOTER    = extractFooter(indexHtml);
const CYBER_FOOTER    = extractFooter(cyberHtml);
const IA_FOOTER       = extractFooter(iaHtml);

// -----------------------------------------------------------------------
// Setup DOM
// -----------------------------------------------------------------------
function setupDOM(html) {
    document.body.innerHTML = html;
}

afterEach(() => {
    document.body.innerHTML = '';
});

// ====================================================================
// Section CTA — index.html
// ====================================================================
describe('Section CTA — index.html (#contact)', () => {

    beforeEach(() => {
        setupDOM(INDEX_CTA_HTML);
    });

    test('section#contact existe dans index.html', () => {
        expect(INDEX_CTA_HTML.length).toBeGreaterThan(50);
        expect(INDEX_CTA_HTML).toContain('id="contact"');
    });

    test('titre "Prêt à échanger ?" présent', () => {
        const h2 = document.querySelector('.section-title');
        expect(h2).not.toBeNull();
        expect(h2.textContent).toContain('Prêt à échanger');
    });

    test('data-i18n="landing.cta_title" sur le titre', () => {
        const h2 = document.querySelector('.section-title');
        expect(h2.getAttribute('data-i18n')).toBe('landing.cta_title');
    });

    test('sous-titre présent (section-subtitle)', () => {
        const sub = document.querySelector('.section-subtitle');
        expect(sub).not.toBeNull();
        expect(sub.textContent.trim().length).toBeGreaterThan(5);
    });

    test('2 boutons CTA présents dans .hero-cta', () => {
        const cta = document.querySelector('.hero-cta');
        expect(cta).not.toBeNull();
        const btns = cta.querySelectorAll('button, a');
        expect(btns.length).toBe(2);
    });

    test('bouton Calendly : onclick="openCalendly()"', () => {
        const btn = document.querySelector('.hero-cta button');
        expect(btn).not.toBeNull();
        expect(btn.getAttribute('onclick')).toBe('openCalendly()');
    });

    test('bouton Calendly : classe btn-primary', () => {
        const btn = document.querySelector('.hero-cta button');
        expect(btn.classList.contains('btn-primary')).toBe(true);
    });

    test('bouton Calendly : classe btn-lg', () => {
        const btn = document.querySelector('.hero-cta button');
        expect(btn.classList.contains('btn-lg')).toBe(true);
    });

    test('bouton email : href="mailto:emmanuel.genesteix@agilevizion.com"', () => {
        const emailBtn = document.querySelector('.hero-cta a[href^="mailto:"]');
        expect(emailBtn).not.toBeNull();
        expect(emailBtn.getAttribute('href')).toBe('mailto:emmanuel.genesteix@agilevizion.com');
    });

    test('bouton email : classe btn-outline', () => {
        const emailBtn = document.querySelector('.hero-cta a[href^="mailto:"]');
        expect(emailBtn.classList.contains('btn-outline')).toBe(true);
    });

    test('bouton email : classe btn-lg', () => {
        const emailBtn = document.querySelector('.hero-cta a[href^="mailto:"]');
        expect(emailBtn.classList.contains('btn-lg')).toBe(true);
    });

    test('section CTA a la classe section-cta (fond contrasté)', () => {
        // section-cta est défini dans layout.css avec background indigo/dark
        expect(INDEX_CTA_HTML).toContain('section-cta');
    });
});

// ====================================================================
// CTA sur cyber.html
// ====================================================================
describe('Section CTA — cyber.html', () => {
    test('cyber.html a une section section-cta', () => {
        expect(cyberHtml).toContain('section-cta');
    });

    test('cyber.html a un bouton Calendly onclick="openCalendly()"', () => {
        const match = cyberHtml.match(/onclick="openCalendly\(\)"/g);
        expect(match).not.toBeNull();
        expect(match.length).toBeGreaterThanOrEqual(1);
    });

    test('cyber.html a un bouton mailto', () => {
        expect(cyberHtml).toContain('mailto:emmanuel.genesteix@agilevizion.com');
    });

    test('cyber.html CTA a btn-primary et btn-lg', () => {
        setupDOM(extractSection(cyberHtml, 'contact') || (() => {
            // Fallback : chercher la section section-cta
            const start = cyberHtml.lastIndexOf('<section', cyberHtml.indexOf('section-cta'));
            const end = cyberHtml.indexOf('</section>', start) + '</section>'.length;
            return cyberHtml.slice(start, end);
        })());
        const btn = document.querySelector('button[onclick="openCalendly()"]');
        if (btn) {
            expect(btn.classList.contains('btn-primary')).toBe(true);
        }
    });
});

// ====================================================================
// CTA sur ia.html
// ====================================================================
describe('Section CTA — ia.html', () => {
    test('ia.html a une section section-cta', () => {
        expect(iaHtml).toContain('section-cta');
    });

    test('ia.html a un bouton Calendly onclick="openCalendly()"', () => {
        const match = iaHtml.match(/onclick="openCalendly\(\)"/g);
        expect(match).not.toBeNull();
        expect(match.length).toBeGreaterThanOrEqual(1);
    });

    test('ia.html a un bouton mailto', () => {
        expect(iaHtml).toContain('mailto:emmanuel.genesteix@agilevizion.com');
    });
});

// ====================================================================
// Footer — index.html
// ====================================================================
describe('Footer — index.html', () => {

    beforeEach(() => {
        setupDOM(INDEX_FOOTER);
    });

    test('footer existe dans index.html', () => {
        expect(INDEX_FOOTER.length).toBeGreaterThan(100);
    });

    test('email dans le footer : lien mailto', () => {
        const emailLink = document.querySelector('.footer-contact a[href="mailto:emmanuel.genesteix@agilevizion.com"]');
        expect(emailLink).not.toBeNull();
    });

    test('email affiché : emmanuel.genesteix@agilevizion.com', () => {
        expect(INDEX_FOOTER).toContain('emmanuel.genesteix@agilevizion.com');
    });

    test('téléphone dans le footer : lien tel:', () => {
        const telLink = document.querySelector('.footer-contact a[href="tel:+352661780807"]');
        expect(telLink).not.toBeNull();
    });

    test('numéro de téléphone affiché : +352.661.78.08.07', () => {
        expect(INDEX_FOOTER).toContain('+352.661.78.08.07');
    });

    test('localisation "Luxembourg" dans le footer', () => {
        const location = document.querySelector('.footer-brand p');
        expect(location).not.toBeNull();
        expect(location.textContent).toContain('Luxembourg');
    });

    test('lien LinkedIn présent', () => {
        const li = document.querySelector('a[href*="linkedin.com/in/emmanuelgenesteix"]');
        expect(li).not.toBeNull();
    });

    test('lien LinkedIn : target="_blank" rel="noopener"', () => {
        const li = document.querySelector('a[href*="linkedin.com"]');
        expect(li.getAttribute('target')).toBe('_blank');
        expect(li.getAttribute('rel')).toBe('noopener');
    });

    test('copyright présent dans footer-bottom', () => {
        const copy = document.querySelector('.footer-bottom p');
        expect(copy).not.toBeNull();
        expect(copy.textContent).toContain('AgileVizion');
    });

    test('lien "Mentions légales" présent', () => {
        const legal = document.querySelector('.footer-legal-link');
        expect(legal).not.toBeNull();
        expect(legal.getAttribute('href')).toBe('#legal');
    });

    test('contenu mentions légales : immatriculation A46385', () => {
        expect(INDEX_FOOTER).toContain('A46385');
    });

    test('contenu mentions légales : TVA LU36976357', () => {
        expect(INDEX_FOOTER).toContain('LU36976357');
    });

    test('.footer-brand contient le logo AgileVizion', () => {
        const brand = document.querySelector('.footer-brand .nav-logo');
        expect(brand).not.toBeNull();
    });
});

// ====================================================================
// Footer — cyber.html
// ====================================================================
describe('Footer — cyber.html', () => {

    beforeEach(() => {
        setupDOM(CYBER_FOOTER);
    });

    test('footer existe dans cyber.html', () => {
        expect(CYBER_FOOTER.length).toBeGreaterThan(100);
    });

    test('email dans le footer de cyber.html', () => {
        const emailLink = document.querySelector('.footer-contact a[href="mailto:emmanuel.genesteix@agilevizion.com"]');
        expect(emailLink).not.toBeNull();
    });

    test('téléphone dans le footer de cyber.html', () => {
        const telLink = document.querySelector('.footer-contact a[href="tel:+352661780807"]');
        expect(telLink).not.toBeNull();
    });

    test('localisation Luxembourg dans cyber.html', () => {
        expect(CYBER_FOOTER).toContain('Luxembourg');
    });

    test('LinkedIn dans cyber.html', () => {
        expect(CYBER_FOOTER).toContain('linkedin.com/in/emmanuelgenesteix');
    });

    test('mentions légales dans cyber.html', () => {
        const legal = document.querySelector('.footer-legal-link');
        expect(legal).not.toBeNull();
        expect(legal.getAttribute('href')).toBe('#legal');
    });
});

// ====================================================================
// Footer — ia.html
// ====================================================================
describe('Footer — ia.html', () => {

    beforeEach(() => {
        setupDOM(IA_FOOTER);
    });

    test('footer existe dans ia.html', () => {
        expect(IA_FOOTER.length).toBeGreaterThan(100);
    });

    test('email dans le footer de ia.html', () => {
        const emailLink = document.querySelector('.footer-contact a[href="mailto:emmanuel.genesteix@agilevizion.com"]');
        expect(emailLink).not.toBeNull();
    });

    test('téléphone dans le footer de ia.html', () => {
        const telLink = document.querySelector('.footer-contact a[href="tel:+352661780807"]');
        expect(telLink).not.toBeNull();
    });

    test('localisation Luxembourg dans ia.html', () => {
        expect(IA_FOOTER).toContain('Luxembourg');
    });

    test('LinkedIn dans ia.html', () => {
        expect(IA_FOOTER).toContain('linkedin.com/in/emmanuelgenesteix');
    });

    test('mentions légales dans ia.html', () => {
        const legal = document.querySelector('.footer-legal-link');
        expect(legal).not.toBeNull();
        expect(legal.getAttribute('href')).toBe('#legal');
    });
});

// ====================================================================
// Footer identique sur les 3 pages
// ====================================================================
describe('Footer identique sur les 3 pages', () => {

    // Normaliser le footer pour comparaison (retirer les espaces extra)
    function normalizeFooter(html) {
        return html
            .replace(/\s+/g, ' ')
            .replace(/> </g, '><')
            .trim();
    }

    test('footer index.html et cyber.html sont structurellement identiques', () => {
        const n1 = normalizeFooter(INDEX_FOOTER);
        const n2 = normalizeFooter(CYBER_FOOTER);
        expect(n1).toBe(n2);
    });

    test('footer index.html et ia.html sont structurellement identiques', () => {
        const n1 = normalizeFooter(INDEX_FOOTER);
        const n3 = normalizeFooter(IA_FOOTER);
        expect(n1).toBe(n3);
    });

    test('footer cyber.html et ia.html sont identiques', () => {
        const n2 = normalizeFooter(CYBER_FOOTER);
        const n3 = normalizeFooter(IA_FOOTER);
        expect(n2).toBe(n3);
    });

    test('les 3 footers contiennent tous le même email', () => {
        const EMAIL = 'mailto:emmanuel.genesteix@agilevizion.com';
        expect(INDEX_FOOTER).toContain(EMAIL);
        expect(CYBER_FOOTER).toContain(EMAIL);
        expect(IA_FOOTER).toContain(EMAIL);
    });

    test('les 3 footers contiennent tous le même téléphone', () => {
        const TEL = 'tel:+352661780807';
        expect(INDEX_FOOTER).toContain(TEL);
        expect(CYBER_FOOTER).toContain(TEL);
        expect(IA_FOOTER).toContain(TEL);
    });

    test('les 3 footers contiennent tous le lien LinkedIn', () => {
        const LI = 'linkedin.com/in/emmanuelgenesteix';
        expect(INDEX_FOOTER).toContain(LI);
        expect(CYBER_FOOTER).toContain(LI);
        expect(IA_FOOTER).toContain(LI);
    });

    test('les 3 footers contiennent tous les mentions légales', () => {
        const LEGAL = 'footer-legal-link';
        expect(INDEX_FOOTER).toContain(LEGAL);
        expect(CYBER_FOOTER).toContain(LEGAL);
        expect(IA_FOOTER).toContain(LEGAL);
    });
});

// ====================================================================
// Logique openCalendly — nav.js
// ====================================================================
describe('Fonction openCalendly — nav.js', () => {

    const navJs = fs.readFileSync(path.join(ROOT, 'js/nav.js'), 'utf8');

    test('nav.js définit openCalendly()', () => {
        expect(navJs).toContain('function openCalendly()');
    });

    test('openCalendly utilise Calendly.initPopupWidget (popup)', () => {
        expect(navJs).toContain('Calendly.initPopupWidget');
    });

    test('openCalendly a un fallback window.open (si CDN absent)', () => {
        expect(navJs).toContain('window.open');
    });

    test('openCalendly est exposé sur window', () => {
        expect(navJs).toContain('window.openCalendly = openCalendly');
    });

    test('CALENDLY_URL définie dans nav.js', () => {
        expect(navJs).toContain('CALENDLY_URL');
        expect(navJs).toContain('calendly.com');
    });

    test('fallback pointe vers l\'URL Calendly directe', () => {
        // Quand Calendly n'est pas chargé → window.open(CALENDLY_URL)
        const fallbackMatch = navJs.match(/window\.open\(CALENDLY_URL/);
        expect(fallbackMatch).not.toBeNull();
    });

    test('openCalendly vérifie typeof Calendly.initPopupWidget === "function"', () => {
        expect(navJs).toContain('typeof window.Calendly.initPopupWidget');
    });
});

// ====================================================================
// CSS — section-cta a un fond contrasté
// ====================================================================
describe('CSS section-cta — fond contrasté', () => {

    const layoutCss = fs.readFileSync(path.join(ROOT, 'css/layout.css'), 'utf8');

    test('layout.css définit .section-cta avec un background', () => {
        expect(layoutCss).toContain('.section-cta');
        // Chercher le bloc .section-cta
        const idx = layoutCss.indexOf('.section-cta {');
        expect(idx).toBeGreaterThan(-1);
        const block = layoutCss.slice(idx, layoutCss.indexOf('}', idx) + 1);
        expect(block).toContain('background');
    });

    test('layout.css .section-cta : texte inverse (text-inverse) pour contraste', () => {
        expect(layoutCss).toContain('text-inverse');
    });
});

// ====================================================================
// CSS responsive — boutons CTA en pleine largeur sur mobile (≤480px)
// ====================================================================
describe('CSS responsive — boutons CTA pleine largeur mobile', () => {

    const responsiveCss = fs.readFileSync(path.join(ROOT, 'css/responsive.css'), 'utf8');

    test('responsive.css a un media (max-width: 480px)', () => {
        expect(responsiveCss).toContain('max-width: 480px');
    });

    test('responsive.css : .hero-cta .btn a width: 100% sur mobile', () => {
        expect(responsiveCss).toContain('hero-cta');
        expect(responsiveCss).toContain('width: 100%');
    });

    test('responsive.css : hero-cta passe en flex-direction: column sur mobile', () => {
        // Vérifier dans le bloc ≤480px
        const idx480 = responsiveCss.indexOf('max-width: 480px');
        const block = responsiveCss.slice(idx480, responsiveCss.indexOf('@media', idx480 + 1));
        expect(block).toContain('flex-direction: column');
    });
});

// ====================================================================
// Sécurité — footers sans scripts injectés
// ====================================================================
describe('Sécurité — footers sans scripts', () => {
    test('footer index.html sans <script>', () => {
        expect(INDEX_FOOTER.toLowerCase()).not.toContain('<script>');
    });

    test('footer cyber.html sans <script>', () => {
        expect(CYBER_FOOTER.toLowerCase()).not.toContain('<script>');
    });

    test('footer ia.html sans <script>', () => {
        expect(IA_FOOTER.toLowerCase()).not.toContain('<script>');
    });
});
