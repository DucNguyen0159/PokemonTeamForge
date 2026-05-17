-- PokemonTeamForge - Supabase Storage setup
-- Run after app-data.sql. This creates a public bucket for small item icons.

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'item-icons',
  'item-icons',
  true,
  262144,
  array['image/png', 'image/webp', 'image/svg+xml']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Anyone may read item icons. Import scripts write with the service-role key.
drop policy if exists "item_icons_public_read" on storage.objects;
create policy "item_icons_public_read"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'item-icons');
