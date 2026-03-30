/* ============================================
   AgileVizion 2 — Scroll Animations
   Intersection Observer API
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {
    var animatedElements = document.querySelectorAll('.animate-in');

    if (!animatedElements.length) return;

    // Fallback : navigateur sans IntersectionObserver → tout visible
    if (!('IntersectionObserver' in window)) {
        animatedElements.forEach(function (el) {
            el.classList.add('visible');
        });
        return;
    }

    // Respect reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        animatedElements.forEach(function (el) {
            el.classList.add('visible');
        });
        return;
    }

    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
    });

    animatedElements.forEach(function (el) {
        observer.observe(el);
    });

    // Hero video autoplay — masquer placeholder si vidéo chargée
    var heroVideo = document.querySelector('.hero-video-player');
    if (heroVideo) {
        heroVideo.addEventListener('canplay', function () {
            heroVideo.classList.add('is-playing');
        });
        // Si déjà chargée (cache navigateur)
        if (heroVideo.readyState >= 3) {
            heroVideo.classList.add('is-playing');
        }
    }
});

// Toggle son vidéo hero
function toggleVideoSound(btn) {
    var video = btn.closest('.hero-video').querySelector('.hero-video-player');
    if (!video) return;
    var icon = btn.querySelector('i');
    if (video.muted) {
        video.muted = false;
        icon.className = 'fa-solid fa-volume-high';
        btn.setAttribute('aria-label', 'Couper le son');
    } else {
        video.muted = true;
        icon.className = 'fa-solid fa-volume-xmark';
        btn.setAttribute('aria-label', 'Activer le son');
    }
}
