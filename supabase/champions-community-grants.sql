-- PokemonTeamForge - Community browse grants for anon + authenticated roles
-- Run AFTER supabase/auth-saved-teams.sql and supabase/champions-extension.sql
-- RLS policies in champions-extension.sql already scope public champions rows.
-- authenticated already has SELECT on teams/team_pokemon/profiles from auth-saved-teams;
-- champions tables below were missing authenticated grants (logged-in browse failed).

grant select on public.teams to anon;
grant select on public.team_pokemon to anon;
grant select on public.champions_battle_plans to anon, authenticated;
grant select on public.champions_team_stars to anon, authenticated;
grant select on public.champions_team_comments to anon, authenticated;

-- Community display names (username only; no email).
grant select on public.profiles to anon;
drop policy if exists "profiles_select_public_display" on public.profiles;
create policy "profiles_select_public_display"
on public.profiles
for select
to anon, authenticated
using (true);

-- Seed/import scripts (service_role bypasses RLS but still needs table grants).
grant all on public.champions_battle_plans to service_role;
grant all on public.champions_team_stars to service_role;
grant all on public.champions_team_comments to service_role;

notify pgrst, 'reload schema';
