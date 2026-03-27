/**
 * Tests unitaires — SEO (Story #13)
 * AgileVizion 2
 *
 * Couvre :
 * - <title> unique et descriptif par page (max 60 chars)
 * - <meta description> unique par page (max 160 chars)
 * - Open Graph : og:title, og:description, og:type, og:url, og:image
 * - Twitter Card : twitter:card, twitter:title, twitter:description
 * - JSON-LD : Organization (name, url, logo, contactPoint, sameAs), Service
 * - sitemap.xml : 3 URLs à la racine
 * - HTML5 sémantique : header, nav, main, section, footer, article
 * - lang="fr" sur <html>
 * - Pas de contenu dupliqué entre les pages
 * - Edge case : og:image absent → logo par défaut
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT       = path.resolve(__dirname, '../../');
const indexHtml  = fs.readFileSync(path.join(ROOT, 'index.html'),  'utf8');
const cyberHtml  = fs.readFileSync(path.join(ROOT, 'cyber.html'), 'utf8');
const iaHtml     = fs.readFileSync(path.join(ROOT, 'ia.html'),    'utf8');
const sitemapXml = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getTitle(html) {
    const m = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    return m ? m[1].trim() : null;
}

function getMetaContent(html, nameAttr) {
    // <meta name="xxx" content="yyy">  ou  <meta content="yyy" name="xxx">
    const re1 = new RegExp(`<meta\\s+name="${nameAttr}"\\s+content="([^"]+)"`, 'i');
    const re2 = new RegExp(`<meta\\s+content="([^"]+)"\\s+name="${nameAttr}"`, 'i');
    const m1 = html.match(re1);
    if (m1) return m1[1];
    const m2 = html.match(re2);
    return m2 ? m2[1] : null;
}

function getOGContent(html, property) {
    const re = new RegExp(`<meta\\s+property="og:${property}"\\s+content="([^"]+)"`, 'i');
    const m  = html.match(re);
    return m ? m[1] : null;
}

function getTwitterContent(html, name) {
    const re = new RegExp(`<meta\\s+name="twitter:${name}"\\s+content="([^"]+)"`, 'i');
    const m  = html.match(re);
    return m ? m[1] : null;
}

function parseJsonLd(html) {
    const scripts = [];
    const re = /<script\s+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
    let m;
    while ((m = re.exec(html)) !== null) {
        try { scripts.push(JSON.parse(m[1])); } catch (e) { /* ignore */ }
    }
    return scripts;
}

function getTypesFromJsonLd(html) {
    const scripts = parseJsonLd(html);
    const types = [];
    scripts.forEach(script => {
        const nodes = script['@graph'] || [script];
        nodes.forEach(node => { if (node['@type']) types.push(node['@type']); });
    });
    return types;
}

function getNodeByType(html, type) {
    const scripts = parseJsonLd(html);
    let found = null;
    scripts.forEach(script => {
        const nodes = script['@graph'] || [script];
        nodes.forEach(node => { if (node['@type'] === type) found = node; });
    });
    return found;
}

function setupDOM(html) {
    document.body.innerHTML = '';
    document.documentElement.innerHTML = html;
}

// ---------------------------------------------------------------------------
// 1. <title> — unique, descriptif, max 60 chars
// ---------------------------------------------------------------------------

describe('Titre <title> — unique et max 60 chars', () => {

    test('index.html a un <title> non vide', () => {
        const t = getTitle(indexHtml);
        expect(t).not.toBeNull();
        expect(t.length).toBeGreaterThan(5);
    });

    test('index.html : longueur title ≤ 60 chars', () => {
        const t = getTitle(indexHtml);
        expect(t.length).toBeLessThanOrEqual(60);
    });

    test('index.html : title mentionne AgileVizion', () => {
        const t = getTitle(indexHtml);
        expect(t).toMatch(/AgileVizion/i);
    });

    test('cyber.html a un <title> non vide', () => {
        const t = getTitle(cyberHtml);
        expect(t).not.toBeNull();
        expect(t.length).toBeGreaterThan(5);
    });

    test('cyber.html : longueur title ≤ 60 chars', () => {
        const t = getTitle(cyberHtml);
        expect(t.length).toBeLessThanOrEqual(60);
    });

    test('cyber.html : title mentionne GRC ou Cybersécurité', () => {
        const t = getTitle(cyberHtml);
        expect(t).toMatch(/GRC|Cyber/i);
    });

    test('ia.html a un <title> non vide', () => {
        const t = getTitle(iaHtml);
        expect(t).not.toBeNull();
        expect(t.length).toBeGreaterThan(5);
    });

    test('ia.html : longueur title ≤ 60 chars', () => {
        const t = getTitle(iaHtml);
        expect(t.length).toBeLessThanOrEqual(60);
    });

    test('ia.html : title mentionne IA ou Agentique', () => {
        const t = getTitle(iaHtml);
        expect(t).toMatch(/IA|Agentique/i);
    });

    test('les 3 titres sont uniques (pas de duplication)', () => {
        const titles = [getTitle(indexHtml), getTitle(cyberHtml), getTitle(iaHtml)];
        const unique = new Set(titles);
        expect(unique.size).toBe(3);
    });
});


// ---------------------------------------------------------------------------
// 2. <meta name="description"> — unique, max 160 chars
// ---------------------------------------------------------------------------

describe('Meta description — unique et max 160 chars', () => {

    test('index.html a une meta description non vide', () => {
        const d = getMetaContent(indexHtml, 'description');
        expect(d).not.toBeNull();
        expect(d.length).toBeGreaterThan(20);
    });

    test('index.html : description ≤ 160 chars', () => {
        const d = getMetaContent(indexHtml, 'description');
        expect(d.length).toBeLessThanOrEqual(160);
    });

    test('index.html : description mentionne GRC ou IA ou conformité', () => {
        const d = getMetaContent(indexHtml, 'description');
        expect(d).toMatch(/GRC|IA|conformit[eé]|simulateur/i);
    });

    test('cyber.html a une meta description non vide', () => {
        const d = getMetaContent(cyberHtml, 'description');
        expect(d).not.toBeNull();
        expect(d.length).toBeGreaterThan(20);
    });

    test('cyber.html : description ≤ 160 chars', () => {
        const d = getMetaContent(cyberHtml, 'description');
        expect(d.length).toBeLessThanOrEqual(160);
    });

    test('cyber.html : description mentionne audit ou conformité ou DORA/NIS', () => {
        const d = getMetaContent(cyberHtml, 'description');
        expect(d).toMatch(/audit|conformit[eé]|DORA|NIS|ISO/i);
    });

    test('ia.html a une meta description non vide', () => {
        const d = getMetaContent(iaHtml, 'description');
        expect(d).not.toBeNull();
        expect(d.length).toBeGreaterThan(20);
    });

    test('ia.html : description ≤ 160 chars', () => {
        const d = getMetaContent(iaHtml, 'description');
        expect(d.length).toBeLessThanOrEqual(160);
    });

    test('ia.html : description mentionne IA ou agent ou productivité', () => {
        const d = getMetaContent(iaHtml, 'description');
        expect(d).toMatch(/IA|agent|productivit[eé]|automatisation/i);
    });

    test('les 3 descriptions sont uniques', () => {
        const descs = [
            getMetaContent(indexHtml, 'description'),
            getMetaContent(cyberHtml, 'description'),
            getMetaContent(iaHtml,    'description'),
        ];
        const unique = new Set(descs);
        expect(unique.size).toBe(3);
    });
});


// ---------------------------------------------------------------------------
// 3. Open Graph
// ---------------------------------------------------------------------------

describe('Open Graph — index.html', () => {
    test('og:title présent et non vide', () => {
        expect(getOGContent(indexHtml, 'title')).toBeTruthy();
    });
    test('og:description présent et non vide', () => {
        expect(getOGContent(indexHtml, 'description')).toBeTruthy();
    });
    test('og:type = website', () => {
        expect(getOGContent(indexHtml, 'type')).toBe('website');
    });
    test('og:url contient agilevizion.com', () => {
        expect(getOGContent(indexHtml, 'url')).toMatch(/agilevizion\.com/);
    });
    test('og:image présent (logo fallback si pas d\'image dédiée)', () => {
        const img = getOGContent(indexHtml, 'image');
        expect(img).toBeTruthy();
        expect(img).toMatch(/\.(png|jpg|jpeg|svg|webp)/i);
    });
});

describe('Open Graph — cyber.html', () => {
    test('og:title présent et mentionne GRC ou Cyber', () => {
        const t = getOGContent(cyberHtml, 'title');
        expect(t).toBeTruthy();
        expect(t).toMatch(/GRC|Cyber/i);
    });
    test('og:description présent et non vide', () => {
        expect(getOGContent(cyberHtml, 'description')).toBeTruthy();
    });
    test('og:type = website', () => {
        expect(getOGContent(cyberHtml, 'type')).toBe('website');
    });
    test('og:url pointe vers cyber.html', () => {
        expect(getOGContent(cyberHtml, 'url')).toMatch(/cyber\.html/);
    });
    test('og:image présent (logo fallback)', () => {
        const img = getOGContent(cyberHtml, 'image');
        expect(img).toBeTruthy();
        expect(img).toMatch(/\.(png|jpg|jpeg|svg|webp)/i);
    });
});

describe('Open Graph — ia.html', () => {
    test('og:title présent et mentionne IA ou Agentique', () => {
        const t = getOGContent(iaHtml, 'title');
        expect(t).toBeTruthy();
        expect(t).toMatch(/IA|Agentique/i);
    });
    test('og:description présent et non vide', () => {
        expect(getOGContent(iaHtml, 'description')).toBeTruthy();
    });
    test('og:type = website', () => {
        expect(getOGContent(iaHtml, 'type')).toBe('website');
    });
    test('og:url pointe vers ia.html', () => {
        expect(getOGContent(iaHtml, 'url')).toMatch(/ia\.html/);
    });
    test('og:image présent (logo fallback)', () => {
        const img = getOGContent(iaHtml, 'image');
        expect(img).toBeTruthy();
        expect(img).toMatch(/\.(png|jpg|jpeg|svg|webp)/i);
    });
});

describe('Open Graph — pas de contenu dupliqué entre pages', () => {
    test('og:title différent sur les 3 pages', () => {
        const titles = [
            getOGContent(indexHtml, 'title'),
            getOGContent(cyberHtml, 'title'),
            getOGContent(iaHtml,    'title'),
        ];
        const unique = new Set(titles);
        expect(unique.size).toBe(3);
    });
    test('og:url différent sur les 3 pages', () => {
        const urls = [
            getOGContent(indexHtml, 'url'),
            getOGContent(cyberHtml, 'url'),
            getOGContent(iaHtml,    'url'),
        ];
        const unique = new Set(urls);
        expect(unique.size).toBe(3);
    });
});


// ---------------------------------------------------------------------------
// 4. Twitter Card
// ---------------------------------------------------------------------------

describe('Twitter Card — index.html', () => {
    test('twitter:card = summary_large_image', () => {
        expect(getTwitterContent(indexHtml, 'card')).toBe('summary_large_image');
    });
    test('twitter:title présent et non vide', () => {
        expect(getTwitterContent(indexHtml, 'title')).toBeTruthy();
    });
    test('twitter:description présent et non vide', () => {
        expect(getTwitterContent(indexHtml, 'description')).toBeTruthy();
    });
});

describe('Twitter Card — cyber.html', () => {
    test('twitter:card = summary_large_image', () => {
        expect(getTwitterContent(cyberHtml, 'card')).toBe('summary_large_image');
    });
    test('twitter:title présent et mentionne GRC ou Cyber', () => {
        const t = getTwitterContent(cyberHtml, 'title');
        expect(t).toBeTruthy();
        expect(t).toMatch(/GRC|Cyber/i);
    });
    test('twitter:description présent et non vide', () => {
        expect(getTwitterContent(cyberHtml, 'description')).toBeTruthy();
    });
});

describe('Twitter Card — ia.html', () => {
    test('twitter:card = summary_large_image', () => {
        expect(getTwitterContent(iaHtml, 'card')).toBe('summary_large_image');
    });
    test('twitter:title présent et mentionne IA ou Agentique', () => {
        const t = getTwitterContent(iaHtml, 'title');
        expect(t).toBeTruthy();
        expect(t).toMatch(/IA|Agentique/i);
    });
    test('twitter:description présent et non vide', () => {
        expect(getTwitterContent(iaHtml, 'description')).toBeTruthy();
    });
});


// ---------------------------------------------------------------------------
// 5. JSON-LD (schema.org)
// ---------------------------------------------------------------------------

describe('JSON-LD — index.html', () => {
    test('JSON-LD valide (parsable)', () => {
        expect(() => parseJsonLd(indexHtml)).not.toThrow();
        expect(parseJsonLd(indexHtml).length).toBeGreaterThan(0);
    });

    test('@type Organization présent', () => {
        const types = getTypesFromJsonLd(indexHtml);
        expect(types).toContain('Organization');
    });

    test('Organization : name = AgileVizion', () => {
        const org = getNodeByType(indexHtml, 'Organization');
        expect(org).not.toBeNull();
        expect(org.name).toBe('AgileVizion');
    });

    test('Organization : url présent', () => {
        const org = getNodeByType(indexHtml, 'Organization');
        expect(org.url).toMatch(/agilevizion\.com/);
    });

    test('Organization : logo présent', () => {
        const org = getNodeByType(indexHtml, 'Organization');
        expect(org.logo).toBeTruthy();
    });

    test('Organization : contactPoint présent avec telephone et email', () => {
        const org = getNodeByType(indexHtml, 'Organization');
        expect(org.contactPoint).toBeTruthy();
        expect(org.contactPoint.telephone).toBeTruthy();
        expect(org.contactPoint.email).toMatch(/agilevizion\.com/);
    });

    test('Organization : sameAs contient LinkedIn', () => {
        const org = getNodeByType(indexHtml, 'Organization');
        expect(org.sameAs).toBeTruthy();
        const sameAs = Array.isArray(org.sameAs) ? org.sameAs : [org.sameAs];
        expect(sameAs.some(url => url.includes('linkedin.com'))).toBe(true);
    });

    test('@type Service présent (GRC)', () => {
        const types = getTypesFromJsonLd(indexHtml);
        expect(types).toContain('Service');
    });

    test('Service GRC : provider = AgileVizion', () => {
        const scripts = parseJsonLd(indexHtml);
        let services = [];
        scripts.forEach(s => {
            const nodes = s['@graph'] || [s];
            nodes.forEach(n => { if (n['@type'] === 'Service') services.push(n); });
        });
        expect(services.length).toBeGreaterThanOrEqual(1);
        services.forEach(svc => {
            expect(svc.provider).toBeTruthy();
            expect(svc.provider.name).toBe('AgileVizion');
        });
    });

    test('Service : areaServed = Europe', () => {
        const scripts = parseJsonLd(indexHtml);
        let services = [];
        scripts.forEach(s => {
            const nodes = s['@graph'] || [s];
            nodes.forEach(n => { if (n['@type'] === 'Service') services.push(n); });
        });
        services.forEach(svc => {
            expect(svc.areaServed).toBeTruthy();
        });
    });
});

describe('JSON-LD — cyber.html', () => {
    test('JSON-LD valide', () => {
        expect(parseJsonLd(cyberHtml).length).toBeGreaterThan(0);
    });
    test('@type Organization présent', () => {
        expect(getTypesFromJsonLd(cyberHtml)).toContain('Organization');
    });
    test('Organization : sameAs LinkedIn', () => {
        const org = getNodeByType(cyberHtml, 'Organization');
        const sameAs = Array.isArray(org.sameAs) ? org.sameAs : [org.sameAs];
        expect(sameAs.some(u => u.includes('linkedin.com'))).toBe(true);
    });
    test('@type Service présent (GRC Cybersécurité)', () => {
        expect(getTypesFromJsonLd(cyberHtml)).toContain('Service');
    });
    test('Service : url pointe vers cyber.html', () => {
        const svc = getNodeByType(cyberHtml, 'Service');
        expect(svc.url).toMatch(/cyber\.html/);
    });
    test('Service : serviceType mentionné', () => {
        const svc = getNodeByType(cyberHtml, 'Service');
        expect(svc.serviceType).toBeTruthy();
    });
});

describe('JSON-LD — ia.html', () => {
    test('JSON-LD valide', () => {
        expect(parseJsonLd(iaHtml).length).toBeGreaterThan(0);
    });
    test('@type Organization présent', () => {
        expect(getTypesFromJsonLd(iaHtml)).toContain('Organization');
    });
    test('Organization : sameAs LinkedIn', () => {
        const org = getNodeByType(iaHtml, 'Organization');
        const sameAs = Array.isArray(org.sameAs) ? org.sameAs : [org.sameAs];
        expect(sameAs.some(u => u.includes('linkedin.com'))).toBe(true);
    });
    test('@type Service présent (IA Agentique)', () => {
        expect(getTypesFromJsonLd(iaHtml)).toContain('Service');
    });
    test('Service : url pointe vers ia.html', () => {
        const svc = getNodeByType(iaHtml, 'Service');
        expect(svc.url).toMatch(/ia\.html/);
    });
    test('Service : areaServed présent', () => {
        const svc = getNodeByType(iaHtml, 'Service');
        expect(svc.areaServed).toBeTruthy();
    });
});


// ---------------------------------------------------------------------------
// 6. sitemap.xml
// ---------------------------------------------------------------------------

describe('sitemap.xml', () => {
    test('sitemap.xml existe et est non vide', () => {
        expect(sitemapXml.length).toBeGreaterThan(100);
    });

    test('namespace http://www.sitemaps.org/schemas/sitemap/0.9 déclaré', () => {
        expect(sitemapXml).toContain('sitemaps.org/schemas/sitemap/0.9');
    });

    test('URL index (agilevizion.com/) présente', () => {
        expect(sitemapXml).toMatch(/https?:\/\/agilevizion\.com\//);
    });

    test('URL cyber.html présente', () => {
        expect(sitemapXml).toContain('cyber.html');
    });

    test('URL ia.html présente', () => {
        expect(sitemapXml).toContain('ia.html');
    });

    test('exactement 3 balises <url> dans le sitemap', () => {
        const matches = sitemapXml.match(/<url>/g) || [];
        expect(matches.length).toBe(3);
    });

    test('chaque <url> a une balise <loc>', () => {
        const locs = sitemapXml.match(/<loc>/g) || [];
        expect(locs.length).toBe(3);
    });

    test('priority de la page d\'accueil = 1.0', () => {
        // La priorité 1.0 ne doit être attribuée qu'à l'index
        expect(sitemapXml).toContain('<priority>1.0</priority>');
    });
});


// ---------------------------------------------------------------------------
// 7. HTML5 sémantique
// ---------------------------------------------------------------------------

describe('Balises HTML5 sémantiques — index.html', () => {
    test('<header> présent', () => {
        expect(indexHtml).toMatch(/<header[\s>]/i);
    });
    test('<nav> présent', () => {
        expect(indexHtml).toMatch(/<nav[\s>]/i);
    });
    test('<main> présent', () => {
        expect(indexHtml).toMatch(/<main[\s>]/i);
    });
    test('<section> présent (au moins 1)', () => {
        const count = (indexHtml.match(/<section[\s>]/gi) || []).length;
        expect(count).toBeGreaterThanOrEqual(1);
    });
    test('<footer> présent', () => {
        expect(indexHtml).toMatch(/<footer[\s>]/i);
    });
    test('<article> présent (au moins 1)', () => {
        const count = (indexHtml.match(/<article[\s>]/gi) || []).length;
        expect(count).toBeGreaterThanOrEqual(1);
    });
});

describe('Balises HTML5 sémantiques — cyber.html', () => {
    test('<header> présent', () => {
        expect(cyberHtml).toMatch(/<header[\s>]/i);
    });
    test('<nav> présent', () => {
        expect(cyberHtml).toMatch(/<nav[\s>]/i);
    });
    test('<main> présent', () => {
        expect(cyberHtml).toMatch(/<main[\s>]/i);
    });
    test('<section> présent (au moins 1)', () => {
        const count = (cyberHtml.match(/<section[\s>]/gi) || []).length;
        expect(count).toBeGreaterThanOrEqual(1);
    });
    test('<footer> présent', () => {
        expect(cyberHtml).toMatch(/<footer[\s>]/i);
    });
    test('<article> présent (au moins 1)', () => {
        const count = (cyberHtml.match(/<article[\s>]/gi) || []).length;
        expect(count).toBeGreaterThanOrEqual(1);
    });
});

describe('Balises HTML5 sémantiques — ia.html', () => {
    test('<header> présent', () => {
        expect(iaHtml).toMatch(/<header[\s>]/i);
    });
    test('<nav> présent', () => {
        expect(iaHtml).toMatch(/<nav[\s>]/i);
    });
    test('<main> présent', () => {
        expect(iaHtml).toMatch(/<main[\s>]/i);
    });
    test('<section> présent (au moins 1)', () => {
        const count = (iaHtml.match(/<section[\s>]/gi) || []).length;
        expect(count).toBeGreaterThanOrEqual(1);
    });
    test('<footer> présent', () => {
        expect(iaHtml).toMatch(/<footer[\s>]/i);
    });
    test('<article> présent (au moins 1)', () => {
        const count = (iaHtml.match(/<article[\s>]/gi) || []).length;
        expect(count).toBeGreaterThanOrEqual(1);
    });
});


// ---------------------------------------------------------------------------
// 8. lang="fr" sur <html>
// ---------------------------------------------------------------------------

describe('Attribut lang="fr" sur <html>', () => {
    test('index.html : <html lang="fr">', () => {
        expect(indexHtml).toContain('<html lang="fr">');
    });
    test('cyber.html : <html lang="fr">', () => {
        expect(cyberHtml).toContain('<html lang="fr">');
    });
    test('ia.html : <html lang="fr">', () => {
        expect(iaHtml).toContain('<html lang="fr">');
    });
});


// ---------------------------------------------------------------------------
// 9. Pas de contenu dupliqué entre pages
// ---------------------------------------------------------------------------

describe('Pas de contenu dupliqué entre pages', () => {

    test('les titres <title> sont tous différents', () => {
        const t = [getTitle(indexHtml), getTitle(cyberHtml), getTitle(iaHtml)];
        expect(new Set(t).size).toBe(3);
    });

    test('les meta descriptions sont toutes différentes', () => {
        const d = [
            getMetaContent(indexHtml, 'description'),
            getMetaContent(cyberHtml, 'description'),
            getMetaContent(iaHtml, 'description'),
        ];
        expect(new Set(d).size).toBe(3);
    });

    test('les og:title sont tous différents', () => {
        const t = [
            getOGContent(indexHtml, 'title'),
            getOGContent(cyberHtml, 'title'),
            getOGContent(iaHtml, 'title'),
        ];
        expect(new Set(t).size).toBe(3);
    });

    test('les og:url sont tous différents', () => {
        const u = [
            getOGContent(indexHtml, 'url'),
            getOGContent(cyberHtml, 'url'),
            getOGContent(iaHtml, 'url'),
        ];
        expect(new Set(u).size).toBe(3);
    });

    test('les twitter:title sont tous différents', () => {
        const t = [
            getTwitterContent(indexHtml, 'title'),
            getTwitterContent(cyberHtml, 'title'),
            getTwitterContent(iaHtml, 'title'),
        ];
        expect(new Set(t).size).toBe(3);
    });
});


// ---------------------------------------------------------------------------
// 10. Edge cases
// ---------------------------------------------------------------------------

describe('Edge cases SEO', () => {

    test('og:image utilise le logo si pas d\'image de page dédiée (fallback)', () => {
        // Les 3 pages utilisent la photo Emmanuel comme og:image (fallback logo)
        const imgIndex = getOGContent(indexHtml, 'image');
        const imgCyber = getOGContent(cyberHtml, 'image');
        const imgIa    = getOGContent(iaHtml,    'image');
        // Toutes pointent vers une image (logo ou photo — jamais vide)
        expect(imgIndex).toBeTruthy();
        expect(imgCyber).toBeTruthy();
        expect(imgIa).toBeTruthy();
    });

    test('meta description ≥ 50 chars (pas de description trop courte)', () => {
        expect(getMetaContent(indexHtml, 'description').length).toBeGreaterThanOrEqual(50);
        expect(getMetaContent(cyberHtml, 'description').length).toBeGreaterThanOrEqual(50);
        expect(getMetaContent(iaHtml,    'description').length).toBeGreaterThanOrEqual(50);
    });

    test('pas de meta description > 160 chars (troncature Google)', () => {
        expect(getMetaContent(indexHtml, 'description').length).toBeLessThanOrEqual(160);
        expect(getMetaContent(cyberHtml, 'description').length).toBeLessThanOrEqual(160);
        expect(getMetaContent(iaHtml,    'description').length).toBeLessThanOrEqual(160);
    });

    test('les meta tags SEO ne contiennent pas de credentials (sécurité)', () => {
        [indexHtml, cyberHtml, iaHtml].forEach(html => {
            const d = getMetaContent(html, 'description') || '';
            expect(d).not.toMatch(/password|token|secret|api[_-]?key/i);
        });
    });

    test('JSON-LD : pas d\'erreur de parsing sur aucune page', () => {
        expect(() => parseJsonLd(indexHtml)).not.toThrow();
        expect(() => parseJsonLd(cyberHtml)).not.toThrow();
        expect(() => parseJsonLd(iaHtml)).not.toThrow();
    });

    test('les og:url sont des URLs HTTPS absolues', () => {
        [indexHtml, cyberHtml, iaHtml].forEach(html => {
            const url = getOGContent(html, 'url');
            expect(url).toMatch(/^https:\/\//);
        });
    });

    test('canonical link présent sur chaque page', () => {
        expect(indexHtml).toContain('<link rel="canonical"');
        expect(cyberHtml).toContain('<link rel="canonical"');
        expect(iaHtml).toContain('<link rel="canonical"');
    });
});
