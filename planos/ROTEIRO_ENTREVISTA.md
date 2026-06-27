# Roteiro de Entrevista A/B — Protótipo Spotify Redesenhado

**Duração estimada:** 45 minutos · **Formato:** presencial ou remoto com compartilhamento de tela · **Versão:** 2026-06-27 (revisada pós-council)

---

## 1. Objetivo e hipóteses

### Objetivo geral
Comparar a **desejabilidade percebida** e o **desempenho objetivo** do protótipo redesenhado (R) frente a uma reprodução-controle do Spotify atual (C), em quatro fluxos críticos derivados das hipóteses de pesquisa.

### Hipóteses reformuladas (desejabilidade + medidas objetivas)
- **H-T2 (Player / shuffle)**: participantes relatam maior clareza percebida sobre o estado de shuffle/repeat em R, e cometem menos erros de estado ao desligar o modo aleatório.
- **H-T3 (Biblioteca / ações em lote)**: participantes concluem a tarefa de mover múltiplas músicas com menos tentativas em R.
- **H-T5 (Busca em configurações)**: tempo até localizar uma configuração específica é menor em R.
- **H-MA (Reversibilidade)**: taxa de sucesso ao desfazer uma ação destrutiva é maior em R.

Métricas: tempo até conclusão, número de tentativas/erros, confiança autorrelatada (1–5), itens Likert pós-tarefa, SUS final, verbatim.

---

## 2. Perfil do participante

### Critérios de recrutamento (screener)
- Idade 18–45 anos.
- Usuário ativo do Spotify Mobile há ≥6 meses, ≥3 sessões/semana.
- Possui smartphone Android **ou** iPhone próprio.
- Sem deficiência visual não corrigida que impeça uso de tela mobile.
- Não trabalha com UX/Design de produto (evita viés de especialista).

### Amostra-alvo
6–8 participantes, balanceados por gênero e plataforma (Android/iOS).

---

## 3. Setup técnico
- **Dispositivo preferencial:** Android com Chrome (long-press em T3 é mais confiável); iOS Safari como alternativa documentada.
- **Acesso ao protótipo:** URL do GitHub Pages aberta no Chrome do participante; backup local via `ngrok` caso falhe.
- **Gravação:** tela + áudio (OBS no notebook do entrevistador para sessão remota; gravador de tela nativo + microfone externo no presencial). Solicitar consentimento explícito por escrito (TCLE com adendo de coleta).
- **Instrumentação:** log de cliques em `localStorage` (telemetria.js) exportado ao final via console.
- **Ambiente:** sala silenciosa, iluminação adequada; pedir ao participante para silenciar notificações.

---

## 4. Sequência de tarefas (ordem contrabalanceada)

Para evitar **efeito de ordem**, metade dos participantes começa pelo Controle (C) e metade pelo Redesign (R), alternando por tarefa segundo a tabela:

| Participante | T2 | T3 | T5 | MA |
|---|---|---|---|---|
| P1, P3, P5, P7 | C→R | R→C | C→R | R→C |
| P2, P4, P6, P8 | R→C | C→R | R→C | C→R |

Entre as duas versões da mesma tarefa, aplicar **tarefa-distratora curta** (perguntar sobre uso recente do Spotify) para reduzir aprendizado direto.

### Protocolo por tarefa
1. Entrevistador lê o enunciado em voz neutra (sem dicas de localização).
2. Participante executa em pensar-alto.
3. Entrevistador cronometra silenciosamente; intervém apenas após 90s sem progresso.
4. Ao concluir (ou desistir), aplicar Likert pós-tarefa (3 itens) + 1 pergunta de confiança.

### Tarefas

**Tarefa T2 — Estado do modo aleatório (Player)**
> "Esta música está tocando em modo aleatório. Desligue o modo aleatório. Em seguida, me diga o quanto você está confiante de que ele está realmente desligado."

- Medidas: tempo até desligar; nº de toques errados; confiança (1–5).

**Tarefa T3 — Mover múltiplas músicas (Biblioteca)**
> "Você quer organizar sua biblioteca. Selecione estas cinco músicas indicadas e mova todas para outra playlist da sua escolha."

- Medidas: tempo total; nº de tentativas para entrar em modo seleção; erros (deselecionar por engano, ação em item errado).

**Tarefa T5 — Buscar configuração (Configurações)**
> "Encontre, dentro de Configurações, o ajuste relacionado à qualidade do download de músicas."

- Medidas: tempo até abrir a tela correta; método usado (rolagem vs busca, anotado pelo observador).

**Tarefa MA — Desfazer ação destrutiva (Snackbar)**
> "Você acabou de apagar uma música por engano. Recupere essa música."

- Medidas: sucesso (sim/não); tempo até o toque em Desfazer.

---

## 5. Itens Likert pós-tarefa

Escala **1 (discordo totalmente) → 5 (concordo totalmente)**. Formulação neutra, **1 item reverso por bloco** (marcado com *R*).

**Após T2**
1. Foi fácil identificar se o modo aleatório estava ligado ou desligado.
2. *R* Eu precisei adivinhar o que cada ícone significava nesta tela.
3. A resposta do app ao meu toque condiz com o que eu esperava.

**Após T3**
1. Foi claro como selecionar mais de uma música ao mesmo tempo.
2. *R* Senti que precisei repetir passos para conseguir mover as músicas.
3. As ações disponíveis após a seleção atenderam à minha intenção.

**Após T5**
1. O caminho até a configuração que eu procurava foi direto.
2. *R* Tive a impressão de que precisaria conhecer o app de antemão para encontrar essa configuração.
3. A organização das categorias fez sentido para mim.

**Após MA**
1. Foi evidente que eu poderia reverter o que acabei de fazer.
2. *R* Achei que a chance de desfazer iria desaparecer rápido demais.
3. A confirmação após desfazer me deixou seguro de que a ação foi revertida.

---

## 6. SUS — System Usability Scale (pt-BR)

Aplicar apenas **uma vez ao final**, referindo-se ao protótipo redesenhado como um todo. Escala 1–5.

1. Eu gostaria de usar este sistema com frequência.
2. Achei o sistema desnecessariamente complexo.
3. Achei o sistema fácil de usar.
4. Acho que precisaria do apoio de um técnico para conseguir usar este sistema.
5. As várias funções do sistema estavam bem integradas.
6. Achei que havia muita inconsistência neste sistema.
7. Imagino que a maioria das pessoas aprenderia a usar este sistema rapidamente.
8. Achei o sistema atrapalhado de usar.
9. Senti-me confiante ao usar o sistema.
10. Precisei aprender várias coisas antes de conseguir usar este sistema.

---

## 7. Entrevista semiestruturada (≈8 min)

Perguntas abertas, ordem flexível:
1. Conte-me como foi a experiência geral de usar este protótipo.
2. Houve algum momento em que você ficou em dúvida sobre o que aconteceria ao tocar em um botão? Descreva.
3. Que diferenças, se alguma, você notou entre as duas versões que testou?
4. Em que situação do seu dia a dia uma das versões seria mais útil que a outra?
5. Se você pudesse mudar uma coisa em qualquer das versões, o que mudaria?

---

## 8. Comparação direta lado a lado (≈5 min)

**Realizada apenas após todas as tarefas e o SUS**, para não contaminar as medidas anteriores.

Mostrar as duas versões pareadas, uma tarefa por vez:
- "Entre estas duas versões, qual você preferiria usar para [tarefa]? Por quê?"
- "Há algo da versão que você **não** escolheu que você gostaria de ter na outra?"

Registrar verbatim. Evitar a palavra "melhor"; usar "preferiria", "se sentiria mais confortável".

---

## 9. Encerramento e debriefing (≈3 min)
- Explicar que ambas as versões foram protótipos e que respostas críticas são igualmente bem-vindas.
- Esclarecer o destino dos dados (TCC, anonimização, prazo de retenção).
- Perguntar se o participante deseja receber um resumo do estudo.
- Agradecer e encerrar a gravação.

---

## Anexo — Pareamento controle ↔ redesign

| Tarefa | Controle (Spotify atual recriado) | Redesign |
|---|---|---|
| T2 | `telas/controle/t2-atual.html` | `telas/t2.html` |
| T3 | `telas/controle/t3-atual.html` | `telas/t3.html` |
| T5 | `telas/controle/t5-atual.html` | `telas/t5.html` |
| MA | snackbar ausente no controle (toast genérico do sistema) | `telas/t3.html` + `js/telas/ma.js` |

Telas T1 (Home) e T4 (Menu contextual) são apresentadas apenas como **mockups estáticos** ao final da sessão, para coleta de impressões qualitativas sem cronometragem.
