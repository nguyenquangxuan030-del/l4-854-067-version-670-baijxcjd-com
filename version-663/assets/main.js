(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
        } else {
            document.addEventListener("DOMContentLoaded", callback);
        }
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function setSelectValue(select, value) {
        if (!select || !value) {
            return;
        }
        var options = Array.prototype.slice.call(select.options);
        var match = options.find(function (option) {
            return option.value === value || option.textContent === value;
        });
        if (match) {
            select.value = match.value;
        }
    }

    function filterCards(scope) {
        var root = scope || document;
        var input = root.querySelector("[data-filter-input]");
        var category = root.querySelector("[data-filter-category]");
        var region = root.querySelector("[data-filter-region]");
        var year = root.querySelector("[data-filter-year]");
        var type = root.querySelector("[data-filter-type]");
        var empty = root.querySelector("[data-empty-state]");
        var cards = Array.prototype.slice.call(root.querySelectorAll("[data-movie-card]"));
        var keyword = normalize(input && input.value);
        var categoryValue = normalize(category && category.value);
        var regionValue = normalize(region && region.value);
        var yearValue = normalize(year && year.value);
        var typeValue = normalize(type && type.value);
        var visible = 0;

        cards.forEach(function (card) {
            var text = normalize(card.getAttribute("data-search"));
            var matched = true;
            if (keyword && text.indexOf(keyword) === -1) {
                matched = false;
            }
            if (categoryValue && normalize(card.getAttribute("data-category")) !== categoryValue) {
                matched = false;
            }
            if (regionValue && normalize(card.getAttribute("data-region")) !== regionValue) {
                matched = false;
            }
            if (yearValue && normalize(card.getAttribute("data-year")) !== yearValue) {
                matched = false;
            }
            if (typeValue && normalize(card.getAttribute("data-type")) !== typeValue) {
                matched = false;
            }
            card.style.display = matched ? "" : "none";
            if (matched) {
                visible += 1;
            }
        });

        if (empty) {
            empty.classList.toggle("show", visible === 0);
        }
    }

    function initFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
        var params = new URLSearchParams(window.location.search);
        panels.forEach(function (panel) {
            var input = panel.querySelector("[data-filter-input]");
            var category = panel.querySelector("[data-filter-category]");
            var region = panel.querySelector("[data-filter-region]");
            var year = panel.querySelector("[data-filter-year]");
            var type = panel.querySelector("[data-filter-type]");
            if (input && params.get("q")) {
                input.value = params.get("q");
            }
            setSelectValue(category, params.get("category"));
            setSelectValue(region, params.get("region"));
            setSelectValue(year, params.get("year"));
            setSelectValue(type, params.get("type"));
            [input, category, region, year, type].forEach(function (element) {
                if (!element) {
                    return;
                }
                element.addEventListener("input", function () {
                    filterCards(document);
                });
                element.addEventListener("change", function () {
                    filterCards(document);
                });
            });
        });
        if (panels.length) {
            filterCards(document);
        }
    }

    function initMenu() {
        var button = document.querySelector("[data-menu-button]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            panel.classList.toggle("open");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === index);
            });
        }

        function schedule() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 6200);
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                schedule();
            });
        });

        show(0);
        schedule();
    }

    ready(function () {
        initMenu();
        initHero();
        initFilters();
    });

    window.SitePlayer = {
        start: function (videoId, buttonId, source) {
            var video = document.getElementById(videoId);
            var button = document.getElementById(buttonId);
            if (!video || !button || !source) {
                return;
            }
            var prepared = false;

            function prepare() {
                if (prepared) {
                    return;
                }
                prepared = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                } else if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({ enableWorker: true });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    video.hlsPlayer = hls;
                } else {
                    video.src = source;
                }
            }

            function play() {
                prepare();
                button.classList.add("is-hidden");
                var result = video.play();
                if (result && typeof result.catch === "function") {
                    result.catch(function () {
                        button.classList.remove("is-hidden");
                    });
                }
            }

            button.addEventListener("click", play);
            video.addEventListener("click", function () {
                if (video.paused) {
                    play();
                }
            });
        }
    };
})();
