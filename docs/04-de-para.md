# 04 — O De-Para (Camada de conhecimento da Bebela)

## O que é

O de-para é a **tradução** de cada exigência do doc da PBH (juridiquês) para "o que pedir e como obter",
em linguagem de cliente leigo. É a **Camada 2** da arquitetura (ver [`02-bloco1-arquitetura.md`](02-bloco1-arquitetura.md)).

É o **gargalo crítico** do Bloco 1: sem ele, não há como cruzar a lista da prefeitura com o que a
Bebela realmente pede, nem como separar o que é responsabilidade do cliente.

Propriedade importante: a **prefeitura muda o tempo todo; o de-para muda raramente.** Por isso ele é a
base estável do sistema.

## Status

**AGUARDANDO a Bebela enviar a versão dela.** Ela já tem esse conhecimento meio pronto (planilha/modelo
próprios). Decisão: **não gerar rascunho automático** para não gerar retrabalho de "refazer por cima".
Quando ela mandar, encaixamos no schema abaixo e cruzamos com os ~73 documentos do doc da PBH.

## Esqueleto sugerido (por item)

Para encaixar limpo no contrato de extração ([`03-achados-tecnicos.md`](03-achados-tecnicos.md)), o
ideal é que o de-para tenha, por documento:

| Campo | O que é |
|-------|---------|
| `nome_amigavel` | Nome do documento em linguagem de cliente |
| `condicao_enquadramento` | A tradução da observação: quando este documento é necessário |
| `o_que_pedir` | O que o cliente precisa fornecer |
| `como_obter` | Passo/link/órgão para obter ou preencher |
| `responsavel` | `cliente` / `bebela` / `rt` — quem providencia |
| `campos_do_cliente` | Quando for coleta de dados, os campos que o cliente preenche |

> Nota do modelo Rua Machado: alguns itens são providenciados **pela Bebela/RT**, não pelo cliente
> (ex.: "Declaração de inexistência de APP: Enviarei para assinar antes de protocolar"). Por isso o
> campo `responsavel` é essencial — o material do cliente só mostra o que é responsabilidade **dele**.

## Quando o de-para chegar

1. Encaixar no schema acima.
2. Cruzar com os documentos extraídos do doc da PBH (casar por documento).
3. Identificar lacunas: documentos da PBH sem tradução no de-para → lista para a Bebela completar.
4. Só então desenhar as telas reais (escolha do tipo, checklist de enquadramento, página do cliente).
