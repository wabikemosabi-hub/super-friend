-- Every app table exists and has row level security switched on.
begin;
create extension if not exists pgtap with schema extensions;

select plan(12);

select tables_are(
  'public',
  array[
    'profiles', 'friendships', 'media_items', 'list_entries',
    'recommendations', 'stickers', 'recommendation_stickers',
    'reasons', 'recommendation_reasons', 'watchlists', 'watchlist_items'
  ],
  'public schema has exactly the app tables'
);

select ok(c.relrowsecurity, format('RLS is enabled on public.%I', c.relname))
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r'
order by c.relname;

select * from finish();
rollback;
