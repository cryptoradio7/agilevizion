/* ============================================
   AgileVizion 2 — Calendly lazy loading (#16)
   ============================================
   - CSS + JS Calendly chargés uniquement au premier clic
   - URL configurable via CALENDLY_URL
   - Fallback : lien direct si CDN inaccessible
   ============================================ */

var CALENDLY_URL = 'https://calendly.com/emmanuel-genesteix-agilevizion/diagnostic-agilevizion';
var CALENDLY_CSS = 'https://assets.calendly.com/assets/external/widget.css';
var CALENDLY_JS  = 'https://assets.calendly.com/assets/external/widget.js';

var _calendlyState = 'idle'; // 'idle' | 'loading' | 'ready' | 'failed'
var _pendingCallbacks = [];

function _onCalendlyReady(cb) {
    if (_calendlyState === 'ready') {
        cb();
        return;
    }
    _pendingCallbacks.push(cb);
}

function _loadCalendlyCSS() {
    if (document.querySelector('link[href="' + CALENDLY_CSS + '"]')) return;
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = CALENDLY_CSS;
    document.head.appendChild(link);
}

function _loadCalendly() {
    if (_calendlyState === 'ready') {
        _flushCallbacks();
        return;
    }
    if (_calendlyState === 'loading') return;

    _calendlyState = 'loading';
    _loadCalendlyCSS();

    var script = document.createElement('script');
    script.src = CALENDLY_JS;
    script.async = true;

    script.onload = function () {
        _calendlyState = 'ready';
        _flushCallbacks();
    };

    script.onerror = function () {
        _calendlyState = 'failed';
        _flushCallbacks();
    };

    document.body.appendChild(script);
}

function _flushCallbacks() {
    var cbs = _pendingCallbacks.slice();
    _pendingCallbacks = [];
    cbs.forEach(function (cb) { cb(); });
}

function openCalendly() {
    _onCalendlyReady(function () {
        if (_calendlyState === 'ready' &&
            window.Calendly &&
            typeof window.Calendly.initPopupWidget === 'function') {
            window.Calendly.initPopupWidget({ url: CALENDLY_URL });
        } else {
            // CDN inaccessible ou script bloqué → fallback lien direct
            window.open(CALENDLY_URL, '_blank', 'noopener,noreferrer');
        }
    });
    _loadCalendly();
}

window.openCalendly = openCalendly;
