/**
 * AgileVizion - Composants réutilisables (Header & Footer)
 * Modifiez ce fichier pour changer le menu ou le footer sur TOUTES les pages
 */

// ============================================================
// CONFIGURATION - Modifiez ici les liens et textes
// ============================================================

const CONFIG = {
    brand: 'Agile<span>Vizion</span>',
    email: 'emmanuel.genesteix@agilevizion.com',
    phone: '+352.661.78.08.07',
    location: {
        fr: 'Luxembourg (interventions Europe)',
        en: 'Luxembourg (Europe-wide interventions)'
    },
    linkedin: 'https://www.linkedin.com/in/genesteix-emmanuel/',
    calendly: 'https://calendly.com/emmanuel-genesteix-agilevizion/diagnostic-agilevizion'
};

// Menu items - Modifiez ici pour ajouter/supprimer des pages
const MENU_FR = [
    { href: 'index.html', label: 'GRC Cybersécurité', id: 'grc' },
    { href: 'service_management.html', label: 'Service Management', id: 'itsm' },
    { href: 'simulator.html', label: 'Simulateur', id: 'simulator' },
    { href: 'pourquoi_moi.html', label: 'Pourquoi moi', id: 'why' }
];

const MENU_EN = [
    { href: 'index.html', label: 'GRC Cybersecurity', id: 'grc' },
    { href: 'service_management.html', label: 'Service Management', id: 'itsm' },
    { href: 'simulator.html', label: 'Simulator', id: 'simulator' },
    { href: 'why_me.html', label: 'Why me', id: 'why' }
];

// Menu items pour la racine (paths différents)
const MENU_ROOT_EN = [
    { href: 'index.html', label: 'GRC Cybersecurity', id: 'grc' },
    { href: 'EN/service_management.html', label: 'Service Management', id: 'itsm' },
    { href: 'EN/simulator.html', label: 'Simulator', id: 'simulator' },
    { href: 'EN/why_me.html', label: 'Why me', id: 'why' }
];

// ============================================================
// FONCTIONS - Ne pas modifier sauf si nécessaire
// ============================================================

function detectLanguage() {
    const path = window.location.pathname;
    if (path.includes('/FR/')) return 'fr';
    if (path.includes('/EN/')) return 'en';
    // Root level - check html lang or default to en
    const htmlLang = document.documentElement.lang;
    return htmlLang === 'fr' ? 'fr' : 'en';
}

function detectCurrentPage() {
    const path = window.location.pathname;
    const filename = path.split('/').pop() || 'index.html';
    
    if (filename.includes('index')) return 'grc';
    if (filename.includes('service_management')) return 'itsm';
    if (filename.includes('simulator')) return 'simulator';
    if (filename.includes('pourquoi_moi') || filename.includes('why_me')) return 'why';
    return 'grc';
}

function getBasePath() {
    const path = window.location.pathname;
    if (path.includes('/FR/') || path.includes('/EN/')) {
        return '../';
    }
    return '';
}

function generateHeader() {
    const lang = detectLanguage();
    const currentPage = detectCurrentPage();
    const basePath = getBasePath();
    const isSubfolder = basePath !== '';
    
    // Sélectionner le bon menu selon la position et la langue
    let menu;
    if (!isSubfolder && lang === 'en') {
        menu = MENU_ROOT_EN;
    } else if (lang === 'fr') {
        menu = MENU_FR;
    } else {
        menu = MENU_EN;
    }
    
    // Determine paths based on location
    const frPath = isSubfolder ? '' : 'FR/';
    const enPath = isSubfolder ? '../EN/' : 'EN/';
    const rootPath = isSubfolder ? '../' : '';
    
    // Build menu items
    let menuHtml = '';
    menu.forEach(item => {
        const activeClass = item.id === currentPage ? ' class="active"' : '';
        menuHtml += `<a href="${item.href}"${activeClass}>${item.label}</a>\n            `;
    });
    
    // Language switch paths
    let frHref, enHref;
    const currentFile = window.location.pathname.split('/').pop() || 'index.html';
    
    if (lang === 'fr') {
        frHref = currentFile;
        if (currentFile === 'pourquoi_moi.html') {
            enHref = '../EN/why_me.html';
        } else {
            enHref = `../EN/${currentFile}`;
        }
    } else {
        if (currentFile === 'why_me.html') {
            frHref = isSubfolder ? '../FR/pourquoi_moi.html' : 'FR/pourquoi_moi.html';
        } else {
            frHref = isSubfolder ? `../FR/${currentFile}` : `FR/${currentFile}`;
        }
        enHref = currentFile;
    }
    
    // For root index.html
    if (!isSubfolder && currentFile === 'index.html') {
        frHref = 'FR/index.html';
        enHref = 'index.html';
    }

    const frActiveClass = lang === 'fr' ? ' class="active-lang"' : '';
    const enActiveClass = lang === 'en' ? ' class="active-lang"' : '';

    return `
    <nav class="navbar">
        <a href="${isSubfolder ? '' : (lang === 'fr' ? 'FR/' : '')}index.html" class="navbar-brand">${CONFIG.brand}</a>
        <div class="navbar-menu">
            ${menuHtml}<div class="lang-switch">
                <a href="${frHref}"${frActiveClass}>FR</a>
                <a href="${enHref}"${enActiveClass}>EN</a>
            </div>
        </div>
    </nav>`;
}

function generateFooter() {
    const lang = detectLanguage();
    const locationText = lang === 'fr' ? CONFIG.location.fr : CONFIG.location.en;
    const contactTitle = lang === 'fr' ? 'Me contacter' : 'Contact me';
    
    return `
    <div class="contact-info">
        <div style="max-width: 1200px; margin: 0 auto;">
            <h2 style="margin-bottom: 20px;">${contactTitle}</h2>
            <p style="font-size: 1.2em; margin-bottom: 10px;">📱 ${CONFIG.phone} · ✉️ <a href="mailto:${CONFIG.email}" style="color: white;">${CONFIG.email}</a></p>
            <p style="font-size: 1.2em;">📍 ${locationText}</p>
            <div class="social-links">
                <a href="${CONFIG.linkedin}" target="_blank" title="LinkedIn"><i class="fa-brands fa-linkedin"></i></a>
            </div>
        </div>
    </div>
    <footer>
        <p>© ${new Date().getFullYear()} AgileVizion - Emmanuel MUSIC Genesteix</p>
    </footer>`;
}

// ============================================================
// INJECTION - Injecte le header et footer dans la page
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
    // Inject header
    const headerPlaceholder = document.getElementById('header-placeholder');
    if (headerPlaceholder) {
        headerPlaceholder.innerHTML = generateHeader();
    }
    
    // Inject footer
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) {
        footerPlaceholder.innerHTML = generateFooter();
    }
});

