# Guia de imagens de referência para o img2threejs

Como preparar as imagens pra eu (Claude) reconstruir o objeto em Three.js com mais fidelidade
e sem travar no meio. Escrito a partir do que aconteceu no 1º teste (o prédio).

---

## Parte 1 — Como trazer mais detalhe (o que mais ajuda a melhorar o resultado)

Em ordem de impacto:

1. **Mande mais de uma vista do MESMO objeto.**
   Uma foto só mostra 2 faces; o fundo e a lateral oculta viram "chute espelhado".
   O ideal, do melhor pro mínimo:
   - **Elevação frontal** (reta, de frente) + **elevação lateral** (reta, de lado) → dão proporção exata.
   - **Uma perspectiva 3/4** → dá o volume e como as faces se encontram.
   - **Elevação de fundo**, se existir → elimina o espelhamento.
   No SketchUp: exporte cada uma como imagem separada. Para as elevações use **projeção paralela**
   (Câmera → Projeção paralela) e as vistas padrão (Frente/Lateral/Trás).

2. **Enquadre o objeto preenchendo o quadro.**
   No teste, o prédio ocupava só a faixa central e sobrava muito céu/rua — isso desperdiça
   resolução justo onde eu preciso ler detalhe. Deixe o objeto ocupando ~80-90% do quadro.

3. **Close-ups dos detalhes que definem a identidade.**
   Um recorte de perto de cada coisa característica: esquadria das janelas, o ripado de madeira,
   a textura/grelha do vidro, o portão, o revestimento de pedra. É o que separa "um prédio
   genérico" do "SEU prédio".

4. **Anote as medidas que a imagem não revela.**
   Número de pavimentos, pé-direito, largura aproximada, altura total. Sem isso eu chuto a
   proporção. Pode ser só um bilhete no chat: "6 pavimentos, ~18 m de altura, ~12 m de largura".

5. **Iluminação neutra e fundo limpo.**
   Sombra suave (ou sem sombra), sem nada na frente ocluindo (carro, árvore, pessoa) e fundo
   uniforme. O render de SketchUp já é ótimo nisso — cor chapada e contorno nítido.

6. **Diga o material de cada parte, se souber.**
   "Fachada = textura granilite cinza; torre = vidro insulado azulado; tira = madeira cumaru."
   Nomear o material real deixa o passe de materiais muito mais fiel.

---

## Parte 2 — Padrão de arquivo ideal (pra não precisar de ajuste nenhum)

| Item | Recomendado | Por quê |
|---|---|---|
| **Formato** | **PNG** | O leitor de imagem da skill é **PNG-only**. No teste a imagem veio em `.jpeg` e eu tive que converter pra PNG antes de rodar. PNG = zero conversão. |
| **Resolução** | lado maior entre **1500 e 2500 px** | Detalhe suficiente sem arquivo gigante. Acima de ~4000 px fica pesado sem ganho real. |
| **Proporção** | objeto **centralizado**, quadro **~4:3 / 3:2 / quadrado** | Evite panorâmico (2:1) com o objeto pequeno no meio — foi o caso do teste. |
| **Cor** | RGB 8-bit, sem canal alfa exótico | Fundo liso já isola bem; não precisa recortar. |
| **Nome do arquivo** | sem espaços e sem acento | Ex.: `predio-frontal.png`, `predio-lateral.png`, `predio-3q.png`, `detalhe-ripado.png`. Facilita os comandos e evita erro de caminho. |
| **Organização** | tudo numa pasta `refs/` | Uma pasta por objeto, com um arquivo por vista/detalhe, nomeado pela vista. |

### Exportando do SketchUp já no padrão
- `Arquivo → Exportar → Gráfico 2D → PNG`.
- Nas opções, defina a **largura ~2000 px**.
- Para elevações: **Câmera → Projeção paralela** + vista Frente/Lateral/Trás.
- Para a perspectiva: vista 3/4 com a câmera um pouco acima, objeto preenchendo o quadro.
- Desligue sombras muito duras (ou deixe suaves) e mantenha o fundo padrão liso.

### Checklist rápido antes de me mandar
- [ ] É **PNG**
- [ ] Objeto **preenche o quadro** (pouco céu/fundo sobrando)
- [ ] Lado maior **1500-2500 px**
- [ ] Nome **sem espaço/acento**
- [ ] Se possível: **+1 vista** (elevação ou fundo) e **medidas** no chat

> Resumo de uma linha: **PNG, objeto grande no quadro, 1500-2500 px, nome simples — e quanto mais
> vistas + medidas + close de detalhe, mais fiel eu consigo deixar.**
