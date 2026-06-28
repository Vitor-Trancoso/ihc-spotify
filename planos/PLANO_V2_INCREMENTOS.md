# Plano V2 — Incrementos baseados em análise do time

Análise das observações do colega de equipe (semestre 2026-06-28) cruzada com o que o protótipo já implementa. Define o que falta construir antes da próxima rodada de entrevistas.

## 1. Mapeamento: observação do time → estado atual

### Foco 1 — Quantidade imensa de informações por tela
**Solução proposta:** abas dedicadas no menu inferior (Home, Busca, Notificações, Social, Configurações), com botões bem expostos.

| Item proposto | Estado | Onde |
|---|---|---|
| Bottom nav com itens claros | ✅ FEITO | Início / Buscar / Biblioteca / Perfil (4 itens) |
| Aba "Notificações" dedicada | ❌ FALTA | — |
| Aba "Social" dedicada | ❌ FALTA | — |
| Configurações acessível | ✅ FEITO | T5 acessível via Perfil |
| Tela inicial mais limpa | ✅ PARCIAL | T1 tem modo Compacto + Editorial colapsada, mas mockup estático |

### Foco 2 — Inconsistência + metamensagens fracas + utilidades secundárias escondidas
**Solução proposta:** distinção visual por tipo de conteúdo.

| Forma sugerida | Tipo | Estado |
|---|---|---|
| Quadrado | Música | ⚠️ Mesmo formato hoje para tudo |
| Quadrado com aba de "pasta" | Álbum | ❌ FALTA |
| Quadrado com efeito de "eco/empilhamento" | Playlist | ❌ FALTA |
| Circular | Artista | ⚠️ Implementado parcialmente (avatares circulares existem) |
| Fita lateral colorida | Podcast | ❌ FALTA |
| Retangular | Audiolivro | ❌ FALTA |

### Foco 3 — Ícones pouco consistentes entre plataformas
**Solução proposta:** botões mais evidentes para controles, sinalização clara de modo (shuffle vs smart shuffle), + aba "Descoberta" substituindo scroll infinito.

| Item proposto | Estado | Onde |
|---|---|---|
| Shuffle/Smart Shuffle diferenciados | ✅ FEITO | T2 — "Aleatório ativado" verde + texto, Smart Shuffle como toggle separado |
| Repeat com label visível | ✅ FEITO | T2 — "Repetir: Tudo" |
| Botões de controle 44pt+ | ✅ FEITO | T2 — pseudo `::after` de toque aplicado nas 11 telas |
| Ícones consistentes (heart vs +) | ✅ FEITO | T2/T4 — ♥ primário ao lado do título |
| Aba "Descoberta" no bottom nav | ❌ FALTA | hoje é toggle Compacto/Descobrir dentro de T1 |
| Substituir scroll infinito | ⚠️ PARCIAL | T1 mockup é denso, mas Editorial ainda é seção fixa |

### Modularidade — usuário escolhe o que vê na Home/Biblioteca
**Solução proposta:** módulos plugáveis (omite/explicita seções).

| Item | Estado |
|---|---|
| Modo Compacto/Descobrir (binário) | ✅ FEITO em T1 |
| Modo Lista/Grade na Biblioteca | ✅ FEITO em T3 |
| Customizar QUAIS seções aparecem | ❌ FALTA — usuário não escolhe módulos |
| Reordenar seções (drag) | ❌ FALTA |

---

## 2. O que JÁ está pronto (não retrabalhar)

Resumo do que o protótipo atual cobre dos pedidos do colega, com evidência:

- ✅ **Bottom nav padronizado** em todas as telas com nav: Início/Buscar/Biblioteca/Perfil (T1, T3, MA, controles)
- ✅ **Distinção shuffle vs smart shuffle** (T2 Player com labels textuais + toggle separado)
- ✅ **Controles de música 44pt+** (council/QA forçou hit-area pseudo-pattern)
- ✅ **Tela inicial mais limpa** (T1 mockup com modo Compacto, grid 2×2 denso)
- ✅ **Snackbar Desfazer** ao curtir/descurtir, apagar música, apagar playlist (T2/MA)
- ✅ **Picker de playlist** ao adicionar música (T2)
- ✅ **Sheet Criar** (Playlist/Pasta/Jam) em T3
- ✅ **Histórico** em vez de "Restaurar tudo" (MA)
- ✅ **Ordenar** com 6 critérios em vez de "Apagar playlist" perigoso (MA)
- ✅ **Busca incremental** em Configurações (T5)
- ✅ **Long-press com seleção múltipla** (T3)
- ✅ **Acessibilidade**: focus trap em modais, aria-labels, hit-area 44pt, contraste WCAG AA, sem `navigator.vibrate`

---

## 3. O que FALTA (escopo da V2)

Em ordem de impacto vs custo:

### V2.1 — Diferenciação visual por tipo de conteúdo ⭐ ALTO IMPACTO

**Por quê:** ataca o ponto #2 do colega (metamensagens fracas) e a queixa do território10 ("cards de música/podcast/audiolivro indistinguíveis"). Resolve H4 (consistência) e H8 (estética/minimalismo).

**Sistema de shapes:**

| Tipo | Shape | Detalhe visual |
|---|---|---|
| Música | Quadrado liso 4px radius | Cor capa, sem ornamento |
| Álbum | Quadrado com **aba superior** (estilo pasta) 4px radius + tab 8x4px no topo | Sugere "contém faixas" |
| Playlist | Quadrado com **2-3 shadows empilhadas** atrás (eco/stack) | Sugere "compilação curada" |
| Artista | **Círculo** perfeito | Já é padrão da indústria |
| Podcast | Quadrado com **fita vertical colorida** lateral (4px à esquerda) | Cor da fita = categoria (notícia=vermelho, tech=azul, etc) |
| Audiolivro | **Retângulo vertical 3:4** (proporção livro) com gradient de sombra à direita | Sugere "livro fechado" |

**Onde implementar:** componente `.media-card` em `components.css` com variants `--music`, `--album`, `--playlist`, `--artist`, `--podcast`, `--audiobook`. Aplica em T1, T3 e nas listas.

**Estimativa:** 4h (CSS-only, sem JS).

### V2.2 — Aba "Descoberta" dedicada no bottom nav ⭐ ALTO IMPACTO

**Por quê:** ataca pontos #1 e #3. Substitui o scroll infinito da home. Resolve H8 (estética).

**Mudança:**
- Bottom nav passa de 4 → 5 itens: **Início | Descoberta | Buscar | Biblioteca | Perfil**
- T1 (Home) fica enxuto: só Recentes + atalhos pessoais
- Nova tela **T6 — Descoberta**: feed editorial agrupado por contexto (Para você / Novidades da semana / Por gênero / Recém-adicionados / Editorial Spotify)
- Cada bloco com "Ver mais" → drill-down

**Atenção:** 5 itens em bottom nav está no limite (Material Design recomenda max 5). Avaliar substituir "Perfil" por menu hambúrguer/swipe-from-edge se ficar apertado em viewport 360px.

**Estimativa:** 6h (1 nova tela + ajuste bottom-nav em 6 telas).

### V2.3 — Tela "Notificações" dedicada

**Por quê:** ataca ponto #1. Hoje notificações ficam invisíveis no Spotify.

**Conteúdo:**
- Lista cronológica reversa
- Tipos: novidades de artistas seguidos, lançamentos esperados, recomendações de podcast, milestones (X horas de Wrapped), avisos do sistema
- Cada notificação: ícone tipo + título + tempo + ação (Tocar / Salvar / Ignorar)
- Filtros por tipo no topo (chips)
- Badge contador no bottom nav

**Onde:** ícone sino no topbar (Home + Biblioteca) abre a tela. **Sem** virar uma aba do bottom nav (já cheio com Descoberta).

**Estimativa:** 4h.

### V2.4 — Tela "Social" / Atividade dos amigos

**Por quê:** ataca ponto #1 — funcionalidade secundária escondida no Spotify atual (só existe em sidebar desktop).

**Conteúdo:**
- Lista de amigos atualmente ouvindo (com música + artista + tempo)
- Histórico recente dos amigos (últimas 24h)
- Jam sessions ativas para entrar
- Compartilhar minha sessão (toggle)

**Onde:** ícone usuários no topbar. **Mesma justificativa** de Notificações — não vira aba do bottom nav.

**Estimativa:** 4h.

### V2.5 — Customização modular da Home

**Por quê:** ataca ponto #5 do colega. O usuário escolhe O QUE aparece na Home.

**Mudança em T1:**
- Botão "Personalizar" no topo (ou via ⋯ menu)
- Abre tela/sheet **T7 — Personalizar Home** com lista de módulos:
  - ☑ Tocados recentemente
  - ☑ Suas mistura
  - ☑ Feito para você
  - ☑ Novidades de quem você segue
  - ☐ Editorial Spotify
  - ☐ Podcasts em alta
  - ☐ Audiolivros recomendados
- Cada item: switch on/off + handle drag para reordenar
- Preview ao vivo no fundo (50% opacity)
- "Restaurar padrão" no rodapé

**Estimativa:** 5h.

### V2.6 — Customização modular da Biblioteca

Mesma lógica para T3:
- Escolher quais filtros aparecem (Playlists/Artistas/Álbuns/Podcasts/Baixadas/Curtidas/Histórico)
- Escolher visualização padrão (Lista vs Grade) por filtro
- Ordenar (Recentes/A-Z/Por adicionado/...)

**Estimativa:** 3h.

### V2.7 — Substituir scroll infinito por feed paginado

**Por quê:** ataca ponto #1 + #3. Scroll infinito é um anti-pattern reconhecido (cansa, mata sense of place).

**Mudança:**
- T1 Home: limita cada seção a 8-10 itens com "Ver tudo" no rodapé
- T6 Descoberta: feed paginado por "lotes" diários (estilo Discover Weekly)
- Sem auto-load infinito; o usuário escolhe carregar mais

**Estimativa:** 2h (mudança CSS + remover infinite scroll listener).

### V2.8 — Onboarding pós-update

**Por quê:** dor identificada na pesquisa quant (B5 = 3,06, 27,5% baixo): "Não conseguia encontrar meus artistas salvos após uma atualização do visual" (E02).

**Mudança:**
- Detecta primeira abertura após nova versão
- Tour de 4 telas: "O que mudou — Perfil agora aqui ↘️", "Compacto vs Descobrir", "Long-press para selecionar", "Snackbar Desfazer salvou você"
- Botão "Pular" sempre visível
- Não bloqueia o app — pode dispensar e voltar via Configurações > Tour de boas-vindas

**Estimativa:** 4h.

---

## 4. Resumo do escopo V2

| ID | Item | Heurísticas | Estimativa | Bloqueia entrevista? |
|---|---|---|---|---|
| V2.1 | Shapes diferenciados | H4, H8 | 4h | ⭐ Sim — alto impacto qualitativo |
| V2.2 | Aba Descoberta | H7, H8 | 6h | ⭐ Sim |
| V2.5 | Personalizar Home | H7 | 5h | Recomendado |
| V2.7 | Fim do scroll infinito | H8 | 2h | Recomendado |
| V2.3 | Tela Notificações | H7 | 4h | Backlog |
| V2.4 | Tela Social | H7 | 4h | Backlog |
| V2.6 | Personalizar Biblioteca | H7 | 3h | Backlog |
| V2.8 | Onboarding pós-update | H4 | 4h | Backlog |

**Total bloqueador para próxima entrevista (V2.1+V2.2+V2.5+V2.7):** ~17h
**Total backlog:** ~15h

---

## 5. Recomendação de sequenciamento

**Sprint 1 (semana 1, ~6h):**
- V2.1 Shapes diferenciados (4h) — CSS-only, ataca o ponto mais forte do colega
- V2.7 Fim do scroll infinito (2h) — quick win

**Sprint 2 (semana 2, ~11h):**
- V2.2 Aba Descoberta (6h) — nova tela + reorg do bottom nav em 6 telas
- V2.5 Personalizar Home (5h)

**Sprint 3 (semana 3, backlog ~15h):**
- V2.3 + V2.4 + V2.6 + V2.8 — só se houver tempo

---

## 6. Critério de aceite por item

Antes de marcar como pronto, cada item precisa:
- [ ] Implementado em HTML/CSS/JS vanilla seguindo tokens existentes
- [ ] Validado em viewport 375×812 (DevTools mobile)
- [ ] Validado em Android Chrome real
- [ ] Telemetria registrando eventos novos
- [ ] aria-labels e contraste WCAG AA mantidos
- [ ] Atualizado em `MANUAL_DE_TESTES.md` com itens novos para o time testar

---

## 7. Riscos

| Risco | Mitigação |
|---|---|
| Bottom nav com 5 itens fica apertado em 360px | Validar em Android baixo; fallback para 4 itens + ícone "Mais" |
| Shapes diferenciados podem confundir usuário acostumado | Adicionar **legenda visual** no primeiro acesso (tooltip uma vez) |
| Personalizar Home aumenta complexidade percebida | Botão "Restaurar padrão" sempre visível |
| Tempo do TCC | Sprint 1 + 2 são suficientes para defesa; backlog vira "trabalho futuro" no artigo |

---

## 8. Próximo passo concreto

1. Você aprova esse plano (ou corta itens) → respondo em workflow de implementação Sprint 1
2. Workflow paralelo: 1 agente por item (V2.1 + V2.7) com arquivos exclusivos
3. Re-teste via Chrome MCP, commit, push, GitHub Pages atualizado
4. Atualizar `MANUAL_DE_TESTES.md` com itens novos
5. Mandar link novo pro time + dizer "agora testa também shapes diferenciados e Descoberta"
