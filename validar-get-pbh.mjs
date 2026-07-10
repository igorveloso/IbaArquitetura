// validar-get-pbh.mjs
// Valida o Bloco 1 ponta a ponta:
//   Etapa 1 - GET no Google Doc PUBLICADO da PBH (sem login, HTTP puro)
//   Etapa 2 - estruturacao do HTML em JSON via Claude API (opcional)
//
// Requisitos: Node 18+ (fetch nativo, sem instalar nada).
// Para a Etapa 2:  export ANTHROPIC_API_KEY=sk-ant-...
// Rodar:           node validar-get-pbh.mjs

// >>> COLE AQUI a URL /pub EXATA do doc da Bebela (copie do proprio Google Doc publicado).
//     A que veio do PDF estava quebrada; pega a original pra nao dar erro.
const PUB_URL = "https://docs.google.com/document/d/e/2PACX-1vRET6Ug0kkn6p5A6bpAhnRYECvrFIM_V_Xi3_r_x9IjKVCBnOyyvvqBQNMtd6gzb2uzJZBZ3VD0Uadn/pub";

async function etapa1_fetch() {
  console.log("== Etapa 1: GET no doc publicado ==");
  const res = await fetch(PUB_URL, { redirect: "follow" });
  console.log("status:      ", res.status, res.statusText);
  console.log("content-type:", res.headers.get("content-type"));
  const html = await res.text();
  console.log("tamanho:     ", html.length, "bytes");

  const texto = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  console.log("preview:\n", texto.slice(0, 400), "...\n");

  if (!res.ok) throw new Error("GET falhou. Confirme que a URL /pub esta correta e publica.");
  // Sinal de vida: o doc tem que mencionar os 6 tipos de solicitacao.
  const ok = /solicita[cç][aã]o/i.test(texto) && /documenta[cç][aã]o/i.test(texto);
  console.log(ok ? "OK: parece o checklist certo.\n" : "ATENCAO: conteudo inesperado, confira a URL.\n");
  return html;
}

async function etapa2_estruturar(html) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) { console.log("(Etapa 2 pulada — defina ANTHROPIC_API_KEY para estruturar em JSON)"); return; }
  console.log("== Etapa 2: estruturacao via Claude ==");

  // Manda o HTML CRU (Claude le tabela em HTML, incluindo os numeros 1-6 das celulas).
  // Truncado por seguranca; um doc real cabe folgado.
  const prompt =
    "Voce recebe o HTML de um checklist da Prefeitura de BH com documentos por tipo de " +
    "solicitacao (1 a 6). Extraia CADA documento. Responda SOMENTE JSON valido (sem markdown, " +
    "sem preambulo), um array de objetos com o schema:\n" +
    "{documento, aplica_aos_tipos:[int], obrigatoriedade:'obrigatorio'|'condicional'|'opcional', " +
    "condicao, pergunta_enquadramento, como_obter}\n" +
    "A 'pergunta_enquadramento' deve transformar a coluna observacoes numa pergunta SIM/NAO " +
    "que a arquiteta responde para decidir se o documento se aplica ao caso dela.\n\nHTML:\n" +
    html.slice(0, 60000);

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data = await res.json();
  const texto = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("");
  console.log(texto);
}

const html = await etapa1_fetch();
await etapa2_estruturar(html);
