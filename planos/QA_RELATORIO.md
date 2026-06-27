# Relatório QA — Protótipo Spotify Mobile

## 1. Resumo executivo

### Total de findings por severidade

| Severidade | Quantidade |
|------------|------------|
| Crítica    | 0          |
| Alta       | 27         |
| Média      | 51         |
| Baixa      | 60         |
| **Total**  | **138**    |

### Findings por tela

| Tela              | Alta | Média | Baixa | Total |
|-------------------|------|-------|-------|-------|
| t1                | 3    | 4     | 6     | 13    |
| t2 (redesign)     | 1    | 6     | 9     | 16    |
| t3 (redesign)     | 5    | 6     | 7     | 18    |
| t4                | 1    | 4     | 8     | 13    |
| t5                | 0    | 2     | 6     | 8     |
| ma (redesign)     | 3    | 5     | 5     | 13    |
| t1-atual          | 6    | 7     | 9     | 22    |
| t2-atual          | 2    | 4     | 6     | 12    |
| t3-atual          | 4    | 6     | 11    | 21    |
| t4-atual          | 2    | 4     | 5     | 11    |
| t5-atual          | 1    | 3     | 4     | 8     |

### Telas com mais problemas
1. **t1-atual** (22) — controle reproduz problemas do Spotify atual (toque, contraste, semântica).
2. **t3-atual** (21) — XSS via innerHTML, focus management ausente, alvos de toque pequenos.
3. **t3 (redesign)** (18) — vários alvos de toque <44pt, conteúdo interativo sob aria-hidden.
4. **t2 (redesign)** (16) — fontes muito pequenas, contraste de status, duplicação aria-live.

### Status geral
**APTO PARA PILOTO COM CORREÇÕES PONTUAIS.** Nenhum bloqueio crítico (severidade=crítica = 0). Existem 27 findings de severidade alta concentrados em: (i) alvos de toque <44pt; (ii) XSS via innerHTML em t3-atual; (iii) focus trap ausente em dialogs modais; (iv) contraste insuficiente em estados ativos/danger. Recomenda-se corrigir os bloqueadores listados na Seção 5 antes do piloto com usuários.

---

## 2. Findings críticos (severidade alta)

### Toque (alvos <44pt)
- **[t1] css/telas/t1.css:131** — `t1-mode-toggle` 40px (botões 32px), abaixo de 44pt → aumentar container para 48px e botões para 44px, ou adicionar `::after` expandindo hit area.
- **[t1] css/telas/t1.css:74** — `t1-chip` height 32px; pseudo `::after` não cobre lateralmente → `min-width: 44px` no chip ou expandir inset lateral.
- **[t3] css/telas/t3.css:35** — `.t3-avatar` 36x36px → `min-width/min-height: 44px`.
- **[t3] css/telas/t3.css:172** — `.t3-view-toggle__btn` 40x32px → 44x44px ou padding externo.
- **[t3] css/telas/t3.css:136** — `.t3-chips .chip` min-height 32px → 44px ou padding vertical.
- **[t3] css/telas/t3.css:391** — letras do alfabeto lateral 18x12px → 20-24px de altura, 24px de largura.
- **[t1-atual] css/telas/t1-atual.css:77** — `.t1a-chip` 32px → 44px ou `::after`.
- **[t1-atual] css/telas/t1-atual.css:47** — `.t1a-avatar` 32x32px; `::after` 44x44 pode estar sobreposto por chips adjacentes → garantir `pointer-events:auto`.
- **[t1-atual] css/telas/t1-atual.css:283** — `.t1a-feed-card__close` 32x32 → 44x44 ou hit area via `::after`.
- **[t1-atual] css/telas/t1-atual.css:348** — `.t1a-feed-card__icon-btn` 40x40 → 44x44.
- **[t2-atual] css/telas/t2-atual.css:198** — `.npa__seek::-webkit-slider-thumb` 12x12 e `opacity 0` → aumentar área para 24-32px e manter visível em `@media (hover: none)`.
- **[t3-atual] css/telas/t3-atual.css:205** — `.t3a-item__more` 32x32 → 44x44 (principal alvo para abrir sheet).
- **[t3-atual] css/telas/t3-atual.css:133** — `.t3a-view-btn` 40x40 → 44x44.
- **[t4-atual] telas/controle/t4-atual.html:40** — `.t4-mini-row__more` 32x32 dentro de span aria-hidden → transformar em `<button aria-label>` com 44x44.
- **[ma] telas/ma.html:16** — `.topbar__back` não define explicitamente 44x44; depende de components.css → garantir min 44x44.

### Contraste
- **[t2] css/telas/t2.css:397** — `.np__repeat-label` font-size 9px com `--text-subdued` → subir para 11px (`--fs-micro`).
- **[t4] css/telas/t4.css:335** — `.t4-row--danger:hover` rgba(233,20,41,0.08) quase imperceptível → aumentar alfa para 0.16-0.20 ou usar background sólido tinted.
- **[t1-atual] css/telas/t1-atual.css:132** — `.t1a-promo__sub` rgba(255,255,255,0.7) em 12px sobre gradient roxo, contraste <4.5:1 → rgba(255,255,255,0.92) ou cor sólida verificada.
- **[t2-atual] css/telas/t2-atual.css:294** — indicador 4px de estado shuffle/repeat muito pequeno → aumentar para 6-8px ou adicionar label textual.

### Mobile (fonte/legibilidade)
- **[t1-atual] css/telas/t1-atual.css:267** — `.t1a-feed-card__badge` 10px → 11-12px ou aria-label.
- **[t1-atual] css/telas/t1-atual.css:306** — `.t1a-feed-card__eyebrow` 11px → 12-13px.

### ARIA
- **[t2] telas/t2.html:70** — duas regiões `aria-live="polite"` próximas geram anúncios duplicados a cada mudança → remover aria-live do `.np__context`.
- **[ma] telas/ma.html:19** — duplicação semântica h1+h2 com mesmo título "Músicas Curtidas" → manter apenas um h1 (preferencialmente hero).

### JS (segurança/robustez)
- **[ma] js/telas/ma.js:238** — snackbar usa `msg.innerHTML = opts.msg` (XSS frágil) → trocar para createElement + textContent.
- **[t3-atual] js/telas/t3-atual.js:77** — innerHTML interpola `item.nome`/`item.criador` sem escape (XSS) → textContent ou escape HTML.
- **[t3-atual] js/telas/t3-atual.js:83** — `aria-label` interpola sem escape de aspas → escapar ou usar createElement+setAttribute.

---

## 3. Findings médios/baixos (agrupados por categoria)

### Toque (médios/baixos)

| Tela | Arquivo:linha | Item | Correção |
|------|---------------|------|----------|
| t1 | telas/t1.html:55 | `<li>` recent-card sem role/tabindex | Usar `<a>`/`<button>` ou role=button + tabindex |
| t1 | telas/t1.html:91 | mix-card sem semântica interativa | Idem |
| t2 | css/telas/t2.css:195 | `.np__seek` altura 16px | Wrapper com padding ou input 44px |
| t2 | css/telas/t2.css:498 | switch thumb 26px isolado | OK no botão pai; adicionar `touch-action: manipulation` |
| t3 | css/telas/t3.css:274 | `.t3-item__more` 32x32 | 44x44 com padding |
| t1-atual | css/telas/t1-atual.css:439 | bottom-nav item sem min-width 44px | Padding interno garantindo hit ≥44 |
| t3-atual | css/telas/t3-atual.css:41 | `.t3a-avatar` 36x36 | 44x44 ou wrap clicável |
| t3-atual | css/telas/t3-atual.css:107 | chips min-height 32px | 44px |
| t4 | css/telas/t4.css:153 | `.t4-mini-row__more` 32x32 aria-hidden | OK decorativo; se virar interativo ampliar |
| t5 | css/telas/t5.css:109 | `.t5-search-field__clear` 32x32 | 44x44 (padding mantendo ícone 16px) |
| t4-atual | css/telas/t4-atual.css:328 | viewport ≤360px line-height comprime min-height | `min-height: 48px` na media |

### Contraste (médios/baixos)

| Tela | Arquivo:linha | Item | Correção |
|------|---------------|------|----------|
| t1 | css/telas/t1.css:138 | btn ativo verde sobre tinted-highlight | Trocar para fundo verde + texto preto |
| t2 | css/telas/t2.css:318 | `.np__status` inativo `--text-disabled` #6A6A6A 3.8:1 | `--text-subdued` ou fonte 14px bold |
| t3 | css/telas/t3.css:383 | `.t3-alpha` `--text-disabled` 10px 3.8:1 | `--text-subdued` |
| t4 | css/telas/t4.css:203 | handle decorativo cinza unsafe | Manter (decorativo) ou rgba(255,255,255,0.28) |
| t4 | css/telas/t4.css:253 | `.t4-divider` #292929 sobre #1A1A1A 1.1:1 | `--border-subtle` (rgba 255,255,255,0.10) |
| t5 | css/telas/t5.css:293 | `.t5-foot__build` `--text-disabled` 11px | `--text-subdued` ou fonte 12px |
| ma | css/telas/ma.css:56 | fs-meta 12px `--text-subdued` no limite | Subir para 13px em info importante |
| t2-atual | css/telas/t2-atual.css:439 | `.npa__control-badge` 10px + opacity 0.7 = 2.6:1 | `--text-subdued`, remover opacity |
| t2-atual | css/telas/t2-atual.css:241 | `.npa__times` 11px sobre gradient | OK na maior parte; monitorar |
| t3-atual | css/telas/t3-atual.css:400 | `.t3a-controle-tag` 10px | 11-12px |
| t4-atual | css/telas/t4-atual.css:177 | handle #535353 sobre #1A1A1A 2.3:1 | `--text-subdued` ou rgba(255,255,255,0.30) |
| t4-atual | css/telas/t4-atual.css:132 | `__more` icon sobre topo do gradient | Mínimo #B3B3B3 + envolver em button |
| t5-atual | css/telas/t5-atual.css:167 | foot/notice `--text-disabled` 11px | `--text-subdued`, remover opacity |
| t5-atual | css/telas/t5-atual.css:156 | foot cascateia `--text-disabled` | Cor explícita ≥4.5:1 |

### ARIA (médios/baixos)

| Tela | Arquivo:linha | Item | Correção |
|------|---------------|------|----------|
| t1 | telas/t1.html:38,21 | `role=tablist` sem tabpanels | Usar `role=group` + `aria-pressed` |
| t2 | telas/t2.html:32 | `<img>` cover alt vazio inicial | alt="Capa do álbum" fallback |
| t2 | telas/t2.html:89 | aria-pressed em botão play (antipattern) | Remover, manter aria-label dinâmico |
| t2 | telas/t2.html:138 | role=status dentro de aria-live | Manter um só |
| t3 | telas/t3.html:147 | snackbar role=status + container aria-live | Remover um |
| t3 | telas/t3.html:109 | `.t3-alpha` aria-hidden com conteúdo interativo | Remover aria-hidden, usar nav/label |
| t4 | telas/t4.html:77 | `<main>` de fundo sem inert quando dialog aberto | `inert` ou `aria-hidden=true` |
| t4 | telas/t4.html:77 | sem focus trap nem retorno de foco | Implementar trap + restore |
| t4 | telas/t4.html:40 | data-current só por cor | `aria-current="true"` + texto oculto |
| t5 | js/telas/t5.js:264 | dialog detalhe sem focus trap nem inert | Implementar |
| ma | telas/ma.html:75 | `.ma-stats aria-live=polite` verborrágico | Remover aria-live |
| t1-atual | telas/controle/t1-atual.html:48,109,229,230 | `<li tabindex=0>` sem role; alt="" em capas informativas | `role=button` + handlers; alt descritivo |
| t3-atual | telas/controle/t3-atual.html:130,85,83 | dialog/sheet sem focus mgmt nem inert | Mover foco, trap, restore, inert background |
| t4-atual | telas/controle/t4-atual.html:40,15,34 | `<span>` more aria-hidden, main sem inert, sem aria-current | Botão real; inert no main; aria-current |
| t5-atual | telas/controle/t5-atual.html:37 (×2) | dialog sem focus trap nem inert | Implementar |

### Semântica

| Tela | Arquivo:linha | Item | Correção |
|------|---------------|------|----------|
| t1 | telas/t1.html:135,14 | footer dentro de main; role=application | Remover role=app, mover footer |
| t2 | telas/t2.html:17 | header/footer dentro de main | Documentar ou usar role=toolbar |
| t3 | telas/t3.html:36 | h1/h2 alternando visibilidade | Usar h1 sempre |
| t4 | telas/t4.html:26 | h1 fundo + h2 dialog concorrentes | inert no fundo, h1 no dialog |
| t5 | js/telas/t5.js:164 | h2 "Detalhe" coexiste com h2 dos grupos | inert no main quando dialog aberto |
| t2-atual | telas/controle/t2-atual.html:38 | h1 em player aninhado | Considerar h2 ou aceitar |
| t5-atual | telas/controle/t5-atual.html:151 | múltiplos h2 + h2 no dialog | aria-labelledby OK; avaliar h1 no dialog |
| ma | js/telas/ma.js:81 | role=listitem redundante | Remover do `<li>`; manter role=list no `<ol>` |
| ma | telas/ma.html:39 | `h3` "Buscar na playlist" é mais label | Usar `<label>` ou `<p class=section-label>` |
| t3-atual | telas/controle/t3-atual.html:154 | bottom-nav com href="#" | `aria-disabled=true` em itens não implementados |
| t5-atual | telas/controle/t5-atual.html:29 | footer dentro de main | Mover para contentinfo |

### Mobile (hover/touch/viewport)

| Tela | Arquivo:linha | Item | Correção |
|------|---------------|------|----------|
| t1 | css/telas/t1.css:360,100 | bottom-nav 10px; hover sem media query | 11-12px; `@media (hover: hover)` |
| t2 | css/telas/t2.css:195,219 | seek sem touch-action; thumb invisível em touch | `touch-action: none`; thumb visível em pointer:coarse |
| t3 | css/telas/t3.css:494 | action-bar 10px (9px em 360) | 11-12px, reflow em 2 linhas |
| t4 | css/telas/t4.css:289 | hover sem `@media (hover: hover)` | Envolver |
| t5 | telas/t5.html:5 | viewport `maximum-scale=1` bloqueia zoom | Remover maximum-scale |
| ma | css/telas/ma.css:431,101 | media só ≤360, sticky-hover | Quebra/abreviação 361-390; `@media (hover: hover)` |
| t1-atual | css/telas/t1-atual.css:448,58 | bottom-nav 10px; cursor:pointer em mobile | 11-12px; remover/condicionar |
| t2-atual | css/telas/t2-atual.css:450 | 20px hardcoded em media query | Token tipográfico |
| t3-atual | css/telas/t3-atual.css:168,216 | hover sticky em itens/sheet/dialog | `@media (hover: hover)` |
| t5-atual | css/telas/t5-atual.css:46 | hover sem media query | Envolver |

### Tokens (cores hardcoded)

| Tela | Arquivo:linha | Item | Correção |
|------|---------------|------|----------|
| t1 | css/telas/t1.css:46,98 | #5f4bb6, #1ed760, #000 | `var(--spotify-green)`, novo `--text-on-bright-accent` |
| t2 | css/telas/t2.css:9,411 | #2a2a2a, rgba, #000 em play | tokens existentes; criar `--on-surface-inverse` |
| t3 | css/telas/t3.css:73,320 | rgbas verde/vermelho/preto, #000 | tokens `--tint-green-12`, `--overlay-dark-40` |
| t4 | css/telas/t4.css:89 | #6b8cff, #2b3a55, #c44, #420, rgba | tokens `--gradient-cover-blue/red` |
| t2-atual | css/telas/t2-atual.css:15,436 | #2a2a2a, #000, rgba; 10px micro | tokens existentes |
| t3-atual | css/telas/t3-atual.css:253,222,360 | #535353, rgba(0,0,0,0.6/0.55), #000 | `--backdrop-color`, `--on-accent` |
| t4-atual | css/telas/t4-atual.css:29 | mocks #2b3a55, #6b8cff, #c44, #420 | `--mock-playlist-cover-*` |
| t1-atual | css/telas/t1-atual.css:52,107,92 | gradientes hardcoded, #000 | `--gradient-avatar`, `--gradient-promo-premium`, `--text-on-accent` |
| ma | css/telas/ma.css:106 | rgbas hover/tint/track | `--bg-hover-subtle`, `--danger-tint`, `--green-tint`, `--progress-track` |

### JS (cleanup/segurança/perf)

| Tela | Arquivo:linha | Item | Correção |
|------|---------------|------|----------|
| t2 | js/telas/t2.js:389,228 | keydown global sem cleanup; setInterval em background | AbortController; pausar em visibilitychange |
| t3 | js/telas/t3.js:66,425 | innerHTML com item.capa não sanitizada; sem guard init | Validar URL; flag init |
| t4 | telas/t4.html:214 | atalho "r/R" pode conflitar com AT | Shift+R + dica visual |
| t5 | js/telas/t5.js:109 | regex diacríticos quebrada por encoding | `/[̀-ͯ]/g` literal Unicode |
| ma | js/telas/ma.js:406 | keydown global sem cleanup | Escopo único de init |
| t2-atual | js/telas/t2-atual.js:318,286 | Space duplo toggle; history.back heurística | Guard `e.target.matches('button')`; `history.length>1` |
| t3-atual | js/telas/t3-atual.js:178 | item.capa em template literal | createElement + .src |
| t4-atual | telas/controle/t4-atual.html:216,190,90 | keydown global; Telemetria sem try/catch; sem foco restore | AbortController; try/catch; salvar activeElement |
| t5-atual | telas/controle/t5-atual.html:197 | listeners sem cleanup | AbortController |

---

## 4. Padrões recorrentes (corrigir em tokens/components)

### 4.1. Alvos de toque <44pt (15+ ocorrências)
Quase todas as telas têm pelo menos um alvo de toque (avatar, chip, more, view-btn, close, clear) entre 32-40px.
**Ação no design system:** criar utility class `.hit-44 { min-width:44px; min-height:44px }` e/ou mixin `::after` padronizado em `components.css`. Auditar todos os ícone-botões e padronizar para 44x44.

### 4.2. Hover sem `@media (hover: hover)` (8+ telas)
Sticky-hover é universal no protótipo.
**Ação:** envolver TODAS as regras `:hover` em `@media (hover: hover) and (pointer: fine)` via convenção de arquitetura CSS (ou um mixin global). Adicionar lint rule no PR template.

### 4.3. Dialog/sheet sem focus trap + inert no background (6 telas)
t3, t4, t5, t3-atual, t4-atual, t5-atual — todos têm dialog modal sem trap, sem retorno de foco, sem `inert` no conteúdo de trás.
**Ação:** criar utilitário JS `openModal(el, trigger)` reutilizável que:
1. Salva `document.activeElement`
2. Move foco para primeiro interativo do dialog
3. Aplica `inert` ao container `.frame > main`
4. Implementa trap (Tab loop)
5. Restaura foco no close

### 4.4. Duplicação aria-live + role=status (4+ telas)
Padrão recorrente: container com `aria-live=polite` + filho com `role=status` (que já implica aria-live).
**Ação:** padronizar — sempre o container tem `aria-live`, filhos só têm conteúdo. Atualizar componente snackbar.

### 4.5. Texto <12px com `--text-disabled` ou `--text-subdued` (8+ ocorrências)
Badges, foot, eyebrow, labels micro de 9-11px com cinzas baixos.
**Ação:** definir piso de 11px no design system (`--fs-micro: 11px`); proibir `--text-disabled` para texto visível informativo; reservar para itens realmente desabilitados.

### 4.6. Hex/rgba hardcoded fora de tokens (todas as telas)
Gradientes mock de cover, #000 em botões com fundo claro, rgba para hover/overlay/tint.
**Ação:** criar tokens em `tokens.css`:
- `--text-on-accent: #000`
- `--backdrop-color: rgba(0,0,0,0.6)`
- `--overlay-dark-40/55/70`
- `--tint-green-12`, `--tint-danger-10`
- `--gradient-cover-blue/red/avatar/promo-premium`
- `--bg-hover-subtle: rgba(255,255,255,0.06)`

### 4.7. `<li tabindex=0>` sem role=button (t1, t1-atual)
Cards de recent/mix/quick/feed.
**Ação:** componente Card padronizado como `<button>` ou `<a>` semântico.

### 4.8. `role=tablist` sem tabpanels (t1, t1-atual)
Chips de filtro marcados como tabs sem painéis.
**Ação:** trocar por `role=group` + `aria-pressed` nos chips.

### 4.9. innerHTML com dados sem escape (ma, t3, t3-atual)
Risco de XSS mesmo em mock — má prática para quando virar dados reais.
**Ação:** utilitário `escapeHTML` obrigatório ou migrar para createElement+textContent. Adicionar à code review checklist.

### 4.10. Keydown/listeners globais sem cleanup (5+ telas)
**Ação:** padrão `AbortController` em init() de cada tela, com cleanup em `pagehide`.

---

## 5. Recomendação

### 5.1. Bloqueadores (corrigir ANTES do piloto)
1. **XSS via innerHTML em t3-atual** (`js/telas/t3-atual.js:77,83,178`) — risco real, mesmo em protótipo. **2h**
2. **XSS frágil em ma snackbar** (`js/telas/ma.js:238`) — substituir por createElement+textContent. **1h**
3. **Alvos de toque <44pt em controles principais** (chips, more, view-btn, avatar, clear) nas 11 telas — utility class + ajustes. **4h**
4. **Focus trap + inert em dialogs modais** (t3, t4, t5, t3-atual, t4-atual, t5-atual) — utilitário `openModal` reutilizável. **4h**
5. **Contraste reprovado WCAG AA**: `.t4-divider` (1.1:1), `.npa__control-badge` (2.6:1), `.t4-row--danger:hover` (~3:1), `.t1a-promo__sub` sobre gradient, foot/notice de t5-atual. **2h**
6. **Viewport bloqueia zoom em t5** (`maximum-scale=1`) — WCAG 1.4.4. **5min**
7. **Fontes 9-10px informativas** (`np__repeat-label`, `t1a-feed-card__badge/eyebrow`, action-bar t3, bottom-nav) — subir para 11-12px. **1h**
8. **Duplicação semântica h1 "Músicas Curtidas"** em ma — pode confundir leitor de tela durante o piloto. **15min**

**Subtotal bloqueadores: ~14h**

### 5.2. Backlog pós-piloto
- Padronização completa de tokens (hex hardcoded → variáveis): **3h**
- `@media (hover: hover)` em todas as regras :hover: **2h**
- Cleanup de listeners globais com AbortController: **2h**
- Reestruturação de `role=tablist` para `role=group` + aria-pressed: **1h**
- Cards `<li tabindex=0>` → `<button>`/`<a>` semântico: **2h**
- Pausar setInterval em visibilitychange (t2): **30min**
- Remover `role=application` e `role=contentinfo` aninhado: **30min**
- aria-current em faixa em reprodução (t4, t4-atual): **30min**
- Telemetria envolvida em try/catch: **30min**
- Ajustes finos de contraste (foot t5, alpha t3, status t2): **1h**
- Remoção de aria-live verborrágico (ma-stats, np__context): **30min**
- Indicador shuffle/repeat 4px → 6-8px ou label (t2-atual): **1h**
- Touch-action no seek (t2): **15min**
- Thumb visível em touch (t2, t2-atual): **30min**

**Subtotal backlog: ~15h**

### 5.3. Total estimado
- **Pré-piloto (bloqueadores):** ~14 horas
- **Backlog (pós-piloto):** ~15 horas
- **Total:** ~29 horas de correções

### 5.4. Pontos fortes do protótipo
- Uso consistente de tokens semânticos na maioria dos arquivos.
- Suporte a `prefers-reduced-motion`, `safe-area`, `focus-visible` em todas as telas.
- Hierarquia de headings e landmarks (header/main/nav/footer) corretas em ~80% dos casos.
- Sem uso de `navigator.vibrate` (boa prática mobile).
- `try/catch` em localStorage, debounce em busca, `escapeHTML` aplicado nos lugares principais (exceto exceções listadas).
- Estados de foco visíveis com outline verde consistente.
- Nenhum finding crítico (severidade = crítica = 0).

**Conclusão:** o protótipo está em boa forma para piloto após corrigir os 8 bloqueadores acima (~14h de trabalho). O resto pode ser endereçado em sprint pós-piloto com base no feedback dos usuários.
