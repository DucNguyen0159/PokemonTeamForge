-- PokemonTeamForge - Pokémon form metadata (run after app-data.sql)
-- Groups Mega, Gigantamax, and regional variants for Pokédex display sorting.
-- Does not change primary id or evolution_chains.
--
-- After running in the Supabase SQL Editor:
--   notify pgrst, 'reload schema';
-- Then locally:
--   npm run import:pokemon-data
--   npm run validate:supabase-data

alter table public.pokemon
  add column if not exists form_kind text;

alter table public.pokemon
  add column if not exists base_slug text;

alter table public.pokemon
  add column if not exists pokedex_display_no int;

alter table public.pokemon
  add column if not exists list_sort_rank int;

update public.pokemon
set
  form_kind = coalesce(form_kind, 'default'),
  pokedex_display_no = coalesce(pokedex_display_no, id),
  list_sort_rank = coalesce(list_sort_rank, id * 10)
where form_kind is null
   or pokedex_display_no is null
   or list_sort_rank is null;

alter table public.pokemon
  alter column form_kind set default 'default';

alter table public.pokemon
  alter column form_kind set not null;

alter table public.pokemon
  drop constraint if exists pokemon_form_kind_check;

alter table public.pokemon
  add constraint pokemon_form_kind_check
  check (form_kind in ('default', 'mega', 'gigantamax', 'regional', 'other'));

alter table public.pokemon
  alter column pokedex_display_no set not null;

alter table public.pokemon
  alter column list_sort_rank set not null;

create index if not exists idx_pokemon_pokedex_display_sort
  on public.pokemon (pokedex_display_no, list_sort_rank);

create index if not exists idx_pokemon_species_form_kind
  on public.pokemon (species_slug, form_kind);

create index if not exists idx_pokemon_base_slug
  on public.pokemon (base_slug)
  where base_slug is not null;
