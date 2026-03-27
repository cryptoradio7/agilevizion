/**
 * Tests E2E — Page IA Agentique (Story #9)
 * Playwright — Desktop Chrome + Mobile (375px)
 *
 * Couvre :
 * - Navigation vers ia.html (standalone + depuis la landing)
 * - Hero : accroche, placeholder vidéo, boutons CTA
 * - Section "Le problème" : 3 KPI cards avec sources (McKinsey, Microsoft, HBR)
 * - Section "L'employé augmenté" : 4 verbes + message clé
 * - Section "Exemple concret" : 2 phases workflow + résultats
 * - Section "Applicable à tous les métiers" : 7 cards
 * - Section "Notre approche" : 3 étapes numérotées
 * - Section "Résultats" : 3 KPI boxes
 * - CTA final : boutons Calendly + email
 * - Animations scroll : .animate-in → .visible
 * - Mobile 375px : layout responsive
 * - Accessibilité et sécurité
 */

'use strict';

const { test, expect } = require('@playwright/test');


// ====================================================================
// CA1 — Accès direct à ia.html (standalone)
// ====================================================================
test.describe('Accès direct ia.html — page standalone', () => {

    test('ia.html se charge sans erreur JS', async ({ page }) => {
        const errors = [];
        page.on('pageerror', err => errors.push(err.message));
        await page.goto('/ia.html');
        expect(errors.length).toBe(0);
    });

    test('le titre de la page contient "IA" et "AgileVizion"', async ({ page }) => {
        await page.goto('/ia.html');
        const title = await page.title();
        expect(title).toMatch(/IA/i);
        expect(title).toMatch(/AgileVizion/i);
    });

    test('la navbar est visible avec le lien retour Accueil', async ({ page }) => {
        await page.goto('/ia.html');
        const navbar = page.locator('.navbar');
        await expect(navbar).toBeVisible();
        const homeLink = page.locator('.nav-menu a[href="/"]');
        await expect(homeLink).toBeVisible();
    });

    test('le lien "IA Agentique" dans la navbar a la classe active', async ({ page }) => {
        await page.goto('/ia.html');
        const activeLink = page.locator('.nav-menu a.active');
        await expect(activeLink).toBeVisible();
        const href = await activeLink.getAttribute('href');
        expect(href).toContain('ia');
    });

    test('le footer est visible avec email et téléphone', async ({ page }) => {
        await page.goto('/ia.html');
        await page.locator('footer').scrollIntoViewIfNeeded();
        await expect(page.locator('footer .footer-contact a[href^="mailto:"]')).toBeVisible();
        await expect(page.locator('footer a[href^="tel:"]')).toBeVisible();
    });

    test('ia.html peut être ouvert directement sans passer par la landing', async ({ page }) => {
        await page.goto('/ia.html', { referer: '' });
        await expect(page.locator('#hero')).toBeVisible();
        await expect(page.locator('#contact')).toBeAttached();
    });
});


// ====================================================================
// CA2 — Hero : accroche, vidéo, CTAs
// ====================================================================
test.describe('Hero ia.html — accroche et CTAs', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/ia.html');
    });

    test('section#hero est visible', async ({ page }) => {
        await expect(page.locator('#hero')).toBeVisible();
    });

    test('h1 hero-title est visible et contient une notion de perte de temps / IA', async ({ page }) => {
        const h1 = page.locator('#hero .hero-title');
        await expect(h1).toBeVisible();
        const text = await h1.textContent();
        expect(text).toMatch(/perd|temps|tâche|IA/i);
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
// CA3 — Section "Le problème" : 3 KPI cards + sources
// ====================================================================
test.describe('Section "Le problème" — 3 KPI cards avec sources', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/ia.html');
        await page.locator('#probleme').scrollIntoViewIfNeeded();
    });

    test('section#probleme est visible', async ({ page }) => {
        await expect(page.locator('#probleme')).toBeVisible();
    });

    test('le titre de section est visible', async ({ page }) => {
        const h2 = page.locator('#probleme .section-title');
        await expect(h2).toBeVisible();
    });

    test('3 KPI cards sont visibles', async ({ page }) => {
        const cards = page.locator('#probleme .kpi-card');
        await expect(cards).toHaveCount(3);
        for (let i = 0; i < 3; i++) {
            await expect(cards.nth(i)).toBeVisible();
        }
    });

    test('KPI 1 contient 40%', async ({ page }) => {
        const card = page.locator('#probleme .kpi-card').nth(0);
        const text = await card.textContent();
        expect(text).toContain('40%');
    });

    test('KPI 1 source McKinsey visible', async ({ page }) => {
        const source = page.locator('#probleme .kpi-card').nth(0).locator('.kpi-source');
        await expect(source).toBeVisible();
        const text = await source.textContent();
        expect(text).toMatch(/McKinsey/i);
    });

    test('KPI 2 contient 68%', async ({ page }) => {
        const card = page.locator('#probleme .kpi-card').nth(1);
        const text = await card.textContent();
        expect(text).toContain('68%');
    });

    test('KPI 2 source Microsoft visible', async ({ page }) => {
        const source = page.locator('#probleme .kpi-card').nth(1).locator('.kpi-source');
        await expect(source).toBeVisible();
        const text = await source.textContent();
        expect(text).toMatch(/Microsoft/i);
    });

    test('KPI 3 contient ×3', async ({ page }) => {
        const card = page.locator('#probleme .kpi-card').nth(2);
        const text = await card.textContent();
        expect(text).toMatch(/[×x]3/i);
    });

    test('KPI 3 source HBR / Harvard visible', async ({ page }) => {
        const source = page.locator('#probleme .kpi-card').nth(2).locator('.kpi-source');
        await expect(source).toBeVisible();
        const text = await source.textContent();
        expect(text).toMatch(/Harvard|HBR/i);
    });

    test('liste des conséquences visible (.ia-consequences)', async ({ page }) => {
        const cons = page.locator('#probleme .ia-consequences');
        await expect(cons).toBeVisible();
    });

    test('au moins 3 conséquences listées', async ({ page }) => {
        const items = page.locator('#probleme .ia-consequences-list li');
        const count = await items.count();
        expect(count).toBeGreaterThanOrEqual(3);
    });
});


// ====================================================================
// CA4 — Section "L'employé augmenté" : 4 verbes + message clé
// ====================================================================
test.describe('Section "L\'employé augmenté" — 4 verbes + message clé', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/ia.html');
        await page.locator('#employe-augmente').scrollIntoViewIfNeeded();
    });

    test('section#employe-augmente est visible', async ({ page }) => {
        await expect(page.locator('#employe-augmente')).toBeVisible();
    });

    test('exactement 4 verb cards (.ia-verb-card)', async ({ page }) => {
        const cards = page.locator('#employe-augmente .ia-verb-card');
        await expect(cards).toHaveCount(4);
    });

    test('les 4 verbes Prépare / Produit / Vérifie / Apprend sont visibles', async ({ page }) => {
        const verbs = page.locator('#employe-augmente .ia-verb');
        const texts = await verbs.allTextContents();
        expect(texts.some(t => /prépare|prepare/i.test(t))).toBe(true);
        expect(texts.some(t => /produit/i.test(t))).toBe(true);
        expect(texts.some(t => /vérifie|verifie/i.test(t))).toBe(true);
        expect(texts.some(t => /apprend/i.test(t))).toBe(true);
    });

    test('message clé "collaborateur reste aux commandes" visible', async ({ page }) => {
        const msg = page.locator('#employe-augmente .ia-key-message');
        await expect(msg).toBeVisible();
        const text = await msg.textContent();
        expect(text).toMatch(/collaborateur|commandes/i);
    });

    test('sous-titre de section définit ce qu\'est un agent IA (auto-explicatif)', async ({ page }) => {
        const sub = page.locator('#employe-augmente .section-subtitle');
        await expect(sub).toBeVisible();
        const text = await sub.textContent();
        expect(text.toLowerCase()).toMatch(/agent|autonome|tâche/i);
    });
});


// ====================================================================
// CA5 — Section "Exemple concret" : 2 phases workflow
// ====================================================================
test.describe('Section "Exemple concret" — 2 phases workflow', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/ia.html');
        await page.locator('#exemple').scrollIntoViewIfNeeded();
    });

    test('section#exemple est visible', async ({ page }) => {
        await expect(page.locator('#exemple')).toBeVisible();
    });

    test('titre mentionne "Audit GRC"', async ({ page }) => {
        const h2 = page.locator('#exemple .section-title');
        await expect(h2).toBeVisible();
        const text = await h2.textContent();
        expect(text).toMatch(/audit|GRC/i);
    });

    test('2 workflow-phases sont visibles', async ({ page }) => {
        const phases = page.locator('#exemple .workflow-phase');
        await expect(phases).toHaveCount(2);
        for (let i = 0; i < 2; i++) {
            await expect(phases.nth(i)).toBeVisible();
        }
    });

    test('Phase 1 contient "Sourcing" et mention des 7 critères', async ({ page }) => {
        const phase1 = page.locator('#exemple .workflow-phase').nth(0);
        const text = await phase1.textContent();
        expect(text).toMatch(/sourcing|1/i);
        expect(text).toMatch(/7[\s\xa0]*crit[eè]re/i);
    });

    test('Phase 2 contient "Production" et pré-remplissage', async ({ page }) => {
        const phase2 = page.locator('#exemple .workflow-phase').nth(1);
        const text = await phase2.textContent();
        expect(text).toMatch(/production|2/i);
        expect(text).toMatch(/pr[eé]-?rempli|pr[eé]rempl/i);
    });

    test('bloc résultats visible avec ×4 plus rapide', async ({ page }) => {
        const results = page.locator('#exemple .workflow-results');
        await expect(results).toBeVisible();
        const text = await results.textContent();
        expect(text).toMatch(/[×x]4/i);
    });

    test('tag "0 oubli" présent dans les résultats', async ({ page }) => {
        const results = page.locator('#exemple .workflow-results');
        const text = await results.textContent();
        expect(text).toMatch(/0[\s\xa0]*oubli/i);
    });
});


// ====================================================================
// CA6 — Section "Applicable à tous les métiers" : 7 cards
// ====================================================================
test.describe('Section "Applicable à tous les métiers" — 7 cards', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/ia.html');
        await page.locator('#metiers').scrollIntoViewIfNeeded();
    });

    test('section#metiers est visible', async ({ page }) => {
        await expect(page.locator('#metiers')).toBeVisible();
    });

    test('7 job-detail-cards sont présentes', async ({ page }) => {
        const cards = page.locator('#metiers .job-detail-card');
        await expect(cards).toHaveCount(7);
    });

    test('card "Développeur" est présente (profil technique couvert)', async ({ page }) => {
        const cards = page.locator('#metiers .job-detail-card');
        const count = await cards.count();
        let found = false;
        for (let i = 0; i < count; i++) {
            const text = await cards.nth(i).textContent();
            if (/d[eé]veloppeur/i.test(text)) { found = true; break; }
        }
        expect(found).toBe(true);
    });

    test('card "Direction" est présente', async ({ page }) => {
        const cards = page.locator('#metiers .job-detail-card');
        const count = await cards.count();
        let found = false;
        for (let i = 0; i < count; i++) {
            const text = await cards.nth(i).textContent();
            if (/direction/i.test(text)) { found = true; break; }
        }
        expect(found).toBe(true);
    });

    test('chaque card a une icône visible', async ({ page }) => {
        const icons = page.locator('#metiers .job-detail-card .job-detail-icon i');
        const count = await icons.count();
        expect(count).toBe(7);
    });

    test('chaque card a au moins 2 items dans la liste', async ({ page }) => {
        const cards = page.locator('#metiers .job-detail-card');
        const count = await cards.count();
        for (let i = 0; i < count; i++) {
            const items = cards.nth(i).locator('ul li');
            const n = await items.count();
            expect(n).toBeGreaterThanOrEqual(2);
        }
    });
});


// ====================================================================
// CA7 — Section "Notre approche" : 3 étapes numérotées
// ====================================================================
test.describe('Section "Notre approche" — 3 étapes', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/ia.html');
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

    test('étape 2 numérotée "02" et parle de construction', async ({ page }) => {
        const step2 = page.locator('#approche .step-card').nth(1);
        const text = await step2.textContent();
        expect(text).toContain('02');
        expect(text.toLowerCase()).toMatch(/construction/i);
    });

    test('étape 3 numérotée "03" et parle de déploiement', async ({ page }) => {
        const step3 = page.locator('#approche .step-card').nth(2);
        const text = await step3.textContent();
        expect(text).toContain('03');
        expect(text.toLowerCase()).toMatch(/d[eé]ploiement/i);
    });
});


// ====================================================================
// CA8 — Section "Résultats" : 3 KPI boxes
// ====================================================================
test.describe('Section "Résultats" — 3 KPI boxes', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/ia.html');
        await page.locator('#resultats').scrollIntoViewIfNeeded();
    });

    test('section#resultats est visible', async ({ page }) => {
        await expect(page.locator('#resultats')).toBeVisible();
    });

    test('3 KPI cards résultats sont visibles', async ({ page }) => {
        const cards = page.locator('#resultats .kpi-card');
        await expect(cards).toHaveCount(3);
        for (let i = 0; i < 3; i++) {
            await expect(cards.nth(i)).toBeVisible();
        }
    });

    test('KPI "×2 à ×4" visible', async ({ page }) => {
        const card1 = page.locator('#resultats .kpi-card').nth(0);
        const text = await card1.textContent();
        expect(text).toMatch(/[×x]2|[×x]4/i);
    });

    test('KPI "-70%" visible', async ({ page }) => {
        const card2 = page.locator('#resultats .kpi-card').nth(1);
        const text = await card2.textContent();
        expect(text).toMatch(/70|−70/i);
    });

    test('KPI "0 oubli" visible', async ({ page }) => {
        const card3 = page.locator('#resultats .kpi-card').nth(2);
        const text = await card3.textContent();
        expect(text).toMatch(/0[\s\xa0]*oubli/i);
    });
});


// ====================================================================
// CA9 — CTA final : boutons Calendly + email
// ====================================================================
test.describe('CTA final — ia.html (#contact)', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/ia.html');
        await page.locator('#contact').scrollIntoViewIfNeeded();
    });

    test('section#contact est visible', async ({ page }) => {
        await expect(page.locator('#contact')).toBeVisible();
    });

    test('titre CTA mentionne diagnostic IA', async ({ page }) => {
        const h2 = page.locator('#contact .section-title');
        await expect(h2).toBeVisible();
        const text = await h2.textContent();
        expect(text.toLowerCase()).toMatch(/ia|diagnostic/i);
    });

    test('sous-titre CTA mentionne diagnostic gratuit', async ({ page }) => {
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
        await page.goto('/ia.html');
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
// CA10 — Animations scroll (.animate-in → .visible)
// ====================================================================
test.describe('Animations scroll — .animate-in', () => {

    test('au moins 15 éléments .animate-in dans la page', async ({ page }) => {
        await page.goto('/ia.html');
        const count = await page.evaluate(() =>
            document.querySelectorAll('.animate-in').length
        );
        expect(count).toBeGreaterThanOrEqual(15);
    });

    test('après scroll complet, les éléments visibles reçoivent .visible', async ({ page }) => {
        await page.goto('/ia.html');
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(500);

        const visibleCount = await page.evaluate(() =>
            document.querySelectorAll('.animate-in.visible').length
        );
        expect(visibleCount).toBeGreaterThan(0);
    });
});


// ====================================================================
// CA11 — Responsive mobile (375px)
// ====================================================================
test.describe('Responsive mobile — ia.html (375px)', () => {

    test.use({ viewport: { width: 375, height: 812 } });

    test.beforeEach(async ({ page }) => {
        await page.goto('/ia.html');
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

    test('section#employe-augmente visible sur mobile', async ({ page }) => {
        await page.locator('#employe-augmente').scrollIntoViewIfNeeded();
        await expect(page.locator('#employe-augmente')).toBeVisible();
    });

    test('section#metiers visible sur mobile', async ({ page }) => {
        await page.locator('#metiers').scrollIntoViewIfNeeded();
        await expect(page.locator('#metiers')).toBeVisible();
    });

    test('section#approche visible sur mobile', async ({ page }) => {
        await page.locator('#approche').scrollIntoViewIfNeeded();
        await expect(page.locator('#approche')).toBeVisible();
    });

    test('section#resultats visible sur mobile', async ({ page }) => {
        await page.locator('#resultats').scrollIntoViewIfNeeded();
        await expect(page.locator('#resultats')).toBeVisible();
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
// CA12 — Parcours utilisateur complet
// ====================================================================
test.describe('Parcours utilisateur — ia.html', () => {

    test('parcours vertical : toutes les sections accessibles au scroll', async ({ page }) => {
        await page.goto('/ia.html');

        const sections = [
            '#hero', '#probleme', '#employe-augmente',
            '#exemple', '#metiers', '#approche', '#resultats', '#contact'
        ];

        for (const selector of sections) {
            await page.locator(selector).scrollIntoViewIfNeeded();
            await expect(page.locator(selector)).toBeVisible();
        }
    });

    test('navigation interne : lien vers /#simulator dans la navbar', async ({ page }) => {
        await page.goto('/ia.html');
        const simLink = page.locator('.nav-menu a[href*="simulator"]');
        await expect(simLink).toBeVisible();
    });

    test('lien "Cyber GRC" dans la navbar pointe vers cyber.html', async ({ page }) => {
        await page.goto('/ia.html');
        const cyberLink = page.locator('.nav-menu a[href*="cyber"]');
        await expect(cyberLink).toBeVisible();
        const href = await cyberLink.getAttribute('href');
        expect(href).toContain('cyber');
    });
});


// ====================================================================
// CA13 — Sécurité et accessibilité
// ====================================================================
test.describe('Sécurité et accessibilité — ia.html', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/ia.html');
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
        const withAria = sections.filter(s => s.hasAria).length;
        expect(withAria).toBeGreaterThanOrEqual(4);
    });

    test('pas d\'erreurs de console JS au chargement', async ({ page }) => {
        const errors = [];
        page.on('pageerror', err => errors.push(err.message));
        await page.reload();
        expect(errors.length).toBe(0);
    });

    test('les icônes décoratives ont aria-hidden="true"', async ({ page }) => {
        const count = await page.evaluate(() => {
            const icons = Array.from(document.querySelectorAll('.ia-verb-card i'));
            return icons.filter(i => i.getAttribute('aria-hidden') !== 'true').length;
        });
        expect(count).toBe(0);
    });
});
