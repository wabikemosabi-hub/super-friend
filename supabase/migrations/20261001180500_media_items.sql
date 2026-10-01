create table public.media_items (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('movie', 'series', 'book')),
  provider text not null check (provider in ('tmdb', 'hardcover', 'openlibrary')),
  external_id text not null,
  title text not null,
  subtitle text,
  year int,
  image_url text,
  overview text,
  metadata jsonb not null default '{}',
  fetched_at timestamptz not null default now(),
  unique (provider, external_id)
);

alter table public.media_items enable row level security;

create policy "signed-in users read media" on public.media_items
  for select to authenticated using (true);

revoke all on public.media_items from anon;
revoke insert, update, delete, truncate on public.media_items from authenticated;
