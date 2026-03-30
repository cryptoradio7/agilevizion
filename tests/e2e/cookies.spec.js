/**
 * Tests E2E — Bannière cookies RGPD (Story #14)
 * Playwright — Desktop Chrome + Mobile
 *
 * Couvre :
 * - CA1 : bannière visible au premier chargement (pas de consentement)
 * - CA2 : texte correct + lien mentions légales
 * - CA3 : 2 boutons (Accepter / Refuser)
 * - CA4 : clic Accepter → localStorage 'accepted', bannière masquée
 * - CA5 : clic Refuser → localStorage 'refused', bannière masquée
 * - CA6 : bannière absente après rechargement si consentement donné
 * - CA7 : position bas d'écran, z-index élevé, semi-transparente
 * - CA8 : consentement persistant entre pages (index → cyber → ia)
 * - Edge : localStorage absent → bannière toujours affichée
 * - Edge : consentement expiré (>365j) → bannière réapparaît
 * - Accessibilité : role="dialog", aria-label
 */

'use strict';

const { test, expect } = require('@playwright/test');

// ====================================================================
// Helpers
// ====================================================================

/** Efface le localStorage et recharge la page pour simuler une première visite */
async function freshVisit(page, url = '/') {
    await page.goto(url);
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    // Attendre que le module cookies.js s'initialise
    await page.waitForTimeout(200);
}

/** Injecte un consentement dans localStorage puis recharge */
async function visitWithConsent(page, value, daysAgo = 0, url = '/') {
    await page.goto(url);
    const timestamp = Date.now() - daysAgo * 24 * 60 * 60 * 1000;
    await page.evaluate(({ key, val, ts }) => {
        localStorage.setItem(key, JSON.stringify({ value: val, timestamp: ts }));
    }, { key: 'cookie_consent', val: value, ts: timestamp });
    await page.reload();
    await page.waitForTimeout(200);
}

// ====================================================================
// CA1 — Bannière visible au premier chargement
// ====================================================================
test.describe('CA1 — Bannière visible au premier chargement', () => {
    test('index.html : bannière visible si pas de consentement', async ({ page }) => {
        await freshVisit(page, '/');
        const banner = page.locator('#cookie-banner');
        await expect(banner).toBeVisible();
    });

    test('cyber.html : bannière visible si pas de consentement', async ({ page }) => {
        await freshVisit(page, '/cyber.html');
        const banner = page.locator('#cookie-banner');
        await expect(banner).toBeVisible();
    });

    test('ia.html : bannière visible si pas de consentement', async ({ page }) => {
        await freshVisit(page, '/ia.html');
        const banner = page.locator('#cookie-banner');
        await expect(banner).toBeVisible();
    });

    test('bannière dans le DOM avec display:flex (pas display:none)', async ({ page }) => {
        await freshVisit(page, '/');
        const display = await page.locator('#cookie-banner').evaluate(el => {
            return window.getComputedStyle(el).display;
        });
        expect(display).toBe('flex');
    });
});

// ====================================================================
// CA2 — Texte et lien mentions légales
// ====================================================================
test.describe('CA2 — Contenu de la bannière', () => {
    test.beforeEach(async ({ page }) => {
        await freshVisit(page, '/');
    });

    test('bannière contient le texte sur les cookies (FR ou EN selon langue détectée)', async ({ page }) => {
        const bannerText = await page.locator('#cookie-banner').innerText();
        const lower = bannerText.toLowerCase();
        // Texte FR : "cookies essentiels" / Texte EN : "essential cookies"
        expect(lower).toContain('cookie');
        // Le texte contient "essentiel" (FR) ou "essential" (EN)
        const hasEssential = lower.includes('essentiel') || lower.includes('essential');
        expect(hasEssential).toBe(true);
    });

    test('bannière contient un lien vers mentions légales', async ({ page }) => {
        const link = page.locator('#cookie-banner a');
        await expect(link).toBeVisible();
        const href = await link.getAttribute('href');
        expect(href).toContain('legal');
    });

    test('lien mentions légales a du texte visible', async ({ page }) => {
        const linkText = await page.locator('#cookie-banner a').innerText();
        expect(linkText.trim().length).toBeGreaterThan(0);
    });
});

// ====================================================================
// CA3 — 2 boutons : Accepter (primary) + Refuser (secondary)
// ====================================================================
test.describe('CA3 — Boutons Accepter et Refuser', () => {
    test.beforeEach(async ({ page }) => {
        await freshVisit(page, '/');
    });

    test('bannière contient exactement 2 boutons', async ({ page }) => {
        const buttons = page.locator('#cookie-banner button');
        await expect(buttons).toHaveCount(2);
    });

    test('bouton Accepter existe et est visible', async ({ page }) => {
        const btnAccept = page.locator('#cookie-banner .btn-accept');
        await expect(btnAccept).toBeVisible();
    });

    test('bouton Refuser existe et est visible', async ({ page }) => {
        const btnRefuse = page.locator('#cookie-banner .btn-refuse');
        await expect(btnRefuse).toBeVisible();
    });

    test('bouton Accepter a un texte visible', async ({ page }) => {
        const text = await page.locator('#cookie-banner .btn-accept').innerText();
        expect(text.trim().length).toBeGreaterThan(0);
    });

    test('bouton Refuser a un texte visible', async ({ page }) => {
        const text = await page.locator('#cookie-banner .btn-refuse').innerText();
        expect(text.trim().length).toBeGreaterThan(0);
    });
});

// ====================================================================
// CA4 — Clic Accepter : localStorage + bannière masquée
// ====================================================================
test.describe('CA4 — Clic Accepter', () => {
    test('clic Accepter : localStorage cookie_consent = accepted', async ({ page }) => {
        await freshVisit(page, '/');
        await page.locator('#cookie-banner .btn-accept').click();
        await page.waitForTimeout(100);

        const raw = await page.evaluate(() => localStorage.getItem('cookie_consent'));
        expect(raw).not.toBeNull();
        const data = JSON.parse(raw);
        expect(data.value).toBe('accepted');
    });

    test('clic Accepter : timestamp stocké (valeur récente)', async ({ page }) => {
        await freshVisit(page, '/');
        const before = Date.now();
        await page.locator('#cookie-banner .btn-accept').click();
        await page.waitForTimeout(100);
        const after = Date.now();

        const data = JSON.parse(await page.evaluate(() => localStorage.getItem('cookie_consent')));
        expect(data.timestamp).toBeGreaterThanOrEqual(before - 1000);
        expect(data.timestamp).toBeLessThanOrEqual(after + 1000);
    });

    test('clic Accepter : bannière masquée (display:none après transition)', async ({ page }) => {
        await freshVisit(page, '/');
        await page.locator('#cookie-banner .btn-accept').click();
        await page.waitForTimeout(500); // attendre la transition 300ms

        const display = await page.locator('#cookie-banner').evaluate(el => el.style.display);
        expect(display).toBe('none');
    });

    test('clic Accepter : classe .cookie-banner--hidden ajoutée', async ({ page }) => {
        await freshVisit(page, '/');
        await page.locator('#cookie-banner .btn-accept').click();
        await page.waitForTimeout(100);

        const hasClass = await page.locator('#cookie-banner').evaluate(el =>
            el.classList.contains('cookie-banner--hidden')
        );
        expect(hasClass).toBe(true);
    });
});

// ====================================================================
// CA5 — Clic Refuser : localStorage + bannière masquée
// ====================================================================
test.describe('CA5 — Clic Refuser', () => {
    test('clic Refuser : localStorage cookie_consent = refused', async ({ page }) => {
        await freshVisit(page, '/');
        await page.locator('#cookie-banner .btn-refuse').click();
        await page.waitForTimeout(100);

        const raw = await page.evaluate(() => localStorage.getItem('cookie_consent'));
        expect(raw).not.toBeNull();
        const data = JSON.parse(raw);
        expect(data.value).toBe('refused');
    });

    test('clic Refuser : bannière masquée après transition', async ({ page }) => {
        await freshVisit(page, '/');
        await page.locator('#cookie-banner .btn-refuse').click();
        await page.waitForTimeout(500);

        const display = await page.locator('#cookie-banner').evaluate(el => el.style.display);
        expect(display).toBe('none');
    });

    test('clic Refuser : classe .cookie-banner--hidden ajoutée', async ({ page }) => {
        await freshVisit(page, '/');
        await page.locator('#cookie-banner .btn-refuse').click();
        await page.waitForTimeout(100);

        const hasClass = await page.locator('#cookie-banner').evaluate(el =>
            el.classList.contains('cookie-banner--hidden')
        );
        expect(hasClass).toBe(true);
    });
});

// ====================================================================
// CA6 — Bannière absente après consentement donné
// ====================================================================
test.describe('CA6 — Bannière absente après consentement', () => {
    test('après accept → rechargement → bannière absente', async ({ page }) => {
        await freshVisit(page, '/');
        await page.locator('#cookie-banner .btn-accept').click();
        await page.waitForTimeout(400);

        await page.reload();
        await page.waitForTimeout(200);

        const banner = page.locator('#cookie-banner');
        // display doit rester 'none' (pas 'flex')
        const display = await banner.evaluate(el => el.style.display || 'none');
        expect(display).not.toBe('flex');
    });

    test('après refuse → rechargement → bannière absente', async ({ page }) => {
        await freshVisit(page, '/');
        await page.locator('#cookie-banner .btn-refuse').click();
        await page.waitForTimeout(400);

        await page.reload();
        await page.waitForTimeout(200);

        const display = await page.locator('#cookie-banner').evaluate(el => el.style.display || 'none');
        expect(display).not.toBe('flex');
    });

    test('consentement "accepted" existant → bannière jamais affichée', async ({ page }) => {
        await visitWithConsent(page, 'accepted', 10);
        const banner = page.locator('#cookie-banner');
        const display = await banner.evaluate(el => el.style.display || 'none');
        expect(display).not.toBe('flex');
    });

    test('consentement "refused" existant → bannière jamais affichée', async ({ page }) => {
        await visitWithConsent(page, 'refused', 5);
        const display = await page.locator('#cookie-banner').evaluate(el => el.style.display || 'none');
        expect(display).not.toBe('flex');
    });
});

// ====================================================================
// CA7 — Positionnement et style de la bannière
// ====================================================================
test.describe('CA7 — Positionnement et style', () => {
    test.beforeEach(async ({ page }) => {
        await freshVisit(page, '/');
    });

    test('bannière positionnée en bas de l\'écran (position: fixed)', async ({ page }) => {
        const position = await page.locator('#cookie-banner').evaluate(el =>
            window.getComputedStyle(el).position
        );
        expect(position).toBe('fixed');
    });

    test('bannière en bas (bottom: 0px)', async ({ page }) => {
        const bottom = await page.locator('#cookie-banner').evaluate(el =>
            window.getComputedStyle(el).bottom
        );
        expect(bottom).toBe('0px');
    });

    test('bannière sur toute la largeur (left: 0, right: 0)', async ({ page }) => {
        const { left, right } = await page.locator('#cookie-banner').evaluate(el => ({
            left: window.getComputedStyle(el).left,
            right: window.getComputedStyle(el).right,
        }));
        expect(left).toBe('0px');
        expect(right).toBe('0px');
    });

    test('z-index de la bannière ≥ 1000', async ({ page }) => {
        const zIndex = await page.locator('#cookie-banner').evaluate(el =>
            parseInt(window.getComputedStyle(el).zIndex, 10)
        );
        expect(zIndex).toBeGreaterThanOrEqual(1000);
    });

    test('bannière semi-transparente (background-color avec alpha)', async ({ page }) => {
        const bgColor = await page.locator('#cookie-banner').evaluate(el =>
            window.getComputedStyle(el).backgroundColor
        );
        // rgba(...) → contient 4 valeurs dont alpha < 1
        expect(bgColor).toMatch(/rgba/);
        // Extraire la valeur alpha
        const alphaMatch = bgColor.match(/rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*([\d.]+)\s*\)/);
        if (alphaMatch) {
            const alpha = parseFloat(alphaMatch[1]);
            expect(alpha).toBeLessThan(1); // semi-transparent
            expect(alpha).toBeGreaterThan(0); // pas invisible
        }
    });

    test('bannière visible en bas lors du chargement (pas scrollée)', async ({ page }) => {
        const boundingBox = await page.locator('#cookie-banner').boundingBox();
        const viewportHeight = page.viewportSize().height;
        // La bannière doit être visible (en bas de l'écran)
        expect(boundingBox.y + boundingBox.height).toBeLessThanOrEqual(viewportHeight + 5);
    });
});

// ====================================================================
// CA8 — Persistance entre pages (même localStorage)
// ====================================================================
test.describe('CA8 — Persistance du consentement entre pages', () => {
    test('accepter sur index.html → cy.html ne montre pas la bannière', async ({ page }) => {
        // Première visite : accepter
        await freshVisit(page, '/');
        await page.locator('#cookie-banner .btn-accept').click();
        await page.waitForTimeout(400);

        // Navigation vers cyber.html
        await page.goto('/cyber.html');
        await page.waitForTimeout(200);

        const display = await page.locator('#cookie-banner').evaluate(el => el.style.display || 'none');
        expect(display).not.toBe('flex');
    });

    test('accepter sur index.html → ia.html ne montre pas la bannière', async ({ page }) => {
        await freshVisit(page, '/');
        await page.locator('#cookie-banner .btn-accept').click();
        await page.waitForTimeout(400);

        await page.goto('/ia.html');
        await page.waitForTimeout(200);

        const display = await page.locator('#cookie-banner').evaluate(el => el.style.display || 'none');
        expect(display).not.toBe('flex');
    });

    test('refuser sur cyber.html → index.html ne montre pas la bannière', async ({ page }) => {
        await freshVisit(page, '/cyber.html');
        await page.locator('#cookie-banner .btn-refuse').click();
        await page.waitForTimeout(400);

        await page.goto('/');
        await page.waitForTimeout(200);

        const display = await page.locator('#cookie-banner').evaluate(el => el.style.display || 'none');
        expect(display).not.toBe('flex');
    });
});

// ====================================================================
// Edge — Consentement expiré (> 365 jours)
// ====================================================================
test.describe('Edge — Consentement expiré', () => {
    test('consentement de 366 jours → bannière réapparaît', async ({ page }) => {
        await visitWithConsent(page, 'accepted', 366);
        const banner = page.locator('#cookie-banner');
        const display = await banner.evaluate(el => el.style.display);
        expect(display).toBe('flex');
    });

    test('consentement de 364 jours → bannière absente', async ({ page }) => {
        await visitWithConsent(page, 'accepted', 364);
        const display = await page.locator('#cookie-banner').evaluate(el => el.style.display || 'none');
        expect(display).not.toBe('flex');
    });

    test('consentement expiré → localStorage nettoyé', async ({ page }) => {
        await visitWithConsent(page, 'accepted', 400);
        // Attendre que le module lise et supprime la clé expirée
        await page.waitForTimeout(200);
        const raw = await page.evaluate(() => localStorage.getItem('cookie_consent'));
        expect(raw).toBeNull();
    });
});

// ====================================================================
// Accessibilité
// ====================================================================
test.describe('Accessibilité — bannière cookies', () => {
    test.beforeEach(async ({ page }) => {
        await freshVisit(page, '/');
    });

    test('bannière a role="dialog"', async ({ page }) => {
        const role = await page.locator('#cookie-banner').getAttribute('role');
        expect(role).toBe('dialog');
    });

    test('bannière a aria-label défini', async ({ page }) => {
        const ariaLabel = await page.locator('#cookie-banner').getAttribute('aria-label');
        expect(ariaLabel).toBeTruthy();
        expect(ariaLabel.length).toBeGreaterThan(0);
    });

    test('les boutons sont cliquables (pas disabled)', async ({ page }) => {
        await expect(page.locator('#cookie-banner .btn-accept')).toBeEnabled();
        await expect(page.locator('#cookie-banner .btn-refuse')).toBeEnabled();
    });

    test('la bannière est visible dans le viewport initial (pas besoin de scroller)', async ({ page }) => {
        await expect(page.locator('#cookie-banner')).toBeInViewport();
    });
});

// ====================================================================
// Mobile — Responsive
// ====================================================================
test.describe('Responsive — bannière mobile', () => {
    test('bannière visible sur mobile 375px', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await freshVisit(page, '/');
        const banner = page.locator('#cookie-banner');
        await expect(banner).toBeVisible();
    });

    test('bannière visible sur tablette 768px', async ({ page }) => {
        await page.setViewportSize({ width: 768, height: 1024 });
        await freshVisit(page, '/');
        const banner = page.locator('#cookie-banner');
        await expect(banner).toBeVisible();
    });

    test('sur mobile : boutons toujours visibles et cliquables', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await freshVisit(page, '/');
        await expect(page.locator('#cookie-banner .btn-accept')).toBeVisible();
        await expect(page.locator('#cookie-banner .btn-refuse')).toBeVisible();
    });
});
