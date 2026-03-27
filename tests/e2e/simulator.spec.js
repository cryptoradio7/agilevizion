/**
 * Tests E2E — Simulateur de conformité (Story #4)
 * Playwright — Desktop Chrome + iPhone 12
 *
 * Couvre : 6 questions obligatoires, questions conditionnelles,
 * bouton Analyser, profil détecté, résultats en 2 catégories,
 * détails normes (10 normes), reset, edge cases.
 */

'use strict';

const { test, expect } = require('@playwright/test');

// ====================================================================
// Helper : remplir les 6 questions obligatoires de base
// ====================================================================
async function fillMandatoryQuestions(page, overrides = {}) {
    const defaults = {
        q1_location: 'eu',
        q2_sector: 'services',
        q3_size: 'medium',
        q4_personal_data: 'yes',
        q5_regulated: 'no',
        q6_it_services: 'no',
        q11_continuity: 'no',
        q10_us_activity: 'no'
    };
    const answers = { ...defaults, ...overrides };

    for (const [id, value] of Object.entries(answers)) {
        const el = page.locator(`#${id}`);
        if (await el.count() > 0) {
            await el.selectOption(value);
        }
    }
}

// ====================================================================
// CA1 — Simulateur intégré dans la landing page
// ====================================================================
test.describe('CA1 — Intégration dans la landing page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('section#simulator présente et visible', async ({ page }) => {
        await expect(page.locator('#simulator')).toBeVisible();
    });

    test('simulateur dans la landing page (pas une page séparée)', async ({ page }) => {
        const url = page.url();
        expect(url).toContain('localhost');
        expect(url).not.toContain('simulator.html');
        await expect(page.locator('#simulator-container')).toBeVisible();
    });

    test('titre de section visible', async ({ page }) => {
        const title = page.locator('#simulator .section-title');
        await expect(title).toBeVisible();
        const text = await title.textContent();
        expect(text.trim().length).toBeGreaterThan(0);
    });

    test('lien de navigation vers #simulator dans la navbar', async ({ page }) => {
        const navLink = page.locator('.nav-menu a[href="#simulator"]');
        await expect(navLink).toBeVisible();
    });
});

// ====================================================================
// CA2 — 6 questions obligatoires présentes
// ====================================================================
test.describe('CA2 — 6 questions obligatoires présentes', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('Q1 : select localisation présent', async ({ page }) => {
        await expect(page.locator('#q1_location')).toBeVisible();
    });

    test('Q2 : select secteur présent (20+ options)', async ({ page }) => {
        const select = page.locator('#q2_sector');
        await expect(select).toBeVisible();
        const options = select.locator('option:not([value=""])');
        const count = await options.count();
        expect(count).toBeGreaterThanOrEqual(20);
    });

    test('Q3 : select taille présent', async ({ page }) => {
        await expect(page.locator('#q3_size')).toBeVisible();
    });

    test('Q4 : select données personnelles présent', async ({ page }) => {
        await expect(page.locator('#q4_personal_data')).toBeVisible();
    });

    test('Q5 : select licence financière présent', async ({ page }) => {
        await expect(page.locator('#q5_regulated')).toBeVisible();
    });

    test('Q6 : select services IT/Cloud présent', async ({ page }) => {
        await expect(page.locator('#q6_it_services')).toBeVisible();
    });

    test('Q1 a 3 options : UE, clients UE, Hors UE', async ({ page }) => {
        const options = ['eu', 'eu_clients', 'non_eu'];
        for (const val of options) {
            await expect(page.locator(`#q1_location option[value="${val}"]`)).toBeAttached();
        }
    });

    test('Q3 a 3 options : small, medium, large', async ({ page }) => {
        const options = ['small', 'medium', 'large'];
        for (const val of options) {
            await expect(page.locator(`#q3_size option[value="${val}"]`)).toBeAttached();
        }
    });

    test('Q2 secteur contient les options finance DORA', async ({ page }) => {
        const doraOptions = ['banking', 'insurance', 'investment', 'crypto'];
        for (const val of doraOptions) {
            await expect(page.locator(`#q2_sector option[value="${val}"]`)).toBeAttached();
        }
    });

    test('Q2 secteur contient les options NIS2 Annexe I', async ({ page }) => {
        const nis2Options = ['energy', 'transport', 'health', 'water', 'digital_infra'];
        for (const val of nis2Options) {
            await expect(page.locator(`#q2_sector option[value="${val}"]`)).toBeAttached();
        }
    });
});

// ====================================================================
// CA3 — Bouton Analyser activé seulement après les 6 réponses
// ====================================================================
test.describe('CA3 — Bouton Analyser', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('bouton Analyser présent', async ({ page }) => {
        await expect(page.locator('#btn-analyze')).toBeVisible();
    });

    test('bouton Analyser désactivé au chargement', async ({ page }) => {
        await expect(page.locator('#btn-analyze')).toBeDisabled();
    });

    test('bouton désactivé après seulement Q1 remplie', async ({ page }) => {
        await page.locator('#q1_location').selectOption('eu');
        await expect(page.locator('#btn-analyze')).toBeDisabled();
    });

    test('bouton désactivé après 5 questions sur 7 (manque Q6 et Q11)', async ({ page }) => {
        await page.locator('#q1_location').selectOption('eu');
        await page.locator('#q2_sector').selectOption('services');
        await page.locator('#q3_size').selectOption('medium');
        await page.locator('#q4_personal_data').selectOption('yes');
        await page.locator('#q5_regulated').selectOption('no');
        await expect(page.locator('#btn-analyze')).toBeDisabled();
    });

    test('bouton activé après les 7 questions requises (Q1-Q6 + Q11)', async ({ page }) => {
        await fillMandatoryQuestions(page);
        await expect(page.locator('#btn-analyze')).toBeEnabled();
    });

    test('bouton désactivé si Q11 manque', async ({ page }) => {
        await page.locator('#q1_location').selectOption('eu');
        await page.locator('#q2_sector').selectOption('services');
        await page.locator('#q3_size').selectOption('medium');
        await page.locator('#q4_personal_data').selectOption('yes');
        await page.locator('#q5_regulated').selectOption('no');
        await page.locator('#q6_it_services').selectOption('no');
        // Q11 non remplie
        await expect(page.locator('#btn-analyze')).toBeDisabled();
    });
});

// ====================================================================
// CA4 — Questions conditionnelles
// ====================================================================
test.describe('CA4 — Questions conditionnelles', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('Q7 (TIC) masquée par défaut', async ({ page }) => {
        const q7 = page.locator('#cond-tic');
        // Doit être dans le DOM mais pas visible (max-height: 0)
        const classes = await q7.getAttribute('class');
        expect(classes).not.toContain('visible');
    });

    test('Q7 (TIC) visible si q6=yes + pas entité financière régulée', async ({ page }) => {
        await page.locator('#q2_sector').selectOption('services');
        await page.locator('#q5_regulated').selectOption('no');
        await page.locator('#q6_it_services').selectOption('yes');
        await expect(page.locator('#cond-tic')).toHaveClass(/visible/);
    });

    test('Q7 (TIC) masquée si entité déjà régulée (q5=yes)', async ({ page }) => {
        await page.locator('#q2_sector').selectOption('banking');
        await page.locator('#q5_regulated').selectOption('yes');
        await page.locator('#q6_it_services').selectOption('yes');
        const classes = await page.locator('#cond-tic').getAttribute('class');
        expect(classes).not.toContain('visible');
    });

    test('Q8 (HDS) visible si secteur santé', async ({ page }) => {
        await page.locator('#q2_sector').selectOption('health');
        await expect(page.locator('#cond-hds')).toHaveClass(/visible/);
    });

    test('Q8 (HDS) visible si q6=yes (services IT)', async ({ page }) => {
        await page.locator('#q6_it_services').selectOption('yes');
        await expect(page.locator('#cond-hds')).toHaveClass(/visible/);
    });

    test('Q9 (PCI) visible si q6=yes', async ({ page }) => {
        await page.locator('#q6_it_services').selectOption('yes');
        await expect(page.locator('#cond-pci')).toHaveClass(/visible/);
    });

    test('Q9 (PCI) visible si secteur retail', async ({ page }) => {
        await page.locator('#q2_sector').selectOption('retail');
        await expect(page.locator('#cond-pci')).toHaveClass(/visible/);
    });

    test('Q10a/Q10b masquées si q10=no', async ({ page }) => {
        const q10a = page.locator('#cond-us-certs');
        const q10b = page.locator('#cond-us-dod');
        const classA = await q10a.getAttribute('class');
        const classB = await q10b.getAttribute('class');
        expect(classA).not.toContain('visible');
        expect(classB).not.toContain('visible');
    });

    test('Q10a/Q10b visibles si q10=yes', async ({ page }) => {
        await page.locator('#q10_us_activity').selectOption('yes');
        await expect(page.locator('#cond-us-certs')).toHaveClass(/visible/);
        await expect(page.locator('#cond-us-dod')).toHaveClass(/visible/);
    });

    test('Q10a/Q10b masquées si q10 repasse à no', async ({ page }) => {
        await page.locator('#q10_us_activity').selectOption('yes');
        await page.locator('#q10_us_activity').selectOption('no');
        const classA = await page.locator('#cond-us-certs').getAttribute('class');
        const classB = await page.locator('#cond-us-dod').getAttribute('class');
        expect(classA).not.toContain('visible');
        expect(classB).not.toContain('visible');
    });
});

// ====================================================================
// CA5 — Profil détecté (Startup / PME / ETI)
// ====================================================================
test.describe('CA5 — Profil détecté', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('taille=small → profil Startup 🚀', async ({ page }) => {
        await fillMandatoryQuestions(page, { q3_size: 'small' });
        await page.locator('#btn-analyze').click();
        await expect(page.locator('#profile-card')).toHaveClass(/visible/);
        const icon = await page.locator('#profile-icon').textContent();
        expect(icon).toContain('🚀');
    });

    test('taille=medium → profil PME 🏢', async ({ page }) => {
        await fillMandatoryQuestions(page, { q3_size: 'medium' });
        await page.locator('#btn-analyze').click();
        await expect(page.locator('#profile-card')).toHaveClass(/visible/);
        const icon = await page.locator('#profile-icon').textContent();
        expect(icon).toContain('🏢');
    });

    test('taille=large → profil ETI 🏛️', async ({ page }) => {
        await fillMandatoryQuestions(page, { q3_size: 'large' });
        await page.locator('#btn-analyze').click();
        await expect(page.locator('#profile-card')).toHaveClass(/visible/);
        const icon = await page.locator('#profile-icon').textContent();
        expect(icon).toContain('🏛️');
    });

    test('profile-title visible et non vide après analyse', async ({ page }) => {
        await fillMandatoryQuestions(page);
        await page.locator('#btn-analyze').click();
        await expect(page.locator('#profile-card')).toHaveClass(/visible/);
        const title = await page.locator('#profile-title').textContent();
        expect(title.trim().length).toBeGreaterThan(0);
    });

    test('tags affichés (ex: 🇪🇺 Union Européenne si q1=eu)', async ({ page }) => {
        await fillMandatoryQuestions(page, { q1_location: 'eu' });
        await page.locator('#btn-analyze').click();
        await expect(page.locator('#profile-card')).toHaveClass(/visible/);
        const tags = await page.locator('#profile-tags').textContent();
        expect(tags).toContain('🇪🇺');
    });
});

// ====================================================================
// CA6 — Résultats en 2 catégories (Obligatoire / Recommandé)
// ====================================================================
test.describe('CA6 — Résultats 2 catégories', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('section résultats invisible avant analyse', async ({ page }) => {
        const results = page.locator('#results-section');
        const classes = await results.getAttribute('class');
        expect(classes).not.toContain('visible');
    });

    test('section résultats visible après analyse', async ({ page }) => {
        await fillMandatoryQuestions(page, { q4_personal_data: 'yes' });
        await page.locator('#btn-analyze').click();
        await expect(page.locator('#results-section')).toHaveClass(/visible/);
    });

    test('compteurs mandatory/recommended affichés après analyse', async ({ page }) => {
        await fillMandatoryQuestions(page, { q4_personal_data: 'yes' });
        await page.locator('#btn-analyze').click();
        const mandatory = await page.locator('#count-mandatory').textContent();
        const recommended = await page.locator('#count-recommended').textContent();
        expect(parseInt(mandatory) + parseInt(recommended)).toBeGreaterThan(0);
    });

    test('RGPD obligatoire si q1=eu + q4=yes', async ({ page }) => {
        await fillMandatoryQuestions(page, { q1_location: 'eu', q4_personal_data: 'yes' });
        await page.locator('#btn-analyze').click();
        const mandatory = page.locator('.norm-card.mandatory');
        const mandatoryNames = await mandatory.allTextContents();
        const hasRGPD = mandatoryNames.some(t => t.includes('RGPD'));
        expect(hasRGPD).toBe(true);
    });

    test('RGPD absent si q4=no', async ({ page }) => {
        await fillMandatoryQuestions(page, { q4_personal_data: 'no' });
        await page.locator('#btn-analyze').click();
        const container = await page.locator('#results-container').textContent();
        // RGPD ne doit pas apparaître en obligatoire
        const rgpdCards = page.locator('.norm-card.mandatory').filter({ hasText: 'RGPD' });
        await expect(rgpdCards).toHaveCount(0);
    });

    test('titre "Réglementations applicables" visible si au moins 1 norme obligatoire', async ({ page }) => {
        await fillMandatoryQuestions(page, { q1_location: 'eu', q4_personal_data: 'yes' });
        await page.locator('#btn-analyze').click();
        await expect(page.locator('.mandatory-title')).toBeVisible();
    });

    test('titre "Recommandations" visible si au moins 1 recommandation', async ({ page }) => {
        await fillMandatoryQuestions(page, { q3_size: 'medium' });
        await page.locator('#btn-analyze').click();
        // ISO 27001 recommandée pour taille medium
        const recommended = page.locator('.recommended-title');
        await expect(recommended).toBeVisible();
    });
});

// ====================================================================
// CA7 — Détails normes (nom, statut, why, sanctions, deadline, ref)
// ====================================================================
test.describe('CA7 — Détail des normes', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('chaque norm-card a un nom (norm-name)', async ({ page }) => {
        await fillMandatoryQuestions(page, { q4_personal_data: 'yes' });
        await page.locator('#btn-analyze').click();
        const cards = page.locator('.norm-card');
        const count = await cards.count();
        expect(count).toBeGreaterThan(0);
        for (let i = 0; i < count; i++) {
            const name = await cards.nth(i).locator('.norm-name').textContent();
            expect(name.trim().length).toBeGreaterThan(0);
        }
    });

    test('chaque norm-card a un badge (obligatoire ou recommandé)', async ({ page }) => {
        await fillMandatoryQuestions(page, { q4_personal_data: 'yes' });
        await page.locator('#btn-analyze').click();
        const cards = page.locator('.norm-card');
        const count = await cards.count();
        for (let i = 0; i < count; i++) {
            const badge = cards.nth(i).locator('.norm-badge');
            await expect(badge).toBeVisible();
            const text = await badge.textContent();
            expect(text.trim().length).toBeGreaterThan(0);
        }
    });

    test('chaque norm-card a un "pourquoi" (norm-why)', async ({ page }) => {
        await fillMandatoryQuestions(page, { q4_personal_data: 'yes' });
        await page.locator('#btn-analyze').click();
        const cards = page.locator('.norm-card');
        const count = await cards.count();
        for (let i = 0; i < count; i++) {
            const why = await cards.nth(i).locator('.norm-why').textContent();
            expect(why.trim().length).toBeGreaterThan(0);
        }
    });

    test('chaque norm-card affiche sanctions/risques', async ({ page }) => {
        await fillMandatoryQuestions(page, { q4_personal_data: 'yes' });
        await page.locator('#btn-analyze').click();
        const cards = page.locator('.norm-card');
        const count = await cards.count();
        for (let i = 0; i < count; i++) {
            const details = await cards.nth(i).locator('.norm-details').textContent();
            expect(details.trim().length).toBeGreaterThan(0);
        }
    });

    test('card RGPD affiche référence "(UE) 2016/679"', async ({ page }) => {
        await fillMandatoryQuestions(page, { q4_personal_data: 'yes' });
        await page.locator('#btn-analyze').click();
        const rgpdCard = page.locator('.norm-card').filter({ hasText: 'RGPD' }).first();
        const details = await rgpdCard.textContent();
        expect(details).toContain('2016/679');
    });

    test('card DORA affiche référence "(UE) 2022/2554"', async ({ page }) => {
        await fillMandatoryQuestions(page, {
            q1_location: 'eu',
            q2_sector: 'banking',
            q5_regulated: 'yes',
            q4_personal_data: 'yes'
        });
        await page.locator('#btn-analyze').click();
        const doraCard = page.locator('.norm-card').filter({ hasText: 'DORA' }).first();
        await expect(doraCard).toBeVisible();
        const details = await doraCard.textContent();
        expect(details).toContain('2022/2554');
    });
});

// ====================================================================
// CA8 — 10 normes couvertes
// ====================================================================
test.describe('CA8 — 10 normes couvertes', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('RGPD détecté si données perso + UE', async ({ page }) => {
        await fillMandatoryQuestions(page, { q4_personal_data: 'yes' });
        await page.locator('#btn-analyze').click();
        const card = page.locator('.norm-card').filter({ hasText: 'RGPD' });
        await expect(card.first()).toBeVisible();
    });

    test('DORA détecté si entité financière UE', async ({ page }) => {
        await fillMandatoryQuestions(page, {
            q1_location: 'eu',
            q2_sector: 'banking',
            q5_regulated: 'yes'
        });
        await page.locator('#btn-analyze').click();
        const card = page.locator('.norm-card').filter({ hasText: 'DORA' });
        await expect(card.first()).toBeVisible();
    });

    test('NIS 2 détecté si secteur Annexe I + taille medium + UE', async ({ page }) => {
        await fillMandatoryQuestions(page, {
            q1_location: 'eu',
            q2_sector: 'energy',
            q3_size: 'medium'
        });
        await page.locator('#btn-analyze').click();
        const card = page.locator('.norm-card').filter({ hasText: 'NIS 2' });
        await expect(card.first()).toBeVisible();
    });

    test('PCI-DSS détecté si q9=yes', async ({ page }) => {
        await fillMandatoryQuestions(page, { q6_it_services: 'yes' });
        await page.locator('#cond-pci').waitFor({ state: 'attached' });
        await page.locator('#q9_pci').selectOption('yes');
        await page.locator('#btn-analyze').click();
        const card = page.locator('.norm-card').filter({ hasText: 'PCI-DSS' });
        await expect(card.first()).toBeVisible();
    });

    test('HDS détecté si q8=yes', async ({ page }) => {
        await fillMandatoryQuestions(page, { q6_it_services: 'yes' });
        await page.locator('#cond-hds').waitFor({ state: 'attached' });
        await page.locator('#q8_hds').selectOption('yes');
        await page.locator('#btn-analyze').click();
        const card = page.locator('.norm-card').filter({ hasText: 'HDS' });
        await expect(card.first()).toBeVisible();
    });

    test('ISO 27001 recommandé pour taille medium', async ({ page }) => {
        await fillMandatoryQuestions(page, { q3_size: 'medium' });
        await page.locator('#btn-analyze').click();
        const card = page.locator('.norm-card').filter({ hasText: 'ISO 27001' });
        await expect(card.first()).toBeVisible();
    });

    test('ISO 27001 obligatoire si q10a=iso27001', async ({ page }) => {
        await fillMandatoryQuestions(page, { q10_us_activity: 'yes' });
        await page.locator('#cond-us-certs').waitFor({ state: 'attached' });
        await page.locator('#q10a_us_certs').selectOption('iso27001');
        await page.locator('#btn-analyze').click();
        const card = page.locator('.norm-card.mandatory').filter({ hasText: 'ISO 27001' });
        await expect(card.first()).toBeVisible();
    });

    test('ISO 20000 recommandé si services IT', async ({ page }) => {
        await fillMandatoryQuestions(page, { q6_it_services: 'yes' });
        await page.locator('#btn-analyze').click();
        const card = page.locator('.norm-card').filter({ hasText: 'ISO 20000' });
        await expect(card.first()).toBeVisible();
    });

    test('SOC 2 recommandé si activité US + services IT', async ({ page }) => {
        await fillMandatoryQuestions(page, {
            q10_us_activity: 'yes',
            q6_it_services: 'yes'
        });
        await page.locator('#cond-us-certs').waitFor({ state: 'attached' });
        await page.locator('#q10a_us_certs').selectOption('no');
        await page.locator('#btn-analyze').click();
        const card = page.locator('.norm-card').filter({ hasText: 'SOC 2' });
        await expect(card.first()).toBeVisible();
    });

    test('SOC 2 obligatoire si q10a=soc2', async ({ page }) => {
        await fillMandatoryQuestions(page, { q10_us_activity: 'yes' });
        await page.locator('#cond-us-certs').waitFor({ state: 'attached' });
        await page.locator('#q10a_us_certs').selectOption('soc2');
        await page.locator('#btn-analyze').click();
        const card = page.locator('.norm-card.mandatory').filter({ hasText: 'SOC 2' });
        await expect(card.first()).toBeVisible();
    });

    test('ISO 22301 recommandé si NIS2 applicable', async ({ page }) => {
        await fillMandatoryQuestions(page, {
            q1_location: 'eu',
            q2_sector: 'energy',
            q3_size: 'medium',
            q11_continuity: 'yes'
        });
        await page.locator('#btn-analyze').click();
        const card = page.locator('.norm-card').filter({ hasText: 'ISO 22301' });
        await expect(card.first()).toBeVisible();
    });

    test('CMMC obligatoire si q10b=yes', async ({ page }) => {
        await fillMandatoryQuestions(page, { q10_us_activity: 'yes' });
        await page.locator('#cond-us-dod').waitFor({ state: 'attached' });
        await page.locator('#q10b_dod').selectOption('yes');
        await page.locator('#btn-analyze').click();
        const card = page.locator('.norm-card.mandatory').filter({ hasText: 'CMMC' });
        await expect(card.first()).toBeVisible();
    });
});

// ====================================================================
// Edge case — Reset après modification
// ====================================================================
test.describe('Edge case — Reset résultats après modification', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('modifier une réponse après analyse masque les résultats', async ({ page }) => {
        await fillMandatoryQuestions(page, { q4_personal_data: 'yes' });
        await page.locator('#btn-analyze').click();
        await expect(page.locator('#results-section')).toHaveClass(/visible/);

        // Modifier Q4
        await page.locator('#q4_personal_data').selectOption('no');

        const classes = await page.locator('#results-section').getAttribute('class');
        expect(classes).not.toContain('visible');
    });

    test('modifier une réponse après analyse masque le profile-card', async ({ page }) => {
        await fillMandatoryQuestions(page);
        await page.locator('#btn-analyze').click();
        await expect(page.locator('#profile-card')).toHaveClass(/visible/);

        await page.locator('#q3_size').selectOption('large');

        const classes = await page.locator('#profile-card').getAttribute('class');
        expect(classes).not.toContain('visible');
    });

    test('bouton Réinitialiser remet tout à zéro', async ({ page }) => {
        await fillMandatoryQuestions(page);
        await page.locator('#btn-analyze').click();
        await expect(page.locator('#results-section')).toHaveClass(/visible/);

        await page.locator('.btn-sim-reset').click();

        // Les sélects doivent être vides (sauf q10 = no par défaut)
        const q1 = await page.locator('#q1_location').inputValue();
        expect(q1).toBe('');

        const resClasses = await page.locator('#results-section').getAttribute('class');
        expect(resClasses).not.toContain('visible');

        await expect(page.locator('#btn-analyze')).toBeDisabled();
    });
});

// ====================================================================
// Edge case — Localisation Hors UE
// ====================================================================
test.describe('Edge case — Localisation Hors UE', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('non_eu → DORA absent (pas applicable hors UE)', async ({ page }) => {
        await fillMandatoryQuestions(page, {
            q1_location: 'non_eu',
            q2_sector: 'banking',
            q5_regulated: 'yes'
        });
        await page.locator('#btn-analyze').click();
        const doraCards = page.locator('.norm-card').filter({ hasText: 'DORA' });
        await expect(doraCards).toHaveCount(0);
    });

    test('non_eu → NIS2 absent pour secteur non extraterritorial', async ({ page }) => {
        await fillMandatoryQuestions(page, {
            q1_location: 'non_eu',
            q2_sector: 'energy',
            q3_size: 'large'
        });
        await page.locator('#btn-analyze').click();
        const nis2Cards = page.locator('.norm-card').filter({ hasText: 'NIS 2' });
        await expect(nis2Cards).toHaveCount(0);
    });

    test('eu_clients + secteur extraterritorial (digital_infra) → NIS2 applicable', async ({ page }) => {
        await fillMandatoryQuestions(page, {
            q1_location: 'eu_clients',
            q2_sector: 'digital_infra',
            q3_size: 'medium'
        });
        await page.locator('#btn-analyze').click();
        const nis2Card = page.locator('.norm-card').filter({ hasText: 'NIS 2' });
        await expect(nis2Card.first()).toBeVisible();
    });

    test('eu_clients + secteur extraterritorial → note extraterritorial visible', async ({ page }) => {
        await fillMandatoryQuestions(page, {
            q1_location: 'eu_clients',
            q2_sector: 'digital_infra',
            q3_size: 'medium'
        });
        await page.locator('#btn-analyze').click();
        const note = page.locator('.norm-note.warning');
        await expect(note.first()).toBeVisible();
    });
});

// ====================================================================
// Edge case — NIS2/DORA applicables + pas de continuité
// ====================================================================
test.describe('Edge case — Avertissement continuité', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('NIS2 applicable + q11=no → note continuité visible', async ({ page }) => {
        await fillMandatoryQuestions(page, {
            q1_location: 'eu',
            q2_sector: 'energy',
            q3_size: 'medium',
            q11_continuity: 'no'
        });
        const note = page.locator('#note-continuity');
        await expect(note).toBeVisible();
    });

    test('DORA applicable + q11=no → note continuité visible', async ({ page }) => {
        await fillMandatoryQuestions(page, {
            q1_location: 'eu',
            q2_sector: 'banking',
            q3_size: 'medium',
            q5_regulated: 'yes',
            q11_continuity: 'no'
        });
        const note = page.locator('#note-continuity');
        await expect(note).toBeVisible();
    });

    test('NIS2 applicable + q11=yes → note continuité absente', async ({ page }) => {
        await fillMandatoryQuestions(page, {
            q1_location: 'eu',
            q2_sector: 'energy',
            q3_size: 'medium',
            q11_continuity: 'yes'
        });
        const style = await page.locator('#note-continuity').getAttribute('style');
        expect(style).toContain('none');
    });
});

// ====================================================================
// Edge case — NIS2 absent si petite entreprise
// ====================================================================
test.describe('Edge case — NIS2 trop petite entreprise', () => {
    test('NIS2 absent si taille=small (hors exemption)', async ({ page }) => {
        await page.goto('/');
        await fillMandatoryQuestions(page, {
            q1_location: 'eu',
            q2_sector: 'energy',
            q3_size: 'small'
        });
        await page.locator('#btn-analyze').click();
        const nis2Cards = page.locator('.norm-card').filter({ hasText: 'NIS 2' });
        await expect(nis2Cards).toHaveCount(0);
    });
});

// ====================================================================
// Edge case — Aucune norme obligatoire → message positif
// ====================================================================
test.describe('Edge case — Aucune norme obligatoire', () => {
    test('message "Aucune réglementation" si conditions non remplies', async ({ page }) => {
        await page.goto('/');
        // Hors UE, pas de données perso, pas de cartes, pas de DoD
        await fillMandatoryQuestions(page, {
            q1_location: 'non_eu',
            q2_sector: 'other',
            q3_size: 'small',
            q4_personal_data: 'no',
            q5_regulated: 'no',
            q6_it_services: 'no',
            q10_us_activity: 'no',
            q11_continuity: 'no'
        });
        await page.locator('#btn-analyze').click();

        // Soit il y a 0 normes obligatoires, soit le message no-results est visible
        const mandatory = parseInt(await page.locator('#count-mandatory').textContent());
        expect(mandatory).toBe(0);
    });
});

// ====================================================================
// Edge case — Questions conditionnelles sans réponse → valeurs par défaut
// ====================================================================
test.describe('Edge case — Conditionnelles sans réponse', () => {
    test('calcul fonctionne sans répondre aux questions conditionnelles', async ({ page }) => {
        await page.goto('/');
        // Déclencher Q7, Q8, Q9 visible sans y répondre
        await fillMandatoryQuestions(page, {
            q6_it_services: 'yes',
            q2_sector: 'health'
        });
        // Ne PAS répondre à Q7, Q8, Q9 — laisser vide
        await page.locator('#btn-analyze').click();

        // Les résultats doivent quand même s'afficher
        await expect(page.locator('#results-section')).toHaveClass(/visible/);
        await expect(page.locator('#profile-card')).toHaveClass(/visible/);
    });
});

// ====================================================================
// Edge case — Sécurité inputs
// ====================================================================
test.describe('Edge case — Sécurité inputs PDF', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await fillMandatoryQuestions(page, { q4_personal_data: 'yes' });
        await page.locator('#btn-analyze').click();
        await expect(page.locator('#results-section')).toHaveClass(/visible/);
    });

    test('input company : valeur vide → bouton PDF désactivé', async ({ page }) => {
        await page.locator('#input-company').fill('');
        await page.locator('#input-email').fill('test@test.com');
        await expect(page.locator('#btn-pdf')).toBeDisabled();
    });

    test('input email sans @ → bouton PDF désactivé', async ({ page }) => {
        await page.locator('#input-company').fill('MonEntreprise');
        await page.locator('#input-email').fill('pasunemail');
        await expect(page.locator('#btn-pdf')).toBeDisabled();
    });

    test('inputs valides → bouton PDF activé', async ({ page }) => {
        await page.locator('#input-company').fill('MonEntreprise');
        await page.locator('#input-email').fill('contact@test.com');
        await expect(page.locator('#btn-pdf')).toBeEnabled();
    });
});

// ====================================================================
// i18n — Switch FR/EN
// ====================================================================
test.describe('i18n — Traductions FR/EN', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('texte initial en français (bouton Analyser)', async ({ page }) => {
        const btnText = await page.locator('#btn-analyze').textContent();
        expect(btnText).toContain('Analyser');
    });

    test('switch EN → bouton Analyser en anglais', async ({ page }) => {
        await page.locator('#lang-en').click();
        await page.waitForTimeout(500);
        const btnText = await page.locator('#btn-analyze').textContent();
        expect(btnText.toLowerCase()).toContain('analyse');
    });

    test('switch FR après EN → retour au français', async ({ page }) => {
        await page.locator('#lang-en').click();
        await page.waitForTimeout(300);
        await page.locator('#lang-fr').click();
        await page.waitForTimeout(300);
        const btnText = await page.locator('#btn-analyze').textContent();
        expect(btnText).toContain('Analyser');
    });
});

// ====================================================================
// Responsive mobile
// ====================================================================
test.describe('Responsive mobile', () => {
    test.use({ viewport: { width: 375, height: 812 } });

    test('simulateur visible sur mobile', async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('#simulator')).toBeVisible();
        await expect(page.locator('#q1_location')).toBeVisible();
    });

    test('sélects utilisables sur mobile', async ({ page }) => {
        await page.goto('/');
        await page.locator('#q1_location').selectOption('eu');
        const val = await page.locator('#q1_location').inputValue();
        expect(val).toBe('eu');
    });
});

// ====================================================================
// Accessibilité de base
// ====================================================================
test.describe('Accessibilité', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('tous les selects ont un label associé', async ({ page }) => {
        const ids = ['q1_location', 'q2_sector', 'q3_size', 'q4_personal_data', 'q5_regulated', 'q6_it_services', 'q11_continuity'];
        for (const id of ids) {
            const label = page.locator(`label[for="${id}"]`);
            await expect(label).toBeAttached();
        }
    });

    test('bouton Analyser a aria-disabled quand désactivé', async ({ page }) => {
        const btn = page.locator('#btn-analyze');
        const ariaDisabled = await btn.getAttribute('aria-disabled');
        expect(ariaDisabled).toBe('true');
    });

    test('#results-section a aria-live="polite"', async ({ page }) => {
        await expect(page.locator('#results-section')).toHaveAttribute('aria-live', 'polite');
    });

    test('#profile-card a aria-live="polite"', async ({ page }) => {
        await expect(page.locator('#profile-card')).toHaveAttribute('aria-live', 'polite');
    });

    test('disclamer simulateur visible', async ({ page }) => {
        await expect(page.locator('.simulator-disclaimer')).toBeVisible();
    });
});

// ====================================================================
// Story #5 — CA1 : Section PDF présente et apparaît après analyse
// ====================================================================
test.describe('Story #5 — CA1 : Section PDF après analyse', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('section .pdf-section présente dans le DOM', async ({ page }) => {
        await expect(page.locator('.pdf-section')).toBeAttached();
    });

    test('section #results-section non visible avant analyse', async ({ page }) => {
        const classes = await page.locator('#results-section').getAttribute('class');
        expect(classes).not.toContain('visible');
    });

    test('section PDF visible après analyse', async ({ page }) => {
        await fillMandatoryQuestions(page, { q4_personal_data: 'yes' });
        await page.locator('#btn-analyze').click();
        await expect(page.locator('#results-section')).toHaveClass(/visible/);
        await expect(page.locator('.pdf-section')).toBeVisible();
    });

    test('bouton #btn-pdf désactivé avant remplissage formulaire', async ({ page }) => {
        await fillMandatoryQuestions(page, { q4_personal_data: 'yes' });
        await page.locator('#btn-analyze').click();
        await expect(page.locator('#results-section')).toHaveClass(/visible/);
        await expect(page.locator('#btn-pdf')).toBeDisabled();
    });

    test('champ #input-company visible après analyse', async ({ page }) => {
        await fillMandatoryQuestions(page, { q4_personal_data: 'yes' });
        await page.locator('#btn-analyze').click();
        await expect(page.locator('#input-company')).toBeVisible();
    });

    test('champ #input-email visible après analyse', async ({ page }) => {
        await fillMandatoryQuestions(page, { q4_personal_data: 'yes' });
        await page.locator('#btn-analyze').click();
        await expect(page.locator('#input-email')).toBeVisible();
    });
});

// ====================================================================
// Story #5 — CA2 : Validation formulaire PDF (company + email requis)
// ====================================================================
test.describe('Story #5 — CA2 : Validation formulaire PDF', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await fillMandatoryQuestions(page, { q4_personal_data: 'yes' });
        await page.locator('#btn-analyze').click();
        await expect(page.locator('#results-section')).toHaveClass(/visible/);
    });

    test('company vide + email valide → btn-pdf désactivé', async ({ page }) => {
        await page.locator('#input-company').fill('');
        await page.locator('#input-email').fill('contact@example.com');
        await expect(page.locator('#btn-pdf')).toBeDisabled();
    });

    test('company valide + email vide → btn-pdf désactivé', async ({ page }) => {
        await page.locator('#input-company').fill('Acme Corp');
        await page.locator('#input-email').fill('');
        await expect(page.locator('#btn-pdf')).toBeDisabled();
    });

    test('company valide + email sans @ → btn-pdf désactivé', async ({ page }) => {
        await page.locator('#input-company').fill('Acme Corp');
        await page.locator('#input-email').fill('notanemail');
        await expect(page.locator('#btn-pdf')).toBeDisabled();
    });

    test('company et email valides → btn-pdf activé', async ({ page }) => {
        await page.locator('#input-company').fill('Acme Corp');
        await page.locator('#input-email').fill('contact@acme.com');
        await expect(page.locator('#btn-pdf')).toBeEnabled();
    });

    test('btn-pdf se désactive si company effacée après activation', async ({ page }) => {
        await page.locator('#input-company').fill('Acme Corp');
        await page.locator('#input-email').fill('contact@acme.com');
        await expect(page.locator('#btn-pdf')).toBeEnabled();
        await page.locator('#input-company').fill('');
        await expect(page.locator('#btn-pdf')).toBeDisabled();
    });
});

// ====================================================================
// Story #5 — CA5 : Popup bloquée → message d'erreur + instruction
// ====================================================================
test.describe('Story #5 — CA5 : Popup bloquée → message erreur', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await fillMandatoryQuestions(page, { q4_personal_data: 'yes' });
        await page.locator('#btn-analyze').click();
        await expect(page.locator('#results-section')).toHaveClass(/visible/);
        await page.locator('#input-company').fill('TestCorp');
        await page.locator('#input-email').fill('test@test.com');
    });

    test('popup bloquée → #msg-error visible avec mot "popup"', async ({ page }) => {
        await page.evaluate(() => {
            URL.createObjectURL = () => '#';
            URL.revokeObjectURL = () => {};
            window.open = () => null; // simule popup bloquée
        });
        await page.locator('#btn-pdf').click();
        await page.waitForTimeout(500);
        const msgError = page.locator('#msg-error');
        await expect(msgError).toHaveClass(/visible/);
        const text = await msgError.textContent();
        expect(text.toLowerCase()).toContain('popup');
    });

    test('popup bloquée → btn-pdf réactivé', async ({ page }) => {
        await page.evaluate(() => {
            URL.createObjectURL = () => '#';
            URL.revokeObjectURL = () => {};
            window.open = () => null;
        });
        await page.locator('#btn-pdf').click();
        await page.waitForTimeout(500);
        await expect(page.locator('#btn-pdf')).toBeEnabled();
    });

    test('popup bloquée → msg-success reste caché', async ({ page }) => {
        await page.evaluate(() => {
            URL.createObjectURL = () => '#';
            URL.revokeObjectURL = () => {};
            window.open = () => null;
        });
        await page.locator('#btn-pdf').click();
        await page.waitForTimeout(500);
        const successClasses = await page.locator('#msg-success').getAttribute('class');
        expect(successClasses).not.toContain('visible');
    });
});

// ====================================================================
// Story #5 — CA3 + CA6 : Contenu du rapport (branding, normes, audit)
// ====================================================================
test.describe('Story #5 — CA3 + CA6 : Contenu du rapport généré', () => {
    async function captureReport(page) {
        await page.evaluate(() => {
            URL.createObjectURL = () => '#';
            URL.revokeObjectURL = () => {};
            window._reportHtml = '';
            window.open = () => ({
                document: {
                    write: (html) => { window._reportHtml = html; },
                    close: () => {}
                },
                focus: () => {},
                print: () => {}
            });
        });
        await page.locator('#btn-pdf').click();
        await page.waitForTimeout(700);
        return page.evaluate(() => window._reportHtml);
    }

    test('rapport contient le nom de l\'entreprise saisi', async ({ page }) => {
        await page.goto('/');
        await fillMandatoryQuestions(page, { q4_personal_data: 'yes', q3_size: 'medium' });
        await page.locator('#btn-analyze').click();
        await page.locator('#input-company').fill('Société Test');
        await page.locator('#input-email').fill('rh@societe.com');
        const html = await captureReport(page);
        expect(html).toContain('Société Test');
    });

    test('CA6 — rapport contient le branding AgileVizion', async ({ page }) => {
        await page.goto('/');
        await fillMandatoryQuestions(page, { q4_personal_data: 'yes' });
        await page.locator('#btn-analyze').click();
        await page.locator('#input-company').fill('Corp');
        await page.locator('#input-email').fill('x@corp.com');
        const html = await captureReport(page);
        expect(html).toContain('AgileVizion');
    });

    test('rapport contient les normes obligatoires (RGPD si applicable)', async ({ page }) => {
        await page.goto('/');
        await fillMandatoryQuestions(page, { q4_personal_data: 'yes', q1_location: 'eu' });
        await page.locator('#btn-analyze').click();
        await page.locator('#input-company').fill('Corp');
        await page.locator('#input-email').fill('x@corp.com');
        const html = await captureReport(page);
        expect(html).toContain('RGPD');
    });

    test('rapport contient la section audit / prochaines étapes', async ({ page }) => {
        await page.goto('/');
        await fillMandatoryQuestions(page, { q4_personal_data: 'yes' });
        await page.locator('#btn-analyze').click();
        await page.locator('#input-company').fill('Corp');
        await page.locator('#input-email').fill('x@corp.com');
        const html = await captureReport(page);
        const hasAudit = html.toLowerCase().includes('audit') || html.includes('audit-section');
        expect(hasAudit).toBe(true);
    });

    test('rapport contient la date du jour', async ({ page }) => {
        await page.goto('/');
        await fillMandatoryQuestions(page, { q4_personal_data: 'yes' });
        await page.locator('#btn-analyze').click();
        await page.locator('#input-company').fill('Corp');
        await page.locator('#input-email').fill('x@corp.com');
        const html = await captureReport(page);
        const year = new Date().getFullYear().toString();
        expect(html).toContain(year);
    });
});

// ====================================================================
// Story #5 — Edge case : résultats changés → régénère à jour
// ====================================================================
test.describe('Story #5 — Edge case : résultats mis à jour entre analyses', () => {
    test('modifier réponse → ré-analyser → bouton PDF disponible avec nouveaux résultats', async ({ page }) => {
        await page.goto('/');
        // Première analyse
        await fillMandatoryQuestions(page, { q4_personal_data: 'yes' });
        await page.locator('#btn-analyze').click();
        await expect(page.locator('#results-section')).toHaveClass(/visible/);
        // Modifier q4 → masque les résultats
        await page.locator('#q4_personal_data').selectOption('no');
        const classes = await page.locator('#results-section').getAttribute('class');
        expect(classes).not.toContain('visible');
        // Ré-analyser
        await page.locator('#btn-analyze').click();
        await expect(page.locator('#results-section')).toHaveClass(/visible/);
        // Formulaire PDF prêt pour les nouveaux résultats
        await page.locator('#input-company').fill('Corp');
        await page.locator('#input-email').fill('x@corp.com');
        await expect(page.locator('#btn-pdf')).toBeEnabled();
    });

    test('reset après analyse vide le formulaire PDF', async ({ page }) => {
        await page.goto('/');
        await fillMandatoryQuestions(page, { q4_personal_data: 'yes' });
        await page.locator('#btn-analyze').click();
        await page.locator('#input-company').fill('Corp');
        await page.locator('#input-email').fill('x@corp.com');
        await expect(page.locator('#btn-pdf')).toBeEnabled();
        await page.locator('.btn-sim-reset').click();
        expect(await page.locator('#input-company').inputValue()).toBe('');
        expect(await page.locator('#input-email').inputValue()).toBe('');
        await expect(page.locator('#btn-pdf')).toBeDisabled();
    });
});
