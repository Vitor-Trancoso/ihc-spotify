(function () {
  'use strict';

  const TELA = 'T1';
  const STORAGE_KEY = 'spotify_t1_feed_modules';

  const DEFAULT_MODULES = [
    { id: 'top-mixes',      nome: 'Seus Mixes',                   on: true  },
    { id: 'made-for-you',   nome: 'Feito para você',              on: true  },
    { id: 'albums',         nome: 'Álbuns para você',             on: true  },
    { id: 'fav-artists',    nome: 'Seus artistas favoritos',      on: true  },
    { id: 'audiobooks',     nome: 'Audiolivros para você',        on: true  },
    { id: 'originals',      nome: 'Podcasts Originais Spotify',   on: true  },
    { id: 'your-playlists', nome: 'Suas playlists',               on: true  },
    { id: 'recent',         nome: 'Tocados recentemente',         on: true  },
    { id: 'new-releases',   nome: 'Novos lançamentos',            on: true  },
    { id: 'radio',          nome: 'Rádio recomendada',            on: false },
    { id: 'episodes',       nome: 'Episódios para você',          on: false }
  ];

  let modules = loadModules();

  function clone(arr) { return JSON.parse(JSON.stringify(arr)); }

  function loadModules() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return clone(DEFAULT_MODULES);
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || !parsed.length) return clone(DEFAULT_MODULES);
      const byId = {};
      parsed.forEach(m => { byId[m.id] = m; });
      const merged = [];
      parsed.forEach(m => {
        const def = DEFAULT_MODULES.find(d => d.id === m.id);
        if (def) merged.push({ id: m.id, nome: def.nome, on: !!m.on });
      });
      DEFAULT_MODULES.forEach(d => {
        if (!byId[d.id]) merged.push(clone(d));
      });
      return merged;
    } catch (e) { return clone(DEFAULT_MODULES); }
  }

  function saveModules() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(
        modules.map(m => ({ id: m.id, on: m.on }))
      ));
    } catch (e) {}
  }

  function tlog(alvo, meta) {
    if (window.Telemetria) window.Telemetria.log(TELA, alvo, meta || {});
  }

  function renderList() {
    const $list = document.getElementById('t1-pf-list');
    if (!$list) return;
    $list.innerHTML = '';
    modules.forEach((m, idx) => {
      const li = document.createElement('li');
      li.className = 't1-pf-item' + (m.on ? '' : ' is-hidden');
      li.setAttribute('data-id', m.id);
      li.setAttribute('data-idx', String(idx));

      const pin = document.createElement('span');
      pin.className = 't1-pf-item__pin';
      pin.setAttribute('aria-hidden', 'true');

      const name = document.createElement('span');
      name.className = 't1-pf-item__name';
      name.textContent = m.nome;

      const handle = document.createElement('button');
      handle.type = 'button';
      handle.className = 't1-pf-item__handle';
      handle.setAttribute('aria-label', 'Arrastar ' + m.nome);
      handle.innerHTML = '<i data-lucide="grip-vertical" aria-hidden="true"></i>';
      attachDrag(handle, li);

      const eye = document.createElement('button');
      eye.type = 'button';
      eye.className = 't1-pf-item__eye';
      eye.setAttribute('aria-label', (m.on ? 'Ocultar ' : 'Mostrar ') + m.nome);
      eye.setAttribute('aria-pressed', m.on ? 'true' : 'false');
      eye.innerHTML = '<i data-lucide="' + (m.on ? 'eye' : 'eye-off') + '" aria-hidden="true"></i>';
      eye.addEventListener('click', () => {
        m.on = !m.on;
        saveModules();
        tlog('toggle_module', { modulo: m.id, novo_estado: m.on });
        renderList();
      });

      li.appendChild(pin);
      li.appendChild(name);
      li.appendChild(handle);
      li.appendChild(eye);
      $list.appendChild(li);
    });
    if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
  }

  // Drag-to-reorder simples baseado em pointer events
  function attachDrag(handle, li) {
    let startY = 0;
    let originalIdx = -1;
    let dragging = false;
    let listEl = null;

    function onMove(ev) {
      if (!dragging) return;
      const y = ev.clientY;
      const items = Array.from(listEl.querySelectorAll('.t1-pf-item'));
      const target = items.find(other => {
        if (other === li) return false;
        const r = other.getBoundingClientRect();
        return y >= r.top && y <= r.bottom;
      });
      if (target) {
        const tr = target.getBoundingClientRect();
        const before = y < tr.top + tr.height / 2;
        if (before) listEl.insertBefore(li, target);
        else listEl.insertBefore(li, target.nextSibling);
      }
    }

    function onUp() {
      if (!dragging) return;
      dragging = false;
      li.classList.remove('is-dragging');
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointercancel', onUp);

      const ids = Array.from(listEl.querySelectorAll('.t1-pf-item')).map(n => n.getAttribute('data-id'));
      modules.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
      saveModules();
      const newIdx = ids.indexOf(li.getAttribute('data-id'));
      if (newIdx !== originalIdx) {
        tlog('reorder', { modulo: li.getAttribute('data-id'), de: originalIdx, para: newIdx });
      }
    }

    handle.addEventListener('pointerdown', (ev) => {
      ev.preventDefault();
      listEl = li.parentElement;
      startY = ev.clientY;
      originalIdx = Array.from(listEl.querySelectorAll('.t1-pf-item')).indexOf(li);
      dragging = true;
      li.classList.add('is-dragging');
      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup', onUp);
      document.addEventListener('pointercancel', onUp);
    });
  }

  function openSheet() {
    const sheet = document.getElementById('t1-personalize-sheet');
    if (!sheet) return;
    renderList();
    tlog('personalize_sheet_open', {});
    if (window.openModal) {
      window.openModal(sheet, { onClose: () => tlog('personalize_sheet_close', {}) });
    } else {
      sheet.hidden = false;
    }
    if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
  }

  function closeSheet() {
    if (window.closeModal) window.closeModal();
    else {
      const sheet = document.getElementById('t1-personalize-sheet');
      if (sheet) sheet.hidden = true;
    }
  }

  function init() {
    const btn = document.getElementById('t1-open-personalize-sheet');
    if (btn) btn.addEventListener('click', openSheet);

    const sheet = document.getElementById('t1-personalize-sheet');
    if (sheet) {
      sheet.querySelectorAll('[data-close-sheet]').forEach(el => {
        el.addEventListener('click', closeSheet);
      });
      const addBtn = sheet.querySelector('#t1-pf-add');
      if (addBtn) addBtn.addEventListener('click', () => {
        tlog('personalize_add_from_library', {});
      });
      const allow = sheet.querySelector('#t1-pf-allow-rec');
      if (allow) allow.addEventListener('change', () => {
        allow.setAttribute('aria-checked', allow.checked ? 'true' : 'false');
        tlog('toggle_allow_recommendations', { novo_estado: allow.checked });
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
