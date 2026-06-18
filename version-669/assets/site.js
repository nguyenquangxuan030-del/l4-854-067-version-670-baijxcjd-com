(function () {
  'use strict';

  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initMobileNav() {
    var button = document.querySelector('[data-mobile-menu-button]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
      button.classList.toggle('is-open');
    });
  }

  function initHeroSlider() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var prev = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
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

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function initPlayers() {
    var frames = document.querySelectorAll('[data-player]');
    frames.forEach(function (frame) {
      var video = frame.querySelector('video');
      var button = frame.querySelector('[data-player-button]');
      var status = frame.querySelector('[data-player-status]');
      var source = frame.getAttribute('data-src');
      var hlsInstance = null;
      var initialized = false;

      function setStatus(message) {
        if (status) {
          status.textContent = message;
        }
      }

      function initializeSource() {
        if (initialized || !video || !source) {
          return;
        }
        initialized = true;
        setStatus('正在初始化 HLS 播放源…');

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setStatus('播放源已就绪');
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setStatus('播放遇到错误，正在尝试恢复…');
              if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                hlsInstance.startLoad();
              } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                hlsInstance.recoverMediaError();
              } else {
                hlsInstance.destroy();
              }
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          setStatus('浏览器原生 HLS 播放已启用');
        } else {
          setStatus('当前浏览器需要 HLS.js 支持，请保持网络可访问 CDN。');
        }
      }

      function play() {
        initializeSource();
        if (!video) {
          return;
        }
        frame.classList.add('is-playing');
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            setStatus('浏览器阻止了自动播放，请再次点击播放按钮。');
            frame.classList.remove('is-playing');
          });
        }
      }

      if (button) {
        button.addEventListener('click', play);
      }
      if (video) {
        video.addEventListener('play', function () {
          frame.classList.add('is-playing');
          setStatus('正在播放');
        });
        video.addEventListener('pause', function () {
          setStatus('已暂停');
        });
        video.addEventListener('ended', function () {
          setStatus('播放结束');
          frame.classList.remove('is-playing');
        });
      }
      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function createCard(movie) {
    var tags = [movie.category, movie.year + '年'].join(' · ');
    return [
      '<a class="movie-card" href="' + movie.url + '">',
      '  <div class="movie-card__cover">',
      '    <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <span class="movie-card__duration">' + escapeHtml(movie.duration) + '</span>',
      '    <span class="movie-card__play" aria-hidden="true">▶</span>',
      '  </div>',
      '  <div class="movie-card__body">',
      '    <div class="movie-card__eyebrow"><span>' + escapeHtml(tags) + '</span></div>',
      '    <h3>' + escapeHtml(movie.title) + '</h3>',
      '    <p>' + escapeHtml(movie.oneLine || '') + '</p>',
      '    <div class="movie-card__meta">',
      '      <span>' + escapeHtml(movie.region) + '</span>',
      '      <span>' + escapeHtml(movie.type) + '</span>',
      '      <span>' + Number(movie.views || 0).toLocaleString() + '</span>',
      '    </div>',
      '  </div>',
      '</a>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[char];
    });
  }

  function initSearchPage() {
    var page = document.querySelector('[data-search-page]');
    if (!page || !window.MOVIES) {
      return;
    }
    var form = page.querySelector('[data-search-form]');
    var input = page.querySelector('[data-search-input]');
    var type = page.querySelector('[data-type-filter]');
    var region = page.querySelector('[data-region-filter]');
    var year = page.querySelector('[data-year-filter]');
    var resultBox = page.querySelector('[data-search-results]');
    var summary = page.querySelector('[data-search-summary]');
    var params = new URLSearchParams(window.location.search);

    if (params.get('q')) {
      input.value = params.get('q');
    }
    if (params.get('type')) {
      type.value = params.get('type');
    }
    if (params.get('region')) {
      region.value = params.get('region');
    }
    if (params.get('year')) {
      year.value = params.get('year');
    }

    function apply() {
      var keyword = normalize(input.value);
      var typeValue = normalize(type.value);
      var regionValue = normalize(region.value);
      var yearValue = normalize(year.value);
      var filtered = window.MOVIES.filter(function (movie) {
        var text = normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.genre,
          movie.category,
          movie.oneLine,
          (movie.tags || []).join(' ')
        ].join(' '));
        return (!keyword || text.indexOf(keyword) !== -1) &&
          (!typeValue || normalize(movie.type) === typeValue) &&
          (!regionValue || normalize(movie.region) === regionValue) &&
          (!yearValue || String(movie.year) === yearValue);
      }).sort(function (a, b) {
        return Number(b.views || 0) - Number(a.views || 0);
      });

      var limited = filtered.slice(0, 120);
      resultBox.innerHTML = limited.map(createCard).join('');
      summary.textContent = '找到 ' + filtered.length + ' 个结果，当前展示前 ' + limited.length + ' 个。';
      var nextParams = new URLSearchParams();
      if (keyword) {
        nextParams.set('q', input.value.trim());
      }
      if (type.value) {
        nextParams.set('type', type.value);
      }
      if (region.value) {
        nextParams.set('region', region.value);
      }
      if (year.value) {
        nextParams.set('year', year.value);
      }
      var nextUrl = window.location.pathname + (nextParams.toString() ? '?' + nextParams.toString() : '');
      window.history.replaceState(null, '', nextUrl);
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      apply();
    });
    [input, type, region, year].forEach(function (control) {
      control.addEventListener('change', apply);
    });
    input.addEventListener('input', function () {
      window.clearTimeout(input.searchTimer);
      input.searchTimer = window.setTimeout(apply, 180);
    });
    if (window.location.search) {
      apply();
    }
  }

  ready(function () {
    initMobileNav();
    initHeroSlider();
    initPlayers();
    initSearchPage();
  });
})();
