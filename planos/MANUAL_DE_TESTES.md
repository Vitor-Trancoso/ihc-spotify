# Manual de Testes — Protótipo Spotify Mobile

Use este manual para verificar manualmente, tela por tela, se tudo funciona antes do piloto com usuário.

## Setup

```bash
cd /Users/vitormarconi/Documents/GitHub/ihc-spotify/prototipo
python3 -m http.server 8000
```

Abra **http://localhost:8000** no Chrome.
**DevTools → Toggle device toolbar (Cmd+Shift+M) → iPhone 12 Pro (390×844) ou iPhone SE (375×667).**

Para teste em celular real: descubra o IP da máquina (`ipconfig getifaddr en0`) e abra `http://SEU_IP:8000` no celular **na mesma rede Wi-Fi**. Android Chrome é o alvo principal (T3 long-press depende disso).

Use o `index.html` como menu de navegação entre as 11 telas.

---

## Convenções

- ✅ **PASS** = funciona como esperado
- ⚠️ **WARN** = funciona mas com ressalva (anotar)
- ❌ **FAIL** = não funciona / quebrou

Anote em coluna ao lado de cada item. Se ❌, descreva o que aconteceu.

---

## Tela 0 — `index.html` (roteador)

| # | Ação | Esperado |
|---|---|---|
| 0.1 | Abrir `http://localhost:8000` | Carrega header "Protótipo Spotify IHC" + grid de 10 cards |
| 0.2 | Clicar em qualquer card "Redesign" | Abre a tela correspondente |
| 0.3 | Clicar em qualquer card "Controle (atual)" | Abre versão controle |
| 0.4 | Botão voltar/back no navegador | Volta ao menu |
| 0.5 | Console (F12) | Sem erros vermelhos |

---

## T1 — Home minimalista (mockup)

**Esperado**: visual denso, grid 2-col, sem feed TikTok, sem auto-preview. É **mockup estático**.

| # | Ação | Esperado |
|---|---|---|
| 1.1 | Abrir `#/t1` | Topbar com avatar, chips "Tudo / Música / Podcasts / Audiolivros", chip ativo verde |
| 1.2 | Saudação "Boa noite, Vitor" visível | Tipografia Inter, peso bold |
| 1.3 | Grid "Tocados recentemente" | 4 cards em 2×2, capa + nome, densidade alta |
| 1.4 | Seção "Sua mistura" | 1 carrossel horizontal, scroll suave |
| 1.5 | Seção "Editorial" | Colapsada por padrão, botão para expandir (visual apenas) |
| 1.6 | Toggle "Compacto / Descobrir" | Visível no topo (não precisa funcionar) |
| 1.7 | Nota "Mockup estático" no rodapé | Presente e discreta |
| 1.8 | Scroll horizontal acidental no body | **Não** deve existir |
| 1.9 | Bottom nav | Tab "Início" ativa em verde |

---

## T2 — Player redesenhado (alta fidelidade)

**Esperado**: coração ♥ primário, "+" secundário, shuffle/repeat com **label de texto** sempre visível, Smart Shuffle como **toggle separado**.

| # | Ação | Esperado |
|---|---|---|
| 2.1 | Abrir `#/t2` | Header (chevron-down + "TOCANDO DE Playlist Y" + 3-pontinhos) |
| 2.2 | Capa grande quadrada | ~320×320, centralizada |
| 2.3 | Linha com título da música | ♥ à esquerda do nome ou alinhado primário, "+" pequeno secundário |
| 2.4 | Clicar no ♥ | Vira verde preenchido, toast "Adicionado às curtidas" (ou similar) |
| 2.5 | Clicar de novo no ♥ | Desfaz (volta ao outline) |
| 2.6 | Barra de progresso (slider) | Arrastável; tempo atual/total atualiza |
| 2.7 | Clicar PLAY/PAUSE | Ícone alterna; logado em telemetria |
| 2.8 | Clicar Shuffle | Vira verde + label muda para "Aleatório: Ativado" (ou similar texto visível) |
| 2.9 | Clicar Shuffle de novo | Volta para "Aleatório: Desativado" |
| 2.10 | Clicar Repeat | Cicla off → tudo → uma, **label texto** muda visível ("Repetir: Off/Tudo/Uma") |
| 2.11 | Toggle "Smart Shuffle" | Switch separado, NÃO está dentro do ciclo do shuffle normal |
| 2.12 | Recarregar página | Estado do shuffle/repeat persiste (localStorage) |
| 2.13 | Mini-player (se houver na tela) | Mostra indicador de shuffle/repeat ativo |
| 2.14 | Verificar console | `telemetria.logEvent` disparou para cada toggle |

---

## T3 — Biblioteca com seleção múltipla (alta fidelidade)

**⚠️ Testar em Android Chrome ou desktop. iOS Safari pode falhar no long-press.**

| # | Ação | Esperado |
|---|---|---|
| 3.1 | Abrir `#/t3` | Topbar avatar + "Sua biblioteca" + ícone busca |
| 3.2 | Campo de busca | Sempre visível abaixo do título (não atrás de ícone) |
| 3.3 | Digitar "rock" na busca | Lista filtra em tempo real |
| 3.4 | Chips de filtro (Playlists/Artistas/...) | Clicáveis, chip ativo vira verde |
| 3.5 | Toggle Lista/Grade | Muda layout das playlists |
| 3.6 | Lista mostra 20 playlists | Cada uma: capa + nome + tipo + contagem |
| 3.7 | **Long-press** em uma playlist (segurar 500ms) | Feedback visual (scale + outline verde), entra em **modo seleção** |
| 3.8 | Topbar muda | "1 selecionado" + botões Mover/Remover/Baixar/Compartilhar/Adicionar + X cancelar |
| 3.9 | Checkboxes aparecem | Fade-in suave em todas as playlists |
| 3.10 | Tap em outra playlist | Adiciona à seleção, contador vai para "2 selecionados" |
| 3.11 | Tap de novo na mesma | Remove da seleção |
| 3.12 | Clicar X cancelar | Volta ao normal, checkboxes somem |
| 3.13 | Selecionar 3 + clicar Remover | Snackbar "3 playlists removidas — Desfazer" |
| 3.14 | Clicar Desfazer | Playlists voltam, snackbar some |
| 3.15 | Alphabet scroll lateral (A-Z) | Barra fina à direita, ao arrastar mostra letra grande |
| 3.16 | **NÃO deve vibrar** o celular (sem `navigator.vibrate`) | Apenas feedback visual |
| 3.17 | Sem menu "Copy/Look Up/Share" iOS aparecer no long-press | Se aparecer = bug do `user-select` |

---

## T4 — Menu contextual (mockup)

**Esperado**: bottom-sheet aberto com 3 grupos visualmente separados. "Adicionar à fila" e "Adicionar à playlist" **NUNCA adjacentes**.

| # | Ação | Esperado |
|---|---|---|
| 4.1 | Abrir `#/t4` | Tela de playlist com bottom-sheet aberto sobre ela |
| 4.2 | Cabeçalho do sheet | Capa pequena + título música + artista |
| 4.3 | Grupo 1: REPRODUÇÃO | Tocar agora / Adicionar à fila / Próxima na fila — ícones distintos, cor neutra |
| 4.4 | Gap visual entre grupos | ≥24px de separador |
| 4.5 | Grupo 2: COLEÇÃO | Adicionar à playlist (+) / Curtir (♥ verde) / Baixar (download verde) |
| 4.6 | Grupo 3: OUTROS | Compartilhar / Ver artista / Ver álbum / Créditos / Denunciar |
| 4.7 | "Adicionar à fila" e "Adicionar à playlist" | **Em grupos diferentes**, separados por ≥24px |
| 4.8 | Tap no backdrop | Fecha o sheet (se interatividade mínima estiver lá) |
| 4.9 | Nota "Mockup — interação em T3" | Discreta no rodapé |

---

## T5 — Configurações com busca (alta fidelidade)

| # | Ação | Esperado |
|---|---|---|
| 5.1 | Abrir `#/t5` | Topbar "Configurações" + campo busca sticky abaixo |
| 5.2 | Seções visíveis | Conta / Reprodução / Qualidade de áudio / Notificações / Privacidade / Acessibilidade / Sobre |
| 5.3 | Cada linha | Ícone Lucide + título + valor à direita + chevron |
| 5.4 | Digitar "qualidade" na busca | Filtra itens em tempo real |
| 5.5 | Termo destacado | `<mark>` amarelo/verde no termo encontrado |
| 5.6 | Digitar "xyz123" (sem resultado) | Empty state "Nada encontrado..." |
| 5.7 | Limpar busca (X ou apagar) | Lista volta completa |
| 5.8 | Tap em um item | Abre detail (overlay simples) |
| 5.9 | Console | Sem erros, eventos logados |

---

## MA — Snackbar Desfazer (alta fidelidade)

**Tela isolada de demo. Dor #1 do net-score.**

| # | Ação | Esperado |
|---|---|---|
| MA.1 | Abrir `#/ma` | Playlist com 8 músicas listadas |
| MA.2 | Swipe-left em uma música (ou botão lixeira) | Música some com animação height-collapse |
| MA.3 | Snackbar aparece | "Música removida — DESFAZER", acima do mini-player |
| MA.4 | Barra de countdown | Diminui visualmente em 6 segundos |
| MA.5 | Clicar DESFAZER antes dos 6s | Música volta para a lista |
| MA.6 | Não clicar | Após 6s o snackbar some sozinho |
| MA.7 | Apagar 3 músicas seguidas rapidamente | Snackbar agrupa "3 músicas removidas" OU enfileira |
| MA.8 | Demo "Limpar busca" | Mesmo padrão de snackbar |
| MA.9 | Demo "Apagar playlist" | Mesmo padrão |
| MA.10 | Console | Log de tempo até clicar Desfazer |

---

## Controles "Spotify atual" (`#/controle/...`)

Cada uma deve reproduzir **fielmente** o problema documentado, **sem caricaturar**. Use para comparação A/B na entrevista.

### T1-atual — Home feed TikTok
- Cards gigantes verticais, gradient animado simulando auto-preview, mistura música/podcast/audiolivro sem distinção clara, scroll longo, densidade BAIXA. ✅ se parece com Spotify atual.

### T2-atual — Player atual
- ♥ substituído por "+" no destaque. Shuffle com **ciclo único** (off → shuffle → smart) no MESMO botão, 3 estados sutis sem texto. Repeat tri-estado sem label. Mini-player não indica shuffle/repeat. ✅ se reproduz o problema.

### T3-atual — Biblioteca sem lote
- **SEM** seleção múltipla. Para apagar precisa abrir 3-pontinhos em cada música. SEM alphabet scroll. Busca atrás de ícone (não sticky). Tente apagar 5 e cronometre — deve ser doloroso. ✅ se a fricção é evidente.

### T4-atual — Menu lista plana
- Menu contextual sem agrupamentos. "Adicionar à fila" e "Adicionar à playlist" **ADJACENTES**, ícones similares. Tente tocar rápido em "fila" e confira se é fácil errar e clicar em "playlist". ✅ se o erro é fácil de reproduzir.

### T5-atual — Settings sem busca
- Lista longa scrollável agrupada por seções, **SEM campo de busca**. Tente achar "qualidade de download" — deve exigir scroll/leitura. ✅ se o caminho é longo.

---

## Checklist transversal (rode em TODAS)

| # | Ação | Esperado |
|---|---|---|
| X.1 | Console (F12) durante navegação | Sem erros vermelhos |
| X.2 | Network tab | Lucide CDN carrega; sem 404 |
| X.3 | localStorage (Application tab) | Chave de telemetria existe e enche com eventos |
| X.4 | Resize para 320px | Não quebra (degrada bem) |
| X.5 | Resize para 414px | Não estica feio |
| X.6 | Modo escuro fixo | Não há flash branco em transição |
| X.7 | Inter font carrega | Inspecionar `body { font-family }` — não pode estar caindo em serif |
| X.8 | Tab key (navegação por teclado) | Foco visível em botões |
| X.9 | Bottom nav presente | Em todas exceto MA e talvez T2 (player fullscreen) |
| X.10 | Botão voltar do navegador | Funciona |

---

## Como reportar bugs encontrados

Crie issues no formato:

```
[Tela] Descrição curta
- Como reproduzir: 1. ... 2. ... 3. ...
- Esperado: ...
- Atual: ...
- Severidade: crítica/alta/média/baixa
- Bloqueia piloto? sim/não
```

Salve em `planos/BUGS_ENCONTRADOS.md` ou cole no chat e eu corrijo em lote via workflow.

---

## Critério de "pronto para piloto"

- ✅ Zero erros no console em qualquer tela
- ✅ Todas as 4 tarefas críticas (T2 shuffle, T3 seleção+mover, T5 busca, MA desfazer) executam sem bug
- ✅ Telemetria registra eventos em `localStorage`
- ✅ Controles "atual" reproduzem o problema visível
- ✅ Funciona em Chrome desktop + 1 celular Android real

Falhar em qualquer item = corrigir antes de marcar entrevistas.
