-- PokemonTeamForge - Evolution chain catalog (run after app-data.sql)
-- Stores normalized PokeAPI evolution trees for Pokémon detail pages.
--
-- After running this file in the Supabase SQL Editor, reload PostgREST:
--   notify pgrst, 'reload schema';

create table if not exists public.evolution_chains (
  id bigint primary key,
  chain_json jsonb not null,
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.pokemon
  add column if not exists evolution_chain_id bigint references public.evolution_chains (id) on delete set null;

create index if not exists idx_pokemon_evolution_chain_id
  on public.pokemon (evolution_chain_id);

alter table public.evolution_chains enable row level security;

drop policy if exists "evolution_chains_public_read" on public.evolution_chains;
create policy "evolution_chains_public_read"
on public.evolution_chains
for select
to anon, authenticated
using (true);

grant select on public.evolution_chains to anon, authenticated;
grant all on table public.evolution_chains to service_role;
