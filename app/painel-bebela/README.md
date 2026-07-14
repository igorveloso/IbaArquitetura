# Painel Bebela

Painel de gestão de projetos do escritório — implementação real do protótipo
**"Painel Bebela.dc.html"** do projeto Claude Design *"Plataforma de gestão para arquiteta"*.

## O que é
Um quadro (kanban) para a responsável "bater o olho" e ver, sem clicar em nada, o que precisa de
atenção agora. Cor é **sinal de urgência** (tempo parado), não decoração. Papéis, não nomes fixos.

Cinco telas: **Quadro**, **Detalhe do projeto** (registro + tarefas), **Criar projeto**,
**Minhas tarefas** (por responsável) e **Configurações** (fases e pessoas).

## Como rodar
É um único arquivo autossuficiente. Basta abrir `index.html` no navegador — não precisa build nem
servidor. Os dados ficam no `localStorage` do navegador (chave `iba-painel-v2`), com dados de exemplo
pré-carregados na primeira abertura.

Para publicar na Vercel: serve como estático (a pasta já é deployável como está).

## Como foi feito
A lógica de negócio (cálculo de urgência, tarefas, prazos, registro, fases, pessoas) foi portada quase
literalmente do protótipo. O que mudou foi só o *runtime*: no lugar do `DCLogic`/`support.js` do Claude
Design, um mini-render vanilla (~40 linhas) que reconstrói a tela a cada mudança de estado, **preserva
foco e cursor** nos campos entre re-renders e reproduz os efeitos de hover/focus do design.

Verificado ponta a ponta no Chromium (5 telas, criar tarefa/projeto/registro, troca de fase,
persistência após reload) — 0 erros de console.

## Regras de negócio (do spec)
- **Alarme de tempo parado** a partir de `ultima_mudanca_em`: neutro → atenção → crítico. Só vale quando
  a "bola" está com Revisor/Executor. Com **Cliente** ou **em pausa**, mostra o tempo mas sem cor de
  urgência (espera esperada ≠ falha).
- **Pausar/retomar**, **mudar fase** e **mudar responsável** atualizam o tempo e geram entrada no Registro.
- **Documentos**: sempre link para o OneDrive, nunca upload.

## Ainda fora do escopo (MVP)
Backend/sincronização entre dispositivos (hoje é local por navegador), autenticação, notificações
automáticas e integração com o checklist granular. Ver `docs/06` e o spec do projeto de design.
