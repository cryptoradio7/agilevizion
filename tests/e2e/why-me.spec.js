/**
 * Tests E2E — Section "Pourquoi moi" (Story #6)
 * Playwright — Desktop Chrome + iPhone 12
 *
 * Couvre : 3 cards arguments, photo portrait + fallback EG,
 * certifications (5 badges), expérience 20+ ans, triple compétence,
 * responsive mobile (colonne unique, photo dessus, certs scroll),
 * animate-in présent, accessibilité.
 */

'use strict';

const { test, expect } = require('@playwright/test');

// ====================================================================
// CA1 — Section #why-me présente et visible
// ====================================================================
test.describe('Section Why Me — présence et structure', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('section#why-me existe dans le DOM', async ({ page }) => {
        await expect(page.locator('#why-me')).toBeAttached();
    });

    test('section#why-me est visible au scroll', async ({ page }) => {
        await page.locator('#why-me').scrollIntoViewIfNeeded();
        await expect(page.locator('#why-me')).toBeVisible();
    });

    test('titre de section visible', async ({ page }) => {
        await page.locator('#why-me').scrollIntoViewIfNeeded();
        const h2 = page.locator('#why-me .section-title');
        await expect(h2).toBeVisible();
        const text = await h2.textContent();
        expect(text.trim().length).toBeGreaterThan(0);
    });
});

// ====================================================================
// CA1 — 3 cartes arguments (icône + titre + description)
// ====================================================================
test.describe('3 cartes arguments', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.locator('#why-me').scrollIntoViewIfNeeded();
    });

    test('exactement 3 .why-card dans #why-me', async ({ page }) => {
        const cards = page.locator('#why-me .why-card');
        await expect(cards).toHaveCount(3);
    });

    test('chaque card a une icône Font Awesome', async ({ page }) => {
        const icons = page.locator('#why-me .why-card .why-icon i');
        await expect(icons).toHaveCount(3);
        for (let i = 0; i < 3; i++) {
            await expect(icons.nth(i)).toBeAttached();
        }
    });

    test('chaque card a un titre h3 non vide', async ({ page }) => {
        const titles = page.locator('#why-me .why-card h3');
        await expect(titles).toHaveCount(3);
        for (let i = 0; i < 3; i++) {
            const text = await titles.nth(i).textContent();
            expect(text.trim().length).toBeGreaterThan(0);
        }
    });

    test('chaque card a une description p non vide', async ({ page }) => {
        const descs = page.locator('#why-me .why-card p');
        await expect(descs).toHaveCount(3);
        for (let i = 0; i < 3; i++) {
            const text = await descs.nth(i).textContent();
            expect(text.trim().length).toBeGreaterThan(0);
        }
    });

    test('desktop : les 3 cards sont sur la même ligne (grid 3 colonnes)', async ({ page }) => {
        await page.setViewportSize({ width: 1280, height: 800 });
        await page.goto('/');
        await page.locator('#why-me').scrollIntoViewIfNeeded();

        const tops = await page.evaluate(() => {
            const cards = Array.from(document.querySelectorAll('#why-me .why-card'));
            return cards.map(c => c.getBoundingClientRect().top);
        });
        // Toutes les 3 cards sur la même ligne → tops à ±5px
        expect(Math.abs(tops[0] - tops[1])).toBeLessThan(5);
        expect(Math.abs(tops[1] - tops[2])).toBeLessThan(5);
    });
});

// ====================================================================
// CA2 — Photo portrait
// ====================================================================
test.describe('Photo portrait Emmanuel', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.locator('#why-me').scrollIntoViewIfNeeded();
    });

    test('.photo-portrait existe dans le DOM', async ({ page }) => {
        await expect(page.locator('.photo-portrait')).toBeAttached();
    });

    test('img.photo-portrait a un attribut src non vide', async ({ page }) => {
        const src = await page.locator('.photo-portrait').getAttribute('src');
        expect(src).toBeTruthy();
        expect(src.trim().length).toBeGreaterThan(0);
    });

    test('img.photo-portrait a un attribut alt non vide', async ({ page }) => {
        const alt = await page.locator('.photo-portrait').getAttribute('alt');
        expect(alt).toBeTruthy();
        expect(alt.trim().length).toBeGreaterThan(0);
    });

    test('la photo se charge correctement (pas d\'erreur 404)', async ({ page }) => {
        const failedRequests = [];
        page.on('requestfailed', req => failedRequests.push(req.url()));
        await page.goto('/');
        await page.locator('#why-me').scrollIntoViewIfNeeded();
        await page.waitForTimeout(500);

        const photoFailures = failedRequests.filter(url =>
            url.includes('photo_emmanuel') || url.includes('photo_sans')
        );
        expect(photoFailures).toHaveLength(0);
    });

    test('.photo-portrait-wrapper existe et contient la photo ou le fallback', async ({ page }) => {
        const wrapper = page.locator('.photo-portrait-wrapper');
        await expect(wrapper).toBeAttached();

        const hasPhoto = await page.locator('.photo-portrait').isVisible().catch(() => false);
        const hasFallback = await page.locator('#photo-fallback').isVisible().catch(() => false);
        // L'un ou l'autre doit être visible
        expect(hasPhoto || hasFallback).toBe(true);
    });
});

// ====================================================================
// Edge case CA2 — Fallback initiales "EG" si photo cassée
// ====================================================================
test.describe('Fallback photo — initiales EG', () => {
    test('si l\'img échoue → #photo-fallback est visible', async ({ page }) => {
        await page.route('**/images/photo_emmanuel.png', route => route.abort());
        await page.goto('/');
        await page.locator('#why-me').scrollIntoViewIfNeeded();
        // Laisser le temps à onerror de s'exécuter
        await page.waitForTimeout(500);

        const fallback = page.locator('#photo-fallback');
        await expect(fallback).toBeVisible();
    });

    test('le fallback contient les initiales "EG"', async ({ page }) => {
        await page.route('**/images/photo_emmanuel.png', route => route.abort());
        await page.goto('/');
        await page.locator('#why-me').scrollIntoViewIfNeeded();
        await page.waitForTimeout(500);

        const text = await page.locator('#photo-fallback').textContent();
        expect(text.trim()).toBe('EG');
    });

    test('le fallback a un fond de couleur (pas blanc)', async ({ page }) => {
        await page.route('**/images/photo_emmanuel.png', route => route.abort());
        await page.goto('/');
        await page.locator('#why-me').scrollIntoViewIfNeeded();
        await page.waitForTimeout(500);

        const bg = await page.evaluate(() => {
            const el = document.getElementById('photo-fallback');
            return window.getComputedStyle(el).backgroundColor;
        });
        // Doit avoir un fond non transparent (rgb != rgba(0,0,0,0))
        expect(bg).not.toBe('rgba(0, 0, 0, 0)');
        expect(bg).not.toBe('transparent');
    });
});

// ====================================================================
// CA3 — Certifications : 5 badges
// ====================================================================
test.describe('Certifications — 5 badges', () => {
    const CERTS = ['ISO 27001', 'ITIL V4', 'Prince2', 'AgilePM', 'SAFe'];

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.locator('#why-me').scrollIntoViewIfNeeded();
    });

    test('exactement 5 .cert-badge dans #why-me', async ({ page }) => {
        const badges = page.locator('#why-me .cert-badge');
        await expect(badges).toHaveCount(5);
    });

    for (const cert of CERTS) {
        test(`badge "${cert}" présent`, async ({ page }) => {
            const badges = page.locator('#why-me .cert-badge');
            const count = await badges.count();
            let found = false;
            for (let i = 0; i < count; i++) {
                const text = await badges.nth(i).textContent();
                if (text.includes(cert)) {
                    found = true;
                    break;
                }
            }
            expect(found).toBe(true);
        });
    }

    test('chaque badge a une icône Font Awesome', async ({ page }) => {
        const icons = page.locator('#why-me .cert-badge i');
        await expect(icons).toHaveCount(5);
    });

    test('libellé "Certifications" visible', async ({ page }) => {
        const label = page.locator('#why-me .certs-label');
        await expect(label).toBeVisible();
        const text = await label.textContent();
        expect(text.toLowerCase()).toContain('cert');
    });
});

// ====================================================================
// CA4 — Expérience 20+ ans + triple compétence
// ====================================================================
test.describe('Expérience et triple compétence', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.locator('#why-me').scrollIntoViewIfNeeded();
    });

    test('bloc .why-experience visible avec "20"', async ({ page }) => {
        const exp = page.locator('#why-me .why-experience');
        await expect(exp).toBeVisible();
        const text = await exp.textContent();
        expect(text).toContain('20');
    });

    test('triple compétence : 3 .triple-item', async ({ page }) => {
        const items = page.locator('#why-me .triple-item');
        await expect(items).toHaveCount(3);
    });

    test('triple item tech (Informatique / Computer Science) visible', async ({ page }) => {
        const items = page.locator('#why-me .triple-item');
        const texts = await items.allTextContents();
        // FR: "Informatique" | EN: "Computer Science"
        const found = texts.some(t =>
            t.toLowerCase().includes('informat') || t.toLowerCase().includes('computer')
        );
        expect(found).toBe(true);
    });

    test('triple item legal (Droit / Law) visible', async ({ page }) => {
        const items = page.locator('#why-me .triple-item');
        const texts = await items.allTextContents();
        // FR: "Droit" | EN: "Law"
        const found = texts.some(t =>
            t.toLowerCase().includes('droit') || t.toLowerCase().includes('law')
        );
        expect(found).toBe(true);
    });

    test('triple item "MBA" visible', async ({ page }) => {
        const items = page.locator('#why-me .triple-item');
        const texts = await items.allTextContents();
        const found = texts.some(t => t.toLowerCase().includes('mba'));
        expect(found).toBe(true);
    });

    test('nom "Emmanuel Genesteix" affiché dans le profil', async ({ page }) => {
        const name = page.locator('#why-me .why-profile-name');
        await expect(name).toBeVisible();
        const text = await name.textContent();
        expect(text).toContain('Emmanuel');
    });

    test('rôle "Consultant" affiché dans le profil', async ({ page }) => {
        const role = page.locator('#why-me .why-profile-role');
        await expect(role).toBeVisible();
        const text = await role.textContent();
        expect(text.toLowerCase()).toContain('consultant');
    });
});

// ====================================================================
// CA5 — Responsive mobile : colonne unique + photo dessus + certs scroll
// ====================================================================
test.describe('Responsive mobile (375px)', () => {
    test.use({ viewport: { width: 375, height: 812 } });

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.locator('#why-me').scrollIntoViewIfNeeded();
    });

    test('les 3 why-cards sont empilées verticalement', async ({ page }) => {
        const tops = await page.evaluate(() => {
            const cards = Array.from(document.querySelectorAll('#why-me .why-card'));
            return cards.map(c => c.getBoundingClientRect().top);
        });
        // Sur mobile : chaque card est en dessous de la précédente
        expect(tops[1]).toBeGreaterThan(tops[0]);
        expect(tops[2]).toBeGreaterThan(tops[1]);
    });

    test('.why-profile a une seule colonne sur mobile', async ({ page }) => {
        const cols = await page.evaluate(() => {
            const profile = document.querySelector('.why-profile');
            if (!profile) return null;
            return window.getComputedStyle(profile).gridTemplateColumns;
        });
        // Une seule colonne sur mobile = "1fr" ou une seule valeur
        if (cols) {
            // Pas deux valeurs séparées (260px 1fr) → une seule valeur
            const parts = cols.trim().split(/\s+/).filter(Boolean);
            expect(parts.length).toBeLessThanOrEqual(1);
        }
    });

    test('.why-photo-col a order: -1 (photo au dessus) sur mobile', async ({ page }) => {
        const order = await page.evaluate(() => {
            const col = document.querySelector('.why-photo-col');
            return col ? window.getComputedStyle(col).order : null;
        });
        if (order !== null) {
            // order: -1 = photo remontée au-dessus
            expect(parseInt(order)).toBeLessThan(0);
        }
    });

    test('les certifications ont overflow-x auto (scrollables sur mobile)', async ({ page }) => {
        const overflowX = await page.evaluate(() => {
            const certs = document.querySelector('.cert-badges');
            return certs ? window.getComputedStyle(certs).overflowX : null;
        });
        // Sur mobile, .cert-badges doit avoir overflow-x: auto pour le scroll horizontal
        expect(overflowX).toBe('auto');
    });
});

// ====================================================================
// CA6 — Classe animate-in présente (apparition au scroll)
// ====================================================================
test.describe('Animations animate-in', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('.section-title dans #why-me a la classe animate-in', async ({ page }) => {
        await expect(page.locator('#why-me .section-title')).toHaveClass(/animate-in/);
    });

    test('.why-profile a la classe animate-in', async ({ page }) => {
        await expect(page.locator('.why-profile')).toHaveClass(/animate-in/);
    });

    test('les .why-card ont la classe animate-in', async ({ page }) => {
        const cards = page.locator('#why-me .why-card');
        const count = await cards.count();
        expect(count).toBeGreaterThan(0);
        for (let i = 0; i < count; i++) {
            await expect(cards.nth(i)).toHaveClass(/animate-in/);
        }
    });
});

// ====================================================================
// Accessibilité
// ====================================================================
test.describe('Accessibilité de la section Why Me', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.locator('#why-me').scrollIntoViewIfNeeded();
    });

    test('.cert-badges a role="list"', async ({ page }) => {
        await expect(page.locator('.cert-badges')).toHaveAttribute('role', 'list');
    });

    test('chaque .cert-badge a role="listitem"', async ({ page }) => {
        const badges = page.locator('.cert-badge[role="listitem"]');
        await expect(badges).toHaveCount(5);
    });

    test('img.photo-portrait a aria-hidden="false" ou alt descriptif', async ({ page }) => {
        const alt = await page.locator('.photo-portrait').getAttribute('alt');
        expect(alt).toBeTruthy();
        expect(alt.trim().length).toBeGreaterThan(5);
    });

    test('les icônes décoratives dans les cards ont aria-hidden="true"', async ({ page }) => {
        const icons = page.locator('#why-me .why-card .why-icon i');
        const count = await icons.count();
        for (let i = 0; i < count; i++) {
            const ariaHidden = await icons.nth(i).getAttribute('aria-hidden');
            expect(ariaHidden).toBe('true');
        }
    });
});

// ====================================================================
// Edge case — Sécurité : section résiste aux inputs malveillants (i18n)
// ====================================================================
test.describe('Sécurité — XSS via i18n', () => {
    test('la section ne contient pas de script injecté', async ({ page }) => {
        const errors = [];
        page.on('pageerror', err => errors.push(err.message));
        await page.goto('/');
        await page.locator('#why-me').scrollIntoViewIfNeeded();
        await page.waitForTimeout(300);

        const scriptTags = await page.evaluate(() => {
            return document.querySelectorAll('#why-me script').length;
        });
        expect(scriptTags).toBe(0);
        expect(errors).toHaveLength(0);
    });
});
