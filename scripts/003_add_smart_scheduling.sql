-- Create routine templates table
create table if not exists public.routine_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  is_active boolean default true,
  is_flexible boolean default false, -- modo alternativo quando cansado
  created_at timestamp with time zone default now()
);

-- Create routine template items (blocos de atividades)
create table if not exists public.routine_template_items (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.routine_templates(id) on delete cascade,
  title text not null,
  category text not null,
  priority text default 'medium',
  day_of_week integer not null, -- 0 = domingo, 1 = segunda, etc
  start_time time not null,
  end_time time not null,
  duration_minutes integer not null,
  color text default '#3b82f6',
  break_after_minutes integer default 0, -- margem de descanso
  is_flexible boolean default false, -- pode ser movido se necessário
  notes text,
  created_at timestamp with time zone default now()
);

-- Create scheduling conflicts table
create table if not exists public.scheduling_conflicts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  original_task_id uuid references public.tasks(id) on delete cascade,
  conflict_type text not null, -- 'overlap', 'missed', 'unexpected'
  resolution_status text default 'pending', -- 'pending', 'resolved', 'rescheduled'
  notes text,
  created_at timestamp with time zone default now()
);

-- Create study blocks table (para dividir 2h de estudo em blocos)
create table if not exists public.study_blocks (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  block_type text not null, -- 'focus', 'review', 'practice'
  duration_minutes integer not null,
  order_index integer not null,
  completed boolean default false,
  notes text,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.routine_templates enable row level security;
alter table public.routine_template_items enable row level security;
alter table public.scheduling_conflicts enable row level security;
alter table public.study_blocks enable row level security;

-- RLS Policies for routine_templates
create policy "Users can view their own routine templates"
  on public.routine_templates for select
  using (auth.uid() = user_id);

create policy "Users can create their own routine templates"
  on public.routine_templates for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own routine templates"
  on public.routine_templates for update
  using (auth.uid() = user_id);

create policy "Users can delete their own routine templates"
  on public.routine_templates for delete
  using (auth.uid() = user_id);

-- RLS Policies for routine_template_items
create policy "Users can view their own routine template items"
  on public.routine_template_items for select
  using (exists (
    select 1 from public.routine_templates
    where id = template_id and user_id = auth.uid()
  ));

create policy "Users can create their own routine template items"
  on public.routine_template_items for insert
  with check (exists (
    select 1 from public.routine_templates
    where id = template_id and user_id = auth.uid()
  ));

create policy "Users can update their own routine template items"
  on public.routine_template_items for update
  using (exists (
    select 1 from public.routine_templates
    where id = template_id and user_id = auth.uid()
  ));

create policy "Users can delete their own routine template items"
  on public.routine_template_items for delete
  using (exists (
    select 1 from public.routine_templates
    where id = template_id and user_id = auth.uid()
  ));

-- RLS Policies for scheduling_conflicts
create policy "Users can view their own scheduling conflicts"
  on public.scheduling_conflicts for select
  using (auth.uid() = user_id);

create policy "Users can create their own scheduling conflicts"
  on public.scheduling_conflicts for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own scheduling conflicts"
  on public.scheduling_conflicts for update
  using (auth.uid() = user_id);

create policy "Users can delete their own scheduling conflicts"
  on public.scheduling_conflicts for delete
  using (auth.uid() = user_id);

-- RLS Policies for study_blocks
create policy "Users can view their own study blocks"
  on public.study_blocks for select
  using (exists (
    select 1 from public.tasks
    where id = task_id and user_id = auth.uid()
  ));

create policy "Users can create their own study blocks"
  on public.study_blocks for insert
  with check (exists (
    select 1 from public.tasks
    where id = task_id and user_id = auth.uid()
  ));

create policy "Users can update their own study blocks"
  on public.study_blocks for update
  using (exists (
    select 1 from public.tasks
    where id = task_id and user_id = auth.uid()
  ));

create policy "Users can delete their own study blocks"
  on public.study_blocks for delete
  using (exists (
    select 1 from public.tasks
    where id = task_id and user_id = auth.uid()
  ));
