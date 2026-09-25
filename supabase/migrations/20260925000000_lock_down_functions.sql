-- are_friends is security definer, so it bypasses RLS. Only answer for
-- friendships the caller is part of; every RLS policy and RPC that uses it
-- passes auth.uid() as one side.
create or replace function public.are_friends(a uuid, b uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select auth.uid() in (a, b) and exists (
    select 1 from public.friendships f
    where f.status = 'accepted'
      and least(f.requester_id, f.addressee_id) = least(a, b)
      and greatest(f.requester_id, f.addressee_id) = greatest(a, b)
  );
$$;

-- Postgres grants EXECUTE to PUBLIC, and Supabase grants it to anon. Nothing
-- here is for visitors who are not signed in.
revoke execute on all functions in schema public from public, anon;
grant execute on all functions in schema public to authenticated;

-- Same for functions added by later migrations.
alter default privileges in schema public revoke execute on functions from public, anon;
