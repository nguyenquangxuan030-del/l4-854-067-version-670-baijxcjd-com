(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    function setupMenu() {
        var toggle = document.querySelector('[data-menu-toggle]');
        var menu = document.querySelector('[data-mobile-menu]');
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    function setupHero() {
        var slider = document.querySelector('[data-hero-slider]');
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }
        function play() {
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                window.clearInterval(timer);
                show(index);
                play();
            });
        });
        show(0);
        play();
    }

    function setupFilter() {
        var input = document.querySelector('[data-filter-input]');
        var list = document.querySelector('[data-filter-list]');
        if (!input || !list) {
            return;
        }
        var items = Array.prototype.slice.call(list.querySelectorAll('[data-search-item]'));
        var empty = document.querySelector('[data-empty-state]');
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q') || '';
        if (input.hasAttribute('data-url-query') && initial) {
            input.value = initial;
        }
        function apply() {
            var query = input.value.trim().toLowerCase();
            var visible = 0;
            items.forEach(function (item) {
                var haystack = [
                    item.getAttribute('data-title') || '',
                    item.getAttribute('data-meta') || '',
                    item.textContent || ''
                ].join(' ').toLowerCase();
                var matched = !query || haystack.indexOf(query) !== -1;
                item.style.display = matched ? '' : 'none';
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }
        input.addEventListener('input', apply);
        apply();
    }

    function setupPlayers() {
        var boxes = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
        boxes.forEach(function (box) {
            var video = box.querySelector('video');
            var trigger = box.querySelector('[data-play-trigger]');
            if (!video || !trigger) {
                return;
            }
            var stream = video.getAttribute('data-stream');
            var hlsInstance = null;
            function attach() {
                if (video.dataset.ready === '1' || !stream) {
                    return;
                }
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = stream;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(stream);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = stream;
                }
                video.dataset.ready = '1';
            }
            function start() {
                attach();
                box.classList.add('is-playing');
                video.controls = true;
                var promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {});
                }
            }
            trigger.addEventListener('click', start);
            box.addEventListener('click', function (event) {
                if (event.target === trigger || trigger.contains(event.target)) {
                    return;
                }
                if (video.paused) {
                    start();
                }
            });
            video.addEventListener('play', function () {
                box.classList.add('is-playing');
            });
            window.addEventListener('beforeunload', function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFilter();
        setupPlayers();
    });
})();
