-- Suivi Pas : un objectif de pas pour l'année, et des entrées qu'on ajoute au fur et à mesure.

create table if not exists step_goals (
  id uuid primary key default gen_random_uuid(),
  year integer not null unique,
  target_steps bigint not null check (target_steps > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists step_entries (
  id uuid primary key default gen_random_uuid(),
  year integer not null,
  date date not null,
  steps bigint not null check (steps > 0),
  note text,
  created_at timestamptz not null default now()
);

create index if not exists step_entries_year_idx on step_entries (year);

-- Pas d'authentification (app privée, usage familial) : accès ouvert via la clé anon.
alter table step_goals enable row level security;
drop policy if exists "allow all on step_goals" on step_goals;
create policy "allow all on step_goals" on step_goals
  for all using (true) with check (true);

alter table step_entries enable row level security;
drop policy if exists "allow all on step_entries" on step_entries;
create policy "allow all on step_entries" on step_entries
  for all using (true) with check (true);
