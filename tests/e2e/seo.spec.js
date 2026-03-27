/**
 * Tests E2E — SEO (Story #13)
 * AgileVizion 2 — Playwright
 *
 * Couvre (dans le navigateur) :
 * - <title> chargé et non vide sur chaque page
 * - <meta description> chargée
 * - Open Graph meta tags accessibles dans le DOM
 * - JSON-LD parsable dans le DOM
 * - Balises HTML5 sémantiques présentes (header, nav, main, section, footer, article)
 * - lang="fr" sur <html>
 * - sitemap.xml accessible et contenant les 3 URLs
 * - Lien canonical présent
 * - Pas de duplication de titre entre pages
 */

const { test, expect } = require('@playwright/test');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function getMetaContent(page, name) {
    return page.$eval(
        `meta[name="${name}"]`,
        el => el.getAttribute('content')
    ).catch(() => null);
}

async function getOGContent(page, property) {
    return page.$eval(
        `meta[property="og:${property}"]`,
        el => el.getAttribute('content')
    ).catch(() => null);
}

async function getTwitterContent(page, name) {
    return page.$eval(
        `meta[name="twitter:${name}"]`,
        el => el.getAttribute('content')
    ).catch(() => null);
}

async function getJsonLdTypes(page) {
    return page.$$eval('script[type="application/ld+json"]', scripts => {
        const types = [];
        scripts.forEach(s => {
            try {
                const data = JSON.parse(s.textContent);
                const nodes = data['@graph'] || [data];
                nodes.forEach(n => { if (n['@type']) types.push(n['@type']); });
            } catch (e) { /* ignore */ }
        });
        return types;
    });
}


// ============================================================================
// PAGE : index.html (Landing)
// ============================================================================

test.describe('SEO — index.html (Landing)', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('title non vide et ≤ 60 chars', async ({ page }) => {
        const title = await page.title();
        expect(title.trim().length).toBeGreaterThan(5);
        expect(title.trim().length).toBeLessThanOrEqual(60);
    });

    test('title mentionne AgileVizion', async ({ page }) => {
        const title = await page.title();
        expect(title).toMatch(/AgileVizion/i);
    });

    test('meta description présente et ≤ 160 chars', async ({ page }) => {
        const desc = await getMetaContent(page, 'description');
        expect(desc).toBeTruthy();
        expect(desc.length).toBeLessThanOrEqual(160);
        expect(desc.length).toBeGreaterThanOrEqual(50);
    });

    test('og:title présent', async ({ page }) => {
        expect(await getOGContent(page, 'title')).toBeTruthy();
    });

    test('og:description présent', async ({ page }) => {
        expect(await getOGContent(page, 'description')).toBeTruthy();
    });

    test('og:type = website', async ({ page }) => {
        expect(await getOGContent(page, 'type')).toBe('website');
    });

    test('og:url contient agilevizion.com', async ({ page }) => {
        const url = await getOGContent(page, 'url');
        expect(url).toMatch(/agilevizion\.com/);
    });

    test('og:image présent (logo fallback)', async ({ page }) => {
        const img = await getOGContent(page, 'image');
        expect(img).toBeTruthy();
        expect(img).toMatch(/https/);
    });

    test('twitter:card = summary_large_image', async ({ page }) => {
        expect(await getTwitterContent(page, 'card')).toBe('summary_large_image');
    });

    test('twitter:title présent', async ({ page }) => {
        expect(await getTwitterContent(page, 'title')).toBeTruthy();
    });

    test('twitter:description présent', async ({ page }) => {
        expect(await getTwitterContent(page, 'description')).toBeTruthy();
    });

    test('JSON-LD : Organization + Service présents', async ({ page }) => {
        const types = await getJsonLdTypes(page);
        expect(types).toContain('Organization');
        expect(types).toContain('Service');
    });

    test('HTML5 : <header> présent', async ({ page }) => {
        expect(await page.$('header')).not.toBeNull();
    });

    test('HTML5 : <nav> présent', async ({ page }) => {
        expect(await page.$('nav')).not.toBeNull();
    });

    test('HTML5 : <main> présent', async ({ page }) => {
        expect(await page.$('main')).not.toBeNull();
    });

    test('HTML5 : au moins 3 <section>', async ({ page }) => {
        const sections = await page.$$('section');
        expect(sections.length).toBeGreaterThanOrEqual(3);
    });

    test('HTML5 : <footer> présent', async ({ page }) => {
        expect(await page.$('footer')).not.toBeNull();
    });

    test('HTML5 : au moins 1 <article>', async ({ page }) => {
        const articles = await page.$$('article');
        expect(articles.length).toBeGreaterThanOrEqual(1);
    });

    test('lang="fr" sur <html>', async ({ page }) => {
        const lang = await page.$eval('html', el => el.getAttribute('lang'));
        expect(lang).toBe('fr');
    });

    test('link rel="canonical" présent', async ({ page }) => {
        const canonical = await page.$('link[rel="canonical"]');
        expect(canonical).not.toBeNull();
    });
});


// ============================================================================
// PAGE : cyber.html
// ============================================================================

test.describe('SEO — cyber.html', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/cyber.html');
    });

    test('title non vide, ≤ 60 chars, mentionne GRC ou Cyber', async ({ page }) => {
        const title = await page.title();
        expect(title.trim().length).toBeGreaterThan(5);
        expect(title.trim().length).toBeLessThanOrEqual(60);
        expect(title).toMatch(/GRC|Cyber/i);
    });

    test('meta description présente, ≤ 160 chars, mentionne audit ou conformité', async ({ page }) => {
        const desc = await getMetaContent(page, 'description');
        expect(desc).toBeTruthy();
        expect(desc.length).toBeLessThanOrEqual(160);
        expect(desc).toMatch(/audit|conformit[eé]|DORA|NIS|ISO/i);
    });

    test('og:title présent et différent de l\'index', async ({ page, context }) => {
        const titleCyber = await getOGContent(page, 'title');

        const indexPage = await context.newPage();
        await indexPage.goto('/');
        const titleIndex = await getOGContent(indexPage, 'title');
        await indexPage.close();

        expect(titleCyber).toBeTruthy();
        expect(titleCyber).not.toBe(titleIndex);
    });

    test('og:type = website', async ({ page }) => {
        expect(await getOGContent(page, 'type')).toBe('website');
    });

    test('og:url pointe vers cyber.html', async ({ page }) => {
        const url = await getOGContent(page, 'url');
        expect(url).toMatch(/cyber\.html/);
    });

    test('og:image présent', async ({ page }) => {
        expect(await getOGContent(page, 'image')).toBeTruthy();
    });

    test('twitter:card = summary_large_image', async ({ page }) => {
        expect(await getTwitterContent(page, 'card')).toBe('summary_large_image');
    });

    test('JSON-LD : Organization + Service GRC présents', async ({ page }) => {
        const types = await getJsonLdTypes(page);
        expect(types).toContain('Organization');
        expect(types).toContain('Service');
    });

    test('HTML5 : <article> présent (au moins 1)', async ({ page }) => {
        const articles = await page.$$('article');
        expect(articles.length).toBeGreaterThanOrEqual(1);
    });

    test('HTML5 : toutes les balises sémantiques présentes', async ({ page }) => {
        for (const tag of ['header', 'nav', 'main', 'footer']) {
            expect(await page.$(tag), `${tag} absent`).not.toBeNull();
        }
    });

    test('lang="fr" sur <html>', async ({ page }) => {
        const lang = await page.$eval('html', el => el.getAttribute('lang'));
        expect(lang).toBe('fr');
    });
});


// ============================================================================
// PAGE : ia.html
// ============================================================================

test.describe('SEO — ia.html', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/ia.html');
    });

    test('title non vide, ≤ 60 chars, mentionne IA ou Agentique', async ({ page }) => {
        const title = await page.title();
        expect(title.trim().length).toBeGreaterThan(5);
        expect(title.trim().length).toBeLessThanOrEqual(60);
        expect(title).toMatch(/IA|Agentique/i);
    });

    test('meta description présente, ≤ 160 chars', async ({ page }) => {
        const desc = await getMetaContent(page, 'description');
        expect(desc).toBeTruthy();
        expect(desc.length).toBeLessThanOrEqual(160);
        expect(desc.length).toBeGreaterThanOrEqual(50);
    });

    test('og:url pointe vers ia.html', async ({ page }) => {
        const url = await getOGContent(page, 'url');
        expect(url).toMatch(/ia\.html/);
    });

    test('og:type = website', async ({ page }) => {
        expect(await getOGContent(page, 'type')).toBe('website');
    });

    test('og:image présent', async ({ page }) => {
        expect(await getOGContent(page, 'image')).toBeTruthy();
    });

    test('twitter:card = summary_large_image', async ({ page }) => {
        expect(await getTwitterContent(page, 'card')).toBe('summary_large_image');
    });

    test('JSON-LD : Organization + Service IA présents', async ({ page }) => {
        const types = await getJsonLdTypes(page);
        expect(types).toContain('Organization');
        expect(types).toContain('Service');
    });

    test('HTML5 : <article> présent (au moins 1)', async ({ page }) => {
        const articles = await page.$$('article');
        expect(articles.length).toBeGreaterThanOrEqual(1);
    });

    test('HTML5 : toutes les balises sémantiques présentes', async ({ page }) => {
        for (const tag of ['header', 'nav', 'main', 'footer']) {
            expect(await page.$(tag), `${tag} absent`).not.toBeNull();
        }
    });

    test('lang="fr" sur <html>', async ({ page }) => {
        const lang = await page.$eval('html', el => el.getAttribute('lang'));
        expect(lang).toBe('fr');
    });
});


// ============================================================================
// sitemap.xml
// ============================================================================

test.describe('sitemap.xml — accessibilité', () => {

    test('sitemap.xml accessible en HTTP 200', async ({ page }) => {
        const response = await page.goto('/sitemap.xml');
        expect(response.status()).toBe(200);
    });

    test('sitemap.xml contient les 3 URLs', async ({ page }) => {
        await page.goto('/sitemap.xml');
        const content = await page.content();
        expect(content).toMatch(/agilevizion\.com/);
        expect(content).toContain('cyber.html');
        expect(content).toContain('ia.html');
    });
});


// ============================================================================
// Cross-page : pas de contenu dupliqué
// ============================================================================

test.describe('Cross-page — pas de duplication SEO', () => {

    test('les 3 titles sont différents', async ({ browser }) => {
        const ctx = await browser.newContext();
        const [p1, p2, p3] = await Promise.all([
            ctx.newPage(), ctx.newPage(), ctx.newPage(),
        ]);
        await Promise.all([p1.goto('/'), p2.goto('/cyber.html'), p3.goto('/ia.html')]);
        const titles = await Promise.all([p1.title(), p2.title(), p3.title()]);
        await ctx.close();
        expect(new Set(titles).size).toBe(3);
    });

    test('les 3 og:url sont différents', async ({ browser }) => {
        const ctx = await browser.newContext();
        const [p1, p2, p3] = await Promise.all([
            ctx.newPage(), ctx.newPage(), ctx.newPage(),
        ]);
        await Promise.all([p1.goto('/'), p2.goto('/cyber.html'), p3.goto('/ia.html')]);
        const urls = await Promise.all([
            getOGContent(p1, 'url'),
            getOGContent(p2, 'url'),
            getOGContent(p3, 'url'),
        ]);
        await ctx.close();
        expect(new Set(urls).size).toBe(3);
    });
});


// ============================================================================
// Edge case : changement de langue EN → meta tags restent FR (MVP)
// ============================================================================

test.describe('Edge case — langue EN : meta tags OG/Twitter restent FR (MVP)', () => {

    test('index.html : après switch EN, le <title> est mis à jour par i18n', async ({ page }) => {
        await page.goto('/');
        const titleBefore = await page.title();

        // Cliquer sur le bouton EN
        await page.click('#lang-en');
        await page.waitForTimeout(500);

        const titleAfter = await page.title();
        // Le title est géré par data-page-title + i18n → il change avec la langue
        expect(titleAfter).not.toBe(titleBefore);
    });

    test('index.html : après switch EN, og:title reste inchangé (static, non traduit)', async ({ page }) => {
        await page.goto('/');
        const ogBefore = await getOGContent(page, 'title');

        await page.click('#lang-en');
        await page.waitForTimeout(500);

        const ogAfter = await getOGContent(page, 'title');
        // og:title est statique — pas de data-i18n → ne change pas avec i18n
        expect(ogAfter).toBe(ogBefore);
    });
});
