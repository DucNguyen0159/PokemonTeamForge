-- PokemonTeamForge - Supabase Storage for self-hosted Pokemon sprites
-- Run after app-storage.sql (or standalone on existing projects).
-- Import scripts upload artwork here; pokemon.sprite_normal_url points at public URLs.

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'pokemon-sprites',
  'pokemon-sprites',
  true,
  2097152,
  array['image/png', 'image/webp', 'image/jpeg']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "pokemon_sprites_public_read" on storage.objects;
create policy "pokemon_sprites_public_read"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'pokemon-sprites');

notify pgrst, 'reload schema';
