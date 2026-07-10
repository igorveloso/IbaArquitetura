# escritorio-iza — contexto para o Claude Code

Sistema de automação do escritório de projeto legal da **Izabela (Bebela)**, arquiteta em Belo Horizonte.
Vibe coding com o Igor. Toda comunicação e documentação em **português do Brasil**.

## O que é
Automatiza o trabalho burocrático do escritório. Foco atual: **Bloco 1** (lista de documentação por tipo
de solicitação, a partir do doc da PBH) e **Bloco 2** (checklists dinâmicos Bebela ↔ Letícia).
Bloco 3 descartado (sem API da PBH). Bloco 4 (contratos) adiado.

## Arquitetura em uma olhada (Bloco 1)
- **3 camadas que não se misturam:** Prefeitura (volátil, lida ao vivo) + De-para da Bebela (estável) + Projeto (específico).
- **Padrão A:** lê o Google Doc *publicado* da PBH ao vivo por HTTP (sem login), estrutura via Claude API,
  filtra pelo tipo de solicitação, cruza com o de-para, gera checklist de enquadramento.
- **Padrão B (futuro):** cron + diff, usando o carimbo "ATUALIZADO EM" do rodapé do doc como gatilho.
- Detalhe completo em `docs/02-bloco1-arquitetura.md` e `docs/03-achados-tecnicos.md`.

## Estado atual e dependência crítica
- GET no doc da PBH: **VALIDADO ao vivo** (ver `docs/03-achados-tecnicos.md`).
- **BLOQUEADO no de-para:** aguardando a Bebela enviar a versão dela.
  **NÃO gerar rascunho automático do de-para** (decisão D6) — evita retrabalho de refazer por cima.
- Ainda não há código de aplicação. Só documentação + `scripts/validar-get-pbh.mjs`.

## Onde está o quê
- `docs/01..05` — visão, arquitetura, achados técnicos, de-para, log de decisões.
- Decisões e pendências vivem em `docs/05-log-de-decisoes.md` (não aqui — este arquivo fica curto e estável).
- Contrato de extração (schema JSON) em `docs/03-achados-tecnicos.md`.

## Convenções e comandos
- **Node 18+** (fetch nativo). Rodar a validação: `npm run validar`.
- Segredos em variável de ambiente. `ANTHROPIC_API_KEY` **nunca** commitada — ver `.env.example`; `.env` está no `.gitignore`.
- Stack pretendida: React (Vite) + serverless na Vercel + Claude API. Reaproveitar padrões do Cortinelli NF.

## Regras
- Não commitar `.env` nem chaves de API.
- Antes de mexer no Bloco 1, confirmar se o **de-para já chegou** — sem ele, o passo de cruzamento não roda.
- Mudou uma decisão de rumo? Atualizar `docs/05-log-de-decisoes.md` (não este arquivo).
