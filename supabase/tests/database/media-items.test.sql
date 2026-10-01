-- media_items: a cache of search results. Signed-in users read it; only the
-- search-media edge function (service role) writes it.
begin;
select plan(9);

select tests.create_user('taffy');

select has_table('public', 'media_items', 'media_items exists');
select ok(
  (select relrowsecurity from pg_class where oid = 'public.media_items'::regclass),
  'media_items has row level security on'
);

-- The edge function writes with the service role.
select tests.clear_authentication();
set local role service_role;
select lives_ok(
  $$insert into public.media_items (type, provider, external_id, title, year)
    values ('movie', 'tmdb', 'movie:600', 'Full Metal Jacket', 1987)$$,
  'the service role can cache a search result'
);
select throws_ok(
  $$insert into public.media_items (type, provider, external_id, title)
    values ('movie', 'tmdb', 'movie:600', 'Full Metal Jacket again')$$,
  '23505', null,
  'one row per provider and external id'
);
reset role;

select tests.authenticate_as('taffy');
select results_eq(
  $$select title, year from public.media_items where external_id = 'movie:600'$$,
  $$values ('Full Metal Jacket', 1987)$$,
  'signed-in users can read cached media'
);
select throws_ok(
  $$insert into public.media_items (type, provider, external_id, title)
    values ('movie', 'tmdb', 'movie:1', 'Sneaky')$$,
  '42501', null,
  'signed-in users cannot add media'
);
select throws_ok(
  $$update public.media_items set title = 'Half Metal Jacket'$$,
  '42501', null,
  'signed-in users cannot change media'
);
select throws_ok(
  $$delete from public.media_items$$,
  '42501', null,
  'signed-in users cannot delete media'
);

select tests.authenticate_as_anon();
select throws_ok(
  $$select * from public.media_items$$,
  '42501', null,
  'visitors who are not signed in cannot read media'
);

select * from finish();
rollback;
