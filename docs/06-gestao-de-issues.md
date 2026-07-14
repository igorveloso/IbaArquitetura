# 06 — Gestão de funcionalidades e bugs (GitHub Issues)

Como o escritório vai **pedir coisas novas** e **reportar erros**, tudo dentro do GitHub, sem planilha
paralela. Duas esteiras separadas, cada uma com seu formulário e seu ciclo de vida.

> Regra de ouro: **toda demanda vira uma issue.** É o registro único. Nada de "me manda no WhatsApp e
> eu anoto". Se virou issue, não se perde.

---

## As duas esteiras

### 🐛 Bugs — "algo quebrou, arruma rápido"
Quem usa: **qualquer pessoa do escritório** (Bebela, Letícia, etc.).
Formulário: `.github/ISSUE_TEMPLATE/bug.yml` → já entra com a label `bug`.
Objetivo: chegar aqui rápido e ser resolvido rápido.

### 💡 Funcionalidades — "seria bom se o sistema fizesse X"
Quem usa: principalmente **Igor + Bebela** (mas qualquer um pode sugerir).
Formulário: `.github/ISSUE_TEMPLATE/funcionalidade.yml` → entra com `funcionalidade` + `ideia`.
Objetivo: acumular ideias, validar as boas, construir só o que foi validado.

---

## Ciclo de vida (as labels contam a história)

**Funcionalidade:**

```
ideia → validado → (constrói) → fecha a issue
   \
    → descartado (fecha a issue)
```

- `ideia` — chegou, ainda não avaliada.
- `validado` — Igor + Bebela decidiram que vale a pena. Só o que é `validado` vira código.
- `descartado` — decidido não fazer (por ora). Fecha a issue, mas fica no histórico.

**Bug:**

```
bug (+ urgência: alta/média/baixa) → arruma → fecha a issue
```

A urgência guia a ordem de ataque. `urgência: alta` = travou trabalho, resolver hoje.

> **Nota sobre a urgência:** a label `urgência: X` é aplicada **automaticamente** pela Action de triagem
> (`.github/workflows/triagem-issues.yml`), que lê a resposta do formulário. Ninguém precisa marcar na mão.

### As labels
Definidas em `.github/labels.json` e criadas/atualizadas pelo workflow **Sincronizar labels**
(`.github/workflows/sync-labels.yml`). Para editar cores/nomes, mexa no JSON — não crie label na mão.

| Label | Cor | Pra quê |
|-------|-----|---------|
| `bug` | 🔴 | Algo quebrado |
| `funcionalidade` | 🔵 | Ideia/recurso novo |
| `urgência: alta` | 🔴 | Travou — resolver hoje |
| `urgência: média` | 🟡 | Atrapalha, mas dá pra esperar |
| `urgência: baixa` | 🟢 | Sem pressa |
| `ideia` | 🟣 | Funcionalidade ainda não avaliada |
| `validado` | 🟢 | Aprovada — pode construir |
| `descartado` | 🟡 | Não vamos fazer (por ora) |

---

## O quadro visual (GitHub Projects) — passo manual, uma vez

O GitHub tem um kanban chamado **Projects**. O Claude Code não cria o quadro sozinho (não tem a
ferramenta), mas depois de criado ele consegue jogar issues nele e mexer nos campos. Como criar:

1. No repositório → aba **Projects** → **New project** → modelo **Board**.
2. Nomeie (ex.: "Escritório — Demandas").
3. Colunas sugeridas: **Caixa de entrada** · **Validado / A fazer** · **Fazendo** · **Feito**.
4. Em Settings do projeto → **Workflows** → ligue "Item added to project" e "Auto-add" do repositório,
   pra toda issue nova cair na "Caixa de entrada" automaticamente.

Assim: bug entra na Caixa de entrada; funcionalidade validada vai pra "A fazer"; o resto flui pelo board.

---

## Onde a plataforma entra (o pulo do gato)

O formulário web do GitHub é a **porta de emergência** — funciona, mas exige conta no GitHub. A porta
principal vai ser **dentro da própria plataforma** que estamos construindo: um botão "Reportar erro" que
cria a issue aqui via API, sem a pessoa precisar saber o que é GitHub.

### Contrato: como a plataforma cria um bug

**Nunca** colocar token do GitHub no frontend. O fluxo é:

```
[Plataforma / React]  →  [função serverless na Vercel]  →  [GitHub Issues API]
   botão "reportar"        guarda o token com segurança      cria a issue
```

A função serverless faz `POST https://api.github.com/repos/igorveloso/IbaArquitetura/issues`
com header `Authorization: Bearer <TOKEN>` e corpo:

```json
{
  "title": "[Erro] Tela branca ao gerar checklist",
  "labels": ["bug", "urgência: alta"],
  "body": "**O que aconteceu?**\nCliquei em gerar checklist e a tela ficou branca.\n\n**O que esperava?**\nVer a lista de documentos.\n\n**Onde:** tela de novo projeto\n**Urgência:** Alta\n**Reportado por:** Letícia\n**Origem:** plataforma (v1)"
}
```

Regras do contrato:
- **Título:** prefixo `[Erro] ` + resumo curto (mesmo padrão do formulário web).
- **Labels:** sempre `bug`; a urgência escolhida na tela vira `urgência: alta|média|baixa`.
- **Body:** markdown montado a partir dos campos da tela, nos mesmos rótulos do `bug.yml`, pra web e
  plataforma gerarem issues idênticas.
- **Rastreio:** incluir "Reportado por" e "Origem: plataforma" pra distinguir do que vem pela web.
- **Token:** um Personal Access Token *fine-grained* (só `Issues: write` neste repo) ou um GitHub App.
  Guardado como variável de ambiente na Vercel — **nunca** commitado (mesma regra do `ANTHROPIC_API_KEY`).

Esse contrato existe pra quando a plataforma for construída: o "backend" da caixa de entrada já está
pronto (labels + formato), então o botão só precisa seguir este formato.

---

## Automações já montadas (`.github/workflows/`)

- **`sync-labels.yml`** — cria/atualiza as labels a partir de `labels.json`.
- **`triagem-issues.yml`** — três automações leves:
  1. **Urgência automática:** lê a resposta do formulário de bug e aplica `urgência: alta/média/baixa`.
  2. **Acuse de recebimento:** comenta na issue nova avisando que chegou (bom pra quem não vive no GitHub).
  3. **Fechar ao descartar:** ao marcar `descartado`, fecha a issue com um comentário (mantém o histórico).

## Próximos passos (opcionais, quando fizer sentido)

- [ ] Ligar o **auto-add ao Project** (Settings do Project → Workflows → "Auto-add to project"). Zero
      código; toda issue nova cai no quadro sozinha.
- [ ] **Aviso de urgência alta** — quando `urgência: alta` for aplicada, disparar aviso (menção, e-mail
      ou, no futuro, WhatsApp). Fácil de montar quando definirmos o canal.
- [ ] **Limpeza de ideias paradas** — ideia sem atividade há X dias ganha um comentário/aviso pra revisão.
- [ ] Quando a plataforma existir: implementar a função serverless do contrato acima.
- [ ] (Se o atrito de conta no GitHub incomodar antes da plataforma) avaliar uma conta compartilhada do
      escritório ou um Google Form → issue como ponte temporária.
