(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function setupMobileMenu() {
        var toggle = document.querySelector('.mobile-toggle');
        var menu = document.querySelector('.mobile-menu');
        if (!toggle || !menu) {
            return;
        }

        toggle.addEventListener('click', function () {
            var isOpen = !menu.hasAttribute('hidden');
            if (isOpen) {
                menu.setAttribute('hidden', '');
                toggle.setAttribute('aria-expanded', 'false');
                document.body.classList.remove('no-scroll');
            } else {
                menu.removeAttribute('hidden');
                toggle.setAttribute('aria-expanded', 'true');
                document.body.classList.add('no-scroll');
            }
        });

        menu.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                menu.setAttribute('hidden', '');
                toggle.setAttribute('aria-expanded', 'false');
                document.body.classList.remove('no-scroll');
            });
        });
    }

    function setupSearchForms() {
        document.querySelectorAll('.search-form').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                var input = form.querySelector('input[name="q"]');
                var query = input ? input.value.trim() : '';
                if (!query) {
                    event.preventDefault();
                    if (input) {
                        input.focus();
                    }
                }
            });
        });
    }

    function setupHeroSlider() {
        var slider = document.querySelector('[data-hero-slider]');
        if (!slider) {
            return;
        }

        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        var prev = slider.querySelector('[data-hero-prev]');
        var next = slider.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot') || 0));
                start();
            });
        });

        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function setupPageFilters() {
        var grid = document.querySelector('.filterable-grid');
        if (!grid) {
            return;
        }

        var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
        var keyword = document.getElementById('pageFilterKeyword');
        var type = document.getElementById('pageFilterType');
        var region = document.getElementById('pageFilterRegion');
        var year = document.getElementById('pageFilterYear');
        var empty = document.createElement('p');
        empty.className = 'filter-empty';
        empty.textContent = '当前筛选条件下没有匹配影片。';

        function apply() {
            var query = normalize(keyword && keyword.value);
            var typeValue = normalize(type && type.value);
            var regionValue = normalize(region && region.value);
            var yearValue = normalize(year && year.value);
            var visibleCount = 0;

            cards.forEach(function (card) {
                var text = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-tags')
                ].join(' '));
                var matchesQuery = !query || text.indexOf(query) !== -1;
                var matchesType = !typeValue || normalize(card.getAttribute('data-type')) === typeValue;
                var matchesRegion = !regionValue || normalize(card.getAttribute('data-region')) === regionValue;
                var matchesYear = !yearValue || normalize(card.getAttribute('data-year')) === yearValue;
                var visible = matchesQuery && matchesType && matchesRegion && matchesYear;
                card.style.display = visible ? '' : 'none';
                if (visible) {
                    visibleCount += 1;
                }
            });

            if (visibleCount === 0) {
                if (!grid.contains(empty)) {
                    grid.appendChild(empty);
                }
            } else if (grid.contains(empty)) {
                empty.remove();
            }
        }

        [keyword, type, region, year].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });
    }

    function setupSearchPage() {
        var results = document.getElementById('searchResults');
        var keyword = document.getElementById('searchKeyword');
        if (!results || !keyword || !window.MOVIE_DATA) {
            return;
        }

        var button = document.getElementById('searchButton');
        var type = document.getElementById('searchType');
        var region = document.getElementById('searchRegion');
        var year = document.getElementById('searchYear');
        var sort = document.getElementById('searchSort');
        var summary = document.getElementById('searchSummary');
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';
        keyword.value = initialQuery;

        function movieCard(movie) {
            var tags = (movie.tags || []).slice(0, 3).join(' ');
            return [
                '<article class="movie-card" data-title="', escapeHtml(movie.title), '" data-type="', escapeHtml(movie.type), '" data-region="', escapeHtml(movie.region), '" data-year="', movie.year, '" data-genre="', escapeHtml(movie.genre), '" data-tags="', escapeHtml(tags), '">',
                '  <a class="movie-cover" href="', escapeHtml(movie.url), '">',
                '    <img src="', escapeHtml(movie.cover), '" alt="', escapeHtml(movie.title), '" loading="lazy">',
                '    <span class="duration">', escapeHtml(movie.duration), '</span>',
                '    <span class="play-badge">▶</span>',
                '  </a>',
                '  <div class="movie-info">',
                '    <h3><a href="', escapeHtml(movie.url), '">', escapeHtml(movie.title), '</a></h3>',
                '    <p>', escapeHtml(movie.oneLine || movie.summary || ''), '</p>',
                '    <div class="movie-meta">',
                '      <span>', escapeHtml(movie.region), '</span>',
                '      <span>', movie.year, '</span>',
                '      <span>', escapeHtml(movie.category), '</span>',
                '    </div>',
                '  </div>',
                '</article>'
            ].join('');
        }

        function escapeHtml(value) {
            return String(value || '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        }

        function apply() {
            var query = normalize(keyword.value);
            var typeValue = normalize(type && type.value);
            var regionValue = normalize(region && region.value);
            var yearValue = normalize(year && year.value);
            var sortValue = sort ? sort.value : 'heat';

            var filtered = window.MOVIE_DATA.filter(function (movie) {
                var searchText = normalize([
                    movie.title,
                    movie.region,
                    movie.type,
                    movie.year,
                    movie.genre,
                    (movie.tags || []).join(' '),
                    movie.oneLine,
                    movie.summary
                ].join(' '));
                var matchesQuery = !query || searchText.indexOf(query) !== -1;
                var matchesType = !typeValue || normalize(movie.type) === typeValue;
                var matchesRegion = !regionValue || normalize(movie.region) === regionValue;
                var matchesYear = !yearValue || normalize(movie.year) === yearValue;
                return matchesQuery && matchesType && matchesRegion && matchesYear;
            });

            filtered.sort(function (a, b) {
                if (sortValue === 'year') {
                    return b.year - a.year || b.heat - a.heat;
                }
                if (sortValue === 'title') {
                    return String(a.title).localeCompare(String(b.title), 'zh-Hans-CN');
                }
                return b.heat - a.heat;
            });

            var limited = filtered.slice(0, 120);
            results.innerHTML = limited.map(movieCard).join('');
            if (summary) {
                summary.textContent = '找到 ' + filtered.length + ' 条匹配结果，当前展示前 ' + limited.length + ' 条。';
            }
        }

        [keyword, type, region, year, sort].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });

        if (button) {
            button.addEventListener('click', apply);
        }

        apply();
    }

    ready(function () {
        setupMobileMenu();
        setupSearchForms();
        setupHeroSlider();
        setupPageFilters();
        setupSearchPage();
    });
})();
