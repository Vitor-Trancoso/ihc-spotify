# Relatório de Análise de Dados — Avaliação de Usabilidade Spotify Mobile
**Disciplina:** Interação Humano-Computador (IHC) — 2026/1
**Equipe 01:** Filipe Brito · Paulo Victor · João Vitor · Renan Camara · Vitor Marconi
**Sistema avaliado:** Aplicativo móvel Spotify (iOS/Android)
**Instrumento:** Questionário Likert 1–5 com 24 itens mapeados em 5 heurísticas de Nielsen (H3, H4, H5, H7, H8) + 3 perguntas abertas
**Metodologia:** Pipeline do Território n. 04 (Sergio Freitas / IHC-UnB): Descritiva → Cronbach → Correlação de Pearson → Apriori
**Pipeline implementado em Python (NumPy/Pandas), espelhando o `exemplo.R` do professor.**

---

## 1. Amostra

| Métrica | Valor |
|---|---|
| Respostas brutas no formulário | 90 |
| Não consentiram com TCLE | 1 |
| Nunca usaram Spotify | 1 |
| Respostas em branco/descartadas | 2 |
| **Respondentes válidos analisados** | **86** |

### Perfil demográfico (n=86)

| Variável | Categoria predominante | % |
|---|---|---:|
| Faixa etária | 18 a 24 anos | 66,3% |
| Escolaridade | Superior cursando | 62,8% |
| Frequência de uso | Todos os dias (ou quase) | 74,4% |
| Horas/semana | 1 a 5 horas | 44,2% |
| Tipo de conta | Premium (Pago) | 80,2% (67+2) |

**Implicação para validade:** amostra fortemente enviesada para usuários jovens, universitários, frequentes e pagantes. Resultados são robustos para esse perfil, mas a generalização para o público total do Spotify exige cautela. Conclusões sobre o plano Free dependem de uma sub-amostra pequena (n=17).

---

## 2. Estatística Descritiva

### 2.1 Score médio por bloco (heurística)

| Bloco (Heurística) | Média | DP | Mediana | % Baixo (≤2.5) | % Alto (≥3.5) |
|---|---:|---:|---:|---:|---:|
| **H4 — Consistência e Padrões** | **3,71** | 0,94 | 3,80 | 11,6% | 62,8% |
| **H8 — Estética e Minimalismo** | 3,53 | 0,98 | 3,75 | 19,8% | 59,3% |
| **H7 — Flexibilidade e Eficiência** | 3,46 | 0,92 | 3,60 | 15,1% | 53,5% |
| **H3 — Controle e Liberdade** | 3,45 | 0,91 | 3,50 | 14,0% | 52,3% |
| **H5 — Prevenção de Erros** | **3,38** | 0,86 | 3,40 | 12,8% | 47,7% |

**Leitura:** todos os blocos ficam **acima do ponto neutro (3,0)**, ou seja, em média os usuários avaliam o Spotify como **adequado** nas cinco dimensões. A heurística mais bem avaliada é **H4 (Consistência)** e a pior é **H5 (Prevenção de Erros)**. Nenhum bloco apresentou média ≤ 3, o que **contraria parcialmente as hipóteses do Trabalho 1**, que previam violações sistemáticas nessas cinco heurísticas.

### 2.2 Itens com pior desempenho (sinais de problemas reais)

| Item | Heurística | Média | % Baixo |
|---|---|---:|---:|
| A3 — Desfazer ação em playlist | H3 | **2,58** | **46,5%** |
| D5 — Telas livres de poluição | H7→H8 | 2,91 | 33,3% |
| C2 — Posicionamento dos controles evita toque errado | H5 | 2,92 | 28,6% |
| E4 — Home relevante (sem promoções em excesso) | H8 | **2,99** | **40,7%** |
| B5 — Comportamento previsível dos botões | H4 | 3,06 | 27,5% |
| E1 — Sem distrações | H8 | 3,08 | 36,0% |

**Esses 6 itens são as falhas concretas de usabilidade detectadas.** Note que **A3 (desfazer playlist)** tem 46,5% de avaliações baixas — é o ponto mais crítico do app. Também há um padrão claro: **a Home (E4) e a tela em geral (E1, D5) são vistas como poluídas**, confirmando a hipótese de violação de H8.

### 2.3 Itens com melhor desempenho

| Item | Heurística | Média |
|---|---|---:|
| E2 — Informação importante visível | H8 | **4,26** |
| B2 — Ícones com significado esperado | H4 | 4,12 |
| B1 — Semelhança com outros apps | H4 | 3,87 |
| D1 — Ações rápidas e atalhos | H7 | 3,81 |
| E3 — Estética agradável | H8 | 3,81 |

**Leitura:** Os fundamentos de affordance (ícones, hierarquia visual, semelhança com outros apps) funcionam bem. As notas baixas se concentram em **comportamentos** (desfazer, poluir, atrapalhar), não em **aparência**.

---

## 3. Alpha de Cronbach (Confiabilidade do Instrumento)

| Construto | α | n (listwise) | Interpretação |
|---|---:|---:|---|
| **Questionário global (24 itens)** | **0,961** | 18 | **Excelente** |
| H3 — Controle e Liberdade | 0,849 | 23 | Bom |
| H4 — Consistência e Padrões | 0,785 | 51 | Aceitável |
| H5 — Prevenção de Erros | **0,672** | 46 | **Questionável** |
| H7 — Flexibilidade e Eficiência | 0,736 | 66 | Aceitável |
| H8 — Estética e Minimalismo | 0,809 | 86 | Bom |

**Limiar do professor: α > 0,7 = bom.**

**Conclusões:**
- **Quatro dos cinco blocos têm α aceitável ou superior**: o instrumento é confiável para H3, H4, H7 e H8.
- **H5 (Prevenção de Erros) ficou em 0,672 — abaixo do limiar.** Isso indica que os 5 itens do bloco H5 não medem um construto totalmente coeso. Possivelmente o item **C5 (TocaRapido — "consigo tocar música rapidamente")** está mais ligado a *eficiência (H7)* do que a *prevenção de erros (H5)*, puxando o alpha para baixo. Recomendação: mover C5 para H7 em iterações futuras.
- **α global = 0,961 é altíssimo**, mas calculado sobre apenas n=18 (listwise deletion eliminou todos os respondentes com ao menos uma omissão). Esse valor confirma que todos os itens medem coerentemente um construto único de "usabilidade percebida".

---

## 4. Correlação de Pearson

### 4.1 Matriz entre blocos (`pairwise.complete.obs`)

```
                  H3    H4    H5    H7    H8
H3_Controle      1.000 0.691 0.560 0.640 0.693
H4_Consistencia  0.691 1.000 0.691 0.718 0.714
H5_Prevencao     0.560 0.691 1.000 0.685 0.675
H7_Flexibilidade 0.640 0.718 0.685 1.000 0.802
H8_Estetica      0.693 0.714 0.675 0.802 1.000
```

**symnum (limiares 0.3/0.6/0.8/0.9/0.95 — `.`,`,`,`+`,`*`,`B`):**
```
H3 H4 H5 H7 H8
H3  B  ,  .  ,  ,
H4  ,  B  ,  ,  ,
H5  .  ,  B  ,  ,
H7  ,  ,  ,  B  +
H8  ,  ,  ,  +  B
```

### 4.2 Pares de blocos ordenados por |r|

| Par | r | Interpretação |
|---|---:|---|
| **H7 ↔ H8** | **+0,802** | **Forte** |
| H4 ↔ H7 | +0,718 | Forte |
| H4 ↔ H8 | +0,714 | Forte |
| H3 ↔ H8 | +0,693 | Moderada |
| H4 ↔ H5 | +0,691 | Moderada |
| H3 ↔ H4 | +0,691 | Moderada |
| H5 ↔ H7 | +0,685 | Moderada |
| H5 ↔ H8 | +0,675 | Moderada |
| H3 ↔ H7 | +0,640 | Moderada |
| H3 ↔ H5 | +0,560 | Moderada |

**Insight central:** **H7 (Flexibilidade) e H8 (Estética/Minimalismo) caminham juntas (r=0,802)**. Usuários que percebem o app como eficiente para tarefas também o percebem como visualmente limpo — e vice-versa. Isso reforça a hipótese do Trabalho 1 de que **estética e eficiência estão ligadas via "poluição visual"**: quando a interface está sobrecarregada de promoções e recomendações irrelevantes, o usuário sente tanto fricção visual quanto perda de eficiência.

### 4.3 Top correlações item-a-item (|r| ≥ 0,7)

| Item A | Item B | r |
|---|---|---:|
| A1 — Voltar tela anterior | C5 — Toca música rápido | +0,774 |
| B4 — Achar após atualização | C2 — Controles bem posicionados | +0,752 |
| C2 — Controles bem posicionados | D5 — Telas limpas | +0,750 |
| B3 — Layout consistente | E3 — Estética agradável | +0,723 |
| A1 — Voltar tela anterior | E2 — Info visível | +0,714 |

**Padrão:** os itens mais correlacionados atravessam as fronteiras dos blocos — *controle*, *consistência* e *estética* formam um cluster único na percepção do usuário, o que justifica o α global tão alto.

---

## 5. Regras de Associação (Apriori)

Discretização: 1–2 = **Baixo**, 3 = **Neutro**, 4–5 = **Alto**.

### 5.1 Regras entre blocos (sup ≥ 0,10 · conf ≥ 0,60 · 90 regras)

| Regra (Se → Então) | Sup | Conf | Lift |
|---|---:|---:|---:|
| **H4 = Baixo → H7 = Baixo** | 0,10 | **0,90** | **5,95** |
| **H7 = Baixo → H4 = Baixo** | 0,10 | 0,69 | 5,95 |
| H7 = Baixo → H8 = Baixo | 0,12 | 0,77 | 3,89 |
| H5 = Alto ∧ H8 = Alto → H7 = Alto | 0,36 | **0,91** | 1,70 |
| H3 = Alto ∧ H8 = Alto → H7 = Alto | 0,35 | 0,86 | 1,60 |
| H4 = Alto ∧ H5 = Alto → H7 = Alto | 0,33 | 0,85 | 1,59 |

**Leitura:**
- **A pior associação revelada:** *quando o usuário acha o app inconsistente (H4 baixa), é 5,95× mais provável que também o ache pouco eficiente (H7 baixa)*. Isso é uma confirmação empírica das hipóteses cruzadas do Trabalho 1: inconsistência destrói a eficiência percebida.
- Quando H4, H5, H8 são todas altas, H7 fica alta em 85–91% dos casos — ou seja, **eficiência percebida (H7) é consequência das outras três**, não causa independente.

### 5.2 Regras entre itens (sup ≥ 0,20 · conf ≥ 0,80 · 1.030 regras)

| Regra (Se → Então) | Sup | Conf | Lift |
|---|---:|---:|---:|
| **D5 (Telas limpas) = Baixo → E1 (Sem distrações) = Baixo** | 0,23 | **0,91** | 2,52 |
| **B3 (Layout consistente) = Baixo → A3 (Desfazer playlist) = Baixo** | 0,21 | 0,86 | 2,23 |
| C4 (Aviso perda) Alto ∧ E1 Alto → E4 (Home relevante) Alto | 0,22 | **1,00** | 2,39 |
| A4 (Cancelar) Alto ∧ E4 Alto → E1 Alto | 0,29 | 0,89 | 2,13 |
| **D5 Baixo → E4 (Home) Baixo** | 0,21 | 0,82 | 2,01 |

**Insights:**
- **Quem percebe a tela como poluída percebe a Home como irrelevante** (D5 baixa ⇒ E4 baixa, conf 82%). Os dois itens mais reclamados se reforçam — é o **núcleo do problema H8**.
- **Inconsistência de layout (B3 baixa) prevê dificuldade em desfazer (A3 baixa)** com 86% de confiança. Esta é a melhor confirmação empírica de que **a violação de H4 prejudica diretamente H3** no Spotify.

---

## 6. Análise Qualitativa (Respostas Abertas)

Codificação completa em [`codificacao_qualitativa.md`](codificacao_qualitativa.md). Resumo das categorias mais citadas:

| Tema | Menções | % dos válidos |
|---|---:|---:|
| Excesso de propaganda no Free | 14 | 16,3% |
| **H8 — Poluição visual / excesso de informação** | 13 | 15,1% |
| **H7 — Recomendações inadequadas** | 11 | 12,8% |
| Performance (travamentos, lentidão) | 10 | 11,6% |
| **H7 — Gestão de playlists/biblioteca ineficiente** | 9 | 10,5% |
| **H3 — Ações irreversíveis** (apagar, fechar busca) | 5 | 5,8% |
| **H4 — Mudanças de layout desorientam** | 4 | 4,7% |

**Citações-chave:**
- *"Já limpei sem querer a barra de pesquisa e não consegui reverter."* — E51 (H3)
- *"Não conseguia encontrar meus artistas salvos, após uma atualização de overhaul do visual."* — E02 (H4)
- *"Não ter como transferir músicas de uma playlist para a outra facilmente, tem q fazer uma a uma."* — E03 (H7)
- *"Deixaria o Spotify mais limpo. São muitas informações desnecessárias."* — E19 (H8)
- *"Apenas algumas operações que não podem ser desfeitas, como apagar música de playlist."* — E83 (H3)

---

## 7. Discussão Integrada: As Hipóteses do Trabalho 1 vs. os Resultados

| Hipótese (Trab. 1) | Score do bloco | α | Evidência qualitativa | Veredito |
|---|---:|---:|---|---|
| **H3** Controle/Liberdade violada | 3,45 | 0,85 | 5 menções (apagar irreversível, busca limpa) | **Confirmada parcialmente** — item A3 (desfazer playlist) com 46,5% de avaliações baixas é a evidência mais forte |
| **H4** Consistência violada | **3,71** | 0,79 | 4 menções (atualizações desorientam) | **Não confirmada** no agregado, mas a inconsistência **se manifesta quando o app atualiza o layout** |
| **H5** Prevenção de Erros violada | 3,38 | **0,67 ⚠️** | 3 menções (curtir vs adicionar) | **Confirmada parcialmente** — pior média entre blocos; alpha questionável sugere reestruturação do construto |
| **H7** Flexibilidade/Eficiência violada | 3,46 | 0,74 | 11 menções (playlists, recomendações) | **Confirmada** — segundo tema mais citado nas respostas abertas |
| **H8** Estética/Minimalismo violada | 3,53 | 0,81 | 13 menções (poluição visual da Home) | **Confirmada** — itens E4 (Home) e E1 (Sem distrações) com 40% de avaliações baixas; tema mais citado entre heurísticas |

### Síntese

1. **As hipóteses do Trabalho 1 sobre H7 e H8 são as mais corroboradas** pelos dados quantitativos e qualitativos. A "poluição visual da Home" (E4 = 2,99 / 40,7% baixo) e a "ineficiência na gestão de playlists" (D3 = 3,37) são problemas reais e consensuais.

2. **H3 é confirmada pontualmente, não no conjunto**: o app oferece bom controle no geral (A4=3,62; A5=3,79), mas falha em um ponto específico — **desfazer ações em playlists (A3 = 2,58)**.

3. **H5 é o bloco com pior score médio**, mas com baixa confiabilidade interna (α=0,67). Os relatos qualitativos sugerem que o problema é específico: **confusão entre "curtir" e "adicionar a playlist"**.

4. **H4 (Consistência) não é violada no agregado**, mas é vulnerável a redesigns/atualizações do app — múltiplos respondentes citaram desorientação após updates de UI.

5. **Surpresa fora do escopo das heurísticas:** o **excesso de propaganda no Free** (16,3% das menções) é o tema #1 dos comentários abertos, embora não seja uma das 10 heurísticas. Isso é uma escolha de modelo de negócio que **degrada a experiência percebida** independente das heurísticas clássicas.

### Insights estatísticos não previstos

- **H7 e H8 estão fortemente associadas (r=0,802)**: estética e eficiência percebida são, na prática, **uma só dimensão** para o usuário do Spotify. Redesigns que reduzirem a poluição visual também melhorarão a percepção de eficiência.
- **Regra Apriori H4=Baixo → H7=Baixo (lift 5,95)** é a associação mais forte entre violações: **inconsistência destrói eficiência** com 90% de confiança.
- **Regra B3=Baixo → A3=Baixo (lift 2,23)**: usuários que percebem o layout como inconsistente também têm dificuldade de desfazer ações — sugerindo que a violação de H4 **causa** violações em H3.

---

## 8. Recomendações de Design (priorizadas por evidência)

| # | Mudança | Justificativa quantitativa | Esforço |
|---|---|---|---|
| 1 | **Botão "Desfazer" persistente em ações de playlist** | A3 = 2,58 (pior item); 46,5% de avaliações baixas; relatos diretos | Baixo |
| 2 | **Reduzir conteúdo promocional na Home** | E4 = 2,99 (40,7% baixo); 13 menções qualitativas | Médio |
| 3 | **Separar visualmente "Curtir" e "Adicionar a playlist"** | Bloco H5 com pior α e menor média; relatos de E08, E13 | Baixo |
| 4 | **Modo "minimalista" da tela inicial** | Correlação D5↔E1↔E4 (r > 0,6); pedido recorrente nos abertos | Médio |
| 5 | **Seleção múltipla em playlists (mover/remover em lote)** | Relato direto de E03, E51, E86; bloco H7 | Médio |
| 6 | **Confirmação opcional antes de updates de UI radicais** | E02, E20, E59 — atualizações desorientam usuários veteranos | Alto |

---

## 9. Limitações Metodológicas

- **Amostra enviesada** para 18–24 anos, Premium, uso diário (essa coorte tende a ser **mais tolerante** ao Spotify por familiaridade — viés conservador, isto é, problemas reais podem ser **subestimados**).
- **n=18 efetivo no α global** por listwise deletion — vários respondentes pularam itens; análises por bloco preservaram mais dados (n=23–86).
- **α de H5 abaixo de 0,7** indica que o construto "Prevenção de Erros" como medido aqui não é coeso. Recomenda-se rever a redação dos itens C2 e C5 em futuras rodadas.
- **Não houve item de atenção** no .xlsx exportado (estava no questionário em PDF mas não nos dados recebidos) — não foi possível filtrar respondentes desatentos.
- **Discretização Likert→Baixo/Neutro/Alto** para o Apriori perde granularidade; resultados são qualitativamente válidos mas não usam toda a informação ordinal.

---

## 10. Arquivos da Análise

Pasta: `docs/analise/`

| Arquivo | Conteúdo |
|---|---|
| `analise.py` | Script Python com pipeline completo (descritiva, Cronbach, Pearson, Apriori) |
| `analise.R` | Versão R equivalente (não executada — espelha `exemplo.R`) |
| `dados.csv` | 86 respondentes × 30 variáveis, separador `;` |
| `respostas_abertas.csv` | Q33/Q34/Q35 + demografia mínima |
| `saida_descritiva_itens.csv` | Média/DP/% por item |
| `saida_descritiva_blocos.csv` | Média/DP/% por bloco |
| `saida_corr_blocos.csv` | Matriz de correlação 5×5 |
| `saida_corr_fortes.csv` | Correlações item-a-item |r| ≥ 0,5 |
| `saida_apriori_blocos.csv` | 90 regras (blocos) |
| `saida_apriori_itens.csv` | 1.030 regras (itens) |
| `saida_log.txt` | Log completo da execução |
| `saida_resumo.json` | Resumo em JSON p/ uso programático |
| `codificacao_qualitativa.md` | Codificação das respostas abertas |
| `RELATORIO_ANALISE.md` | Este arquivo |
