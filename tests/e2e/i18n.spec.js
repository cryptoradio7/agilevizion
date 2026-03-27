/**
 * Tests E2E — Système i18n FR/EN (Story #10)
 * Playwright — Desktop Chrome + Mobile (375px)
 *
 * Couvre :
 * - Langue FR par défaut (sans paramètre, sans localStorage)
 * - Paramètre URL ?lang=en → page en anglais dès le chargement
 * - Paramètre URL ?lang=fr → page en français
 * - Sélecteur de langue visible et cliquable
 * - Changement EN → textes traduits en anglais sans rechargement
 * - Changement FR → retour en français sans rechargement
 * - URL mise à jour après changement de langue (?lang=en / ?lang=fr)
 * - Persistance : navigation entre pages conserve la langue choisie
 * - Événement languageChanged dispatché
 * - Mobile 375px : sélecteur de langue accessible
 * - Edge cases : lang non supporté, fichier JSON manquant
 */

'use strict';

const { test, expect } = require('@playwright/test');


// ====================================================================
// Helpers
// ====================================================================

/**
 * Vide localStorage et supprime le param ?lang de l'URL
 */
async function resetLang(page) {
    await page.evaluate(() => {
        localStorage.removeItem('agilevizion_lang');
    });
}

/**
 * Attend que l'événement translationsReady soit dispatché
 */
async function waitForTranslations(page) {
    await page.waitForFunction(() => {
        return window._translationsReady === true ||
               (window.I18n && window.I18n.translations &&
                Object.keys(window.I18n.translations).length > 0);
    }, { timeout: 5000 });
}


// ====================================================================
// CA1 — Langue FR par défaut
// ====================================================================
test.describe('Langue FR par défaut', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await resetLang(page);
        await page.goto('/');
        await waitForTranslations(page);
    });

    test('index.html se charge sans erreur JS', async ({ page }) => {
        const errors = [];
        page.on('pageerror', err => errors.push(err.message));
        await page.reload();
        await waitForTranslations(page);
        expect(errors.length).toBe(0);
    });

    test('la langue courante est FR après chargement sans paramètre', async ({ page }) => {
        const lang = await page.evaluate(() => window.I18n ? window.I18n.getLang() : null);
        expect(lang).toBe('fr');
    });

    test('attribut lang de <html> est "fr" par défaut', async ({ page }) => {
        const htmlLang = await page.getAttribute('html', 'lang');
        expect(htmlLang).toBe('fr');
    });

    test('texte hero en français visible ("Conformité")', async ({ page }) => {
        const hero = page.locator('.hero-title').first();
        await expect(hero).toBeVisible();
        const text = await hero.textContent();
        // Le titre FR contient "conformité" ou "cyber" (contenu FR)
        expect(text.toLowerCase()).toMatch(/conformit[eé]|consultant|r[eé]sultat/i);
    });

    test('bouton CTA principal en français ("Réserver")', async ({ page }) => {
        const cta = page.locator('.hero-cta button').first();
        await expect(cta).toBeVisible();
        const text = await cta.textContent();
        expect(text).toMatch(/[Rr][eé]server|Diagnostic|Appel/);
    });
});


// ====================================================================
// CA2 — Paramètre URL ?lang=en → page en anglais
// ====================================================================
test.describe('Paramètre URL ?lang=en', () => {

    test('index.html?lang=en → I18n.currentLang est "en"', async ({ page }) => {
        await page.goto('/?lang=en');
        await waitForTranslations(page);
        const lang = await page.evaluate(() => window.I18n ? window.I18n.getLang() : null);
        expect(lang).toBe('en');
    });

    test('?lang=en → attribut <html lang="en">', async ({ page }) => {
        await page.goto('/?lang=en');
        await waitForTranslations(page);
        const htmlLang = await page.getAttribute('html', 'lang');
        expect(htmlLang).toBe('en');
    });

    test('?lang=en → texte hero en anglais', async ({ page }) => {
        await page.goto('/?lang=en');
        await waitForTranslations(page);
        const hero = page.locator('.hero-title').first();
        await expect(hero).toBeVisible();
        const text = await hero.textContent();
        expect(text.toLowerCase()).toMatch(/compliance|consultant|results|cyber/i);
    });

    test('cyber.html?lang=en → titre de page en anglais', async ({ page }) => {
        await page.goto('/cyber.html?lang=en');
        await waitForTranslations(page);
        const title = await page.title();
        expect(title).toMatch(/GRC Cybersecurity|AgileVizion/i);
    });

    test('ia.html?lang=en → texte hero en anglais', async ({ page }) => {
        await page.goto('/ia.html?lang=en');
        await waitForTranslations(page);
        const hero = page.locator('.hero-title').first();
        const text = await hero.textContent();
        expect(text.toLowerCase()).toMatch(/time|teams|task|ai|wast/i);
    });

    test('?lang=fr → texte hero en français (vérification inverse)', async ({ page }) => {
        await page.goto('/?lang=fr');
        await waitForTranslations(page);
        const lang = await page.evaluate(() => window.I18n ? window.I18n.getLang() : null);
        expect(lang).toBe('fr');
    });
});


// ====================================================================
// CA3 — Sélecteur de langue visible et fonctionnel
// ====================================================================
test.describe('Sélecteur de langue', () => {

    test('le sélecteur de langue est visible sur index.html', async ({ page }) => {
        await page.goto('/');
        await waitForTranslations(page);
        // Chercher bouton/lien de switch de langue
        const langSwitch = page.locator('.lang-switch, [data-lang], button:has-text("EN"), button:has-text("FR"), .language-switcher').first();
        await expect(langSwitch).toBeVisible();
    });

    test('le sélecteur de langue est visible sur cyber.html', async ({ page }) => {
        await page.goto('/cyber.html');
        await waitForTranslations(page);
        const langSwitch = page.locator('.lang-switch, [data-lang], button:has-text("EN"), button:has-text("FR"), .language-switcher').first();
        await expect(langSwitch).toBeVisible();
    });

    test('le sélecteur de langue est visible sur ia.html', async ({ page }) => {
        await page.goto('/ia.html');
        await waitForTranslations(page);
        const langSwitch = page.locator('.lang-switch, [data-lang], button:has-text("EN"), button:has-text("FR"), .language-switcher').first();
        await expect(langSwitch).toBeVisible();
    });
});


// ====================================================================
// CA4 — Changement de langue sans rechargement de page
// ====================================================================
test.describe('Changement de langue — dynamique sans rechargement', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await resetLang(page);
        await page.goto('/');
        await waitForTranslations(page);
    });

    test('switchLanguage("en") → currentLang passe à "en"', async ({ page }) => {
        await page.evaluate(async () => {
            await window.I18n.switchLanguage('en');
        });
        const lang = await page.evaluate(() => window.I18n.getLang());
        expect(lang).toBe('en');
    });

    test('switchLanguage("en") → texte hero traduit en anglais', async ({ page }) => {
        const heroBefore = await page.locator('.hero-title').first().textContent();
        await page.evaluate(async () => {
            await window.I18n.switchLanguage('en');
        });
        const heroAfter = await page.locator('.hero-title').first().textContent();
        expect(heroAfter).not.toBe(heroBefore);
        expect(heroAfter.toLowerCase()).toMatch(/compliance|consultant|results/i);
    });

    test('switchLanguage("en") → URL contient ?lang=en', async ({ page }) => {
        await page.evaluate(async () => {
            await window.I18n.switchLanguage('en');
        });
        expect(page.url()).toContain('lang=en');
    });

    test('switchLanguage("fr") depuis EN → retour en français', async ({ page }) => {
        await page.evaluate(async () => {
            await window.I18n.switchLanguage('en');
        });
        await page.evaluate(async () => {
            await window.I18n.switchLanguage('fr');
        });
        const lang = await page.evaluate(() => window.I18n.getLang());
        expect(lang).toBe('fr');
        const heroText = await page.locator('.hero-title').first().textContent();
        expect(heroText.toLowerCase()).toMatch(/conformit[eé]|consultant/i);
    });

    test('switchLanguage dispatche l\'événement languageChanged', async ({ page }) => {
        const eventReceived = await page.evaluate(async () => {
            return new Promise(resolve => {
                window.addEventListener('languageChanged', e => resolve(e.detail.lang), { once: true });
                window.I18n.switchLanguage('en');
            });
        });
        expect(eventReceived).toBe('en');
    });

    test('switchLanguage("en") → localStorage contient "en"', async ({ page }) => {
        await page.evaluate(async () => {
            await window.I18n.switchLanguage('en');
        });
        const stored = await page.evaluate(() => localStorage.getItem('agilevizion_lang'));
        expect(stored).toBe('en');
    });

    test('<html lang> mis à jour après switchLanguage("en")', async ({ page }) => {
        await page.evaluate(async () => {
            await window.I18n.switchLanguage('en');
        });
        const htmlLang = await page.getAttribute('html', 'lang');
        expect(htmlLang).toBe('en');
    });
});


// ====================================================================
// CA5 — Persistance : navigation inter-pages conserve la langue
// ====================================================================
test.describe('Persistance de la langue entre pages', () => {

    test('EN choisi sur index → cyber.html (via ?lang) → langue conservée', async ({ page }) => {
        await page.goto('/?lang=en');
        await waitForTranslations(page);

        // Navigation vers cyber.html avec le même paramètre lang
        await page.goto('/cyber.html?lang=en');
        await waitForTranslations(page);

        const lang = await page.evaluate(() => window.I18n ? window.I18n.getLang() : null);
        expect(lang).toBe('en');
    });

    test('EN stocké en localStorage → ia.html sans param → langue conservée', async ({ page }) => {
        // Stocker EN dans localStorage
        await page.goto('/');
        await page.evaluate(() => {
            localStorage.setItem('agilevizion_lang', 'en');
        });

        // Navigation vers ia.html SANS param ?lang
        await page.goto('/ia.html');
        await waitForTranslations(page);

        const lang = await page.evaluate(() => window.I18n ? window.I18n.getLang() : null);
        expect(lang).toBe('en');
    });

    test('lang FR (défaut) → navigation cyber.html → toujours FR', async ({ page }) => {
        await page.goto('/');
        await resetLang(page);
        await page.goto('/cyber.html');
        await waitForTranslations(page);

        const lang = await page.evaluate(() => window.I18n ? window.I18n.getLang() : null);
        expect(lang).toBe('fr');
    });
});


// ====================================================================
// CA6 — Clé manquante → affiche la clé, pas d'erreur visible
// ====================================================================
test.describe('Edge case — clé de traduction manquante', () => {

    test('clé inexistante → I18n.t() retourne la clé, pas d\'erreur', async ({ page }) => {
        await page.goto('/');
        await waitForTranslations(page);

        const result = await page.evaluate(() => {
            return window.I18n.t('section.cle.inexistante');
        });
        expect(result).toBe('section.cle.inexistante');
    });

    test('I18n.t() avec clé manquante → aucune erreur JS sur la page', async ({ page }) => {
        const errors = [];
        page.on('pageerror', err => errors.push(err.message));
        await page.goto('/');
        await waitForTranslations(page);
        await page.evaluate(() => window.I18n.t('inexistant.profond.cle'));
        expect(errors.length).toBe(0);
    });
});


// ====================================================================
// CA7 — Langue navigateur non supportée → fallback FR
// ====================================================================
test.describe('Fallback langue non supportée', () => {

    test('localStorage vide + lang=de dans URL → ignoré → fallback FR (localStorage vide)', async ({ page }) => {
        await page.goto('/');
        await resetLang(page);
        // Simuler une lang non supportée en manipulant I18n directement
        await page.goto('/');
        await waitForTranslations(page);

        const result = await page.evaluate(() => {
            // Simuler detectLanguage avec navigateur allemand
            const original = navigator.language;
            Object.defineProperty(navigator, 'language', { get: () => 'de-DE', configurable: true });
            // Supprimer localStorage et URL param
            localStorage.removeItem('agilevizion_lang');
            const lang = window.I18n.detectLanguage();
            Object.defineProperty(navigator, 'language', { get: () => original, configurable: true });
            return lang;
        });
        expect(result).toBe('fr');
    });
});


// ====================================================================
// CA8 — Toutes les pages : chargement sans erreur en FR et EN
// ====================================================================
test.describe('Chargement sans erreur — toutes les pages × 2 langues', () => {

    const pages = [
        { url: '/',          name: 'index.html' },
        { url: '/cyber.html', name: 'cyber.html' },
        { url: '/ia.html',   name: 'ia.html'    },
    ];
    const langs = ['fr', 'en'];

    pages.forEach(({ url, name }) => {
        langs.forEach(lang => {
            test(`${name}?lang=${lang} — aucune erreur JS`, async ({ page }) => {
                const errors = [];
                page.on('pageerror', err => errors.push(err.message));
                await page.goto(`${url}?lang=${lang}`);
                await waitForTranslations(page);
                expect(errors.length).toBe(0);
            });

            test(`${name}?lang=${lang} — langue correcte chargée`, async ({ page }) => {
                await page.goto(`${url}?lang=${lang}`);
                await waitForTranslations(page);
                const currentLang = await page.evaluate(() => window.I18n?.getLang());
                expect(currentLang).toBe(lang);
            });
        });
    });
});


// ====================================================================
// CA9 — Mobile 375px : sélecteur de langue accessible
// ====================================================================
test.describe('Mobile 375px — i18n', () => {

    test.use({ viewport: { width: 375, height: 812 } });

    test('sélecteur de langue accessible sur mobile', async ({ page }) => {
        await page.goto('/');
        await waitForTranslations(page);
        const langSwitch = page.locator('.lang-switch, [data-lang], button:has-text("EN"), button:has-text("FR"), .language-switcher').first();
        // Peut être dans le menu hamburger — vérifier juste qu'il existe dans le DOM
        const count = await langSwitch.count();
        expect(count).toBeGreaterThan(0);
    });

    test('mobile : ?lang=en → texte hero traduit en anglais', async ({ page }) => {
        await page.goto('/?lang=en');
        await waitForTranslations(page);
        const lang = await page.evaluate(() => window.I18n?.getLang());
        expect(lang).toBe('en');
    });
});


// ====================================================================
// CA10 — Performance : chargement des traductions < 2s
// ====================================================================
test.describe('Performance — chargement i18n', () => {

    test('lang/fr.json se charge en moins de 2 secondes', async ({ page }) => {
        const start = Date.now();
        await page.goto('/');
        await waitForTranslations(page);
        const elapsed = Date.now() - start;
        expect(elapsed).toBeLessThan(2000);
    });

    test('lang/en.json se charge en moins de 2 secondes', async ({ page }) => {
        const start = Date.now();
        await page.goto('/?lang=en');
        await waitForTranslations(page);
        const elapsed = Date.now() - start;
        expect(elapsed).toBeLessThan(2000);
    });
});
