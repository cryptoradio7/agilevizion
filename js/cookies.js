/* ============================================
   AgileVizion 2 — Cookie Banner (RGPD)
   ============================================ */

var COOKIE_KEY = 'cookie_consent';
var COOKIE_TTL_MS = 365 * 24 * 60 * 60 * 1000; // 12 mois en millisecondes

function _localStorageAvailable() {
    try {
        var test = '__ls_test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch (e) {
        return false;
    }
}

function _getConsent() {
    if (!_localStorageAvailable()) return null;
    try {
        var raw = localStorage.getItem(COOKIE_KEY);
        if (!raw) return null;
        var data = JSON.parse(raw);
        if (!data || !data.value || !data.timestamp) return null;
        if (Date.now() - data.timestamp > COOKIE_TTL_MS) {
            localStorage.removeItem(COOKIE_KEY);
            return null;
        }
        return data.value;
    } catch (e) {
        return null;
    }
}

function _setConsent(value) {
    if (!_localStorageAvailable()) return;
    try {
        localStorage.setItem(COOKIE_KEY, JSON.stringify({
            value: value,
            timestamp: Date.now()
        }));
    } catch (e) {
        // Silently fail (stockage plein ou navigation privée stricte)
    }
}

function _hideBanner() {
    var banner = document.getElementById('cookie-banner');
    if (!banner) return;
    banner.classList.add('cookie-banner--hidden');
    setTimeout(function () {
        banner.style.display = 'none';
    }, 300);
}

function acceptCookies() {
    _setConsent('accepted');
    _hideBanner();
}

function refuseCookies() {
    _setConsent('refused');
    _hideBanner();
}

document.addEventListener('DOMContentLoaded', function () {
    var banner = document.getElementById('cookie-banner');
    if (!banner) return;
    if (_getConsent() === null) {
        banner.style.display = 'flex';
    }
});
