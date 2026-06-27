/* ============================================================
   T2-ATUAL — PLAYER (controle, Spotify atual)
   Reproduz fielmente o comportamento do app real hoje:
   - "+" no destaque (não há coração visível no slot principal)
   - Botão único de shuffle CICLA: off → shuffle → smart → off
   - Repeat tri-estado: off → all → one (sem label textual)
   - Sem status row reforçando shuffle/repeat
   - Telemetria.logEvent() pra medir tempo de tarefa vs redesign
   ============================================================ */
(function () {
  "use strict";

  const TELA = "t2-atual";
  const LS_KEY = "ihc.t2atual.estado.v1";

  // Sequência ÚNICA combinando shuffle e smart shuffle (igual Spotify atual).
  const SHUFFLE_SEQ = ["off", "shuffle", "smart"];
  const REPEAT_SEQ  = ["off", "all", "one"];

  const stateDefault = {
    tocando: true,
    adicionada: false,
    shuffleMode: "off",   // off | shuffle | smart
    repeat: "off",        // off | all | one
    posicao: 102,
    total: 243,
    titulo: "Midnight City",
    artista: "M83",
    contexto: "Discover Weekly",
    capa: ""
  };

  let state = carregar();
  let tickTimer = null;
  let toastTimer = null;
  let tarefaInicio = Date.now();

  function carregar() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      const base = mergeMock();
      if (!raw) return base;
      return Object.assign({}, base, JSON.parse(raw));
    } catch (e) {
      return mergeMock();
    }
  }

  function mergeMock() {
    const m = (window.MOCK && window.MOCK.musicaTocando) || null;
    if (!m) return Object.assign({}, stateDefault);
    return Object.assign({}, stateDefault, {
      titulo: m.titulo || stateDefault.titulo,
      artista: m.artista || stateDefault.artista,
      contexto: m.contextoNome || stateDefault.contexto,
      capa: m.capa || "",
      posicao: m.posicao != null ? m.posicao : stateDefault.posicao,
      total: m.total != null ? m.total : stateDefault.total,
      tocando: m.tocando != null ? m.tocando : true
    });
  }

  function salvar() {
    try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch (e) {}
  }

  // ---------- HELPERS ----------
  function fmt(seg) {
    seg = Math.max(0, Math.floor(seg));
    const m = Math.floor(seg / 60);
    const s = seg % 60;
    return `${m}:${s < 10 ? "0" + s : s}`;
  }

  // Label DE ACESSIBILIDADE só (não tem label visível no atual)
  function shuffleAriaLabel(mode) {
    if (mode === "off")     return "Aleatório: desativado. Toque para ativar.";
    if (mode === "shuffle") return "Aleatório: ativado. Toque para Smart Shuffle.";
    if (mode === "smart")   return "Smart Shuffle: ativado. Toque para desativar.";
    return "Aleatório";
  }

  function repeatAriaLabel(mode) {
    if (mode === "off") return "Repetir: desativado. Toque para repetir tudo.";
    if (mode === "all") return "Repetir tudo: ativado. Toque para repetir uma.";
    if (mode === "one") return "Repetir uma: ativado. Toque para desativar.";
    return "Repetir";
  }

  function refreshIcons() {
    if (window.lucide && typeof window.lucide.createIcons === "function") {
      try { window.lucide.createIcons(); } catch (e) {}
    }
  }

  function setIcon(el, name) {
    if (!el) return;
    if (el.getAttribute("data-lucide") === name) return;
    el.setAttribute("data-lucide", name);
    refreshIcons();
  }

  function log(alvo, meta) {
    if (window.Telemetria && window.Telemetria.logEvent) {
      const dt = Date.now() - tarefaInicio;
      window.Telemetria.logEvent(TELA, alvo, Object.assign({ dtMs: dt }, meta || {}));
    }
  }

  // ---------- TOAST ----------
  function toast(msg) {
    const region = document.getElementById("npa-toast");
    const text = document.getElementById("npa-toast-msg");
    if (!region || !text) return;
    text.textContent = msg;
    region.hidden = false;
    void region.offsetWidth;
    region.setAttribute("data-open", "true");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      region.setAttribute("data-open", "false");
      setTimeout(() => { region.hidden = true; }, 300);
    }, 2400);
  }

  // ---------- RENDER ----------
  function render() {
    const $ = (id) => document.getElementById(id);

    const cover = $("npa-cover");
    if (cover) {
      if (state.capa) cover.src = state.capa;
      cover.alt = `Capa de ${state.titulo} — ${state.artista}`;
    }
    if ($("npa-title"))        $("npa-title").textContent = state.titulo;
    if ($("npa-artist"))       $("npa-artist").textContent = state.artista;
    if ($("npa-context-name")) $("npa-context-name").textContent = state.contexto;

    // "+" (adicionado/não-adicionado)
    const addBtn = $("npa-add");
    const addIco = $("npa-add-icon");
    if (addBtn) {
      addBtn.setAttribute("aria-pressed", state.adicionada ? "true" : "false");
      addBtn.setAttribute("aria-label",
        state.adicionada ? "Adicionada à playlist. Toque para remover."
                         : "Adicionar à playlist");
    }
    if (addIco) setIcon(addIco, state.adicionada ? "check" : "plus");

    // Seek
    const seek = $("npa-seek");
    if (seek) {
      seek.max = String(state.total);
      seek.value = String(state.posicao);
      const pct = state.total > 0 ? (state.posicao / state.total) * 100 : 0;
      seek.style.setProperty("--npa-progress", pct.toFixed(2) + "%");
    }
    if ($("npa-current")) $("npa-current").textContent = fmt(state.posicao);
    if ($("npa-total"))   $("npa-total").textContent   = fmt(state.total);

    // Shuffle (1 botão, 3 estados, sem label textual visível)
    const shuf = $("npa-shuffle");
    if (shuf) {
      shuf.setAttribute("data-mode", state.shuffleMode);
      shuf.setAttribute("aria-label", shuffleAriaLabel(state.shuffleMode));
    }

    // Repeat (1 botão, 3 estados, sem label)
    const rep = $("npa-repeat");
    if (rep) {
      rep.setAttribute("data-mode", state.repeat);
      rep.setAttribute("aria-label", repeatAriaLabel(state.repeat));
    }
    const repIco = $("npa-repeat-icon");
    if (repIco) setIcon(repIco, state.repeat === "one" ? "repeat-1" : "repeat");

    // Play/pause
    const playBtn = $("npa-play");
    const playIco = $("npa-play-icon");
    if (playBtn) {
      playBtn.setAttribute("aria-pressed", state.tocando ? "true" : "false");
      playBtn.setAttribute("aria-label", state.tocando ? "Pausar" : "Tocar");
    }
    if (playIco) setIcon(playIco, state.tocando ? "pause" : "play");
  }

  // ---------- TICK ----------
  function startTick() {
    stopTick();
    if (!state.tocando) return;
    tickTimer = setInterval(() => {
      state.posicao += 1;
      if (state.posicao >= state.total) {
        if (state.repeat === "one" || state.repeat === "all") {
          state.posicao = 0;
        } else {
          state.posicao = state.total;
          state.tocando = false;
          stopTick();
        }
      }
      const seek = document.getElementById("npa-seek");
      if (seek) {
        seek.value = String(state.posicao);
        const pct = (state.posicao / state.total) * 100;
        seek.style.setProperty("--npa-progress", pct.toFixed(2) + "%");
      }
      const cur = document.getElementById("npa-current");
      if (cur) cur.textContent = fmt(state.posicao);
      if (!state.tocando) render();
    }, 1000);
  }

  function stopTick() {
    if (tickTimer) { clearInterval(tickTimer); tickTimer = null; }
  }

  // ---------- HANDLERS ----------
  function onTogglePlay() {
    state.tocando = !state.tocando;
    salvar(); render();
    state.tocando ? startTick() : stopTick();
    log("play_toggle", { tocando: state.tocando });
  }

  function onAdd() {
    state.adicionada = !state.adicionada;
    salvar(); render();
    toast(state.adicionada ? "Adicionada à playlist" : "Removida da playlist");
    log("add_toggle", { adicionada: state.adicionada });
  }

  // Ciclo único shuffle+smart (comportamento atual)
  function onCycleShuffle() {
    const prev = state.shuffleMode;
    const i = SHUFFLE_SEQ.indexOf(prev);
    state.shuffleMode = SHUFFLE_SEQ[(i + 1) % SHUFFLE_SEQ.length];
    salvar(); render();
    // No app real NÃO há toast textual aqui — feedback é apenas o ícone.
    // Mantemos silêncio pra ser fiel; só logamos.
    log("shuffle_cycle", { de: prev, para: state.shuffleMode });
  }

  function onCycleRepeat() {
    const prev = state.repeat;
    const i = REPEAT_SEQ.indexOf(prev);
    state.repeat = REPEAT_SEQ[(i + 1) % REPEAT_SEQ.length];
    salvar(); render();
    // Mesmo princípio: feedback só visual no botão. Sem toast.
    log("repeat_cycle", { de: prev, para: state.repeat });
  }

  function onPrev() {
    state.posicao = 0;
    salvar(); render();
    log("prev_track");
  }

  function onNext() {
    state.posicao = state.total;
    state.tocando = false;
    stopTick();
    salvar(); render();
    log("next_track");
  }

  function onSeekInput(e) {
    const v = parseInt(e.target.value, 10) || 0;
    state.posicao = v;
    const cur = document.getElementById("npa-current");
    if (cur) cur.textContent = fmt(state.posicao);
    const pct = state.total > 0 ? (state.posicao / state.total) * 100 : 0;
    e.target.style.setProperty("--npa-progress", pct.toFixed(2) + "%");
  }

  let seekDebounce = null;
  function onSeekChange(e) {
    state.posicao = parseInt(e.target.value, 10) || 0;
    clearTimeout(seekDebounce);
    seekDebounce = setTimeout(() => {
      salvar();
      log("seek", { pos: state.posicao });
    }, 50);
  }

  function onCollapse() {
    log("collapse_player");
    if (document.referrer && history.length > 1) history.back();
    else location.href = "../../index.html";
  }
  function onMore()    { log("more_menu_open"); toast("Menu (mock)"); }
  function onDevices() { log("devices_open");   toast("Dispositivos disponíveis"); }
  function onShare()   { log("share_open");     toast("Compartilhar"); }
  function onQueue()   { log("queue_open");     toast("Fila de reprodução"); }

  // ---------- BIND ----------
  function bind() {
    const map = [
      ["npa-collapse", "click",  onCollapse],
      ["npa-more",     "click",  onMore],
      ["npa-add",      "click",  onAdd],
      ["npa-play",     "click",  onTogglePlay],
      ["npa-prev",     "click",  onPrev],
      ["npa-next",     "click",  onNext],
      ["npa-shuffle",  "click",  onCycleShuffle],
      ["npa-repeat",   "click",  onCycleRepeat],
      ["npa-devices",  "click",  onDevices],
      ["npa-share",    "click",  onShare],
      ["npa-queue",    "click",  onQueue],
      ["npa-seek",     "input",  onSeekInput],
      ["npa-seek",     "change", onSeekChange]
    ];
    map.forEach(([id, evt, fn]) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener(evt, fn);
    });

    document.addEventListener("keydown", (e) => {
      if (e.code === "Space" && e.target.tagName !== "INPUT") {
        // Evita duplo toggle quando foco já está em um botão (Space ativa o botão)
        if (e.target.matches && e.target.matches('button, [role="button"]')) return;
        e.preventDefault();
        onTogglePlay();
      }
    });
  }

  function init() {
    tarefaInicio = Date.now();
    bind();
    render();
    refreshIcons();
    if (state.tocando) startTick();
    log("view_open", {
      shuffleMode: state.shuffleMode,
      repeat: state.repeat
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
