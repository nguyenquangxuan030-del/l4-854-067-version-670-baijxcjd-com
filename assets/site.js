(function () {
    var body = document.body;
    var menuButton = document.querySelector('[data-menu-button]');

    if (menuButton) {
        menuButton.addEventListener('click', function () {
            body.classList.toggle('menu-open');
        });
    }

    document.querySelectorAll('[data-carousel]').forEach(function (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-slide]'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-slide-dot]'));
        var prev = carousel.querySelector('[data-slide-prev]');
        var next = carousel.querySelector('[data-slide-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 6500);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-slide-dot')) || 0);
                start();
            });
        });

        carousel.addEventListener('mouseenter', stop);
        carousel.addEventListener('mouseleave', start);
        show(0);
        start();
    });

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function setupFilters(scope) {
        var input = scope.querySelector('[data-filter-input]');
        var year = scope.querySelector('[data-filter-year]');
        var region = scope.querySelector('[data-filter-region]');
        var type = scope.querySelector('[data-filter-type]');
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-card]'));
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');

        if (input && query) {
            input.value = query;
        }

        function update() {
            var q = normalize(input && input.value);
            var y = normalize(year && year.value);
            var r = normalize(region && region.value);
            var t = normalize(type && type.value);

            cards.forEach(function (card) {
                var text = normalize(card.getAttribute('data-search'));
                var cardYear = normalize(card.getAttribute('data-year'));
                var cardRegion = normalize(card.getAttribute('data-region'));
                var cardType = normalize(card.getAttribute('data-type'));
                var matched = true;

                if (q && text.indexOf(q) === -1) {
                    matched = false;
                }

                if (y && cardYear !== y) {
                    matched = false;
                }

                if (r && cardRegion !== r) {
                    matched = false;
                }

                if (t && cardType !== t) {
                    matched = false;
                }

                card.classList.toggle('is-hidden', !matched);
            });
        }

        [input, year, region, type].forEach(function (control) {
            if (control) {
                control.addEventListener('input', update);
                control.addEventListener('change', update);
            }
        });

        update();
    }

    document.querySelectorAll('[data-filter-scope]').forEach(setupFilters);
})();
