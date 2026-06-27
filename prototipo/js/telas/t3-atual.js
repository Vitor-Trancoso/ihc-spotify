/* ============================================================
   T3-ATUAL — versao CONTROLE (Spotify atual)
   Comportamento fiel ao Spotify hoje:
   - SEM selecao multipla: cada acao em 1 item por vez
   - 3-pontinhos abre bottom sheet com acoes single-item
   - "Excluir" abre dialog de confirmacao (sem snackbar desfazer)
   - Busca atras de icone (toggle), nao sticky
   - Sem long-press, sem alphabet scroll
   - Telemetria registra tempo de tarefa para comparacao A/B
   ============================================================ */

(function () {
  "use strict";

  const TELA = "t3-atual";

  // ---------- ESTADO ----------
  const state = {
    itens: [],
    filtro: "all",
    busca: "",
    itemAlvo: null,        // item atualmente no bottom sheet
    tarefaInicio: null,    // timestamp do inicio da tarefa
    excluidos: 0           // contador p/ "mover 5 musicas" tarefa
  };

  // ---------- ELEMENTOS ----------
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const elList     = $("#t3a-list");
  const elEmpty    = $("#t3a-empty");
  const elSearch   = $("#t3a-search");
  const elSearchIn = $("#t3a-search-input");
  const elBackdrop = $("#t3a-backdrop");
  const elSheet    = $("#t3a-sheet");
  const elSheetCover = $("#t3a-sheet-cover");
  const elSheetTitle = $("#t3a-sheet-title");
  const elSheetSub   = $("#t3a-sheet-sub");
  const elDialog   = $("#t3a-dialog");
  const elDialogTitle = $("#t3a-dialog-title");
  const elDialogMsg   = $("#t3a-dialog-msg");
  const elToast    = $("#t3a-toast");

  // ---------- INIT ----------
  function init() {
    if (!window.MOCK) return;
    state.itens = MOCK.playlists.map((p) => ({ ...p }));
    state.tarefaInicio = performance.now();
    Telemetria.log(TELA, "tela_aberta", { totalItens: state.itens.length });

    render();
    bindUI();
  }

  // ---------- RENDER ----------
  function render() {
    const filtrados = state.itens.filter(filtrar);

    elList.innerHTML = "";
    if (!filtrados.length) {
      elEmpty.hidden = false;
      return;
    }
    elEmpty.hidden = true;

    filtrados.forEach((item) => {
      const li = document.createElement("li");
      li.className = "t3a-item";
      li.dataset.id = item.id;
      li.setAttribute("role", "listitem");

      let cover;
      if (item.gradiente) {
        cover = window.el("span", { class: "t3a-item__cover t3a-item__cover--gradient", "aria-hidden": "true" });
        const icon = document.createElement("i");
        icon.setAttribute("data-lucide", "heart");
        cover.appendChild(icon);
      } else {
        cover = document.createElement("img");
        cover.className = "t3a-item__cover";
        cover.src = item.capa;
        cover.alt = "";
        cover.loading = "lazy";
      }

      const info = window.el("span", { class: "t3a-item__info" }, [
        window.el("span", { class: "t3a-item__name", text: String(item.nome ?? "") }),
        window.el("span", { class: "t3a-item__meta", text: `Playlist · ${item.criador} · ${item.total} musicas` })
      ]);

      const moreBtn = window.el("button", {
        class: "t3a-item__more",
        type: "button",
        "aria-label": `Mais opcoes para ${item.nome}`,
        "data-action": "more"
      });
      const moreIcon = document.createElement("i");
      moreIcon.setAttribute("data-lucide", "more-horizontal");
      moreIcon.setAttribute("aria-hidden", "true");
      moreBtn.appendChild(moreIcon);

      li.appendChild(cover);
      li.appendChild(info);
      li.appendChild(moreBtn);
      elList.appendChild(li);
    });

    if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
  }

  function filtrar(item) {
    if (state.busca) {
      const q = state.busca.toLowerCase();
      if (!item.nome.toLowerCase().includes(q)) return false;
    }
    // filtros sao apenas visuais nesta tela (todos itens sao playlists no mock)
    return true;
  }

  // ---------- INTERACAO ----------
  function bindUI() {
    // tap no item -> "abrir playlist" (apenas log)
    elList.addEventListener("click", (e) => {
      const moreBtn = e.target.closest('[data-action="more"]');
      const item = e.target.closest(".t3a-item");
      if (!item) return;

      if (moreBtn) {
        e.stopPropagation();
        const id = item.dataset.id;
        const obj = state.itens.find((x) => x.id === id);
        if (obj) abrirSheet(obj);
        return;
      }
      Telemetria.log(TELA, "item_aberto", { id: item.dataset.id });
    });

    // chips de filtro
    $$(".t3a-chips .chip").forEach((c) => {
      c.addEventListener("click", () => {
        $$(".t3a-chips .chip").forEach((x) => (x.dataset.active = "false"));
        c.dataset.active = "true";
        state.filtro = c.dataset.filter;
        Telemetria.log(TELA, "filtro_chip", { filtro: state.filtro });
        render();
      });
    });

    // toggle busca (atras de icone)
    $('[data-action="toggle-search"]').addEventListener("click", () => {
      const aberto = elSearch.dataset.open === "true";
      elSearch.dataset.open = aberto ? "false" : "true";
      if (!aberto) setTimeout(() => elSearchIn.focus(), 200);
      Telemetria.log(TELA, "busca_toggle", { aberto: !aberto });
    });

    // input de busca
    let debounce;
    elSearchIn.addEventListener("input", (e) => {
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        state.busca = e.target.value.trim();
        Telemetria.log(TELA, "busca_query", { q: state.busca });
        render();
      }, 150);
    });

    // backdrop fecha sheet
    elBackdrop.addEventListener("click", fecharSheet);

    // ESC fecha sheet/dialog
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        if (elDialog.dataset.open === "true") fecharDialog();
        else if (elSheet.dataset.open === "true") fecharSheet();
      }
    });

    // delegacao nas acoes do bottom sheet
    elSheet.addEventListener("click", (e) => {
      const row = e.target.closest("[data-sheet-action]");
      if (!row) return;
      const acao = row.dataset.sheetAction;
      executarAcaoSingle(acao);
    });

    // dialog de exclusao
    $('[data-dialog="confirmar"]').addEventListener("click", confirmarExclusao);
    $('[data-dialog="cancelar"]').addEventListener("click", fecharDialog);
  }

  // ---------- BOTTOM SHEET ----------
  function abrirSheet(item) {
    state.itemAlvo = item;
    const atual = $("#t3a-sheet-cover");
    let novo;
    if (item.gradiente) {
      novo = document.createElement("span");
      novo.id = "t3a-sheet-cover";
      novo.className = "t3a-item__cover t3a-item__cover--gradient";
      novo.setAttribute("aria-hidden", "true");
      const ic = document.createElement("i");
      ic.setAttribute("data-lucide", "heart");
      novo.appendChild(ic);
    } else {
      novo = document.createElement("img");
      novo.id = "t3a-sheet-cover";
      novo.className = "t3a-sheet__cover";
      novo.src = item.capa;
      novo.alt = "";
    }
    if (atual) atual.replaceWith(novo);
    elSheetTitle.textContent = item.nome;
    elSheetSub.textContent = `Playlist · ${item.criador}`;
    elSheet.dataset.open = "true";
    elBackdrop.dataset.open = "true";
    if (window.openModal) window.openModal(elSheet, { onClose: () => { state.itemAlvo = null; elBackdrop.dataset.open = "false"; elSheet.dataset.open = "false"; } });
    if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
    Telemetria.log(TELA, "sheet_aberto", { id: item.id });
  }

  function fecharSheet() {
    elSheet.dataset.open = "false";
    elBackdrop.dataset.open = "false";
    state.itemAlvo = null;
    if (window.closeModal) window.closeModal();
  }

  // ---------- ACOES SINGLE-ITEM (caracteristica chave do Spotify atual) ----------
  function executarAcaoSingle(acao) {
    if (!state.itemAlvo) return;
    const item = state.itemAlvo;

    if (acao === "remover") {
      // abre dialog de confirmacao (sem snackbar desfazer)
      fecharSheet();
      abrirDialog(item);
      Telemetria.log(TELA, "acao_remover_solicitada", { id: item.id });
      return;
    }

    // baixar / mover / adicionar / compartilhar -> aplica a UM item so e mostra toast
    const labels = {
      baixar: "Baixando playlist...",
      mover: "Playlist movida para pasta",
      adicionar: "Adicionada a playlist",
      compartilhar: "Link copiado",
      tocar: "Reproduzindo"
    };
    fecharSheet();
    mostrarToast(labels[acao] || "Acao executada");
    Telemetria.log(TELA, `acao_${acao}`, { id: item.id, single_item: true });
  }

  // ---------- DIALOG DE CONFIRMACAO ----------
  function abrirDialog(item) {
    elDialogTitle.textContent = `Excluir "${item.nome}"?`;
    elDialogMsg.textContent = "Esta playlist sera removida da sua biblioteca.";
    elDialog.dataset.open = "true";
    elBackdrop.dataset.open = "true";
    state.itemAlvo = item;
    if (window.openModal) window.openModal(elDialog, { onClose: () => { elDialog.dataset.open = "false"; if (elSheet.dataset.open !== "true") elBackdrop.dataset.open = "false"; } });
  }

  function fecharDialog() {
    elDialog.dataset.open = "false";
    if (elSheet.dataset.open !== "true") elBackdrop.dataset.open = "false";
    state.itemAlvo = null;
    if (window.closeModal) window.closeModal();
  }

  function confirmarExclusao() {
    if (!state.itemAlvo) return;
    const id = state.itemAlvo.id;
    state.itens = state.itens.filter((x) => x.id !== id);
    state.excluidos += 1;
    Telemetria.log(TELA, "acao_remover_confirmada", {
      id,
      total_excluidos: state.excluidos,
      tempo_desde_abrir_ms: Math.round(performance.now() - state.tarefaInicio)
    });
    fecharDialog();
    elBackdrop.dataset.open = "false";
    mostrarToast("Playlist excluida");
    render();
  }

  // ---------- TOAST simples (sem botao Desfazer — Spotify atual normalmente nao oferece) ----------
  let toastTimer;
  function mostrarToast(msg) {
    elToast.textContent = msg;
    elToast.dataset.open = "true";
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      elToast.dataset.open = "false";
    }, 2400);
  }

  // ---------- BOOT ----------
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
