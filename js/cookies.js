/* ============================================
   AgileVizion 2 — Cookie Consent Popup (RGPD)
   ============================================ */

var COOKIE_KEY = 'cookie_consent_v2';
var COOKIE_TTL_MS = 365 * 24 * 60 * 60 * 1000; // 12 mois

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
        // Silently fail
    }
}

function _hidePopup() {
    var popup = document.getElementById('cookie-popup');
    var overlay = document.getElementById('cookie-overlay');
    if (popup) popup.classList.add('cookie-popup--hidden');
    if (overlay) overlay.classList.add('cookie-overlay--hidden');
    setTimeout(function () {
        if (popup) popup.style.display = 'none';
        if (overlay) overlay.style.display = 'none';
    }, 300);
}

function acceptCookies() {
    _setConsent('accepted');
    _hidePopup();
}

function refuseCookies() {
    _setConsent('refused');
    _hidePopup();
}

document.addEventListener('DOMContentLoaded', function () {
    var popup = document.getElementById('cookie-popup');
    var overlay = document.getElementById('cookie-overlay');
    if (!popup || !overlay) return;
    if (_getConsent() === null) {
        overlay.style.display = 'block';
        popup.style.display = 'block';
    }
});
