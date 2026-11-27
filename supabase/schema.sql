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
  -- 'healthkit' pour les entrées synchronisées automatiquement depuis l'app Santé
  -- (via un raccourci iOS), nul pour une saisie manuelle.
  source text,
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

-- Défis courir/marcher : une liste libre d'objectifs à cocher, pour motiver
-- en particulier la course (le pas n'y suffit pas).
create table if not exists activity_goals (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  type text not null check (type in ('course', 'marche')),
  completed_at timestamptz,
  -- Programme progressif optionnel : liste ordonnée de séances
  -- [{"title": "...", "duration": "...", "detail": "..."}, ...]. Nul si l'objectif
  -- n'a pas de programme (coché directement, sans étapes intermédiaires).
  program jsonb,
  -- Nombre de séances du programme déjà marquées comme faites.
  program_progress integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists rewards (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  threshold integer not null check (threshold > 0),
  created_at timestamptz not null default now()
);

alter table activity_goals enable row level security;
drop policy if exists "allow all on activity_goals" on activity_goals;
create policy "allow all on activity_goals" on activity_goals
  for all using (true) with check (true);

alter table rewards enable row level security;
drop policy if exists "allow all on rewards" on rewards;
create policy "allow all on rewards" on rewards
  for all using (true) with check (true);
