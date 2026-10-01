create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null check (username ~ '^[a-zA-Z0-9_]{3,24}$'),
  avatar_url text,
  created_at timestamptz not null default now()
);

create unique index profiles_username_key on public.profiles (lower(username));

alter table public.profiles enable row level security;

create policy "signed-in users read profiles" on public.profiles
  for select to authenticated using (true);

create policy "create own profile" on public.profiles
  for insert to authenticated with check (id = auth.uid());

create policy "update own profile" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

revoke update on public.profiles from authenticated;
grant update (username, avatar_url) on public.profiles to authenticated;
