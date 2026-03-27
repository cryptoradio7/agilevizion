/* ============================================
   AgileVizion 2 — Navigation + Calendly
   ============================================ */

/* --- Calendly popup avec fallback --- */
var CALENDLY_URL = 'https://calendly.com/emmanuel-genesteix';

function openCalendly() {
    if (window.Calendly && typeof window.Calendly.initPopupWidget === 'function') {
        window.Calendly.initPopupWidget({ url: CALENDLY_URL });
    } else {
        window.open(CALENDLY_URL, '_blank', 'noopener,noreferrer');
    }
}
window.openCalendly = openCalendly;

document.addEventListener('DOMContentLoaded', function () {
    var navbar = document.getElementById('navbar');
    var toggle = document.getElementById('nav-toggle');
    var menu = document.getElementById('nav-menu');

    var SCROLL_THRESHOLD = 50;
    var MOBILE_BREAKPOINT = 768;

    // Scroll shadow (threshold 50px)
    window.addEventListener('scroll', function () {
        if (window.scrollY > SCROLL_THRESHOLD) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile toggle
    if (toggle && menu) {
        toggle.addEventListener('click', function () {
            menu.classList.toggle('open');
            toggle.classList.toggle('active');
        });

        // Close menu on link click
        menu.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                menu.classList.remove('open');
                toggle.classList.remove('active');
            });
        });
    }

    // Close mobile menu on resize above breakpoint
    window.addEventListener('resize', function () {
        if (window.innerWidth > MOBILE_BREAKPOINT && menu) {
            menu.classList.remove('open');
            if (toggle) toggle.classList.remove('active');
        }
    });

    // Active page link
    function setActiveNavLink() {
        var path = window.location.pathname;
        var links = document.querySelectorAll('.nav-menu a[href]');
        links.forEach(function (link) {
            var href = link.getAttribute('href');
            if (!href || href.startsWith('#') || href.startsWith('/#')) return;
            link.classList.remove('active');
        });

        var activeHref = null;
        if (path === '/' || path.endsWith('/index.html') || path.endsWith('/agilevizion-2/')) {
            activeHref = '/';
        } else if (path.includes('cyber.html')) {
            activeHref = 'cyber.html';
        } else if (path.includes('ia.html')) {
            activeHref = 'ia.html';
        }

        if (activeHref) {
            var candidates = document.querySelectorAll('.nav-menu a[href]');
            candidates.forEach(function (link) {
                var href = link.getAttribute('href');
                if (href === activeHref ||
                    (activeHref === '/' && (href === '/' || href === 'index.html' || href === '/index.html'))) {
                    link.classList.add('active');
                }
            });
        }
    }

    setActiveNavLink();

    // Active language button
    function updateLangButtons() {
        var lang = (window.I18n && window.I18n.currentLang) || 'fr';
        document.querySelectorAll('.lang-btn').forEach(function (btn) {
            btn.classList.remove('active');
        });
        var activeBtn = document.getElementById('lang-' + lang);
        if (activeBtn) activeBtn.classList.add('active');
    }

    updateLangButtons();
    window.addEventListener('languageChanged', updateLangButtons);
    window.addEventListener('translationsReady', updateLangButtons);
});
