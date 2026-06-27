/* ============================================================
   T5 — Configuracoes com busca
   - Renderiza grupos/itens a partir de dataset interno
   - Busca incremental case-insensitive + sem-acentos
   - Highlight do termo com <mark>
   - Empty state quando nada encontrado
   - Log via Telemetria.logEvent("t5", ...)
   ============================================================ */
(function () {
  "use strict";

  const TELA = "t5";

  // -----------------------------------------------------------
  // DADOS (estrutura de configuracoes)
  // -----------------------------------------------------------
  const GRUPOS = [
    {
      id: "conta",
      label: "Conta",
      itens: [
        { id: "perfil",   icone: "user",          titulo: "Perfil",            valor: "Vitor M.",     kw: "nome usuario perfil identidade" },
        { id: "email",    icone: "mail",          titulo: "E-mail",            valor: "vitor@ex.com", kw: "email contato login" },
        { id: "plano",    icone: "star",          titulo: "Plano",             valor: "Premium",      kw: "assinatura premium pagamento individual familia" },
        { id: "vinculo",  icone: "link",          titulo: "Contas vinculadas", valor: "2 ativas",     kw: "google facebook apple conta vinculo conectar" },
        { id: "logout",   icone: "log-out",       titulo: "Sair da conta",     valor: "",             kw: "logout sair desconectar encerrar sessao" }
      ]
    },
    {
      id: "reproducao",
      label: "Reprodução",
      itens: [
        { id: "autoplay",   icone: "play",         titulo: "Autoplay",                 valor: "Ativado",  kw: "tocar automaticamente continuar sequencia fila" },
        { id: "crossfade",  icone: "shuffle",      titulo: "Crossfade",                valor: "5s",       kw: "transicao musicas fade misturar" },
        { id: "normalizar", icone: "bar-chart-2", titulo: "Normalizar volume",        valor: "Normal",   kw: "volume loudness equalizar" },
        { id: "smart",      icone: "sparkles",     titulo: "Persistir Smart Shuffle",  valor: "Ativado",  kw: "smart shuffle aleatorio inteligente lembrar manter" },
        { id: "gapless",    icone: "minimize-2",   titulo: "Gapless playback",         valor: "Ativado",  kw: "sem pausa continuo album" },
        { id: "monitor",    icone: "headphones",   titulo: "Monitorar audio",          valor: "Off",      kw: "monitor sair fone cancelamento" }
      ]
    },
    {
      id: "qualidade",
      label: "Qualidade de áudio",
      itens: [
        { id: "wifi",       icone: "wifi",          titulo: "Streaming em Wi-Fi",    valor: "Muito alta",   kw: "qualidade audio wifi internet bitrate" },
        { id: "celular",    icone: "smartphone",    titulo: "Streaming em Celular",  valor: "Alta",         kw: "qualidade audio celular dados 4g 5g bitrate movel" },
        { id: "download",   icone: "download",      titulo: "Qualidade de download", valor: "Muito alta",   kw: "qualidade audio download offline baixar bitrate" },
        { id: "auto",       icone: "activity",      titulo: "Ajuste automático",     valor: "Ativado",      kw: "qualidade automatica adaptativa conexao" }
      ]
    },
    {
      id: "notificacoes",
      label: "Notificações",
      itens: [
        { id: "novos",     icone: "bell",          titulo: "Novos lançamentos",     valor: "Push",        kw: "notificacao alerta push novidade artista lancamento" },
        { id: "shows",     icone: "calendar",      titulo: "Shows e eventos",       valor: "E-mail",      kw: "notificacao show evento perto cidade tour" },
        { id: "ofertas",   icone: "tag",           titulo: "Ofertas e promoções",   valor: "Off",         kw: "notificacao oferta desconto promocao premium" }
      ]
    },
    {
      id: "privacidade",
      label: "Privacidade",
      itens: [
        { id: "sessao",    icone: "eye-off",       titulo: "Sessão privada",        valor: "Off",         kw: "privado anonimo invisivel privacidade ocultar atividade" },
        { id: "atividade", icone: "users",         titulo: "Atividade aos amigos",  valor: "Visível",     kw: "amigos seguidores compartilhar atividade ouvindo" },
        { id: "explicito", icone: "shield",        titulo: "Conteúdo explícito",    valor: "Permitido",   kw: "explicito conteudo adulto filtro letra palavrao" },
        { id: "dados",     icone: "file-text",     titulo: "Solicitar meus dados",  valor: "",            kw: "lgpd gdpr dados pessoais exportar baixar privacidade" }
      ]
    },
    {
      id: "acessibilidade",
      label: "Acessibilidade",
      itens: [
        { id: "legenda",   icone: "captions",      titulo: "Legendas em podcasts",  valor: "Ativado",     kw: "legenda subtitulo acessibilidade surdo podcast" },
        { id: "contraste", icone: "contrast",      titulo: "Alto contraste",        valor: "Off",         kw: "contraste acessibilidade visao baixa visual" },
        { id: "movimento", icone: "pause-circle",  titulo: "Reduzir animações",     valor: "Sistema",     kw: "animacao movimento acessibilidade vestibular reduzir" },
        { id: "tamanho",   icone: "type",          titulo: "Tamanho da fonte",      valor: "Padrão",      kw: "fonte tamanho texto acessibilidade leitura grande" }
      ]
    },
    {
      id: "sobre",
      label: "Sobre",
      itens: [
        { id: "versao",     icone: "info",          titulo: "Versão do app",        valor: "0.1.0",       kw: "versao app build sobre" },
        { id: "termos",     icone: "file",          titulo: "Termos de uso",        valor: "",            kw: "termos uso legal contrato" },
        { id: "politica",   icone: "shield-check",  titulo: "Política de privacidade", valor: "",         kw: "politica privacidade legal lgpd" },
        { id: "licencas",   icone: "book-open",     titulo: "Licenças de terceiros",valor: "",            kw: "licenca opensource codigo aberto creditos" }
      ]
    }
  ];

  // -----------------------------------------------------------
  // STATE
  // -----------------------------------------------------------
  const state = {
    termo: "",
    visiveis: 0,
    totalItens: GRUPOS.reduce((a, g) => a + g.itens.length, 0)
  };

  // -----------------------------------------------------------
  // UTIL
  // -----------------------------------------------------------
  function normaliza(s) {
    return (s || "")
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "");
  }

  function escapeHTML(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
  }

  // Procura o termo no texto normalizado, mas devolve string HTML que
  // preserva os caracteres originais (com acentos) e envolve o trecho
  // correspondente em <mark>.
  function destacar(texto, termoNorm) {
    if (!termoNorm) return escapeHTML(texto);
    const tNorm = normaliza(texto);
    const i = tNorm.indexOf(termoNorm);
    if (i < 0) return escapeHTML(texto);
    const fim = i + termoNorm.length;
    return (
      escapeHTML(texto.slice(0, i)) +
      "<mark>" + escapeHTML(texto.slice(i, fim)) + "</mark>" +
      escapeHTML(texto.slice(fim))
    );
  }

  // -----------------------------------------------------------
  // REFS DOM
  // -----------------------------------------------------------
  const lista       = document.getElementById("t5-settings-list");
  const empty       = document.querySelector(".t5-empty");
  const emptyTerm   = document.querySelector(".t5-empty__term");
  const statusEl    = document.getElementById("t5-search-status");
  const input       = document.getElementById("t5-search-input");
  const clearBtn    = document.querySelector(".t5-search-field__clear");
  const topbar      = document.querySelector(".t5-topbar");
  const detalhe     = document.querySelector(".t5-detail");
  const detalheTit  = document.querySelector(".t5-detail__title");
  const detalheNome = document.querySelector(".t5-detail__current-name");

  let ultimoFoco = null;
  let debounceTimer = null;

  // -----------------------------------------------------------
  // RENDER
  // -----------------------------------------------------------
  function renderInicial() {
    const html = GRUPOS.map(grupoToHTML).join("");
    lista.innerHTML = html;
    if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
  }

  function grupoToHTML(grupo) {
    const rows = grupo.itens.map((it) => rowToHTML(grupo.id, it)).join("");
    return (
      `<li class="t5-group" data-group="${grupo.id}">` +
        `<h2 class="t5-group__label">${escapeHTML(grupo.label)}</h2>` +
        `<ul class="t5-card">${rows}</ul>` +
      `</li>`
    );
  }

  function rowToHTML(grupoId, it) {
    const ariaValor = it.valor ? ", valor atual " + it.valor : "";
    return (
      `<li>` +
        `<button type="button" class="t5-row"` +
          ` data-row data-group="${grupoId}" data-id="${it.id}"` +
          ` data-titulo="${escapeHTML(it.titulo)}"` +
          ` data-valor="${escapeHTML(it.valor)}"` +
          ` data-keywords="${escapeHTML(it.kw)}"` +
          ` aria-label="${escapeHTML(it.titulo + ariaValor)}">` +
          `<span class="t5-row__icon" aria-hidden="true"><i data-lucide="${it.icone}"></i></span>` +
          `<span class="t5-row__text">` +
            `<span class="t5-row__title" data-field="titulo">${escapeHTML(it.titulo)}</span>` +
          `</span>` +
          `<span class="t5-row__value" data-field="valor">${escapeHTML(it.valor)}</span>` +
          `<span class="t5-row__chevron" aria-hidden="true"><i data-lucide="chevron-right"></i></span>` +
        `</button>` +
      `</li>`
    );
  }

  // -----------------------------------------------------------
  // FILTRO
  // -----------------------------------------------------------
  function aplicarFiltro(termoBruto) {
    const termo = (termoBruto || "").trim();
    const termoNorm = normaliza(termo);
    state.termo = termo;

    let totalVisivel = 0;

    const grupos = lista.querySelectorAll(".t5-group");
    grupos.forEach((grupoEl) => {
      const rows = grupoEl.querySelectorAll("[data-row]");
      let visiveisNoGrupo = 0;

      rows.forEach((row) => {
        const titulo = row.dataset.titulo || "";
        const valor  = row.dataset.valor  || "";
        const kws    = row.dataset.keywords || "";
        const haystack = normaliza(titulo + " " + valor + " " + kws);

        const match = !termoNorm || haystack.indexOf(termoNorm) >= 0;

        if (match) {
          row.hidden = false;
          const tEl = row.querySelector('[data-field="titulo"]');
          const vEl = row.querySelector('[data-field="valor"]');
          tEl.innerHTML = destacar(titulo, termoNorm);
          if (termoNorm && normaliza(valor).indexOf(termoNorm) >= 0) {
            vEl.innerHTML = destacar(valor, termoNorm);
          } else {
            vEl.textContent = valor;
          }
          visiveisNoGrupo++;
        } else {
          row.hidden = true;
        }
      });

      grupoEl.hidden = visiveisNoGrupo === 0;
      totalVisivel += visiveisNoGrupo;
    });

    state.visiveis = totalVisivel;

    if (totalVisivel === 0 && termoNorm) {
      empty.hidden = false;
      emptyTerm.textContent = termo;
    } else {
      empty.hidden = true;
    }

    if (!termoNorm) {
      statusEl.textContent = "";
    } else if (totalVisivel === 0) {
      statusEl.textContent = `Nenhum resultado para ${termo}`;
    } else {
      statusEl.textContent = `${totalVisivel} resultado${totalVisivel === 1 ? "" : "s"} para ${termo}`;
    }

    clearBtn.hidden = !termo;
  }

  // -----------------------------------------------------------
  // DETALHE (overlay)
  // -----------------------------------------------------------
  function abrirDetalhe(row) {
    const titulo = row.dataset.titulo || "Detalhe";
    const id     = row.dataset.id     || "";
    const grupo  = row.dataset.group  || "";
    detalheTit.textContent  = titulo;
    detalheNome.textContent = titulo;
    ultimoFoco = row;
    if (window.openModal) {
      window.openModal(detalhe, {
        onClose: () => {
          if (window.Telemetria) Telemetria.logEvent(TELA, "fechar_detalhe");
        }
      });
    } else {
      detalhe.hidden = false;
      const back = detalhe.querySelector(".t5-detail__back");
      if (back) back.focus();
    }
    if (window.Telemetria) Telemetria.logEvent(TELA, "abrir_detalhe", { id, grupo, termo: state.termo });
  }

  function fecharDetalhe() {
    if (detalhe.hidden) return;
    if (window.closeModal) {
      window.closeModal();
      detalhe.hidden = true;
    } else {
      detalhe.hidden = true;
      if (ultimoFoco) ultimoFoco.focus();
      if (window.Telemetria) Telemetria.logEvent(TELA, "fechar_detalhe");
    }
  }

  // -----------------------------------------------------------
  // EVENTOS
  // -----------------------------------------------------------
  input.addEventListener("input", (e) => {
    const v = e.target.value;
    clearBtn.hidden = !v;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      aplicarFiltro(v);
      if (window.Telemetria) {
        Telemetria.logEvent(TELA, "buscar", { termo: v, resultados: state.visiveis });
      }
    }, 120);
  });

  clearBtn.addEventListener("click", () => {
    input.value = "";
    aplicarFiltro("");
    input.focus();
    if (window.Telemetria) Telemetria.logEvent(TELA, "limpar_busca");
  });

  lista.addEventListener("click", (e) => {
    const row = e.target.closest("[data-row]");
    if (!row) return;
    abrirDetalhe(row);
  });

  detalhe.addEventListener("click", (e) => {
    if (e.target.matches("[data-close]")) fecharDetalhe();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (!detalhe.hidden) {
        fecharDetalhe();
      } else if (state.termo) {
        input.value = "";
        aplicarFiltro("");
      }
    }
  });

  function onScroll() {
    const y = window.scrollY || document.documentElement.scrollTop || 0;
    topbar.dataset.elevated = y > 4 ? "true" : "false";
  }
  window.addEventListener("scroll", onScroll, { passive: true });

  // -----------------------------------------------------------
  // INIT
  // -----------------------------------------------------------
  function init() {
    renderInicial();
    aplicarFiltro("");
    if (window.Telemetria) {
      Telemetria.logEvent(TELA, "tela_carregada", { totalItens: state.totalItens });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
