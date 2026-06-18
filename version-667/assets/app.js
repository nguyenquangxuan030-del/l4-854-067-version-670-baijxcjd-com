(function () {
  function selectAll(root, selector) {
    return Array.prototype.slice.call(root.querySelectorAll(selector));
  }

  function text(value) {
    return (value || '').toString().toLowerCase().trim();
  }

  function initNav() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var links = document.querySelector('[data-nav-links]');
    if (!toggle || !links) {
      return;
    }
    toggle.addEventListener('click', function () {
      links.classList.toggle('open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = selectAll(hero, '[data-hero-slide]');
    var dots = selectAll(hero, '[data-hero-dot]');
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(parseInt(dot.getAttribute('data-hero-dot'), 10));
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

    restart();
  }

  function fillSelect(select, values) {
    if (!select) {
      return;
    }
    values.forEach(function (value) {
      if (!value) {
        return;
      }
      var option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function initFilters() {
    selectAll(document, '[data-filter-scope]').forEach(function (scope) {
      var cards = selectAll(scope, '[data-card]');
      if (!cards.length) {
        var next = scope.nextElementSibling;
        if (next && next.matches('[data-filter-scope]')) {
          cards = selectAll(next, '[data-card]');
        }
      }
      if (!cards.length) {
        return;
      }

      var keyword = scope.querySelector('[data-filter-keyword]');
      var region = scope.querySelector('[data-filter-region]');
      var type = scope.querySelector('[data-filter-type]');
      var year = scope.querySelector('[data-filter-year]');
      var regions = [];
      var types = [];

      cards.forEach(function (card) {
        var cardRegion = card.getAttribute('data-region') || '';
        var cardType = card.getAttribute('data-type') || '';
        if (cardRegion && regions.indexOf(cardRegion) === -1) {
          regions.push(cardRegion);
        }
        if (cardType && types.indexOf(cardType) === -1) {
          types.push(cardType);
        }
      });

      fillSelect(region, regions.sort());
      fillSelect(type, types.sort());

      function apply() {
        var q = text(keyword && keyword.value);
        var selectedRegion = region && region.value;
        var selectedType = type && type.value;
        var selectedYear = year && year.value;

        cards.forEach(function (card) {
          var haystack = text([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-year'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-tags')
          ].join(' '));
          var pass = true;
          if (q && haystack.indexOf(q) === -1) {
            pass = false;
          }
          if (selectedRegion && card.getAttribute('data-region') !== selectedRegion) {
            pass = false;
          }
          if (selectedType && card.getAttribute('data-type') !== selectedType) {
            pass = false;
          }
          if (selectedYear && card.getAttribute('data-year') !== selectedYear) {
            pass = false;
          }
          card.classList.toggle('is-hidden', !pass);
        });
      }

      [keyword, region, type, year].forEach(function (control) {
        if (!control) {
          return;
        }
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initNav();
    initHero();
    initFilters();
  });
})();
