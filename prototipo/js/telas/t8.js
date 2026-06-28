/* ============================================================
   T8 — Notificações (V2.3)
   ============================================================ */
(function () {
  'use strict';

  const TELA = 't8';
  const log = (alvo, meta) =>
    window.Telemetria && window.Telemetria.logEvent(TELA, alvo, meta || {});

  // ---------- Mock notifications ----------
  const NOW = Date.now();
  const min  = (n) => n * 60 * 1000;
  const hour = (n) => n * 60 * min(1);
  const day  = (n) => n * 24 * hour(1);

  const NOTIFS = [
    { id:'n1',  type:'lancamento',   icon:'disc',         title:'Novo álbum de Tame Impala',          desc:'"Currents Deluxe" já está disponível.',        ts: NOW - min(12),  action:{ label:'Tocar',        href:'#' }, read:false },
    { id:'n2',  type:'recomendacao', icon:'sparkles',     title:'Você pode gostar de "Indie Mix 2026"',desc:'Curadoria baseada no que você ouviu essa semana.', ts: NOW - hour(2),  action:{ label:'Salvar',       href:'#' }, read:false },
    { id:'n3',  type:'sistema',      icon:'info',         title:'Seu Wrapped chegou! 🎉',              desc:'Veja sua retrospectiva musical de 2026.',      ts: NOW - hour(5),  action:{ label:'Ver',          href:'#' }, read:false },
    { id:'n4',  type:'social',       icon:'user',         title:'Bia compartilhou um álbum com você',  desc:'"Solar Power" de Lorde — toque para ouvir.',   ts: NOW - hour(8),  action:{ label:'Ouvir',        href:'#' }, read:true  },
    { id:'n5',  type:'milestone',    icon:'trophy',       title:'Você ouviu 500 horas em 2026',        desc:'Compartilhe esse marco com seus amigos.',      ts: NOW - day(1),   action:{ label:'Compartilhar', href:'#' }, read:false },
    { id:'n6',  type:'lancamento',   icon:'disc',         title:'Novo álbum de Caribou',               desc:'"Honey" — 12 faixas inéditas.',                ts: NOW - day(1) - hour(3), action:{ label:'Tocar',  href:'#' }, read:true  },
    { id:'n7',  type:'recomendacao', icon:'sparkles',     title:'Você pode gostar de "Lo-fi noturno"', desc:'Playlist para concentração e descanso.',       ts: NOW - day(2),   action:{ label:'Salvar',       href:'#' }, read:true  },
    { id:'n8',  type:'social',       icon:'user',         title:'Lucas começou a te seguir',           desc:'Veja o perfil e o que ele está ouvindo.',      ts: NOW - day(3),   action:{ label:'Ver',          href:'#' }, read:false },
    { id:'n9',  type:'sistema',      icon:'info',         title:'Atualização da política de privacidade', desc:'Revisamos como tratamos seus dados.',       ts: NOW - day(4),   action:{ label:'Ler',          href:'#' }, read:true  },
    { id:'n10', type:'lancamento',   icon:'disc',         title:'Novo single de Phoebe Bridgers',      desc:'"Sidelines" já no Spotify.',                   ts: NOW - day(5),   action:{ label:'Tocar',        href:'#' }, read:true  },
    { id:'n11', type:'milestone',    icon:'trophy',       title:'Você bateu seu recorde diário',       desc:'4 horas de música ontem!',                     ts: NOW - day(6),   action:{ label:'Compartilhar', href:'#' }, read:true  },
    { id:'n12', type:'social',       icon:'user',         title:'Marina curtiu sua playlist',          desc:'"Sextou Indie" recebeu uma nova curtida.',     ts: NOW - day(7),   action:{ label:'Abrir',        href:'#' }, read:true  }
  ];

  // ---------- State ----------
  let filtro = 'todas';
  const state = NOTIFS.map(n => ({ ...n })); // cópia mutável

  // ---------- Time fmt ----------
  function tempoRelativo(ts) {
    const diff = Date.now() - ts;
    if (diff < hour(1)) {
      const m = Math.max(1, Math.round(diff / min(1)));
      return `há ${m} min`;
    }
    if (diff < day(1)) {
      const h = Math.round(diff / hour(1));
      return `há ${h} h`;
    }
    const d = Math.round(diff / day(1));
    return d === 1 ? 'ontem' : `há ${d} dias`;
  }

  // ---------- Render ----------
  const listEl  = document.getElementById('t8-list');
  const emptyEl = document.getElementById('t8-empty');

  function render() {
    const itens = filtro === 'todas'
      ? state
      : state.filter(n => n.type === filtro);

    listEl.innerHTML = '';

    if (!itens.length) {
      emptyEl.hidden = false;
      if (window.lucide) window.lucide.createIcons();
      return;
    }
    emptyEl.hidden = true;

    itens.forEach(n => {
      const li = window.el('li');
      const btn = window.el('button', {
        class: `t8-item t8-item--${n.type}`,
        type: 'button',
        'data-id': n.id,
        'data-type': n.type,
        'data-read': String(!!n.read),
        'aria-label': `${n.title}. ${n.desc}. ${tempoRelativo(n.ts)}.`
      });
      btn.innerHTML = `
        <span class="t8-item__dot" aria-hidden="true"></span>
        <span class="t8-item__icon" aria-hidden="true">
          <i data-lucide="${window.escapeHTML(n.icon)}"></i>
        </span>
        <span class="t8-item__body">
          <p class="t8-item__title">${window.escapeHTML(n.title)}</p>
          <p class="t8-item__desc">${window.escapeHTML(n.desc)}</p>
          <span class="t8-item__time">${window.escapeHTML(tempoRelativo(n.ts))}</span>
        </span>
        <button class="t8-item__action" type="button" data-action-id="${window.escapeHTML(n.id)}">
          ${window.escapeHTML(n.action.label)}
        </button>
      `;

      // tap no item — marca como lida
      btn.addEventListener('click', (ev) => {
        // se foi no botão de ação, trata separado
        if (ev.target.closest('.t8-item__action')) return;
        marcarComoLida(n.id);
        log('notif_open', { id: n.id, type: n.type });
      });

      // botão de ação
      btn.querySelector('.t8-item__action').addEventListener('click', (ev) => {
        ev.stopPropagation();
        marcarComoLida(n.id);
        log('notif_action', { id: n.id, type: n.type, action: n.action.label });
      });

      li.appendChild(btn);
      listEl.appendChild(li);
    });

    if (window.lucide) window.lucide.createIcons();
  }

  function marcarComoLida(id) {
    const n = state.find(x => x.id === id);
    if (n && !n.read) {
      n.read = true;
      const node = listEl.querySelector(`.t8-item[data-id="${id}"]`);
      if (node) node.setAttribute('data-read', 'true');
    }
  }

  // ---------- Filtros ----------
  document.querySelectorAll('.t8-filters .chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.t8-filters .chip').forEach(c => {
        c.classList.remove('chip--active');
        c.setAttribute('aria-selected', 'false');
      });
      chip.classList.add('chip--active');
      chip.setAttribute('aria-selected', 'true');
      filtro = chip.dataset.filter || 'todas';
      log('filter_change', { filtro });
      render();
    });
  });

  // ---------- Sheet (3-pontinhos) ----------
  const moreBtn  = document.getElementById('t8-more-btn');
  const sheet    = document.getElementById('t8-sheet');
  const backdrop = document.getElementById('t8-sheet-backdrop');

  function openSheet() {
    backdrop.hidden = false;
    requestAnimationFrame(() => backdrop.setAttribute('data-state', 'open'));
    if (window.openModal) {
      window.openModal(sheet);
      requestAnimationFrame(() => sheet.setAttribute('data-state', 'open'));
    } else {
      sheet.hidden = false;
      sheet.setAttribute('data-state', 'open');
    }
    log('sheet_open');
  }
  function closeSheet() {
    sheet.setAttribute('data-state', 'closed');
    backdrop.setAttribute('data-state', 'closed');
    setTimeout(() => {
      if (window.closeModal) window.closeModal();
      sheet.hidden = true;
      backdrop.hidden = true;
    }, 250);
  }
  moreBtn.addEventListener('click', openSheet);
  backdrop.addEventListener('click', closeSheet);
  sheet.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', closeSheet));

  sheet.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      if (action === 'mark-all') {
        state.forEach(n => n.read = true);
        log('mark_all_read');
        render();
      } else if (action === 'clear-all') {
        state.splice(0, state.length);
        log('clear_all');
        render();
      }
      closeSheet();
    });
  });

  // ---------- Init ----------
  render();
  if (window.lucide) window.lucide.createIcons();
  log('view');
})();
