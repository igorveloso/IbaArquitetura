# 01 — Visão Geral

## O problema

A Bebela (Izabela) toca um escritório de projeto legal em Belo Horizonte. Grande parte do trabalho
dela é burocrático e repetitivo: descobrir qual documentação a prefeitura exige para cada projeto,
montar a lista para o cliente, conferir o que o cliente devolve, coordenar o desenvolvimento do
projeto com a Letícia, e montar contratos. Hoje isso é feito na mão, com apoio de planilhas longas
e de um documento da prefeitura que muda com frequência.

O objetivo é automatizar as partes operacionais sem tirar o julgamento técnico dela do centro —
o sistema prepara, organiza e cruza informação; a Bebela decide.

## Atores

- **Bebela (Izabela)** — arquiteta, dona do escritório. Decide o enquadramento, revisa, aprova.
- **Letícia** — desenvolve o projeto seguindo os checklists.
- **Cliente** — muitas vezes leigo; fornece dados e documentos. Faixa etária variada (alguns mais velhos).

## Os 4 blocos

### Bloco 1 — Lista de documentação para o cliente  *(em foco)*
A partir do doc da PBH (que define a documentação por tipo de solicitação), a Bebela informa o tipo,
o sistema mostra os documentos aplicáveis com as explicações, ela dá check no que se enquadra, e sai
um material enxuto e amigável para o cliente. Quando o cliente devolve, o sistema confere (assinatura,
validação no gov.br, preenchimento) e aponta erros.

### Bloco 2 — Checklists dinâmicos de projeto  *(em foco, próximo)*
Transformar as listas longas e repetitivas num fluxo dinâmico com ciclo de revisão Bebela ↔ Letícia:
dados do projeto → fase de estudo (16 itens) → desenvolvimento (Letícia) → revisão da Bebela com
observação + anexo de imagem → correção → check final. Abas **PROJETO | DOCUMENTOS**.

### Bloco 3 — Acompanhamento de processos gov.br/PBH  *(descartado)*
Portal autenticado, sem API pública. Só seria viável se a prefeitura liberasse uma API — o que não
se espera. Descartado.

### Bloco 4 — Contratos e propostas  *(adiado)*
Modelo por tipo de serviço que preenche dados e gera o contrato. Construível e de alto retorno, mas
o Igor já conhece o caminho — fica para depois.

## O fluxo de trabalho da Bebela (onde o Bloco 1 se encaixa)

1. **Momento 1 — montar a lista pro cliente:** a Bebela entende o que precisa pedir/solicitar do
   cliente para cada projeto e monta um documento com as solicitações.
2. **Cliente preenche/entrega** as informações e documentos.
3. **Momento 2 — briefing/estudo:** com o que o cliente devolveu, a Bebela monta o estudo e começa
   a entender o que é possível, virando o projeto de fato.

O Bloco 1 automatiza o Momento 1 e o recebimento estruturado do cliente, alimentando o Momento 2.
