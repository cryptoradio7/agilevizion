/* ============================================
   AgileVizion 2 — Navigation
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {
    var navbar = document.getElementById('navbar');
    var toggle = document.getElementById('nav-toggle');
    var menu = document.getElementById('nav-menu');

    // Scroll shadow
    window.addEventListener('scroll', function () {
        if (window.scrollY > 10) {
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

    // Active language button
    function updateLangButtons() {
        var lang = (window.I18n && window.I18n.currentLang) || 'en';
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
