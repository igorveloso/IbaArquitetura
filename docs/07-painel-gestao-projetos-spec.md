# Painel de gestão de projetos — documento técnico (MVP)

## 1. Contexto e objetivo

Ferramentas como Asana e Trello exigem abrir cada projeto individualmente para entender onde ele está. O objetivo deste painel é o oposto: permitir que a responsável pelo escritório "bata o olho" e entenda, sem clicar em nada, o que falta ser executado em cada projeto e onde precisa focar agora.

O sistema tem dois papéis de uso, modelados por função e não por pessoa fixa (para suportar crescimento da equipe sem redesenho):

- **Revisor** — aprova e revisa o trabalho.
- **Executor** — desenvolve o projeto.

Um terceiro estado, **Cliente**, existe apenas como valor possível de "quem está com a bola" — o cliente não é um usuário do sistema, é uma condição de espera.

## 2. Modelo de dados

### Projeto
| Campo | Tipo | Descrição |
|---|---|---|
| nome | texto | Nome do projeto |
| cliente | texto | Nome do cliente |
| fase_atual | referência → Fase | Coluna atual no quadro |
| bola_com | enum: Revisor / Executor / Cliente | Quem precisa agir agora |
| em_pausa | booleano | Projeto suspenso temporariamente, independente da fase |
| link_pasta | URL | Pasta raiz do projeto no OneDrive |
| ultima_mudanca_em | timestamp | Atualizado automaticamente a cada mudança de fase, bola ou pausa |
| arquivado | booleano | Remove do quadro ativo sem apagar histórico |

### Registro (linha do tempo do projeto)
| Campo | Tipo | Descrição |
|---|---|---|
| projeto_id | referência → Projeto | |
| timestamp | data/hora | |
| texto | texto livre | O que foi feito / próxima ação / motivo de uma mudança |
| link | URL (opcional) | Documento específico no OneDrive relacionado a esta entrada |
| autor | referência → Pessoa (opcional) | Quem registrou |

Este é o campo central para retomar contexto após uma pausa longa: é uma narrativa cronológica legível, não um log técnico.

### Fase
| Campo | Tipo | Descrição |
|---|---|---|
| nome | texto | Editável pelo usuário |
| ordem | número | Define a posição da coluna no quadro |

Fases iniciais sugeridas (todas editáveis, reordenáveis, e novas podem ser adicionadas): **Estudo → Desenvolvimento → Revisão → Concluído**.

### Pessoa
| Campo | Tipo | Descrição |
|---|---|---|
| nome | texto | |
| papel | enum: Revisor / Executor | |

## 3. Regras de negócio

- **Alarme de tempo parado**: calculado a partir de `ultima_mudanca_em`. A cor de urgência (neutro → atenção → crítico, conforme dias parados) só se aplica quando `bola_com` = Revisor ou Executor. Quando `bola_com` = Cliente **ou** `em_pausa` = true, o tempo decorrido é exibido, mas sem cor de urgência — é espera esperada, não falha de alguém.
- **Pausar/retomar**: ação explícita que altera `em_pausa` e gera automaticamente uma entrada no Registro ("projeto pausado em [data]" / "projeto retomado em [data]").
- **Mudança de fase ou de bola**: sempre atualiza `ultima_mudanca_em`. Recomendado (não obrigatório) registrar também uma entrada no Registro explicando o motivo.
- **Documentação**: nunca upload de arquivo dentro do sistema — sempre link para o OneDrive, seja a pasta raiz do projeto ou um documento específico associado a uma entrada do Registro.

## 4. Telas necessárias

### Tela 1 — Quadro (home)
Colunas = Fases, na ordem definida. Cada coluna tem nome + contador de projetos.

Cada card mostra: nome do projeto, cliente, badge de "bola com" (cor por papel), indicador visual de pausa, e tempo desde `ultima_mudanca_em` com a cor de alarme correspondente.

Ações: clicar no card abre a Tela 2; botão de criar projeto abre a Tela 3; acesso à Tela 4 via ícone de configuração.

### Tela 2 — Detalhe do projeto
Cabeçalho: nome, cliente, fase atual, bola com quem, link da pasta no OneDrive, botão de pausar/retomar.

Corpo: Registro completo em ordem cronológica, cada entrada com timestamp, texto, link opcional e autor.

Ações: adicionar entrada no Registro (texto + link opcional); mudar fase; mudar bola com quem; editar link da pasta; arquivar projeto.

### Tela 3 — Criar projeto
Campos: nome, cliente, fase inicial, bola com quem inicial, link da pasta no OneDrive.

Ao salvar: cria o projeto e uma primeira entrada automática no Registro ("projeto criado").

### Tela 4 — Configurações (Fases e Pessoas)
Lista de Fases: nome, ordem — adicionar, renomear, reordenar, remover (com aviso se houver projetos naquela fase).

Lista de Pessoas: nome, papel — adicionar, editar, remover.

## 5. Fora do escopo do MVP

- Integração automática com o checklist granular de desenvolvimento (item por item, tipo code-review)
- Upload de arquivos — somente link para OneDrive
- Notificações automáticas
- Autenticação completa de usuários (a definir separadamente)
- Métrica de progresso percentual automática

## 6. Princípios visuais

- Prioridade máxima: informação essencial visível sem precisar clicar em nada
- Cor é sinal de urgência, não decoração — reservada para tempo parado quando há ação pendente de alguém do time
- Diferenciar visualmente "espera normal" (cliente / pausa) de "atenção necessária" (revisor/executor com tempo parado)
- Papéis, não nomes fixos — o desenho não pode travar no crescimento da equipe
