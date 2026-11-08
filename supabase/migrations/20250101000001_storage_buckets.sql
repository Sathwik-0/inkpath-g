-- ============================================================================
-- STORAGE BUCKETS SETUP
-- ============================================================================

insert into storage.buckets (id, name, public)
values 
  ('sources', 'sources', false),
  ('panels', 'panels', false),
  ('characters', 'characters', false)
on conflict (id) do nothing;

drop policy if exists "Users manage own source files" on storage.objects;
drop policy if exists "Users manage own panel images" on storage.objects;
drop policy if exists "Users manage own character images" on storage.objects;

create policy "Users manage own source files"
on storage.objects for all
using (bucket_id = 'sources' and auth.uid()::text = (storage.foldername(name))[1])
with check (bucket_id = 'sources' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users manage own panel images"
on storage.objects for all
using (bucket_id = 'panels' and auth.uid()::text = (storage.foldername(name))[1])
with check (bucket_id = 'panels' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users manage own character images"
on storage.objects for all
using (bucket_id = 'characters' and auth.uid()::text = (storage.foldername(name))[1])
with check (bucket_id = 'characters' and auth.uid()::text = (storage.foldername(name))[1]);
