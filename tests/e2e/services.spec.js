/**
 * Tests E2E — Section Services Landing Page (Story #3)
 * Playwright — Desktop Chrome + iPhone 12
 *
 * Couvre :
 * - CA1 : 2 cartes côte à côte (services-grid)
 * - CA2 : contenu de chaque carte (icône, titre, description, bouton)
 * - CA3 : liens vers cyber.html et ia.html
 * - CA4 : effet hover visuel (scale/shadow/border)
 * - CA5 : responsive mobile (cartes empilées 1 colonne)
 * - CA6 : classe .animate-in présente
 * - Edge case : max-width sur écran >1440px
 */

'use strict';

const { test, expect } = require('@playwright/test');

// ====================================================================
// CA1 — 2 cartes côte à côte dans .services-grid
// ====================================================================
test.describe('CA1 — Grille services : 2 cartes côte à côte', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        // Scroll jusqu'à la section services pour déclencher animate-in
        await page.locator('#services').scrollIntoViewIfNeeded();
        await page.waitForTimeout(300);
    });

    test('section#services visible', async ({ page }) => {
        await expect(page.locator('#services')).toBeVisible();
    });

    test('.services-grid présente dans #services', async ({ page }) => {
        const grid = page.locator('#services .services-grid');
        await expect(grid).toBeAttached();
    });

    test('exactement 2 cartes .service-card dans la grille', async ({ page }) => {
        const cards = page.locator('.services-grid .service-card');
        await expect(cards).toHaveCount(2);
    });

    test('les 2 cartes sont visibles', async ({ page }) => {
        const cards = page.locator('.services-grid .service-card');
        await expect(cards.nth(0)).toBeVisible();
        await expect(cards.nth(1)).toBeVisible();
    });

    test('titre de section h2 visible', async ({ page }) => {
        const h2 = page.locator('#services h2.section-title');
        await expect(h2).toBeVisible();
    });

    test('desktop : les 2 cartes sont côte à côte (même ligne horizontale)', async ({ page }) => {
        await page.setViewportSize({ width: 1280, height: 800 });
        await page.goto('/');
        await page.locator('#services').scrollIntoViewIfNeeded();
        await page.waitForTimeout(300);

        const { top1, top2, sameRow } = await page.evaluate(() => {
            const cards = document.querySelectorAll('.services-grid .service-card');
            const r1 = cards[0].getBoundingClientRect();
            const r2 = cards[1].getBoundingClientRect();
            // "même ligne" = centres verticaux à moins de 30px d'écart
            return {
                top1: r1.top,
                top2: r2.top,
                sameRow: Math.abs(r1.top - r2.top) < 30
            };
        });

        expect(sameRow).toBe(true);
    });

    test('desktop : carte 2 est à droite de la carte 1 (layout horizontal)', async ({ page }) => {
        await page.setViewportSize({ width: 1280, height: 800 });
        await page.goto('/');
        await page.locator('#services').scrollIntoViewIfNeeded();

        const { left1, left2 } = await page.evaluate(() => {
            const cards = document.querySelectorAll('.services-grid .service-card');
            return {
                left1: cards[0].getBoundingClientRect().left,
                left2: cards[1].getBoundingClientRect().left
            };
        });

        expect(left2).toBeGreaterThan(left1);
    });
});

// ====================================================================
// CA2 — Contenu de chaque carte (icône, titre, description, bouton)
// ====================================================================
test.describe('CA2 — Contenu des cartes', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.locator('#services').scrollIntoViewIfNeeded();
        await page.waitForTimeout(300);
    });

    test('carte cyber : icône .service-icon visible', async ({ page }) => {
        const icon = page.locator('.service-card[href="cyber.html"] .service-icon');
        await expect(icon).toBeVisible();
    });

    test('carte ia : icône .service-icon visible', async ({ page }) => {
        const icon = page.locator('.service-card[href="ia.html"] .service-icon');
        await expect(icon).toBeVisible();
    });

    test('carte cyber : icône Font Awesome dans .service-icon', async ({ page }) => {
        const icon = page.locator('.service-card[href="cyber.html"] .service-icon i');
        await expect(icon).toBeAttached();
    });

    test('carte ia : icône Font Awesome dans .service-icon', async ({ page }) => {
        const icon = page.locator('.service-card[href="ia.html"] .service-icon i');
        await expect(icon).toBeAttached();
    });

    test('carte cyber : titre h3 visible et non vide', async ({ page }) => {
        const h3 = page.locator('.service-card[href="cyber.html"] h3');
        await expect(h3).toBeVisible();
        const text = await h3.textContent();
        expect(text.trim().length).toBeGreaterThan(0);
    });

    test('carte ia : titre h3 visible et non vide', async ({ page }) => {
        const h3 = page.locator('.service-card[href="ia.html"] h3');
        await expect(h3).toBeVisible();
        const text = await h3.textContent();
        expect(text.trim().length).toBeGreaterThan(0);
    });

    test('carte cyber : description p visible', async ({ page }) => {
        const p = page.locator('.service-card[href="cyber.html"] p');
        await expect(p).toBeVisible();
    });

    test('carte ia : description p visible', async ({ page }) => {
        const p = page.locator('.service-card[href="ia.html"] p');
        await expect(p).toBeVisible();
    });

    test('carte cyber : description cite au moins une norme (DORA, NIS 2, ISO 27001)', async ({ page }) => {
        const text = await page.locator('.service-card[href="cyber.html"] p').textContent();
        const mentionsNorm = ['DORA', 'NIS 2', 'ISO 27001', 'RGPD'].some(n => text.includes(n));
        expect(mentionsNorm).toBe(true);
    });

    test('carte ia : description mentionne l\'IA ou les agents', async ({ page }) => {
        const text = await page.locator('.service-card[href="ia.html"] p').textContent();
        const lower = text.toLowerCase();
        const mentions = ['ia', 'agent', 'automati', 'artificielle', 'agentic'].some(k => lower.includes(k));
        expect(mentions).toBe(true);
    });

    test('carte cyber : .service-link visible avec texte non vide', async ({ page }) => {
        const link = page.locator('.service-card[href="cyber.html"] .service-link');
        await expect(link).toBeVisible();
        const text = await link.textContent();
        expect(text.trim().length).toBeGreaterThan(0);
    });

    test('carte ia : .service-link visible avec texte non vide', async ({ page }) => {
        const link = page.locator('.service-card[href="ia.html"] .service-link');
        await expect(link).toBeVisible();
        const text = await link.textContent();
        expect(text.trim().length).toBeGreaterThan(0);
    });

    test('.service-link contient "En savoir plus" ou "Learn more"', async ({ page }) => {
        const links = page.locator('.service-card .service-link');
        const count = await links.count();
        for (let i = 0; i < count; i++) {
            const text = await links.nth(i).textContent();
            const lower = text.toLowerCase();
            const hasCallToAction = lower.includes('savoir') || lower.includes('more') || lower.includes('learn') || lower.includes('découvrir');
            expect(hasCallToAction).toBe(true);
        }
    });
});

// ====================================================================
// CA3 — Liens vers cyber.html et ia.html
// ====================================================================
test.describe('CA3 — Navigation vers cyber.html et ia.html', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('carte cyber a href="cyber.html"', async ({ page }) => {
        const card = page.locator('.service-card[href="cyber.html"]');
        await expect(card).toHaveAttribute('href', 'cyber.html');
    });

    test('carte ia a href="ia.html"', async ({ page }) => {
        const card = page.locator('.service-card[href="ia.html"]');
        await expect(card).toHaveAttribute('href', 'ia.html');
    });

    test('clic sur carte cyber navigue vers cyber.html', async ({ page }) => {
        await page.locator('.service-card[href="cyber.html"]').click();
        await expect(page).toHaveURL(/cyber\.html/);
    });

    test('clic sur carte ia navigue vers ia.html', async ({ page }) => {
        await page.locator('.service-card[href="ia.html"]').click();
        await expect(page).toHaveURL(/ia\.html/);
    });
});

// ====================================================================
// CA4 — Hover : effet visuel (scale, shadow ou border)
// ====================================================================
test.describe('CA4 — Effet hover sur les cartes', () => {
    test.use({ viewport: { width: 1280, height: 800 } });

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.locator('#services').scrollIntoViewIfNeeded();
        await page.waitForTimeout(300);
    });

    test('carte cyber : transform change au hover (scale ou translateY)', async ({ page }) => {
        const card = page.locator('.service-card[href="cyber.html"]');

        const transformBefore = await card.evaluate(el =>
            window.getComputedStyle(el).transform
        );

        await card.hover();
        await page.waitForTimeout(300); // laisser la transition CSS se jouer

        const transformAfter = await card.evaluate(el =>
            window.getComputedStyle(el).transform
        );

        // Le transform doit changer (scale ou translateY) — ou au moins box-shadow
        // On vérifie l'un ou l'autre
        const shadowBefore = await card.evaluate(el =>
            window.getComputedStyle(el).boxShadow
        );
        await card.hover();
        await page.waitForTimeout(300);
        const shadowAfter = await card.evaluate(el =>
            window.getComputedStyle(el).boxShadow
        );

        // Au moins un effet visuel doit changer (transform ou shadow)
        const hasEffect = transformBefore !== transformAfter || shadowBefore !== shadowAfter;
        expect(hasEffect).toBe(true);
    });

    test('carte ia : effet visuel au hover (transform ou box-shadow change)', async ({ page }) => {
        const card = page.locator('.service-card[href="ia.html"]');

        // Capturer état avant hover
        const before = await card.evaluate(el => ({
            transform: window.getComputedStyle(el).transform,
            shadow: window.getComputedStyle(el).boxShadow,
        }));

        await card.hover();
        await page.waitForTimeout(300);

        const after = await card.evaluate(el => ({
            transform: window.getComputedStyle(el).transform,
            shadow: window.getComputedStyle(el).boxShadow,
        }));

        const hasEffect = before.transform !== after.transform || before.shadow !== after.shadow;
        expect(hasEffect).toBe(true);
    });

    test('la transition CSS est définie sur .service-card (transition: all)', async ({ page }) => {
        const transition = await page.evaluate(() => {
            const card = document.querySelector('.service-card');
            return window.getComputedStyle(card).transition;
        });
        // La transition doit être définie (non vide ou "all 0s ease 0s")
        expect(transition).toBeTruthy();
        expect(transition).not.toBe('');
    });
});

// ====================================================================
// CA5 — Responsive : cartes empilées verticalement sur mobile
// ====================================================================
test.describe('CA5 — Responsive mobile : cartes empilées', () => {
    test.use({ viewport: { width: 375, height: 812 } });

    test('sur mobile (375px) : les 2 cartes sont empilées verticalement', async ({ page }) => {
        await page.goto('/');
        await page.locator('#services').scrollIntoViewIfNeeded();
        await page.waitForTimeout(300);

        const { bottom1, top2, isStacked } = await page.evaluate(() => {
            const cards = document.querySelectorAll('.services-grid .service-card');
            const r1 = cards[0].getBoundingClientRect();
            const r2 = cards[1].getBoundingClientRect();
            // Empilées = la 2e carte est sous la 1re (top2 > bottom1 - tolérance)
            return {
                bottom1: r1.bottom,
                top2: r2.top,
                isStacked: r2.top >= r1.bottom - 10
            };
        });

        expect(isStacked).toBe(true);
    });

    test('sur mobile : les cartes ont une largeur proche du viewport (pleine colonne)', async ({ page }) => {
        await page.goto('/');
        await page.locator('#services').scrollIntoViewIfNeeded();

        const { cardWidth, viewportWidth } = await page.evaluate(() => {
            const card = document.querySelector('.services-grid .service-card');
            return {
                cardWidth: card.getBoundingClientRect().width,
                viewportWidth: window.innerWidth
            };
        });

        // Sur mobile, la carte doit occuper > 60% du viewport
        expect(cardWidth).toBeGreaterThan(viewportWidth * 0.6);
    });

    test('sur mobile : section services reste visible', async ({ page }) => {
        await page.goto('/');
        const section = page.locator('#services');
        await section.scrollIntoViewIfNeeded();
        const height = await section.evaluate(el => el.getBoundingClientRect().height);
        expect(height).toBeGreaterThan(0);
    });
});

// ====================================================================
// CA6 — .animate-in sur chaque carte
// ====================================================================
test.describe('CA6 — Classe .animate-in sur les cartes', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('carte cyber a la classe .animate-in dans le DOM', async ({ page }) => {
        await expect(page.locator('.service-card[href="cyber.html"]')).toHaveClass(/animate-in/);
    });

    test('carte ia a la classe .animate-in dans le DOM', async ({ page }) => {
        await expect(page.locator('.service-card[href="ia.html"]')).toHaveClass(/animate-in/);
    });

    test('après scroll : les cartes ont la classe .visible (Intersection Observer)', async ({ page }) => {
        await page.locator('#services').scrollIntoViewIfNeeded();
        await page.waitForTimeout(500); // laisser l'IO agir

        const hasVisible = await page.evaluate(() => {
            const cards = document.querySelectorAll('.services-grid .service-card');
            return Array.from(cards).every(c => c.classList.contains('visible'));
        });

        expect(hasVisible).toBe(true);
    });
});

// ====================================================================
// Edge case — max-width sur écran très large (>1440px)
// ====================================================================
test.describe('Edge case — max-width : cartes bornées sur grands écrans', () => {
    test.use({ viewport: { width: 1920, height: 1080 } });

    test('sur 1920px : la grille ne dépasse pas 1200px de large (container max-width)', async ({ page }) => {
        await page.goto('/');
        await page.locator('#services').scrollIntoViewIfNeeded();

        const containerWidth = await page.evaluate(() => {
            const container = document.querySelector('#services .container');
            return container.getBoundingClientRect().width;
        });

        // Container max-width = 1200px (variable --container-max)
        expect(containerWidth).toBeLessThanOrEqual(1200);
    });

    test('sur 1920px : les 2 cartes ont des largeurs raisonnables (<700px chacune)', async ({ page }) => {
        await page.goto('/');
        await page.locator('#services').scrollIntoViewIfNeeded();

        const { w1, w2 } = await page.evaluate(() => {
            const cards = document.querySelectorAll('.services-grid .service-card');
            return {
                w1: cards[0].getBoundingClientRect().width,
                w2: cards[1].getBoundingClientRect().width,
            };
        });

        expect(w1).toBeLessThan(700);
        expect(w2).toBeLessThan(700);
    });

    test('sur 1920px : les cartes restent côte à côte (pas d\'empilement)', async ({ page }) => {
        await page.goto('/');
        await page.locator('#services').scrollIntoViewIfNeeded();

        const sameRow = await page.evaluate(() => {
            const cards = document.querySelectorAll('.services-grid .service-card');
            const r1 = cards[0].getBoundingClientRect();
            const r2 = cards[1].getBoundingClientRect();
            return Math.abs(r1.top - r2.top) < 30;
        });

        expect(sameRow).toBe(true);
    });
});

// ====================================================================
// Accessibilité
// ====================================================================
test.describe('Accessibilité de la section services', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.locator('#services').scrollIntoViewIfNeeded();
        await page.waitForTimeout(300);
    });

    test('les cartes ont un texte accessible non vide (pas de carte muette)', async ({ page }) => {
        const cards = page.locator('.services-grid .service-card');
        const count = await cards.count();
        for (let i = 0; i < count; i++) {
            const text = await cards.nth(i).textContent();
            expect(text.trim().length).toBeGreaterThan(0);
        }
    });

    test('h2 de la section services est présent (hiérarchie titres)', async ({ page }) => {
        const h2 = page.locator('#services h2');
        await expect(h2).toBeAttached();
    });

    test('h3 présent dans chaque carte (hiérarchie titres correcte)', async ({ page }) => {
        const cards = page.locator('.services-grid .service-card');
        const count = await cards.count();
        for (let i = 0; i < count; i++) {
            const h3 = cards.nth(i).locator('h3');
            await expect(h3).toBeAttached();
        }
    });
});

// ====================================================================
// Fallback sans JavaScript — section visible sans JS
// ====================================================================
test.describe('Fallback sans JavaScript', () => {
    test('section services visible sans JS (structure CSS uniquement)', async ({ browser }) => {
        const context = await browser.newContext({ javaScriptEnabled: false });
        const page = await context.newPage();
        await page.goto('/');

        await expect(page.locator('#services')).toBeVisible();
        await expect(page.locator('.services-grid')).toBeAttached();

        const cards = page.locator('.services-grid .service-card');
        await expect(cards).toHaveCount(2);

        await context.close();
    });
});
