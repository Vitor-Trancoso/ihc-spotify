# Comparativo — Protótipo atual × Redesign do Juxtopposed

Referência: vídeo "I Redesigned the ENTIRE Spotify UI from Scratch" — Juxtopposed (YouTube `suhEIUapSJQ`, 19:27).
Frames extraídos em `/tmp/spotify-ref/frames/`. Análise focada em mobile (375×812), que é o alvo do protótipo.

> **Nota:** boa parte do vídeo é desktop. Listo abaixo só o que faz sentido portar para mobile, separado pelas 3 áreas que o usuário sintetizou.

---

## 1. Estrutura e Navegação Geral

| Proposta do vídeo | Onde aparece | Protótipo hoje | Gap / o que dá pra adicionar |
|---|---|---|---|
| **Bottom-nav com abas claras**: Home / Discover / Search / Library / Me | 02:05, 08:50 | ✅ 4 abas (Início / Buscar / Biblioteca / Perfil) em T1 e T3 | ➕ Adicionar **5ª aba "Discover"** (ver §3) entre Início e Buscar. Bottom-nav hoje é só decorativa em T1/T3 — não navega. |
| **Ícones padronizados** (line icons consistentes) | 08:50 | ✅ Lucide em todo lugar | OK — manter |
| **Distinção visual entre música / álbum / playlist** (forma da capa) | 00:52–01:28 | ❌ Tudo é quadrado igual | ➕ Já no `PLANO_V2_INCREMENTOS.md` §Foco 2: aba de pasta p/ álbum, eco/stack p/ playlist. **Não foi feito ainda.** |
| **Modo claro** | 01:31 | ❌ Tema escuro fixo (decisão registrada em `README.md`) | ➕ Adicionar toggle em T5 + variantes `--bg-base`/`--text-base` em `tokens.css`. Quebra a decisão original, mas é pedido recorrente em pesquisas IHC. |

---

## 2. Funcionalidades e Interação

| Proposta do vídeo | Onde aparece | Protótipo hoje | Gap / o que dá pra adicionar |
|---|---|---|---|
| **Busca global na topbar de todas as telas** | 05:54, 06:02, 11:00 | ⚠️ Só T3 (Biblioteca) e T5 (Configs) têm busca. T1 não tem. | ➕ Mover busca p/ topbar persistente em T1 (Home) — chip "Buscar tudo" estilo iOS. |
| **Biblioteca com abas fixas + chips por categoria/filtro** (em vez do expand/collapse atual do Spotify) | 16:14, 16:37 | ✅ T3 já tem chips fixos (Playlists / Artistas / Álbuns / Podcasts / Baixadas / Curtidas) + sort + view-toggle | ➕ Adicionar **subchips de filtro contextuais** (ex: Playlists → "By you" / "By Spotify" / pinned). Aparece em 16:37. |
| **Mini-player com cor dinâmica baseada na capa** | 14:21, 14:30 | ❌ Mini-player (definido em `components.css`) não existe ou é estático escuro | ➕ Implementar `background-color` do mini-player vindo de variável CSS atualizada via JS (`color-thief` ou paleta predefinida em `mock-data.js`). |
| **Rearranjo ergonômico dos controles do mini-player** | 14:21 | ⚠️ Mini-player não está nas telas T1/T3 (só aparece em T2 fullscreen) | ➕ Renderizar mini-player flutuante acima da bottom-nav em T1/T3 (consistência com Spotify atual). |

---

## 3. Experiência do Usuário (UX)

| Proposta do vídeo | Onde aparece | Protótipo hoje | Gap / o que dá pra adicionar |
|---|---|---|---|
| **Home customizável** (pinar, ocultar, reordenar recomendações; remover podcasts forçados) | 07:27, 08:16 | ⚠️ T1 tem só uma seção "Editorial" colapsada (chevron). Não dá pra ocultar/reordenar. | ➕ Adicionar bottom-sheet **"Personalizar feed"** com lista de seções (Top Mixes / Made for You / Albums for You / Podcasts…) com toggle olho + drag handle. Direto do frame 08:16. |
| **Discover Tab** (aba separada, conteúdo TikTok-like de descoberta) | 08:44, 08:50, 09:02 | ❌ Não existe | ➕ Criar **T6 — Discover** (mockup): full-screen vertical, swipe entre capas de álbuns/clipes, controles laterais (curtir/+/compartilhar). Tira o "clipes" da Home, fica como aba própria. |
| **Now Playing**: letra com **tradução + slider de tamanho de fonte** | 10:30 | ❌ T2 não tem letra | ➕ Adicionar aba "Letra" no T2 (sheet) com ícones: histórico, tradução, comentários, slider `Aa` p/ font-size. Frame 10:30 mostra exatamente o layout. |
| **Fila** mostrando múltiplas playlists empilhadas com shuffle/repeat por playlist | 12:48 | ⚠️ T2 tem ícone "fila" mas sem tela detalhada | ➕ Sheet de fila com "Next up:" + agrupamento por playlist (verde quando ativa). |
| **Long-press / hold gesture** com atalhos rápidos na música tocando | 09:46 | ✅ T3 já usa long-press (mas para seleção múltipla, não para atalhos do Now Playing) | ➕ Estender: long-press na capa do T2 = mini-menu radial (curtir / add fila / compartilhar). |
| **Perfil "Me"** independente do Facebook, com seção Friends própria + Premium + Histórico + What's new | 18:10, 18:27 | ⚠️ T5 é só Configurações com busca. Não tem perfil-friends-billing num só lugar. | ➕ Reformatar topo do T5 em 3 blocos antes da lista: (1) header Jux com avatar + bio, (2) Friends (lista de 3 amigos com o que estão ouvindo), (3) Current Plan + Listening history + What's new. |
| **DJ com controles manuais** (não só "next") + feedback nas músicas recomendadas | 17:03–18:00 | ❌ Não existe | ➕ Card "DJ" na Biblioteca (T3) já é mencionado pelo Spotify atual; adicionar tela dedicada T7 com botão grande "Pular para próxima vibe", thumbs up/down nas recomendações e seletor de gênero. |

---

## 4. Resumo executivo — o que adicionar primeiro

Ordem por **impacto × custo** (alta fidelidade do TCC, viewport 375×812):

1. **🟢 Quick wins (1–2h cada, alto impacto visual)**
   - Mini-player com cor dinâmica (apenas paleta hardcoded em `mock-data.js`).
   - Bottom-sheet "Personalizar feed" na T1 (mockup).
   - Subchips em T3 (Playlists → "By you" / "By Spotify" / Pinned).

2. **🟡 Médio esforço (4–6h, fecha buracos sentidos pelos entrevistados)**
   - **T6 — Discover Tab** (full-screen TikTok-like, swipe vertical, mockup).
   - **Reformatar T5** com header de perfil + Friends + Plan (sem perder a busca de configurações existente).
   - Distinção visual álbum / playlist / música (já mapeado em `PLANO_V2_INCREMENTOS.md` §Foco 2).

3. **🟠 Esforço maior (mais de um dia, polish opcional)**
   - **Modo claro** (variantes em `tokens.css` + toggle em T5). Quebra decisão original do README, vale validar com o orientador antes.
   - Aba "Letra" em T2 com tradução + slider de fonte.
   - **T7 — DJ** com controles manuais.

---

## 5. Frames-referência por timestamp

Salvos em `/tmp/spotify-ref/frames/f_<HH-MM-SS>.jpg`:

| Frame | Conteúdo útil |
|---|---|
| `f_00-01-28.jpg` | Capas com formato distinto (eco/3D) por tipo de mídia |
| `f_00-02-05.jpg` | Lista das 5 abas: Home / Search-Browse / Library / Profile / Now playing |
| `f_00-03-23.jpg` | Topbar global (desktop): Home / Search + busca persistente |
| `f_00-05-54.jpg` | Páginas de artista com tabs (Albums / Singles / Comp / Merch / About) |
| `f_00-06-15.jpg` | Search com chips de categoria (All / Business / Finance…) — referência para chips contextuais |
| `f_00-08-16.jpg` | **Sidebar "Customize feed"** com toggles olho + drag handles → base p/ sheet Personalizar |
| `f_00-08-50.jpg` | **Bottom-nav 5 abas mobile** + estilo de cards de descoberta (full-screen + adjacente) |
| `f_00-10-30.jpg` | **Tela de Letra** com ícones laterais (histórico, tradução, fonte slider) |
| `f_00-12-48.jpg` | Fila "Next up" agrupada por playlist com shuffle/repeat individuais |
| `f_00-14-21.jpg` | Mini-player desktop com cor dinâmica vinda da capa |
| `f_00-16-37.jpg` | Library com chips de filtro X / Playlists / By you / By Spotify |
| `f_00-18-10.jpg` | **Perfil "Me"** mobile: avatar Jux + bio + mini-player |
| `f_00-18-27.jpg` | **Perfil "Me"** completo: Friends, Premium, Listening history, Settings, What's new |
