/* ============================================
   AgileVizion 2 — Blog (LinkedIn-style cards)
   Loads posts from data/blog-posts.json
   i18n: content_en / content (fr), hashtags_en / hashtags
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {
    var container = document.getElementById('posts-container');
    var emptyMsg = document.getElementById('blog-empty');
    var filterBtns = document.querySelectorAll('.filter-btn');
    var posts = [];

    var AUTHOR = {
        name: 'Emmanuel Genesteix',
        title_fr: 'GRC Cybersécurité & Agentic AI Automation | AgileVizion',
        title_en: 'GRC Cybersecurity & Agentic AI Automation | AgileVizion',
        avatar: 'images/photo_emmanuel.png',
        profileUrl: 'https://www.linkedin.com/in/genesteix-emmanuel'
    };

    fetch('data/blog-posts.json')
        .then(function (res) { return res.json(); })
        .then(function (data) {
            posts = data;
            renderPosts(posts);
            setupFilters();
        })
        .catch(function () {
            container.innerHTML = '<p class="blog-load-error">Impossible de charger les articles.</p>';
        });

    /* --- Listen for language changes (switch) + initial load --- */
    function reRenderCurrentFilter() {
        if (!posts.length) return;
        var filter = document.querySelector('.filter-btn.active');
        var activeFilter = filter ? filter.getAttribute('data-filter') : 'all';
        var filtered = activeFilter === 'all'
            ? posts
            : posts.filter(function (p) { return p.category === activeFilter; });
        renderPosts(filtered);
    }

    window.addEventListener('languageChanged', reRenderCurrentFilter);
    window.addEventListener('translationsReady', reRenderCurrentFilter);

    function getLang() {
        if (window.I18n && window.I18n.currentLang) return window.I18n.currentLang;
        return document.documentElement.lang || 'fr';
    }

    function renderPosts(postsToRender) {
        if (!postsToRender.length) {
            container.innerHTML = '';
            emptyMsg.style.display = 'block';
            return;
        }
        emptyMsg.style.display = 'none';

        var lang = getLang();
        var isEn = lang === 'en';
        var html = '';

        postsToRender.forEach(function (post) {
            var date = isEn ? post.date_en : post.date_fr;
            var content = (isEn && post.content_en) ? post.content_en : post.content;
            var contentHtml = formatContent(content);
            var catClass = post.category.toLowerCase();
            var authorTitle = isEn ? AUTHOR.title_en : AUTHOR.title_fr;

            var hashtags = post.hashtags;
            var tags = hashtags.map(function (h) {
                return '<span class="post-tag">' + escapeHtml(h) + '</span>';
            }).join('');

            var labelMore = isEn ? '...read more' : '...voir plus';
            var labelLess = isEn ? 'collapse' : 'voir moins';
            var linkedinLabel = isEn ? 'See post' : 'Voir le post';
            var profileLabel = isEn ? 'LinkedIn Profile' : 'Profil LinkedIn';

            var linkedinBtn = post.linkedin_url
                ? '<a href="' + escapeHtml(post.linkedin_url) + '" target="_blank" rel="noopener" class="post-linkedin-link"><i class="fa-brands fa-linkedin"></i> ' + linkedinLabel + '</a>'
                : '';

            html += '<article class="blog-card animate-in" data-category="' + escapeHtml(post.category) + '">'
                // Category badge
                + '<span class="post-category-badge post-category-badge--' + catClass + '">' + escapeHtml(post.category) + '</span>'
                // Author header (LinkedIn style)
                + '<div class="post-author">'
                + '<a href="' + AUTHOR.profileUrl + '" target="_blank" rel="noopener">'
                + '<img class="post-author-avatar" src="' + AUTHOR.avatar + '" alt="' + AUTHOR.name + '">'
                + '</a>'
                + '<div class="post-author-info">'
                + '<div class="post-author-name"><a href="' + AUTHOR.profileUrl + '" target="_blank" rel="noopener">' + AUTHOR.name + '</a></div>'
                + '<div class="post-author-title">' + authorTitle + '</div>'
                + '<div class="post-author-date"><time datetime="' + post.published_at + '">' + escapeHtml(date) + '</time> <i class="fa-solid fa-earth-americas"></i></div>'
                + '</div>'
                + '</div>'
                // Post body
                + '<div class="post-body">'
                + '<div class="post-content">' + contentHtml + '</div>'
                + '</div>'
                + '<button class="post-expand-btn" onclick="togglePost(this)" data-label-more="' + labelMore + '" data-label-less="' + labelLess + '">' + labelMore + '</button>'
                // Hashtags
                + '<div class="post-hashtags">' + tags + '</div>'
                // Footer
                + '<div class="blog-card-footer">'
                + '<a href="' + AUTHOR.profileUrl + '" target="_blank" rel="noopener" class="post-profile-link"><i class="fa-brands fa-linkedin"></i> ' + profileLabel + '</a>'
                + linkedinBtn
                + '</div>'
                + '</article>';
        });

        container.innerHTML = html;

        // Re-observer les animations
        if (typeof IntersectionObserver !== 'undefined') {
            var observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });
            container.querySelectorAll('.animate-in').forEach(function (el) {
                observer.observe(el);
            });
        }
    }

    function setupFilters() {
        filterBtns.forEach(function (btn) {
            btn.addEventListener('click', function () {
                filterBtns.forEach(function (b) { b.classList.remove('active'); });
                btn.classList.add('active');
                var filter = btn.getAttribute('data-filter');

                var filtered = filter === 'all'
                    ? posts
                    : posts.filter(function (p) { return p.category === filter; });

                renderPosts(filtered);
            });
        });
    }

    function formatContent(text) {
        var lines = text.split('\n');
        var html = '';
        lines.forEach(function (line) {
            var trimmed = line.trim();
            var escaped = escapeHtml(trimmed);
            if (!trimmed) {
                html += '<br>';
            } else if (trimmed.startsWith('→') || trimmed.startsWith('✅') || trimmed.startsWith('✓')) {
                html += '<p class="post-bullet">' + escaped + '</p>';
            } else {
                html += '<p>' + escaped + '</p>';
            }
        });
        return html;
    }

    function escapeHtml(str) {
        var div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }
});

function togglePost(btn) {
    var card = btn.closest('.blog-card');
    var isExpanded = card.classList.toggle('expanded');
    btn.textContent = isExpanded
        ? (btn.getAttribute('data-label-less') || 'collapse')
        : (btn.getAttribute('data-label-more') || '...read more');
}
