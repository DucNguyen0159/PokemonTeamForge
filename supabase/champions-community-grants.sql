-- PokemonTeamForge - Champions grants for anon browse + authenticated save/social
-- Run AFTER supabase/auth-saved-teams.sql and supabase/champions-extension.sql
-- RLS policies in champions-extension.sql scope row access; these are table-level grants.
-- authenticated already has SELECT/INSERT/UPDATE/DELETE on teams/team_pokemon from auth-saved-teams.

-- Public community browse (read-only).
grant select on public.teams to anon;
grant select on public.team_pokemon to anon;
grant select on public.champions_battle_plans to anon;
grant select on public.champions_team_stars to anon;
grant select on public.champions_team_comments to anon;

-- Logged-in Champions save/load, stars, and comments (RLS enforces ownership).
grant select, insert, update, delete on public.champions_battle_plans to authenticated;
grant select, insert, delete on public.champions_team_stars to authenticated;
grant select, insert, update, delete on public.champions_team_comments to authenticated;

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
