/* ============================================
   Section Navigation — auto-highlight on scroll
   ============================================ */

(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', function() {
        var nav = document.querySelector('.section-nav');
        if (!nav) return;

        var links = nav.querySelectorAll('.section-nav-link');
        if (!links.length) return;

        var sections = [];
        links.forEach(function(link) {
            var id = link.getAttribute('href');
            if (id && id.charAt(0) === '#') {
                var el = document.getElementById(id.substring(1));
                if (el) sections.push({ el: el, link: link });
            }
        });

        // Smooth scroll on click
        links.forEach(function(link) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                var id = this.getAttribute('href');
                var target = document.getElementById(id.substring(1));
                if (!target) return;
                var navbarH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--navbar-height')) || 64;
                var navH = nav.offsetHeight || 40;
                var top = target.getBoundingClientRect().top + window.pageYOffset - navbarH - navH - 8;
                window.scrollTo({ top: top, behavior: 'smooth' });
            });
        });

        // Highlight active section on scroll
        var ticking = false;
        function onScroll() {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(function() {
                var navbarH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--navbar-height')) || 64;
                var navH = nav.offsetHeight || 40;
                var offset = navbarH + navH + 20;
                var current = null;

                for (var i = 0; i < sections.length; i++) {
                    var rect = sections[i].el.getBoundingClientRect();
                    if (rect.top <= offset) current = sections[i];
                }

                links.forEach(function(l) { l.classList.remove('active'); });
                if (current) current.link.classList.add('active');

                // Shadow when scrolled past hero
                if (window.scrollY > 100) nav.classList.add('has-shadow');
                else nav.classList.remove('has-shadow');

                ticking = false;
            });
        }

        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    });
})();
