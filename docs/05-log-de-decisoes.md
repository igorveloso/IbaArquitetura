# 05 — Log de Decisões

Registro cronológico das decisões, para não se perder entre conversas.

## 2026-07-10

- **D1 — Bloco 3 descartado.** Acompanhamento de processos na PBH depende de portal autenticado sem API
  pública. Sem expectativa de a prefeitura liberar API. Fora de escopo.
- **D2 — Bloco 4 adiado.** Contratos/propostas são construíveis e de alto retorno, mas o caminho já é
  conhecido pelo Igor. Fica para depois.
- **D3 — Foco em Bloco 1 e Bloco 2.** Começando pelo Bloco 1.
- **D4 — Bloco 1 usa Padrão A (leitura ao vivo).** O doc da PBH é lido ao vivo a cada projeto e cruzado
  com o de-para. Padrão B (snapshot + detecção de mudança) fica para uma fase posterior, aproveitando o
  carimbo "ATUALIZADO EM" do rodapé como gatilho.
- **D5 — Output = página do cliente (principal) + PDF (fallback), do mesmo motor.** Página fecha o loop
  com resposta estruturada; PDF cobre clientes que não se viram com a página (ex.: mais velhos). Não
  deixar a minoria ditar o design da maioria; validar o tamanho do segmento idoso com a Bebela antes de
  investir pesado em acessibilidade.
- **D6 — O de-para vem da Bebela.** Ela já tem o conhecimento meio pronto. Decidido **não** gerar
  rascunho automático, para evitar retrabalho de refazer por cima. Aguardando ela enviar.
- **D7 — Documentação no GitHub.** Projeto de software; docs versionados ao lado do código. Notion
  eventualmente como espelho de leitura, não como fonte da verdade.
- **D8 — Repo criado e preparado para o Claude Code.** Adicionados `CLAUDE.md` (raiz, curto e estável,
  apontando para os `docs/`), `.gitignore` (protege `.env`), `.env.example` e `package.json` mínimo.
  Ao abrir o repo no Claude Code, o `CLAUDE.md` é lido automaticamente no início da sessão.

## 2026-07-14

- **D9 — Gestão de demandas via GitHub Issues, em duas esteiras.** Funcionalidades (esteira `ideia →
  validado → constrói`, uso Igor + Bebela) e bugs (esteira `bug + urgência`, uso de todo o escritório),
  cada uma com seu formulário em `.github/ISSUE_TEMPLATE/`. Labels versionadas em `.github/labels.json`
  e sincronizadas por Action. Toda demanda vira issue — registro único, sem planilha paralela. O quadro
  visual (GitHub Projects) é passo manual único. Reporte de bug será feito **de dentro da plataforma**
  (futura) via função serverless → GitHub API; o contrato desse fluxo está em
  [`06-gestao-de-issues.md`](06-gestao-de-issues.md). O formulário web fica como porta de emergência.

- **D10 — Primeiro código de aplicação: o Painel Bebela.** Implementado o protótipo "Painel Bebela.dc.html"
  (projeto Claude Design "Plataforma de gestão para arquiteta") como app real em `app/painel-bebela/`.
  Decidido portar como **HTML único autossuficiente + JS vanilla** (sem build), trocando o runtime
  `DCLogic` do Claude Design por um mini-render próprio, e mantendo a lógica de negócio do protótipo.
  Persistência local (`localStorage`) por ora — backend/sincronização e auth ficam para depois. É um
  quadro de gestão de projetos (5 telas), separado da esteira de Bugs/Funcionalidades do D9.

## Validações registradas

- **GET no doc da PBH: CONFIRMADO ao vivo** (10/07/2026). Ver [`03-achados-tecnicos.md`](03-achados-tecnicos.md).

## Pendências / próximos passos

- [ ] Bebela enviar o de-para.
- [ ] Encaixar o de-para no schema e cruzar com os ~73 documentos.
- [ ] Explorar o Bloco 2 (checklists dinâmicos Bebela ↔ Letícia).
- [ ] (Futuro) Desenhar telas reais do Bloco 1 e a página do cliente.
- [ ] (Futuro) Padrão B — cron + diff + alerta de mudança.
