/* ============================================
   AgileVizion 2 — Scroll Animations
   Intersection Observer API
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {
    var animatedElements = document.querySelectorAll('.animate-in');

    if (!animatedElements.length) return;

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
});
