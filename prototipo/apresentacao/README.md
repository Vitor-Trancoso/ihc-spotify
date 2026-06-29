# Apresentação Final IHC — Spotify

Stack: HTML5 + CSS vanilla + JS vanilla. Zero frameworks, zero build.

## Como rodar

```bash
cd prototipo
python3 -m http.server 8000
```

Abra http://localhost:8000/apresentacao/

## Atalhos de teclado

- `→` / `Space` / `PageDown` / `N` — próximo slide
- `←` / `PageUp` — anterior
- `Home` / `End` — primeiro / último
- `1`–`9` — pular para slide
- `F` — fullscreen
- `O` — overview (grade)
- `P` — painel de notas do apresentador
- `T` — timer (20:00 regressivo)
- `R` — reset timer
- `?` — mostrar ajuda

## Deep-link

`http://localhost:8000/apresentacao/#/8` abre direto no slide 8 (útil para Q&A).

## Estrutura

```
apresentacao/
├── index.html              # shell SPA (carrega slides via fetch)
├── css/
│   ├── tokens.css          # @import tokens do protótipo + extras
│   ├── base.css            # reset, layout .slide, tipografia
│   ├── components.css      # .stat-card, .quote, .compare, .heuristic-badge, ...
│   └── animacoes.css       # @keyframes rise/pulse/float/dotPulse/...
├── js/
│   ├── nav.js              # roteador (teclado, click, swipe, hash, progresso)
│   ├── animacoes.js        # countUp, barFill, revealOnEnter, confetti
│   └── apresentador.js     # notas (P) + timer (T)
├── slides/
│   ├── 01-capa.html        # fragmentos HTML, conteúdo do <section>
│   └── ... (20 slides)
├── assets/
│   ├── figuras/            # PNGs da análise
│   ├── screenshots/        # capturas das telas
│   └── gifs/               # fallback da demo
└── notas-apresentador.md   # script paralelo
```

## Estado de implementação

- [x] Fase 1 — Fundação (F1)
- [ ] Fase 2 — Slides paralelos (A–G)
- [ ] Fase 3 — QA e integração final (H + F3)
