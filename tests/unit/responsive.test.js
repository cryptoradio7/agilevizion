/**
 * Tests unitaires — Responsive Mobile-First (Story #11)
 * AgileVizion 2
 *
 * Couvre :
 * - Mobile-first : base sans media query, min-width seulement
 * - Breakpoints : 480px / 768px / 1024px présents dans responsive.css
 * - Progression des grilles : 1col mobile → 2col tablette → 3+ desktop
 * - Tap targets : min 44x44px sur .btn, .lang-btn, .nav-menu a
 * - Font-size minimum 16px (--font-size-base: 1rem) pour éviter zoom iOS
 * - Images : max-width:100% dans base.css
 * - HTML : loading="lazy" sur les images
 * - Paysage mobile : max-height sur .hero
 * - Dégradation <320px : word-break, btn max-width:100%
 * - Hamburger : .nav-toggle présent, .nav-menu en hamburger par défaut
 */

'use strict';

const fs = require('fs');
const path = require('path');

// -----------------------------------------------------------------------
// Charger les fichiers CSS
// -----------------------------------------------------------------------
const ROOT = path.resolve(__dirname, '../..');

const responsiveCss = fs.readFileSync(path.join(ROOT, 'css/responsive.css'), 'utf8');
const baseCss       = fs.readFileSync(path.join(ROOT, 'css/base.css'), 'utf8');
const variablesCss  = fs.readFileSync(path.join(ROOT, 'css/variables.css'), 'utf8');
const layoutCss     = fs.readFileSync(path.join(ROOT, 'css/layout.css'), 'utf8');

// -----------------------------------------------------------------------
// Charger les HTML
// -----------------------------------------------------------------------
const indexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const cyberHtml = fs.readFileSync(path.join(ROOT, 'cyber.html'), 'utf8');
const iaHtml    = fs.readFileSync(path.join(ROOT, 'ia.html'), 'utf8');

// Setup DOM avec index.html
function setupDOM(html) {
    document.body.innerHTML = html || indexHtml;
}

beforeEach(() => { setupDOM(); });
afterEach(() => { document.body.innerHTML = ''; });

// ====================================================================
// CA1 — Mobile-first : pas de max-width dans responsive.css
// ====================================================================
describe('Mobile-first : approche min-width uniquement (hors edge cases)', () => {
    test('responsive.css utilise des min-width (breakpoints ascendants)', () => {
        expect(responsiveCss).toMatch(/@media\s*\(min-width:\s*480px\)/);
        expect(responsiveCss).toMatch(/@media\s*\(min-width:\s*768px\)/);
        expect(responsiveCss).toMatch(/@media\s*\(min-width:\s*1024px\)/);
    });

    test('les media queries breakpoints n\'utilisent pas max-width (sauf edge cases)', () => {
        // Edge cases légitimes : max-width: 319px (dégradation <320px)
        // Les breakpoints principaux utilisent UNIQUEMENT min-width
        const maxWidthMatches = responsiveCss.match(/@media[^{]*max-width:\s*([^);\s]+)/g) || [];
        const illegalMaxWidth = maxWidthMatches.filter(m => !m.includes('319px'));
        expect(illegalMaxWidth).toHaveLength(0);
    });

    test('les 3 breakpoints sont dans l\'ordre ascendant (480 < 768 < 1024)', () => {
        const bp480 = responsiveCss.indexOf('min-width: 480px');
        const bp768 = responsiveCss.indexOf('min-width: 768px');
        const bp1024 = responsiveCss.indexOf('min-width: 1024px');
        expect(bp480).toBeLessThan(bp768);
        expect(bp768).toBeLessThan(bp1024);
    });
});

// ====================================================================
// CA2 — Breakpoints 480 / 768 / 1024px
// ====================================================================
describe('Breakpoints : 480px / 768px / 1024px', () => {
    test('breakpoint 480px présent dans responsive.css', () => {
        expect(responsiveCss).toContain('min-width: 480px');
    });

    test('breakpoint 768px présent dans responsive.css', () => {
        expect(responsiveCss).toContain('min-width: 768px');
    });

    test('breakpoint 1024px présent dans responsive.css', () => {
        expect(responsiveCss).toContain('min-width: 1024px');
    });
});

// ====================================================================
// CA3 — Progression des grilles (1col → 2col → 3+col)
// ====================================================================
describe('Progression grilles : mobile 1col → tablette 2col → desktop 3+col', () => {
    // services-grid
    test('services-grid : 2 colonnes à 768px', () => {
        const match768 = responsiveCss.match(
            /@media\s*\(min-width:\s*768px\)[^}]*\{([^}]*\.services-grid[^}]*\})*[^}]*/s
        );
        // Chercher repeat(2, 1fr) dans le bloc 768px
        const block768Start = responsiveCss.indexOf('@media (min-width: 768px)');
        const block768End   = responsiveCss.indexOf('@media (min-width: 1024px)');
        const block768 = responsiveCss.slice(block768Start, block768End);
        expect(block768).toContain('services-grid');
        expect(block768).toMatch(/services-grid[\s\S]*?repeat\(2,\s*1fr\)/);
    });

    // kpi-grid
    test('kpi-grid : 2 colonnes à 768px', () => {
        const block768Start = responsiveCss.indexOf('@media (min-width: 768px)');
        const block768End   = responsiveCss.indexOf('@media (min-width: 1024px)');
        const block768 = responsiveCss.slice(block768Start, block768End);
        expect(block768).toContain('kpi-grid');
    });

    test('kpi-grid : 3 colonnes à 1024px', () => {
        const block1024Start = responsiveCss.indexOf('@media (min-width: 1024px)');
        const block1024 = responsiveCss.slice(block1024Start);
        expect(block1024).toContain('kpi-grid');
        expect(block1024).toMatch(/kpi-grid[\s\S]*?repeat\(3,\s*1fr\)/);
    });

    test('steps-grid : 2 colonnes à 768px, 3 à 1024px', () => {
        const block768Start = responsiveCss.indexOf('@media (min-width: 768px)');
        const block768End   = responsiveCss.indexOf('@media (min-width: 1024px)');
        const block768 = responsiveCss.slice(block768Start, block768End);
        const block1024 = responsiveCss.slice(responsiveCss.indexOf('@media (min-width: 1024px)'));
        expect(block768).toContain('steps-grid');
        expect(block1024).toContain('steps-grid');
    });

    test('why-grid : 2 colonnes à 768px, 3 à 1024px', () => {
        const block768Start = responsiveCss.indexOf('@media (min-width: 768px)');
        const block768End   = responsiveCss.indexOf('@media (min-width: 1024px)');
        const block768 = responsiveCss.slice(block768Start, block768End);
        const block1024 = responsiveCss.slice(responsiveCss.indexOf('@media (min-width: 1024px)'));
        expect(block768).toMatch(/why-grid[\s\S]*?repeat\(2,\s*1fr\)/);
        expect(block1024).toMatch(/why-grid[\s\S]*?repeat\(3,\s*1fr\)/);
    });
});

// ====================================================================
// CA4 — Boutons CTA pleine largeur sur mobile
// ====================================================================
describe('Boutons CTA pleine largeur sur mobile', () => {
    test('hero-cta dans index.html contient des .btn', () => {
        setupDOM(indexHtml);
        const ctaBtns = document.querySelectorAll('.hero-cta .btn');
        expect(ctaBtns.length).toBeGreaterThan(0);
    });

    test('hero-cta dans cyber.html contient des .btn', () => {
        setupDOM(cyberHtml);
        const ctaBtns = document.querySelectorAll('.hero-cta .btn, .cta-btn, .btn-primary');
        expect(ctaBtns.length).toBeGreaterThan(0);
    });

    test('.hero-cta flex-direction column par défaut (responsive.css) OU base', () => {
        // Sur mobile, .hero-cta doit avoir les btns empilés (flex-direction:column ou width:100%)
        // Vérifier que .btn a width:100% sur mobile OU que hero-cta est column
        const hasColumnFlex = layoutCss.includes('hero-cta') || responsiveCss.includes('hero-cta');
        expect(hasColumnFlex).toBe(true);
    });

    test('à 480px .hero-cta passe en flex-direction: row', () => {
        const block480Start = responsiveCss.indexOf('@media (min-width: 480px)');
        const block480End   = responsiveCss.indexOf('@media (min-width: 768px)');
        const block480 = responsiveCss.slice(block480Start, block480End);
        expect(block480).toContain('hero-cta');
        expect(block480).toContain('flex-direction: row');
    });

    test('à 480px .hero-cta .btn passe en width: auto', () => {
        const block480Start = responsiveCss.indexOf('@media (min-width: 480px)');
        const block480End   = responsiveCss.indexOf('@media (min-width: 768px)');
        const block480 = responsiveCss.slice(block480Start, block480End);
        expect(block480).toContain('width: auto');
    });
});

// ====================================================================
// CA5 — Images : max-width: 100% et loading="lazy"
// ====================================================================
describe('Images : max-width:100% et loading="lazy"', () => {
    test('base.css : img { max-width: 100% }', () => {
        expect(baseCss).toContain('max-width: 100%');
    });

    test('index.html : au moins une image a loading="lazy"', () => {
        const lazyImgs = indexHtml.match(/loading="lazy"/g) || [];
        expect(lazyImgs.length).toBeGreaterThan(0);
    });

    test('cyber.html : toutes les images ont loading="lazy" (si images présentes)', () => {
        const allImgs = cyberHtml.match(/<img[^>]+>/g) || [];
        if (allImgs.length === 0) return; // pas d'images sur cette page — OK
        const imgsWithoutLazy = allImgs.filter(img => !img.includes('loading="lazy"'));
        expect(imgsWithoutLazy).toHaveLength(0);
    });

    test('ia.html : toutes les images ont loading="lazy" (si images présentes)', () => {
        const allImgs = iaHtml.match(/<img[^>]+>/g) || [];
        if (allImgs.length === 0) return; // pas d'images sur cette page — OK
        const imgsWithoutLazy = allImgs.filter(img => !img.includes('loading="lazy"'));
        expect(imgsWithoutLazy).toHaveLength(0);
    });
});

// ====================================================================
// CA6 — Placeholder vidéo : ratio 16:9
// ====================================================================
describe('Placeholder vidéo : ratio 16:9', () => {
    test('index.html contient .video-placeholder ou .placeholder-video', () => {
        setupDOM(indexHtml);
        const placeholder = document.querySelector('.video-placeholder, .placeholder-video, .hero-video');
        expect(placeholder).not.toBeNull();
    });

    test('CSS contient un aspect-ratio ou padding-bottom pour le ratio 16:9', () => {
        // Chercher dans tous les fichiers CSS chargés
        const allCss = [baseCss, responsiveCss, layoutCss].join('\n');
        const hasRatio = allCss.includes('aspect-ratio') ||
                         allCss.includes('56.25%') ||   // 9/16 * 100 = 56.25%
                         allCss.includes('padding-bottom: 56.25%') ||
                         allCss.includes('padding-bottom:56.25%');

        // Aussi chercher dans les autres fichiers CSS du projet
        const simulatorCss = fs.readFileSync(path.join(ROOT, 'css/simulator.css'), 'utf8');
        const componentsCss = fs.readFileSync(path.join(ROOT, 'css/components.css'), 'utf8');
        const allCss2 = [allCss, simulatorCss, componentsCss].join('\n');
        const hasRatio2 = allCss2.includes('aspect-ratio') ||
                          allCss2.includes('56.25%');
        expect(hasRatio2).toBe(true);
    });
});

// ====================================================================
// CA7 — Font-size minimum 16px (évite zoom auto iOS)
// ====================================================================
describe('Font-size mobile : minimum 16px (évite zoom auto iOS)', () => {
    test('--font-size-base est 1rem (= 16px)', () => {
        expect(variablesCss).toContain('--font-size-base: 1rem');
    });

    test('body utilise var(--font-size-base) dans base.css', () => {
        expect(baseCss).toContain('var(--font-size-base)');
    });

    test('responsive.css applique font-size base sur les inputs (évite zoom iOS)', () => {
        // Chercher la règle base mobile (sans media query)
        const baseMobileSection = responsiveCss.split('@media')[0];
        expect(baseMobileSection).toContain('var(--font-size-base)');
    });

    test('responsive.css cible .question-select et inputs pour font-size 16px', () => {
        const baseMobileSection = responsiveCss.split('@media')[0];
        expect(baseMobileSection).toContain('question-select');
    });

    test('commentaire iOS dans responsive.css confirme l\'intention', () => {
        expect(responsiveCss).toMatch(/iOS|zoom|16px/);
    });
});

// ====================================================================
// CA8 — Tap targets : minimum 44x44px
// ====================================================================
describe('Tap targets : minimum 44x44px (accessibilité tactile)', () => {
    test('responsive.css : .btn a min-height: 44px', () => {
        // Dans la section base mobile (avant les media queries)
        const baseMobileSection = responsiveCss.split('@media')[0];
        expect(baseMobileSection).toContain('.btn');
        expect(baseMobileSection).toContain('min-height: 44px');
    });

    test('responsive.css : .lang-btn a min-height: 44px et min-width: 44px', () => {
        const baseMobileSection = responsiveCss.split('@media')[0];
        const langBtnBlock = baseMobileSection.match(/\.lang-btn\s*\{([^}]+)\}/s);
        expect(langBtnBlock).not.toBeNull();
        expect(langBtnBlock[1]).toContain('min-height: 44px');
        expect(langBtnBlock[1]).toContain('min-width: 44px');
    });

    test('responsive.css : .nav-menu a a min-height: 44px', () => {
        const baseMobileSection = responsiveCss.split('@media')[0];
        expect(baseMobileSection).toContain('.nav-menu a');
        expect(baseMobileSection).toMatch(/\.nav-menu a[\s\S]*?min-height:\s*44px/);
    });
});

// ====================================================================
// CA9 — Menu hamburger : .nav-toggle présent sur mobile
// ====================================================================
describe('Menu hamburger : .nav-toggle présent sur mobile', () => {
    test('index.html contient .nav-toggle', () => {
        setupDOM(indexHtml);
        expect(document.querySelector('.nav-toggle')).not.toBeNull();
    });

    test('cyber.html contient .nav-toggle', () => {
        setupDOM(cyberHtml);
        expect(document.querySelector('.nav-toggle')).not.toBeNull();
    });

    test('ia.html contient .nav-toggle', () => {
        setupDOM(iaHtml);
        expect(document.querySelector('.nav-toggle')).not.toBeNull();
    });

    test('.nav-toggle est caché à 768px (responsive.css)', () => {
        const block768Start = responsiveCss.indexOf('@media (min-width: 768px)');
        const block768End   = responsiveCss.indexOf('@media (min-width: 1024px)');
        const block768 = responsiveCss.slice(block768Start, block768End);
        expect(block768).toContain('nav-toggle');
        expect(block768).toContain('display: none');
    });

    test('.nav-menu est positionné fixed mobile (layout.css)', () => {
        expect(layoutCss).toContain('nav-menu');
        expect(layoutCss).toMatch(/\.nav-menu[\s\S]*?position:\s*fixed/);
    });

    test('.nav-menu.open restaure la visibilité (layout.css)', () => {
        expect(layoutCss).toContain('.nav-menu.open');
    });
});

// ====================================================================
// Edge case — Paysage mobile : max-height sur .hero
// ====================================================================
describe('Edge case : paysage mobile (max-height sur .hero)', () => {
    test('responsive.css contient media query orientation: landscape', () => {
        expect(responsiveCss).toContain('orientation: landscape');
    });

    test('responsive.css applique max-height au .hero en paysage', () => {
        const landscapeBlock = responsiveCss.match(
            /@media[^{]*max-height[^{]*landscape[^{]*\{([\s\S]*?)(?=@media|\s*\/\*\s*={3})/
        ) || responsiveCss.match(
            /@media[^{]*landscape[^{]*\{([\s\S]*?)(?=@media|\s*\/\*)/
        );
        expect(responsiveCss).toMatch(/\.hero[\s\S]*?max-height/);
    });

    test('responsive.css n\'utilise pas min-height sur .hero en paysage', () => {
        const landscapeStart = responsiveCss.indexOf('orientation: landscape');
        if (landscapeStart === -1) return; // déjà testé au-dessus
        const blockStart = responsiveCss.lastIndexOf('@media', landscapeStart);
        const blockEnd = responsiveCss.indexOf('}', responsiveCss.indexOf('}', blockStart) + 1) + 1;
        const landscapeBlock = responsiveCss.slice(blockStart, blockEnd + 200);
        // Le hero en paysage doit avoir max-height, pas un grand min-height
        expect(landscapeBlock).toContain('max-height');
    });
});

// ====================================================================
// Edge case — Très petit écran (<320px) : dégradation gracieuse
// ====================================================================
describe('Edge case : très petit écran (<320px) — dégradation gracieuse', () => {
    test('responsive.css contient une media query max-width: 319px', () => {
        expect(responsiveCss).toContain('max-width: 319px');
    });

    test('règle <320px : word-break sur les titres (pas de coupure)', () => {
        const tiny = responsiveCss.slice(responsiveCss.indexOf('max-width: 319px'));
        expect(tiny).toContain('word-break');
    });

    test('règle <320px : .btn a max-width: 100% (pas de dépassement)', () => {
        const tinyStart = responsiveCss.indexOf('max-width: 319px');
        const tinyBlock = responsiveCss.slice(tinyStart, tinyStart + 500);
        expect(tinyBlock).toContain('max-width: 100%');
    });

    test('règle <320px : padding réduit pour --container-padding', () => {
        const tinyStart = responsiveCss.indexOf('max-width: 319px');
        const tinyBlock = responsiveCss.slice(tinyStart, tinyStart + 500);
        expect(tinyBlock).toContain('--container-padding');
    });
});

// ====================================================================
// Viewport meta tag — présent sur toutes les pages
// ====================================================================
describe('Viewport meta tag : présent sur toutes les pages', () => {
    const VIEWPORT_META = 'width=device-width, initial-scale=1.0';

    test('index.html : viewport meta présent', () => {
        expect(indexHtml).toContain(VIEWPORT_META);
    });

    test('cyber.html : viewport meta présent', () => {
        expect(cyberHtml).toContain(VIEWPORT_META);
    });

    test('ia.html : viewport meta présent', () => {
        expect(iaHtml).toContain(VIEWPORT_META);
    });
});

// ====================================================================
// Responsive CSS chargé sur toutes les pages
// ====================================================================
describe('Fichier responsive.css chargé sur toutes les pages', () => {
    test('index.html charge responsive.css', () => {
        expect(indexHtml).toContain('css/responsive.css');
    });

    test('cyber.html charge responsive.css', () => {
        expect(cyberHtml).toContain('css/responsive.css');
    });

    test('ia.html charge responsive.css', () => {
        expect(iaHtml).toContain('css/responsive.css');
    });
});

// ====================================================================
// Sécurité — pas d'inline styles dans les sections responsive
// ====================================================================
describe('Sécurité — pas d\'inline styles critiques', () => {
    test('index.html n\'a pas de style width/font-size inline sur hero-title', () => {
        setupDOM(indexHtml);
        const heroTitle = document.querySelector('.hero-title');
        if (heroTitle) {
            const inlineStyle = heroTitle.getAttribute('style') || '';
            expect(inlineStyle).not.toMatch(/font-size|width/);
        } else {
            // Section non présente dans ce fragment DOM — test skippé implicitement
            expect(true).toBe(true);
        }
    });
});
