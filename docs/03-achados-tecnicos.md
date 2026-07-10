# 03 — Achados Técnicos

## Validação do GET (10/07/2026) — CONFIRMADO ao vivo

O doc da PBH foi puxado ao vivo com sucesso.

- É um Google Doc **publicado na web** → HTML público, **sem autenticação**.
- Um `fetch()` simples no `/pub` retorna o documento inteiro (status 200, `content-type: text/html`).
- A extração em markdown **preserva a tabela**, incluindo as colunas de tipo de solicitação.

**URL de origem** (a correta; a que veio do PDF estava quebrada):
```
https://docs.google.com/document/u/0/d/e/2PACX-1vRET6Ug0kkn6p5A6bpAhnRYECvrFIM_V_Xi3_r_x9IjKVCBnOyyvvqBQNMtd6gzb2uzJZBZ3VD0Uadn/pub?pli=1
```

## Como a aplicabilidade é codificada

Cada linha da tabela vem no formato:
```
| 1 | 2 |   | 4 | 5 | 6 | NOME DO DOCUMENTO | OBJETIVO | OBSERVAÇÕES |
```
Quando o tipo **não** se aplica, a célula vem **vazia**. Ou seja, `aplica_aos_tipos` sai direto da
presença/ausência do número — **não depende de cor**. Isso torna a estruturação robusta e simples.

## Achados sobre o conteúdo do doc

- O doc tem **~73 documentos**, distribuídos em ~10 seções:
  Cadastro e Termos de Responsabilidade; Caracterização do Lote; Relativos ao Imóvel; Específicos do
  Projeto; Regularização de Edificação; ARTs e RRTs; Pranchas; Interface com Outros Órgãos;
  Documentos Prévios da SMMA; Documentos Prévios de Outros Órgãos (CEMIG, COPASA, IEPHA, IPHAN, SUPLAN…).
- Os prints iniciais da Bebela mostravam só ~10 — eram a pontinha.
- **Filtro por tipo corta muito:** ex., o tipo 3 (alteração pontual simplificada) cai de ~73 para ~14
  documentos. Corte de ~80% num clique — este é o valor sentido no primeiro uso.
- O rodapé traz **"ATUALIZADO EM DD/MM/AAAA"** (na leitura: 04/03/2026) → gatilho pronto para o diff
  do Padrão B.

## O caveat real: as observações

O fetch é trivial. O trabalho de verdade está nas **observações**, que são densas e cheias de lógica
condicional aninhada. Exemplos de padrões recorrentes:
- "Dispensado se apresentada a LI/LO válida…"
- "Exceto edificação residencial unifamiliar/multifamiliar horizontal classificada como baixo risco…"
- "Obrigatório quando indicado na Informação Básica do lote a nota X…"
- "Necessário quando indicada a utilização de TDC / BPH…"

Um mesmo documento pode ter 3–4 condições. Traduzir isso em perguntas de enquadramento sim/não é o que
o **de-para** resolve. Ver [`04-de-para.md`](04-de-para.md).

## Contrato de extração (JSON)

Schema-alvo por documento (o de-para da Bebela deve espelhar isto para encaixar limpo):

```json
{
  "documento": "string",
  "aplica_aos_tipos": [1, 2, 4, 5, 6],
  "obrigatoriedade": "obrigatorio | condicional | opcional",
  "condicao": "texto da condição extraído das observações",
  "pergunta_enquadramento": "pergunta SIM/NAO que a Bebela responde para decidir se o doc se aplica",
  "como_obter": "orientação de como obter/preencher (link, órgão, passo)",
  "responsavel": "cliente | bebela | rt"
}
```

Exemplos reais (extraídos do doc ao vivo):

```json
[
  {
    "documento": "Autorizacao do CINDACTA ou Declaracao de Inexigibilidade",
    "aplica_aos_tipos": [1, 2, 4, 5, 6],
    "obrigatoriedade": "condicional",
    "condicao": "Quando a altura da edificacao ultrapassa a maxima da Informacao Basica do lote (IBED).",
    "pergunta_enquadramento": "A altura da edificacao ultrapassa a maxima da Informacao Basica do lote?",
    "como_obter": "Solicitar ao CINDACTA em servicos.decea.gov.br/aga.",
    "responsavel": "rt"
  },
  {
    "documento": "Certidao de Beneficio decorrente da Producao de HIS (BPH)",
    "aplica_aos_tipos": [2],
    "obrigatoriedade": "condicional",
    "condicao": "Necessario quando indicada a utilizacao de BPH. So se aplica ao tipo 2 (EHIS).",
    "pergunta_enquadramento": "O projeto usa Beneficio de Producao de HIS (BPH)?",
    "como_obter": "Indicar a area de BPH no cadastro e na planilha.",
    "responsavel": "bebela"
  }
]
```

## Script de validação

`scripts/validar-get-pbh.mjs` — Node 18+. Etapa 1: GET no `/pub`. Etapa 2 (opcional, com
`ANTHROPIC_API_KEY`): estruturação do HTML em JSON via Claude API.
