/**
 * Tests unitaires — Story #15 : Design System CSS custom properties
 *
 * Critères d'acceptation vérifiés :
 *  1. variables.css définit tous les tokens requis (couleurs, typo, spacing, shadows)
 *  2. Palette : Indigo #4F46E5 primaire, Emerald #10B981 accent, gris #111827→#F9FAFB
 *  3. Typographie : échelle xs→6xl, poids 300→800
 *  4. Spacing : --space-1 (0.25rem) à --space-24 (6rem)
 *  5. Aucune couleur hex en dur hors variables.css
 *  6. base.css contient reset + body + headings + links
 *  7. components.css contient btn, card, tag, kpi-card
 *  8. layout.css contient navbar, sections, grids, footer
 */

const fs = require('fs');
const path = require('path');

const CSS_DIR = path.join(__dirname, '../../css');

function readCss(filename) {
    return fs.readFileSync(path.join(CSS_DIR, filename), 'utf8');
}

const variables = readCss('variables.css');
const base      = readCss('base.css');
const components = readCss('components.css');
const layout    = readCss('layout.css');
const animations = readCss('animations.css');
const simulator = readCss('simulator.css');
const responsive = readCss('responsive.css');
const cookies   = readCss('cookies.css');

const ALL_CSS_FILES = { base, components, layout, animations, simulator, responsive, cookies };

// ─── 1. Tous les fichiers CSS existent ────────────────────────────────────────

describe('Structure — les 8 fichiers CSS existent', () => {
    const files = ['variables.css', 'base.css', 'components.css', 'layout.css',
                   'animations.css', 'simulator.css', 'responsive.css', 'cookies.css'];
    files.forEach(f => {
        test(`${f} existe`, () => {
            expect(fs.existsSync(path.join(CSS_DIR, f))).toBe(true);
        });
    });
});

// ─── 2. variables.css — palette couleurs ──────────────────────────────────────

describe('variables.css — palette couleurs', () => {
    test('couleur primaire Indigo #4F46E5 définie', () => {
        expect(variables).toMatch(/--color-primary:\s*#4F46E5/i);
    });
    test('couleur accent Emerald #10B981 définie', () => {
        expect(variables).toMatch(/--color-accent:\s*#10B981/i);
    });
    test('gris foncé #111827 défini (gray-900)', () => {
        expect(variables).toMatch(/--color-gray-900:\s*#111827/i);
    });
    test('gris clair #F9FAFB défini (gray-50)', () => {
        expect(variables).toMatch(/--color-gray-50:\s*#F9FAFB/i);
    });
    test('palette gris complète (50→900)', () => {
        ['gray-50','gray-100','gray-200','gray-300','gray-400',
         'gray-500','gray-600','gray-700','gray-800','gray-900'].forEach(g => {
            expect(variables).toMatch(new RegExp(`--color-${g}:`));
        });
    });
    test('variantes primaires (50, 100, 900, light, dark) définies', () => {
        expect(variables).toMatch(/--color-primary-50:/);
        expect(variables).toMatch(/--color-primary-100:/);
        expect(variables).toMatch(/--color-primary-900:/);
        expect(variables).toMatch(/--color-primary-light:/);
        expect(variables).toMatch(/--color-primary-dark:/);
    });
});

// ─── 3. variables.css — typographie ───────────────────────────────────────────

describe('variables.css — typographie', () => {
    test('font-family Inter définie', () => {
        expect(variables).toMatch(/--font-sans:.*Inter/);
    });
    test('échelle de tailles xs→6xl complète', () => {
        ['xs','sm','base','lg','xl','2xl','3xl','4xl','5xl','6xl'].forEach(size => {
            expect(variables).toMatch(new RegExp(`--font-size-${size}:`));
        });
    });
    test('poids 300→800 définis', () => {
        expect(variables).toMatch(/--font-weight-light:\s*300/);
        expect(variables).toMatch(/--font-weight-normal:\s*400/);
        expect(variables).toMatch(/--font-weight-medium:\s*500/);
        expect(variables).toMatch(/--font-weight-semibold:\s*600/);
        expect(variables).toMatch(/--font-weight-bold:\s*700/);
        expect(variables).toMatch(/--font-weight-extrabold:\s*800/);
    });
});

// ─── 4. variables.css — spacing --space-1 à --space-24 ────────────────────────

describe('variables.css — spacing tokens', () => {
    const expected = [
        ['--space-1',  '0.25rem'],
        ['--space-2',  '0.5rem'],
        ['--space-3',  '0.75rem'],
        ['--space-4',  '1rem'],
        ['--space-6',  '1.5rem'],
        ['--space-8',  '2rem'],
        ['--space-12', '3rem'],
        ['--space-16', '4rem'],
        ['--space-20', '5rem'],
        ['--space-24', '6rem'],
    ];
    expected.forEach(([token, value]) => {
        test(`${token}: ${value}`, () => {
            expect(variables).toMatch(new RegExp(`${token}:\\s*${value.replace('.', '\\.')}`));
        });
    });
});

// ─── 5. variables.css — ombres ────────────────────────────────────────────────

describe('variables.css — shadows', () => {
    ['--shadow-sm', '--shadow-md', '--shadow-lg', '--shadow-xl'].forEach(s => {
        test(`${s} défini`, () => {
            expect(variables).toMatch(new RegExp(s));
        });
    });
});

// ─── 6. Aucune couleur hex en dur hors variables.css ──────────────────────────

describe('Aucune couleur hex en dur dans les 7 fichiers non-variables', () => {
    /**
     * On cherche les couleurs hex littérales (#RGB ou #RRGGBB).
     * Exceptions acceptées : valeurs dans des data-URI (SVG inline).
     */
    Object.entries(ALL_CSS_FILES).forEach(([name, content]) => {
        test(`${name}.css — pas de couleur hex en dur`, () => {
            // Exclure les data-URI (url("data:..."))
            const withoutDataUri = content.replace(/url\("data:[^"]*"\)/g, '');
            const hexMatches = withoutDataUri.match(/#[0-9A-Fa-f]{3,6}(?![0-9A-Fa-f])/g) || [];
            expect(hexMatches).toHaveLength(0);
        });
    });
});

// ─── 7. Tous les fichiers utilisent var() pour couleurs et typo ───────────────

describe('Usage exclusif de var() pour les design tokens', () => {
    test('base.css utilise var() pour font-family, color, background', () => {
        expect(base).toMatch(/font-family:\s*var\(/);
        expect(base).toMatch(/color:\s*var\(/);
        expect(base).toMatch(/background:\s*var\(/);
    });
    test('components.css utilise var() pour les couleurs de boutons', () => {
        expect(components).toMatch(/background:\s*var\(--color-primary\)/);
        expect(components).toMatch(/color:\s*var\(--text-inverse\)/);
    });
    test('layout.css utilise var() pour navbar et footer', () => {
        expect(layout).toMatch(/background:\s*var\(--bg-navbar\)/);
        expect(layout).toMatch(/background:\s*var\(--bg-dark\)/);
    });
    test('cookies.css utilise var() pour les couleurs', () => {
        expect(cookies).toMatch(/background:\s*var\(--bg-cookie\)/);
    });
});

// ─── 8. base.css — contenu requis ─────────────────────────────────────────────

describe('base.css — reset + éléments de base', () => {
    test('reset box-sizing present', () => {
        expect(base).toMatch(/box-sizing:\s*border-box/);
    });
    test('reset margin/padding à 0', () => {
        expect(base).toMatch(/margin:\s*0/);
        expect(base).toMatch(/padding:\s*0/);
    });
    test('body défini avec font-family, font-size, line-height, color', () => {
        expect(base).toMatch(/body\s*\{/);
        expect(base).toMatch(/font-family:\s*var\(/);
        expect(base).toMatch(/font-size:\s*var\(/);
        expect(base).toMatch(/line-height:\s*var\(/);
        expect(base).toMatch(/color:\s*var\(/);
    });
    test('headings h1→h4 définis', () => {
        expect(base).toMatch(/h1\s*\{/);
        expect(base).toMatch(/h2\s*\{/);
        expect(base).toMatch(/h3\s*\{/);
        expect(base).toMatch(/h4\s*\{/);
    });
    test('liens (a) définis avec color et transition', () => {
        expect(base).toMatch(/^a\s*\{/m);
        expect(base).toMatch(/color:\s*var\(--color-primary\)/);
    });
    test('container défini', () => {
        expect(base).toMatch(/\.container\s*\{/);
        expect(base).toMatch(/max-width:\s*var\(--container-max\)/);
    });
});

// ─── 9. components.css — composants requis ────────────────────────────────────

describe('components.css — btn, card, tag, kpi-card', () => {
    test('.btn défini', () => {
        expect(components).toMatch(/\.btn\s*\{/);
    });
    test('.btn-primary défini', () => {
        expect(components).toMatch(/\.btn-primary\s*\{/);
    });
    test('.btn-outline défini', () => {
        expect(components).toMatch(/\.btn-outline\s*\{/);
    });
    test('.service-card défini', () => {
        expect(components).toMatch(/\.service-card\s*\{/);
    });
    test('.kpi-card défini', () => {
        expect(components).toMatch(/\.kpi-card\s*\{/);
    });
    test('.tag défini', () => {
        expect(components).toMatch(/\.tag\s*\{/);
    });
    test('.step-card défini', () => {
        expect(components).toMatch(/\.step-card\s*\{/);
    });
});

// ─── 10. layout.css — grille, sections, navbar, footer ────────────────────────

describe('layout.css — navbar, sections, grids, footer', () => {
    test('.navbar défini', () => {
        expect(layout).toMatch(/\.navbar\s*\{/);
    });
    test('.hero défini', () => {
        expect(layout).toMatch(/\.hero\s*\{/);
    });
    test('.section défini', () => {
        expect(layout).toMatch(/\.section\s*\{/);
    });
    test('.services-grid défini', () => {
        expect(layout).toMatch(/\.services-grid\s*\{/);
    });
    test('.footer défini', () => {
        expect(layout).toMatch(/\.footer\s*\{/);
    });
    test('nav-toggle défini (mobile menu)', () => {
        expect(layout).toMatch(/\.nav-toggle\s*\{/);
    });
});

// ─── 11. Edge cases — variables.css tokens supplémentaires ────────────────────

describe('variables.css — tokens supplémentaires', () => {
    test('transitions définies', () => {
        expect(variables).toMatch(/--transition-fast:/);
        expect(variables).toMatch(/--transition-base:/);
        expect(variables).toMatch(/--transition-slow:/);
    });
    test('border-radius définis', () => {
        ['--radius-sm','--radius-md','--radius-lg','--radius-xl','--radius-full'].forEach(r => {
            expect(variables).toMatch(new RegExp(r));
        });
    });
    test('container layout tokens définis', () => {
        expect(variables).toMatch(/--container-max:/);
        expect(variables).toMatch(/--navbar-height:/);
    });
    test('text tokens sémantiques définis', () => {
        expect(variables).toMatch(/--text-primary:/);
        expect(variables).toMatch(/--text-secondary:/);
        expect(variables).toMatch(/--text-inverse:/);
    });
    test('background tokens sémantiques définis', () => {
        expect(variables).toMatch(/--bg-primary:/);
        expect(variables).toMatch(/--bg-secondary:/);
        expect(variables).toMatch(/--bg-dark:/);
    });
});
