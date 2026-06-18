
import { H as Hls } from "./video-player-dru42stk.js";

const ready = (fn) => {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fn);
  } else {
    fn();
  }
};

const escapeHtml = (value) => {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
};

const setupMenu = () => {
  const button = document.querySelector("[data-menu-toggle]");
  const header = document.querySelector(".site-header");
  if (!button || !header) {
    return;
  }
  button.addEventListener("click", () => {
    header.classList.toggle("menu-open");
  });
};

const setupHero = () => {
  const slider = document.querySelector("[data-hero-slider]");
  if (!slider) {
    return;
  }
  const slides = [...slider.querySelectorAll("[data-hero-slide]")];
  const dots = [...slider.querySelectorAll("[data-hero-dot]")];
  if (slides.length <= 1) {
    return;
  }
  let current = 0;
  let timer = null;
  const show = (index) => {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("active", slideIndex === current);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("active", dotIndex === current);
    });
  };
  const start = () => {
    window.clearInterval(timer);
    timer = window.setInterval(() => show(current + 1), 5600);
  };
  dots.forEach((dot, dotIndex) => {
    dot.addEventListener("click", () => {
      show(dotIndex);
      start();
    });
  });
  slider.addEventListener("mouseenter", () => window.clearInterval(timer));
  slider.addEventListener("mouseleave", start);
  start();
};

const setupPlayers = () => {
  const players = [...document.querySelectorAll("video[data-video-src]")];
  players.forEach((video) => {
    const source = video.dataset.videoSrc;
    const shell = video.closest("[data-player]");
    const playButton = shell?.querySelector("[data-player-play]");
    let initialized = false;
    let hls = null;

    const init = () => {
      if (initialized || !source) {
        return;
      }
      initialized = true;
      if (Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      }
    };

    const play = async () => {
      init();
      try {
        await video.play();
      } catch (error) {
        shell?.classList.remove("is-playing");
      }
    };

    init();

    playButton?.addEventListener("click", play);
    video.addEventListener("click", () => {
      if (video.paused) {
        play();
      } else {
        video.pause();
      }
    });
    video.addEventListener("play", () => shell?.classList.add("is-playing"));
    video.addEventListener("pause", () => shell?.classList.remove("is-playing"));
    video.addEventListener("ended", () => shell?.classList.remove("is-playing"));
    window.addEventListener("pagehide", () => {
      if (hls) {
        hls.destroy();
      }
    });
  });
};

const createSearchCard = (item) => {
  const tags = (item.tags || [])
    .slice(0, 2)
    .map((tag) => `<span>${escapeHtml(tag)}</span>`)
    .join("");
  return `
    <a class="movie-card" href="${escapeHtml(item.href)}">
      <figure class="movie-poster">
        <img src="${escapeHtml(item.cover)}" alt="${escapeHtml(item.title)}" loading="lazy">
        <span class="poster-badge">${escapeHtml(item.region || item.type)}</span>
        <span class="poster-play" aria-hidden="true">▶</span>
      </figure>
      <div class="movie-card-body">
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.oneLine || item.genre || "")}</p>
        <div class="movie-meta">
          <span>${escapeHtml(item.year)}</span>
          <span>${escapeHtml(item.genre || item.type)}</span>
        </div>
        <div class="movie-tags">${tags}</div>
      </div>
    </a>
  `;
};

const setupSearch = () => {
  const results = document.querySelector("[data-search-results]");
  const title = document.querySelector("[data-search-title]");
  const input = document.querySelector("[data-search-input]");
  if (!results || !window.SEARCH_DATA) {
    return;
  }
  const params = new URLSearchParams(window.location.search);
  const query = (params.get("q") || "").trim();
  if (input) {
    input.value = query;
  }
  if (!query) {
    return;
  }
  const lowerQuery = query.toLowerCase();
  const matched = window.SEARCH_DATA.filter((item) => {
    const haystack = [
      item.title,
      item.region,
      item.type,
      item.year,
      item.genre,
      item.oneLine,
      ...(item.tags || [])
    ].join(" ").toLowerCase();
    return haystack.includes(lowerQuery);
  }).slice(0, 120);
  if (title) {
    title.textContent = `搜索结果：${query}`;
  }
  results.innerHTML = matched.length
    ? matched.map(createSearchCard).join("")
    : `<div class="empty-result">没有匹配条目，可以换一个关键词继续搜索。</div>`;
};

ready(() => {
  setupMenu();
  setupHero();
  setupPlayers();
  setupSearch();
});
