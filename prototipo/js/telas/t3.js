/* ============================================================
   T3 — BIBLIOTECA com selecao multipla
   Foco heuristico: H7 (acoes em lote) + H5 (reversibilidade)
   ============================================================ */

(function () {
  "use strict";

  // ---------- STATE ----------
  const state = {
    items: [],            // lista renderizada
    deleted: [],          // backup para undo
    selection: new Set(), // ids selecionados
    selectionMode: false,
    view: "list",         // list | grid
    filter: "all",
    search: "",
    pressTimer: null,
    pressId: null,
    pressEl: null,
    pressStartXY: null,
    longPressed: false
  };

  const LONG_PRESS_MS = 500;
  const PRESS_MOVE_TOLERANCE = 10;

  // ---------- DOM refs ----------
  const $list           = document.getElementById("t3-list");
  const $alpha          = document.getElementById("t3-alpha");
  const $alphaOverlay   = document.getElementById("t3-alpha-overlay");
  const $empty          = document.getElementById("t3-empty");
  const $topbarDefault  = document.getElementById("t3-topbar-default");
  const $topbarSelection = document.getElementById("t3-topbar-selection");
  const $selectionCount = document.getElementById("t3-selection-count");
  const $actionBar      = document.getElementById("t3-action-bar");
  const $searchInput    = document.getElementById("t3-search-input");
  const $snackbarRegion = document.getElementById("snackbar-region");
  const $chips          = document.querySelectorAll(".t3-chips .chip");
  const $viewBtns       = document.querySelectorAll(".t3-view-toggle__btn");

  // ---------- DATA SOURCE ----------
  // playlists do mock + alguns artistas/podcasts para chips de filtro
  function carregarItens() {
    const playlists = (window.MOCK && window.MOCK.playlists) || [];
    return playlists.map((p) => ({
      id: p.id,
      tipo: p.tipo || "playlist",
      nome: p.nome,
      capa: p.capa,
      gradiente: p.gradiente,
      meta: `Playlist • ${p.criador || "Voce"} • ${p.total || 0} musicas`,
      categoria: p.tipo || "playlists"
    }));
  }

  // ---------- RENDER ----------
  function render() {
    const filtrados = state.items.filter(filtrarItem);

    if (filtrados.length === 0) {
      $list.innerHTML = "";
      $empty.hidden = false;
    } else {
      $empty.hidden = true;
      $list.innerHTML = filtrados.map(renderItem).join("");
    }

    $list.dataset.view = state.view;
    $list.dataset.selectionMode = String(state.selectionMode);

    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
  }

  function filtrarItem(item) {
    if (state.search) {
      const q = state.search.toLowerCase();
      if (!item.nome.toLowerCase().includes(q)) return false;
    }
    if (state.filter !== "all" && state.filter !== "playlists") {
      // como o mock so tem playlists, mantemos para o chip "Playlists"
      // demais filtros nao casam — devolve vazio
      return false;
    }
    return true;
  }

  function renderItem(item) {
    const sel = state.selection.has(item.id);
    // Sanitiza URL: aceita apenas http(s) ou caminhos relativos seguros (evita javascript: e data:)
    const safeCapa = (typeof item.capa === 'string' && /^(https?:\/\/|\/|\.\.?\/)[^\s"'<>]+$/i.test(item.capa)) ? item.capa : '';
    const coverHTML = item.gradiente || !safeCapa
      ? `<span class="t3-item__cover t3-item__cover--gradient" aria-hidden="true"><i data-lucide="heart"></i></span>`
      : `<img class="t3-item__cover" src="${escapeAttr(safeCapa)}" alt="" loading="lazy" />`;

    return `
      <li>
        <button
          class="t3-item"
          type="button"
          data-id="${item.id}"
          data-type="${item.tipo}"
          data-selected="${sel}"
          aria-pressed="${sel}"
          aria-label="${escapeAttr(item.nome)}, ${escapeAttr(item.meta)}"
        >
          ${coverHTML}
          <span class="t3-item__info">
            <span class="t3-item__name">${escapeHTML(item.nome)}</span>
            <span class="t3-item__meta">${escapeHTML(item.meta)}</span>
          </span>
          <span class="t3-item__checkbox" aria-hidden="true">
            <i data-lucide="check"></i>
          </span>
          <span class="t3-item__more" aria-hidden="true">
            <i data-lucide="ellipsis"></i>
          </span>
        </button>
      </li>`;
  }

  function escapeHTML(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
    }[c]));
  }
  function escapeAttr(s) { return escapeHTML(s); }

  // ---------- SELECTION ----------
  function entrarSelecao(idInicial) {
    state.selectionMode = true;
    if (idInicial) state.selection.add(idInicial);
    atualizarUISelecao();
    log("selecao_entrar", { por: "long-press", id: idInicial });
  }

  function sairSelecao() {
    state.selectionMode = false;
    state.selection.clear();
    atualizarUISelecao();
    log("selecao_cancelar");
  }

  function toggleItem(id) {
    if (state.selection.has(id)) state.selection.delete(id);
    else state.selection.add(id);
    atualizarUISelecao();
    log("selecao_toggle", { id, total: state.selection.size });
  }

  function selecionarTodos() {
    const visiveis = state.items.filter(filtrarItem);
    if (state.selection.size === visiveis.length) {
      state.selection.clear();
    } else {
      visiveis.forEach((i) => state.selection.add(i.id));
    }
    atualizarUISelecao();
    log("selecao_todos", { total: state.selection.size });
  }

  function atualizarUISelecao() {
    const n = state.selection.size;

    $topbarDefault.hidden  = state.selectionMode;
    $topbarSelection.hidden = !state.selectionMode;
    $actionBar.hidden = !state.selectionMode;

    if (state.selectionMode) {
      // forca reflow para a transicao do action bar
      requestAnimationFrame(() => {
        $actionBar.dataset.state = "open";
        $topbarSelection.dataset.state = "open";
      });
      $selectionCount.textContent = String(n);
    } else {
      $actionBar.dataset.state = "closed";
      $topbarSelection.dataset.state = "closed";
    }

    // atualiza apenas atributos dos itens (sem re-render pesado)
    $list.dataset.selectionMode = String(state.selectionMode);
    const itens = $list.querySelectorAll(".t3-item");
    itens.forEach((el) => {
      const sel = state.selection.has(el.dataset.id);
      el.dataset.selected = String(sel);
      el.setAttribute("aria-pressed", String(sel));
    });
  }

  // ---------- LONG-PRESS (sem navigator.vibrate) ----------
  function onPointerDown(e) {
    const btn = e.target.closest(".t3-item");
    if (!btn) return;

    state.pressEl = btn;
    state.pressId = btn.dataset.id;
    state.pressStartXY = { x: e.clientX, y: e.clientY };
    state.longPressed = false;

    // feedback visual imediato
    btn.dataset.pressing = "true";

    state.pressTimer = setTimeout(() => {
      state.longPressed = true;
      btn.dataset.pressing = "false";
      if (!state.selectionMode) {
        entrarSelecao(state.pressId);
      } else {
        toggleItem(state.pressId);
      }
    }, LONG_PRESS_MS);
  }

  function onPointerMove(e) {
    if (!state.pressTimer || !state.pressStartXY) return;
    const dx = Math.abs(e.clientX - state.pressStartXY.x);
    const dy = Math.abs(e.clientY - state.pressStartXY.y);
    if (dx > PRESS_MOVE_TOLERANCE || dy > PRESS_MOVE_TOLERANCE) {
      cancelarPress();
    }
  }

  function onPointerUp(e) {
    if (!state.pressEl) return;
    const btn = state.pressEl;
    const id  = state.pressId;
    const wasLong = state.longPressed;
    cancelarPress();

    if (wasLong) {
      // long-press ja resolveu (entrou em selecao ou togglou)
      e && e.preventDefault && e.preventDefault();
      return;
    }

    // tap normal
    if (state.selectionMode) {
      toggleItem(id);
    } else {
      log("playlist_abrir", { id });
      // navegacao mockada — feedback via toast leve
      showSnack(`Abrindo ${btn.querySelector(".t3-item__name").textContent}…`, null);
    }
  }

  function cancelarPress() {
    if (state.pressTimer) clearTimeout(state.pressTimer);
    if (state.pressEl) state.pressEl.dataset.pressing = "false";
    state.pressTimer = null;
    state.pressEl = null;
    state.pressId = null;
    state.pressStartXY = null;
  }

  // ---------- BULK ACTIONS ----------
  function executarBulk(acao) {
    const ids = Array.from(state.selection);
    if (!ids.length) return;

    log("bulk_acao", { acao, total: ids.length });

    if (acao === "remover") {
      removerSelecionados(ids);
      return;
    }

    const labels = {
      mover: `${ids.length} ${plur(ids.length, "item movido", "itens movidos")}`,
      baixar: `${ids.length} ${plur(ids.length, "playlist baixando", "playlists baixando")}`,
      adicionar: `Adicionado a playlist`,
      compartilhar: `Link copiado`
    };

    sairSelecao();
    showSnack(labels[acao] || "Acao concluida", () => {
      log("bulk_desfazer", { acao });
      showSnack("Acao desfeita", null, 2400);
    });
  }

  function removerSelecionados(ids) {
    // backup para undo
    const backup = state.items.filter((i) => ids.includes(i.id));
    state.deleted.push({ items: backup, ts: Date.now() });
    state.items = state.items.filter((i) => !ids.includes(i.id));
    state.selection.clear();
    state.selectionMode = false;
    atualizarUISelecao();
    render();

    const msg = `${ids.length} ${plur(ids.length, "playlist removida", "playlists removidas")}`;
    showSnack(msg, () => {
      // desfazer
      const ultimo = state.deleted.pop();
      if (!ultimo) return;
      state.items = state.items.concat(ultimo.items);
      render();
      log("remover_desfazer", { total: ultimo.items.length });
      showSnack(`${ultimo.items.length} ${plur(ultimo.items.length, "playlist restaurada", "playlists restauradas")}`, null, 2400);
    });
  }

  function plur(n, s, p) { return n === 1 ? s : p; }

  // ---------- SNACKBAR (local — reusa estilos de components.css) ----------
  let snackTimer = null;
  function showSnack(msg, onUndo, duration) {
    duration = duration || 6000;
    $snackbarRegion.innerHTML = "";
    const div = document.createElement("div");
    div.className = "snackbar";
    div.setAttribute("role", "status");
    div.dataset.variant = onUndo ? "undo" : "info";
    div.dataset.state = "closed";

    const msgEl = document.createElement("span");
    msgEl.className = "snackbar__msg";
    msgEl.textContent = msg;
    div.appendChild(msgEl);

    if (onUndo) {
      const btn = document.createElement("button");
      btn.className = "snackbar__action";
      btn.type = "button";
      btn.textContent = "Desfazer";
      btn.setAttribute("aria-label", "Desfazer ultima acao");
      btn.addEventListener("click", () => {
        clearTimeout(snackTimer);
        fecharSnack(div);
        try { onUndo(); } catch (e) { /* noop */ }
      });
      div.appendChild(btn);
    }

    const prog = document.createElement("div");
    prog.className = "snackbar__progress";
    const fill = document.createElement("div");
    fill.className = "snackbar__progress-fill";
    fill.style.animationDuration = duration + "ms";
    prog.appendChild(fill);
    div.appendChild(prog);

    $snackbarRegion.appendChild(div);
    requestAnimationFrame(() => { div.dataset.state = "open"; });

    clearTimeout(snackTimer);
    snackTimer = setTimeout(() => fecharSnack(div), duration);
  }
  function fecharSnack(div) {
    if (!div || !div.parentNode) return;
    div.dataset.state = "closing";
    setTimeout(() => { if (div.parentNode) div.parentNode.removeChild(div); }, 220);
  }

  // ---------- ALFABETO ----------
  function montarAlpha() {
    const letras = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];
    $alpha.innerHTML = letras.map(
      (l) => `<button class="t3-alpha__letter" type="button" data-letter="${l}" tabindex="-1">${l}</button>`
    ).join("");

    let activeLetter = null;
    function pickAt(y) {
      const rect = $alpha.getBoundingClientRect();
      const ratio = Math.min(Math.max((y - rect.top) / rect.height, 0), 1);
      const idx = Math.min(letras.length - 1, Math.floor(ratio * letras.length));
      return letras[idx];
    }
    function aplicar(letter) {
      if (letter === activeLetter) return;
      activeLetter = letter;
      $alpha.querySelectorAll(".t3-alpha__letter").forEach((el) => {
        el.dataset.active = String(el.dataset.letter === letter);
      });
      $alphaOverlay.textContent = letter;
      $alphaOverlay.dataset.visible = "true";

      // scroll para primeiro item que comeca com a letra
      const alvo = state.items.find(
        (i) => i.nome[0] && i.nome[0].toUpperCase() === letter
      );
      if (alvo) {
        const el = $list.querySelector(`.t3-item[data-id="${alvo.id}"]`);
        if (el) el.scrollIntoView({ block: "center", behavior: "smooth" });
      }
      log("alpha_scroll", { letter });
    }

    let dragging = false;
    $alpha.addEventListener("pointerdown", (e) => {
      dragging = true;
      $alpha.setPointerCapture(e.pointerId);
      aplicar(pickAt(e.clientY));
    });
    $alpha.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      aplicar(pickAt(e.clientY));
    });
    function soltar() {
      dragging = false;
      $alphaOverlay.dataset.visible = "false";
      setTimeout(() => {
        $alpha.querySelectorAll(".t3-alpha__letter").forEach((el) => {
          el.dataset.active = "false";
        });
        activeLetter = null;
      }, 200);
    }
    $alpha.addEventListener("pointerup", soltar);
    $alpha.addEventListener("pointercancel", soltar);
    $alpha.addEventListener("pointerleave", () => { if (dragging) soltar(); });
  }

  // ---------- TELEMETRIA helper ----------
  function log(alvo, meta) {
    try {
      if (window.Telemetria) window.Telemetria.logEvent("t3", alvo, meta || {});
    } catch (e) {}
  }

  // ---------- EVENT WIRING ----------
  function wire() {
    // long-press / tap
    $list.addEventListener("pointerdown", onPointerDown);
    $list.addEventListener("pointermove", onPointerMove);
    $list.addEventListener("pointerup", onPointerUp);
    $list.addEventListener("pointercancel", cancelarPress);
    $list.addEventListener("pointerleave", cancelarPress);
    // bloqueia menu de contexto do navegador no long-press
    $list.addEventListener("contextmenu", (e) => {
      if (e.target.closest(".t3-item")) e.preventDefault();
    });

    // cancelar selecao
    document
      .querySelector('[data-action="cancel-selection"]')
      .addEventListener("click", sairSelecao);

    // selecionar todos
    document
      .querySelector('[data-action="select-all"]')
      .addEventListener("click", selecionarTodos);

    // foco no input via icone da topbar
    document
      .querySelector('[data-action="focus-search"]')
      .addEventListener("click", () => {
        $searchInput.focus();
        log("buscar_foco");
      });

    // busca
    let searchTO = null;
    $searchInput.addEventListener("input", (e) => {
      clearTimeout(searchTO);
      searchTO = setTimeout(() => {
        state.search = e.target.value.trim();
        render();
        log("buscar_digitar", { q: state.search });
      }, 150);
    });

    // chips
    $chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        $chips.forEach((c) => (c.dataset.active = "false"));
        chip.dataset.active = "true";
        state.filter = chip.dataset.filter;
        render();
        log("chip_filtrar", { filter: state.filter });
      });
    });

    // view toggle
    $viewBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        $viewBtns.forEach((b) => {
          b.dataset.active = "false";
          b.setAttribute("aria-pressed", "false");
        });
        btn.dataset.active = "true";
        btn.setAttribute("aria-pressed", "true");
        state.view = btn.dataset.view;
        render();
        log("view_toggle", { view: state.view });
      });
    });

    // bulk actions
    document.querySelectorAll("[data-bulk]").forEach((b) => {
      b.addEventListener("click", () => executarBulk(b.dataset.bulk));
    });

    // ESC sai do modo selecao
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && state.selectionMode) {
        sairSelecao();
      }
    });
  }

  // ---------- INIT ----------
  let _inited = false;
  function init() {
    if (_inited) return;
    _inited = true;
    if (!window.MOCK) {
      console.warn("[T3] MOCK ausente");
      return;
    }
    state.items = carregarItens();
    montarAlpha();
    render();
    wire();
    log("tela_abrir", { total: state.items.length });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
