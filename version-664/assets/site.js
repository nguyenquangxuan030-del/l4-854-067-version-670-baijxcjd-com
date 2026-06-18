(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return (value || "").toString().toLowerCase().trim();
  }

  function initMobileNav() {
    var toggle = qs("[data-mobile-toggle]");
    var panel = qs("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function initHero() {
    var hero = qs("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = qsa(".hero-slide", hero);
    var dots = qsa(".hero-dot", hero);
    if (!slides.length) {
      return;
    }
    var current = 0;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
      });
    });

    show(0);
    window.setInterval(function () {
      show(current + 1);
    }, 5600);
  }

  function initHeaderSearch() {
    qsa("[data-site-search]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = qs("input", form);
        var query = input ? input.value.trim() : "";
        var target = "./categories.html";
        if (query) {
          target += "?q=" + encodeURIComponent(query);
        }
        window.location.href = target;
      });
    });
  }

  function initFilters() {
    var input = qs("[data-filter-input]");
    var select = qs("[data-filter-select]");
    var cards = qsa("[data-movie-card]");
    var empty = qs("[data-empty-state]");
    if (!cards.length) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");
    if (query && input) {
      input.value = query;
    }

    function apply() {
      var term = normalize(input ? input.value : "");
      var selected = select ? select.value : "";
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute("data-search"));
        var category = card.getAttribute("data-category") || "";
        var type = card.getAttribute("data-type") || "";
        var region = card.getAttribute("data-region") || "";
        var matchesTerm = !term || haystack.indexOf(term) !== -1;
        var matchesSelected = !selected || selected === category || selected === type || selected === region;
        var keep = matchesTerm && matchesSelected;
        card.classList.toggle("is-hidden-by-filter", !keep);
        if (keep) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    if (input) {
      input.addEventListener("input", apply);
    }
    if (select) {
      select.addEventListener("change", apply);
    }
    apply();
  }

  function loadHls(callback) {
    if (window.Hls) {
      callback();
      return;
    }
    var existing = qs("script[data-hls-loader]");
    if (existing) {
      existing.addEventListener("load", callback, { once: true });
      return;
    }
    var script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js";
    script.async = true;
    script.setAttribute("data-hls-loader", "true");
    script.addEventListener("load", callback, { once: true });
    document.head.appendChild(script);
  }

  function initPlayers() {
    qsa("[data-player]").forEach(function (wrap) {
      var video = qs("video", wrap);
      var button = qs(".play-overlay", wrap);
      if (!video || !button) {
        return;
      }
      var source = video.getAttribute("data-src");
      var started = false;

      function start() {
        if (!source) {
          return;
        }
        button.classList.add("is-hidden");
        video.setAttribute("controls", "controls");

        function playVideo() {
          var promise = video.play();
          if (promise && promise.catch) {
            promise.catch(function () {
              button.classList.remove("is-hidden");
            });
          }
        }

        if (started) {
          playVideo();
          return;
        }

        started = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          video.addEventListener("loadedmetadata", playVideo, { once: true });
          return;
        }

        loadHls(function () {
          if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
              maxBufferLength: 30,
              enableWorker: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
            hls.on(window.Hls.Events.ERROR, function () {
              if (!video.src) {
                video.src = source;
              }
            });
          } else {
            video.src = source;
            video.addEventListener("loadedmetadata", playVideo, { once: true });
          }
        });
      }

      button.addEventListener("click", start);
      video.addEventListener("click", function () {
        if (!started || video.paused) {
          start();
        }
      });
    });
  }

  function initImages() {
    qsa("img").forEach(function (img) {
      img.addEventListener("error", function () {
        img.style.opacity = "0";
      }, { once: true });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMobileNav();
    initHero();
    initHeaderSearch();
    initFilters();
    initPlayers();
    initImages();
  });
})();
