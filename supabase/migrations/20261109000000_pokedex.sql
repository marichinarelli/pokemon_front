create table public.pokedex_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  pokeapi_id integer not null,
  pokemon_name text not null,
  types text[] not null default '{}',
  artwork_url text not null,
  nickname text,
  photo_url text,
  notes text,
  created_at timestamptz not null default now()
);

create index pokedex_entries_user_id_idx on public.pokedex_entries (user_id);

alter table public.pokedex_entries enable row level security;

create policy "entries: ler as proprias" on public.pokedex_entries
  for select to authenticated using (user_id = auth.uid());
create policy "entries: inserir as proprias" on public.pokedex_entries
  for insert to authenticated with check (user_id = auth.uid());
create policy "entries: editar as proprias" on public.pokedex_entries
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "entries: excluir as proprias" on public.pokedex_entries
  for delete to authenticated using (user_id = auth.uid());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('pokemon-photos', 'pokemon-photos', true, 10485760, array['image/*']);

create policy "fotos: enviar na propria pasta" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'pokemon-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "fotos: atualizar na propria pasta" on storage.objects
  for update to authenticated
  using (bucket_id = 'pokemon-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "fotos: excluir da propria pasta" on storage.objects
  for delete to authenticated
  using (bucket_id = 'pokemon-photos' and (storage.foldername(name))[1] = auth.uid()::text);
