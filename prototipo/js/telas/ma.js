/* ============================================================
   MA — Snackbar Desfazer (H5: reversibilidade)
   Demo isolada: playlist com 8 musicas, swipe/tap-lixeira remove
   com height-collapse + snackbar com countdown 6s + Desfazer.
   Loga tempo ate clique em Desfazer via Telemetria.
   ============================================================ */
(function () {
  "use strict";

  const TELA = "MA";
  const DURATION = 6000;
  const RESTORE_DURATION = 2000;
  const LS_SORT = "ma:sortMode";
  const LS_HISTORY = "ma:history"; // removidas
  const LS_TRACKS = "ma:tracks";   // ordem atual

  const SORT_OPTIONS = [
    { id: "title-asc",     label: "Título (A-Z)" },
    { id: "title-desc",    label: "Título (Z-A)" },
    { id: "artist-asc",    label: "Nome do artista (A-Z)" },
    { id: "added-desc",    label: "Data adicionada (mais recente)" },
    { id: "added-asc",     label: "Data adicionada (mais antiga)" },
    { id: "duration-asc",  label: "Duração (menor → maior)" }
  ];

  const $ = (s, ctx = document) => ctx.querySelector(s);
  const $$ = (s, ctx = document) => Array.from(ctx.querySelectorAll(s));

  // ---------- STATE ----------
  const state = {
    tracks: [],
    backup: [],
    history: [],         // [{ ...track, removedAt: ts }]
    sortMode: "added-desc",
    snackbarQueue: [],
    activeSnackbar: null,
    activeTimer: null,
    activeStart: 0,
    pendingRemovals: [],
    pendingTimer: null,
    stats: { removed: 0, undone: 0, undoTimes: [] }
  };

  // ---------- INIT MOCK ----------
  function pickMock() {
    const base = (window.MOCK && Array.isArray(window.MOCK.tracks))
      ? window.MOCK.tracks.slice(0, 8).map((t, i) => ({
          id: t.id || ("t" + i),
          title: t.title || t.titulo || "Faixa " + (i + 1),
          artist: t.artist || t.artista || "Artista",
          album: t.album || "",
          cover: t.cover || t.capa || ""
        }))
      : [
          { id: "t1", title: "Midnight City", artist: "M83", album: "Hurry Up, We're Dreaming" },
          { id: "t2", title: "The Less I Know the Better", artist: "Tame Impala", album: "Currents" },
          { id: "t3", title: "One More Time", artist: "Daft Punk", album: "Discovery" },
          { id: "t4", title: "Blinding Lights", artist: "The Weeknd", album: "After Hours" },
          { id: "t5", title: "Do I Wanna Know?", artist: "Arctic Monkeys", album: "AM" },
          { id: "t6", title: "Karma Police", artist: "Radiohead", album: "OK Computer" },
          { id: "t7", title: "Mariners Apartment Complex", artist: "Lana Del Rey", album: "NFR!" },
          { id: "t8", title: "EARFQUAKE", artist: "Tyler, The Creator", album: "IGOR" }
        ];
    // enriquecer com addedAt (mock decrescente) + duration
    const now = Date.now();
    return base.map((t, i) => ({
      ...t,
      cover: t.cover || "",
      addedAt: t.addedAt || (now - i * 86400000 * 3),   // ~3 dias entre cada
      duration: t.duration || (150 + ((i * 37) % 180))  // segundos
    }));
  }

  function init() {
    // tracks
    const savedTracks = readLS(LS_TRACKS);
    state.tracks = Array.isArray(savedTracks) && savedTracks.length
      ? savedTracks
      : pickMock();
    state.backup = pickMock();
    // history
    const savedHistory = readLS(LS_HISTORY);
    if (Array.isArray(savedHistory)) {
      state.history = savedHistory;
    } else {
      // mock inicial: 2 musicas pre-removidas
      state.history = [
        { id: "h1", title: "Redbone", artist: "Childish Gambino", album: "Awaken, My Love!",
          addedAt: Date.now() - 86400000 * 30, duration: 326, removedAt: Date.now() - 86400000 * 4 },
        { id: "h2", title: "Pyramids", artist: "Frank Ocean", album: "Channel Orange",
          addedAt: Date.now() - 86400000 * 45, duration: 597, removedAt: Date.now() - 86400000 * 9 },
        { id: "h3", title: "Borderline", artist: "Tame Impala", album: "The Slow Rush",
          addedAt: Date.now() - 86400000 * 60, duration: 237, removedAt: Date.now() - 86400000 * 1 }
      ];
      writeLS(LS_HISTORY, state.history);
    }
    // sort mode
    const savedSort = localStorage.getItem(LS_SORT);
    if (savedSort && SORT_OPTIONS.some(o => o.id === savedSort)) {
      state.sortMode = savedSort;
    }
    applySort();
    renderList();
    bindToolbar();
    bindSearch();
    Telemetria.logEvent(TELA, "view", { faixas: state.tracks.length });
  }

  // ---------- LS HELPERS ----------
  function readLS(key) {
    try { return JSON.parse(localStorage.getItem(key)); } catch (_) { return null; }
  }
  function writeLS(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (_) {}
  }
  function persistTracks() { writeLS(LS_TRACKS, state.tracks); }
  function persistHistory() { writeLS(LS_HISTORY, state.history); }

  // ---------- SORT ----------
  function applySort() {
    const m = state.sortMode;
    state.tracks.sort((a, b) => {
      switch (m) {
        case "title-asc":    return (a.title || "").localeCompare(b.title || "");
        case "title-desc":   return (b.title || "").localeCompare(a.title || "");
        case "artist-asc":   return (a.artist || "").localeCompare(b.artist || "");
        case "added-desc":   return (b.addedAt || 0) - (a.addedAt || 0);
        case "added-asc":    return (a.addedAt || 0) - (b.addedAt || 0);
        case "duration-asc": return (a.duration || 0) - (b.duration || 0);
        default: return 0;
      }
    });
  }

  // ---------- RENDER ----------
  function renderList() {
    const ol = $("#ma-tracks");
    ol.innerHTML = "";
    state.tracks.forEach((t, i) => ol.appendChild(buildRow(t, i)));
    updateCount();
    updateEmpty();
    if (window.lucide) window.lucide.createIcons();
  }

  function buildRow(track) {
    const li = document.createElement("li");
    li.className = "ma-track";
    li.dataset.id = track.id;
    li.setAttribute("role", "listitem");

    const cover = document.createElement("div");
    cover.className = "ma-track__cover";
    if (track.cover) cover.style.backgroundImage = `url("${track.cover}")`;

    const meta = document.createElement("div");
    meta.className = "ma-track__meta";
    const title = document.createElement("p");
    title.className = "ma-track__title";
    title.textContent = track.title;
    const sub = document.createElement("p");
    sub.className = "ma-track__sub";
    sub.textContent = track.artist + (track.album ? " - " + track.album : "");
    meta.appendChild(title);
    meta.appendChild(sub);

    const del = document.createElement("button");
    del.className = "ma-track__delete";
    del.type = "button";
    del.setAttribute("aria-label", `Remover ${track.title} de ${track.artist}`);
    del.innerHTML = '<i data-lucide="trash-2" aria-hidden="true"></i>';
    del.addEventListener("click", () => removeTrack(track.id, "tap"));

    li.appendChild(cover);
    li.appendChild(meta);
    li.appendChild(del);
    return li;
  }

  function updateCount() {
    const c = $("#ma-count");
    if (c) c.textContent = String(state.tracks.length);
  }
  function updateEmpty() {
    const empty = $("#ma-empty");
    if (empty) empty.hidden = state.tracks.length > 0;
  }
  function updateStats() {
    $("#ma-stat-remove").textContent = String(state.stats.removed);
    $("#ma-stat-undo").textContent = String(state.stats.undone);
    if (state.stats.undoTimes.length) {
      const avg = state.stats.undoTimes.reduce((a, b) => a + b, 0) / state.stats.undoTimes.length;
      $("#ma-stat-tempo").textContent = (avg / 1000).toFixed(1) + "s";
    } else {
      $("#ma-stat-tempo").textContent = "--";
    }
  }

  // ---------- REMOCAO COM AGRUPAMENTO ----------
  function removeTrack(id, origem) {
    const idx = state.tracks.findIndex(t => t.id === id);
    if (idx < 0) return;
    const removed = state.tracks[idx];
    const row = document.querySelector(`.ma-track[data-id="${cssEscape(id)}"]`);

    state.tracks.splice(idx, 1);
    state.stats.removed++;

    // adiciona ao histórico
    state.history.unshift({ ...removed, removedAt: Date.now() });
    persistHistory();
    persistTracks();

    updateCount();
    updateStats();

    if (row) {
      row.style.height = row.offsetHeight + "px";
      requestAnimationFrame(() => { row.dataset.removing = "true"; });
      setTimeout(() => {
        if (row.parentNode) row.parentNode.removeChild(row);
        updateEmpty();
      }, 280);
    }

    Telemetria.logEvent(TELA, "track_removed", { id, origem });

    state.pendingRemovals.push({ track: removed, index: idx });
    if (state.pendingTimer) clearTimeout(state.pendingTimer);
    state.pendingTimer = setTimeout(() => {
      const batch = state.pendingRemovals.slice();
      state.pendingRemovals = [];
      state.pendingTimer = null;
      showRemovalSnackbar(batch);
    }, 350);
  }

  function restoreTrack(id) {
    const idx = state.history.findIndex(h => h.id === id);
    if (idx < 0) return;
    const entry = state.history[idx];
    state.history.splice(idx, 1);
    const { removedAt, ...track } = entry;
    state.tracks.push(track);
    applySort();
    persistTracks();
    persistHistory();
    updateCount();
    renderList();
    Telemetria.logEvent(TELA, "history_restore", { id });
    showConfirmSnackbar("Música restaurada");
    refreshHistorySheet();
  }

  function showRemovalSnackbar(batch) {
    const msg = batch.length === 1
      ? `Removido: <strong>${escapeHtml(batch[0].track.title)}</strong>`
      : `<strong>${batch.length}</strong> musicas removidas`;

    showSnackbar({
      kind: "undo-remove",
      icon: "trash-2",
      msg,
      actionLabel: "Desfazer",
      duration: DURATION,
      onAction: (elapsedMs) => {
        // reinserir + remover do histórico
        batch.sort((a, b) => a.index - b.index).forEach(({ track, index }) => {
          const safeIdx = Math.min(index, state.tracks.length);
          state.tracks.splice(safeIdx, 0, track);
          // remover correspondente do histórico
          const hi = state.history.findIndex(h => h.id === track.id);
          if (hi >= 0) state.history.splice(hi, 1);
        });
        persistTracks();
        persistHistory();
        state.stats.undone += batch.length;
        state.stats.undoTimes.push(elapsedMs);
        updateStats();
        renderList();
        markRestored(batch.map(b => b.track.id));
        Telemetria.logEvent(TELA, "undo_clicked", {
          tipo: "remove", quantidade: batch.length, tempo_ms: elapsedMs
        });
        showConfirmSnackbar(batch.length === 1 ? "Musica restaurada" : `${batch.length} musicas restauradas`);
      },
      onExpire: () => {
        Telemetria.logEvent(TELA, "undo_expired", { tipo: "remove", quantidade: batch.length });
      }
    });
  }

  function markRestored(ids) {
    requestAnimationFrame(() => {
      ids.forEach(id => {
        const row = document.querySelector(`.ma-track[data-id="${cssEscape(id)}"]`);
        if (row) {
          row.dataset.restoring = "true";
          setTimeout(() => { delete row.dataset.restoring; }, 280);
        }
      });
    });
  }

  // ---------- SNACKBAR ENGINE ----------
  function showSnackbar(opts) {
    if (state.activeSnackbar) hideSnackbar(state.activeSnackbar, true);
    const region = $("#ma-snackbar-region");
    const sb = document.createElement("div");
    sb.className = "snackbar";
    sb.setAttribute("role", "status");
    sb.dataset.state = "closed";
    sb.dataset.variant = opts.variant || "undo";
    sb.style.setProperty("--snackbar-duration", (opts.duration || DURATION) + "ms");

    const icon = document.createElement("span");
    icon.className = "snackbar__icon";
    icon.innerHTML = `<i data-lucide="${opts.icon || "info"}" aria-hidden="true"></i>`;

    const msg = (window.el
      ? window.el('span', { class: 'snackbar__msg' })
      : document.createElement('span'));
    if (!window.el) msg.className = 'snackbar__msg';
    msg.textContent = String(opts.msg == null ? '' : opts.msg).replace(/<[^>]*>/g, '');

    sb.appendChild(icon);
    sb.appendChild(msg);

    if (opts.actionLabel) {
      const btn = document.createElement("button");
      btn.className = "snackbar__action";
      btn.type = "button";
      btn.textContent = opts.actionLabel;
      btn.setAttribute("aria-label", opts.actionLabel + " ultima acao");
      btn.addEventListener("click", () => {
        const elapsed = Date.now() - state.activeStart;
        if (state.activeTimer) clearTimeout(state.activeTimer);
        state.activeTimer = null;
        if (opts.onAction) opts.onAction(elapsed);
        hideSnackbar(sb, false);
      });
      sb.appendChild(btn);
    }

    if (opts.duration && opts.duration > 0) {
      const prog = document.createElement("div");
      prog.className = "snackbar__progress";
      const fill = document.createElement("div");
      fill.className = "snackbar__progress-fill";
      prog.appendChild(fill);
      sb.appendChild(prog);
    }

    region.appendChild(sb);
    state.activeSnackbar = sb;
    state.activeStart = Date.now();

    if (window.lucide) window.lucide.createIcons({ root: sb });
    void sb.offsetWidth;
    sb.dataset.state = "open";

    if (opts.duration && opts.duration > 0) {
      state.activeTimer = setTimeout(() => {
        if (opts.onExpire) opts.onExpire();
        hideSnackbar(sb, false);
      }, opts.duration);
    }
  }

  function hideSnackbar(sb, immediate) {
    if (!sb) return;
    if (state.activeTimer) { clearTimeout(state.activeTimer); state.activeTimer = null; }
    sb.dataset.state = "closing";
    const delay = immediate ? 0 : 200;
    setTimeout(() => {
      if (sb.parentNode) sb.parentNode.removeChild(sb);
      if (state.activeSnackbar === sb) state.activeSnackbar = null;
    }, delay);
  }

  function showConfirmSnackbar(text) {
    showSnackbar({
      kind: "confirm",
      variant: "confirm",
      icon: "check-circle-2",
      msg: escapeHtml(text),
      duration: RESTORE_DURATION
    });
  }

  // ---------- SORT SHEET ----------
  function openSortSheet() {
    const sheet = $("#ma-sort-sheet");
    const list = $("#ma-sort-list");
    list.innerHTML = "";
    SORT_OPTIONS.forEach(opt => {
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "ma-sort-list__item";
      btn.setAttribute("role", "radio");
      btn.setAttribute("aria-checked", String(opt.id === state.sortMode));
      btn.dataset.sortId = opt.id;
      btn.innerHTML = `<span class="ma-sort-list__radio" aria-hidden="true"></span><span>${escapeHtml(opt.label)}</span>`;
      btn.addEventListener("click", () => {
        state.sortMode = opt.id;
        localStorage.setItem(LS_SORT, opt.id);
        applySort();
        persistTracks();
        renderList();
        Telemetria.logEvent(TELA, "sort_changed", { criterio: opt.id });
        if (window.closeModal) window.closeModal();
        showConfirmSnackbar("Lista reordenada");
      });
      li.appendChild(btn);
      list.appendChild(li);
    });
    // close buttons
    sheet.querySelectorAll("[data-close]").forEach(el => {
      el.onclick = () => window.closeModal && window.closeModal();
    });
    if (window.lucide) window.lucide.createIcons({ root: sheet });
    if (window.openModal) {
      window.openModal(sheet);
      requestAnimationFrame(() => sheet.classList.add("is-open"));
    }
    Telemetria.logEvent(TELA, "sort_sheet_open", { atual: state.sortMode });
  }

  // ---------- HISTORY SHEET ----------
  function openHistorySheet() {
    refreshHistorySheet();
    const sheet = $("#ma-history-sheet");
    sheet.querySelectorAll("[data-close]").forEach(el => {
      el.onclick = () => window.closeModal && window.closeModal();
    });
    if (window.openModal) {
      window.openModal(sheet);
      requestAnimationFrame(() => sheet.classList.add("is-open"));
    }
    Telemetria.logEvent(TELA, "history_sheet_open", {
      atuais: state.tracks.length,
      removidas: state.history.length
    });
  }

  function refreshHistorySheet() {
    const list = $("#ma-history-list");
    if (!list) return;
    list.innerHTML = "";

    const current = state.tracks.map(t => ({ ...t, _kind: "current" }));
    const removed = state.history.map(t => ({ ...t, _kind: "removed" }));
    const combined = current.concat(removed)
      .sort((a, b) => {
        // current first, then removed by removedAt desc
        if (a._kind !== b._kind) return a._kind === "current" ? -1 : 1;
        if (a._kind === "removed") return (b.removedAt || 0) - (a.removedAt || 0);
        return 0;
      });

    if (!combined.length) {
      const empty = document.createElement("li");
      empty.className = "ma-history-empty";
      empty.textContent = "Nenhum histórico ainda.";
      list.appendChild(empty);
      return;
    }

    combined.forEach(item => {
      const li = document.createElement("li");
      li.className = "ma-history-item " + (item._kind === "current" ? "ma-history-item--current" : "ma-history-item--removed");

      const cover = document.createElement("div");
      cover.className = "ma-history-item__cover";

      const meta = document.createElement("div");
      meta.className = "ma-history-item__meta";
      const title = document.createElement("p");
      title.className = "ma-history-item__title";
      title.textContent = item.title;
      const sub = document.createElement("p");
      sub.className = "ma-history-item__sub";
      if (item._kind === "current") {
        sub.innerHTML = `<span class="ma-history-item__status">● Atual</span> · ${escapeHtml(item.artist || "")}`;
      } else {
        sub.innerHTML = `<span class="ma-history-item__status">✕ Removida em ${formatDate(item.removedAt)}</span> · ${escapeHtml(item.artist || "")}`;
      }
      meta.appendChild(title);
      meta.appendChild(sub);

      const action = document.createElement("button");
      action.type = "button";
      if (item._kind === "current") {
        action.className = "ma-history-item__action ma-history-item__action--remove";
        action.innerHTML = '<i data-lucide="trash-2" aria-hidden="true"></i><span>Remover</span>';
        action.setAttribute("aria-label", `Remover ${item.title}`);
        action.addEventListener("click", () => {
          removeTrack(item.id, "history");
          refreshHistorySheet();
        });
      } else {
        action.className = "ma-history-item__action ma-history-item__action--restore";
        action.innerHTML = '<i data-lucide="rotate-ccw" aria-hidden="true"></i><span>Restaurar</span>';
        action.setAttribute("aria-label", `Restaurar ${item.title}`);
        action.addEventListener("click", () => restoreTrack(item.id));
      }

      li.appendChild(cover);
      li.appendChild(meta);
      li.appendChild(action);
      list.appendChild(li);
    });

    if (window.lucide) window.lucide.createIcons({ root: list });
  }

  function formatDate(ts) {
    if (!ts) return "?";
    const d = new Date(ts);
    const pad = n => String(n).padStart(2, "0");
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  // ---------- TOOLBAR ----------
  function bindToolbar() {
    const sortBtn = $("#ma-sort");
    if (sortBtn) sortBtn.addEventListener("click", openSortSheet);

    const histBtn = $("#ma-history");
    if (histBtn) histBtn.addEventListener("click", openHistorySheet);

    const more = $("#ma-playlist-more");
    if (more) more.addEventListener("click", () => {
      Telemetria.logEvent(TELA, "playlist_more_tap", {});
    });
  }

  // ---------- BUSCA ----------
  function bindSearch() {
    const input = $("#ma-search-input");
    const clear = $("#ma-search-clear");
    if (!input || !clear) return;
    const sync = () => {
      clear.style.display = input.value.length > 0 ? "inline-flex" : "none";
    };
    sync();
    input.addEventListener("input", sync);
    clear.addEventListener("click", () => {
      const snapshot = input.value;
      if (!snapshot) return;
      input.value = "";
      sync();
      Telemetria.logEvent(TELA, "search_cleared", { termo: snapshot });
      showSnackbar({
        kind: "undo-search",
        icon: "search-x",
        msg: "Busca limpa",
        actionLabel: "Desfazer",
        duration: DURATION,
        onAction: (elapsedMs) => {
          input.value = snapshot;
          sync();
          state.stats.undone++;
          state.stats.undoTimes.push(elapsedMs);
          updateStats();
          Telemetria.logEvent(TELA, "undo_clicked", { tipo: "search_clear", tempo_ms: elapsedMs });
          showConfirmSnackbar("Busca restaurada");
          input.focus();
        },
        onExpire: () => {
          Telemetria.logEvent(TELA, "undo_expired", { tipo: "search_clear" });
        }
      });
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && state.activeSnackbar) {
        hideSnackbar(state.activeSnackbar, false);
      }
    });
  }

  // ---------- HELPERS ----------
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, m => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[m]);
  }
  function cssEscape(s) {
    if (window.CSS && window.CSS.escape) return window.CSS.escape(s);
    return String(s).replace(/"/g, '\\"');
  }

  // ---------- BOOT ----------
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
