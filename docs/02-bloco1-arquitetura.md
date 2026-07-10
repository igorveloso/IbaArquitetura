# 02 — Arquitetura do Bloco 1

## O reframe fundador

O doc da PBH é um **Google Doc publicado** ("Publicar na web"), servido como HTML público, sem login.
Isso muda tudo: **não é preciso reescrever nem manter cópia sincronizada do doc.** O sistema lê ele
**ao vivo, no momento do uso.** O fato de a prefeitura atualizar o doc constantemente deixa de ser
problema e vira garantia de estar sempre na versão atual.

## As 3 camadas

O material que a Bebela entrega ao cliente é a combinação de três camadas — e elas nunca se misturam:

1. **Camada Prefeitura (genérica, volátil):** quais documentos existem por tipo de solicitação.
   Vem do doc publicado, lido ao vivo.
2. **Camada Bebela (estável):** o conhecimento dela — a tradução de cada exigência jurídica em
   "o que pedir e como obter", em linguagem de cliente leigo. É o **de-para**.
3. **Camada Projeto (específica):** os números reais — área, lote, quarteirão, bairro, dados do cliente.

> Insight-chave: a **prefeitura é a parte volátil**, o **de-para é a parte estável**. Por isso a
> separação: lê-se a fonte viva e cruza-se com o conhecimento guardado, em vez de fixar tudo no código.

## Padrão A vs Padrão B

- **Padrão A — leitura ao vivo, sob demanda (escolhido para o MVP).**
  A cada projeto: escolhe o tipo → GET no doc → estrutura em JSON → filtra pelo tipo → cruza com o
  de-para → checklist de enquadramento → Bebela tica → gera saída. Zero sincronização, zero dado velho.

- **Padrão B — snapshot cacheado + detecção de mudança (futuro).**
  Cron puxa periodicamente, estrutura, salva, faz diff. Avisa a Bebela quando a prefeitura muda algo.
  Serve também de rede de segurança contra falha de extração. O doc traz um carimbo
  "ATUALIZADO EM DD/MM/AAAA" no rodapé, que é o gatilho natural do diff.

## Fluxo ponta a ponta (Padrão A)

1. **Bebela** escolhe o tipo de solicitação (1–6).
2. **Sistema** faz GET no doc PBH ao vivo → estrutura via Claude → filtra pelo tipo.
3. **Sistema** cruza com o de-para → monta a checklist de enquadramento.
4. **Bebela** tica os itens e define o responsável por cada um (cliente / ela / RT).
5. **Sistema** gera o link do cliente + PDF (com branding da Bebela).
6. **Cliente** abre o link (WhatsApp) → preenche campos + foto dos documentos.
7. **Sistema** devolve a resposta estruturada para a Bebela.
8. **Bebela** usa para o briefing/estudo → monta o projeto.

Os passos 5→6 e 6→7 (link vai / resposta volta) são o coração: transformam "cliente manda dado solto"
em "Bebela recebe dado pronto pro briefing".

## Output: página + PDF, do mesmo motor

Como tudo sai da mesma fonte estruturada, a saída tem **dois renderizadores**:

- **Página do cliente (principal):** link único por cliente, sem login, abre pelo WhatsApp/navegador.
  Uma coisa por tela, upload = "tirar foto". Resposta volta estruturada. Fecha o loop.
- **PDF enxuto (fallback):** para clientes que não se viram com a página (ex.: mais velhos). Mesmo dado,
  saída diferente, custo marginal quase zero.

Princípio: **não deixar a minoria ditar o design da maioria.** Constrói a página, mantém o PDF barato,
e só investe pesado em acomodar o segmento idoso se a Bebela confirmar que ele é grande.

### Modo assistido
O mesmo link serve para um filho/parente preencher no lugar do cliente, ou para a própria Bebela
preencher enquanto fala no telefone. O backend não liga para quem preencheu.
