/* ============================================
   AgileVizion 2 — Cookie Banner (RGPD)
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {
    var banner = document.getElementById('cookie-banner');
    if (!banner) return;

    if (!localStorage.getItem('agilevizion_cookies_accepted')) {
        banner.style.display = 'flex';
    }
});

function acceptCookies() {
    localStorage.setItem('agilevizion_cookies_accepted', 'true');
    var banner = document.getElementById('cookie-banner');
    if (banner) banner.style.display = 'none';
}
