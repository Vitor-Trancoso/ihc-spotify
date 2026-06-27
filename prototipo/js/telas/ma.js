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

  const $ = (s, ctx = document) => ctx.querySelector(s);
  const $$ = (s, ctx = document) => Array.from(ctx.querySelectorAll(s));

  // ---------- STATE ----------
  const state = {
    tracks: [],          // array atual visivel
    backup: [],          // playlist original para reset
    snackbarQueue: [],   // fila de snackbars
    activeSnackbar: null,
    activeTimer: null,
    activeStart: 0,
    pendingRemovals: [], // agrupa remocoes proximas
    pendingTimer: null,
    stats: {
      removed: 0,
      undone: 0,
      undoTimes: []      // ms ate clicar desfazer
    }
  };

  // ---------- INIT MOCK ----------
  function pickMock() {
    if (!window.MOCK || !Array.isArray(window.MOCK.tracks)) {
      // fallback minimo se mock-data nao expor MOCK.tracks
      return [
        { id: "t1", title: "Midnight City", artist: "M83", album: "Hurry Up, We're Dreaming", cover: "" },
        { id: "t2", title: "The Less I Know the Better", artist: "Tame Impala", album: "Currents", cover: "" },
        { id: "t3", title: "One More Time", artist: "Daft Punk", album: "Discovery", cover: "" },
        { id: "t4", title: "Blinding Lights", artist: "The Weeknd", album: "After Hours", cover: "" },
        { id: "t5", title: "Do I Wanna Know?", artist: "Arctic Monkeys", album: "AM", cover: "" },
        { id: "t6", title: "Karma Police", artist: "Radiohead", album: "OK Computer", cover: "" },
        { id: "t7", title: "Mariners Apartment Complex", artist: "Lana Del Rey", album: "NFR!", cover: "" },
        { id: "t8", title: "EARFQUAKE", artist: "Tyler, The Creator", album: "IGOR", cover: "" }
      ];
    }
    return window.MOCK.tracks.slice(0, 8).map((t, i) => ({
      id: t.id || ("t" + i),
      title: t.title || t.titulo || "Faixa " + (i + 1),
      artist: t.artist || t.artista || "Artista",
      album: t.album || "",
      cover: t.cover || t.capa || ""
    }));
  }

  function init() {
    state.tracks = pickMock();
    state.backup = state.tracks.map(t => ({ ...t }));
    renderList();
    bindToolbar();
    bindSearch();
    Telemetria.logEvent(TELA, "view", { faixas: state.tracks.length });
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

  function buildRow(track, index) {
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
    updateCount();
    updateStats();

    if (row) {
      // captura altura para animacao consistente
      row.style.height = row.offsetHeight + "px";
      requestAnimationFrame(() => {
        row.dataset.removing = "true";
      });
      setTimeout(() => {
        if (row.parentNode) row.parentNode.removeChild(row);
        updateEmpty();
      }, 280);
    }

    Telemetria.logEvent(TELA, "track_removed", { id, origem });

    // agrupa remocoes dentro de 800ms
    state.pendingRemovals.push({ track: removed, index: idx });
    if (state.pendingTimer) clearTimeout(state.pendingTimer);
    state.pendingTimer = setTimeout(() => {
      const batch = state.pendingRemovals.slice();
      state.pendingRemovals = [];
      state.pendingTimer = null;
      showRemovalSnackbar(batch);
    }, 350);
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
        // reinserir mantendo ordem original
        batch.sort((a, b) => a.index - b.index).forEach(({ track, index }) => {
          const safeIdx = Math.min(index, state.tracks.length);
          state.tracks.splice(safeIdx, 0, track);
        });
        state.stats.undone += batch.length;
        state.stats.undoTimes.push(elapsedMs);
        updateStats();
        renderList();
        markRestored(batch.map(b => b.track.id));
        Telemetria.logEvent(TELA, "undo_clicked", {
          tipo: "remove",
          quantidade: batch.length,
          tempo_ms: elapsedMs
        });
        showConfirmSnackbar(batch.length === 1 ? "Musica restaurada" : `${batch.length} musicas restauradas`);
      },
      onExpire: () => {
        Telemetria.logEvent(TELA, "undo_expired", {
          tipo: "remove",
          quantidade: batch.length
        });
      }
    });
  }

  function markRestored(ids) {
    // animacao de entrada nas rows recem-restauradas
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
    // se existe snackbar ativa, fecha imediatamente (mostra a ultima — Material guideline)
    if (state.activeSnackbar) {
      hideSnackbar(state.activeSnackbar, true);
    }
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

    // XSS-safe: usa createElement + textContent (window.el)
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

    if (window.lucide) window.lucide.createIcons({ icons: undefined, attrs: undefined, root: sb });

    // forca reflow + abre
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

  // ---------- TOOLBAR ----------
  function bindToolbar() {
    $("#ma-clear-playlist").addEventListener("click", () => {
      if (state.tracks.length === 0) return;
      const snapshot = state.tracks.slice();
      state.tracks = [];
      state.stats.removed += snapshot.length;
      updateCount();
      updateStats();
      // animacao em cascata
      $$(".ma-track").forEach((row, i) => {
        setTimeout(() => { row.dataset.removing = "true"; }, i * 30);
      });
      setTimeout(() => {
        renderList();
      }, 280 + state.tracks.length * 30 + 40);

      Telemetria.logEvent(TELA, "playlist_cleared", { quantidade: snapshot.length });

      showSnackbar({
        kind: "undo-clear-playlist",
        icon: "trash-2",
        msg: `Playlist apagada (<strong>${snapshot.length}</strong> musicas)`,
        actionLabel: "Desfazer",
        duration: DURATION,
        onAction: (elapsedMs) => {
          state.tracks = snapshot.slice();
          state.stats.undone += snapshot.length;
          state.stats.undoTimes.push(elapsedMs);
          updateStats();
          renderList();
          Telemetria.logEvent(TELA, "undo_clicked", {
            tipo: "playlist_clear",
            quantidade: snapshot.length,
            tempo_ms: elapsedMs
          });
          showConfirmSnackbar("Playlist restaurada");
        },
        onExpire: () => {
          Telemetria.logEvent(TELA, "undo_expired", { tipo: "playlist_clear" });
        }
      });
    });

    $("#ma-reset").addEventListener("click", () => {
      state.tracks = state.backup.map(t => ({ ...t }));
      renderList();
      Telemetria.logEvent(TELA, "reset_playlist", {});
      showConfirmSnackbar("Playlist recarregada");
    });

    const more = $("#ma-playlist-more");
    if (more) more.addEventListener("click", () => {
      Telemetria.logEvent(TELA, "playlist_more_tap", {});
    });
  }

  // ---------- BUSCA (demo "limpar busca") ----------
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
          Telemetria.logEvent(TELA, "undo_clicked", {
            tipo: "search_clear",
            tempo_ms: elapsedMs
          });
          showConfirmSnackbar("Busca restaurada");
          input.focus();
        },
        onExpire: () => {
          Telemetria.logEvent(TELA, "undo_expired", { tipo: "search_clear" });
        }
      });
    });

    // ESC fecha snackbar ativa
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
