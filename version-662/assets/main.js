const header = document.querySelector('[data-header]');
const menuToggle = document.querySelector('[data-menu-toggle]');
const mobilePanel = document.querySelector('[data-mobile-panel]');
const base = document.body.dataset.base || '';

if (header) {
  window.addEventListener('scroll', () => {
    header.classList.toggle('is-scrolled', window.scrollY > 12);
  });
}

if (menuToggle && mobilePanel) {
  menuToggle.addEventListener('click', () => {
    mobilePanel.classList.toggle('is-open');
  });
}

function setupHeroSlider() {
  const hero = document.querySelector('[data-hero]');
  if (!hero) return;

  const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
  let active = 0;

  function show(index) {
    active = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === active);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === active);
    });
  }

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => show(index));
  });

  if (slides.length > 1) {
    setInterval(() => show(active + 1), 5200);
  }
}

setupHeroSlider();

async function loadSearchIndex() {
  const url = new URL('../data/search-index.json', import.meta.url);
  const response = await fetch(url.href);
  if (!response.ok) {
    throw new Error('search index load failed');
  }
  return response.json();
}

function normalize(value) {
  return String(value || '').trim().toLowerCase();
}

function renderSearchResults(target, keyword, items) {
  if (!target) return;

  target.classList.add('is-visible');
  if (!keyword) {
    target.innerHTML = '<h2>搜索影片</h2><p>请输入片名、题材、地区或年份。</p>';
    return;
  }

  const rows = items.slice(0, 30).map((item) => `
    <a href="${base}${item.url}">
      <strong>${item.title}</strong>
      <p>${item.year} · ${item.region} · ${item.type} · ${item.genre}</p>
    </a>
  `).join('');

  target.innerHTML = `
    <h2>“${keyword}” 的搜索结果</h2>
    <p>找到 ${items.length} 部相关影片，显示前 ${Math.min(items.length, 30)} 部。</p>
    <div class="search-result-list">${rows || '<p>暂无匹配结果。</p>'}</div>
  `;
}

function setupSearchForms() {
  const forms = Array.from(document.querySelectorAll('[data-search-form]'));
  const target = document.querySelector('[data-search-results]');

  forms.forEach((form) => {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const input = form.querySelector('input[name="q"]');
      const keyword = input ? input.value.trim() : '';

      if (!target) {
        window.location.href = `${base}search.html?q=${encodeURIComponent(keyword)}`;
        return;
      }

      const data = await loadSearchIndex();
      const query = normalize(keyword);
      const results = data.filter((item) => normalize([
        item.title,
        item.year,
        item.region,
        item.type,
        item.genre,
        item.tags,
        item.oneLine
      ].join(' ')).includes(query));

      renderSearchResults(target, keyword, results);
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

setupSearchForms();

async function setupSearchPage() {
  const target = document.querySelector('[data-search-results]');
  const pageForm = document.querySelector('[data-page-search-form]');
  if (!target || !pageForm) return;

  const params = new URLSearchParams(window.location.search);
  const initialKeyword = params.get('q') || '';
  const input = pageForm.querySelector('input[name="q"]');
  if (input) input.value = initialKeyword;

  async function search(keyword) {
    const data = await loadSearchIndex();
    const query = normalize(keyword);
    const results = query
      ? data.filter((item) => normalize([
          item.title,
          item.year,
          item.region,
          item.type,
          item.genre,
          item.tags,
          item.oneLine
        ].join(' ')).includes(query))
      : [];
    renderSearchResults(target, keyword, results);
  }

  pageForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const keyword = input ? input.value.trim() : '';
    history.replaceState(null, '', `?q=${encodeURIComponent(keyword)}`);
    search(keyword);
  });

  if (initialKeyword) {
    search(initialKeyword);
  }
}

setupSearchPage();

function setupCategoryFilter() {
  const input = document.querySelector('[data-filter-input]');
  const cards = Array.from(document.querySelectorAll('[data-title]'));
  if (!input || cards.length === 0) return;

  input.addEventListener('input', () => {
    const query = normalize(input.value);
    cards.forEach((card) => {
      const text = normalize([
        card.dataset.title,
        card.dataset.genre,
        card.dataset.region,
        card.dataset.year
      ].join(' '));
      card.hidden = query && !text.includes(query);
    });
  });
}

setupCategoryFilter();

async function activatePlayer(player) {
  const video = player.querySelector('video');
  const source = player.dataset.src;
  const button = player.querySelector('[data-play-button]');
  if (!video || !source) return;

  if (button) {
    button.disabled = true;
    button.textContent = '正在加载...';
  }

  try {
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else {
      const moduleUrl = new URL('hls.js', import.meta.url);
      const { H: Hls } = await import(moduleUrl.href);
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    player.classList.add('is-playing');
    video.setAttribute('controls', 'controls');
    await video.play();
  } catch (error) {
    player.classList.remove('is-playing');
    if (button) {
      button.disabled = false;
      button.textContent = '重新播放';
    }
    console.error(error);
  }
}

function setupPlayers() {
  document.querySelectorAll('[data-player]').forEach((player) => {
    const button = player.querySelector('[data-play-button]');
    if (button) {
      button.addEventListener('click', () => activatePlayer(player));
    }
  });
}

setupPlayers();
