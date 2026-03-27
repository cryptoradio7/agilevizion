/**
 * Tests E2E — Section CTA final + Footer (Story #7)
 * Playwright — Desktop Chrome + iPhone 12
 *
 * Couvre :
 * - Titre "Prêt à échanger ?" visible sur index.html
 * - 2 boutons CTA visibles (Calendly + email)
 * - Bouton email : attribut mailto correct
 * - Fallback Calendly → window.open si CDN absent
 * - Footer visible avec email, téléphone, LinkedIn, copyright, mentions légales
 * - Footer identique sur les 3 pages
 * - Mobile 375px : boutons CTA en pleine largeur (via viewport ≤480px)
 * - Fond contrasté de la section CTA
 */

'use strict';

const { test, expect } = require('@playwright/test');

// ====================================================================
// CA1 — Section CTA index.html : présence et visibilité
// ====================================================================
test.describe('CTA index.html — présence et contenu', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.locator('#contact').scrollIntoViewIfNeeded();
    });

    test('section#contact existe dans le DOM', async ({ page }) => {
        await expect(page.locator('#contact')).toBeAttached();
    });

    test('titre "Prêt à échanger ?" est visible', async ({ page }) => {
        const h2 = page.locator('#contact .section-title');
        await expect(h2).toBeVisible();
        const text = await h2.textContent();
        expect(text).toContain('Prêt à échanger');
    });

    test('sous-titre CTA est visible', async ({ page }) => {
        const sub = page.locator('#contact .section-subtitle');
        await expect(sub).toBeVisible();
        const text = await sub.textContent();
        expect(text.trim().length).toBeGreaterThan(5);
    });

    test('2 boutons CTA sont visibles', async ({ page }) => {
        const btns = page.locator('#contact .hero-cta').locator('button, a');
        await expect(btns).toHaveCount(2);
        await expect(btns.first()).toBeVisible();
        await expect(btns.last()).toBeVisible();
    });

    test('bouton Calendly est visible et a le texte approprié', async ({ page }) => {
        const calendlyBtn = page.locator('#contact button[onclick="openCalendly()"]');
        await expect(calendlyBtn).toBeVisible();
        const text = await calendlyBtn.textContent();
        expect(text.trim().length).toBeGreaterThan(0);
    });

    test('bouton email est visible et a href mailto:', async ({ page }) => {
        const emailBtn = page.locator('#contact a[href^="mailto:"]');
        await expect(emailBtn).toBeVisible();
        const href = await emailBtn.getAttribute('href');
        expect(href).toBe('mailto:emmanuel.genesteix@agilevizion.com');
    });

    test('la section CTA a un fond contrasté (background non blanc)', async ({ page }) => {
        const bg = await page.evaluate(() => {
            const section = document.getElementById('contact');
            if (!section) return null;
            return window.getComputedStyle(section).backgroundColor;
        });
        // Ne doit pas être blanc (#ffffff = rgb(255, 255, 255))
        expect(bg).not.toBe('rgb(255, 255, 255)');
        expect(bg).not.toBe('rgba(0, 0, 0, 0)');
        expect(bg).not.toBe('transparent');
    });
});

// ====================================================================
// CA2 — Comportement du bouton Calendly
// ====================================================================
test.describe('Bouton Calendly — comportement popup', () => {

    test('openCalendly() est définie sur window', async ({ page }) => {
        await page.goto('/');
        const isDefined = await page.evaluate(() => typeof window.openCalendly === 'function');
        expect(isDefined).toBe(true);
    });

    test('si Calendly CDN chargé → initPopupWidget est appelé', async ({ page }) => {
        await page.goto('/');
        // Injecter un mock Calendly pour intercepter l'appel
        await page.evaluate(() => {
            window.__calendlyCalled = false;
            window.Calendly = {
                initPopupWidget: function(opts) {
                    window.__calendlyCalled = true;
                    window.__calendlyOpts = opts;
                }
            };
        });
        // Scroller et cliquer sur le bouton Calendly
        await page.locator('#contact').scrollIntoViewIfNeeded();
        await page.locator('#contact button[onclick="openCalendly()"]').click();

        const called = await page.evaluate(() => window.__calendlyCalled);
        expect(called).toBe(true);

        const opts = await page.evaluate(() => window.__calendlyOpts);
        expect(opts.url).toContain('calendly.com');
    });

    test('si Calendly CDN absent → window.open est appelé avec l\'URL Calendly', async ({ page }) => {
        await page.goto('/');
        // Supprimer Calendly pour simuler l'absence du CDN
        await page.evaluate(() => {
            window.__windowOpenCalled = false;
            window.__windowOpenUrl = null;
            const origOpen = window.open;
            window.open = function(url, ...args) {
                window.__windowOpenCalled = true;
                window.__windowOpenUrl = url;
                // Ne pas vraiment ouvrir une fenêtre
            };
            delete window.Calendly;
        });

        await page.locator('#contact').scrollIntoViewIfNeeded();
        await page.locator('#contact button[onclick="openCalendly()"]').click();

        const called = await page.evaluate(() => window.__windowOpenCalled);
        expect(called).toBe(true);

        const url = await page.evaluate(() => window.__windowOpenUrl);
        expect(url).toContain('calendly.com');
    });
});

// ====================================================================
// CA3 — Bouton email : mailto
// ====================================================================
test.describe('Bouton email — mailto', () => {

    test('index.html : bouton email a le bon href mailto', async ({ page }) => {
        await page.goto('/');
        await page.locator('#contact').scrollIntoViewIfNeeded();
        const emailBtn = page.locator('#contact a[href="mailto:emmanuel.genesteix@agilevizion.com"]');
        await expect(emailBtn).toBeVisible();
        const href = await emailBtn.getAttribute('href');
        expect(href).toBe('mailto:emmanuel.genesteix@agilevizion.com');
    });

    test('cyber.html : bouton email mailto correct', async ({ page }) => {
        await page.goto('/cyber.html');
        await page.locator('.section-cta').scrollIntoViewIfNeeded();
        const emailBtn = page.locator('.section-cta a[href="mailto:emmanuel.genesteix@agilevizion.com"]');
        await expect(emailBtn).toBeVisible();
    });

    test('ia.html : bouton email mailto correct', async ({ page }) => {
        await page.goto('/ia.html');
        await page.locator('.section-cta').scrollIntoViewIfNeeded();
        const emailBtn = page.locator('.section-cta a[href="mailto:emmanuel.genesteix@agilevizion.com"]');
        await expect(emailBtn).toBeVisible();
    });
});

// ====================================================================
// CA4 — Footer index.html : contenu complet
// ====================================================================
test.describe('Footer index.html — contenu', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.locator('footer').scrollIntoViewIfNeeded();
    });

    test('footer est visible', async ({ page }) => {
        await expect(page.locator('footer.footer')).toBeVisible();
    });

    test('email affiché dans le footer', async ({ page }) => {
        const emailLink = page.locator('footer .footer-contact a[href="mailto:emmanuel.genesteix@agilevizion.com"]');
        await expect(emailLink).toBeVisible();
        const text = await emailLink.textContent();
        expect(text.trim().length).toBeGreaterThan(0);
    });

    test('téléphone affiché dans le footer', async ({ page }) => {
        const telLink = page.locator('footer a[href="tel:+352661780807"]');
        await expect(telLink).toBeVisible();
        const text = await telLink.textContent();
        expect(text).toContain('+352');
    });

    test('localisation Luxembourg visible dans le footer', async ({ page }) => {
        const brand = page.locator('footer .footer-brand');
        await expect(brand).toBeVisible();
        const text = await brand.textContent();
        expect(text).toContain('Luxembourg');
    });

    test('lien LinkedIn visible dans le footer', async ({ page }) => {
        const li = page.locator('footer a[href*="linkedin.com/in/emmanuelgenesteix"]');
        await expect(li).toBeVisible();
        const text = await li.textContent();
        expect(text.toLowerCase()).toContain('linkedin');
    });

    test('copyright présent dans le footer', async ({ page }) => {
        const bottom = page.locator('footer .footer-bottom');
        await expect(bottom).toBeVisible();
        const text = await bottom.textContent();
        expect(text).toContain('AgileVizion');
    });

    test('lien "Mentions légales" présent et fonctionnel', async ({ page }) => {
        const legal = page.locator('footer .footer-legal-link');
        await expect(legal).toBeVisible();
        const href = await legal.getAttribute('href');
        expect(href).toBe('#legal');
    });

    test('section mentions légales #legal présente dans le DOM', async ({ page }) => {
        await expect(page.locator('#legal')).toBeAttached();
    });

    test('mentions légales contient l\'immatriculation', async ({ page }) => {
        const text = await page.locator('#legal').textContent();
        expect(text).toContain('A46385');
    });
});

// ====================================================================
// CA5 — Footer identique sur les 3 pages
// ====================================================================
test.describe('Footer identique sur les 3 pages', () => {

    async function getFooterHTML(page, url) {
        await page.goto(url);
        return await page.evaluate(() => {
            const footer = document.querySelector('footer.footer');
            return footer ? footer.innerHTML.replace(/\s+/g, ' ').trim() : '';
        });
    }

    test('footer index.html et cyber.html sont identiques', async ({ page }) => {
        const f1 = await getFooterHTML(page, '/');
        const f2 = await getFooterHTML(page, '/cyber.html');
        expect(f1).toBe(f2);
    });

    test('footer index.html et ia.html sont identiques', async ({ page }) => {
        const f1 = await getFooterHTML(page, '/');
        const f3 = await getFooterHTML(page, '/ia.html');
        expect(f1).toBe(f3);
    });

    test('footer cyber.html contient l\'email', async ({ page }) => {
        await page.goto('/cyber.html');
        await page.locator('footer').scrollIntoViewIfNeeded();
        const email = page.locator('footer .footer-contact a[href="mailto:emmanuel.genesteix@agilevizion.com"]');
        await expect(email).toBeVisible();
    });

    test('footer ia.html contient le téléphone', async ({ page }) => {
        await page.goto('/ia.html');
        await page.locator('footer').scrollIntoViewIfNeeded();
        const tel = page.locator('footer a[href="tel:+352661780807"]');
        await expect(tel).toBeVisible();
    });

    test('footer cyber.html contient les mentions légales', async ({ page }) => {
        await page.goto('/cyber.html');
        const legal = page.locator('footer .footer-legal-link');
        await expect(legal).toBeAttached();
    });

    test('footer ia.html contient les mentions légales', async ({ page }) => {
        await page.goto('/ia.html');
        const legal = page.locator('footer .footer-legal-link');
        await expect(legal).toBeAttached();
    });
});

// ====================================================================
// CA6 — Responsive mobile : boutons CTA en pleine largeur (≤480px)
// ====================================================================
test.describe('CTA mobile — boutons pleine largeur (≤480px)', () => {

    // Viewport 375px (iPhone) — la règle CSS s'active à 480px
    test.use({ viewport: { width: 375, height: 812 } });

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.locator('#contact').scrollIntoViewIfNeeded();
    });

    test('hero-cta est en flex-direction: column sur mobile 375px', async ({ page }) => {
        const flexDir = await page.evaluate(() => {
            const cta = document.querySelector('#contact .hero-cta');
            return cta ? window.getComputedStyle(cta).flexDirection : null;
        });
        expect(flexDir).toBe('column');
    });

    test('bouton Calendly est en pleine largeur (width proche de 100%)', async ({ page }) => {
        const btnWidth = await page.evaluate(() => {
            const btn = document.querySelector('#contact .hero-cta button');
            const parent = document.querySelector('#contact .hero-cta');
            if (!btn || !parent) return null;
            return {
                btn: btn.getBoundingClientRect().width,
                parent: parent.getBoundingClientRect().width
            };
        });
        expect(btnWidth).not.toBeNull();
        // Sur mobile ≤480px, width: 100% avec max-width: 320px
        // Le bouton doit avoir une largeur significative (au moins 80% du parent ou ≥ 280px)
        expect(btnWidth.btn).toBeGreaterThanOrEqual(280);
    });

    test('bouton email est en pleine largeur sur mobile', async ({ page }) => {
        const emailWidth = await page.evaluate(() => {
            const btn = document.querySelector('#contact .hero-cta a[href^="mailto:"]');
            if (!btn) return null;
            return btn.getBoundingClientRect().width;
        });
        expect(emailWidth).not.toBeNull();
        expect(emailWidth).toBeGreaterThanOrEqual(280);
    });

    test('les 2 boutons sont empilés verticalement (pas côte à côte)', async ({ page }) => {
        const positions = await page.evaluate(() => {
            const btns = document.querySelectorAll('#contact .hero-cta button, #contact .hero-cta a');
            if (btns.length < 2) return null;
            return {
                btn1: btns[0].getBoundingClientRect(),
                btn2: btns[1].getBoundingClientRect()
            };
        });
        expect(positions).not.toBeNull();
        // Empilés = btn2 est en dessous de btn1
        expect(positions.btn2.top).toBeGreaterThan(positions.btn1.top);
    });
});

// ====================================================================
// CA7 — CTA sur cyber.html et ia.html : présence des 2 boutons
// ====================================================================
test.describe('CTA cyber.html — boutons présents', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/cyber.html');
        await page.locator('.section-cta').scrollIntoViewIfNeeded();
    });

    test('section section-cta existe sur cyber.html', async ({ page }) => {
        await expect(page.locator('.section-cta')).toBeAttached();
    });

    test('bouton Calendly visible sur cyber.html', async ({ page }) => {
        const btn = page.locator('.section-cta button[onclick="openCalendly()"]');
        await expect(btn).toBeVisible();
    });

    test('bouton email visible sur cyber.html', async ({ page }) => {
        const emailBtn = page.locator('.section-cta a[href^="mailto:"]');
        await expect(emailBtn).toBeVisible();
        const href = await emailBtn.getAttribute('href');
        expect(href).toBe('mailto:emmanuel.genesteix@agilevizion.com');
    });
});

test.describe('CTA ia.html — boutons présents', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/ia.html');
        await page.locator('.section-cta').scrollIntoViewIfNeeded();
    });

    test('section section-cta existe sur ia.html', async ({ page }) => {
        await expect(page.locator('.section-cta')).toBeAttached();
    });

    test('bouton Calendly visible sur ia.html', async ({ page }) => {
        const btn = page.locator('.section-cta button[onclick="openCalendly()"]');
        await expect(btn).toBeVisible();
    });

    test('bouton email visible sur ia.html', async ({ page }) => {
        const emailBtn = page.locator('.section-cta a[href^="mailto:"]');
        await expect(emailBtn).toBeVisible();
        const href = await emailBtn.getAttribute('href');
        expect(href).toBe('mailto:emmanuel.genesteix@agilevizion.com');
    });
});

// ====================================================================
// CA8 — Accessibilité des boutons CTA
// ====================================================================
test.describe('Accessibilité CTA', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.locator('#contact').scrollIntoViewIfNeeded();
    });

    test('le titre h2 CTA a un data-i18n (localisable)', async ({ page }) => {
        const attr = await page.locator('#contact .section-title').getAttribute('data-i18n');
        expect(attr).toBe('landing.cta_title');
    });

    test('les boutons CTA ont la classe animate-in', async ({ page }) => {
        await expect(page.locator('#contact .hero-cta')).toHaveClass(/animate-in/);
    });

    test('aucun script injecté dans la section CTA', async ({ page }) => {
        const scripts = await page.evaluate(() =>
            document.querySelectorAll('#contact script').length
        );
        expect(scripts).toBe(0);
    });
});
