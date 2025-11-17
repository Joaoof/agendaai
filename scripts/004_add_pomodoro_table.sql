-- Create pomodoro sessions table to track focused work time
create table if not exists public.pomodoro_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  task_id uuid references public.tasks(id) on delete set null,
  duration_minutes integer not null, -- Duration of the focus session in minutes (e.g., 25)
  session_type text not null, -- 'focus', 'short-break', 'long-break'
  completed_at timestamp with time zone default now(),
  created_at timestamp with time zone default now()
);

-- Enable RLS for pomodoro_sessions
alter table public.pomodoro_sessions enable row level security;

-- RLS Policies for pomodoro_sessions
create policy "Users can view their own pomodoro sessions"
  on public.pomodoro_sessions for select
  using (auth.uid() = user_id);

create policy "Users can create their own pomodoro sessions"
  on public.pomodoro_sessions for insert
  with check (auth.uid() = user_id);

-- No update/delete needed for now, as sessions are immutable records