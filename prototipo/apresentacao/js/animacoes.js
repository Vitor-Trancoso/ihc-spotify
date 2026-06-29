/* ============================================================
   APRESENTAÇÃO — ANIMAÇÕES (utilitários)
   ============================================================ */
(function () {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  function countUp(el, from, to, duration, formatter) {
    if (!el) return;
    duration = duration || 1500;
    formatter = formatter || ((v) => String(Math.round(v)));
    if (reducedMotion) { el.textContent = formatter(to); return; }
    const start = performance.now();
    const delta = to - from;
    function step(now) {
      const t = Math.min(1, (now - start) / duration);
      const v = from + delta * easeOutCubic(t);
      el.textContent = formatter(v);
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function barFill(el, pct, duration) {
    if (!el) return;
    duration = duration || 1000;
    el.style.setProperty('--fill-width', pct + '%');
    el.style.transitionDuration = duration + 'ms';
    // Force reflow then add class
    void el.offsetWidth;
    el.classList.add('is-animated');
    el.style.width = pct + '%';
  }

  function revealOnEnter(slide) {
    if (!slide) return;
    // count-up
    slide.querySelectorAll('.anim-count').forEach((el) => {
      const to   = parseFloat(el.dataset.to ?? el.textContent) || 0;
      const from = parseFloat(el.dataset.from) || 0;
      const dur  = parseInt(el.dataset.duration) || 1500;
      const decimals = parseInt(el.dataset.decimals) || 0;
      const suffix = el.dataset.suffix || '';
      const prefix = el.dataset.prefix || '';
      const fmt = (v) => prefix + v.toFixed(decimals).replace('.', el.dataset.decimalSep || ',') + suffix;
      countUp(el, from, to, dur, fmt);
    });
    // bar fill
    slide.querySelectorAll('.anim-bar').forEach((el) => {
      const pct = parseFloat(el.dataset.fill) || 0;
      const dur = parseInt(el.dataset.duration) || 1000;
      setTimeout(() => barFill(el, pct, dur), parseInt(el.dataset.delay) || 0);
    });
  }

  function confetti(n, duration) {
    if (reducedMotion) return;
    n = n || 30;
    duration = duration || 4000;
    const stage = document.getElementById('apr-stage');
    if (!stage) return;
    const colors = ['#1ed760', '#1DB954', '#ffffff', '#f5d76e'];
    for (let i = 0; i < n; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.style.left = Math.random() * 100 + '%';
      piece.style.background = colors[i % colors.length];
      piece.style.animationDelay = (Math.random() * 1.5) + 's';
      piece.style.animationDuration = (duration / 1000 + Math.random()) + 's';
      stage.appendChild(piece);
      setTimeout(() => piece.remove(), duration + 2000);
    }
  }

  // Listen for slide-enter custom event from nav.js
  document.addEventListener('slide-enter', (ev) => {
    const slide = ev.detail && ev.detail.element;
    if (slide) revealOnEnter(slide);
  });

  // Expose
  window.AprAnim = { countUp, barFill, revealOnEnter, confetti };
})();
