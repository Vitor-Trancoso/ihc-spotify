/* ============================================================
   T9 — SOCIAL / AMIGOS (V2.4)
   Renderiza: ouvindo agora, jam sessions, feed 24h, share toggle.
   ============================================================ */
(function(){
  'use strict';

  const TELA = 't9';
  const log = (alvo, meta) => window.Telemetria && window.Telemetria.logEvent(TELA, alvo, meta);
  const escapeHTML = window.escapeHTML;
  const el = window.el;

  // ---------- MOCK DATA ----------
  const FRIENDS = [
    { id: 'ana',     nome: 'Ana',     classe: 't9-avatar--ana',     iniciais: 'A'  },
    { id: 'bruno',   nome: 'Bruno',   classe: 't9-avatar--bruno',   iniciais: 'B'  },
    { id: 'camila',  nome: 'Camila',  classe: 't9-avatar--camila',  iniciais: 'C'  },
    { id: 'diego',   nome: 'Diego',   classe: 't9-avatar--diego',   iniciais: 'D'  },
    { id: 'eduarda', nome: 'Eduarda', classe: 't9-avatar--eduarda', iniciais: 'E'  }
  ];

  function friendById(id) {
    return FRIENDS.find(f => f.id === id) || { nome: id, classe: 't9-avatar--default', iniciais: '?' };
  }

  const NOW_LISTENING = [
    { friendId: 'ana',     musica: 'As It Was',           artista: 'Harry Styles' },
    { friendId: 'bruno',   musica: 'Espresso',            artista: 'Sabrina Carpenter' },
    { friendId: 'camila',  musica: 'Cruel Summer',        artista: 'Taylor Swift' },
    { friendId: 'diego',   musica: 'Flowers',             artista: 'Miley Cyrus' }
  ];

  const JAMS = [
    {
      id: 'jam1', anfitriao: 'Eduarda', participantes: 4,
      icone: 'music', alt: false
    },
    {
      id: 'jam2', anfitriao: 'Bruno',   participantes: 2,
      icone: 'headphones', alt: true
    }
  ];

  const FEED = [
    { friendId: 'ana',     acao: 'curtiu',     alvo: 'Bad Habit',                detalhe: '— Steve Lacy',     icone: 'heart',     tempo: 'há 12 min' },
    { friendId: 'bruno',   acao: 'adicionou',  alvo: 'Anti-Hero',                detalhe: 'a Pop Hits 2024',  icone: 'plus',      tempo: 'há 47 min' },
    { friendId: 'camila',  acao: 'começou a seguir', alvo: 'The Weeknd',         detalhe: '',                 icone: 'user-plus', tempo: 'há 2 h'   },
    { friendId: 'diego',   acao: 'criou a playlist', alvo: 'Foco profundo',      detalhe: '',                 icone: 'list-music',tempo: 'há 5 h'   },
    { friendId: 'eduarda', acao: 'curtiu',     alvo: 'Greedy',                   detalhe: '— Tate McRae',     icone: 'heart',     tempo: 'há 9 h'   },
    { friendId: 'ana',     acao: 'compartilhou', alvo: 'Lover',                  detalhe: '— Taylor Swift',   icone: 'share-2',   tempo: 'há 18 h'  }
  ];

  // ---------- RENDER: AVATAR ----------
  function avatarEl(friend, sm) {
    return el('span', {
      class: 't9-avatar ' + friend.classe + (sm ? ' t9-avatar--sm' : ''),
      'aria-hidden': 'true',
      text: friend.iniciais
    });
  }

  // ---------- RENDER: NOW LISTENING ----------
  function renderListening() {
    const ul = document.getElementById('t9-listening');
    if (!ul) return;
    ul.innerHTML = '';
    NOW_LISTENING.forEach(item => {
      const f = friendById(item.friendId);
      const li = el('li');
      const btn = el('button', {
        class: 't9-friend-row',
        type: 'button',
        'aria-label': `Ouvir junto com ${f.nome}: ${item.musica} de ${item.artista}`,
        onclick: () => {
          log('ouvir_com_amigo', {
            amigo: f.id, musica: item.musica, artista: item.artista
          });
        }
      });
      btn.appendChild(avatarEl(f));

      const info = el('div', { class: 't9-friend-info' }, [
        el('div', { class: 't9-friend-name', text: f.nome }),
        el('div', { class: 't9-friend-meta', text: `${item.musica} · ${item.artista}` })
      ]);
      btn.appendChild(info);

      // EQ bars (3 barras animadas)
      const eq = document.createElement('span');
      eq.className = 'eq-bars t9-eq';
      eq.setAttribute('aria-hidden', 'true');
      eq.innerHTML = '<span></span><span></span><span></span>';
      btn.appendChild(eq);

      li.appendChild(btn);
      ul.appendChild(li);
    });
  }

  // ---------- RENDER: JAMS ----------
  function renderJams() {
    const ul = document.getElementById('t9-jams');
    if (!ul) return;
    ul.innerHTML = '';
    JAMS.forEach(j => {
      const li = el('li', { class: 't9-jam' + (j.alt ? ' t9-jam--alt' : '') });

      const cover = el('div', { class: 't9-jam__cover', 'aria-hidden': 'true' });
      cover.innerHTML = `<i data-lucide="${escapeHTML(j.icone)}"></i>`;
      li.appendChild(cover);

      const info = el('div', { class: 't9-jam__info' }, [
        el('div', { class: 't9-jam__title', text: `Jam de ${j.anfitriao}` }),
        el('div', { class: 't9-jam__count', text: `${j.participantes} participantes` })
      ]);
      li.appendChild(info);

      const btn = el('button', {
        class: 't9-jam__join',
        type: 'button',
        'aria-label': `Entrar na jam de ${j.anfitriao}`,
        text: 'Entrar',
        onclick: () => {
          log('entrar_jam', {
            jam_id: j.id, anfitriao: j.anfitriao, participantes: j.participantes
          });
        }
      });
      li.appendChild(btn);

      ul.appendChild(li);
    });
  }

  // ---------- RENDER: FEED 24H ----------
  function renderFeed() {
    const ul = document.getElementById('t9-feed');
    if (!ul) return;
    ul.innerHTML = '';
    FEED.forEach(item => {
      const f = friendById(item.friendId);
      const li = el('li', { class: 't9-feed-item' });

      li.appendChild(avatarEl(f, true));

      const body = el('div', { class: 't9-feed-item__body' });
      const text = el('p', { class: 't9-feed-item__text' });
      text.innerHTML =
        `<strong>${escapeHTML(f.nome)}</strong> ${escapeHTML(item.acao)} ` +
        `<span class="t9-feed-highlight">${escapeHTML(item.alvo)}</span>` +
        (item.detalhe ? ` ${escapeHTML(item.detalhe)}` : '');
      body.appendChild(text);

      const time = el('div', { class: 't9-feed-item__time' });
      time.innerHTML =
        `<i data-lucide="${escapeHTML(item.icone)}" class="t9-feed-item__icon" aria-hidden="true"></i>` +
        `<span>${escapeHTML(item.tempo)}</span>`;
      body.appendChild(time);

      li.appendChild(body);
      ul.appendChild(li);
    });
  }

  // ---------- TOGGLE COMPARTILHAR ----------
  function setupShareToggle() {
    const btn = document.getElementById('t9-share-toggle');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const atual = btn.getAttribute('aria-checked') === 'true';
      const novo = !atual;
      btn.setAttribute('aria-checked', String(novo));
      log('toggle_compartilhar_sessao', { ativo: novo });
    });
  }

  // ---------- FIND FRIENDS (placeholder) ----------
  function setupFindFriends() {
    const btn = document.getElementById('t9-find-friends');
    if (!btn) return;
    btn.addEventListener('click', () => {
      log('abrir_buscar_amigos', {});
    });
  }

  // ---------- INIT ----------
  function init() {
    renderListening();
    renderJams();
    renderFeed();
    setupShareToggle();
    setupFindFriends();

    // Re-render dos ícones lucide depois de injetar HTML
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }

    log('abrir_tela', { tela: 't9_social' });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
