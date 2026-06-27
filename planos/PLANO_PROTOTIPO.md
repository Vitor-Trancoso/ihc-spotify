# Plano de Implementação — Protótipo Spotify Mobile Redesenhado

## 1. Visão geral

### Objetivo
Construir um protótipo navegável de alta fidelidade do Spotify Mobile redesenhado, focado em validar com usuários (entrevistas IHC) as hipóteses H3, H5, H7 e H8 levantadas na fase de pesquisa. O protótipo cobre 5 telas principais e 2 modais críticos, com microinterações realistas, paleta e tipografia o mais próximo possível do Encore Design System da Spotify (2024/2025).

### Linguagem: HTML + CSS + JS vanilla — por quê
- **Zero build step**: abre direto no navegador (ou via `python -m http.server`), sem dependências de toolchain. Vital para apresentar em qualquer máquina no dia da entrevista.
- **Fidelidade total**: CSS nativo cobre 100% das animações desejadas (cubic-bezier, keyframes, transitions); JS vanilla cobre toggles, bottom-sheet drag, snackbar timing.
- **Reuso direto na pesquisa**: cada classe e token mapeia 1:1 para a documentação que será citada no TCC/relatório.
- **Performance no celular**: sem React/Vue overhead, animações 60fps mesmo em iPhone 11 antigo.
- **Compromisso pedagógico**: o protótipo é um artefato de pesquisa, não um produto — engenharia mínima necessária.

### Telas no escopo
| ID | Nome | Hipótese alvo |
|----|------|---------------|
| T1 | Home minimalista (toggle Compacto/Descobrir) | H3 — sobrecarga visual da Home |
| T2 | Player redesenhado (Now Playing) | H7 — ambiguidade de shuffle/Smart Shuffle/repeat |
| T3 | Biblioteca com seleção múltipla | H5 — ações em lote ausentes |
| T4 | Menu contextual da música (bottom sheet agrupado) | H5 — hierarquia confusa do menu atual |
| T5 | Configurações com busca | H8 — busca ausente em settings |
| MA | Modal A — Snackbar Desfazer | H5 — reversibilidade de ações destrutivas |
| MB | Modal B — Card de recomendação melhorado ("Por que?" + X) | H3/H7 — transparência das recomendações |

### Viewport alvo
**375 × 812 pt** (iPhone X/11/12/13/14 — base do iOS Human Interface Guidelines e do Figma UI Kit oficial do Spotify). Safe-area: status bar 44pt topo, home indicator 34pt rodapé.

### Como rodar localmente
```bash
cd /Users/vitormarconi/Documents/GitHub/ihc-spotify/prototipo
python3 -m http.server 8080
# abrir http://localhost:8080 no Chrome
# DevTools → Toggle Device Toolbar → iPhone 12 Pro (390x844) ou Responsive 375x812
```
Para apresentar no celular real: `ngrok http 8080` ou abrir via rede local (`http://<ip-do-mac>:8080`). Testar em iPhone real e Android antes da entrevista (Sprint 7).

---

## 2. Estrutura de pastas

```
prototipo/
├── index.html                         # roteador/menu de telas (entrada do entrevistador)
├── css/
│   ├── tokens.css                     # variáveis :root (cores, type, spacing, easing, radius, shadow)
│   ├── base.css                       # reset, html/body, scrollbar, focus-visible, safe-area
│   ├── components.css                 # bottom-nav, mini-player, snackbar, bottom-sheet, song-row, chip, eq-bars
│   └── telas/
│       ├── t1-home-minimalista.css
│       ├── t2-player.css
│       ├── t3-biblioteca-selecao.css
│       ├── t4-menu-musica.css
│       ├── t5-configuracoes.css
│       ├── ma-snackbar.css
│       └── mb-card-recomendacao.css
├── js/
│   ├── app.js                         # roteador hash-based, estado global (faixa atual, modo home)
│   ├── persist.js                     # wrapper localStorage com namespacing
│   ├── animations.js                  # helpers (pulse, shimmer, slide-up)
│   ├── bottom-sheet.js                # módulo reusável (open/close/drag/focus-trap)
│   ├── snackbar.js                    # Snackbar.show({msg, action, undo, duration})
│   ├── color-extract.js               # extrai cor dominante da capa (canvas) p/ gradiente player
│   └── telas/
│       ├── t1-home-minimalista.js
│       ├── t2-player.js
│       ├── t3-biblioteca-selecao.js
│       ├── t4-menu-musica.js
│       ├── t5-configuracoes.js
│       ├── ma-snackbar.js
│       └── mb-card-recomendacao.js
├── data/
│   ├── tracks.json                    # mock de músicas (id, title, artist, album, cover, duration)
│   ├── playlists.json                 # mock de playlists do usuário
│   └── settings.json                  # estrutura das configs (grupos, rows, keywords)
├── assets/
│   ├── icons/                         # SVGs Lucide (play, pause, shuffle, repeat, heart, etc.)
│   └── images/                        # capas mock (Unsplash/placehold) + avatar
└── telas/
    ├── t1-home-minimalista.html
    ├── t2-player.html
    ├── t3-biblioteca-selecao.html
    ├── t4-menu-musica.html
    ├── t5-configuracoes.html
    ├── ma-snackbar-desfazer.html
    └── mb-card-recomendacao.html
```

---

## 3. Design tokens (`css/tokens.css`)

```css
/* ============================================================
   SPOTIFY MOBILE REDESIGN — DESIGN TOKENS
   Baseado em Encore Design System (Spotify, 2024/2025)
   ============================================================ */
:root {
  /* --- BRAND GREENS --- */
  --spotify-green:           #1ED760;
  --spotify-green-press:     #1DB954;
  --spotify-green-hover:     #1FDF64;
  --spotify-green-essential: #1ED760;

  /* --- BACKGROUND HIERARCHY (dark, layered) --- */
  --background-base:                  #121212;
  --background-elevated-base:         #1A1A1A;
  --background-tinted-base:           #1F1F1F;
  --background-elevated-highlight:    #2A2A2A;
  --background-tinted-highlight:      #282828;
  --background-press:                 #000000;
  --background-highlight:             #333333;
  --background-unsafe-small-text:     #535353;

  /* --- TEXT --- */
  --text-base:           #FFFFFF;
  --text-subdued:        #A7A7A7;
  --text-bright-accent:  #1ED760;
  --text-negative:       #F15E6C;
  --text-warning:        #FFA42B;
  --text-positive:       #1ED760;
  --text-announcement:   #3D91F4;
  --text-disabled:       #6A6A6A;

  /* --- ESSENTIALS / STATES --- */
  --essential-base:           #FFFFFF;
  --essential-subdued:        #727272;
  --essential-bright-accent:  #1ED760;
  --essential-negative:       #E91429;
  --essential-warning:        #FFA42B;
  --essential-positive:       #1ED760;
  --essential-announcement:   #0D72EA;

  /* --- DECORATIVE / BORDERS --- */
  --decorative-base:    #FFFFFF;
  --decorative-subdued: #292929;
  --border-subtle:      rgba(255,255,255,0.10);
  --border-strong:      rgba(255,255,255,0.20);

  /* --- PROGRESS / NOW PLAYING --- */
  --progress-bar-bg:         rgba(255,255,255,0.30);
  --progress-bar-fill:       #FFFFFF;
  --progress-bar-fill-hover: #1ED760;
  --now-playing-indicator:   #1ED760;

  /* --- GRADIENTS --- */
  --gradient-playlist-header: linear-gradient(180deg, var(--header-color,#535353) 0%, #121212 100%);
  --gradient-now-playing-bar: linear-gradient(180deg, #181818 0%, #000000 100%);
  --gradient-liked-songs:     linear-gradient(149.46deg, #450AF5 0%, #8E8EE5 99.16%);
  --gradient-podcast:         linear-gradient(149.46deg, #27856A 0%, #1ED760 99.16%);
  --gradient-card-hover:      linear-gradient(transparent 0, rgba(0,0,0,0.5) 100%);

  /* --- TYPOGRAPHY --- */
  --font-family: "Spotify Mix","Spotify Circular","CircularSp","Inter",
                 -apple-system,BlinkMacSystemFont,"Helvetica Neue",Helvetica,Arial,sans-serif;

  --fw-book:   400;
  --fw-medium: 500;
  --fw-bold:   700;
  --fw-black:  900;

  --fs-micro:    11px;  --lh-micro:    1.27; --ls-micro:    0.06em;
  --fs-caption:  12px;  --lh-caption:  1.33;
  --fs-body:     14px;  --lh-body:     1.43;
  --fs-row:      16px;  --lh-row:      1.5;
  --fs-section:  22px;  --lh-section:  1.25; --ls-section: -0.02em;
  --fs-hero:     32px;  --lh-hero:     1.08; --ls-hero:    -0.04em;

  /* --- SPACING (4pt grid) --- */
  --s-1: 4px;  --s-2: 8px;  --s-3: 12px; --s-4: 16px;
  --s-6: 24px; --s-8: 32px; --s-12: 48px;

  /* --- RADIUS --- */
  --r-cover:  4px;
  --r-card:   8px;
  --r-sheet:  16px;
  --r-pill:   500px;
  --r-circle: 50%;

  /* --- SHADOW --- */
  --shadow-card:  0 4px 12px rgba(0,0,0,0.4);
  --shadow-cover: 0 8px 24px rgba(0,0,0,0.5);
  --shadow-sheet: 0 -8px 24px rgba(0,0,0,0.5);

  /* --- EASING --- */
  --ease-standard:      cubic-bezier(0.4, 0.0, 0.2, 1);
  --ease-decelerate:    cubic-bezier(0.0, 0.0, 0.2, 1);
  --ease-accelerate:    cubic-bezier(0.4, 0.0, 1.0, 1);
  --ease-emphasized:    cubic-bezier(0.2, 0.0, 0.0, 1.0);
  --ease-spotify-pulse: cubic-bezier(0.65, 0, 0.35, 1);

  /* --- DURATION --- */
  --d-micro:    120ms;
  --d-tap:      180ms;
  --d-standard: 250ms;
  --d-sheet:    350ms;

  /* --- SAFE AREA --- */
  --safe-top:    env(safe-area-inset-top, 44px);
  --safe-bottom: env(safe-area-inset-bottom, 34px);

  /* --- Z-LAYERS --- */
  --z-nav:       50;
  --z-mini:      60;
  --z-snackbar:  80;
  --z-sheet:     90;
  --z-backdrop:  85;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 150ms !important;
  }
}
```

---

## 4. Componentes compartilhados

### 4.1 Bottom Navigation (`.bottom-nav`)
- **Estrutura**: `<nav>` fixo `bottom:0`, height `calc(56px + var(--safe-bottom))`, 4 itens (`Início`, `Buscar`, `Sua Biblioteca`, `Criar`).
- **Classes**: `.bottom-nav`, `.bottom-nav__item`, `.bottom-nav__item[data-active]`.
- **Estados**: inactive (ícone outline + `--text-subdued`) / active (ícone filled + `--text-base`). Transição de cor 200ms `--ease-standard`.
- **Acessibilidade**: `<a role="link">` com `aria-current="page"` no ativo; alvo 56pt vertical.

### 4.2 Mini-Player flutuante (`.mini-player`)
- **Estrutura**: `<aside>` fixo, height 56pt, posição `bottom: calc(var(--safe-bottom) + 56px + 8px)`, `left/right: 8px`, `border-radius: 8px`, `background: var(--background-tinted-highlight)`.
- **Conteúdo**: thumb 40x40 (radius 4), título 14/500, artista 12/400, botões device/heart/play (24px), progress 2pt no rodapé.
- **Estados**: playing (ícone pause + eq bars piscando), paused, hidden (sem faixa).
- **Tap**: expande para Player T2 (slide-up 350ms `--ease-emphasized`).

### 4.3 App Header (`.app-header`)
- **Estrutura**: 56pt, padding lateral 16, `display:flex` space-between.
- **Variantes**: `--with-avatar` (Home), `--with-back` (telas internas, ícone `chevronLeft`), `--with-search-toggle`.
- **Sticky**: `position:sticky; top:0; background:var(--background-base)`; box-shadow no scroll via IntersectionObserver.

### 4.4 Snackbar (`.snackbar`) — ver MA
- Componente compartilhado. Módulo `Snackbar.show({msg, action, undo, duration=6000})`.
- Posicionado acima do mini-player + bottom-nav (`bottom: calc(safe + 56 + 56 + 16)`).

### 4.5 Bottom Sheet (`.sheet`) — ver T4, MB
- **Estrutura**: backdrop + sheet, handle 36×4, radius topo 16, max-height 90vh, scroll interno.
- **Drag**: pointer events 1:1, release com velocity threshold.
- **Focus-trap** + restore.
- Snap-points configuráveis (`[0.45, 0.9]`).

### 4.6 Song Row (`.track-row`)
- 64pt, grid `48px 1fr auto`, gap 12, padding-x 16.
- Cover 48×48 radius 4 (artistas → circular).
- Title 16/500, subline 14/400 `--text-subdued` (inclui ícone download + artista + duração).
- Botão `.more` 24px direita.
- Estado `[data-playing]` → mostra eq-bars no slot do índice.

### 4.7 Context Menu (Song Bottom Sheet) — ver T4
- Header com cover 64 + título + sub; 4 grupos separados por divider de 1px `--decorative-subdued`.
- Rows 56pt, gap 16 entre ícone (24px) e label.

### 4.8 Song Card (`.media-card`) — Home
- 168×~220pt, cover quadrado radius 4, badge superior esquerdo (tipo de mídia), 2 linhas texto.
- Estado hover: `scale(0.96)` 100ms.

### 4.9 Chip (`.chip`)
- Pill 32pt, padding-x 12, font 14/700.
- Default: `--background-tinted-highlight` + `--text-base`.
- Active: `--spotify-green` + `#000`.

### 4.10 Equalizer Bars (`.eq-bars`)
- 3 barras 2pt, altura animada 30%–100% via keyframes, stagger 0/150/300ms, cor `--now-playing-indicator`.
- Pausa congela altura.

---

## 5. Telas

### T1 — Home minimalista

**Objetivo**: validar H3 (sobrecarga visual). Toggle Compacto/Descobrir + chips Música/Podcasts/Audiolivros + grid 2-col + 1 única seção editorial colapsável.

**Wireframe ASCII (375×812)**
```
┌─────────────────────────────────────┐
│ 09:41        •••              ▮▮ ▮ │
├─────────────────────────────────────┤
│ Boa noite, Vitor          (avatar) │
│ ┌───────────────┬───────────────┐  │
│ │ ● Compacto    │   Descobrir   │  │
│ └───────────────┴───────────────┘  │
│  Música   Podcasts   Audiolivros   │
│  Recentes                           │
│  ┌────────────┐  ┌────────────┐    │
│  │▢ Discover..│  │▢ Daily Mix1│    │
│  ├────────────┤  ├────────────┤    │
│  │▢ Liked Sng │  │▢ Lo-fi Beats   │
│  └────────────┘  └────────────┘    │
│  Continue ouvindo                   │
│  ┌──────┬──────┐                    │
│  │ ▢ ♪  │ ▢ ♪  │                   │
│  ├──────┼──────┤                    │
│  │ ▢ ♪  │ ▢ ♪  │                   │
│  └──────┴──────┘                    │
│  ▸ Editorial (colapsado)            │
├─────────────────────────────────────┤
│  ⌂ Início  ⌕ Buscar  ☰ Biblioteca  │
└─────────────────────────────────────┘
```

**Estrutura HTML** (resumo)
```html
<main class="home home--compact">
  <header class="home__header">
    <h1 class="greeting">Boa noite, Vitor</h1>
    <button class="avatar" aria-label="Perfil"></button>
  </header>
  <div class="mode-toggle" role="tablist">
    <button role="tab" aria-selected="true" data-mode="compact">Compacto</button>
    <button role="tab" aria-selected="false" data-mode="discover">Descobrir</button>
  </div>
  <nav class="media-tabs" role="tablist">
    <button class="chip chip--active" data-media="music">Música</button>
    <button class="chip" data-media="podcasts">Podcasts</button>
    <button class="chip" data-media="audiobooks">Audiolivros</button>
  </nav>
  <section class="shortcuts"><h2 class="section-title">Recentes</h2><ul class="shortcuts__grid">…</ul></section>
  <section class="continue"><h2 class="section-title">Continue ouvindo</h2><ul class="card-grid">…</ul></section>
  <details class="editorial"><summary>Editorial</summary><ul class="card-grid">…</ul></details>
</main>
```

**CSS-key**
```css
.home { padding: 0 16px 120px; }
.home__header { display:flex; justify-content:space-between; align-items:center; height:56px; padding-top:44px; }
.greeting { font: var(--fw-black) 24px/1.08 var(--font-family); letter-spacing:-0.02em; }
.mode-toggle { display:grid; grid-template-columns:1fr 1fr; background:var(--background-elevated-base); border-radius:16px; padding:2px; height:32px; }
.mode-toggle [aria-selected=true] { background:var(--background-tinted-highlight); color:var(--spotify-green); border-radius:14px; transition:background 200ms var(--ease-standard); }
.shortcuts__grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
.shortcut-card { display:flex; align-items:center; height:56px; background:var(--background-tinted-highlight); border-radius:4px; }
.card-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
.media-card__cover { width:100%; aspect-ratio:1; border-radius:4px; }
.media-card__badge { position:absolute; top:8px; left:8px; background:rgba(0,0,0,.7); font:700 11px/1.27 var(--font-family); letter-spacing:.06em; text-transform:uppercase; padding:4px 6px; border-radius:2px; }
.editorial[open] .chevron { transform:rotate(180deg); transition:transform 250ms var(--ease-standard); }
```

**Estados/Interações**: default Compacto + Música + Editorial colapsado. Hover card `scale(.96)` 100ms. Loading skeleton shimmer. Empty "Comece a tocar para ver aqui".

**JavaScript**: tabs toggle Compacto/Descobrir (persistido em `localStorage('home.mode')`); chips filtram `.card-grid` por `data-type` com fade-through 200ms; `<details>` nativo; skeleton via IntersectionObserver.

**Microcopy**: "Boa noite, {nome}" (varia por hora), "Compacto"/"Descobrir", "Música/Podcasts/Audiolivros", "Recentes", "Continue ouvindo", "Editorial".

**Acessibilidade**: role tablist + aria-selected; `aria-labelledby` ligando h2 às sections; foco visível 2px verde; touch target 44pt mínimo via padding; `prefers-reduced-motion` desabilita scale.

**Critério de aceite**: "Abra o app e retome a última playlist." Sucesso ≥90% em ≤8s sem scroll além de 1 viewport. Likert: "Quão enxuta esta tela parece comparada à Home atual?"

**Arquivos**: `telas/t1-home-minimalista.html`, `css/telas/t1-home-minimalista.css`, `js/telas/t1-home-minimalista.js`.

---

### T2 — Player redesenhado (Now Playing)

**Objetivo**: validar H7 (ambiguidade shuffle/Smart Shuffle/repeat). Smart Shuffle separado em toggle dedicado; status row textual reforça estado de shuffle e repeat.

**Wireframe ASCII**
```
┌─────────────────────────────────────┐
│  ⌄        PLAYING FROM PLAYLIST   ⋯ │
│           Discover Weekly           │
│   ┌─────────────────────────────┐   │
│   │      [ALBUM ART 328x328]    │   │
│   └─────────────────────────────┘   │
│  Midnight City              ♥    +  │
│  M83                                │
│  ●━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│  1:42                         4:03  │
│  ⇄ Shuffle ativo    ↻ Repetir tudo │
│  ⇄    ⏮     ⏵ PAUSE ⏵     ⏭    ↻  │
│  ✨ Smart Shuffle           [○━━ ]  │
│  📱 iPhone de Vitor              ⤴  │
└─────────────────────────────────────┘
```

**Estrutura HTML**: header (collapse, contexto, more), `<section class="np-art">` com cover, track-text + heart + add, progress range, status-row (shuffle / repeat com texto colorido), controles (shuffle / prev / play 64pt / next / repeat), seção `np-smart-shuffle` com `role="switch"`, footer devices + share.

**CSS-key**
```css
.now-playing { background:linear-gradient(180deg,var(--header-color,#535353) 0%, #121212 60%); padding:0 16px 24px; }
.np-cover { width:100%; aspect-ratio:1; border-radius:4px; box-shadow:var(--shadow-cover); }
.np-title { font:900 22px/1.1 var(--font-family); letter-spacing:-.02em; }
.np-status-row { display:flex; justify-content:space-between; font:700 12px/1.33 var(--font-family); margin:12px 0; }
.np-status[data-active=true], .np-status[data-mode=all], .np-status[data-mode=one] { color:var(--essential-positive); }
.np-status[data-active=false], .np-status[data-mode=off] { color:var(--text-disabled); }
.np-play { width:64px; height:64px; border-radius:50%; background:var(--text-base); color:#000; }
.np-play:active { animation:play-pulse 180ms var(--ease-spotify-pulse); }
.np-shuffle[aria-pressed=true]::after { content:""; display:block; width:4px; height:4px; border-radius:50%; background:var(--essential-positive); margin-top:2px; }
.np-smart-shuffle { display:flex; justify-content:space-between; padding:12px 0; border-top:1px solid var(--border-subtle); border-bottom:1px solid var(--border-subtle); }
@keyframes play-pulse { 0%{transform:scale(1);} 40%{transform:scale(.92);} 100%{transform:scale(1);} }
```

**Estados**: heart on (verde, pulse 180ms); shuffle on (verde + ponto + texto "Shuffle ativo"); repeat ciclo off→all→one com texto sincronizado; Smart Shuffle toggle separado nunca entra no ciclo de shuffle; loading skeleton no título/artista.

**JS**: tap heart toggle aria-pressed + snackbar; shuffle toggle sincroniza status row + mini-player; repeat cicla data-mode; Smart Shuffle switch; seek range debounced 50ms; cor dominante via canvas atualiza `--header-color`.

**Microcopy**: "PLAYING FROM PLAYLIST", "Shuffle ativo/desligado", "Repetir tudo / Repetir esta música / Repetição desligada", "Smart Shuffle", snackbar "Adicionado a Músicas Curtidas — DESFAZER".

**Acessibilidade**: aria-pressed (heart/shuffle), aria-checked + role=switch (Smart Shuffle), aria-live polite na status-row; contraste verde/#121212 = 11.3:1 AAA; touch ≥44pt; foco verde 2px.

**Critério**: "Ative shuffle, depois Smart Shuffle, depois desligue só Smart Shuffle." ≥90% em <20s sem desativar shuffle por engano.

**Arquivos**: `telas/t2-player.html`, `css/telas/t2-player.css`, `js/telas/t2-player.js`.

---

### T3 — Biblioteca com seleção múltipla

**Objetivo**: validar H5 (ações em lote). Long-press entra em modo seleção; action-bar inferior com Baixar/Mover/Adicionar/Compartilhar; alpha-scroll lateral.

**Wireframe ASCII**
```
┌─────────────────────────────────────┐
│ ┌──┐  Sua Biblioteca         + ⌕   │
│ │VT│                                │
│ └──┘                                │
│ [Playlists][Artistas][Álbuns][Pod…] │
│ ⌕  Buscar na biblioteca         ⇅  │
│ Recentes ▾                    ☰ ▦   │
│ ┌──┐ Músicas Curtidas           │A │
│ │♥ │ Playlist • 342 músicas     │B │
│ └──┘                            │C │
│ ┌──┐ Lofi Beats                 │D │
│ │██│ Playlist • Você           •E•│
│ ┌──┐ Daft Punk                  │F │
│ │()│ Artista                    │…│
│  🏠   🔍   ☰   ＋                  │

═════ MODO SELEÇÃO ═════
│ ✕   3 selecionados      Selec.tudo │
│ ☑ Músicas Curtidas                  │
│ ☑ Lofi Beats                        │
│ ☐ Daft Punk                         │
│ ☑ Random Access Memories            │
│ ↓Baixar →Mover +Playlist ⇗ ⋯       │
```

**HTML**: `.app-header`, `.filter-chips`, `.search-bar`, `.sort-row`, `.library-list[data-view=list|grid]` com `.library-item[data-type][data-selected]`, `.alpha-scroll` à direita, `.selection-bar[hidden]` flutuante.

**CSS-key**
```css
.library-list[data-view=list] .library-item { display:grid; grid-template-columns:48px 1fr auto; gap:12px; height:64px; padding:0 16px; align-items:center; }
.library-list[data-view=grid] { display:grid; grid-template-columns:1fr 1fr; gap:16px; padding:16px; }
.library-item[data-type=artist] .cover { border-radius:50%; }
.alpha-scroll { position:fixed; right:2px; top:50%; transform:translateY(-50%); display:flex; flex-direction:column; gap:2px; font:700 10px/1 var(--font-family); color:var(--text-disabled); }
.alpha-letter[data-active] { color:var(--spotify-green); transform:scale(1.4); transition:200ms var(--ease-standard); }
.library-item[data-selected=true] { background:rgba(30,215,96,.12); }
.checkbox { width:20px; height:20px; border:2px solid var(--text-subdued); border-radius:50%; }
.library-item[data-selected=true] .checkbox { background:var(--spotify-green); border-color:var(--spotify-green); }
.selection-bar { position:fixed; left:8px; right:8px; bottom:91px; height:64px; background:#1A1A1A; border-radius:8px; display:flex; justify-content:space-around; transform:translateY(120%); transition:transform 350ms var(--ease-emphasized); }
.selection-bar[data-open] { transform:translateY(0); }
```

**Estados**: default; long-press 500ms → vibração + entra em seleção (header e action-bar slide 350ms); tap em modo seleção alterna; alpha-scroll drag highlight + scrollIntoView; loading 6 skeletons; vazio "Comece sua biblioteca".

**JS**: pointerdown timer 500ms ativa seleção + `navigator.vibrate(10)`; click toggle `data-selected` + recount; `.close-selection` reset; `.bulk-action[data-action]` executa + snackbar com DESFAZER; view-toggle persist localStorage; alpha-scroll pointermove calcula letra por Y; search input debounce 150ms; chip filter por data-type.

**Microcopy**: "Sua Biblioteca"; chips "Playlists/Artistas/Álbuns/Podcasts/Baixadas"; "Buscar na biblioteca"; sort "Recentes/Recém-adicionadas/Alfabética/Criador"; "{n} selecionado(s)", "Selecionar tudo", "Cancelar"; ações "Baixar/Mover para/Adicionar a playlist/Compartilhar/Mais"; toast "3 itens baixando — DESFAZER".

**Acessibilidade**: `aria-label` dinâmico em `<main>` durante seleção; `role=checkbox aria-checked`; long-press alternativo via `.more-btn` → "Selecionar"; alpha-scroll `aria-hidden=true` (duplica sort alfabético); contraste branco/#121212 = 17.4:1 AAA; touch ≥44pt.

**Critério**: "Você tem 5 playlists antigas que quer baixar de uma vez." <20s, ≥90% sucesso. SEQ 1-7.

**Arquivos**: `telas/t3-biblioteca-selecao.html`, `css/telas/t3-biblioteca-selecao.css`, `js/telas/t3-biblioteca-selecao.js`.

---

### T4 — Menu contextual da música (bottom sheet)

**Objetivo**: validar H5 (hierarquia). 4 grupos visuais (Reprodução / Coleção / Outros / Denunciar) separados por divider; cor verde nas ações de coleção; vermelho em destrutivo.

**Wireframe ASCII**
```
│            ▬▬▬▬▬▬▬                  │
│  ┌────┐                             │
│  │ 64 │  Blinding Lights         ⋯  │
│  │cvr │  The Weeknd · After Hours   │
│  └────┘                             │
│  ─────────────────────────────────  │
│  ▶  Tocar agora                     │
│  ⇥  Próxima na fila                 │
│  ☰  Adicionar à fila                │
│  ─────────────────────────────────  │
│  ＋ Adicionar à playlist  (verde)   │
│  ♥  Curtir                          │
│  ↓  Baixar                          │
│  ─────────────────────────────────  │
│  ↗  Compartilhar                    │
│  ◐  Ver artista                     │
│  ◑  Ver álbum                       │
│  ℹ  Créditos                        │
│  ⚑  Denunciar              (vermelho)│
```

**HTML**: `.backdrop` + `.sheet[role=dialog]` com handle, `.song-meta` (cover 64 + título 16/700 + sub 14/400), 4 `<ul class="menu-group" role=group aria-label>` separadas por `<hr class="divider">`.

**CSS-key**
```css
.backdrop { position:fixed; inset:0; background:rgba(0,0,0,.6); opacity:0; transition:opacity 250ms var(--ease-emphasized); }
.backdrop[data-state=open] { opacity:1; }
.sheet { position:fixed; left:0; right:0; bottom:0; background:var(--background-elevated-base); border-radius:16px 16px 0 0; padding:8px 16px calc(34px + 8px); transform:translateY(100%); transition:transform 350ms var(--ease-emphasized); max-height:90vh; overflow-y:auto; }
.sheet[data-state=open] { transform:translateY(0); }
.sheet__handle { width:36px; height:4px; border-radius:2px; background:#535353; margin:8px auto 16px; }
.song-meta { display:grid; grid-template-columns:64px 1fr 32px; gap:12px; align-items:center; padding:8px 0 16px; }
.divider { border:0; border-top:1px solid var(--decorative-subdued); margin:8px 0; }
.row { display:flex; align-items:center; gap:16px; width:100%; min-height:56px; padding:0 8px; background:none; border:0; color:var(--text-base); font:500 16px/1.5 var(--font-family); text-align:left; }
.row:active { background:#282828; transform:scale(.98); transition:transform 100ms, background 120ms; }
.ico--accent { color:var(--essential-positive); }
.row--danger { color:var(--essential-negative); }
```

**Estados**: default; press background #282828 + scale(.98); focus outline verde 2px; dragging acompanha dedo (backdrop opacity = 1 - drag/sheetHeight); loading mostra spinner 16px substituindo ícone; erro abre snackbar sem fechar sheet.

**JS**: `openSongMenu(track)` preenche header + data-state=open; fechamento por tap backdrop, ×, ESC, swipe-down >30% velocity; drag rAF; delegação por `data-action` (play-now/add-queue/like/...) → executa + `showToast(msg, undo)` + fecha; foco vai para primeiro `.row`, restaura no botão originador; trap de foco.

**Microcopy**: "{título}" / "{artista} · {álbum}"; "Tocar agora / Próxima na fila / Adicionar à fila / Adicionar à playlist / Curtir / Baixar / Compartilhar / Ver artista / Ver álbum / Créditos / Denunciar"; toasts "Adicionado à fila", "Salvo em Curtidas — DESFAZER", "Download iniciado".

**Acessibilidade**: role=dialog aria-modal=true aria-labelledby; role=group por seção; min-height 56px (área 48×48 mínima); contraste verde 9.4:1, vermelho 5.2:1 (AA); foco visível; prefers-reduced-motion = fade 150ms.

**Critério**: "Adicione esta música à fila, sem salvar em playlist." ≥90% acertam 1ª tentativa em <8s.

**Arquivos**: `telas/t4-menu-musica.html`, `css/telas/t4-menu-musica.css`, `js/telas/t4-menu-musica.js`.

---

### T5 — Configurações com busca

**Objetivo**: validar H8 (busca em settings). Search sticky no topo + filtragem incremental com highlight.

**Wireframe ASCII**
```
│ ‹  Configurações            ⋮       │
│ ┌─────────────────────────────────┐ │
│ │ 🔍  Buscar em Configurações  ✕ │ │
│ └─────────────────────────────────┘ │
│  CONTA                              │
│ ┌─────────────────────────────────┐ │
│ │ 👤  Perfil           Vitor M. › │ │
│ │ ⭐  Plano             Premium › │ │
│ │ 🔗  Contas vinculadas        › │ │
│ └─────────────────────────────────┘ │
│  REPRODUÇÃO                         │
│ ┌─────────────────────────────────┐ │
│ │ ▶  Autoplay              ON  › │ │
│ │ 🔀  Crossfade            5s  › │ │
│ │ 📊  Equalizador              › │ │
│ └─────────────────────────────────┘ │
│  QUALIDADE DE ÁUDIO  …              │
```

**HTML**: `.app-bar` (back + título), `.search-sticky` com `.search-field`, `.settings-list aria-live=polite` contendo `<section class="settings-group" data-group>` → `<h2 class="settings-group__label">` + `<ul class="settings-card">` com `<li class="settings-row" data-keywords>` (icon + title + value + chevron). `.empty-state` ao final.

**CSS-key**
```css
.search-sticky { position:sticky; top:0; z-index:10; background:var(--background-base); padding:8px 16px 12px; }
.search-field { display:flex; align-items:center; gap:12px; height:40px; padding:0 12px; border-radius:8px; background:var(--background-tinted-highlight); }
.settings-group__label { font:700 11px/1.27 var(--font-family); letter-spacing:.06em; text-transform:uppercase; color:var(--text-subdued); padding:24px 16px 8px; }
.settings-card { background:var(--background-elevated-base); border-radius:8px; margin:0 16px; overflow:hidden; }
.settings-row { display:grid; grid-template-columns:24px 1fr auto 16px; gap:16px; align-items:center; min-height:56px; padding:0 16px; border-bottom:1px solid var(--border-subtle); transition:background-color 120ms var(--ease-standard); }
.settings-row:last-child { border-bottom:0; }
.settings-row:active { background:var(--background-tinted-highlight); transform:scale(.99); }
.settings-row mark { background:transparent; color:var(--spotify-green); font-weight:700; }
.settings-row[hidden] { display:none; }
```

**Estados**: default card #1A1A1A; hover #282828 + scale .99; focus outline verde 2px; search filled mostra ✕; rows não-match `hidden`; grupos vazios também `hidden`; loading skeleton 1400ms; empty-state com termo destacado verde.

**JS**: input debounce 120ms; normaliza (lowercase, sem acentos) — compara contra `dataset.keywords + title + value`; envolve match em `<mark>` (cache original em `dataset.original`); oculta grupo se nenhuma row visível; empty-state se total visível = 0; botão clear; sticky shadow via IntersectionObserver.

**Microcopy**: "Configurações"; "Buscar em Configurações"; grupos "Conta · Reprodução · Qualidade de áudio · Notificações · Privacidade · Sobre"; valores "Premium / Ativado / 5s / Muito alta / Automática"; "Nenhum resultado para '{termo}'. Tente outra palavra."; aria "Limpar busca".

**Acessibilidade**: role=search; aria-live=polite na lista anuncia filtro; touch 56pt (>48 mínimo); contraste 16.1:1; verde mark 11.3:1; foco verde 2px; Tab por rows.

**Critério**: "Encontre e abra a configuração de qualidade de áudio em Wi-Fi." <15s em ≥80%. "Você procurou primeiro rolando ou pela busca? Por quê?"

**Arquivos**: `telas/t5-configuracoes.html`, `css/telas/t5-configuracoes.css`, `js/telas/t5-configuracoes.js`.

---

### MA — Modal A: Snackbar Desfazer

**Objetivo**: reversibilidade (H5). Snackbar com countdown visual de 6s + ação "Desfazer".

**Wireframe ASCII**: snackbar flutuante a `bottom: calc(safe + 56 + 56 + 16)` ≈ 162px, largura `left/right:16px`, height 48px+, background `--background-elevated-highlight`, com mensagem branca + botão verde, barra de progresso 2pt no rodapé.

**HTML**
```html
<div class="snackbar-region" aria-live="polite" aria-atomic="true">
  <div class="snackbar" role="status" data-variant="undo" data-state="open">
    <span class="snackbar__msg">Música removida</span>
    <button class="snackbar__action">Desfazer</button>
    <div class="snackbar__progress"><div class="snackbar__progress-fill"></div></div>
  </div>
</div>
```

**CSS-key**
```css
.snackbar-region { position:fixed; left:16px; right:16px; bottom:calc(56px + 34px + 56px + 16px); z-index:80; pointer-events:none; }
.snackbar { display:flex; align-items:center; gap:12px; min-height:48px; padding:8px 8px 8px 16px; background:var(--background-elevated-highlight); border-radius:8px; box-shadow:0 8px 24px rgba(0,0,0,.5); pointer-events:auto; transform:translateY(120%); opacity:0; transition:transform 250ms var(--ease-decelerate), opacity 200ms; position:relative; }
.snackbar[data-state=open] { transform:translateY(0); opacity:1; }
.snackbar[data-state=closing] { transform:translateY(120%); opacity:0; transition:transform 200ms var(--ease-accelerate), opacity 150ms; }
.snackbar__msg { flex:1; color:var(--text-base); font:500 14px/1.43 var(--font-family); }
.snackbar__action { height:32px; padding:0 16px; border:0; border-radius:500px; background:transparent; color:var(--spotify-green); font:700 14px/1 var(--font-family); letter-spacing:.04em; }
.snackbar__action:hover { background:rgba(30,215,96,.12); color:var(--spotify-green-hover); }
.snackbar__action:active { transform:scale(.96); }
.snackbar__progress { position:absolute; left:0; right:0; bottom:0; height:2px; overflow:hidden; }
.snackbar__progress-fill { height:100%; width:100%; background:var(--text-subdued); transform-origin:left center; animation:snackbar-countdown 6000ms linear forwards; }
@keyframes snackbar-countdown { to { transform:scaleX(0); } }
```

**Estados**: open (slide-up 250ms + countdown); hover botão (fundo verde 12% opacity); active scale(.96); focus outline 2px; closing slide-down 200ms; após Desfazer mostra spinner 16px até reinserir; dismiss por scroll>24px, tap fora, expirar, navegar.

**JS** (`snackbar.js`): `Snackbar.show({msg, action, undo, duration=6000})` — cria DOM, aplica `data-state=open`, agenda `setTimeout(close, duration)`; listeners de scroll (threshold 24px passive), pointerdown fora, click action (cancela timeout + undo() + close), ESC.

**Microcopy**: "Música removida" / "Playlist removida" / "Busca limpa"; ação "Desfazer"; confirmação após undo: "Música restaurada" (2s, sem botão); aria "Desfazer remoção".

**Acessibilidade**: role=status + aria-live=polite + aria-atomic (não interrompe); botão 48×48 (padding invisível); contraste branco/#2A2A2A = 15.3:1 AAA, verde 9.4:1 AAA; prefers-reduced-motion: sem slide + sem countdown animado; teclado: Tab alcança Desfazer, ESC fecha; sem roubo de foco.

**Critério**: "Você removeu uma música por engano. Recupere-a." ≥90% clicam Desfazer em ≤6s; tempo médio <3s; SUS ≥80.

**Arquivos**: `telas/ma-snackbar-desfazer.html`, `css/telas/ma-snackbar.css`, `js/snackbar.js`, `js/telas/ma-snackbar.js`.

---

### MB — Modal B: Card de recomendação melhorado

**Objetivo**: H3/H7 — transparência das recomendações. Cada card de recomendação ganha (a) botão "Por que recomendamos?" → abre bottom sheet com razões; (b) botão X para dispensar com confirmação Desfazer.

**Wireframe ASCII**
```
│  Feito para você              ⚙     │
│  ┌───────────────────────────────┐  │
│  │ ┌────┐  Discover Weekly       │  │
│  │ │██▣ │  Suas descobertas...   │  │
│  │ └────┘  ▶ Tocar               │  │
│  │  ⓘ Por que recomendamos?  ✕  │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │ ┌────┐  Daily Mix 1           │  │
│  │ │██▣ │  Tame Impala, MGMT...  │  │
│  │ └────┘  ▶ Tocar               │  │
│  │  ⓘ Por que recomendamos?  ✕  │  │
│  └───────────────────────────────┘  │

--- SHEET (snap 0.45) ---
│           ▬▬▬▬                      │
│  Por que recomendamos?              │
│  ▶ Porque você ouviu Tame Impala    │
│  ▶ Similar ao seu Daily Mix 1       │
│  ▶ 11 amigos ouviram recentemente   │
│  [ Entendi ]                        │
```

**HTML**: `<article class="reco-card" data-state="default">` com `.reco-card__main` (cover 88 + info + play pill verde) e `.reco-card__actions` (botão `.reco-card__why` + `.reco-card__dismiss`). `.reco-card__undo` oculto. Sheet reusa componente `.sheet` com 3 razões.

**CSS-key**
```css
.reco-card { background:var(--background-elevated-base); border-radius:8px; margin:0 16px 12px; overflow:hidden; transition:max-height 250ms var(--ease-accelerate), opacity 200ms; max-height:320px; }
.reco-card[data-state=dismissing] { max-height:0; opacity:0; margin-bottom:0; }
.reco-card__main { display:flex; gap:12px; padding:12px; }
.reco-card__cover { width:88px; height:88px; border-radius:4px; object-fit:cover; }
.reco-card__title { font:700 16px/1.5 var(--font-family); }
.reco-card__subtitle { font:400 14px/1.43 var(--font-family); color:var(--text-subdued); }
.reco-card__play { margin-top:8px; background:var(--spotify-green); color:#000; border-radius:500px; padding:8px 16px; font:700 14px/1 var(--font-family); }
.reco-card__play:active { transform:scale(.96); background:var(--spotify-green-press); }
.reco-card__actions { display:flex; justify-content:space-between; align-items:center; padding:8px 12px 12px; border-top:1px solid var(--decorative-subdued); }
.reco-card__why { color:var(--text-subdued); font:500 13px/1 var(--font-family); display:flex; gap:6px; min-height:44px; }
.reco-card__why:hover { color:var(--text-base); }
.reco-card__dismiss { width:44px; height:44px; color:var(--text-subdued); }
.sheet__cta { width:100%; background:var(--spotify-green); color:#000; border-radius:500px; padding:14px; font:700 14px/1 var(--font-family); margin-top:16px; }
```

**Estados**: default; hover/focus → ícones #FFF; active scale(.96); dismissing collapse 250ms `--ease-accelerate` → faixa "Removido. Desfazer" 4s → remove do DOM; undone fade-in 200ms; sheet-open backdrop fade 200 + slide-up 350; loading shimmer; vazio "Sem novas recomendações por hoje".

**JS** (`mb-card-recomendacao.js`): listener dismiss → data-state=dismissing → após 250ms hidden + mostra undo 4000ms → remove; listener undo cancela timer + restaura; why-button abre sheet (focus trap, scroll body locked); fecha por backdrop/ESC/swipe>30%/velocity>0.5; restore focus; telemetria `reco_dismissed | reco_undone | reco_why_opened`.

**Microcopy**: "Feito para você"; "Tocar"; "Por que recomendamos?"; aria-X "Não me interessa, remover recomendação"; "Removido." + "Desfazer"; sheet "Por que recomendamos?" + razões com nomes em **bold**; CTA "Entendi"; vazio "Sem novas recomendações por hoje. Volte amanhã."

**Acessibilidade**: contraste 17.4:1 e 8.3:1; alvos ≥44pt; role=dialog aria-modal + foco no título + ESC + restore; role=status aria-live=polite na faixa; aria-label descritivo no X; prefers-reduced-motion → fade 150ms; teclado: Tab cobre Tocar → Por que → X.

**Critério**: "Veja uma recomendação que não te interessa. Remova-a e descubra por que outra foi recomendada." ≥80% concluem ambas em <30s. SUS ≥75. 0 menções "dark pattern". Pergunta: "A explicação ajudou você a confiar mais (ou menos)?"

**Arquivos**: `telas/mb-card-recomendacao.html`, `css/telas/mb-card-recomendacao.css`, `js/bottom-sheet.js`, `js/telas/mb-card-recomendacao.js`.

---

## 6. Sequenciamento de implementação (sprints)

### Sprint 0 — Setup (3h)
- Criar `prototipo/`, `index.html` roteador (lista todas as 7 telas com link), `css/tokens.css`, `css/base.css`, `data/*.json` (tracks/playlists/settings mock), `assets/icons/` (baixar Lucide SVGs: play, pause, shuffle, repeat, repeat-1, heart, plus, more-horizontal, more-vertical, download, share, devices, chevron-left, chevron-down, search, x, library, home, sparkles, info, flag, list-music, sort-asc).
- **Pronto**: abrir `index.html` no Chrome mobile mode mostra menu de telas (todas vazias clicáveis); tokens carregam; fonte Inter via Google Fonts (fallback de Spotify Mix).
- **Estimativa**: 3h.

### Sprint 1 — Componentes compartilhados (6h)
- `css/components.css` + `js/snackbar.js` + `js/bottom-sheet.js` + `js/persist.js` + `js/animations.js`.
- Implementar: `.bottom-nav`, `.mini-player`, `.app-header`, `.chip`, `.track-row`, `.media-card`, `.eq-bars`, `.skeleton`, `.snackbar`, `.sheet` + `.backdrop`.
- Página `telas/_components-demo.html` (não-publicada) mostra cada componente em isolado.
- **Pronto**: snackbar e bottom-sheet funcionais (abrir, fechar, swipe-dismiss, focus-trap); todos componentes com hover/active.
- **Estimativa**: 6h.

### Sprint 2 — T1 Home (4h)
- HTML, CSS, JS de T1; mock data de recentes + continue ouvindo; toggle Compacto/Descobrir; chips; details/summary editorial.
- **Pronto**: navega para T1 a partir do index; toggle persistido; chip filtra cards; bottom-nav fixo.
- **Estimativa**: 4h.

### Sprint 3 — T2 Player + MA integrado (6h)
- T2 Player completo com controles, shuffle/repeat/Smart Shuffle, progress, color-extract para gradiente.
- Integrar `snackbar.js` em ações (heart, add).
- **Pronto**: tocar/pausar simulado, status row reflete estados, snackbar aparece com Desfazer.
- **Estimativa**: 6h.

### Sprint 4 — T3 Biblioteca + seleção múltipla (5h)
- Lista com chips, sort, view-toggle, alpha-scroll; long-press com vibração; action-bar slide-up.
- Snackbar para ações em lote.
- **Pronto**: long-press entra em seleção, ações disparam snackbar, undo restaura.
- **Estimativa**: 5h.

### Sprint 5 — T4 Menu contextual + MB (5h)
- T4 reusa `.sheet`; 4 grupos; ícones coloridos.
- MB Card de recomendação + sheet "Por que recomendamos?".
- **Pronto**: tap em ⋯ na song-row de T3 abre T4; X em MB colapsa card; sheet abre.
- **Estimativa**: 5h.

### Sprint 6 — T5 Configurações (3h)
- Settings mock no `data/settings.json`; busca incremental com highlight.
- **Pronto**: busca filtra em tempo real; empty-state aparece; grupos vazios somem.
- **Estimativa**: 3h.

### Sprint 7 — Polimento, animações, acessibilidade (4h)
- Testar `prefers-reduced-motion`; auditoria de contraste (Stark/axe DevTools); foco visível em tudo; touch targets ≥44pt; aria-labels; testar em iPhone real (Safari) e Android (Chrome).
- Corrigir bugs de scroll, z-index, animações janky.
- **Pronto**: lighthouse mobile ≥90 em a11y; sem erros de console; transições fluidas.
- **Estimativa**: 4h.

### Sprint 8 — Roteiro de entrevista + instrumentação (3h)
- Doc `docs/roteiro-entrevista.md` com tarefas, scripts, perguntas Likert/SUS.
- JS opcional: log de cliques em `localStorage` ou `console.table` para revisar após a sessão.
- **Pronto**: roteiro impresso + protótipo navegável em iPad/iPhone do entrevistador.
- **Estimativa**: 3h.

**Total estimado**: ~39h (1 semana de trabalho focado, 2 semanas em ritmo TCC).

---

## 7. Roteiro de teste com usuário

### Tarefas guiadas (uma por tela)
| # | Tela | Tarefa | Tempo-alvo | Sucesso |
|---|------|--------|------------|---------|
| 1 | T1 | "Abra o app e retome a última playlist que você ouviu." | ≤8s | tap na playlist sem scroll além de 1 viewport |
| 2 | T2 | "Ative o shuffle, depois ative Smart Shuffle, depois desligue só o Smart Shuffle." | ≤20s | shuffle ainda ligado ao final |
| 3 | T3 | "Você tem 5 playlists antigas que quer baixar de uma vez. Faça isso." | ≤20s | snackbar "5 itens baixando" aparece |
| 4 | T4 | "Adicione esta música à fila, sem salvá-la em playlist." | ≤8s | tap em "Adicionar à fila", não em "playlist" |
| 5 | T5 | "Encontre e abra a config de qualidade de áudio em Wi-Fi." | ≤15s | abre a row Wi-Fi |
| 6 | MA | "Você removeu uma música por engano. Recupere-a." | ≤6s | tap em Desfazer |
| 7 | MB | "Remova uma recomendação que não te interessa, e descubra por que outra foi sugerida." | ≤30s | dismiss + abrir sheet |

### Itens Likert (1–7) reaproveitados do questionário H3/H5/H7/H8
- **H3**: "A Home reformulada parecia menos sobrecarregada do que a do Spotify atual."
- **H5**: "Seria fácil desfazer uma ação destrutiva neste app."
- **H5**: "Era claro como executar ações em várias playlists de uma vez."
- **H7**: "Eu sabia, a cada momento, se shuffle/Smart Shuffle/repeat estavam ligados."
- **H8**: "Achei rápido encontrar a configuração que procurava."

### SUS (System Usability Scale)
Aplicar os 10 itens padrão após todas as 7 tarefas. Alvo ≥75.

### Comparação antes/depois
- Mostrar screenshot do Spotify real ao lado do protótipo na mesma tela (Home / Player / Configs).
- Perguntar: "Em qual versão você completaria a tarefa X mais rápido? Por quê?"
- Anotar verbatim para análise temática.

### Pós-teste qualitativo (5 min)
1. "Algo no protótipo te surpreendeu (positiva ou negativamente)?"
2. "O que você sentiu falta?"
3. "Trocaria de versão se pudesse?"

---

## 8. Riscos e mitigações

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Cores oficiais Encore mudam (Spotify atualiza) | Baixo | Todas cores em `tokens.css` — troca em 1 lugar |
| Spotify Circular/Mix proprietárias | Médio | Fallback Inter (Google Fonts) declarado no font-stack; visual ~95% próximo |
| Testar em desktop ≠ celular real | Alto | Sprint 7 obrigatório em iPhone + Android antes da entrevista |
| Animações janky em celular antigo | Médio | Usar `transform`/`opacity` apenas (GPU); `will-change` em sheets e snackbar |
| Long-press conflita com scroll vertical | Alto | Threshold 500ms + `touch-action: pan-y`; cancelar timer em `pointermove >10px` |
| Bottom-sheet drag conflita com scroll interno | Médio | Só permitir drag do handle; conteúdo abaixo tem `overflow-y:auto` próprio |
| Snackbar invisível em background claro de capa | Baixo | Background fixo `--background-elevated-highlight`, não translúcido |
| Acessibilidade (leitor de tela) ignorada pelos avaliadores do TCC | Médio | Auditar com VoiceOver (iOS) e TalkBack (Android) no Sprint 7 |
| Cor dominante extraída da capa degrada legibilidade | Médio | Limitar luminância máxima do gradiente (HSL: L≤40%) antes de aplicar |
| Usuário toca em link "real" e sai do protótipo | Baixo | Todos `<a>` com `href="#"` ou `preventDefault()` |
| Roteiro muito longo (fadiga) | Médio | Limitar a 30min total; permitir parar a qualquer momento |

---

## 9. Próximos passos imediatos (começar HOJE)

1. **Criar estrutura de pastas** conforme seção 2: `mkdir -p prototipo/{css/telas,js/telas,data,assets/{icons,images},telas}`.
2. **Escrever `css/tokens.css`** copiando o bloco da seção 3 deste plano.
3. **Escrever `css/base.css`** com reset minimalista (Eric Meyer ou modern-normalize), `html,body { background:var(--background-base); color:var(--text-base); font-family:var(--font-family); }`, scroll suave, focus-visible padrão.
4. **Criar `index.html`** como roteador: 7 links para as telas + meta viewport + frame 375×812 com bordas dashed para preview em desktop.
5. **Baixar 20 ícones Lucide** essenciais em SVG e salvar em `assets/icons/` (use https://lucide.dev/icons/).
6. **Mockar `data/tracks.json`** com ~30 músicas (campos: id, title, artist, album, cover, duration, liked, downloaded) — usar Unsplash random para covers.
7. **Implementar `js/snackbar.js`** primeiro (é o componente mais reusável e desbloqueia T2, T3, T4).
8. **Implementar `js/bottom-sheet.js`** segundo (desbloqueia T4 e MB).
9. **Construir T1 inteira** como prova de conceito (Sprint 2) — valida que tokens, base, componentes e roteador funcionam juntos.
10. **Commit incremental por sprint** com mensagens "feat(t1): home minimalista", "feat(t2): player redesenhado", etc.
11. **Agendar entrevista piloto** com 1 colega após Sprint 5 para detectar problemas de fluxo antes das entrevistas reais.
12. **Backup**: hospedar uma versão estática em GitHub Pages (`gh-pages` branch) para acessar no celular do entrevistado sem precisar de rede local.


## Council review — 2026-06-27

**Veredicto**: ADJUST

**Resumo dos papéis:**
- **Creator**: aprovar — escopo cirúrgico mapeado 1:1 com H3/H5/H7/H8, vanilla=zero build, microinterações sustentam validade.
- **Opposer**: viés fatal (protótipo interativo vs screenshot estático), Likert tendencioso, navigator.vibrate inexistente em iOS Safari, CORS no color-extract, TCLE não referenciado.
- **Out-of-box**: reframe como estímulo de pesquisa — Figma+Maze (n=30 remoto), Wizard-of-Oz, ou cortar a T2+T4 apenas.
- **Investigator**: todas as estatísticas confirmadas (A3 −21,1; n=86; H5 α=0,672 questionável; D2 net 18,6); estrutura prototipo/ existe mas vazia; H4 omitida por escopo.
- **Neutral**: Caminho C ganha em 2/3 eixos (custo 4/5, risco 4/5, payoff 5/5) — 3 telas profundas + 1 modal em código.

**Ação:** reescopar para Caminho C-modificado antes de codar:
1. T2 + T3 + T5 + MA em HTML/JS alta fidelidade (~22h); T1 e T4 como mockups Figma estáticos pareados em fidelidade com screenshots do Spotify atual.
2. Condição-controle: para cada tela testada, screenshot equivalente do Spotify real OU recriar versão "atual" em HTML mínimo.
3. T3 long-press: testar em Android Chrome; documentar limitação iOS; fallback sem navigator.vibrate.
4. Substituir Spotify Circular por Inter desde o design (elimina reflow); cores fixas ou paleta pré-extraída (elimina CORS).
5. Renomear H5/H7/H8 para "desejabilidade percebida" OU adicionar itens Likert reversos.
6. Submeter adendo ao TCLE cobrindo nova coleta + instrumentação localStorage antes do piloto.

**Riscos abertos aceitos:** H4 fora de escopo; H5 alpha 0,672 permanece questionável; n do reteste provavelmente <30.
