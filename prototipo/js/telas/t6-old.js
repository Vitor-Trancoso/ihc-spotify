/* ============================================================
   T6 — DESCOBERTA (V2.2)
   Telemetria de abertura + cliques nos cards/seções.
   ============================================================ */
(function () {
  const TELA = "t6";

  function logEvent(alvo, meta) {
    if (window.Telemetria && typeof window.Telemetria.logEvent === "function") {
      window.Telemetria.logEvent(TELA, alvo, meta || {});
    }
  }

  function init() {
    logEvent("tela_aberta", { rota: "descoberta" });

    // Cliques em cards (media-card)
    document.querySelectorAll("[data-t6-card]").forEach((el) => {
      el.addEventListener("click", (ev) => {
        ev.preventDefault();
        const tipo = el.getAttribute("data-tipo") || "?";
        const id = el.getAttribute("data-id") || "?";
        const nome = el.getAttribute("data-nome") || "?";
        const secao = el.getAttribute("data-secao") || "?";
        logEvent("card_click", { tipo, id, nome, secao });
      });
    });

    // Ver tudo
    document.querySelectorAll("[data-t6-see-all]").forEach((btn) => {
      btn.addEventListener("click", (ev) => {
        ev.preventDefault();
        const secao = btn.getAttribute("data-t6-see-all") || "?";
        logEvent("ver_tudo_click", { secao });
      });
    });

    // Chips de gênero
    document.querySelectorAll("[data-t6-genre]").forEach((btn) => {
      btn.addEventListener("click", (ev) => {
        ev.preventDefault();
        const genero = btn.getAttribute("data-t6-genre") || "?";
        logEvent("genero_click", { genero });
      });
    });

    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
