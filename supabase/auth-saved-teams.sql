-- PokemonTeamForge - Supabase Auth + Saved Teams schema
-- Run this script in Supabase SQL Editor.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique,
  avatar_url text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  format text not null check (format in ('singles', 'doubles', 'triples')),
  is_public boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.team_pokemon (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams (id) on delete cascade,
  slot int not null check (slot between 1 and 6),
  pokemon_id int not null,
  ability_id int,
  item_id int,
  move_1_id int,
  move_2_id int,
  move_3_id int,
  move_4_id int,
  is_shiny boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  unique (team_id, slot)
);

create table if not exists public.team_cards (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams (id) on delete cascade,
  background_slug text not null,
  trainer_slug text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.favorite_strategy_teams (
  user_id uuid not null references auth.users (id) on delete cascade,
  strategy_team_id uuid not null,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, strategy_team_id)
);

create index if not exists idx_teams_user_id on public.teams (user_id);
create index if not exists idx_team_pokemon_team_id on public.team_pokemon (team_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists teams_set_updated_at on public.teams;
create trigger teams_set_updated_at
before update on public.teams
for each row
execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.teams enable row level security;
alter table public.team_pokemon enable row level security;
alter table public.team_cards enable row level security;
alter table public.favorite_strategy_teams enable row level security;

-- Profiles: users manage only their profile row.
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- Teams: users can only access their own teams.
drop policy if exists "teams_select_own" on public.teams;
create policy "teams_select_own"
on public.teams
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "teams_insert_own" on public.teams;
create policy "teams_insert_own"
on public.teams
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "teams_update_own" on public.teams;
create policy "teams_update_own"
on public.teams
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "teams_delete_own" on public.teams;
create policy "teams_delete_own"
on public.teams
for delete
to authenticated
using (auth.uid() = user_id);

-- Team pokemon rows are accessible only through owner team.
drop policy if exists "team_pokemon_select_own" on public.team_pokemon;
create policy "team_pokemon_select_own"
on public.team_pokemon
for select
to authenticated
using (
  exists (
    select 1
    from public.teams t
    where t.id = team_pokemon.team_id
      and t.user_id = auth.uid()
  )
);

drop policy if exists "team_pokemon_insert_own" on public.team_pokemon;
create policy "team_pokemon_insert_own"
on public.team_pokemon
for insert
to authenticated
with check (
  exists (
    select 1
    from public.teams t
    where t.id = team_pokemon.team_id
      and t.user_id = auth.uid()
  )
);

drop policy if exists "team_pokemon_update_own" on public.team_pokemon;
create policy "team_pokemon_update_own"
on public.team_pokemon
for update
to authenticated
using (
  exists (
    select 1
    from public.teams t
    where t.id = team_pokemon.team_id
      and t.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.teams t
    where t.id = team_pokemon.team_id
      and t.user_id = auth.uid()
  )
);

drop policy if exists "team_pokemon_delete_own" on public.team_pokemon;
create policy "team_pokemon_delete_own"
on public.team_pokemon
for delete
to authenticated
using (
  exists (
    select 1
    from public.teams t
    where t.id = team_pokemon.team_id
      and t.user_id = auth.uid()
  )
);

-- Team cards ownership policy (optional MVP table).
drop policy if exists "team_cards_select_own" on public.team_cards;
create policy "team_cards_select_own"
on public.team_cards
for select
to authenticated
using (
  exists (
    select 1
    from public.teams t
    where t.id = team_cards.team_id
      and t.user_id = auth.uid()
  )
);

drop policy if exists "team_cards_insert_own" on public.team_cards;
create policy "team_cards_insert_own"
on public.team_cards
for insert
to authenticated
with check (
  exists (
    select 1
    from public.teams t
    where t.id = team_cards.team_id
      and t.user_id = auth.uid()
  )
);

drop policy if exists "team_cards_update_own" on public.team_cards;
create policy "team_cards_update_own"
on public.team_cards
for update
to authenticated
using (
  exists (
    select 1
    from public.teams t
    where t.id = team_cards.team_id
      and t.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.teams t
    where t.id = team_cards.team_id
      and t.user_id = auth.uid()
  )
);

drop policy if exists "team_cards_delete_own" on public.team_cards;
create policy "team_cards_delete_own"
on public.team_cards
for delete
to authenticated
using (
  exists (
    select 1
    from public.teams t
    where t.id = team_cards.team_id
      and t.user_id = auth.uid()
  )
);

-- Favorite strategies ownership policy (optional MVP table).
drop policy if exists "favorite_strategy_teams_select_own" on public.favorite_strategy_teams;
create policy "favorite_strategy_teams_select_own"
on public.favorite_strategy_teams
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "favorite_strategy_teams_insert_own" on public.favorite_strategy_teams;
create policy "favorite_strategy_teams_insert_own"
on public.favorite_strategy_teams
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "favorite_strategy_teams_delete_own" on public.favorite_strategy_teams;
create policy "favorite_strategy_teams_delete_own"
on public.favorite_strategy_teams
for delete
to authenticated
using (auth.uid() = user_id);

-- PostgREST / supabase-js: explicit privileges on public tables (RLS still enforces row access).
-- Authenticated CRUD matches our policies above; omit anon grants (no anon policies).
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.teams to authenticated;
grant select, insert, update, delete on public.team_pokemon to authenticated;
grant select, insert, update, delete on public.team_cards to authenticated;
grant select, insert, update, delete on public.favorite_strategy_teams to authenticated;

grant all on table public.profiles to service_role;
grant all on table public.teams to service_role;
grant all on table public.team_pokemon to service_role;
grant all on table public.team_cards to service_role;
grant all on table public.favorite_strategy_teams to service_role;
