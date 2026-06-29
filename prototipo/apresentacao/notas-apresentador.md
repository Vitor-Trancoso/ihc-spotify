# Notas do apresentador — Apresentação Final IHC Spotify

> **Tempo total cheio**: 1140s = **19min** (apresentação) + 3min Q&A.
> **Cap alvo**: 1020s = 17min de fala + 3min Q&A = 20min totais.
> **Minimo (sem opcionais)**: 975s = **16,2min** — folga confortável.

## Atalhos
`→/←` navegar · `P` notas · `T` timer · `F` fullscreen · `O` overview · `1-9` jump · `?` ajuda

---

## Orçamento de tempo

| # | Slide | Bloco | Tempo | Status |
|---|---|---|---|---|
| 01 | Capa | Abertura | 30s | obrigatório |
| 02 | Tema e relevância | Abertura | 45s | obrigatório |
| 03 | Problema e objetivo | Abertura | 45s | obrigatório |
| 04 | Jornada do projeto | Abertura | 60s | obrigatório |
| 05 | Heurísticas + instrumento | Abertura | 60s | obrigatório |
| 06 | Amostra (n=86) | Análise | 60s | obrigatório |
| 07 | Confiabilidade (α=0,961) | Análise | 60s | obrigatório |
| 08 | Dores (net-score, A3) | Análise | 90s | obrigatório |
| 09 | Free × Premium + correlações | Análise | 90s | obrigatório |
| 10 | Do dado ao design (Caminho C) | Protótipo | 60s | obrigatório |
| 11 | Sistema de shapes V2.1 | Protótipo | 60s | **CORTÁVEL** |
| 12 | 5 inovações principais | Protótipo | 90s | obrigatório |
| 13 | Demo ao vivo | Protótipo | 120s | obrigatório |
| 14 | Cobertura heurística + V2 backlog | Protótipo | 30s | **CORTÁVEL** |
| 15 | Entrevistas — método | Entrevistas | 45s | obrigatório |
| 16 | Citações marcantes | Entrevistas | 75s | **CORTÁVEL (parcial)** |
| 17 | Insights + limitações | Entrevistas | 45s | obrigatório |
| 18 | Conclusões + trabalho futuro | Fechamento | 60s | obrigatório |
| 19 | Obrigado + perguntas | Fechamento | 15s | obrigatório |
| 20 | Backup técnico | Apêndice | — | só sob demanda |

### Ordem de corte (se estourar tempo)
1. **Slide 14 (Cobertura)** — 30s. Cobertura já foi insinuada no slide 12.
2. **Slide 11 (Shapes)** — 60s. Resumir em "criamos shapes específicos por mídia" no slide 12.
3. **Slide 16 (Citações)** — reduzir de 75s → 30s mostrando só a citação mais forte.

> Slides marcados com `data-optional="true"` no HTML; navegação ainda passa por eles, mas o apresentador pode usar `→` rapidamente.

---

## GIFs de backup (ordem de apresentação no slide 13 caso demo falhe)

> Localizados em `assets/gifs/`. Reproduzir em sequência se a demo ao vivo travar.

1. `01-mini-acoes.gif` — Mini-ações da home (A3, H7)
2. `02-podcast-shape.gif` — Podcast com onda sonora (A2, H4)
3. `03-busca-tipos.gif` — Busca com filtros por tipo (A5, H7)
4. `04-letras-toggle.gif` — Toggle de letras inline (A4, H5)
5. `05-fila-edit.gif` — Editor de fila (H3, H7)

---

## Notas por slide

> Cada slide tem também um `<aside class="apr-notes">` embutido no HTML com a fala-base.
> Esta seção é apenas o resumo macro para consulta rápida.

### Slide 01 — Capa
Apresentar nome do trabalho, equipe, disciplina. Tom: profissional + leve animação de blobs verdes.

### Slide 02 — Tema e relevância
"Spotify tem 600M+ usuários; pequenos atritos de UX afetam milhões." Citar mercado streaming.

### Slide 03 — Problema e objetivo
Mostrar a pergunta-pesquisa em 1 linha: "Quais heurísticas de Nielsen estão mais comprometidas no Spotify mobile?"

### Slide 04 — Jornada do projeto
Timeline 4 etapas: levantamento → questionário (n=86) → protótipo → entrevistas. Apontar para o passo atual.

### Slide 05 — Heurísticas + instrumento
H3, H4, H5, H7, H8 — escolhidas por aderência a apps de streaming. 24 itens Likert.

### Slide 06 — Amostra (n=86)
De 90 brutos → 86 válidos. Distribuição por idade, plano (free/premium), tempo de uso.

### Slide 07 — Confiabilidade (α=0,961)
α de Cronbach excelente; itens com correlação item-total > 0,4. Heatmap por bloco.

### Slide 08 — Dores (net-score) — **destaque A3**
A3 ("controle e liberdade do usuário") é o net-score mais negativo. Mostrar gráfico.

### Slide 09 — Free × Premium + correlações
Free sofre mais com H5 (anúncios) e H7 (eficiência). Premium ainda sofre com H3.

### Slide 10 — Do dado ao design (Caminho C)
Como cada dor virou requisito → tela. Mapeamento explícito A3→T2, A5→T3, etc.

### Slide 11 — Sistema de shapes V2.1 — **cortável**
Tipo de mídia ganha shape próprio (música/álbum/playlist/artista/podcast/audiobook). Resume identidade visual.

### Slide 12 — 5 inovações principais
1) Mini-ações na home, 2) Onda sonora em podcasts, 3) Busca por tipo, 4) Letras inline, 5) Editor de fila.

### Slide 13 — Demo ao vivo
Abrir T1 (home) e navegar para T2 (player). Tempo: 2min. **Fallback: GIFs.**

### Slide 14 — Cobertura heurística + V2 backlog — **cortável**
9 telas cobrem 5 heurísticas; 4 telas no backlog (V2). Quick visual.

### Slide 15 — Entrevistas — método
4 participantes, roteiro semi-estruturado, gravadas e transcritas, codificação aberta.

### Slide 16 — Citações marcantes — **parcialmente cortável**
3-4 quotes mais fortes. Se cortar: manter apenas a sobre A3.

### Slide 17 — Insights + limitações
Limitação principal: amostra de conveniência. Insight: usuários reconhecem dores antes mesmo da pergunta.

### Slide 18 — Conclusões + trabalho futuro
Reforçar: protótipo cobre 5/5 heurísticas; V2 expande para podcasts/audiobooks; estudo somativo com tarefas medidas.

### Slide 19 — Obrigado + perguntas
Animação de confete verde. Deixar slide aberto durante Q&A.

### Slide 20 — Backup técnico
Modo consulta. Usar se houver pergunta sobre estatística, item-a-item, demografia detalhada.

---

## Checklist final pré-apresentação
- [ ] Servidor rodando: `python3 -m http.server 8000` em `prototipo/`
- [ ] URL aberto: <http://localhost:8000/apresentacao/>
- [ ] Modo fullscreen (`F`)
- [ ] Timer iniciado (`T`)
- [ ] Backup GIFs prontos em `assets/gifs/` (caso demo trave)
- [ ] Notas (`P`) em segunda tela / outro device
- [ ] Conexão Wi-Fi testada para fontes Google
