/**
 * Tests unitaires — Section "Pourquoi moi" (Story #6)
 * AgileVizion 2
 *
 * Couvre :
 * - Structure HTML (3 cards, photo, fallback, certs, triple compétence)
 * - Attributs data-i18n sur tous les éléments localisables
 * - Contenu des clés i18n FR et EN (why.* dans lang/*.json)
 * - Logique fallback onerror (initiales EG)
 * - Edge cases : XSS, aria-hidden, src photo
 */

'use strict';

const fs = require('fs');
const path = require('path');

// -----------------------------------------------------------------------
// Charger les fichiers de traduction
// -----------------------------------------------------------------------
const frJson = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, '../../lang/fr.json'), 'utf8')
);
const enJson = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, '../../lang/en.json'), 'utf8')
);

// -----------------------------------------------------------------------
// Extraire le HTML de la section #why-me depuis index.html
// -----------------------------------------------------------------------
const indexHtml = fs.readFileSync(
    path.resolve(__dirname, '../../index.html'),
    'utf8'
);

// Extraire la section complète #why-me
const WHY_HTML = (() => {
    const sectionStart = indexHtml.indexOf('<section class="section" id="why-me"');
    const sectionEnd = indexHtml.indexOf('</section>', sectionStart) + '</section>'.length;
    return indexHtml.slice(sectionStart, sectionEnd);
})();

// -----------------------------------------------------------------------
// Setup DOM — utilise le document jsdom fourni par Jest (testEnvironment: jsdom)
// -----------------------------------------------------------------------
function setupDOM() {
    document.body.innerHTML = WHY_HTML;
}

beforeEach(() => {
    setupDOM();
});

afterEach(() => {
    document.body.innerHTML = '';
});

// ====================================================================
// Structure HTML — 3 cartes arguments
// ====================================================================
describe('3 cartes arguments (.why-card)', () => {
    test('exactement 3 .why-card', () => {
        const cards = document.querySelectorAll('.why-card');
        expect(cards.length).toBe(3);
    });

    test('chaque card a un .why-icon', () => {
        const icons = document.querySelectorAll('.why-card .why-icon');
        expect(icons.length).toBe(3);
    });

    test('chaque card a une icône FA (i avec classe fa-*)', () => {
        const icons = document.querySelectorAll('.why-card .why-icon i');
        expect(icons.length).toBe(3);
        icons.forEach(icon => {
            expect(icon.className).toMatch(/fa-/);
        });
    });

    test('chaque card a un h3 avec data-i18n', () => {
        const titles = document.querySelectorAll('.why-card h3');
        expect(titles.length).toBe(3);
        titles.forEach(h3 => {
            expect(h3.getAttribute('data-i18n')).toBeTruthy();
        });
    });

    test('chaque card a un p avec data-i18n', () => {
        const descs = document.querySelectorAll('.why-card p');
        expect(descs.length).toBe(3);
        descs.forEach(p => {
            expect(p.getAttribute('data-i18n')).toBeTruthy();
        });
    });

    test('les icônes dans .why-icon ont aria-hidden="true"', () => {
        const icons = document.querySelectorAll('.why-card .why-icon i');
        icons.forEach(icon => {
            expect(icon.getAttribute('aria-hidden')).toBe('true');
        });
    });

    test('les 3 cards ont la classe animate-in', () => {
        const cards = document.querySelectorAll('.why-card');
        cards.forEach(card => {
            expect(card.classList.contains('animate-in')).toBe(true);
        });
    });
});

// ====================================================================
// Photo portrait
// ====================================================================
describe('Photo portrait (.photo-portrait)', () => {
    test('.photo-portrait-wrapper existe', () => {
        expect(document.querySelector('.photo-portrait-wrapper')).not.toBeNull();
    });

    test('img.photo-portrait a src non vide', () => {
        const img = document.querySelector('.photo-portrait');
        expect(img).not.toBeNull();
        expect(img.getAttribute('src')).toBeTruthy();
        expect(img.getAttribute('src').trim()).not.toBe('');
    });

    test('img.photo-portrait a alt non vide', () => {
        const img = document.querySelector('.photo-portrait');
        expect(img.getAttribute('alt')).toBeTruthy();
    });

    test('img.photo-portrait a data-i18n-alt', () => {
        const img = document.querySelector('.photo-portrait');
        expect(img.getAttribute('data-i18n-alt')).toBeTruthy();
    });

    test('img.photo-portrait a loading="lazy"', () => {
        const img = document.querySelector('.photo-portrait');
        expect(img.getAttribute('loading')).toBe('lazy');
    });

    test('img.photo-portrait a un onerror qui référence photo-fallback', () => {
        const img = document.querySelector('.photo-portrait');
        const onerror = img.getAttribute('onerror');
        expect(onerror).toBeTruthy();
        expect(onerror).toContain('photo-fallback');
    });

    test('le src pointe vers images/ (chemin relatif)', () => {
        const img = document.querySelector('.photo-portrait');
        const src = img.getAttribute('src');
        expect(src).toMatch(/^images\//);
    });
});

// ====================================================================
// Fallback initiales "EG"
// ====================================================================
describe('Fallback photo — initiales EG', () => {
    test('#photo-fallback existe dans le DOM', () => {
        expect(document.getElementById('photo-fallback')).not.toBeNull();
    });

    test('#photo-fallback contient "EG"', () => {
        const el = document.getElementById('photo-fallback');
        expect(el.textContent.trim()).toBe('EG');
    });

    test('#photo-fallback a style display:none par défaut', () => {
        const el = document.getElementById('photo-fallback');
        const style = el.getAttribute('style') || '';
        expect(style).toContain('display:none');
    });

    test('#photo-fallback a aria-hidden="true"', () => {
        const el = document.getElementById('photo-fallback');
        expect(el.getAttribute('aria-hidden')).toBe('true');
    });

    test('onerror de l\'img affiche #photo-fallback (flex)', () => {
        const img = document.querySelector('.photo-portrait');
        const onerror = img.getAttribute('onerror');
        expect(onerror).toContain("display='flex'");
    });
});

// ====================================================================
// Certifications
// ====================================================================
describe('Certifications (.cert-badge)', () => {
    const EXPECTED_CERTS = ['ISO 27001', 'ITIL V4', 'Prince2', 'AgilePM', 'SAFe'];

    test('exactement 5 .cert-badge', () => {
        const badges = document.querySelectorAll('.cert-badge');
        expect(badges.length).toBe(5);
    });

    EXPECTED_CERTS.forEach(cert => {
        test(`badge "${cert}" présent`, () => {
            const badges = Array.from(document.querySelectorAll('.cert-badge'));
            const found = badges.some(b => b.textContent.includes(cert));
            expect(found).toBe(true);
        });
    });

    test('chaque badge a une icône FA', () => {
        const icons = document.querySelectorAll('.cert-badge i');
        expect(icons.length).toBe(5);
    });

    test('.cert-badges a role="list"', () => {
        const list = document.querySelector('.cert-badges');
        expect(list).not.toBeNull();
        expect(list.getAttribute('role')).toBe('list');
    });

    test('chaque .cert-badge a role="listitem"', () => {
        const badges = document.querySelectorAll('.cert-badge');
        badges.forEach(badge => {
            expect(badge.getAttribute('role')).toBe('listitem');
        });
    });

    test('.certs-label a data-i18n="why.certs_title"', () => {
        const label = document.querySelector('.certs-label');
        expect(label).not.toBeNull();
        expect(label.getAttribute('data-i18n')).toBe('why.certs_title');
    });
});

// ====================================================================
// Triple compétence
// ====================================================================
describe('Triple compétence (.triple-item)', () => {
    test('exactement 3 .triple-item', () => {
        const items = document.querySelectorAll('.triple-item');
        expect(items.length).toBe(3);
    });

    test('chaque triple-item a un i FA et un span avec data-i18n', () => {
        const items = document.querySelectorAll('.triple-item');
        items.forEach(item => {
            const icon = item.querySelector('i');
            expect(icon).not.toBeNull();
            expect(icon.className).toMatch(/fa-/);

            const span = item.querySelector('span');
            expect(span).not.toBeNull();
            expect(span.getAttribute('data-i18n')).toBeTruthy();
        });
    });

    test('.why-experience a data-i18n-html="why.profile_experience"', () => {
        const exp = document.querySelector('.why-experience');
        expect(exp).not.toBeNull();
        expect(exp.getAttribute('data-i18n-html')).toBe('why.profile_experience');
    });
});

// ====================================================================
// Profil (nom + rôle)
// ====================================================================
describe('Profil consultant', () => {
    test('.why-profile-name a data-i18n="why.profile_name"', () => {
        const name = document.querySelector('.why-profile-name');
        expect(name).not.toBeNull();
        expect(name.getAttribute('data-i18n')).toBe('why.profile_name');
    });

    test('.why-profile-role a data-i18n="why.profile_role"', () => {
        const role = document.querySelector('.why-profile-role');
        expect(role).not.toBeNull();
        expect(role.getAttribute('data-i18n')).toBe('why.profile_role');
    });

    test('.why-profile a la classe animate-in', () => {
        const profile = document.querySelector('.why-profile');
        expect(profile).not.toBeNull();
        expect(profile.classList.contains('animate-in')).toBe(true);
    });
});

// ====================================================================
// Traductions FR — clés why.*
// ====================================================================
describe('Traductions FR (lang/fr.json) — why.*', () => {
    const REQUIRED_KEYS = [
        'hero_h1',
        'arg_1_title', 'arg_1_text',
        'arg_2_title', 'arg_2_text',
        'arg_3_title', 'arg_3_text',
        'profile_name', 'profile_role',
        'profile_experience',
        'photo_alt',
        'triple_tech', 'triple_legal', 'triple_mba',
        'certs_title',
    ];

    test('objet "why" présent dans fr.json', () => {
        expect(frJson.why).toBeDefined();
    });

    REQUIRED_KEYS.forEach(key => {
        test(`clé why.${key} présente et non vide (FR)`, () => {
            expect(frJson.why[key]).toBeDefined();
            expect(frJson.why[key].trim()).not.toBe('');
        });
    });

    test('why.profile_name contient "Emmanuel"', () => {
        expect(frJson.why.profile_name).toContain('Emmanuel');
    });

    test('why.profile_experience contient "20"', () => {
        expect(frJson.why.profile_experience).toContain('20');
    });
});

// ====================================================================
// Traductions EN — clés why.*
// ====================================================================
describe('Traductions EN (lang/en.json) — why.*', () => {
    const REQUIRED_KEYS = [
        'hero_h1',
        'arg_1_title', 'arg_1_text',
        'arg_2_title', 'arg_2_text',
        'arg_3_title', 'arg_3_text',
        'profile_name', 'profile_role',
        'profile_experience',
        'photo_alt',
        'triple_tech', 'triple_legal', 'triple_mba',
        'certs_title',
    ];

    test('objet "why" présent dans en.json', () => {
        expect(enJson.why).toBeDefined();
    });

    REQUIRED_KEYS.forEach(key => {
        test(`clé why.${key} présente et non vide (EN)`, () => {
            expect(enJson.why[key]).toBeDefined();
            expect(enJson.why[key].trim()).not.toBe('');
        });
    });

    test('why.profile_name contient "Emmanuel" (même en EN)', () => {
        expect(enJson.why.profile_name).toContain('Emmanuel');
    });

    test('why.profile_experience contient "20" (EN)', () => {
        expect(enJson.why.profile_experience).toContain('20');
    });
});

// ====================================================================
// Sécurité — pas de XSS dans le HTML de la section
// ====================================================================
describe('Sécurité — XSS', () => {
    test('pas de balise <script> dans le HTML de la section', () => {
        expect(WHY_HTML.toLowerCase()).not.toContain('<script>');
    });

    test('pas de javascript: dans les attributs href/src', () => {
        const withHref = document.querySelectorAll('[href], [src]');
        withHref.forEach(el => {
            const href = el.getAttribute('href') || '';
            const src = el.getAttribute('src') || '';
            expect(href.toLowerCase().startsWith('javascript:')).toBe(false);
            expect(src.toLowerCase().startsWith('javascript:')).toBe(false);
        });
    });
});

// ====================================================================
// Edge case — Fichier photo présent sur le disque
// ====================================================================
describe('Asset photo — présence sur le disque', () => {
    test('images/photo_emmanuel.png existe', () => {
        const photoPath = path.resolve(__dirname, '../../images/photo_emmanuel.png');
        expect(fs.existsSync(photoPath)).toBe(true);
    });

    test('images/photo_emmanuel.png est un fichier non vide (> 1 KB)', () => {
        const photoPath = path.resolve(__dirname, '../../images/photo_emmanuel.png');
        const stats = fs.statSync(photoPath);
        expect(stats.size).toBeGreaterThan(1000);
    });
});
