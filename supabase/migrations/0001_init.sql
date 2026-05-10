-- LifeOS schema v1
-- Life graph foundation: profile, goals, constraints, commitments, time_blocks, checkins,
-- executions, memory_facts (the moat), life_phases, reflections.

create extension if not exists "uuid-ossp";

-- ============================================================================
-- domain enums (kept as text + check for forward-compat / cheap migrations)
-- ============================================================================

do $$ begin
  create type domain_category as enum (
    'fitness', 'nutrition', 'study', 'bjj', 'recovery',
    'social', 'hobby', 'work', 'sleep'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type performance_mode as enum (
    'default', 'mass', 'fight_camp', 'exam_week', 'fat_loss', 'recovery', 'travel'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type block_status as enum ('planned', 'completed', 'skipped', 'modified');
exception when duplicate_object then null; end $$;

-- ============================================================================
-- profiles
-- ============================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  wake_time time,
  sleep_time time,
  timezone text default 'UTC',
  current_phase performance_mode default 'default',
  onboarded boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================================
-- goals (ranked priorities)
-- ============================================================================
create table if not exists public.goals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  category domain_category not null,
  title text not null,
  description text,
  priority int not null default 5,
  target_date date,
  current_level text,
  active boolean default true,
  created_at timestamptz default now()
);
create index if not exists goals_user_priority_idx on public.goals (user_id, priority);

-- ============================================================================
-- constraints
-- ============================================================================
create table if not exists public.user_constraints (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  description text not null,
  active boolean default true,
  created_at timestamptz default now()
);
create index if not exists constraints_user_idx on public.user_constraints (user_id, active);

-- ============================================================================
-- commitments (recurring fixed items)
-- ============================================================================
create table if not exists public.commitments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  category domain_category,
  rrule text,
  start_time time,
  end_time time,
  notes text,
  active boolean default true,
  created_at timestamptz default now()
);
create index if not exists commitments_user_idx on public.commitments (user_id);

-- ============================================================================
-- time_blocks (the schedule)
-- ============================================================================
create table if not exists public.time_blocks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  date date not null,
  start_time time not null,
  end_time time not null,
  category domain_category not null,
  title text not null,
  why text,
  intensity smallint check (intensity between 0 and 10),
  priority smallint,
  detailed_plan jsonb default '{}'::jsonb,
  success_criteria text[],
  status block_status default 'planned',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists time_blocks_user_date_idx on public.time_blocks (user_id, date);
create index if not exists time_blocks_status_idx on public.time_blocks (user_id, status);

-- ============================================================================
-- daily check-ins (low friction)
-- ============================================================================
create table if not exists public.checkins (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  date date not null,
  sleep_quality smallint check (sleep_quality between 0 and 10),
  soreness smallint check (soreness between 0 and 10),
  motivation smallint check (motivation between 0 and 10),
  stress smallint check (stress between 0 and 10),
  time_available_min int,
  notes text,
  created_at timestamptz default now(),
  unique (user_id, date)
);
create index if not exists checkins_user_date_idx on public.checkins (user_id, date desc);

-- ============================================================================
-- executions (planned vs reality)
-- ============================================================================
create table if not exists public.executions (
  id uuid primary key default uuid_generate_v4(),
  block_id uuid not null references public.time_blocks(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  completed boolean,
  modifications text,
  reality jsonb default '{}'::jsonb,
  reflection text,
  created_at timestamptz default now()
);
create index if not exists executions_user_idx on public.executions (user_id, created_at desc);

-- ============================================================================
-- memory_facts (the durable life graph — the moat)
-- ============================================================================
create table if not exists public.memory_facts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  domain domain_category,
  fact text not null,
  confidence smallint default 50 check (confidence between 0 and 100),
  source text,
  evidence jsonb default '{}'::jsonb,
  user_confirmed boolean default false,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists memory_user_active_idx on public.memory_facts (user_id, active);
create index if not exists memory_user_confidence_idx on public.memory_facts (user_id, confidence desc);

-- ============================================================================
-- life phases
-- ============================================================================
create table if not exists public.life_phases (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  phase performance_mode not null,
  started_on date not null,
  ended_on date,
  detected_via text,
  notes text,
  created_at timestamptz default now()
);
create index if not exists life_phases_user_idx on public.life_phases (user_id, started_on desc);

-- ============================================================================
-- weekly reflections
-- ============================================================================
create table if not exists public.reflections (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  week_of date not null,
  summary text,
  insights text[],
  adjustments_for_next_week text[],
  created_at timestamptz default now(),
  unique (user_id, week_of)
);

-- ============================================================================
-- updated_at triggers
-- ============================================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists time_blocks_set_updated_at on public.time_blocks;
create trigger time_blocks_set_updated_at before update on public.time_blocks
  for each row execute function public.set_updated_at();

drop trigger if exists memory_facts_set_updated_at on public.memory_facts;
create trigger memory_facts_set_updated_at before update on public.memory_facts
  for each row execute function public.set_updated_at();

-- ============================================================================
-- profile auto-create on auth signup
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id) values (new.id) on conflict do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- Row-level security: every table is owned by user_id = auth.uid()
-- ============================================================================
alter table public.profiles          enable row level security;
alter table public.goals             enable row level security;
alter table public.user_constraints  enable row level security;
alter table public.commitments       enable row level security;
alter table public.time_blocks       enable row level security;
alter table public.checkins          enable row level security;
alter table public.executions        enable row level security;
alter table public.memory_facts      enable row level security;
alter table public.life_phases       enable row level security;
alter table public.reflections       enable row level security;

-- profiles: users can read/update their own
drop policy if exists profiles_self on public.profiles;
create policy profiles_self on public.profiles
  for all using (id = auth.uid()) with check (id = auth.uid());

-- helper macro for tables keyed by user_id
do $$
declare t text;
begin
  for t in
    select unnest(array[
      'goals','user_constraints','commitments','time_blocks',
      'checkins','executions','memory_facts','life_phases','reflections'
    ])
  loop
    execute format('drop policy if exists %I_self on public.%I', t, t);
    execute format(
      'create policy %I_self on public.%I for all using (user_id = auth.uid()) with check (user_id = auth.uid())',
      t, t
    );
  end loop;
end $$;
