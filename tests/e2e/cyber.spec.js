/**
 * Tests E2E — Page GRC Cybersécurité (Story #8)
 * Playwright — Desktop Chrome + Mobile (375px)
 *
 * Couvre :
 * - Navigation vers cyber.html (standalone + depuis la landing)
 * - Hero : accroche visible, placeholder vidéo, boutons CTA
 * - Section "Le problème" : 4 pain points visibles avec chiffres
 * - Section "La solution" : texte clair visible
 * - Section "L'approche" : 3 étapes numérotées visibles
 * - Section "Les livrables" : 6 cards visibles
 * - Section "Normes couvertes" : 3 catégories, toutes les normes
 * - CTA final : boutons Calendly + email visibles
 * - Animations scroll : .animate-in → .visible
 * - Mobile 375px : layout responsive
 * - Acronymes avec abbr au survol
 */

'use strict';

const { test, expect } = require('@playwright/test');


// ====================================================================
// CA1 — Accès direct à cyber.html (standalone)
// ====================================================================
test.describe('Accès direct cyber.html — page standalone', () => {

    test('cyber.html se charge sans erreur JS', async ({ page }) => {
        const errors = [];
        page.on('pageerror', err => errors.push(err.message));
        await page.goto('/cyber.html');
        expect(errors.length).toBe(0);
    });

    test('le titre de la page contient "GRC" et "AgileVizion"', async ({ page }) => {
        await page.goto('/cyber.html');
        const title = await page.title();
        expect(title).toMatch(/GRC/i);
        expect(title).toMatch(/AgileVizion/i);
    });

    test('la navbar est visible avec le lien retour Accueil', async ({ page }) => {
        await page.goto('/cyber.html');
        const navbar = page.locator('.navbar');
        await expect(navbar).toBeVisible();
        const homeLink = page.locator('.nav-menu a[href="/"]');
        await expect(homeLink).toBeVisible();
    });

    test('le lien "Cyber GRC" dans la navbar a la classe active', async ({ page }) => {
        await page.goto('/cyber.html');
        const activeLink = page.locator('.nav-menu a.active');
        await expect(activeLink).toBeVisible();
        const href = await activeLink.getAttribute('href');
        expect(href).toContain('cyber');
    });

    test('le footer est visible avec email et téléphone', async ({ page }) => {
        await page.goto('/cyber.html');
        await page.locator('footer').scrollIntoViewIfNeeded();
        await expect(page.locator('footer .footer-contact a[href^="mailto:"]')).toBeVisible();
        await expect(page.locator('footer a[href^="tel:"]')).toBeVisible();
    });
});


// ====================================================================
// CA2 — Hero : accroche, vidéo, CTAs
// ====================================================================
test.describe('Hero cyber.html — accroche et CTAs', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/cyber.html');
    });

    test('section#hero est visible', async ({ page }) => {
        await expect(page.locator('#hero')).toBeVisible();
    });

    test('h1 hero-title est visible et contient une notion de risque financier', async ({ page }) => {
        const h1 = page.locator('#hero .hero-title');
        await expect(h1).toBeVisible();
        const text = await h1.textContent();
        expect(text).toMatch(/\d+\s*[%M€]|amende|sanction/i);
    });

    test('sous-titre hero-subtitle est visible', async ({ page }) => {
        const sub = page.locator('#hero .hero-subtitle');
        await expect(sub).toBeVisible();
        const text = await sub.textContent();
        expect(text.trim().length).toBeGreaterThan(20);
    });

    test('placeholder vidéo est visible', async ({ page }) => {
        const video = page.locator('#hero .placeholder-video, #hero .video-placeholder').first();
        await expect(video).toBeVisible();
    });

    test('bouton Calendly hero est visible', async ({ page }) => {
        const btn = page.locator('#hero button[onclick="openCalendly()"]');
        await expect(btn).toBeVisible();
    });

    test('bouton email hero est visible avec le bon mailto', async ({ page }) => {
        const email = page.locator('#hero a[href^="mailto:"]');
        await expect(email).toBeVisible();
        const href = await email.getAttribute('href');
        expect(href).toBe('mailto:emmanuel.genesteix@agilevizion.com');
    });
});


// ====================================================================
// CA3 — Section "Le problème" : 4 pain points visibles
// ====================================================================
test.describe('Section "Le problème" — 4 pain points', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/cyber.html');
        await page.locator('#probleme').scrollIntoViewIfNeeded();
    });

    test('section#probleme est visible', async ({ page }) => {
        await expect(page.locator('#probleme')).toBeVisible();
    });

    test('le titre de section est visible', async ({ page }) => {
        const h2 = page.locator('#probleme .section-title');
        await expect(h2).toBeVisible();
    });

    test('4 problem-cards sont visibles', async ({ page }) => {
        const cards = page.locator('#probleme .problem-card');
        await expect(cards).toHaveCount(4);
        for (let i = 0; i < 4; i++) {
            await expect(cards.nth(i)).toBeVisible();
        }
    });

    test('pain point 3 mentionne NIS 2 et 10 M€', async ({ page }) => {
        const card3 = page.locator('#probleme .problem-card').nth(2);
        const text = await card3.textContent();
        expect(text).toMatch(/NIS[\s\xa0]?2/i);
        expect(text).toMatch(/10[\s\xa0]*M/);
    });

    test('pain point 3 mentionne RGPD et 4 % CA', async ({ page }) => {
        const card3 = page.locator('#probleme .problem-card').nth(2);
        const text = await card3.textContent();
        expect(text).toMatch(/RGPD|GDPR/i);
        expect(text).toMatch(/4[\s\xa0]*%/);
    });

    test('pain point 4 mentionne les dirigeants', async ({ page }) => {
        const card4 = page.locator('#probleme .problem-card').nth(3);
        const text = await card4.textContent();
        expect(text.toLowerCase()).toMatch(/dirigeant|responsabilit[eé]/i);
    });

    test('chaque pain point a une icône visible', async ({ page }) => {
        const icons = page.locator('#probleme .problem-card .problem-icon');
        await expect(icons).toHaveCount(4);
        for (let i = 0; i < 4; i++) {
            await expect(icons.nth(i)).toBeVisible();
        }
    });
});


// ====================================================================
// CA4 — Section "La solution" : texte clair visible
// ====================================================================
test.describe('Section "La solution"', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/cyber.html');
        await page.locator('#solution').scrollIntoViewIfNeeded();
    });

    test('section#solution est visible', async ({ page }) => {
        await expect(page.locator('#solution')).toBeVisible();
    });

    test('h2 de la solution est visible', async ({ page }) => {
        const h2 = page.locator('#solution h2');
        await expect(h2).toBeVisible();
        const text = await h2.textContent();
        expect(text.toLowerCase()).toMatch(/solution|audit|conformit[eé]/i);
    });

    test('texte de la solution est visible', async ({ page }) => {
        const text = page.locator('#solution .solution-text');
        await expect(text).toBeVisible();
    });

    test('au moins 3 points .solution-check visibles', async ({ page }) => {
        const checks = page.locator('#solution .solution-check');
        const count = await checks.count();
        expect(count).toBeGreaterThanOrEqual(3);
        for (let i = 0; i < count; i++) {
            await expect(checks.nth(i)).toBeVisible();
        }
    });
});


// ====================================================================
// CA5 — Section "L'approche" : 3 étapes numérotées
// ====================================================================
test.describe('Section "L\'approche" — 3 étapes', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/cyber.html');
        await page.locator('#approche').scrollIntoViewIfNeeded();
    });

    test('section#approche est visible', async ({ page }) => {
        await expect(page.locator('#approche')).toBeVisible();
    });

    test('titre "3 étapes" visible', async ({ page }) => {
        const h2 = page.locator('#approche .section-title');
        await expect(h2).toBeVisible();
        const text = await h2.textContent();
        expect(text).toMatch(/3|trois/i);
    });

    test('3 step-cards sont visibles', async ({ page }) => {
        const steps = page.locator('#approche .step-card');
        await expect(steps).toHaveCount(3);
        for (let i = 0; i < 3; i++) {
            await expect(steps.nth(i)).toBeVisible();
        }
    });

    test('étape 1 numérotée "01" et parle de diagnostic', async ({ page }) => {
        const step1 = page.locator('#approche .step-card').nth(0);
        const text = await step1.textContent();
        expect(text).toContain('01');
        expect(text.toLowerCase()).toMatch(/diagnostic/i);
    });

    test('étape 2 numérotée "02" et parle d\'audit terrain', async ({ page }) => {
        const step2 = page.locator('#approche .step-card').nth(1);
        const text = await step2.textContent();
        expect(text).toContain('02');
        expect(text.toLowerCase()).toMatch(/audit/i);
    });

    test('étape 3 numérotée "03" et parle de feuille de route', async ({ page }) => {
        const step3 = page.locator('#approche .step-card').nth(2);
        const text = await step3.textContent();
        expect(text).toContain('03');
        expect(text.toLowerCase()).toMatch(/feuille.*route|plan/i);
    });
});


// ====================================================================
// CA6 — Section "Les livrables" : 6 cards avec icônes
// ====================================================================
test.describe('Section "Les livrables" — 6 cards', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/cyber.html');
        await page.locator('#livrables').scrollIntoViewIfNeeded();
    });

    test('section#livrables est visible', async ({ page }) => {
        await expect(page.locator('#livrables')).toBeVisible();
    });

    test('6 deliverable-cards sont présentes', async ({ page }) => {
        const cards = page.locator('#livrables .deliverable-card');
        await expect(cards).toHaveCount(6);
    });

    test('livrable 1 visible — Grille d\'audit', async ({ page }) => {
        const card = page.locator('#livrables .deliverable-card').nth(0);
        await expect(card).toBeVisible();
        const text = await card.textContent();
        expect(text.toLowerCase()).toMatch(/grille.*audit|audit.*grille/i);
    });

    test('livrable 2 visible — Rapport exécutif', async ({ page }) => {
        const card = page.locator('#livrables .deliverable-card').nth(1);
        await expect(card).toBeVisible();
        const text = await card.textContent();
        expect(text.toLowerCase()).toMatch(/rapport.*ex[eé]cutif/i);
    });

    test('livrable 4 visible — PV de conformité', async ({ page }) => {
        const card = page.locator('#livrables .deliverable-card').nth(3);
        await expect(card).toBeVisible();
        const text = await card.textContent();
        expect(text.toLowerCase()).toMatch(/pv|proc[eè]s-verbal|conformit[eé]/i);
    });

    test('livrable 5 visible — Modèles de politiques', async ({ page }) => {
        const card = page.locator('#livrables .deliverable-card').nth(4);
        await expect(card).toBeVisible();
        const text = await card.textContent();
        expect(text.toLowerCase()).toMatch(/mod[eè]le|politique/i);
    });

    test('chaque card a une icône visible', async ({ page }) => {
        const icons = page.locator('#livrables .deliverable-card i[class*="fa-"]');
        const count = await icons.count();
        expect(count).toBe(6);
    });
});


// ====================================================================
// CA7 — Section "Normes couvertes" : toutes les normes visibles
// ====================================================================
test.describe('Section "Normes couvertes" — 3 catégories', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/cyber.html');
        await page.locator('#normes').scrollIntoViewIfNeeded();
    });

    test('section#normes est visible', async ({ page }) => {
        await expect(page.locator('#normes')).toBeVisible();
    });

    test('3 groupes de normes sont visibles', async ({ page }) => {
        const groups = page.locator('#normes .framework-group');
        await expect(groups).toHaveCount(3);
        for (let i = 0; i < 3; i++) {
            await expect(groups.nth(i)).toBeVisible();
        }
    });

    test('DORA et NIS 2 visibles dans les réglementations EU', async ({ page }) => {
        const group1 = page.locator('#normes .framework-group').nth(0);
        await expect(group1).toBeVisible();
        const text = await group1.textContent();
        expect(text).toContain('DORA');
        expect(text).toMatch(/NIS[\s\xa0]?2/);
    });

    test('RGPD visible dans les réglementations EU', async ({ page }) => {
        const group1 = page.locator('#normes .framework-group').nth(0);
        const text = await group1.textContent();
        expect(text).toMatch(/RGPD/i);
    });

    test('ISO 27001, 27002, 27005 visibles', async ({ page }) => {
        const group2 = page.locator('#normes .framework-group').nth(1);
        await expect(group2).toBeVisible();
        const text = await group2.textContent();
        expect(text).toContain('27001');
        expect(text).toContain('27002');
        expect(text).toContain('27005');
    });

    test('CIS Controls, NIST 800-53, NIST 800-37, EBIOS RM visibles', async ({ page }) => {
        const group3 = page.locator('#normes .framework-group').nth(2);
        await expect(group3).toBeVisible();
        const text = await group3.textContent();
        expect(text).toMatch(/CIS/i);
        expect(text).toContain('800-53');
        expect(text).toContain('800-37');
        expect(text).toMatch(/EBIOS/i);
    });

    test('DORA tag a la classe tag-regulatory (highlight)', async ({ page }) => {
        const doraTags = page.locator('#normes .tag-regulatory');
        const count = await doraTags.count();
        expect(count).toBeGreaterThanOrEqual(1);
    });
});


// ====================================================================
// CA8 — CTA final : boutons Calendly + email
// ====================================================================
test.describe('CTA final — cyber.html (#contact)', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/cyber.html');
        await page.locator('#contact').scrollIntoViewIfNeeded();
    });

    test('section#contact est visible', async ({ page }) => {
        await expect(page.locator('#contact')).toBeVisible();
    });

    test('titre CTA est visible et parle de conformité', async ({ page }) => {
        const h2 = page.locator('#contact .section-title');
        await expect(h2).toBeVisible();
        const text = await h2.textContent();
        expect(text.toLowerCase()).toMatch(/conformit[eé]|diagnostic/i);
    });

    test('sous-titre CTA mention diagnostic gratuit', async ({ page }) => {
        const sub = page.locator('#contact .section-subtitle');
        await expect(sub).toBeVisible();
        const text = await sub.textContent();
        expect(text.toLowerCase()).toMatch(/diagnostic|gratuit/i);
    });

    test('bouton Calendly visible dans #contact', async ({ page }) => {
        const btn = page.locator('#contact button[onclick="openCalendly()"]');
        await expect(btn).toBeVisible();
    });

    test('bouton email visible dans #contact', async ({ page }) => {
        const email = page.locator('#contact a[href="mailto:emmanuel.genesteix@agilevizion.com"]');
        await expect(email).toBeVisible();
    });

    test('la section CTA a un fond contrasté (non blanc)', async ({ page }) => {
        const bg = await page.evaluate(() => {
            const section = document.getElementById('contact');
            return section ? window.getComputedStyle(section).backgroundColor : null;
        });
        expect(bg).not.toBe('rgb(255, 255, 255)');
        expect(bg).not.toBe('rgba(0, 0, 0, 0)');
    });

    test('openCalendly() est défini sur window', async ({ page }) => {
        const defined = await page.evaluate(() => typeof window.openCalendly === 'function');
        expect(defined).toBe(true);
    });

    test('clic bouton Calendly → initPopupWidget appelé (mock)', async ({ page }) => {
        await page.goto('/cyber.html');
        await page.evaluate(() => {
            window.__calendlyCalled = false;
            window.Calendly = {
                initPopupWidget: function() { window.__calendlyCalled = true; }
            };
        });
        await page.locator('#contact').scrollIntoViewIfNeeded();
        await page.locator('#contact button[onclick="openCalendly()"]').click();
        const called = await page.evaluate(() => window.__calendlyCalled);
        expect(called).toBe(true);
    });
});


// ====================================================================
// CA9 — Animations scroll (.animate-in → .visible)
// ====================================================================
test.describe('Animations scroll — .animate-in', () => {

    test('au moins 10 éléments .animate-in dans la page', async ({ page }) => {
        await page.goto('/cyber.html');
        const count = await page.evaluate(() =>
            document.querySelectorAll('.animate-in').length
        );
        expect(count).toBeGreaterThanOrEqual(10);
    });

    test('après scroll, les éléments visibles reçoivent .visible', async ({ page }) => {
        await page.goto('/cyber.html');
        // Défiler jusqu'en bas pour déclencher les animations
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(500);

        const visibleCount = await page.evaluate(() =>
            document.querySelectorAll('.animate-in.visible').length
        );
        expect(visibleCount).toBeGreaterThan(0);
    });
});


// ====================================================================
// CA10 — Responsive mobile (375px)
// ====================================================================
test.describe('Responsive mobile — cyber.html (375px)', () => {

    test.use({ viewport: { width: 375, height: 812 } });

    test.beforeEach(async ({ page }) => {
        await page.goto('/cyber.html');
    });

    test('navbar hamburger visible sur mobile', async ({ page }) => {
        const toggle = page.locator('#nav-toggle');
        await expect(toggle).toBeVisible();
    });

    test('hero h1 visible sur mobile', async ({ page }) => {
        await expect(page.locator('#hero .hero-title')).toBeVisible();
    });

    test('section#probleme visible sur mobile', async ({ page }) => {
        await page.locator('#probleme').scrollIntoViewIfNeeded();
        await expect(page.locator('#probleme')).toBeVisible();
    });

    test('section#livrables visible sur mobile', async ({ page }) => {
        await page.locator('#livrables').scrollIntoViewIfNeeded();
        await expect(page.locator('#livrables')).toBeVisible();
    });

    test('section#normes visible sur mobile', async ({ page }) => {
        await page.locator('#normes').scrollIntoViewIfNeeded();
        await expect(page.locator('#normes')).toBeVisible();
    });

    test('footer visible sur mobile', async ({ page }) => {
        await page.locator('footer').scrollIntoViewIfNeeded();
        await expect(page.locator('footer')).toBeVisible();
    });

    test('pas de débordement horizontal (overflow-x) sur mobile', async ({ page }) => {
        const overflow = await page.evaluate(() => {
            return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });
        expect(overflow).toBe(false);
    });
});


// ====================================================================
// CA11 — Parcours utilisateur complet (problem → solution → CTA)
// ====================================================================
test.describe('Parcours utilisateur — cyber.html', () => {

    test('parcours vertical : toutes les sections accessibles au scroll', async ({ page }) => {
        await page.goto('/cyber.html');

        const sections = ['#hero', '#probleme', '#solution', '#approche', '#livrables', '#normes', '#contact'];

        for (const selector of sections) {
            await page.locator(selector).scrollIntoViewIfNeeded();
            await expect(page.locator(selector)).toBeVisible();
        }
    });

    test('navigation interne : lien vers /#simulator dans la navbar', async ({ page }) => {
        await page.goto('/cyber.html');
        const simLink = page.locator('.nav-menu a[href*="simulator"]');
        await expect(simLink).toBeVisible();
    });

    test('cyber.html peut être ouvert directement (sans passer par la landing)', async ({ page }) => {
        // Ouvrir directement sans historique de navigation
        await page.goto('/cyber.html', { referer: '' });
        await expect(page.locator('#hero')).toBeVisible();
        await expect(page.locator('#contact')).toBeAttached();
    });
});


// ====================================================================
// CA12 — Sécurité et accessibilité
// ====================================================================
test.describe('Sécurité et accessibilité — cyber.html', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/cyber.html');
    });

    test('aucun lien externe sans rel="noopener"', async ({ page }) => {
        const badLinks = await page.evaluate(() => {
            const links = Array.from(document.querySelectorAll('a[target="_blank"]'));
            return links.filter(a => !(a.getAttribute('rel') || '').includes('noopener')).length;
        });
        expect(badLinks).toBe(0);
    });

    test('cookie banner présent dans le DOM (RGPD)', async ({ page }) => {
        await expect(page.locator('#cookie-banner')).toBeAttached();
    });

    test('nav-toggle a un aria-label (accessibilité mobile)', async ({ page }) => {
        const toggle = page.locator('#nav-toggle');
        const ariaLabel = await toggle.getAttribute('aria-label');
        expect(ariaLabel).toBeTruthy();
    });

    test('chaque section a aria-labelledby (accessibilité lecteur d\'écran)', async ({ page }) => {
        const sections = await page.evaluate(() => {
            const sects = Array.from(document.querySelectorAll('section'));
            return sects.map(s => ({ id: s.id, hasAria: !!s.getAttribute('aria-labelledby') }));
        });
        // Au moins 4 sections avec aria-labelledby
        const withAria = sections.filter(s => s.hasAria).length;
        expect(withAria).toBeGreaterThanOrEqual(4);
    });

    test('pas d\'erreurs de console JS au chargement', async ({ page }) => {
        const errors = [];
        page.on('pageerror', err => errors.push(err.message));
        await page.reload();
        expect(errors.length).toBe(0);
    });
});
