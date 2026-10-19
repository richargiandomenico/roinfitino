# Roi Infinito

Sistema de gestão de operação para projetos de conteúdo com monetização AdSense / AdX.
Reúne análise de ROI, funil de tráfego, financeiro por projeto, plano de ação com apoio de IA,
e gestão de equipe, tarefas e permissões.

## Módulos

| Módulo | O que faz |
| --- | --- |
| **Home** | Calendário com as tarefas atribuídas ao usuário logado que têm prazo de entrega, valores da empresa e frases motivacionais. |
| **Projetos** | Cada URL / nicho é um projeto. Dentro do projeto ficam os 4 módulos abaixo, na ordem Plano → ROI → Funil → Financeiro. |
| **1. Plano de Ação** | Briefing (nicho, tema, país, idioma, sprint, objetivo), 8 fases com checklist, subtarefas por item, responsável por item, anotações com editor rico e opção de transformar anotação em tarefa. |
| **2. Calculadora de ROI** | Fonte/plataforma (Meta Ads, Google Ads, AdSense, AdX, GAM, Outro), UTM/observação, dados GAM (impressões, CPM, receita), receita, gasto, CPA para empatar e sugestões automáticas quando o ROI fica negativo. Histórico com filtro por UTM e por fonte. |
| **3. Análise de Funil** | Desempenho e conversão P1 → P2 → P3, com histórico e exclusão de registros. |
| **4. Financeiro** | Gastos com ferramentas, tráfego e retorno, mês a mês e diário, por projeto. Receita bruta em dólar ou euro com conversão para real. |
| **Tarefas** | Kanban estilo Trello, lista, solicitações entre membros, subtarefas, comentários com editor rico (negrito, itálico, lista, link, imagem), editar e excluir comentários. |
| **Equipe** | Cadastro de colaboradores, cargos, atribuição de projetos e de responsáveis. |
| **Configurações** | Dólar do dia (cotação automática) com edição manual, euro, taxas e impostos usados no cálculo de ROI. |

## Papéis e permissões

Os papéis ficam na tabela `public.user_roles`, nunca no perfil do usuário.

- **super_admin** — acesso a Equipe e Configurações; atribui projetos aos usuários.
- **admin** — gestor de projeto; pode atribuir colaboradores ao projeto que criou.
- **collaborator** — vê apenas os projetos aos quais foi atribuído.

Quem é adicionado a um projeto passa a ver e editar os dados daquele projeto
(plano, ROI, funil e financeiro). O controle de acesso é feito por políticas de linha (RLS)
no banco, com a função `has_role` para evitar recursão.

## Banco de dados

Todo o esquema está versionado em `supabase/migrations/` (13 arquivos, 16 tabelas):

`action_plans`, `financial_records`, `funnel_records`, `notifications`, `projects`, `settings`,
`simulations`, `task_attachments`, `task_comments`, `task_history`, `task_links`, `task_subtasks`,
`tasks`, `team_member_projects`, `team_members`, `user_roles`

As tabelas `user_roles`, `team_members` e `team_member_projects` sustentam papéis, cadastro da
equipe e a ligação entre colaborador e projeto.

> Os arquivos de schema vão para o repositório, mas o **conteúdo** das tabelas (os registros)
> não. Para levar os dados, exporti-los separadamente pela área de backup do banco.

## Funcionalidades de IA

A função `ai-plan-assistant` (em `supabase/functions/`) gera plano de ação a partir do briefing,
analisa desempenho de campanhas e artigos, sugere criativos e aponta onde melhorar para atingir ROI.

## Cotação de moedas

A cotação do dólar é buscada automaticamente na AwesomeAPI. Em
**Configurações** é possível digitar um valor manual para o dólar e para o euro,
usado nos cálculos de ROI e do financeiro.

## Como rodar

```bash
npm install
npm run dev
```

Variáveis em `.env`: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`.

## Testes

```bash
npx vitest run
```
