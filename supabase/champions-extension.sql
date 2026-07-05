-- PokemonTeamForge - Champions schema extension
-- Run this script AFTER supabase/auth-saved-teams.sql.
-- This extends existing saved-team tables for Champions mode and community interactions.

alter table public.teams
  add column if not exists mode text not null default 'standard' check (mode in ('standard', 'champions')),
  add column if not exists format_support text check (format_support in ('single', 'double', 'both')),
  add column if not exists champions_ruleset_id text,
  add column if not exists team_notes text;

alter table public.team_pokemon
  add column if not exists stat_alignment text,
  add column if not exists sp_hp int default 0 check (sp_hp >= 0 and sp_hp <= 32),
  add column if not exists sp_atk int default 0 check (sp_atk >= 0 and sp_atk <= 32),
  add column if not exists sp_def int default 0 check (sp_def >= 0 and sp_def <= 32),
  add column if not exists sp_spa int default 0 check (sp_spa >= 0 and sp_spa <= 32),
  add column if not exists sp_spd int default 0 check (sp_spd >= 0 and sp_spd <= 32),
  add column if not exists sp_spe int default 0 check (sp_spe >= 0 and sp_spe <= 32),
  add column if not exists mega_stone_id int,
  add column if not exists use_mega_by_default boolean not null default false;

create table if not exists public.champions_battle_plans (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams (id) on delete cascade,
  name text not null,
  format text not null check (format in ('single', 'double')),
  matchup_label text not null default 'Safe Default',
  selected_pokemon_slots int[] not null default '{}',
  lead_pokemon_slots int[] not null default '{}',
  backup_pokemon_slots int[] not null default '{}',
  win_condition_note text,
  avoid_note text,
  general_note text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_champions_battle_plans_team_id
  on public.champions_battle_plans (team_id);

drop trigger if exists champions_battle_plans_set_updated_at on public.champions_battle_plans;
create trigger champions_battle_plans_set_updated_at
before update on public.champions_battle_plans
for each row
execute function public.set_updated_at();

create table if not exists public.champions_team_stars (
  team_id uuid not null references public.teams (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (team_id, user_id)
);

create index if not exists idx_champions_team_stars_team_id
  on public.champions_team_stars (team_id);

create table if not exists public.champions_team_comments (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_champions_team_comments_team_id
  on public.champions_team_comments (team_id);

drop trigger if exists champions_team_comments_set_updated_at on public.champions_team_comments;
create trigger champions_team_comments_set_updated_at
before update on public.champions_team_comments
for each row
execute function public.set_updated_at();

alter table public.champions_battle_plans enable row level security;
alter table public.champions_team_stars enable row level security;
alter table public.champions_team_comments enable row level security;

-- Public champions browsing: allow reading published champions teams and slots.
drop policy if exists "teams_select_public_champions" on public.teams;
create policy "teams_select_public_champions"
on public.teams
for select
to anon, authenticated
using (mode = 'champions' and is_public = true);

drop policy if exists "team_pokemon_select_public_champions" on public.team_pokemon;
create policy "team_pokemon_select_public_champions"
on public.team_pokemon
for select
to anon, authenticated
using (
  exists (
    select 1 from public.teams t
    where t.id = team_pokemon.team_id
      and t.mode = 'champions'
      and t.is_public = true
  )
);

-- Champions battle plans: only owner of linked team may manage.
drop policy if exists "champions_battle_plans_select_own" on public.champions_battle_plans;
create policy "champions_battle_plans_select_own"
on public.champions_battle_plans
for select
to authenticated
using (
  exists (
    select 1 from public.teams t
    where t.id = champions_battle_plans.team_id and t.user_id = auth.uid()
  )
);

drop policy if exists "champions_battle_plans_select_public" on public.champions_battle_plans;
create policy "champions_battle_plans_select_public"
on public.champions_battle_plans
for select
to anon, authenticated
using (
  exists (
    select 1 from public.teams t
    where t.id = champions_battle_plans.team_id
      and t.mode = 'champions'
      and t.is_public = true
  )
);

drop policy if exists "champions_battle_plans_insert_own" on public.champions_battle_plans;
create policy "champions_battle_plans_insert_own"
on public.champions_battle_plans
for insert
to authenticated
with check (
  exists (
    select 1 from public.teams t
    where t.id = champions_battle_plans.team_id and t.user_id = auth.uid()
  )
);

drop policy if exists "champions_battle_plans_update_own" on public.champions_battle_plans;
create policy "champions_battle_plans_update_own"
on public.champions_battle_plans
for update
to authenticated
using (
  exists (
    select 1 from public.teams t
    where t.id = champions_battle_plans.team_id and t.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.teams t
    where t.id = champions_battle_plans.team_id and t.user_id = auth.uid()
  )
);

drop policy if exists "champions_battle_plans_delete_own" on public.champions_battle_plans;
create policy "champions_battle_plans_delete_own"
on public.champions_battle_plans
for delete
to authenticated
using (
  exists (
    select 1 from public.teams t
    where t.id = champions_battle_plans.team_id and t.user_id = auth.uid()
  )
);

-- Community stars: authenticated users can star public champions teams (except their own).
drop policy if exists "champions_team_stars_select_public" on public.champions_team_stars;
create policy "champions_team_stars_select_public"
on public.champions_team_stars
for select
to anon, authenticated
using (
  exists (
    select 1 from public.teams t
    where t.id = champions_team_stars.team_id and t.mode = 'champions' and t.is_public = true
  )
);

drop policy if exists "champions_team_stars_insert_public_non_owner" on public.champions_team_stars;
create policy "champions_team_stars_insert_public_non_owner"
on public.champions_team_stars
for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.teams t
    where t.id = champions_team_stars.team_id
      and t.mode = 'champions'
      and t.is_public = true
      and t.user_id <> auth.uid()
  )
);

drop policy if exists "champions_team_stars_delete_own" on public.champions_team_stars;
create policy "champions_team_stars_delete_own"
on public.champions_team_stars
for delete
to authenticated
using (user_id = auth.uid());

-- Community comments: authenticated users can read on public champions teams, manage own comments.
drop policy if exists "champions_team_comments_select_public" on public.champions_team_comments;
create policy "champions_team_comments_select_public"
on public.champions_team_comments
for select
to anon, authenticated
using (
  exists (
    select 1 from public.teams t
    where t.id = champions_team_comments.team_id and t.mode = 'champions' and t.is_public = true
  )
);

drop policy if exists "champions_team_comments_insert_public" on public.champions_team_comments;
create policy "champions_team_comments_insert_public"
on public.champions_team_comments
for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.teams t
    where t.id = champions_team_comments.team_id and t.mode = 'champions' and t.is_public = true
  )
);

drop policy if exists "champions_team_comments_update_own" on public.champions_team_comments;
create policy "champions_team_comments_update_own"
on public.champions_team_comments
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "champions_team_comments_delete_own" on public.champions_team_comments;
create policy "champions_team_comments_delete_own"
on public.champions_team_comments
for delete
to authenticated
using (user_id = auth.uid());

grant all on public.champions_battle_plans to service_role;
grant all on public.champions_team_stars to service_role;
grant all on public.champions_team_comments to service_role;

notify pgrst, 'reload schema';
