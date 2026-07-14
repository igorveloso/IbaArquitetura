# Automação do Escritório — Izabela Braga Arquitetura

Sistema para automatizar o dia a dia burocrático do escritório de projeto legal da Izabela (Bebela).
Codinome de trabalho: **escritorio-iza** (renomeável).

> Este repositório começou como documentação viva das nossas sessões de arquitetura de produto.
> O código entra depois, na mesma casa.

---

## Status atual (10/07/2026)

- Escopo definido: focando **Bloco 1** e **Bloco 2**.
- **Bloco 1** — arquitetura fechada (Padrão A, leitura ao vivo). GET no doc da PBH **validado ao vivo**.
- Gargalo crítico: o **de-para** (conhecimento da Bebela). Aguardando ela enviar a versão dela.
- Ainda não há código de aplicação — só documentação e um script de validação.

## Os 4 blocos (escopo)

| Bloco | O quê | Situação |
|-------|-------|----------|
| 1 | Lista de documentação para o cliente (a partir do doc da PBH) | **Em foco** |
| 2 | Checklists dinâmicos de projeto (ciclo Bebela ↔ Letícia) | Em foco (próximo) |
| 3 | Acompanhamento de processos no gov.br/PBH | **Descartado** (sem API) |
| 4 | Contratos e propostas comerciais | Adiado (caminho já conhecido) |

## Índice da documentação

- [`docs/01-visao-geral.md`](docs/01-visao-geral.md) — problema, atores, os 4 blocos, fluxo de trabalho da Bebela
- [`docs/02-bloco1-arquitetura.md`](docs/02-bloco1-arquitetura.md) — as 3 camadas, Padrão A/B, fluxo ponta a ponta, output
- [`docs/03-achados-tecnicos.md`](docs/03-achados-tecnicos.md) — validação do GET, contrato de extração, achados do doc da PBH
- [`docs/04-de-para.md`](docs/04-de-para.md) — o que é, esqueleto sugerido, status (aguardando Bebela)
- [`docs/05-log-de-decisoes.md`](docs/05-log-de-decisoes.md) — registro das decisões com data
- [`docs/06-gestao-de-issues.md`](docs/06-gestao-de-issues.md) — como pedir funcionalidades e reportar bugs (esteiras, labels, contrato de API)

## Artefatos

- `scripts/validar-get-pbh.mjs` — valida o GET no doc publicado + estruturação via Claude API

## Stack pretendida (provisória)

Frontend/página do cliente e painel da Bebela em React (Vite). Backend leve tipo Next.js API routes ou
serverless na Vercel. Estruturação do doc via Claude API. Geração de PDF/branding. Padrão de reaproveitar
o que já foi feito no Cortinelli NF.
