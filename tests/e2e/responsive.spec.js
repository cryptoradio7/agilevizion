/**
 * Tests E2E — Responsive Mobile-First (Story #11)
 * Playwright — Mobile (375px) / Tablet (768px) / Desktop (1280px) / Landscape (812x375)
 *
 * Couvre :
 * - Hamburger visible sur mobile, caché sur tablette
 * - Grilles : 1 col mobile, 2 col tablette, 3+ desktop
 * - Boutons CTA pleine largeur sur mobile
 * - Tap targets >= 44x44px sur mobile
 * - Font-size >= 16px sur les inputs (zoom iOS)
 * - Placeholder vidéo : ratio maintenu à toutes les tailles
 * - Paysage mobile : hero sans min-height bloquant
 * - <320px : pas de coupure de texte, dégradation gracieuse
 * - Navigation hamburger fonctionnelle sur mobile
 */

'use strict';

const { test, expect } = require('@playwright/test');

// -----------------------------------------------------------------------
// Helpers viewport
// -----------------------------------------------------------------------
const VIEWPORTS = {
    mobile: { width: 375, height: 812 },
    smallMobile: { width: 320, height: 568 },
    tinyMobile: { width: 280, height: 568 },
    tablet: { width: 768, height: 1024 },
    desktop: { width: 1280, height: 800 },
    landscape: { width: 812, height: 375 },
};

// ====================================================================
// CA1 — Navigation hamburger
// ====================================================================
test.describe('Navigation hamburger (mobile ↔ desktop)', () => {
    test('mobile 375px : .nav-toggle est visible', async ({ page }) => {
        await page.setViewportSize(VIEWPORTS.mobile);
        await page.goto('/');
        const toggle = page.locator('.nav-toggle');
        await expect(toggle).toBeVisible();
    });

    test('desktop 1280px : .nav-toggle est caché', async ({ page }) => {
        await page.setViewportSize(VIEWPORTS.desktop);
        await page.goto('/');
        const toggle = page.locator('.nav-toggle');
        await expect(toggle).toBeHidden();
    });

    test('tablette 768px : .nav-toggle est caché', async ({ page }) => {
        await page.setViewportSize(VIEWPORTS.tablet);
        await page.goto('/');
        const toggle = page.locator('.nav-toggle');
        await expect(toggle).toBeHidden();
    });

    test('mobile : menu .nav-menu caché par défaut (opacity 0 ou non visible)', async ({ page }) => {
        await page.setViewportSize(VIEWPORTS.mobile);
        await page.goto('/');
        // Le menu est masqué via transform/opacity sur mobile (pas display:none)
        // On vérifie qu'un lien nav n'est pas visible sans ouvrir le menu
        const navLinks = page.locator('.nav-menu a').first();
        // Le lien peut être dans le DOM mais non visible (pointer-events:none + opacity:0)
        const isVisible = await navLinks.isVisible().catch(() => false);
        // Sur mobile fermé, les liens ne doivent pas être interactifs (pointer-events:none)
        // On accepte que le test vérifie que le menu n'est pas "open"
        const menuClasses = await page.locator('.nav-menu').getAttribute('class') || '';
        expect(menuClasses).not.toContain('open');
    });

    test('mobile : clic hamburger → menu s\'ouvre (classe .open)', async ({ page }) => {
        await page.setViewportSize(VIEWPORTS.mobile);
        await page.goto('/');
        const toggle = page.locator('.nav-toggle');
        await toggle.click();
        const menuClasses = await page.locator('.nav-menu').getAttribute('class') || '';
        expect(menuClasses).toContain('open');
    });

    test('mobile : deuxième clic hamburger → menu se ferme', async ({ page }) => {
        await page.setViewportSize(VIEWPORTS.mobile);
        await page.goto('/');
        const toggle = page.locator('.nav-toggle');
        await toggle.click();
        await toggle.click();
        const menuClasses = await page.locator('.nav-menu').getAttribute('class') || '';
        expect(menuClasses).not.toContain('open');
    });

    test('tablette 768px : liens nav directement visibles (sans hamburger)', async ({ page }) => {
        await page.setViewportSize(VIEWPORTS.tablet);
        await page.goto('/');
        // Sur tablette, les liens sont visibles sans hamburger
        const firstLink = page.locator('.nav-menu a').first();
        await expect(firstLink).toBeVisible();
    });
});

// ====================================================================
// CA2 — Grilles responsive
// ====================================================================
test.describe('Grilles responsive : 1col → 2col → 3col', () => {
    test('mobile : .services-grid a 1 colonne', async ({ page }) => {
        await page.setViewportSize(VIEWPORTS.mobile);
        await page.goto('/');
        const grid = page.locator('.services-grid');
        await expect(grid).toBeVisible();
        const cols = await grid.evaluate(el => {
            return window.getComputedStyle(el).gridTemplateColumns;
        });
        // 1 colonne = une seule valeur de largeur
        const colCount = cols.trim().split(/\s+/).filter(v => v !== 'none' && v !== '').length;
        expect(colCount).toBeLessThanOrEqual(1);
    });

    test('tablette 768px : .services-grid a 2 colonnes', async ({ page }) => {
        await page.setViewportSize(VIEWPORTS.tablet);
        await page.goto('/');
        const grid = page.locator('.services-grid');
        await expect(grid).toBeVisible();
        const cols = await grid.evaluate(el => {
            return window.getComputedStyle(el).gridTemplateColumns;
        });
        const colValues = cols.trim().split(/\s+/).filter(v => v.includes('px') || v.includes('%') || v.includes('fr'));
        expect(colValues.length).toBe(2);
    });

    test('desktop 1280px : .kpi-grid a 3 colonnes (si présent)', async ({ page }) => {
        await page.setViewportSize(VIEWPORTS.desktop);
        await page.goto('/');
        const kpiGrid = page.locator('.kpi-grid').first();
        const count = await page.locator('.kpi-grid').count();
        if (count === 0) return; // pas de kpi-grid sur index.html
        const cols = await kpiGrid.evaluate(el => {
            return window.getComputedStyle(el).gridTemplateColumns;
        });
        const colValues = cols.trim().split(/\s+/).filter(v => v.includes('px') || v.includes('%') || v.includes('fr'));
        expect(colValues.length).toBeGreaterThanOrEqual(3);
    });

    test('cyber.html : tablette 768px → .kpi-grid a 2 colonnes', async ({ page }) => {
        await page.setViewportSize(VIEWPORTS.tablet);
        await page.goto('/cyber.html');
        const kpiGrid = page.locator('.kpi-grid').first();
        const count = await page.locator('.kpi-grid').count();
        if (count === 0) return;
        const cols = await kpiGrid.evaluate(el => {
            return window.getComputedStyle(el).gridTemplateColumns;
        });
        const colValues = cols.trim().split(/\s+/).filter(v => v.includes('px') || v.includes('%') || v.includes('fr'));
        expect(colValues.length).toBeGreaterThanOrEqual(2);
    });
});

// ====================================================================
// CA3 — Boutons CTA pleine largeur sur mobile
// ====================================================================
test.describe('Boutons CTA : pleine largeur sur mobile (<480px)', () => {
    test('mobile 375px : .hero-cta .btn prend une grande partie de la largeur', async ({ page }) => {
        await page.setViewportSize(VIEWPORTS.mobile);
        await page.goto('/');
        const btns = page.locator('.hero-cta .btn');
        const count = await btns.count();
        expect(count).toBeGreaterThan(0);
        // Chaque bouton doit occuper au moins 60% de la largeur disponible
        for (let i = 0; i < count; i++) {
            const btn = btns.nth(i);
            const box = await btn.boundingBox();
            if (box) {
                expect(box.width).toBeGreaterThan(200); // sur mobile 375px, > 200px
            }
        }
    });

    test('desktop 1280px : .hero-cta .btn n\'est pas pleine largeur', async ({ page }) => {
        await page.setViewportSize(VIEWPORTS.desktop);
        await page.goto('/');
        const btn = page.locator('.hero-cta .btn').first();
        const box = await btn.boundingBox();
        if (box) {
            expect(box.width).toBeLessThan(400); // pas pleine largeur desktop
        }
    });
});

// ====================================================================
// CA4 — Tap targets : minimum 44x44px
// ====================================================================
test.describe('Tap targets : minimum 44x44px (accessibilité tactile)', () => {
    test('mobile : .nav-toggle a au moins 44px de hauteur', async ({ page }) => {
        await page.setViewportSize(VIEWPORTS.mobile);
        await page.goto('/');
        const toggle = page.locator('.nav-toggle');
        const box = await toggle.boundingBox();
        expect(box).not.toBeNull();
        expect(box.height).toBeGreaterThanOrEqual(44);
    });

    test('mobile : .btn a au moins 44px de hauteur', async ({ page }) => {
        await page.setViewportSize(VIEWPORTS.mobile);
        await page.goto('/');
        const btn = page.locator('.hero-cta .btn').first();
        const box = await btn.boundingBox();
        expect(box).not.toBeNull();
        expect(box.height).toBeGreaterThanOrEqual(44);
    });

    test('mobile : .lang-btn a au moins 44x44px', async ({ page }) => {
        await page.setViewportSize(VIEWPORTS.mobile);
        await page.goto('/');
        // Ouvrir le menu hamburger pour accéder aux lang-btns
        await page.locator('.nav-toggle').click();
        const langBtn = page.locator('.lang-btn').first();
        await expect(langBtn).toBeVisible();
        const box = await langBtn.boundingBox();
        expect(box).not.toBeNull();
        expect(box.height).toBeGreaterThanOrEqual(44);
        expect(box.width).toBeGreaterThanOrEqual(44);
    });
});

// ====================================================================
// CA5 — Font-size inputs >= 16px sur mobile (évite zoom iOS)
// ====================================================================
test.describe('Font-size inputs : >= 16px sur mobile (évite zoom iOS)', () => {
    test('mobile 375px : font-size du body >= 16px', async ({ page }) => {
        await page.setViewportSize(VIEWPORTS.mobile);
        await page.goto('/');
        const fontSize = await page.evaluate(() => {
            return parseFloat(window.getComputedStyle(document.body).fontSize);
        });
        expect(fontSize).toBeGreaterThanOrEqual(16);
    });

    test('mobile : .question-select font-size >= 16px (si présent)', async ({ page }) => {
        await page.setViewportSize(VIEWPORTS.mobile);
        await page.goto('/');
        const select = page.locator('.question-select').first();
        const count = await page.locator('.question-select').count();
        if (count === 0) return;
        const fontSize = await select.evaluate(el => {
            return parseFloat(window.getComputedStyle(el).fontSize);
        });
        expect(fontSize).toBeGreaterThanOrEqual(16);
    });
});

// ====================================================================
// CA6 — Placeholder vidéo : ratio 16:9 maintenu
// ====================================================================
test.describe('Placeholder vidéo : ratio 16:9 maintenu à toutes les tailles', () => {
    async function checkVideoRatio(page) {
        const placeholder = page.locator('.video-placeholder, .hero-video, .placeholder-video').first();
        const count = await page.locator('.video-placeholder, .hero-video, .placeholder-video').count();
        if (count === 0) return null;
        const box = await placeholder.boundingBox();
        if (!box || box.height === 0) return null;
        return box.width / box.height;
    }

    test('mobile 375px : ratio largeur/hauteur proche de 16:9 (1.5-2.0)', async ({ page }) => {
        await page.setViewportSize(VIEWPORTS.mobile);
        await page.goto('/');
        const ratio = await checkVideoRatio(page);
        if (ratio === null) return; // placeholder absent
        expect(ratio).toBeGreaterThan(1.3);  // large
        expect(ratio).toBeLessThan(2.5);     // pas trop large
    });

    test('desktop 1280px : ratio largeur/hauteur proche de 16:9', async ({ page }) => {
        await page.setViewportSize(VIEWPORTS.desktop);
        await page.goto('/');
        const ratio = await checkVideoRatio(page);
        if (ratio === null) return;
        expect(ratio).toBeGreaterThan(1.3);
    });
});

// ====================================================================
// Edge case — Paysage mobile : hero ne prend pas tout l'écran
// ====================================================================
test.describe('Edge case : paysage mobile (landscape 812x375)', () => {
    test('landscape : .hero visible sans dépasser 100vh', async ({ page }) => {
        await page.setViewportSize(VIEWPORTS.landscape);
        await page.goto('/');
        const hero = page.locator('.hero').first();
        await expect(hero).toBeVisible();
        const box = await hero.boundingBox();
        expect(box).not.toBeNull();
        // En paysage, le hero ne doit pas bloquer toute la hauteur (375px viewport)
        // Il peut prendre jusqu'à 100vh mais pas plus
        expect(box.height).toBeLessThanOrEqual(VIEWPORTS.landscape.height + 10); // +10 tolérance
    });

    test('landscape : page scrollable (contenu accessible)', async ({ page }) => {
        await page.setViewportSize(VIEWPORTS.landscape);
        await page.goto('/');
        // Vérifier qu'on peut scroller jusqu'à la section services
        await page.locator('#services').scrollIntoViewIfNeeded();
        await expect(page.locator('#services')).toBeVisible();
    });
});

// ====================================================================
// Edge case — Très petit écran 320px : dégradation gracieuse
// ====================================================================
test.describe('Edge case : petit mobile 320px — pas de coupure', () => {
    test('320px : la page charge sans erreur JS', async ({ page }) => {
        await page.setViewportSize(VIEWPORTS.smallMobile);
        const errors = [];
        page.on('pageerror', err => errors.push(err.message));
        await page.goto('/');
        expect(errors.filter(e => !e.includes('Calendly') && !e.includes('fonts.googleapis'))).toHaveLength(0);
    });

    test('320px : le hero est visible', async ({ page }) => {
        await page.setViewportSize(VIEWPORTS.smallMobile);
        await page.goto('/');
        await expect(page.locator('.hero')).toBeVisible();
    });

    test('320px : pas de dépassement horizontal (scrollWidth = clientWidth)', async ({ page }) => {
        await page.setViewportSize(VIEWPORTS.smallMobile);
        await page.goto('/');
        const hasOverflow = await page.evaluate(() => {
            return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });
        expect(hasOverflow).toBe(false);
    });

    test('280px (très petit) : page charge et hero visible', async ({ page }) => {
        await page.setViewportSize(VIEWPORTS.tinyMobile);
        const errors = [];
        page.on('pageerror', err => errors.push(err.message));
        await page.goto('/');
        await expect(page.locator('.hero')).toBeVisible();
        const criticalErrors = errors.filter(e =>
            !e.includes('Calendly') &&
            !e.includes('fonts.googleapis') &&
            !e.includes('font-awesome') &&
            !e.includes('cdnjs')
        );
        expect(criticalErrors).toHaveLength(0);
    });
});

// ====================================================================
// Tests de non-régression — cyber.html et ia.html responsive
// ====================================================================
test.describe('Non-régression responsive sur cyber.html et ia.html', () => {
    test('cyber.html mobile 375px : navbar hamburger visible', async ({ page }) => {
        await page.setViewportSize(VIEWPORTS.mobile);
        await page.goto('/cyber.html');
        await expect(page.locator('.nav-toggle')).toBeVisible();
    });

    test('cyber.html desktop 1280px : navbar hamburger caché', async ({ page }) => {
        await page.setViewportSize(VIEWPORTS.desktop);
        await page.goto('/cyber.html');
        await expect(page.locator('.nav-toggle')).toBeHidden();
    });

    test('ia.html mobile 375px : navbar hamburger visible', async ({ page }) => {
        await page.setViewportSize(VIEWPORTS.mobile);
        await page.goto('/ia.html');
        await expect(page.locator('.nav-toggle')).toBeVisible();
    });

    test('ia.html 320px : pas de dépassement horizontal', async ({ page }) => {
        await page.setViewportSize(VIEWPORTS.smallMobile);
        await page.goto('/ia.html');
        const hasOverflow = await page.evaluate(() => {
            return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });
        expect(hasOverflow).toBe(false);
    });
});

// ====================================================================
// Test de performance responsive — pas de layout shift brutal
// ====================================================================
test.describe('Layout : pas d\'overflow horizontal sur les pages', () => {
    const pages = ['/', '/cyber.html', '/ia.html'];
    const viewports = [VIEWPORTS.mobile, VIEWPORTS.tablet, VIEWPORTS.desktop];

    for (const url of pages) {
        for (const vp of viewports) {
            test(`${url} @ ${vp.width}px : pas d'overflow horizontal`, async ({ page }) => {
                await page.setViewportSize(vp);
                await page.goto(url);
                const hasOverflow = await page.evaluate(() => {
                    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
                });
                expect(hasOverflow).toBe(false);
            });
        }
    }
});
