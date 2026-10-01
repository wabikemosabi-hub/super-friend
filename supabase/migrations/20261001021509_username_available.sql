create function public.username_available(name text)
returns boolean
language sql
stable
set search_path = ''
as $$
  select not exists (
    select 1 from public.profiles where lower(username) = lower(name)
  );
$$;

revoke execute on function public.username_available(text) from public, anon;
