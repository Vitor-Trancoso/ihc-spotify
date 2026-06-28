/* ============================================================
   T7 — PERSONALIZAR HOME (V2.5)
   ============================================================ */
(function () {
  'use strict';

  const STORAGE_KEY = 'spotify_home_modules';
  const TELA = 't7';

  // Defaults: ordem + estado on/off
  const DEFAULT_MODULES = [
    { id: 'recentes',    nome: 'Tocados recentemente',     desc: 'O que você ouviu nos últimos dias',         on: true  },
    { id: 'mixes',       nome: 'Seus Mixes',               desc: 'Mixes personalizados por gênero e humor',   on: true  },
    { id: 'feito-pra-ti',nome: 'Feito para você',          desc: 'Daily Mixes, Discover Weekly e mais',       on: true  },
    { id: 'artistas',    nome: 'Artistas que você segue',  desc: 'Novidades dos artistas que você curte',     on: true  },
    { id: 'editorial',   nome: 'Editorial Spotify',        desc: 'Playlists selecionadas pela equipe',        on: false },
    { id: 'podcasts',    nome: 'Podcasts populares',       desc: 'O que está bombando em podcasts',           on: false },
    { id: 'audiolivros', nome: 'Audiolivros recomendados', desc: 'Sugestões baseadas no seu gosto',           on: false },
    { id: 'amigos',      nome: 'Novidades de quem você segue', desc: 'Atividade social dos seus amigos',     on: false }
  ];

  let modules = loadModules();
  let dirty = false;

  function loadModules() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return clone(DEFAULT_MODULES);
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || !parsed.length) return clone(DEFAULT_MODULES);
      // merge: garantir que módulos novos do default apareçam
      const byId = {};
      parsed.forEach(m => { byId[m.id] = m; });
      const merged = [];
      // primeiro os que já existiam na ordem salva
      parsed.forEach(m => {
        const def = DEFAULT_MODULES.find(d => d.id === m.id);
        if (def) merged.push({ id: m.id, nome: def.nome, desc: def.desc, on: !!m.on });
      });
      // depois os novos que não estavam salvos
      DEFAULT_MODULES.forEach(d => {
        if (!byId[d.id]) merged.push(clone(d));
      });
      return merged;
    } catch (e) {
      return clone(DEFAULT_MODULES);
    }
  }

  function clone(arr) { return JSON.parse(JSON.stringify(arr)); }

  function saveModules() {
    try {
      const payload = modules.map(m => ({ id: m.id, on: m.on }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) { /* ignore */ }
  }

  function renderModules() {
    const list = document.getElementById('t7-modules');
    if (!list) return;
    list.innerHTML = '';

    modules.forEach((m, idx) => {
      const li = window.el('li', {
        class: 't7-module',
        'data-id': m.id,
        'data-idx': String(idx),
        draggable: 'false'
      });

      // handle
      const handle = window.el('span', {
        class: 't7-module__handle',
        'aria-label': 'Arrastar para reordenar',
        role: 'button',
        tabindex: '0'
      });
      handle.innerHTML = '<i data-lucide="grip-vertical" aria-hidden="true"></i>';
      handle.addEventListener('pointerdown', () => {
        li.classList.add('is-dragging');
        window.Telemetria && window.Telemetria.logEvent(TELA, 'drag-iniciado', { modulo: m.id });
      });
      handle.addEventListener('pointerup',   () => li.classList.remove('is-dragging'));
      handle.addEventListener('pointercancel', () => li.classList.remove('is-dragging'));
      handle.addEventListener('pointerleave',  () => li.classList.remove('is-dragging'));

      // info
      const info = window.el('div', { class: 't7-module__info' });
      info.appendChild(window.el('p', { class: 't7-module__name', text: m.nome }));
      info.appendChild(window.el('p', { class: 't7-module__desc', text: m.desc }));

      // switch
      const sw = window.el('label', { class: 't7-switch', 'aria-label': 'Mostrar ' + m.nome });
      const input = window.el('input', {
        type: 'checkbox',
        role: 'switch',
        'aria-checked': m.on ? 'true' : 'false'
      });
      if (m.on) input.checked = true;
      input.addEventListener('change', () => {
        m.on = input.checked;
        input.setAttribute('aria-checked', m.on ? 'true' : 'false');
        dirty = true;
        markUnsaved();
        window.Telemetria && window.Telemetria.logEvent(TELA, 'toggle-modulo', {
          modulo: m.id,
          novo_estado: m.on
        });
      });
      const track = window.el('span', { class: 't7-switch__track', 'aria-hidden': 'true' });
      const thumb = window.el('span', { class: 't7-switch__thumb', 'aria-hidden': 'true' });
      sw.appendChild(input);
      sw.appendChild(track);
      sw.appendChild(thumb);

      li.appendChild(handle);
      li.appendChild(info);
      li.appendChild(sw);
      list.appendChild(li);
    });

    if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
  }

  function markUnsaved() {
    const btn = document.getElementById('t7-save');
    if (btn) {
      btn.classList.remove('is-saved');
      btn.textContent = 'Salvar';
    }
  }

  function markSaved() {
    const btn = document.getElementById('t7-save');
    if (btn) {
      btn.classList.add('is-saved');
      btn.textContent = 'Salvo';
      setTimeout(() => {
        btn.classList.remove('is-saved');
        btn.textContent = 'Salvar';
      }, 1500);
    }
  }

  function onSave() {
    saveModules();
    dirty = false;
    const ativos = modules.filter(m => m.on).map(m => m.id);
    window.Telemetria && window.Telemetria.logEvent(TELA, 'salvar', {
      total: modules.length,
      ativos: ativos.length,
      ids_ativos: ativos
    });
    markSaved();
  }

  function onRestore() {
    modules = clone(DEFAULT_MODULES);
    saveModules();
    renderModules();
    dirty = false;
    window.Telemetria && window.Telemetria.logEvent(TELA, 'restaurar-padrao', {});
    markSaved();
  }

  function init() {
    renderModules();

    const saveBtn = document.getElementById('t7-save');
    if (saveBtn) saveBtn.addEventListener('click', onSave);

    const restoreBtn = document.getElementById('t7-restore');
    if (restoreBtn) restoreBtn.addEventListener('click', onRestore);

    window.Telemetria && window.Telemetria.logEvent(TELA, 'view', {
      total: modules.length,
      ativos: modules.filter(m => m.on).length
    });

    if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
