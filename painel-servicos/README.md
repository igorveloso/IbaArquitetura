# Painel de Serviços

Lista de tarefas do escritório, organizada por cliente e por prioridade (P1 a P5). Cada tarefa tem status
(Minha ação, Aguardando cliente, Monitorar), observação e ordem. A aba Pessoal fica separada da empresa.

Stack: Vite + JavaScript puro, Firebase Auth (e-mail e senha) e Firestore. Deploy no Vercel.

> Este painel é independente do painel de gestão de projetos descrito em `docs/07-painel-gestao-projetos-spec.md`.

## Dados ficam fora do repositório

O repositório é público. Nomes de clientes e números de processo vivem só no Firestore. Para carregar a lista
inicial, use **Importar JSON** dentro do app (ver passo 5).

## Configuração

### 1. Firebase

1. Crie um projeto em https://console.firebase.google.com.
2. **Authentication > Sign-in method:** ative **E-mail/senha**.
   Em **Settings > User actions**, desative a criação de contas pelo próprio usuário.
3. **Authentication > Users:** crie as contas (uma por pessoa que vai usar).
4. **Firestore Database:** crie o banco em modo produção.
5. **Rules:** cole o conteúdo de `firestore.rules`, troque `EMAIL_1` e `EMAIL_2` pelos e-mails reais e publique.
6. **Project settings > Your apps:** registre um app Web e copie a configuração.

### 2. Rodar local

```bash
cd painel-servicos
cp .env.example .env     # preencha os VITE_FIREBASE_*
npm install
npm run dev
```

### 3. Deploy no Vercel

1. Importe este repositório no Vercel.
2. **Root Directory:** `painel-servicos`. O Vercel detecta o Vite sozinho.
3. **Environment Variables:** cadastre os seis `VITE_FIREBASE_*` do `.env.example`.
4. Em Firebase, **Authentication > Settings > Authorized domains**, adicione o domínio do Vercel.

### 4. Modelo de dados

Coleção `tasks`, um documento por tarefa:

| Campo | Tipo | Observação |
|---|---|---|
| grupo | `empresa` ou `pessoal` | |
| cliente | texto | vazio em tarefas pessoais |
| titulo | texto | |
| status | `Minha ação`, `Aguardando cliente` ou `Monitorar` | |
| nivel | `P1` a `P5` | só em `empresa` |
| obs | texto | |
| done | booleano | |
| order | número | posição na lista de prioridade |
| docOrder | número | posição no documento original |
| updatedAt | número (ms) | |

### 5. Carregar a lista inicial

Entre no app, clique em **Importar JSON** e cole o conteúdo do arquivo `painel-servicos-seed.json`
(guardado fora do repositório). **Copiar JSON** exporta o estado atual no mesmo formato, serve de backup.
