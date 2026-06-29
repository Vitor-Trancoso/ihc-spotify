/* ============================================================
   APRESENTAÇÃO — ROTEADOR / NAVEGAÇÃO
   ============================================================ */
(function () {
  'use strict';

  const SLIDES = [
    '01-capa', '02-tema', '03-problema', '04-jornada', '05-heuristicas',
    '06-amostra', '07-confiabilidade', '08-dores', '09-free-premium', '10-caminho-c',
    '11-shapes', '12-inovacoes', '13-demo', '14-cobertura', '15-entrevistas-metodo',
    '16-citacoes', '17-insights', '18-conclusoes', '19-obrigado', '20-backup'
  ];

  const stage     = document.getElementById('apr-stage');
  const progress  = document.getElementById('apr-progress');
  const counter   = document.getElementById('apr-counter');
  const helpEl    = document.getElementById('apr-help');
  const prevBtn   = document.getElementById('apr-prev');
  const nextBtn   = document.getElementById('apr-next');

  const cache = new Map();           // n -> HTMLElement
  const cacheOrder = [];             // LRU
  const MAX_CACHE = 3;

  const state = {
    current: 1,
    total: SLIDES.length,
    slides: SLIDES
  };
  window.AprNav = state;

  function pad(n) { return String(n).padStart(2, '0'); }

  function updateChrome() {
    if (progress) progress.style.width = ((state.current / state.total) * 100) + '%';
    if (counter)  counter.textContent = pad(state.current) + ' / ' + pad(state.total);
    if (location.hash !== '#/' + state.current) {
      history.replaceState(null, '', '#/' + state.current);
    }
  }

  function evictOld() {
    while (cacheOrder.length > MAX_CACHE) {
      const old = cacheOrder.shift();
      if (old === state.current) { cacheOrder.push(old); continue; }
      const el = cache.get(old);
      if (el && el.parentNode) el.parentNode.removeChild(el);
      cache.delete(old);
    }
  }

  async function fetchSlide(n) {
    if (cache.has(n)) return cache.get(n);
    const file = SLIDES[n - 1];
    if (!file) return null;
    const url = 'slides/' + file + '.html';
    let html = '';
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      html = await res.text();
    } catch (err) {
      html = '<div class="slide__content"><h1>Erro ao carregar slide ' + n + '</h1><p>' + (err && err.message) + '</p></div>';
    }
    const section = document.createElement('section');
    section.className = 'slide';
    section.id = 'slide-' + pad(n);
    section.dataset.slideId = pad(n);
    section.dataset.n = String(n);
    section.innerHTML = html;
    stage.appendChild(section);
    cache.set(n, section);
    cacheOrder.push(n);
    evictOld();
    return section;
  }

  async function goTo(n, opts) {
    n = Math.max(1, Math.min(state.total, n));
    if (n === state.current && opts && opts.force !== true && cache.has(n)) {
      // already there
    }
    const prev = state.current;
    const prevEl = cache.get(prev);
    const nextEl = await fetchSlide(n);
    if (!nextEl) return;

    // Mark transitions
    if (prevEl && prevEl !== nextEl) {
      prevEl.classList.remove('is-active');
      prevEl.classList.add('is-leaving');
      // Clear leaving after transition
      setTimeout(() => { prevEl.classList.remove('is-leaving'); }, 500);
    }

    // re-trigger animations: remove then add
    nextEl.classList.remove('is-active');
    // Force reflow
    void nextEl.offsetWidth;
    nextEl.classList.add('is-active');

    state.current = n;
    updateChrome();

    // Emit slide-enter event
    document.dispatchEvent(new CustomEvent('slide-enter', { detail: { n, element: nextEl } }));

    // Re-init lucide icons if present
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      try { window.lucide.createIcons(); } catch {}
    }
  }

  function next() { goTo(state.current + 1); }
  function prev() { goTo(state.current - 1); }

  // ---- Keyboard ----
  document.addEventListener('keydown', (e) => {
    if (e.target && /^(INPUT|TEXTAREA)$/.test(e.target.tagName)) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;

    switch (e.key) {
      case 'ArrowRight':
      case 'PageDown':
      case ' ':
      case 'n':
      case 'N':
        next(); e.preventDefault(); break;
      case 'ArrowLeft':
      case 'PageUp':
        prev(); e.preventDefault(); break;
      case 'Home': goTo(1); e.preventDefault(); break;
      case 'End':  goTo(state.total); e.preventDefault(); break;
      case 'f': case 'F':
        toggleFullscreen(); e.preventDefault(); break;
      case 'o': case 'O':
        toggleOverview(); e.preventDefault(); break;
      case '?':
        if (helpEl) helpEl.hidden = !helpEl.hidden;
        e.preventDefault(); break;
      default:
        if (/^[1-9]$/.test(e.key)) { goTo(parseInt(e.key, 10)); e.preventDefault(); }
    }
  });

  // ---- Click halves (desktop & mobile) ----
  stage.addEventListener('click', (e) => {
    // ignore clicks on interactive elements
    if (e.target.closest('a, button, input, iframe, [data-no-nav]')) return;
    const rect = stage.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x > rect.width / 2) next(); else prev();
  });

  // ---- Touch swipe ----
  let touchStart = null;
  stage.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1) return;
    const t = e.touches[0];
    touchStart = { x: t.clientX, y: t.clientY, time: Date.now() };
  }, { passive: true });
  stage.addEventListener('touchend', (e) => {
    if (!touchStart) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.x;
    const dy = t.clientY - touchStart.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4) {
      if (dx < 0) next(); else prev();
    }
    touchStart = null;
  }, { passive: true });

  // ---- Buttons ----
  if (prevBtn) prevBtn.addEventListener('click', (e) => { e.stopPropagation(); prev(); });
  if (nextBtn) nextBtn.addEventListener('click', (e) => { e.stopPropagation(); next(); });

  // ---- Hash routing ----
  function parseHash() {
    const m = (location.hash || '').match(/^#\/(\d+)/);
    if (m) {
      const n = parseInt(m[1], 10);
      if (n >= 1 && n <= state.total) return n;
    }
    return null;
  }
  window.addEventListener('hashchange', () => {
    const n = parseHash();
    if (n && n !== state.current) goTo(n);
  });

  // ---- Fullscreen ----
  function toggleFullscreen() {
    const root = document.documentElement;
    if (!document.fullscreenElement) {
      (root.requestFullscreen || root.webkitRequestFullscreen || function () {}).call(root);
    } else {
      (document.exitFullscreen || document.webkitExitFullscreen || function () {}).call(document);
    }
  }

  // ---- Overview grid (toggle) ----
  let overviewOn = false;
  async function toggleOverview() {
    overviewOn = !overviewOn;
    if (!overviewOn) {
      document.body.classList.remove('apr-overview');
      // Re-show current only
      cache.forEach((el, n) => {
        el.style.transform = '';
        el.style.opacity = '';
        el.style.position = '';
        el.style.width = '';
        el.style.height = '';
        el.style.left = '';
        el.style.top = '';
        el.style.zoom = '';
      });
      goTo(state.current, { force: true });
      return;
    }
    document.body.classList.add('apr-overview');
    // Preload all slides quickly
    for (let i = 1; i <= state.total; i++) await fetchSlide(i);
    // Grid layout via inline styles (avoid extra CSS file)
    const cols = 5;
    const w = window.innerWidth / cols;
    const h = window.innerHeight / Math.ceil(state.total / cols);
    cache.forEach((el, n) => {
      const idx = n - 1;
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      el.classList.add('is-active');
      el.style.position = 'absolute';
      el.style.width = w + 'px';
      el.style.height = h + 'px';
      el.style.left = (col * w) + 'px';
      el.style.top  = (row * h) + 'px';
      el.style.transform = 'none';
      el.style.opacity = '1';
      el.style.zoom = '0.2';
      el.style.cursor = 'pointer';
      el.style.border = '1px solid rgba(255,255,255,.08)';
      el.onclick = () => { overviewOn = true; toggleOverview(); goTo(n); };
    });
  }

  // ---- Init ----
  const initN = parseHash() || 1;
  goTo(initN);
})();
