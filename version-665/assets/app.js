(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMobileNav() {
    var toggle = qs('.menu-toggle');
    var menu = qs('.mobile-nav');
    if (!toggle || !menu) return;
    toggle.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function setupHero() {
    var slides = qsa('.hero-slide');
    var dots = qsa('.hero-dot');
    if (!slides.length) return;
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function play() {
      timer = setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        clearInterval(timer);
        show(i);
        play();
      });
    });

    show(0);
    play();
  }

  function setupFilters() {
    var panels = qsa('[data-filter-panel]');
    panels.forEach(function (panel) {
      var input = qs('[data-filter-input]', panel);
      var region = qs('[data-filter-region]', panel);
      var year = qs('[data-filter-year]', panel);
      var scopeSelector = panel.getAttribute('data-filter-panel') || 'body';
      var scope = qs(scopeSelector) || document;
      var items = qsa('.filter-item', scope);
      var empty = qs('.empty-state', scope.parentNode || document);

      function apply() {
        var keyword = input ? input.value.trim().toLowerCase() : '';
        var regionValue = region ? region.value : '';
        var yearValue = year ? year.value : '';
        var visible = 0;
        items.forEach(function (item) {
          var haystack = [
            item.dataset.title || '',
            item.dataset.region || '',
            item.dataset.year || '',
            item.dataset.genre || '',
            item.dataset.tags || ''
          ].join(' ').toLowerCase();
          var okKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var okRegion = !regionValue || item.dataset.region === regionValue;
          var okYear = !yearValue || item.dataset.year === yearValue;
          var ok = okKeyword && okRegion && okYear;
          item.style.display = ok ? '' : 'none';
          if (ok) visible += 1;
        });
        if (empty) {
          empty.style.display = visible ? 'none' : 'block';
        }
      }

      [input, region, year].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
      apply();
    });
  }

  function setupSearchPage() {
    var input = qs('[data-filter-input]');
    if (!input) return;
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q) {
      input.value = q;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  function setupPlayer() {
    var video = qs('#mainVideo');
    var overlay = qs('.video-play-overlay');
    var errorBox = qs('.player-error');
    if (!video) return;
    var stream = video.getAttribute('data-stream');
    var loaded = false;
    var hlsInstance = null;

    function showError() {
      if (errorBox) {
        errorBox.textContent = '暂时无法播放，请稍后再试';
        errorBox.classList.add('show');
      }
    }

    function attachStream() {
      if (loaded || !stream) return;
      loaded = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) showError();
        });
      } else {
        showError();
      }
    }

    function startPlayback() {
      attachStream();
      if (overlay) overlay.classList.add('hidden');
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener('click', startPlayback);
    }
    video.addEventListener('click', function () {
      if (!loaded || video.paused) {
        startPlayback();
      }
    });
    video.addEventListener('error', showError);
    window.addEventListener('pagehide', function () {
      if (hlsInstance) hlsInstance.destroy();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileNav();
    setupHero();
    setupFilters();
    setupSearchPage();
    setupPlayer();
  });
})();
