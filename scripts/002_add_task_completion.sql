-- Add completion tracking to tasks table
alter table public.tasks
  add column if not exists completed boolean default false,
  add column if not exists completed_at timestamp with time zone,
  add column if not exists category text default 'work',
  add column if not exists priority text default 'medium';

-- Create goals table
create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  target_hours integer not null,
  month integer not null,
  year integer not null,
  category text not null,
  created_at timestamp with time zone default now()
);

-- Enable RLS for goals
alter table public.goals enable row level security;

-- RLS Policies for goals
create policy "Users can view their own goals"
  on public.goals for select
  using (auth.uid() = user_id);

create policy "Users can create their own goals"
  on public.goals for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own goals"
  on public.goals for update
  using (auth.uid() = user_id);

create policy "Users can delete their own goals"
  on public.goals for delete
  using (auth.uid() = user_id);

-- Create user preferences table
create table if not exists public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  theme text default 'light',
  notifications_enabled boolean default true,
  work_hours_start text default '09:00',
  work_hours_end text default '18:00',
  default_task_duration integer default 60,
  updated_at timestamp with time zone default now()
);

-- Enable RLS for user preferences
alter table public.user_preferences enable row level security;

-- RLS Policies for user preferences
create policy "Users can view their own preferences"
  on public.user_preferences for select
  using (auth.uid() = user_id);

create policy "Users can insert their own preferences"
  on public.user_preferences for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own preferences"
  on public.user_preferences for update
  using (auth.uid() = user_id);
