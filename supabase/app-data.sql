-- PokemonTeamForge - Supabase static app data schema
-- Run after auth-saved-teams.sql. This stores normalized Pokemon, moves,
-- abilities, and competitive items imported from PokéAPI.

create extension if not exists "pg_trgm";

create table if not exists public.pokemon (
  id int primary key,
  slug text not null unique,
  name text not null,
  species_slug text not null,
  generation int not null check (generation between 1 and 9),
  region text not null,
  primary_type text not null check (
    primary_type in (
      'normal', 'fire', 'water', 'electric', 'grass', 'ice',
      'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
      'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
    )
  ),
  secondary_type text check (
    secondary_type is null or secondary_type in (
      'normal', 'fire', 'water', 'electric', 'grass', 'ice',
      'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
      'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
    )
  ),
  hp int not null check (hp >= 0),
  attack int not null check (attack >= 0),
  defense int not null check (defense >= 0),
  special_attack int not null check (special_attack >= 0),
  special_defense int not null check (special_defense >= 0),
  speed int not null check (speed >= 0),
  total int generated always as (
    hp + attack + defense + special_attack + special_defense + speed
  ) stored,
  is_legendary boolean not null default false,
  is_mythical boolean not null default false,
  is_fully_evolved boolean not null default true,
  sprite_normal_url text,
  sprite_shiny_url text,
  roles text[] not null default '{}',
  source_updated_at timestamptz,
  imported_at timestamptz not null default timezone('utc', now())
);

alter table public.pokemon
  add column if not exists is_fully_evolved boolean not null default true;

create table if not exists public.abilities (
  id int primary key,
  slug text not null unique,
  name text not null,
  description text,
  imported_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.pokemon_abilities (
  pokemon_id int not null references public.pokemon (id) on delete cascade,
  ability_id int not null references public.abilities (id) on delete restrict,
  slot int not null check (slot >= 1),
  is_hidden boolean not null default false,
  primary key (pokemon_id, ability_id)
);

create table if not exists public.moves (
  id int primary key,
  slug text not null unique,
  name text not null,
  type text not null check (
    type in (
      'normal', 'fire', 'water', 'electric', 'grass', 'ice',
      'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
      'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
    )
  ),
  category text not null check (category in ('physical', 'special', 'status')),
  power int check (power is null or power >= 0),
  accuracy int check (accuracy is null or accuracy >= 0),
  pp int check (pp is null or pp >= 0),
  priority int not null default 0,
  description text,
  tags text[] not null default '{}',
  imported_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.pokemon_moves (
  pokemon_id int not null references public.pokemon (id) on delete cascade,
  move_id int not null references public.moves (id) on delete restrict,
  primary key (pokemon_id, move_id)
);

create table if not exists public.items (
  id int primary key,
  slug text not null unique,
  name text not null,
  category text,
  competitive_group text not null default 'niche',
  competitive_group_order int not null default 900,
  sort_order int not null default 0,
  description text,
  short_effect text,
  icon_url text,
  icon_storage_path text,
  cost int check (cost is null or cost >= 0),
  fling_power int check (fling_power is null or fling_power >= 0),
  fling_effect text,
  tags text[] not null default '{}',
  is_competitive boolean not null default false,
  imported_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.import_runs (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  target text not null,
  status text not null check (status in ('started', 'succeeded', 'failed')),
  started_at timestamptz not null default timezone('utc', now()),
  finished_at timestamptz,
  rows_processed int not null default 0,
  error_message text,
  metadata jsonb not null default '{}'::jsonb
);

-- Pokedex list/search/sort indexes.
create index if not exists idx_pokemon_slug on public.pokemon (slug);
create index if not exists idx_pokemon_name on public.pokemon (name);
create index if not exists idx_pokemon_name_trgm on public.pokemon using gin (name gin_trgm_ops);
create index if not exists idx_pokemon_slug_trgm on public.pokemon using gin (slug gin_trgm_ops);
create index if not exists idx_pokemon_generation on public.pokemon (generation);
create index if not exists idx_pokemon_primary_type on public.pokemon (primary_type);
create index if not exists idx_pokemon_secondary_type on public.pokemon (secondary_type);
create index if not exists idx_pokemon_total on public.pokemon (total desc, id asc);
create index if not exists idx_pokemon_hp on public.pokemon (hp desc, id asc);
create index if not exists idx_pokemon_attack on public.pokemon (attack desc, id asc);
create index if not exists idx_pokemon_defense on public.pokemon (defense desc, id asc);
create index if not exists idx_pokemon_special_attack on public.pokemon (special_attack desc, id asc);
create index if not exists idx_pokemon_special_defense on public.pokemon (special_defense desc, id asc);
create index if not exists idx_pokemon_speed on public.pokemon (speed desc, id asc);
create index if not exists idx_pokemon_roles on public.pokemon using gin (roles);
create index if not exists idx_pokemon_is_fully_evolved on public.pokemon (is_fully_evolved);

-- Join table indexes.
create index if not exists idx_pokemon_abilities_ability_id on public.pokemon_abilities (ability_id);
create index if not exists idx_pokemon_moves_move_id on public.pokemon_moves (move_id);

-- Item selector indexes.
create index if not exists idx_items_slug on public.items (slug);
create index if not exists idx_items_name on public.items (name);
create index if not exists idx_items_name_trgm on public.items using gin (name gin_trgm_ops);
create index if not exists idx_items_competitive_sort
  on public.items (is_competitive desc, competitive_group_order asc, sort_order asc, name asc);
create index if not exists idx_items_tags on public.items using gin (tags);

-- Import tracking indexes.
create index if not exists idx_import_runs_target_started_at
  on public.import_runs (target, started_at desc);

alter table public.pokemon enable row level security;
alter table public.abilities enable row level security;
alter table public.pokemon_abilities enable row level security;
alter table public.moves enable row level security;
alter table public.pokemon_moves enable row level security;
alter table public.items enable row level security;
alter table public.import_runs enable row level security;

-- Static catalog data is public read-only to app clients.
drop policy if exists "pokemon_public_read" on public.pokemon;
create policy "pokemon_public_read"
on public.pokemon
for select
to anon, authenticated
using (true);

drop policy if exists "abilities_public_read" on public.abilities;
create policy "abilities_public_read"
on public.abilities
for select
to anon, authenticated
using (true);

drop policy if exists "pokemon_abilities_public_read" on public.pokemon_abilities;
create policy "pokemon_abilities_public_read"
on public.pokemon_abilities
for select
to anon, authenticated
using (true);

drop policy if exists "moves_public_read" on public.moves;
create policy "moves_public_read"
on public.moves
for select
to anon, authenticated
using (true);

drop policy if exists "pokemon_moves_public_read" on public.pokemon_moves;
create policy "pokemon_moves_public_read"
on public.pokemon_moves
for select
to anon, authenticated
using (true);

drop policy if exists "items_public_read" on public.items;
create policy "items_public_read"
on public.items
for select
to anon, authenticated
using (true);

-- Import runs are admin-only. service_role bypasses RLS; no public policies.

grant select on public.pokemon to anon, authenticated;
grant select on public.abilities to anon, authenticated;
grant select on public.pokemon_abilities to anon, authenticated;
grant select on public.moves to anon, authenticated;
grant select on public.pokemon_moves to anon, authenticated;
grant select on public.items to anon, authenticated;

grant all on table public.pokemon to service_role;
grant all on table public.abilities to service_role;
grant all on table public.pokemon_abilities to service_role;
grant all on table public.moves to service_role;
grant all on table public.pokemon_moves to service_role;
grant all on table public.items to service_role;
grant all on table public.import_runs to service_role;
