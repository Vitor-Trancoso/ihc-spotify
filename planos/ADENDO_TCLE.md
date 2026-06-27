# Adendo ao Termo de Consentimento Livre e Esclarecido (TCLE)

**Projeto:** Avaliação de usabilidade e redesign do aplicativo Spotify Mobile
**Vínculo:** Adendo ao TCLE original aprovado na primeira fase do estudo
**Versão do adendo:** 1.0
**Data:** 27 de junho de 2026
**Número CAAE:** __________________________ (a preencher após apreciação do CEP)

---

## 1. Identificação

Este documento constitui adendo ao Termo de Consentimento Livre e Esclarecido (TCLE) originalmente assinado pelo(a) participante na primeira fase desta pesquisa, que teve como objetivo levantar dificuldades de uso do aplicativo Spotify. Permanecem válidas todas as cláusulas do TCLE original, ficando este adendo responsável apenas por descrever os procedimentos adicionais relativos à segunda fase do estudo.

## 2. Justificativa da extensão

A primeira fase identificou pontos críticos de usabilidade no Spotify Mobile. A segunda fase visa avaliar empiricamente um protótipo de redesign de alta fidelidade construído em HTML/CSS/JavaScript, comparando-o com a versão atual do aplicativo. Sua participação é essencial para validar (ou refutar) as hipóteses de melhoria propostas.

## 3. Procedimentos adicionais

Caso aceite participar desta nova fase, você será convidado(a) a:

a) **Uso do protótipo** — interagir, em sessão presencial ou remota com duração estimada de 45 minutos, com um protótipo web rodando em navegador (smartphone ou desktop simulando viewport mobile). Serão executadas tarefas guiadas envolvendo telas de Home, Player, Biblioteca, Menu Contextual e Configurações, tanto na versão de redesign quanto na versão-controle "Spotify atual".

b) **Gravação de tela e áudio** — a sessão será gravada (captura da tela do dispositivo + áudio do participante) para posterior análise dos pesquisadores. Não há captura de vídeo da face.

c) **Instrumentação automática (logs)** — o protótipo registrará, em armazenamento local do navegador (localStorage), eventos de interação sem identificação pessoal. Os campos coletados são exatamente:
- `participant_id` (código alfanumérico anônimo atribuído pelo pesquisador)
- `task_id` (identificador da tarefa em execução)
- `event_type` (clique, long-press, scroll, navegação entre telas)
- `target_element` (identificador do elemento da interface, ex.: "btn_play")
- `timestamp_ms` (carimbo temporal em milissegundos desde o início da tarefa)
- `task_start_ts`, `task_end_ts` (início e fim de cada tarefa)
- `task_completed` (booleano: tarefa concluída ou abandonada)
- `error_count` (número de ações desfeitas ou caminhos errados)
- `viewport_size` (largura x altura do dispositivo)
- `user_agent` (string do navegador, sem IP)

Não são coletados: nome, e-mail, geolocalização, contatos, dados biométricos, conteúdo de áudio escutado fora da sessão ou qualquer informação de contas reais do Spotify.

d) **Questionários** — ao final, você responderá à escala SUS (System Usability Scale, 10 itens), a um questionário Likert de 5 pontos sobre satisfação específica e a perguntas abertas sobre sua experiência.

## 4. Riscos e desconfortos

Os riscos são considerados mínimos. É possível que você experimente leve frustração ao realizar tarefas em uma interface desconhecida ou ao não conseguir concluir uma tarefa. Você poderá **pausar ou interromper a sessão a qualquer momento**, sem necessidade de justificativa e sem qualquer prejuízo. Caso deseje, pausas para descanso serão oferecidas entre os blocos de tarefas.

## 5. Benefícios

Sua participação contribuirá para a produção de conhecimento aplicado em Interação Humano-Computador, especificamente sobre usabilidade de aplicativos de streaming de áudio em dispositivos móveis. Não há benefício financeiro direto. Os achados poderão subsidiar futuras melhorias em interfaces similares.

## 6. Confidencialidade e tratamento dos dados

Todos os dados serão tratados de forma **anônima**. O `participant_id` é gerado aleatoriamente e não permite reidentificação. As gravações de tela e áudio, bem como os logs exportados do localStorage, serão armazenados em repositório criptografado de acesso restrito à equipe de pesquisa, pelo prazo de **5 (cinco) anos** após o término do estudo, conforme Resolução CNS 466/2012. Findo esse prazo, os arquivos serão descartados de forma irreversível (exclusão segura). Resultados agregados poderão ser publicados em artigos científicos, sem que seja possível identificar participantes individualmente.

## 7. Direito de retirada

Você poderá retirar seu consentimento **a qualquer momento**, antes, durante ou após a sessão, sem necessidade de justificativa e sem qualquer prejuízo. Nesse caso, todos os dados associados ao seu `participant_id` serão excluídos do banco de dados da pesquisa, mediante solicitação por e-mail aos pesquisadores.

## 8. Contato dos pesquisadores

- **Pesquisador responsável:** ____________________________________
- **Instituição:** ____________________________________
- **E-mail:** ____________________________________
- **Telefone:** ____________________________________
- **Comitê de Ética em Pesquisa (CEP):** ____________________________________

## 9. Aprovação ética

Este adendo será submetido à apreciação do Comitê de Ética em Pesquisa (CEP) responsável pelo projeto, conforme exigem as Resoluções CNS 466/2012 e 510/2016. O número CAAE atualizado constará no topo deste documento após aprovação.

## 10. Declaração de consentimento e assinaturas

Declaro que li (ou me foi lido) o presente adendo, compreendi seu conteúdo, esclareci minhas dúvidas e concordo voluntariamente em participar da segunda fase do estudo nos termos descritos.

Local e data: ______________________________________________

____________________________________________
Assinatura do(a) participante

____________________________________________
Assinatura do(a) pesquisador(a) responsável

*Este adendo é emitido em duas vias de igual teor: uma para o participante e outra para o pesquisador.*
