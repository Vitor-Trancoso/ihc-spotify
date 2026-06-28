# Manual de Testes — Protótipo Spotify Mobile

Use este manual para verificar manualmente, tela por tela, se tudo funciona antes do piloto com usuário.

## Setup

### Opção A — Online (recomendado)
Abrir direto no celular ou no DevTools mobile do desktop:
```
https://vitor-trancoso.github.io/ihc-spotify/prototipo/index.html
```

### Opção B — Local
```bash
cd /Users/vitormarconi/Documents/GitHub/ihc-spotify/prototipo
python3 -m http.server 8000
```

Abra **http://localhost:8000** no Chrome.
**DevTools → Toggle device toolbar (Cmd+Shift+M) → iPhone 12 Pro (390×844) ou iPhone SE (375×667).**

Para teste em celular real: descubra o IP da máquina (`ipconfig getifaddr en0`) e abra `http://SEU_IP:8000` no celular **na mesma rede Wi-Fi**. **Android Chrome é o alvo principal** (T3 long-press depende disso; iOS Safari tem limitações documentadas).

Use o `index.html` como menu de navegação entre as **15 telas** (9 redesign + 5 controle + 1 utilitário onboarding).

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
| 0.1 | Abrir a URL | Header "Protótipo Spotify IHC" + texto "**9 telas em redesign** e 5 versões-controle" |
| 0.2 | Grid de cards | 9 cards Redesign (T1-T5, MA, T6, T7, T8, T9) + 5 cards Controle |
| 0.3 | Clicar qualquer card | Abre a tela correspondente |
| 0.4 | Botão voltar do navegador | Volta ao menu |
| 0.5 | Console (F12) | Sem erros vermelhos |

---

## Onboarding (tour pós-update — APARECE na 1ª vez)

| # | Ação | Esperado |
|---|---|---|
| O.1 | 1ª vez que abrir T1 | Após ~800ms aparece overlay com backdrop blur + card centrado "PASSO 1 DE 4 — O que mudou 🎉" |
| O.2 | Clicar "Próximo" | Avança para passos 2, 3, 4 (Perfil aqui, Long-press, Descoberta) |
| O.3 | Dots indicadores | Dot ativo verde, demais cinza |
| O.4 | Clicar "Pular" | Fecha o tour, não aparece de novo |
| O.5 | Tap no backdrop ou ESC | Fecha o tour |
| O.6 | No último passo o botão vira "Concluir" | ✓ |
| O.7 | Recarregar T1 após dispensar | Tour NÃO aparece de novo (lembrou via localStorage) |
| O.8 | Para forçar de novo | Console: `localStorage.removeItem('spotify_onboarding_v2_done'); location.reload()` |

---

## T1 — Home minimalista (com shapes diferenciados — V2)

**Esperado**: layout limpo, **shapes por tipo de mídia visíveis**, "Ver tudo" em cada seção, bottom nav 5 itens.

| # | Ação | Esperado |
|---|---|---|
| 1.1 | Abrir T1 | Topbar: avatar VT + chips "Tudo/Música/Podcasts/Audiolivros" + **ícone social (users)** + **ícone sino com badge "3"** |
| 1.2 | Saudação "Boa noite, Vitor" | Tipografia bold |
| 1.3 | Toggle "Compacto / Descobrir" | Visível (mockup) |
| 1.4 | Seção "Tocados recentemente" | 4 cards 2×2 + botão **"Ver tudo >"** no header |
| 1.5 | Seção "Seus Mixes" | Carrossel horizontal com cards **playlist (efeito eco/empilhamento)** |
| 1.6 | Seção "Editorial" | Cards de **álbum (com aba "pasta" no topo)** + playlist |
| 1.7 | **NOVO** Seção "Artistas que você segue" | Carrossel com **círculos perfeitos** (Tame Impala, Lana Del Rey, Daft Punk) |
| 1.8 | **NOVO** Seção "Podcasts populares" | Cards com **fita lateral colorida** (vermelha=Notícias, azul=Tecnologia) |
| 1.9 | **NOVO** Seção "Audiolivros" | Cards **retangulares 3:4** com sombra de livro (Sapiens, 1984) |
| 1.10 | **NOVO** Legenda "Como ler as formas" | Bloco no rodapé com 6 demos (Música/Álbum/Playlist/Artista/Podcast/Audiolivro). Botão X para fechar |
| 1.11 | **NOVO V2.3** Botão "Personalizar Home" | Discreto, antes da nota mockup → **abre bottom-sheet inline** (NÃO navega mais para T7) |
| 1.11a | **NOVO V2.3** Bottom-sheet "Personalizar feed" | Handle no topo + header "Personalizar feed" + botão X fechar |
| 1.11b | Botão "+ Selecionar da Biblioteca" no topo do sheet | Visível, log telemetria ao clicar |
| 1.11c | Lista de 11 módulos | Top Mixes / Made For You / Albums For You / Artists / Audiobooks / Spotify Originals / Your Playlists / Recently Played / New Releases / Recommended Radio / Episodes For You |
| 1.11d | Cada linha tem | Drag handle (≡) + nome + ícone olho (eye/eye-off) |
| 1.11e | Clicar olho | Alterna `.is-hidden` + ícone vira `eye-off` + telemetria `toggle_module` |
| 1.11f | Drag pelo handle | Reordena visualmente (pointer events) + telemetria `reorder` |
| 1.11g | Footer "Permitir linhas de recomendação" | Switch verde estilo iOS |
| 1.11h | Recarregar T1 e reabrir sheet | Estado persiste (localStorage `spotify_t1_feed_modules`) |
| 1.11i | Tap no backdrop ou X | Fecha sheet, restaura foco |
| 1.12 | Avatar VT no topo | Clicar → vai para **T5 Configurações** |
| 1.13 | Ícone sino no topo | Clicar → vai para **T8 Notificações** |
| 1.14 | Ícone social no topo | Clicar → vai para **T9 Social** |
| 1.15 | Bottom nav | **5 itens**: Início (verde ativo) / **Descoberta** / Buscar / Biblioteca / Perfil (avatar VT) |
| 1.16 | Tap em "Descoberta" no bottom nav | Vai para **T6** |
| 1.17 | Tap em "Perfil" no bottom nav | Vai para **T5** |
| 1.18 | Scroll horizontal acidental no body | Não deve existir |

---

## T2 — Player redesenhado (alta fidelidade)

**Esperado**: ♥ primário, "+" secundário, Shuffle/Repeat com **label textual**, **snackbar Desfazer** ao curtir, **picker de playlist** ao adicionar.

| # | Ação | Esperado |
|---|---|---|
| 2.1 | Abrir T2 | Header (chevron-down + "TOCANDO DE PLAYLIST · Discover Weekly" + 3-pontinhos) |
| 2.2 | Capa grande quadrada | ~320×320, centralizada |
| 2.3 | ♥ ao lado do nome | Visível, primário |
| 2.4 | Clicar ♥ | Vira verde preenchido + **snackbar "Adicionada às Curtidas — DESFAZER"** com countdown verde |
| 2.5 | Clicar ♥ de novo | **Snackbar "Removida das Curtidas — DESFAZER"** |
| 2.6 | Clicar DESFAZER | Reverte o estado do coração |
| 2.7 | Ícone "+" / biblioteca ao lado do título | Clicar abre **bottom-sheet picker de playlist** com busca + "**+ Nova playlist**" verde + lista (Discover Weekly, Daily Mix 1-3, Release Radar, Músicas Curtidas) |
| 2.8 | Tap em uma playlist do picker | Snackbar "Adicionada a {nome} — DESFAZER" + fecha sheet |
| 2.9 | Barra de progresso | Arrastável; tempo atual/total atualiza |
| 2.10 | Clicar Shuffle | Vira verde + label **"Aleatório: Ativado"** muda visível |
| 2.11 | Clicar Repeat | Cicla off → tudo → uma com label **"Repetir: Off/Tudo/Uma"** |
| 2.12 | Toggle Smart Shuffle | Switch **separado** abaixo (não no ciclo do shuffle normal) |
| 2.13 | Recarregar | Estado shuffle/repeat persiste (localStorage) |

---

## T3 — Biblioteca com seleção múltipla + shapes (V2)

**⚠️ Testar em Android Chrome ou desktop. iOS Safari pode falhar no long-press.**

| # | Ação | Esperado |
|---|---|---|
| 3.1 | Abrir T3 | Topbar: avatar VT + "Sua biblioteca" + **ícone social + sino (badge "3")** + busca + "+" |
| 3.2 | Campo de busca | Sempre visível (não atrás de ícone) |
| 3.3 | **NOVO** Chips de filtro | Tudo (verde) / Playlists / Artistas / Albuns / Podcasts / Baixadas / Curtidas |
| 3.4 | Modo "Tudo" | Capas com **efeito eco** (3 shadows empilhadas) |
| 3.5 | **NOVO** Tap em "Artistas" | Capas viram **círculos perfeitos** (M83, Tame Impala, Daft Punk, etc) com label "Artista" |
| 3.6 | Tap em outros chips (Albuns/Podcasts) | Shape correspondente aplicado |
| 3.7 | Toggle Lista/Grade | Muda layout |
| 3.8 | Digitar na busca | Lista filtra em tempo real |
| 3.9 | **Long-press** em uma playlist (segurar 500ms) | Feedback visual (scale + outline verde), entra em **modo seleção** |
| 3.10 | Topbar muda | "1 selecionado" + Selec. tudo + X cancelar |
| 3.11 | Tap em outras playlists | Adiciona à seleção |
| 3.12 | Action bar inferior | Mover / Baixar / Adicionar / Compart. / Remover |
| 3.13 | Selecionar 3 + Remover | **Snackbar "X removidas — DESFAZER"** |
| 3.14 | Clicar DESFAZER | Restaura |
| 3.15 | Alphabet scroll lateral | Barra A-Z à direita |
| 3.16 | **NOVO** Contador "Mostrando X de Y" | Visível no rodapé da lista |
| 3.17 | **NOVO** Botão "Personalizar Biblioteca" | Abre sheet com toggles para chips + visualização padrão + ordenação |
| 3.18 | Botão "+" no topo | Abre sheet **Criar** (Playlist / Pasta / Sessão Jam) |
| 3.19 | Avatar VT | Vai para T5 Configurações |
| 3.20 | Bottom nav | 5 itens, Biblioteca ativa em verde |
| 3.21 | **NÃO deve vibrar** o celular | Sem `navigator.vibrate` |
| 3.22 | Sem menu "Copy/Look Up/Share" iOS aparecer no long-press | Se aparecer = bug iOS |

---

## T4 — Menu contextual (mockup)

**Esperado**: bottom-sheet com 3 grupos visualmente separados. "Adicionar à fila" e "Adicionar à playlist" **NUNCA adjacentes**.

| # | Ação | Esperado |
|---|---|---|
| 4.1 | Abrir T4 | Tela playlist com bottom-sheet aberto |
| 4.2 | Cabeçalho do sheet | Capa + título + artista |
| 4.3 | Grupo 1 REPRODUÇÃO | Tocar agora / Próxima na fila / Adicionar à fila |
| 4.4 | Gap entre grupos | ≥24px de separador |
| 4.5 | Grupo 2 COLEÇÃO | Adicionar à playlist (+) / Curtir (♥) / Baixar |
| 4.6 | Grupo 3 OUTROS | Compartilhar / Ver artista / Ver álbum / Créditos / Denunciar |
| 4.7 | Fila e Playlist | **Em grupos diferentes**, separados |

---

## T5 — Configurações com busca (alta fidelidade)

| # | Ação | Esperado |
|---|---|---|
| 5.1 | Abrir T5 (ou via Perfil de qualquer tela) | Topbar "Configurações" + busca sticky |
| 5.2 | Seções visíveis | Conta / Reprodução / Qualidade de áudio / Notificações / etc |
| 5.3 | Digitar "qualidade" na busca | Filtra em tempo real |
| 5.4 | Termo destacado | `<mark>` verde no termo encontrado |
| 5.5 | Digitar "xyz123" | Empty state |
| 5.6 | Tap em item | Abre detail |

---

## MA — Snackbar Desfazer + Ordenar + Histórico (alta fidelidade)

**Tela demo de reversibilidade.**

| # | Ação | Esperado |
|---|---|---|
| MA.1 | Abrir MA | Playlist com 8 músicas |
| MA.2 | **NOVO** Botão "Apagar playlist" vermelho | **NÃO DEVE EXISTIR** (removido por ser perigoso) |
| MA.3 | **NOVO** Botão "Ordenar" | Abre bottom sheet com 6 critérios (Título A-Z/Z-A, Artista, Data adicionada recente/antiga, Duração). Selecionar reordena |
| MA.4 | **NOVO** Botão "Histórico" | Abre sheet "Histórico de músicas" com lista combinada: atuais (badge "ATUAL" verde + Remover) e removidas (badge cinza + Restaurar) |
| MA.5 | Botão lixeira em uma música | Música some + **snackbar "Removida — DESFAZER"** + countdown 6s |
| MA.6 | Clicar DESFAZER | Música volta |
| MA.7 | Não clicar em 6s | Snackbar some sozinho, música fica removida |
| MA.8 | Após remover, abrir Histórico | Música removida aparece marcada |
| MA.9 | Bottom nav | 5 itens (Início/Descoberta/Buscar/Biblioteca/Perfil) — **NÃO tem mais "Criar"** |

---

## T6 — Descoberta (REFEITA V2.3, alta fidelidade — estilo TikTok/Reels)

**Esperado**: feed vertical full-screen com swipe entre clipes de música. Versão antiga preservada em `t6-old.html` (carrosséis editoriais) — não está no menu.

| # | Ação | Esperado |
|---|---|---|
| 6.1 | Abrir T6 (ou tap "Descoberta" no bottom nav) | Topbar com tabs "Pra você / Seguindo" + 1º clipe ocupa **100% do viewport** |
| 6.2 | Cor de fundo | Dominante extraída do clipe (mock — paleta hardcoded muda por clipe) |
| 6.3 | Topo do clipe | Hashtag tipo `#synthwave` ou `#electropop` |
| 6.4 | Centro | Capa grande do álbum + **waveform animada** (10 barras pulsando ao redor) |
| 6.5 | Stack vertical à direita | Botões circulares: ♥ curtir, 🔖 salvar, ↗ compartilhar, ⋯ mais opções |
| 6.6 | Contador embaixo de cada action | Formato `1.2k` / `45.6k` / `1.2M` |
| 6.7 | Footer do clipe | Botão play/pause + título + artista + chips de tags |
| 6.8 | Indicador "swipe up" | Pequena seta animada na borda inferior |
| 6.9 | **Swipe vertical / scroll** | Vai para próximo clipe com **scroll-snap** (encaixa no clipe inteiro) |
| 6.10 | Mudança de clipe | Background do device-frame muda suavemente (transition) + telemetria `view_clip` |
| 6.11 | Clicar ♥ | Vira preenchido + aria-pressed=true + telemetria `like_clip` |
| 6.12 | Clicar play/pause | Pausa waveform (classe `.is-paused`) + ícone alterna |
| 6.13 | Trocar tab "Pra você ↔ Seguindo" | Telemetria `switch_tab` |
| 6.14 | Scroll horizontal | **NÃO deve existir** |
| 6.15 | Bottom nav | **Descoberta ativo em verde** (5 itens) |
| 6.16 | Total de clipes mockados | 4 (After Hours / Midnight City / Get Lucky / Blinding Lights) |

---

## T7 — Personalizar Home (NOVA, alta fidelidade)

| # | Ação | Esperado |
|---|---|---|
| 7.1 | Abrir T7 (via botão "Personalizar Home" em T1) | Topbar: voltar + "Personalizar Home" + **botão "Salvar" verde** |
| 7.2 | Subtítulo | "Mostre ou esconda seções da sua Home. Arraste para reordenar." |
| 7.3 | Lista de 8 módulos | Drag handle (⋮⋮) à esquerda + nome + descrição + switch iOS à direita |
| 7.4 | 4 primeiros switches | ON (verdes): Tocados recentemente, Seus Mixes, Feito para você, Artistas |
| 7.5 | 4 últimos switches | OFF (cinza): Editorial, Podcasts populares, Audiolivros, Novidades sociais |
| 7.6 | Clicar um switch | Alterna estado + log telemetria |
| 7.7 | Botão "Restaurar padrão" | Visível no rodapé (verde, sem fundo) |
| 7.8 | Salvar | Persiste em localStorage |
| 7.9 | Drag handle | Visual presente (reordenar pode não funcionar — só log) |

---

## T8 — Notificações (NOVA, alta fidelidade)

| # | Ação | Esperado |
|---|---|---|
| 8.1 | Abrir T8 (via sino em T1 ou T3) | Topbar: voltar + "Notificações" + 3-pontinhos |
| 8.2 | Chips de filtro | Todas (verde) / Lançamentos / Recomendações / Sistema / Social |
| 8.3 | Lista de notificações | 10-12 itens cronológicos |
| 8.4 | Ícones por tipo | disc (lançamento) / sparkles (recomendação) / info (sistema) / user (social) / trophy (milestone) |
| 8.5 | Dot verde à esquerda | Em notificações **não lidas** |
| 8.6 | Tempo relativo | "HÁ 12 MIN", "HÁ 2 H", "ONTEM" cinza |
| 8.7 | Botão de ação à direita | Tocar / Salvar / Ver / Ouvir / Compartilhar dependendo do tipo |
| 8.8 | Tap em notificação | Marca como lida (dot some) |
| 8.9 | Tap em 3-pontinhos | Sheet "Marcar todas como lidas" / "Limpar tudo" |
| 8.10 | Clicar em chip de filtro | Filtra lista |

---

## T9 — Social / Amigos (NOVA, alta fidelidade)

| # | Ação | Esperado |
|---|---|---|
| 9.1 | Abrir T9 (via ícone users em T1 ou T3) | Topbar: voltar + "Social" + ícone search |
| 9.2 | Subtítulo | "Veja o que seus amigos estão ouvindo" |
| 9.3 | Seção "Ouvindo agora" | Badge **AO VIVO** verde |
| 9.4 | Lista de amigos | 3-4 amigos (Ana/Bruno/Camila/Diego) com avatares circulares coloridos + música + indicador equalizador animado verde |
| 9.5 | Tap em amigo | Abre o player |
| 9.6 | Seção "Jam Sessions ativas" | 2 jam sessions com capa + "[Anfitrião]'s Jam" + "X participantes" + **botão Entrar verde** |
| 9.7 | Seção "Últimas 24h" | Timeline de atividades (curtidas, adições) |
| 9.8 | Seção "Compartilhar minha sessão" | Card com **toggle ON/OFF** + descrição |

---

## Controles "Spotify atual" (`/telas/controle/...`)

| Tela | Verificação rápida |
|---|---|
| **t1-atual** | Feed TikTok com cards gigantes, banner Premium, mistura música+podcast+audiolivro sem distinção |
| **t2-atual** | "+" no destaque, shuffle/repeat **sem labels textuais** (estados sutis) |
| **t3-atual** | **SEM** seleção múltipla, sem alphabet scroll, busca atrás de ícone, apagar 1-por-1 |
| **t4-atual** | Menu lista plana, "Adicionar a fila" e "Adicionar a playlist" **ADJACENTES** |
| **t5-atual** | **SEM** busca, lista longa scrollável |

Use estas como condição-controle no A/B do roteiro de entrevista. **Não** comparar contra o app real (viés de fidelidade).

---

## Checklist transversal (rode em TODAS)

| # | Ação | Esperado |
|---|---|---|
| X.1 | Console (F12) durante navegação | Sem erros vermelhos |
| X.2 | Network tab | Lucide CDN carrega; sem 404 |
| X.3 | localStorage (Application tab) | Chaves `spotify_telemetria_*`, `spotify_onboarding_v2_done`, `spotify_home_modules`, `spotify_t1_feed_modules`, estados de shuffle/repeat |
| X.4 | Resize para 320px | Bottom nav 5 itens não estoura |
| X.5 | Resize para 414px | Não estica feio |
| X.6 | Modo escuro fixo | Sem flash branco |
| X.7 | Inter font carrega | Não cair em serif |
| X.8 | Tab key | Foco visível verde em botões |
| X.9 | Bottom nav | Em todas exceto T2 (player fullscreen) |
| X.10 | Botão voltar do navegador | Funciona |
| X.11 | **NOVO** Badge "3" no sino | Visível em T1 e T3 |
| X.12 | **NOVO** Avatar VT em topo + Perfil em bottom nav | Ambos levam para T5 |

---

## Como reportar bugs encontrados

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
- ✅ **NOVO** Onboarding dispara na 1ª vez e não atrapalha
- ✅ **NOVO** Bottom nav 5 itens não estoura em 360px
- ✅ **NOVO** Shapes diferenciados visíveis e distinguíveis sem zoom

Falhar em qualquer item = corrigir antes de marcar entrevistas.

---

## Resumo das telas (mapa do protótipo)

| Tela | Tipo | Função | Status |
|---|---|---|---|
| index | router | Menu de navegação | ✅ |
| T1 | mockup | Home minimalista com shapes diferenciados | ✅ V2 |
| T2 | interativo | Player redesenhado + picker playlist + undo curtir | ✅ V2 |
| T3 | interativo | Biblioteca com long-press + shapes + personalizar | ✅ V2 |
| T4 | mockup | Menu contextual agrupado | ✅ |
| T5 | interativo | Configurações com busca incremental | ✅ |
| MA | interativo | Snackbar Desfazer + Ordenar + Histórico | ✅ V2 |
| T6 | interativo | **Descoberta** (refeita V2.3 — full-screen TikTok-like) | ✅ V2.3 |
| t6-old | arquivado | Versão V2.0 da Descoberta (carrosséis editoriais), preservada para histórico | 📦 |
| T7 | interativo | **Personalizar Home** (NOVA V2) | ✅ V2 |
| T8 | interativo | **Notificações** (NOVA V2) | ✅ V2 |
| T9 | interativo | **Social/Amigos** (NOVA V2) | ✅ V2 |
| t1-atual | controle | Home Spotify atual | ✅ |
| t2-atual | controle | Player Spotify atual | ✅ |
| t3-atual | controle | Biblioteca Spotify atual | ✅ |
| t4-atual | controle | Menu Spotify atual | ✅ |
| t5-atual | controle | Configurações Spotify atual | ✅ |
| Onboarding | overlay | Tour pós-update 4 slides | ✅ V2 |
