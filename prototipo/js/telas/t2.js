/* ============================================================
   T2 — PLAYER (Now Playing)
   Foco H7: shuffle / Smart Shuffle / repeat sem ambiguidade.
   Sem frameworks. Estado persistido em localStorage.
   ============================================================ */
(function () {
  "use strict";

  const TELA = "t2";
  const LS_KEY = "ihc.t2.estado.v1";

  // ---------- STATE ----------
  const stateDefault = {
    tocando: true,
    curtida: false,
    shuffle: true,
    smartShuffle: false,
    repeat: "all",   // off | all | one
    posicao: 102,    // segundos
    total: 243,
    titulo: "Midnight City",
    artista: "M83",
    contexto: "Discover Weekly",
    capa: ""
  };

  let state = carregarEstado();
  let tickTimer = null;
  let toastTimer = null;

  function carregarEstado() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return defaultsComMock();
      const saved = JSON.parse(raw);
      return Object.assign({}, defaultsComMock(), saved);
    } catch (e) {
      return defaultsComMock();
    }
  }

  function defaultsComMock() {
    const m = (window.MOCK && window.MOCK.musicaTocando) || null;
    if (!m) return Object.assign({}, stateDefault);
    return Object.assign({}, stateDefault, {
      titulo: m.titulo || stateDefault.titulo,
      artista: m.artista || stateDefault.artista,
      contexto: m.contextoNome || stateDefault.contexto,
      capa: m.capa || "",
      shuffle: !!m.shuffle,
      smartShuffle: !!m.smartShuffle,
      repeat: m.repeat || "all",
      posicao: m.posicao != null ? m.posicao : stateDefault.posicao,
      total: m.total != null ? m.total : stateDefault.total,
      tocando: m.tocando != null ? m.tocando : true,
      curtida: !!m.curtida
    });
  }

  function salvarEstado() {
    try { localStorage.setItem(LS_KEY, JSON.stringify(state)); }
    catch (e) { /* quota — ignora */ }
  }

  // ---------- HELPERS ----------
  function fmt(seg) {
    seg = Math.max(0, Math.floor(seg));
    const m = Math.floor(seg / 60);
    const s = seg % 60;
    return `${m}:${s < 10 ? "0" + s : s}`;
  }

  function repeatLabel(mode) {
    if (mode === "off") return "Off";
    if (mode === "all") return "Tudo";
    if (mode === "one") return "Uma";
    return "Off";
  }

  function repeatStatusText(mode) {
    if (mode === "off") return "Repetir: Off";
    if (mode === "all") return "Repetir: Tudo";
    if (mode === "one") return "Repetir: Uma";
    return "Repetir: Off";
  }

  function shuffleStatusText(active) {
    return active ? "Aleatório ativado" : "Aleatório desligado";
  }

  // ---------- ICON HELPER ----------
  function refreshIcons() {
    if (window.lucide && typeof window.lucide.createIcons === "function") {
      try { window.lucide.createIcons(); } catch (e) { /* noop */ }
    }
  }

  function setIcon(el, name) {
    if (!el) return;
    el.setAttribute("data-lucide", name);
    // recria todos (barato — poucos icones)
    refreshIcons();
  }

  // ---------- TELEMETRIA ----------
  function log(alvo, meta) {
    if (window.Telemetria && window.Telemetria.logEvent) {
      window.Telemetria.logEvent(TELA, alvo, meta);
    }
  }

  // ---------- TOAST ----------
  function toast(msg) {
    const region = document.getElementById("np-toast");
    const text = document.getElementById("np-toast-msg");
    if (!region || !text) return;
    text.textContent = msg;
    region.hidden = false;
    // force reflow
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

    // Cover/title/artist/context
    const cover = $("np-cover");
    if (cover && state.capa) {
      cover.src = state.capa;
      cover.alt = `Capa de ${state.titulo} — ${state.artista}`;
    } else if (cover) {
      cover.alt = `Capa de ${state.titulo} — ${state.artista}`;
    }
    if ($("np-title"))   $("np-title").textContent   = state.titulo;
    if ($("np-artist"))  $("np-artist").textContent  = state.artista;
    if ($("np-context-name")) $("np-context-name").textContent = state.contexto;

    // Heart
    const heart = $("np-heart");
    if (heart) {
      heart.setAttribute("aria-pressed", state.curtida ? "true" : "false");
      heart.setAttribute("aria-label",
        state.curtida ? "Remover de Músicas Curtidas" : "Curtir música");
    }

    // Seek
    const seek = $("np-seek");
    if (seek) {
      seek.max = String(state.total);
      seek.value = String(state.posicao);
      const pct = state.total > 0 ? (state.posicao / state.total) * 100 : 0;
      seek.style.setProperty("--np-progress", pct.toFixed(2) + "%");
    }
    if ($("np-current")) $("np-current").textContent = fmt(state.posicao);
    if ($("np-total"))   $("np-total").textContent   = fmt(state.total);

    // Status row textual
    const stShuf = $("np-status-shuffle");
    if (stShuf) stShuf.setAttribute("data-active", state.shuffle ? "true" : "false");
    if ($("np-status-shuffle-text"))
      $("np-status-shuffle-text").textContent = shuffleStatusText(state.shuffle);

    const stRep = $("np-status-repeat");
    if (stRep) stRep.setAttribute("data-mode", state.repeat);
    if ($("np-status-repeat-text"))
      $("np-status-repeat-text").textContent = repeatStatusText(state.repeat);

    // Shuffle button
    const shufBtn = $("np-shuffle");
    if (shufBtn) {
      shufBtn.setAttribute("aria-pressed", state.shuffle ? "true" : "false");
      shufBtn.setAttribute("aria-label",
        state.shuffle ? "Aleatório ativado" : "Aleatório desligado");
    }

    // Repeat button
    const repBtn = $("np-repeat");
    if (repBtn) {
      repBtn.setAttribute("data-mode", state.repeat);
      repBtn.setAttribute("aria-label", `Repetir: ${repeatLabel(state.repeat)}`);
    }
    if ($("np-repeat-label"))
      $("np-repeat-label").textContent = repeatLabel(state.repeat);

    // Repeat icon swap (one mostra "repeat-1")
    const repIco = $("np-repeat-icon");
    if (repIco) {
      const desired = state.repeat === "one" ? "repeat-1" : "repeat";
      if (repIco.getAttribute("data-lucide") !== desired) {
        setIcon(repIco, desired);
      }
    }

    // Play/pause icon
    const playBtn = $("np-play");
    const playIco = $("np-play-icon");
    if (playBtn) {
      playBtn.setAttribute("aria-pressed", state.tocando ? "true" : "false");
      playBtn.setAttribute("aria-label", state.tocando ? "Pausar" : "Tocar");
    }
    if (playIco) {
      const desired = state.tocando ? "pause" : "play";
      if (playIco.getAttribute("data-lucide") !== desired) {
        setIcon(playIco, desired);
      }
    }

    // Smart Shuffle switch
    const smart = $("np-smart");
    if (smart) {
      smart.setAttribute("aria-checked", state.smartShuffle ? "true" : "false");
      smart.setAttribute("aria-label",
        state.smartShuffle ? "Desativar Smart Shuffle" : "Ativar Smart Shuffle");
    }
  }

  // ---------- TICK (simula progresso) ----------
  function startTick() {
    stopTick();
    if (!state.tocando) return;
    tickTimer = setInterval(() => {
      state.posicao += 1;
      if (state.posicao >= state.total) {
        if (state.repeat === "one") {
          state.posicao = 0;
        } else if (state.repeat === "all") {
          state.posicao = 0;
        } else {
          state.posicao = state.total;
          state.tocando = false;
          stopTick();
        }
      }
      // update apenas progress (barato)
      const seek = document.getElementById("np-seek");
      if (seek) {
        seek.value = String(state.posicao);
        const pct = (state.posicao / state.total) * 100;
        seek.style.setProperty("--np-progress", pct.toFixed(2) + "%");
      }
      const cur = document.getElementById("np-current");
      if (cur) cur.textContent = fmt(state.posicao);
      if (!state.tocando) render();
    }, 1000);
  }

  function stopTick() {
    if (tickTimer) { clearInterval(tickTimer); tickTimer = null; }
  }

  // ---------- EVENT HANDLERS ----------
  function onTogglePlay() {
    state.tocando = !state.tocando;
    salvarEstado();
    render();
    state.tocando ? startTick() : stopTick();
    log("play_toggle", { tocando: state.tocando, pos: state.posicao });
  }

  function onToggleHeart() {
    state.curtida = !state.curtida;
    salvarEstado();
    render();
    toast(state.curtida
      ? "Adicionado a Músicas Curtidas"
      : "Removido de Músicas Curtidas");
    log("heart_toggle", { curtida: state.curtida });
  }

  function onAdd() {
    toast("Adicionado à playlist");
    log("add_to_playlist", { faixa: state.titulo });
  }

  function onToggleShuffle() {
    state.shuffle = !state.shuffle;
    salvarEstado();
    render();
    toast(state.shuffle ? "Aleatório ativado" : "Aleatório desligado");
    log("shuffle_toggle", { ativo: state.shuffle, smartShuffle: state.smartShuffle });
  }

  function onCycleRepeat() {
    const seq = ["off", "all", "one"];
    const i = seq.indexOf(state.repeat);
    state.repeat = seq[(i + 1) % seq.length];
    salvarEstado();
    render();
    toast("Repetir: " + repeatLabel(state.repeat));
    log("repeat_cycle", { modo: state.repeat });
  }

  function onToggleSmart() {
    state.smartShuffle = !state.smartShuffle;
    salvarEstado();
    render();
    toast(state.smartShuffle
      ? "Smart Shuffle ativado"
      : "Smart Shuffle desligado");
    log("smart_shuffle_toggle", {
      ativo: state.smartShuffle,
      shuffle: state.shuffle
    });
  }

  function onPrev() {
    state.posicao = 0;
    salvarEstado();
    render();
    log("prev_track");
  }

  function onNext() {
    state.posicao = state.total;
    state.tocando = false;
    stopTick();
    salvarEstado();
    render();
    log("next_track");
  }

  function onSeekInput(e) {
    const v = parseInt(e.target.value, 10) || 0;
    state.posicao = v;
    const cur = document.getElementById("np-current");
    if (cur) cur.textContent = fmt(state.posicao);
    const pct = state.total > 0 ? (state.posicao / state.total) * 100 : 0;
    e.target.style.setProperty("--np-progress", pct.toFixed(2) + "%");
  }

  let seekDebounce = null;
  function onSeekChange(e) {
    const v = parseInt(e.target.value, 10) || 0;
    state.posicao = v;
    clearTimeout(seekDebounce);
    seekDebounce = setTimeout(() => {
      salvarEstado();
      log("seek", { pos: state.posicao, total: state.total });
    }, 50);
  }

  function onCollapse() {
    log("collapse_player");
    if (document.referrer) history.back();
    else location.href = "../index.html";
  }

  function onMore() {
    log("more_menu_open");
    toast("Menu (mock)");
  }

  function onDevices() { log("devices_open"); toast("Dispositivos disponíveis"); }
  function onShare()   { log("share_open");   toast("Compartilhar"); }
  function onQueue()   { log("queue_open");   toast("Fila de reprodução"); }

  // ---------- BIND ----------
  function bind() {
    const map = [
      ["np-collapse", "click", onCollapse],
      ["np-more",     "click", onMore],
      ["np-heart",    "click", onToggleHeart],
      ["np-add",      "click", onAdd],
      ["np-play",     "click", onTogglePlay],
      ["np-prev",     "click", onPrev],
      ["np-next",     "click", onNext],
      ["np-shuffle",  "click", onToggleShuffle],
      ["np-repeat",   "click", onCycleRepeat],
      ["np-smart",    "click", onToggleSmart],
      ["np-devices",  "click", onDevices],
      ["np-share",    "click", onShare],
      ["np-queue",    "click", onQueue],
      ["np-seek",     "input",  onSeekInput],
      ["np-seek",     "change", onSeekChange]
    ];
    map.forEach(([id, evt, fn]) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener(evt, fn);
    });

    // Keyboard shortcut espaco = play/pause
    document.addEventListener("keydown", (e) => {
      if (e.code === "Space" && e.target.tagName !== "INPUT") {
        e.preventDefault();
        onTogglePlay();
      }
    });
  }

  // ---------- INIT ----------
  let _wasPlayingBeforeHide = false;
  function init() {
    bind();
    render();
    refreshIcons();
    if (state.tocando) startTick();
    // Pausa o tick em background (economia de bateria; evita drift)
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        _wasPlayingBeforeHide = state.tocando;
        stopTick();
      } else if (_wasPlayingBeforeHide && state.tocando) {
        startTick();
      }
    });
    log("view_open", {
      shuffle: state.shuffle,
      smartShuffle: state.smartShuffle,
      repeat: state.repeat
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
