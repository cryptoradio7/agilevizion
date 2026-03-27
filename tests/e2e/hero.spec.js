/**
 * Tests E2E — Hero Landing Page (Story #2)
 * Playwright — Desktop Chrome + iPhone 12
 *
 * Couvre : h1 fort, min-height ≥ 80vh, placeholder 16:9,
 * 2 CTAs (Calendly + mailto), responsive mobile (CTAs empilés),
 * fallback Calendly CDN, fond gradient, accessibilité.
 */

'use strict';

const { test, expect } = require('@playwright/test');

// ====================================================================
// CA1 — Structure du hero (h1, sous-titre, section)
// ====================================================================
test.describe('Structure du hero', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('section#hero présente et visible', async ({ page }) => {
        const hero = page.locator('#hero');
        await expect(hero).toBeVisible();
    });

    test('h1.hero-title visible avec accroche forte', async ({ page }) => {
        const h1 = page.locator('h1.hero-title');
        await expect(h1).toBeVisible();
    });

    test('h1 contient les mots-clés métier (cyber, agentique, consultant)', async ({ page }) => {
        await page.goto('/?lang=fr');
        await page.waitForFunction(() => {
            const h1 = document.querySelector('h1.hero-title');
            return h1 && h1.textContent.includes('consultant');
        }, { timeout: 5000 });
        const text = await page.locator('h1.hero-title').textContent();
        const lower = text.toLowerCase();
        expect(lower).toContain('cyber');
        expect(lower).toContain('agentique');
        expect(lower).toContain('consultant');
    });

    test('sous-titre p.hero-subtitle visible', async ({ page }) => {
        await expect(page.locator('p.hero-subtitle')).toBeVisible();
    });

    test('sous-titre cite au moins une norme (DORA, NIS 2, ISO 27001)', async ({ page }) => {
        const text = await page.locator('p.hero-subtitle').textContent();
        const mentionsNorm = ['DORA', 'NIS 2', 'ISO 27001'].some(n => text.includes(n));
        expect(mentionsNorm).toBe(true);
    });

    test('exactement 1 h1 dans le hero (pas de duplication)', async ({ page }) => {
        const h1s = page.locator('#hero h1');
        await expect(h1s).toHaveCount(1);
    });
});

// ====================================================================
// CA5 — Hero occupe min 80vh sur desktop
// ====================================================================
test.describe('Hero min-height ≥ 80vh (desktop)', () => {
    test.use({ viewport: { width: 1280, height: 800 } });

    test('hero height ≥ 80% de la hauteur viewport', async ({ page }) => {
        await page.goto('/');

        const { heroHeight, viewportHeight } = await page.evaluate(() => {
            const hero = document.getElementById('hero');
            const rect = hero.getBoundingClientRect();
            return {
                heroHeight: rect.height,
                viewportHeight: window.innerHeight
            };
        });

        expect(heroHeight).toBeGreaterThanOrEqual(viewportHeight * 0.80);
    });
});

// ====================================================================
// CA3 — Placeholder vidéo 16:9
// ====================================================================
test.describe('Placeholder vidéo 16:9', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('.placeholder-video visible', async ({ page }) => {
        await expect(page.locator('.placeholder-video')).toBeVisible();
    });

    test('.video-placeholder visible', async ({ page }) => {
        await expect(page.locator('.video-placeholder')).toBeVisible();
    });

    test('ratio largeur/hauteur du placeholder ≈ 16/9 (±5%)', async ({ page }) => {
        const ratio = await page.evaluate(() => {
            const el = document.querySelector('.video-placeholder');
            const rect = el.getBoundingClientRect();
            return rect.width / rect.height;
        });
        const expected = 16 / 9; // ≈ 1.778
        expect(ratio).toBeGreaterThan(expected * 0.95);
        expect(ratio).toBeLessThan(expected * 1.05);
    });

    test('bouton play visible dans le placeholder', async ({ page }) => {
        await expect(page.locator('.video-placeholder-play')).toBeVisible();
    });

    test('icône play (.fa-play) présente', async ({ page }) => {
        const icon = page.locator('.video-placeholder-play .fa-play');
        // Font Awesome génère l'icône via CSS ::before, l'élément doit être dans le DOM
        await expect(icon).toBeAttached();
    });

    test('nom de marque AgileVizion visible dans le placeholder', async ({ page }) => {
        const brand = page.locator('.video-placeholder-brand');
        await expect(brand).toBeVisible();
        const text = await brand.textContent();
        expect(text.toLowerCase()).toContain('agile');
        expect(text.toLowerCase()).toContain('vizion');
    });

    test('texte fallback "vidéo" visible dans le placeholder', async ({ page }) => {
        const span = page.locator('.video-placeholder [data-i18n="common.video_coming"]');
        await expect(span).toBeVisible();
    });

    test('pas de balise <video> dans le placeholder (MVP)', async ({ page }) => {
        const videoEl = page.locator('.video-placeholder video');
        await expect(videoEl).toHaveCount(0);
    });

    test('placeholder a un fond de couleur (gradient, pas blanc pur)', async ({ page }) => {
        const bg = await page.evaluate(() => {
            const el = document.querySelector('.video-placeholder');
            return window.getComputedStyle(el).backgroundImage;
        });
        // Le fond est un linear-gradient (pas 'none' ni blanc)
        expect(bg).toContain('gradient');
    });
});

// ====================================================================
// CA4 — 2 boutons CTA côte à côte
// ====================================================================
test.describe('CTAs : Calendly + mailto', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('bouton "Réserver un appel" visible', async ({ page }) => {
        const btn = page.locator('#hero .hero-cta button');
        await expect(btn).toBeVisible();
    });

    test('lien "M\'envoyer un email" visible', async ({ page }) => {
        const link = page.locator('#hero .hero-cta a[href^="mailto:"]');
        await expect(link).toBeVisible();
    });

    test('.hero-cta contient exactement 2 éléments cliquables (button + a)', async ({ page }) => {
        const btns = page.locator('#hero .hero-cta button, #hero .hero-cta a');
        await expect(btns).toHaveCount(2);
    });

    test('href du lien email contient @agilevizion.com', async ({ page }) => {
        const href = await page.locator('#hero .hero-cta a[href^="mailto:"]').getAttribute('href');
        expect(href).toContain('@agilevizion.com');
    });

    test('bouton Calendly a les classes btn-primary et btn-lg', async ({ page }) => {
        const btn = page.locator('#hero .hero-cta button');
        await expect(btn).toHaveClass(/btn-primary/);
        await expect(btn).toHaveClass(/btn-lg/);
    });

    test('lien email a les classes btn-outline et btn-lg', async ({ page }) => {
        const link = page.locator('#hero .hero-cta a[href^="mailto:"]');
        await expect(link).toHaveClass(/btn-outline/);
        await expect(link).toHaveClass(/btn-lg/);
    });

    test('desktop : les 2 CTAs sont sur la même ligne (flex-direction row)', async ({ page }) => {
        await page.setViewportSize({ width: 1280, height: 800 });

        const { btnTop, linkTop, sameRow } = await page.evaluate(() => {
            const btn = document.querySelector('#hero .hero-cta button');
            const link = document.querySelector('#hero .hero-cta a[href^="mailto:"]');
            const btnRect = btn.getBoundingClientRect();
            const linkRect = link.getBoundingClientRect();
            // "même ligne" = les centres verticaux se chevauchent (±20px)
            return {
                btnTop: btnRect.top,
                linkTop: linkRect.top,
                sameRow: Math.abs(btnRect.top - linkRect.top) < 20
            };
        });

        expect(sameRow).toBe(true);
    });
});

// ====================================================================
// CA7 — Responsive mobile : CTAs empilés verticalement
// ====================================================================
test.describe('Responsive mobile : CTAs empilés', () => {
    test.use({ viewport: { width: 375, height: 812 } });

    test('sur mobile (375px) : les CTAs sont empilés verticalement', async ({ page }) => {
        await page.goto('/');

        const { btnBottom, linkTop, isStacked } = await page.evaluate(() => {
            const btn = document.querySelector('#hero .hero-cta button');
            const link = document.querySelector('#hero .hero-cta a[href^="mailto:"]');
            const btnRect = btn.getBoundingClientRect();
            const linkRect = link.getBoundingClientRect();
            // Empilés = le lien est sous le bouton (top du lien > bottom du bouton)
            return {
                btnBottom: btnRect.bottom,
                linkTop: linkRect.top,
                isStacked: linkRect.top >= btnRect.bottom - 5 // tolérance 5px
            };
        });

        expect(isStacked).toBe(true);
    });

    test('sur mobile : le hero reste visible (min-height > 0)', async ({ page }) => {
        await page.goto('/');
        const heroHeight = await page.evaluate(() => {
            return document.getElementById('hero').getBoundingClientRect().height;
        });
        expect(heroHeight).toBeGreaterThan(0);
    });

    test('sur mobile : les CTAs ont une largeur significative (pleine largeur)', async ({ page }) => {
        await page.goto('/');

        const { btnWidth, viewportWidth } = await page.evaluate(() => {
            const btn = document.querySelector('#hero .hero-cta button');
            return {
                btnWidth: btn.getBoundingClientRect().width,
                viewportWidth: window.innerWidth
            };
        });

        // Sur mobile (480px responsive.css), le bouton doit être large
        // max-width: 320px ou approchant la largeur disponible
        expect(btnWidth).toBeGreaterThan(viewportWidth * 0.5);
    });
});

// ====================================================================
// Edge case CA — Fallback Calendly : CDN non chargé → window.open
// ====================================================================
test.describe('Fallback Calendly CDN', () => {
    test('si Calendly non disponible → clic bouton ne plante pas la page', async ({ page }) => {
        await page.goto('/');

        // Supprimer Calendly pour simuler le CDN non chargé
        await page.evaluate(() => {
            delete window.Calendly;
        });

        // Intercepter window.open pour éviter les popups
        await page.evaluate(() => {
            window._openCalls = [];
            window.open = function (url, target, features) {
                window._openCalls.push({ url, target, features });
            };
        });

        const errors = [];
        page.on('pageerror', err => errors.push(err.message));

        // Cliquer sur le bouton Calendly
        await page.locator('#hero .hero-cta button').click();
        await page.waitForTimeout(200);

        // Aucune erreur fatale
        const fatalErrors = errors.filter(e =>
            !e.includes('Calendly') && !e.includes('calendly')
        );
        expect(fatalErrors).toHaveLength(0);

        // window.open a été appelé avec une URL Calendly
        const calls = await page.evaluate(() => window._openCalls);
        expect(calls).toHaveLength(1);
        expect(calls[0].url).toContain('calendly.com');
        expect(calls[0].target).toBe('_blank');
    });

    test('si Calendly disponible → initPopupWidget est appelé (pas window.open)', async ({ page }) => {
        await page.goto('/');

        // Simuler Calendly chargé
        await page.evaluate(() => {
            window._openCalls = [];
            window._initCalls = [];
            window.open = function (url, target) {
                window._openCalls.push({ url, target });
            };
            window.Calendly = {
                initPopupWidget: function (opts) {
                    window._initCalls.push(opts);
                }
            };
        });

        await page.locator('#hero .hero-cta button').click();
        await page.waitForTimeout(200);

        const initCalls = await page.evaluate(() => window._initCalls);
        const openCalls = await page.evaluate(() => window._openCalls);

        expect(initCalls).toHaveLength(1);
        expect(initCalls[0].url).toContain('calendly.com');
        expect(openCalls).toHaveLength(0);
    });
});

// ====================================================================
// Accessibilité
// ====================================================================
test.describe('Accessibilité du hero', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('le placeholder vidéo a role="button"', async ({ page }) => {
        const vp = page.locator('.video-placeholder');
        await expect(vp).toHaveAttribute('role', 'button');
    });

    test('le placeholder vidéo a un aria-label non vide', async ({ page }) => {
        const vp = page.locator('.video-placeholder');
        const label = await vp.getAttribute('aria-label');
        expect(label).toBeTruthy();
        expect(label.trim().length).toBeGreaterThan(0);
    });

    test('icône play a aria-hidden="true" (décorative)', async ({ page }) => {
        const icon = page.locator('.video-placeholder-play i');
        await expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    test('les deux CTAs ont un texte visible (pas de bouton vide)', async ({ page }) => {
        const btn = await page.locator('#hero .hero-cta button').textContent();
        const link = await page.locator('#hero .hero-cta a[href^="mailto:"]').textContent();
        expect(btn.trim().length).toBeGreaterThan(0);
        expect(link.trim().length).toBeGreaterThan(0);
    });
});

// ====================================================================
// Edge case : JS désactivé → hero visible
// ====================================================================
test.describe('Fallback sans JavaScript', () => {
    test('hero visible sans JS (structure CSS uniquement)', async ({ browser }) => {
        const context = await browser.newContext({ javaScriptEnabled: false });
        const page = await context.newPage();
        await page.goto('/');

        await expect(page.locator('#hero')).toBeVisible();
        await expect(page.locator('h1.hero-title')).toBeVisible();
        await expect(page.locator('.placeholder-video')).toBeVisible();

        await context.close();
    });
});
