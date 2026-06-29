# Plano — Apresentação Final IHC Spotify (20 min)

> Documento-fonte para o workflow multi-agente que vai construir `prototipo/apresentacao/apresentacao_final.html`. Consolida os 4 inventários: slide-status atual, análise de dados (n=86), protótipo (15 telas + V2) e entrevistas (n=2, em andamento).

---

## 1. Objetivo e formato

### 1.1 Objetivo
Apresentar, em **20 minutos** (com ~3 min reservados para perguntas, **alvo real de fala 17 min**), o trabalho final da disciplina de IHC sobre o Spotify Mobile, contemplando as três áreas que ainda não estão cobertas no slide-status atual:

1. **Análise de dados quantitativa e qualitativa** do questionário (n=86, α=0,961, Apriori, Mann-Whitney Free×Premium).
2. **Protótipo redesenhado** (15 telas, Caminho C-modificado do council, sistema de shapes V2.1, Snackbar de Desfazer, etc.).
3. **Entrevistas qualitativas** com walkthrough do protótipo (n=2 confirmados + meta de mais 4–6).

### 1.2 Audiência
Orientador + colegas da disciplina + banca eventual. Esperar perguntas técnicas sobre:
- Por que α de H5 ficou abaixo de 0,7?
- Como vocês validaram o protótipo se n=2 nas entrevistas?
- Por que escolheram só 5 heurísticas?
- O que mudaram do Spotify atual e por quê?

### 1.3 Formato técnico
- **Stack**: HTML + CSS + JS vanilla. Zero frameworks. Mesma stack do protótipo.
- **Arquivo único de entrada**: `prototipo/apresentacao/index.html` (decisão monolítica × modular justificada na §3).
- **Tema visual**: dark Spotify — `#0a0a0a / #121212 / #181818` para fundos, `#1DB954 / #1ed760` verde, `#e22134` vermelho para dores, `#ff8c1a` laranja para alertas, Inter + Bricolage Grotesque + JetBrains Mono (mesma stack do slide-status para coerência visual).
- **Navegação**: teclado (`→/←/Space/PageUp/PageDown/Home/End/F` para fullscreen, `P` para modo apresentador, `O` para overview/grid de todos os slides), clique (metade direita = next, esquerda = prev), swipe touch (mobile/tablet), hash routing (`#/6` → slide 6) para deep-linking durante perguntas.
- **Indicadores**: barra de progresso no topo (verde), counter `01/20` no canto inferior direito, timer regressivo opcional (ativado com `T`) no canto inferior esquerdo.
- **Animações**: fade + slide-up (24px) com `cubic-bezier(.22,1,.36,1)`, cascata `.anim-1..7` (mesma do slide-status), contagem progressiva (easeOutCubic) em números-chave, reveal de gráficos (clip-path ou opacity stagger), pulse verde em CTAs e bullets ativos.
- **Demonstração ao vivo**: iframe embedado no slide do protótipo apontando para `../telas/t2.html` (relativo); fallback com GIFs caso projetor/wi-fi falhe.

---

## 2. Roteiro de slides — 20 slides em 17 min de fala

Distribuição com 17 min de fala + 3 min de perguntas = 20 min totais. Tempos abaixo somam 1020s = 17 min.

| # | Bloco | Slide | Tempo | Acumulado |
|---|---|---|---|---|
| 1 | Abertura | Capa | 0:30 | 0:30 |
| 2 | Contexto | Tema e relevância | 0:45 | 1:15 |
| 3 | Contexto | Problema e objetivo | 0:45 | 2:00 |
| 4 | Metodologia | Jornada do projeto (timeline) | 1:00 | 3:00 |
| 5 | Metodologia | As 5 heurísticas + instrumento | 1:00 | 4:00 |
| 6 | **Análise** | Amostra (n=86) | 1:00 | 5:00 |
| 7 | **Análise** | Confiabilidade (α=0,961) | 1:00 | 6:00 |
| 8 | **Análise** | Dores (net-score, A3 destaque) | 1:30 | 7:30 |
| 9 | **Análise** | Free×Premium + correlação H7↔H8 | 1:30 | 9:00 |
| 10 | **Protótipo** | Do dado ao design (Caminho C) | 1:00 | 10:00 |
| 11 | **Protótipo** | Sistema de shapes V2.1 | 1:00 | 11:00 |
| 12 | **Protótipo** | 5 inovações principais | 1:30 | 12:30 |
| 13 | **Protótipo** | Demo ao vivo (T2/T3/T5/MA) | 2:00 | 14:30 |
| 14 | **Protótipo** | Cobertura heurística + V2 backlog | 0:30 | 15:00 |
| 15 | **Entrevistas** | Método e participantes | 0:45 | 15:45 |
| 16 | **Entrevistas** | Citações marcantes | 1:15 | 17:00 |
| 17 | **Entrevistas** | Insights e limitações | 0:45 | 17:45 |
| 18 | Fechamento | Conclusões e trabalho futuro | 1:00 | 18:45 |
| 19 | Fechamento | Obrigado + perguntas | 0:15 | 19:00 |
| 20 | Backup | Referências + equipe + apêndice | – | – |

> Slide 19 abre as perguntas (3 min). Slide 20 é backup técnico (figuras densas: fig1 heatmap 24×24, fig8 item-total, regras Apriori completas) para responder a banca sem ficar improvisando.

---

## 3. Estrutura de arquivos

### 3.1 Decisão: **monolítico com slides em `<section>`**

Justificativa:
- O slide-status atual já é monolítico (1 HTML, 724 linhas) e funciona; manter o padrão reduz fricção cognitiva.
- Apresentação rodará offline em projetor — um único arquivo é à prova de path quebrado.
- 20 slides é gerenciável num único arquivo (~1500–2000 linhas) com cada slide bem delimitado por comentário `<!-- SLIDE 06 — Amostra -->`.
- Para o **workflow multi-agente**, cada agente edita seu **range de slides** dentro do mesmo arquivo via `Edit` com âncoras (`<!-- SLIDE XX START -->` / `<!-- SLIDE XX END -->`). Conflitos eliminados porque cada agente tem range exclusivo.
- CSS e JS ficam em arquivos separados para colaboração saudável (1 agente = 1 file CSS adicional se necessário).

### 3.2 Layout

```
prototipo/apresentacao/
├── index.html                       # monolítico, 20 <section class="slide">
├── css/
│   ├── tokens.css                   # @import do tokens.css do protótipo
│   ├── base.css                     # reset + tipografia + layout .slide
│   ├── components.css               # .stat-card, .quote, .compare, .heuristic-badge, .timeline
│   ├── animacoes.css                # @keyframes rise/pulse/float/dotPulse/countUp/barFill
│   └── slides-individuais.css       # tweaks pontuais (raros)
├── js/
│   ├── nav.js                       # roteador (teclado, click, swipe, hash, progresso)
│   ├── animacoes.js                 # IntersectionObserver para reveal, counter, barFill
│   ├── apresentador.js              # modo notas (tecla P) + timer (tecla T)
│   └── demo.js                      # controla iframe do protótipo no slide 13
├── assets/
│   ├── figuras/                     # cópia de /analise/figuras/*.png
│   │   ├── fig3_net_score.png
│   │   ├── fig6_free_vs_premium.png
│   │   ├── fig10_score_blocos.png
│   │   ├── fig4_pareto_qualitativo.png
│   │   ├── fig2_heatmap_blocos.png
│   │   ├── fig5_apriori_scatter.png
│   │   └── fig9_demografia.png
│   ├── screenshots/                 # capturas das telas do protótipo
│   │   ├── t1-redesign.png
│   │   ├── t1-atual.png
│   │   ├── t2-redesign.png
│   │   ├── t2-atual.png
│   │   ├── t3-redesign.png
│   │   ├── t3-atual.png
│   │   ├── t5-redesign.png
│   │   ├── t5-atual.png
│   │   ├── ma-snackbar.png
│   │   └── shapes-v21.png
│   ├── gifs/                        # fallback animado da demo
│   │   ├── t3-longpress-bulk.gif
│   │   ├── ma-undo-6s.gif
│   │   └── t5-search-highlight.gif
│   └── icons/                       # SVGs (logo, heurísticas, ícones de heurística)
└── notas-apresentador.md            # script paralelo, 1 seção por slide
```

### 3.3 Convenção de âncoras (crítico para multi-agente)

Dentro de `index.html`, cada slide é demarcado por:

```html
<!-- ============================================================ -->
<!-- SLIDE 06 START · OWNER: Agente B · Amostra (n=86)            -->
<!-- ============================================================ -->
<section class="slide" id="slide-06" data-time="60" data-owner="B">
  ...
</section>
<!-- SLIDE 06 END -->
```

Qualquer `Edit` do agente B deve usar `old_string` que inclua a âncora `SLIDE 06 START` para garantir unicidade no arquivo.

---

## 4. Design system

### 4.1 Tokens (reaproveitar do slide-status)

```css
:root{
  /* Backgrounds */
  --bg:#0a0a0a; --bg2:#121212; --bg3:#181818; --bg4:#242424;
  /* Spotify green */
  --green:#1DB954; --green-br:#1ed760;
  --green-d:rgba(29,185,84,.12); --green-gl:rgba(29,185,84,.40);
  /* Status */
  --red:#e22134; --orange:#ff8c1a; --yellow:#f5d76e; --blue:#509bf5;
  /* Text */
  --text:#fff; --text-dim:#a7a7a7; --text-mute:#6a6a6a;
  /* Lines */
  --border:rgba(255,255,255,.08); --border-strong:rgba(255,255,255,.16);
  /* Spacing */
  --pad-slide:60px 80px;
  /* Motion */
  --ease:cubic-bezier(.22,1,.36,1);
}
```

### 4.2 Componentes de slide (definir em `components.css`)

| Classe | Uso | Slides |
|---|---|---|
| `.slide` | container 100vw×100vh, flex column, padding `--pad-slide`, opacity/translateX transition | todos |
| `.slide__tag` | pill verde com bolinha pulsante e numeração `06/20` | todos exceto capa |
| `.slide__title` | display Bricolage, `<em>` italic verde para palavra-chave | todos |
| `.stat-card` | card com número grande (96–160px) + label, animar contagem 0→N | 6, 7, 8, 9, 16 |
| `.stat-grid` | grid responsivo de 2–4 stat-cards | 6, 9 |
| `.quote` | aspas grandes esverdeadas + texto + atribuição + heurística-badge | 8, 9, 16 |
| `.compare` | split antes/depois 50/50 com label "Spotify atual" × "Nosso redesign" | 12, 13 |
| `.heuristic-badge` | chip colorido (H3 azul, H4 amarelo, H5 vermelho, H7 verde, H8 roxo) | 5, 8, 12, 14, 16 |
| `.timeline` | linha vertical com dots animados, dot ativo com `dotPulse` | 4 |
| `.bar` | barra horizontal com `width: 0 → X%` animada na entrada | 7, 8, 9 |
| `.shape-demo` | grid das 6 shapes (V2.1) com label hover | 11 |
| `.device-frame` | moldura iPhone 375×812 com radius 40px, sombra | 11, 12, 13 |
| `.demo-iframe` | iframe ao vivo do protótipo dentro de `.device-frame` | 13 |
| `.gif-fallback` | wrapper `<picture>` com `<source>` GIF + `<img>` PNG estático | 13 |
| `.kpi-row` | linha horizontal com 3–4 KPIs separados por `|` em verde | 6, 9 |
| `.takeaway` | banner inferior verde escuro com mensagem de fechamento do slide | 8, 9, 12, 14, 17 |

### 4.3 Tipografia

- **Bricolage Grotesque** (display, 700/800, italic verde para palavra-chave do título)
- **Inter** (corpo, 400/500/600)
- **JetBrains Mono** (tags, números de slide, labels técnicos, citação ID `E51`)

---

## 5. Animações específicas (lista exaustiva)

### 5.1 Globais

| Animação | Trigger | Onde | Duração |
|---|---|---|---|
| `slideInRight` (translateX 60→0 + opacity) | troca de slide | `.slide.active` | 600ms ease |
| `slideOutLeft` (translateX 0→-60 + opacity) | troca de slide | `.slide.prev` | 600ms ease |
| `rise` (24px ↑ + fade) | entrada de bloco | `.anim-1..7` | 700ms, delay 80ms stagger |
| `pulse` (scale + glow) | sempre | `.tag::before`, `.counter::before`, CTA | 2s infinite |
| `float` (translate + rotate sutil) | sempre | `.cover-blob` da capa | 8–10s infinite |
| `dotPulse` (glow expansivo) | slide 4 ativo | `.tl-dot.active` | 1.6s infinite |

### 5.2 Específicas de slides

| Slide | Animação | Detalhe técnico |
|---|---|---|
| 1 (Capa) | Blobs gradient orbitando + título com gradient animado | 2 blobs `radial-gradient` 600px, animação `float` |
| 6 (Amostra) | Contador 0→86 + bar fill `n=90 → n=86 (filtros)` | `requestAnimationFrame` + easeOutCubic, 1.2s |
| 7 (α=0,961) | Big number 0→0,961 em 1,5s + 5 mini-bars (α por bloco) com `width` animado | bar fills com delay 100ms stagger |
| 8 (Net-score) | Barra A3 cresce em vermelho de 0→−21,1, depois pulsa | direção negativa para a esquerda, vermelho `--red` |
| 9 (Free×Premium) | 5 pares de barras Free vs Premium revelando da esquerda + asterisco `**` aparece após delay (significância) | reveal sequencial H3→H4→H5→H7→H8 |
| 10 (Caminho C) | Card "Caminho C-modificado" entra com pulse verde, conecta com setas SVG `stroke-dasharray` animado para 3 telas (T2/T3/T5+MA) | SVG path com `getTotalLength()` + `stroke-dashoffset` |
| 11 (Shapes) | 6 shapes desenham com `clip-path` reveal sequencial (música → álbum → playlist → artista → podcast → audiolivro) | 200ms cada, total 1,2s |
| 12 (Inovações) | Cards entram em cascata + ao hover, split antes/depois faz crossfade | 5 cards `.anim-1..5`, hover translateY -6px |
| 13 (Demo) | Iframe carrega com fade-in + bolinha "ao vivo" pulsando no canto | `iframe.onload` dispara `.is-loaded` |
| 14 (Cobertura) | Mapa H3/H4/H5/H7/H8 → telas com linhas SVG conectoras desenhando | mesma técnica do slide 10 |
| 15 (Entrevistas) | Avatares dos participantes (Bernardo, Fernanda) fade-in + chip "em andamento" pulsando laranja | aviso de n=2 honesto |
| 16 (Citações) | 3 citações entram em sequência (4s cada) com aspas crescendo de 0 → 120px | controle por click manual também |
| 17 (Insights) | 3 cards de insight com check verde + 1 banner inferior laranja de limitações | reveal cascade |
| 18 (Conclusões) | Lista de takeaways com check verde desenhando (SVG path) | `stroke-dasharray` |
| 19 (Obrigado) | Confete sutil verde + nomes dos 5 membros aparecendo | confete = 30 divs animados via JS, opt-out por `prefers-reduced-motion` |

### 5.3 Acessibilidade
- `@media (prefers-reduced-motion: reduce)` desabilita todas as animações de movimento (mantém apenas fade).
- Animações em `transform` e `opacity` only (GPU, 60fps garantido).
- Sem auto-play de transição entre slides (apresentador no controle).

---

## 6. Sequenciamento para workflow multi-agente

### Fase 1 — Fundação (1 agente sequencial, ~15 min)

**Agente F1 (Foundation)** cria o esqueleto e bloqueia o trabalho paralelo posterior.

Entregáveis:
1. `prototipo/apresentacao/index.html` com:
   - `<head>` completo (meta, fonts Google, links CSS, title)
   - 20 `<section class="slide" id="slide-XX" data-time="..." data-owner="...">` vazias com âncoras `<!-- SLIDE XX START · OWNER · título -->` e `<!-- SLIDE XX END -->`
   - Apenas o **slide 1 (capa) preenchido** como exemplo de estilo para os outros agentes copiarem
   - Barra de progresso, counter, help bottom-left, timer (oculto)
2. `css/tokens.css`, `css/base.css`, `css/components.css`, `css/animacoes.css` com **todos os tokens, layout e keyframes** prontos para uso (sem nada específico de slide).
3. `js/nav.js` completo (teclado + click + swipe + hash routing + progresso).
4. `js/animacoes.js` com utilitários: `countUp(el, from, to, dur)`, `barFill(el, pct, dur)`, `revealOnEnter(selector)`.
5. `js/apresentador.js` (tecla P abre/fecha painel lateral com notas do `<aside class="notes">` de cada slide; tecla T toggle timer).
6. Copia `/analise/figuras/fig{2,3,4,5,6,9,10}_*.png` para `assets/figuras/`.
7. Cria stubs vazios `notas-apresentador.md` com seções `## Slide 01` até `## Slide 20`.

**Bloqueia**: Fases 2 e 3 só começam depois desta.

### Fase 2 — Slides em paralelo (8 agentes simultâneos, ~30 min cada)

Cada agente tem **range exclusivo de slides** no `index.html` e edita via `Edit` com âncoras únicas. Não há sobreposição.

#### Agente A — Abertura e Metodologia (slides 1–5)
- Edita slides 2, 3, 4, 5 (slide 1 já feito na fundação, mas pode polir).
- Conteúdo: identificação rápida do tema, problema, objetivo geral + específicos, timeline das fases do projeto, 5 heurísticas + instrumento (Likert + ética + n alvo).
- Reusa muito do slide-status atual (slides 2–6 daquele deck).
- Sem novas figuras necessárias.
- Atualiza `notas-apresentador.md` seções 1–5.

#### Agente B — Análise de Dados (slides 6–9) **[CRÍTICO]**
- Edita slides 6, 7, 8, 9.
- Conteúdo:
  - **6**: stat-grid com `n=86`, filtros aplicados (90→86), demografia (66% 18–24, 74% diários, 80% Premium). Usa `fig9_demografia.png` como fundo desfocado ou ao lado.
  - **7**: big number `α = 0,961` + 5 mini-bars por bloco (H3=0,85 · H4=0,79 · H5=0,67⚠ · H7=0,74 · H8=0,81). Usa `fig10_score_blocos.png` como apoio.
  - **8**: Net-score top dores. Hero: barra A3 (−21,1) em vermelho. Mostra E4 (+1,2), E1 (+5,8). Citação E51 ou E83. Usa `fig3_net_score.png`.
  - **9**: Free×Premium (gap 0,54–0,77, H3 p=0,002**) + correlação H7↔H8 (r=0,802) + regra Apriori H4=Baixo→H7=Baixo (lift 5,95). Usa `fig6_free_vs_premium.png` + `fig2_heatmap_blocos.png` + `fig5_apriori_scatter.png` (split layout 2 colunas).
- Anima contadores e bars.
- Atualiza `notas-apresentador.md` seções 6–9.

#### Agente C — Protótipo Visão Geral (slides 10–12)
- Edita slides 10, 11, 12.
- Conteúdo:
  - **10**: "Do dado ao design — Caminho C-modificado". Card central + setas SVG para T2/T3/T5+MA. Menciona council, escopo cirúrgico, condição-controle pareada.
  - **11**: Sistema de shapes V2.1. Grid das 6 formas (música, álbum, playlist, artista, podcast, audiolivro) com `.shape-demo` CSS puro. Mensagem: leitura instantânea de tipo.
  - **12**: 5 inovações principais em cards (.h-card grid 2×3, último ocupa 2 cols ou usar 3×2):
    1. Shapes diferenciados
    2. Status textual Shuffle/Smart Shuffle/Repeat (T2)
    3. Long-press + bulk + Desfazer (T3 + MA)
    4. Busca incremental em Configurações (T5)
    5. Snackbar Desfazer universal (MA)
  - Cada card tem heurística-badge.
- Usa `assets/screenshots/shapes-v21.png` (gerado por Agente G).
- Atualiza `notas-apresentador.md` seções 10–12.

#### Agente D — Protótipo Demo + Cobertura (slides 13–14)
- Edita slides 13, 14.
- Conteúdo:
  - **13**: Demo ao vivo. Layout: device-frame central 375×812 com iframe `src="../telas/t2.html"`. Painel lateral com botões "T2 Player", "T3 Bulk+Undo", "T5 Busca", "MA Snackbar" que trocam o `src` do iframe via JS. Bolinha "ao vivo" pulsando. Texto explicativo curto à esquerda do device. **Plano B**: se iframe falhar, slide tem `.gif-fallback` com GIFs (precisam ser gerados pelo Agente G).
  - **14**: Mapa heurísticas → telas (H3→T1/T7, H4→V2.1+V2.8, H5→T3/T4/MA, H7→T2/T6/T7/T8/T9, H8→T1/T5/V2.7) + mini-banner sobre V2 backlog (Descoberta, Personalizar Feed, Notificações, Social, Onboarding).
- Coordena com Agente G para garantir disponibilidade das telas linkadas.
- Atualiza `notas-apresentador.md` seções 13–14.

#### Agente E — Entrevistas (slides 15–17)
- Edita slides 15, 16, 17.
- Conteúdo:
  - **15**: Método e participantes. Cards Bernardo (22, Floripa, assíncrono) e Fernanda (presencial, walkthrough com Paulo). Chip "em andamento — meta 6–8" em laranja. Lista das 4 tarefas previstas (T2/T3/T5/MA). Honestidade: protocolo A/B cronometrado **não** aplicado integralmente.
  - **16**: 5 citações marcantes (`.quote`) com atribuição e heurística-badge:
    1. Fernanda — Home atual: "bagunçado"
    2. Fernanda — Personalizar Feed: "genial, menos bagunçado"
    3. Fernanda — Descoberta: "Vocês fizeram um TikTok"
    4. Fernanda — Notificações: "Eu quero muito isso, mano"
    5. Bernardo — Descoberta + Biblioteca categorizada
  - **17**: 3 insights principais (clutter validado / biblioteca categorizada celebrada / Player dividiu opiniões) + banner inferior laranja com limitações honestas (n=2, sem SUS, viés de condução, viés de aquiescência).
- Atualiza `notas-apresentador.md` seções 15–17.

#### Agente F — Fechamento + Backup (slides 18–20)
- Edita slides 18, 19, 20.
- Conteúdo:
  - **18**: Conclusões (clutter é a dor real, modelo Free é camada de usabilidade invisível, shapes + busca + undo viraram recomendações concretas) + trabalho futuro (validar com n≥6 e A/B cronometrado, H4 e onboarding pós-update, testar Personalizar Feed com método think-aloud, replicar para usuários Free segmentados).
  - **19**: Obrigado + 5 membros + perguntas. Confete sutil.
  - **20** (backup, fora do tempo): figuras densas (`fig1_heatmap_itens.png`, `fig8_item_total.png`), regras Apriori completas em tabela, links para repo/protótipo público, referências (Nielsen 1994, Cronbach 1951, Mann-Whitney 1947, Agrawal & Srikant 1994 Apriori).
- Atualiza `notas-apresentador.md` seções 18–20.

#### Agente G — Screenshots e GIFs do protótipo
- **Não edita `index.html`**. Gera apenas assets.
- Usa Chrome MCP (`mcp__claude-in-chrome__navigate` + `mcp__claude-in-chrome__computer` para screenshot) em modo dispositivo 375×812 contra `http://localhost:8000/prototipo/`.
- Entregáveis em `assets/screenshots/`:
  - `t1-redesign.png`, `t1-atual.png`
  - `t2-redesign.png`, `t2-atual.png`
  - `t3-redesign.png`, `t3-atual.png`
  - `t5-redesign.png`, `t5-atual.png`
  - `ma-snackbar.png`
  - `shapes-v21.png` (composição lado a lado das 6 shapes)
- Entregáveis em `assets/gifs/` (fallback demo):
  - `t3-longpress-bulk.gif` (5s)
  - `ma-undo-6s.gif` (6s)
  - `t5-search-highlight.gif` (4s)
- Pode usar `mcp__claude_ai_Magnific__gif_creator` ou ffmpeg local.

#### Agente H — Polimento, timing e QA cross-slide
- Roda **depois** dos agentes A–G (semi-paralelo: começa quando A–F terminam, mesmo que G ainda esteja gerando GIFs).
- Tarefas:
  - Lê `index.html` inteiro e verifica consistência visual (tags numeradas, italic verde em todos os títulos, classes corretas).
  - Confere se cada slide tem `data-time` e se a soma ≤ 1020s (17 min).
  - Marca slides "cortáveis" (slide 14 cobertura, slide 11 shapes se estourar tempo) com `data-optional="true"`.
  - Adiciona transições suaves entre blocos (badge "BLOCO 1/4 · Contexto" etc.).
  - Valida acessibilidade (alt em todas as imagens, contraste, aria-labels nos botões de navegação).
  - Roda lighthouse local básico.

### Fase 3 — Integração e validação ao vivo (1 agente)

**Agente F3 (Final)**:
1. Sobe `python3 -m http.server 8000` em `prototipo/`.
2. Abre `http://localhost:8000/apresentacao/` no Chrome MCP.
3. Faz screenshot de cada slide (1–20).
4. Verifica console: zero erros, zero 404.
5. Mede tempo real navegando slide a slide (cronometrar com `data-time` declarado vs feeling humano).
6. Gera resumo final + lista de TODOs remanescentes.
7. Atualiza `notas-apresentador.md` com cabeçalho geral (tempo total, ordem dos slides cortáveis se atrasar).

---

## 7. Especificação detalhada — cada slide

Convenções: **ID** (`slide-XX`), **título** com `<em>` na palavra-chave, **tempo** em segundos, **animação principal**, **fonte de dados** (qual inventário), **owner** (qual agente).

### Slide 01 — Capa
- **ID**: `slide-01`
- **Título**: "Quando o algoritmo escuta — *redesenhando* o Spotify"
- **Subtítulo**: "Análise heurística, 86 respostas e um protótipo navegável"
- **Tempo**: 30s
- **Animação**: Blobs gradient orbitando + título com gradient animado (verde→branco)
- **Dados**: identificação da disciplina (slide-status slide 2)
- **Owner**: F1 (template) → A (polimento)

### Slide 02 — Tema e relevância
- **Título**: "O *Spotify Mobile* — 678 milhões de usuários, 5 heurísticas"
- **Conteúdo**: 3 stat-cards (678M usuários, 35% do mercado streaming musical, 5 heurísticas escolhidas) + parágrafo sobre escolha
- **Tempo**: 45s
- **Animação**: count-up nos 3 stats
- **Dados**: slide-status atual (slide 3) + síntese
- **Owner**: A

### Slide 03 — Problema e objetivo
- **Título**: "Avaliar usabilidade *e* propor melhoria"
- **Conteúdo**: Objetivo geral + 3 específicos numerados (.specific cards)
- **Tempo**: 45s
- **Animação**: cascata `.anim-1..3`
- **Dados**: slide-status atual (slide 4)
- **Owner**: A

### Slide 04 — Jornada do projeto
- **Título**: "Cinco *fases*, um ano letivo"
- **Conteúdo**: timeline vertical: (1) Pesquisa documental, (2) Avaliação heurística pelo grupo, (3) Instrumento + coleta n=86, (4) Análise quanti+quali + protótipo, (5) Entrevistas walkthrough
- **Tempo**: 60s
- **Animação**: `dotPulse` na fase atual (4 ou 5), linha vertical desenhando
- **Dados**: slide-status atual (slide 6) + inventários
- **Owner**: A

### Slide 05 — Heurísticas + instrumento
- **Título**: "Cinco *heurísticas* de Nielsen, 24 itens Likert"
- **Conteúdo**: grid 5 heurísticas (H3 controle, H4 consistência, H5 prevenção, H7 flexibilidade, H8 estética) com mini-descrição + bloco lateral com: Likert 1–5, 24 itens, itens reversos, TCLE, n alvo 80–100 → n=86
- **Tempo**: 60s
- **Animação**: cards cascata, depois bloco lateral
- **Dados**: slide-status atual (slides 7 e 8)
- **Owner**: A

### Slide 06 — Amostra
- **Título**: "*86* respostas válidas"
- **Conteúdo**: hero number 86 + kpi-row (66% 18–24 anos · 74% uso diário · 80% Premium) + nota "90 brutos − 4 filtros (TCLE, nunca-usou, brancos)"
- **Tempo**: 60s
- **Animação**: countUp 0→86 (1,2s), depois kpi-row fade
- **Dados**: análise §1
- **Owner**: B

### Slide 07 — Confiabilidade
- **Título**: "α de Cronbach = *0,961*"
- **Conteúdo**: big number + 5 mini-bars: H3=0,85, H4=0,79, H5=0,67⚠, H7=0,74, H8=0,81 + nota "excelente global, H5 questionável"
- **Tempo**: 60s
- **Animação**: countUp 0→0,961 + barFill staggered
- **Dados**: análise §1
- **Owner**: B

### Slide 08 — Dores (net-score)
- **Título**: "Uma *única* dor negativa: desfazer em playlist"
- **Conteúdo**: hero bar A3 (−21,1) vermelha + mini ranking top 5 piores + citação E83 ("Apenas algumas operações que não podem ser desfeitas...") + heurística-badge H5
- **Tempo**: 90s
- **Animação**: barra A3 cresce de 0→−21,1 (1s) + pulse vermelho + cita entra
- **Dados**: análise §1 e §2; `fig3_net_score.png`
- **Owner**: B

### Slide 09 — Free×Premium + correlações
- **Título**: "Ser *Free* piora TODO o app"
- **Conteúdo**: 5 pares de barras (Free×Premium) + texto "gap 0,54–0,77, H3 p=0,002**" + chip lateral "r(H7,H8)=0,802" + chip "Apriori: H4↓→H7↓ lift 5,95"
- **Tempo**: 90s
- **Animação**: pares revelando H3→H4→H5→H7→H8, asteriscos `**` aparecem após
- **Dados**: análise §3 e §5C; `fig6`, `fig2`, `fig5`
- **Owner**: B

### Slide 10 — Do dado ao design
- **Título**: "Caminho *C-modificado*: 3 telas profundas + 1 microação"
- **Conteúdo**: card central "Caminho C" + setas SVG para 4 cards (T2 Player, T3 Bulk, T5 Busca, MA Snackbar). Lista lateral: escopo cirúrgico, condição-controle pareada, sem vibrate iOS, cores fixas em tokens
- **Tempo**: 60s
- **Animação**: setas SVG desenhando (`stroke-dasharray`), depois cards aparecem
- **Dados**: protótipo §7
- **Owner**: C

### Slide 11 — Sistema de shapes V2.1
- **Título**: "Seis *formas*, seis tipos de conteúdo"
- **Conteúdo**: grid das 6 shapes em CSS puro (.shape-demo) — música quadrado, álbum com aba, playlist stacked, artista círculo, podcast com fita, audiolivro 3:4 — cada uma com label
- **Tempo**: 60s
- **Animação**: clip-path reveal sequencial 200ms cada
- **Dados**: protótipo §3
- **Owner**: C

### Slide 12 — 5 inovações
- **Título**: "*Cinco* mudanças que carregam o redesign"
- **Conteúdo**: grid 5 cards (shapes / Smart Shuffle textual / long-press+undo / busca config / snackbar universal). Cada card: ícone + nome + heurística-badge + 1 linha antes/depois
- **Tempo**: 90s
- **Animação**: cascata + hover compare crossfade
- **Dados**: protótipo §2
- **Owner**: C

### Slide 13 — Demo ao vivo
- **Título**: "*Ao vivo*: T2, T3, T5, MA"
- **Conteúdo**: device-frame com iframe + painel de 4 botões + bolinha "live" pulsando. Fallback: GIFs se iframe falhar.
- **Tempo**: 120s
- **Animação**: iframe load + bolinha pulse + ao trocar tela, fade
- **Dados**: protótipo §5 e §6
- **Owner**: D (coordena com G para assets)
- **Notas**: roteiro de fala (3 min): T2 Smart Shuffle → T3 long-press → MA Desfazer → T5 buscar "wifi". Plano B (GIFs) na nota do apresentador.

### Slide 14 — Cobertura heurística + V2 backlog
- **Título**: "Cobrimos *as 5*, com 4 telas no backlog"
- **Conteúdo**: lado esquerdo: mapa H3→T1/T7, H4→shapes+onboarding, H5→T3/T4/MA, H7→T2/T6/T7/T8/T9, H8→T1/T5. Lado direito: chips do backlog V2 (Descoberta, Personalizar Feed, Notificações, Social, Onboarding pós-update)
- **Tempo**: 30s
- **Animação**: linhas SVG desenhando
- **Dados**: protótipo §4
- **Owner**: D

### Slide 15 — Entrevistas: método
- **Título**: "Walkthrough com *2 (de 6–8)* participantes"
- **Conteúdo**: 2 cards (Bernardo / Fernanda) + chip laranja "coleta em andamento" + lista das 4 tarefas previstas + nota honesta "A/B cronometrado não aplicado integralmente"
- **Tempo**: 45s
- **Animação**: cards entram + chip pulsa
- **Dados**: entrevistas §1, §2
- **Owner**: E

### Slide 16 — Citações
- **Título**: "O que *eles* disseram"
- **Conteúdo**: 5 .quote (Fernanda x4 + Bernardo x1) com atribuição e heurística-badge. Layout: 2 cols ou 1 hero + 4 menores.
- **Tempo**: 75s
- **Animação**: citações fade-in 1 a 1, aspas crescem
- **Dados**: entrevistas §4
- **Owner**: E

### Slide 17 — Insights + limitações
- **Título**: "Três *aprendizados*, várias ressalvas"
- **Conteúdo**: 3 cards verdes (clutter validado / biblioteca categorizada / Player dividiu opiniões) + banner inferior laranja (n=2, sem SUS, viés de condução, viés de aquiescência)
- **Tempo**: 45s
- **Animação**: cards cascata, banner sobe por último
- **Dados**: entrevistas §5, §6, §7
- **Owner**: E

### Slide 18 — Conclusões + futuro
- **Título**: "O que *fica* e o que *vem*"
- **Conteúdo**: 2 colunas — "Fica": clutter é a dor real / Free é camada de UX invisível / shapes+busca+undo viraram recomendações; "Vem": n≥6 cronometrado, H4 e onboarding, think-aloud no Personalizar Feed, segmentar Free
- **Tempo**: 60s
- **Animação**: check verde desenhando em cada item
- **Dados**: síntese
- **Owner**: F

### Slide 19 — Obrigado
- **Título**: "*Obrigado* — perguntas?"
- **Conteúdo**: 5 membros + repo URL + protótipo URL + email contato
- **Tempo**: 15s
- **Animação**: confete sutil verde (opt-out via prefers-reduced-motion)
- **Dados**: identificação
- **Owner**: F

### Slide 20 — Backup
- **Título**: "*Apêndice* técnico"
- **Conteúdo**: thumbnails de `fig1_heatmap_itens.png` e `fig8_item_total.png` clicáveis (abrem em modal), tabela com top 10 regras Apriori, referências (Nielsen 1994, Cronbach 1951, Mann-Whitney 1947, Agrawal & Srikant 1994), links do repo
- **Tempo**: — (fora do tempo cronometrado)
- **Animação**: nenhuma (modo consulta)
- **Dados**: análise §4 e §5
- **Owner**: F

---

## 8. Critérios de aceite

- [ ] Roda em `http://localhost:8000/prototipo/apresentacao/` (servidor estático Python).
- [ ] Roda também abrindo `index.html` direto (file://), exceto pelo iframe do slide 13 que precisa de servidor — fallback GIF cobre.
- [ ] Funciona em Chrome desktop (projetor), Safari iPad (apresentador remoto via tablet) e Chrome Android (touch swipe).
- [ ] Tempo total de fala em ensaio entre 17 e 19 min (cap rígido 20).
- [ ] Zero erros no console DevTools.
- [ ] Zero requests 404.
- [ ] Cumpre WCAG AA: contraste mínimo 4,5:1 em todo texto sobre fundo, aria-label em botões de navegação, `prefers-reduced-motion` respeitado, `<img alt>` em todas as figuras.
- [ ] Cobre as 3 áreas que faltavam: análise (slides 6–9), protótipo (10–14), entrevistas (15–17).
- [ ] Notas do apresentador (`notas-apresentador.md`) preenchidas para todos os 20 slides.
- [ ] Plano B documentado para falha de wi-fi/iframe (GIFs em `assets/gifs/`).
- [ ] Deep-linking funciona (`#/8` salta para slide 8 — útil em perguntas).

---

## 9. Riscos e mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| 20 min é apertado, atraso de 2–3 min | Alta | Médio | Marcar slides 11 e 14 como `data-optional="true"`; apresentador pula com tecla `S`. |
| Demo ao vivo do iframe trava (wi-fi/projetor) | Média | Alto | GIFs prontos em `assets/gifs/` ativados via tecla `G`. Plano C: celular com HDMI. |
| Animações cansam a banca | Média | Médio | Limitar a 1 animação principal por slide; cap de 4 elementos em cascata; `prefers-reduced-motion` honesto. |
| Conflitos de merge entre agentes em `index.html` | Baixa (com âncoras) | Alto | Âncoras `<!-- SLIDE XX START/END · OWNER: X -->` obrigatórias; cada agente edita só seu range; Fase 1 fixa estrutura antes da Fase 2. |
| Pergunta da banca sobre H5 α=0,67 | Alta | Baixo | Slide 20 backup já tem `fig8_item_total.png`; nota do apresentador slide 7 cobre. |
| Pergunta sobre n=2 em entrevistas | Alta | Médio | Slide 15 já admite (chip "em andamento"); slide 17 lista limitações; nota apresentador prepara resposta. |
| Imagens muito pesadas → carregamento lento | Baixa | Baixo | PNGs já cabem (maior é 355K); usar `loading="lazy"` em figuras de slides distantes. |
| Apresentador esquece controles | Baixa | Baixo | Tecla `?` mostra overlay com todos os atalhos. |

---

## 10. Próximo passo imediato

> **Aprove este plano** para disparar o workflow de implementação (1 agente de fundação + 8 agentes paralelos para slides/assets + 1 agente de QA/integração final). Estimativa: 1 hora wall-clock total, com a Fase 2 paralela dominando o tempo (~30 min).
