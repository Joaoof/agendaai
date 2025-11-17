# Agenda Completa - Sistema de Gestão de Tarefas

Sistema completo de agendamento e gestão de tarefas com integração Supabase, dashboard avançada, visualização semanal estilo Google Calendar e modo Kanban/Trello.

## Funcionalidades

- ✅ **Visualização Semanal**: Layout tipo Google Calendar com horários fixos
- ✅ **Modo Kanban/Trello**: Organização de tarefas por status
- ✅ **Sistema de Checklist**: Marque tarefas como concluídas
- ✅ **Dashboard Completa**: Métricas detalhadas, gráficos e relatórios
- ✅ **Categorias e Prioridades**: Organize suas tarefas
- ✅ **Configurações**: Personalize horários, tema e preferências
- ✅ **Autenticação Segura**: Login com Supabase
- ✅ **RLS (Row Level Security)**: Proteção de dados por usuário

## Tecnologias

- **Next.js 16** - Framework React
- **Supabase** - Banco de dados PostgreSQL e autenticação
- **Tailwind CSS v4** - Estilização
- **Recharts** - Gráficos e visualizações
- **Poppins + Open Sans** - Tipografia
- **shadcn/ui** - Componentes de interface

## Instalação

### Pré-requisitos

- Node.js 18+
- pnpm (gerenciador de pacotes)

### Instalar pnpm globalmente

\`\`\`bash
npm install -g pnpm
\`\`\`

### Configurar o projeto

1. Clone o repositório
2. Instale as dependências:

\`\`\`bash
pnpm install
\`\`\`

3. Execute o script SQL para criar as tabelas:
   - Vá para `scripts/001_create_tasks_table.sql`
   - Clique no botão de play para executar
   - Depois execute `scripts/002_add_task_completion.sql`

4. Inicie o servidor de desenvolvimento:

\`\`\`bash
pnpm dev
\`\`\`

5. Acesse [http://localhost:3000](http://localhost:3000)

## Scripts Disponíveis

\`\`\`bash
pnpm dev          # Inicia o servidor de desenvolvimento
pnpm build        # Cria build de produção
pnpm start        # Inicia servidor de produção
pnpm lint         # Executa o linter
\`\`\`

## Estrutura do Projeto

\`\`\`
├── app/
│   ├── auth/              # Páginas de autenticação
│   ├── dashboard/         # Dashboard com métricas
│   ├── settings/          # Configurações do usuário
│   └── page.tsx           # Página principal (calendário)
├── components/
│   ├── ui/                # Componentes base (shadcn)
│   ├── calendar.tsx       # Componente principal do calendário
│   ├── week-view.tsx      # Visualização semanal
│   ├── kanban-view.tsx    # Visualização Kanban/Trello
│   ├── dashboard-content.tsx  # Conteúdo da dashboard
│   ├── settings-content.tsx   # Conteúdo de configurações
│   ├── sidebar.tsx        # Navegação lateral
│   └── task-dialog.tsx    # Modal de criar/editar tarefa
├── lib/
│   └── supabase/          # Configuração Supabase
│       ├── client.ts      # Cliente browser
│       ├── server.ts      # Cliente servidor
│       └── middleware.ts  # Middleware de autenticação
└── scripts/
    ├── 001_create_tasks_table.sql     # Criação inicial do banco
    └── 002_add_task_completion.sql    # Adiciona campos de conclusão
\`\`\`

## Banco de Dados

### Tabelas

- **tasks**: Armazena todas as tarefas dos usuários
  - Campos: id, user_id, title, description, start_time, end_time, color, completed, completed_at, category, priority
  
- **goals**: Metas mensais de horas por categoria
  - Campos: id, user_id, title, target_hours, month, year, category
  
- **user_preferences**: Preferências do usuário
  - Campos: user_id, theme, notifications_enabled, work_hours_start, work_hours_end, default_task_duration

### Segurança

Todas as tabelas possuem Row Level Security (RLS) habilitado, garantindo que cada usuário só acesse seus próprios dados.

## Uso

### Criar uma Tarefa

1. Na visualização semanal, clique em qualquer célula de horário
2. Preencha o formulário com:
   - Título e descrição
   - Categoria (Trabalho, Pessoal, Estudo, Saúde, Outros)
   - Prioridade (Baixa, Média, Alta)
   - Horário de início e fim
   - Cor
3. Clique em "Salvar"

### Concluir uma Tarefa

- Clique no checkbox ao lado da tarefa para marcá-la como concluída
- Tarefas concluídas ficam com texto riscado

### Visualizar Dashboard

1. Clique em "Dashboard" na sidebar
2. Veja métricas como:
   - Total de tarefas do mês
   - Taxa de conclusão
   - Horas totais e concluídas
   - Gráficos por categoria e progresso semanal

### Configurações

1. Clique em "Configurações" na sidebar
2. Personalize:
   - Tema (Claro/Escuro/Sistema)
   - Horário de trabalho padrão
   - Duração padrão de tarefas
   - Notificações

## Deploy

Este projeto está pronto para deploy na Vercel:

\`\`\`bash
# Certifique-se de que as variáveis de ambiente do Supabase estão configuradas
pnpm build
\`\`\`

Ou use o botão de deploy direto da interface do v0.

## Suporte

Para problemas ou dúvidas, abra uma issue no repositório.

## Licença

MIT
