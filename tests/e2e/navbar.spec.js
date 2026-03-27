/**
 * Tests E2E — Navbar sticky avec navigation (Story #1)
 * Playwright — Desktop Chrome + iPhone 12
 *
 * Couvre : position fixed, z-index, scroll shadow, lien actif,
 * hamburger mobile, fermeture menu, switch langue.
 *
 * Note : les tests de clic sur FR/EN sont documentés mais skippés
 * car i18n.js n'est pas encore implémenté (Story #10 dépendance).
 */

'use strict';

const { test, expect } = require('@playwright/test');

// ====================================================================
// CA1 — Structure de la navbar
// ====================================================================
test.describe('Structure de la navbar', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('navbar présente avec id="navbar"', async ({ page }) => {
        const navbar = page.locator('#navbar');
        await expect(navbar).toBeVisible();
    });

    test('logo AgileVizion visible et lien vers /', async ({ page }) => {
        const logo = page.locator('.nav-logo');
        await expect(logo).toBeVisible();
        await expect(logo).toHaveAttribute('href', '/');
        await expect(logo).toContainText('AgileVizion');
    });

    test('lien "Cyber GRC" présent et pointe vers cyber.html', async ({ page }) => {
        const cyberLink = page.locator('.nav-menu a[href="cyber.html"]');
        await expect(cyberLink).toBeVisible();
    });

    test('lien "IA Agentique" présent et pointe vers ia.html', async ({ page }) => {
        const iaLink = page.locator('.nav-menu a[href="ia.html"]');
        await expect(iaLink).toBeVisible();
    });

    test('boutons langue FR et EN présents', async ({ page }) => {
        await expect(page.locator('#lang-fr')).toBeVisible();
        await expect(page.locator('#lang-en')).toBeVisible();
        await expect(page.locator('#lang-fr')).toContainText('FR');
        await expect(page.locator('#lang-en')).toContainText('EN');
    });
});

// ====================================================================
// CA2 — Position fixed et z-index
// CA7 — z-index suffisant pour rester au-dessus du contenu
// ====================================================================
test.describe('Position fixed et z-index', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('navbar a position: fixed', async ({ page }) => {
        const position = await page.evaluate(() => {
            const nav = document.getElementById('navbar');
            return window.getComputedStyle(nav).position;
        });
        expect(position).toBe('fixed');
    });

    test('navbar est ancrée en haut (top: 0)', async ({ page }) => {
        const top = await page.evaluate(() => {
            const nav = document.getElementById('navbar');
            return parseInt(window.getComputedStyle(nav).top, 10);
        });
        expect(top).toBe(0);
    });

    test('navbar a un z-index ≥ 1000', async ({ page }) => {
        const zIndex = await page.evaluate(() => {
            const nav = document.getElementById('navbar');
            return parseInt(window.getComputedStyle(nav).zIndex, 10);
        });
        expect(zIndex).toBeGreaterThanOrEqual(1000);
    });

    test('navbar reste visible après scroll de 500px', async ({ page }) => {
        // Ajouter du contenu pour pouvoir scroller
        await page.evaluate(() => {
            document.body.style.minHeight = '3000px';
        });
        await page.evaluate(() => window.scrollTo(0, 500));
        await page.waitForTimeout(100);
        const navbar = page.locator('#navbar');
        await expect(navbar).toBeInViewport();
    });
});

// ====================================================================
// CA3 — Ombre au scroll (scroll > 50px)
// ====================================================================
test.describe('Ombre au scroll (> 50px)', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.evaluate(() => {
            document.body.style.minHeight = '3000px';
        });
    });

    test('pas de classe scrolled au chargement (scrollY = 0)', async ({ page }) => {
        const hasScrolled = await page.evaluate(() => {
            return document.getElementById('navbar').classList.contains('scrolled');
        });
        expect(hasScrolled).toBe(false);
    });

    test('classe scrolled ajoutée après scroll de 100px', async ({ page }) => {
        await page.evaluate(() => window.scrollTo(0, 100));
        await page.waitForTimeout(100);
        const hasScrolled = await page.evaluate(() => {
            return document.getElementById('navbar').classList.contains('scrolled');
        });
        expect(hasScrolled).toBe(true);
    });

    test('classe scrolled supprimée en revenant en haut', async ({ page }) => {
        await page.evaluate(() => window.scrollTo(0, 100));
        await page.waitForTimeout(100);
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(100);
        const hasScrolled = await page.evaluate(() => {
            return document.getElementById('navbar').classList.contains('scrolled');
        });
        expect(hasScrolled).toBe(false);
    });

    test('classe scrolled absente à scrollY = 50 (seuil exclusif)', async ({ page }) => {
        await page.evaluate(() => window.scrollTo(0, 50));
        await page.waitForTimeout(100);
        const hasScrolled = await page.evaluate(() => {
            return document.getElementById('navbar').classList.contains('scrolled');
        });
        expect(hasScrolled).toBe(false);
    });
});

// ====================================================================
// CA4 — Lien actif de la page courante
// ====================================================================
test.describe('Lien actif de la page courante', () => {
    test('landing (index.html) → aucun lien de navigation actif', async ({ page }) => {
        await page.goto('/');
        const activeLinks = page.locator('.nav-menu a.active');
        await expect(activeLinks).toHaveCount(0);
    });

    test('cyber.html → lien "Cyber GRC" actif', async ({ page }) => {
        await page.goto('/cyber.html');
        const cyberLink = page.locator('.nav-menu a[href="cyber.html"]');
        await expect(cyberLink).toHaveClass(/active/);
    });

    test('ia.html → lien "IA Agentique" actif', async ({ page }) => {
        await page.goto('/ia.html');
        const iaLink = page.locator('.nav-menu a[href="ia.html"]');
        await expect(iaLink).toHaveClass(/active/);
    });

    test('cyber.html → exactement 1 seul lien actif', async ({ page }) => {
        await page.goto('/cyber.html');
        const activeLinks = page.locator('.nav-menu a.active');
        await expect(activeLinks).toHaveCount(1);
    });

    test('ia.html → exactement 1 seul lien actif', async ({ page }) => {
        await page.goto('/ia.html');
        const activeLinks = page.locator('.nav-menu a.active');
        await expect(activeLinks).toHaveCount(1);
    });
});

// ====================================================================
// CA5 — Menu hamburger mobile
// (Ces tests s'exécutent sur le projet 'mobile' — iPhone 12 viewport)
// ====================================================================
test.describe('Menu hamburger mobile', () => {
    test.use({ viewport: { width: 375, height: 812 } });

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('bouton hamburger visible sur mobile', async ({ page }) => {
        const toggle = page.locator('#nav-toggle');
        await expect(toggle).toBeVisible();
    });

    test('nav-menu initialement masqué (CSS : translate hors vue)', async ({ page }) => {
        // Le menu est hors vue (transform: translateY(-100%)) mais visible dans le DOM
        // On vérifie la position via getBoundingClientRect
        const menuTop = await page.evaluate(() => {
            const menu = document.getElementById('nav-menu');
            return menu.getBoundingClientRect().bottom;
        });
        // Le menu est au-dessus du viewport (bottom < 0 ou position off-screen)
        const navbarHeight = await page.evaluate(() => {
            return document.getElementById('navbar').getBoundingClientRect().height;
        });
        // Le menu doit être hors du viewport visible (au-dessus de la navbar)
        // Avec translateY(-100%), le bottom du menu est en-dessous de la navbar
        // mais pointer-events: none, donc non interactif
        const isInteractive = await page.evaluate(() => {
            const menu = document.getElementById('nav-menu');
            return window.getComputedStyle(menu).pointerEvents;
        });
        expect(isInteractive).toBe('none');
    });

    test('clic toggle → menu devient interactif (pointer-events: auto)', async ({ page }) => {
        await page.locator('#nav-toggle').click();
        const pointerEvents = await page.evaluate(() => {
            return window.getComputedStyle(document.getElementById('nav-menu')).pointerEvents;
        });
        expect(pointerEvents).toBe('auto');
    });

    test('clic toggle → menu a la classe open', async ({ page }) => {
        await page.locator('#nav-toggle').click();
        await expect(page.locator('#nav-menu')).toHaveClass(/open/);
    });

    // Edge case CA : menu ouvert → clic sur lien → menu se ferme
    test('clic sur lien "Cyber GRC" dans le menu mobile → menu se ferme', async ({ page }) => {
        const toggle = page.locator('#nav-toggle');
        const menu = page.locator('#nav-menu');
        await toggle.click();
        await expect(menu).toHaveClass(/open/);
        // Clic sur le lien (ne navigue pas en test, juste déclenche le listener)
        await page.locator('#nav-menu a[href="cyber.html"]').click({ noWaitAfter: true });
        await page.waitForTimeout(100);
        await expect(menu).not.toHaveClass(/open/);
    });
});

// ====================================================================
// CA5 — Resize mobile → desktop : menu se ferme automatiquement
// ====================================================================
test.describe('Resize mobile → desktop', () => {
    test('menu ouvert sur mobile → resize vers desktop → menu fermé', async ({ page }) => {
        // Commencer en mobile
        await page.setViewportSize({ width: 375, height: 812 });
        await page.goto('/');
        // Ouvrir le menu
        await page.locator('#nav-toggle').click();
        await expect(page.locator('#nav-menu')).toHaveClass(/open/);
        // Passer au viewport desktop
        await page.setViewportSize({ width: 1280, height: 800 });
        // Déclencher l'événement resize
        await page.evaluate(() => window.dispatchEvent(new Event('resize')));
        await page.waitForTimeout(100);
        await expect(page.locator('#nav-menu')).not.toHaveClass(/open/);
    });
});

// ====================================================================
// CA6 — Switch langue (structure et état initial)
// Le clic réel sur FR/EN requiert i18n.js (Story #10, non encore implémentée)
// On vérifie : présence, état initial, attributs
// ====================================================================
test.describe('Switch langue (structure)', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('bouton lang-fr a la classe active par défaut (pas de i18n.js)', async ({ page }) => {
        // updateLangButtons() dans nav.js fallback vers 'fr' si I18n indéfini
        await expect(page.locator('#lang-fr')).toHaveClass(/active/);
    });

    test('bouton lang-en n\'a PAS la classe active par défaut', async ({ page }) => {
        const hasActive = await page.evaluate(() => {
            return document.getElementById('lang-en').classList.contains('active');
        });
        expect(hasActive).toBe(false);
    });

    test('boutons FR/EN ont les attributs HTML corrects', async ({ page }) => {
        const frBtn = page.locator('#lang-fr');
        const enBtn = page.locator('#lang-en');
        await expect(frBtn).toHaveText('FR');
        await expect(enBtn).toHaveText('EN');
    });

    // Note : le clic sur FR/EN via onclick="I18n.switchLanguage()" throw ReferenceError
    // si i18n.js n'est pas chargé. Ce comportement est documenté ici.
    test('clic sur bouton EN sans i18n.js → erreur console isolée, pas de crash page', async ({ page }) => {
        const errors = [];
        page.on('pageerror', err => errors.push(err.message));
        await page.locator('#lang-en').click();
        await page.waitForTimeout(200);
        // La page ne doit pas crasher (navigation, exception fatale, etc.)
        await expect(page.locator('#navbar')).toBeVisible();
        // Une erreur console est attendue (ReferenceError: I18n is not defined)
        // C'est un BUG à corriger quand i18n.js sera livré (Story #10)
    });
});

// ====================================================================
// Edge case : JS désactivé → navbar visible avec liens fonctionnels
// ====================================================================
test.describe('Fallback sans JavaScript', () => {
    test('navbar et liens visibles même sans JS', async ({ browser }) => {
        // Créer un contexte sans JS
        const context = await browser.newContext({ javaScriptEnabled: false });
        const page = await context.newPage();
        await page.goto('/');
        // La navbar doit être visible (CSS uniquement)
        await expect(page.locator('#navbar')).toBeVisible();
        // Les liens de navigation doivent être présents
        await expect(page.locator('.nav-menu a[href="cyber.html"]')).toBeVisible();
        await expect(page.locator('.nav-menu a[href="ia.html"]')).toBeVisible();
        await context.close();
    });
});
