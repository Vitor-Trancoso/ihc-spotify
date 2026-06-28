// Onboarding V2.8 — tour pós-update de 4 slides
(function () {
  var STORAGE_KEY = 'spotify_onboarding_v2_done';

  var SLIDES = [
    {
      title: 'O que mudou',
      text: 'Veja as novidades do app',
      illustration: { type: 'emoji', value: '🎉' }
    },
    {
      title: 'Perfil agora aqui ↘️',
      text: 'Toque no avatar para Configurações',
      illustration: { type: 'emoji', value: '↘️' }
    },
    {
      title: 'Long-press para selecionar várias',
      text: 'Em Biblioteca, segure uma playlist para escolher várias de uma vez',
      illustration: { type: 'icon', value: 'hand-pointer' }
    },
    {
      title: 'Descoberta tem aba própria',
      text: 'Use a aba Descoberta no menu inferior em vez de scroll infinito',
      illustration: { type: 'icon', value: 'compass' }
    }
  ];

  var current = 0;
  var rootEl = null;

  function esc(s) {
    return (window.escapeHTML ? window.escapeHTML(s) : String(s));
  }

  function markDone() {
    try { localStorage.setItem(STORAGE_KEY, '1'); } catch (_) {}
  }

  function logEv(alvo, meta) {
    try {
      if (window.telemetria && window.telemetria.logEvent) {
        window.telemetria.logEvent('onboarding', alvo, meta || {});
      }
    } catch (_) {}
  }

  function renderIllustration(ill) {
    if (ill.type === 'icon') {
      return '<i data-lucide="' + esc(ill.value) + '" aria-hidden="true"></i>';
    }
    return '<span aria-hidden="true">' + esc(ill.value) + '</span>';
  }

  function renderSlide(index) {
    var slide = SLIDES[index];
    var isLast = index === SLIDES.length - 1;
    var dots = SLIDES.map(function (_, i) {
      return '<span class="onboarding-dot' + (i === index ? ' onboarding-dot--active' : '') + '" aria-hidden="true"></span>';
    }).join('');

    return (
      '<p class="onboarding-step">Passo ' + (index + 1) + ' de ' + SLIDES.length + '</p>' +
      '<div class="onboarding-illustration">' + renderIllustration(slide.illustration) + '</div>' +
      '<h2 class="onboarding-title" id="onboarding-title">' + esc(slide.title) + '</h2>' +
      '<p class="onboarding-text">' + esc(slide.text) + '</p>' +
      '<div class="onboarding-footer">' +
        '<button type="button" class="onboarding-skip" data-action="skip">Pular</button>' +
        '<div class="onboarding-dots" role="tablist" aria-label="Progresso do tour">' + dots + '</div>' +
        '<button type="button" class="onboarding-next" data-action="next">' + (isLast ? 'Concluir' : 'Próximo') + '</button>' +
      '</div>'
    );
  }

  function ensureRoot() {
    if (rootEl) return rootEl;
    rootEl = document.createElement('div');
    rootEl.className = 'onboarding-backdrop';
    rootEl.setAttribute('hidden', '');
    rootEl.setAttribute('role', 'dialog');
    rootEl.setAttribute('aria-modal', 'true');
    rootEl.setAttribute('aria-labelledby', 'onboarding-title');
    rootEl.setAttribute('aria-live', 'polite');
    rootEl.innerHTML = '<div class="onboarding-card" tabindex="-1"></div>';
    document.body.appendChild(rootEl);

    // Tap fora fecha
    rootEl.addEventListener('click', function (ev) {
      if (ev.target === rootEl) {
        logEv('backdrop', { step: current + 1 });
        finish('backdrop');
      }
    });

    // Delegação de cliques
    rootEl.addEventListener('click', function (ev) {
      var btn = ev.target.closest('[data-action]');
      if (!btn) return;
      var action = btn.getAttribute('data-action');
      if (action === 'skip') {
        logEv('skip', { step: current + 1 });
        finish('skip');
      } else if (action === 'next') {
        if (current < SLIDES.length - 1) {
          current += 1;
          logEv('next', { step: current + 1 });
          paint();
        } else {
          logEv('done', { step: current + 1 });
          finish('done');
        }
      }
    });

    return rootEl;
  }

  function paint() {
    var card = rootEl.querySelector('.onboarding-card');
    card.innerHTML = renderSlide(current);
    if (window.lucide && window.lucide.createIcons) {
      try { window.lucide.createIcons(); } catch (_) {}
    }
    requestAnimationFrame(function () {
      var nextBtn = card.querySelector('.onboarding-next');
      if (nextBtn) nextBtn.focus();
    });
  }

  function finish(reason) {
    markDone();
    if (window.closeModal) {
      try { window.closeModal(); } catch (_) {}
    }
    if (rootEl) {
      rootEl.classList.remove('is-open');
      rootEl.setAttribute('hidden', '');
    }
  }

  function start() {
    current = 0;
    ensureRoot();
    paint();
    if (window.openModal) {
      window.openModal(rootEl, { onClose: function () { markDone(); } });
    } else {
      rootEl.removeAttribute('hidden');
    }
    rootEl.classList.add('is-open');
    logEv('start', { total: SLIDES.length });
  }

  window.startOnboarding = start;

  function autoStart() {
    var done = false;
    try { done = localStorage.getItem(STORAGE_KEY) === '1'; } catch (_) {}
    if (done) return;
    setTimeout(start, 800);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoStart);
  } else {
    autoStart();
  }
})();
