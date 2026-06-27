# Protótipo Spotify IHC

Protótipo navegável do redesign do Spotify Mobile usado nas entrevistas IHC do TCC.
Stack: **HTML5 + CSS vanilla + JS vanilla** (zero build, zero npm).
Viewport alvo: **375 × 812** (iPhone X/11/12/13/14). Funcional em 360–414 (Android).

## Como rodar

```bash
cd prototipo
python3 -m http.server 8000
# abrir http://localhost:8000 no Chrome (DevTools → Toggle Device Toolbar → 375x812)
```

Para apresentar em celular real na mesma rede:
```bash
# descubra o IP do Mac
ipconfig getifaddr en0
# abra http://<ip-do-mac>:8000 no celular
```

## Estrutura

```
prototipo/
├── index.html              # roteador / galeria de telas
├── css/
│   ├── tokens.css          # variáveis de design (cores, type, spacing, easing)
│   ├── base.css            # reset moderno + defaults
│   ├── components.css      # bottom-nav, mini-player, snackbar, sheet, song-row, chip…
│   └── telas/              # CSS específico por tela (t1..t5, ma)
├── js/
│   ├── app.js              # roteador hash-based + iframe loader
│   ├── mock-data.js        # MOCK global (user, playlists, músicas, podcasts…)
│   ├── telemetria.js       # registra cliques em localStorage + exporta CSV
│   └── telas/              # JS específico por tela
├── telas/
│   ├── t1.html ... t5.html         # redesign
│   ├── ma.html                     # modal Snackbar Desfazer
│   └── controle/t1-atual.html ...  # versões "Spotify atual"
└── assets/
    ├── icons/              # SVGs Lucide (baixados quando necessário)
    └── images/             # capas mock (a maioria via Picsum)
```

## Mapa de telas

| Rota                | ID  | Status      | Hipótese | Descrição |
|---------------------|-----|-------------|----------|-----------|
| `#/t1`              | T1  | Mockup      | H3       | Home minimalista (Compacto/Descobrir) |
| `#/t2`              | T2  | Interativo  | H7       | Player com Shuffle/Smart Shuffle/Repeat claros |
| `#/t3`              | T3  | Interativo  | H5       | Biblioteca + seleção múltipla (long-press) |
| `#/t4`              | T4  | Mockup      | H5       | Menu da música em bottom sheet com 4 grupos |
| `#/t5`              | T5  | Interativo  | H8       | Configurações com busca incremental |
| `#/ma`              | MA  | Interativo  | H5       | Snackbar "Desfazer" com countdown |
| `#/controle/t1..t5` | —   | Mockup      | —        | Versões "Spotify atual" pareadas |

## Telemetria

Cada tela registra cliques chamando `Telemetria.log(tela, alvo, meta)`.
Para exportar a sessão atual:
```js
Telemetria.downloadCSV();   // baixa telemetria-<timestamp>.csv
Telemetria.listar();        // array em memória
Telemetria.clear();         // zera tudo
```

## Instruções para o entrevistador

1. Abrir `http://localhost:8000` no celular (ou no notebook em modo dispositivo 375×812).
2. Apresentar **uma tela do redesign** seguida da **versão controle correspondente** (ou vice-versa, alternar a ordem entre participantes).
3. Para cada tela, ler a tarefa do roteiro (ver `planos/PLANO_PROTOTIPO.md` §7).
4. **Não dar dicas**. Anotar verbalização (think-aloud), tempo até sucesso, número de toques errados.
5. Depois de cada par redesign/controle, aplicar Likert (1–7): "Quão fácil foi completar a tarefa?" + "Qual versão você prefere?"
6. Ao final, aplicar SUS completo (10 itens) sobre o conjunto do redesign.
7. Exportar o CSV de telemetria do dispositivo (`Telemetria.downloadCSV()` via console) e arquivar com o ID do participante.

## Decisões de design

- **Tema escuro fixo** (sem light mode).
- **Tipografia Inter** (Google Fonts) — não usar Spotify Circular (proprietária).
- **Cores fixas** em `tokens.css` (sem color-extract de imagens — evita CORS).
- **Long-press em T3** testado em Android Chrome; sem `navigator.vibrate` (feedback só visual).
- **Ícones Lucide** via CDN (`https://unpkg.com/lucide-static`) ou SVG inline.

## Limitações conhecidas

- Áudio não toca (é um protótipo visual).
- Algumas capas dependem do Picsum (precisa de internet).
- T1 e T4 são mockups estáticos por decisão do council (priorização de fidelidade nas telas mais interativas).
