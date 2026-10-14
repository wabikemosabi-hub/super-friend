begin;
select plan(22);

select tests.create_user('taffy');
select tests.create_user('roy');
select tests.create_user('karl');
insert into public.profiles (id, username) values
  (tests.user_id('taffy'), 'taffy-lee-fubbins'),
  (tests.user_id('roy'), 'roy-donk'),
  (tests.user_id('karl'), 'karl-havoc');

delete from public.media_items where external_id like 'movie:test-%';
insert into public.media_items (type, provider, external_id, title, year) values
  ('movie', 'tmdb', 'movie:test-1', 'Coffin Flop', 2019),
  ('movie', 'tmdb', 'movie:test-2', 'Little Buff Boys', 2021),
  ('movie', 'tmdb', 'movie:test-3', 'Calico Cut Pants', 2021),
  ('movie', 'tmdb', 'movie:test-4', 'Driving Crooner', 2023);

select tests.authenticate_as('taffy');
select public.send_connection_request('roy-donk');
select tests.authenticate_as('karl');
select public.send_connection_request('roy-donk');
select tests.authenticate_as('roy');
select public.send_connection_request('taffy-lee-fubbins');
select public.send_connection_request('karl-havoc');

select tests.authenticate_as('taffy');
select public.add_recommendation(tests.user_id('roy'), (select id from public.media_items where external_id = 'movie:test-1'), array['Bones', 'Coffins']);
select public.add_recommendation(tests.user_id('roy'), (select id from public.media_items where external_id = 'movie:test-2'), array['Buff']);
select public.add_recommendation(tests.user_id('roy'), (select id from public.media_items where external_id = 'movie:test-3'), array['Pants']);

select tests.authenticate_as('karl');
select public.add_recommendation(tests.user_id('roy'), (select id from public.media_items where external_id = 'movie:test-1'), array['Flop']);

select tests.clear_authentication();
update public.recommendations set created_at = now() + interval '1 minute' where recommender_id = tests.user_id('karl');

create temp table movies on commit drop as
select
  (select id from public.media_items where external_id = 'movie:test-1') as flop,
  (select id from public.media_items where external_id = 'movie:test-4') as crooner,
  (select x.id from public.recommendations x join public.media_items m on m.id = x.media_item_id
     where x.recipient_id = tests.user_id('roy') and m.external_id = 'movie:test-2') as buff;
grant select on movies to authenticated, anon;

select has_function('public', 'rate_stop', array['uuid', 'integer', 'integer', 'text[]', 'text[]', 'date'], 'rate_stop exists');

select tests.authenticate_as('roy');

select isnt(
  public.rate_stop((select flop from movies), 1, 2, array['  The dog  ', ''], array['Flop'], current_date - 3),
  null,
  'rating a stop returns the rating''s id'
);

select tests.clear_authentication();

select results_eq(
  $$select stars, encounter, good_reasons, bad_reasons, watched_on from public.stop_ratings
    where nomad_id = tests.user_id('roy')$$,
  $$values (1, 2, array['The dog'], array['Flop'], current_date - 3)$$,
  'the rating keeps the stars, encounter, cleaned reasons and watched date'
);

select results_eq(
  $$select navigator_id, promised_reasons from public.stop_ratings where nomad_id = tests.user_id('roy')$$,
  $$values (tests.user_id('taffy'), array['Bones', 'Coffins'])$$,
  'the rating keeps the first navigator and their reasons'
);

select is(
  (select count(*)::int from public.recommendations where recipient_id = tests.user_id('roy') and media_item_id = (select flop from movies)),
  0,
  'the stop leaves every navigator''s route'
);

select results_eq(
  $$select x.rank, m.title from public.recommendations x join public.media_items m on m.id = x.media_item_id
    where x.recommender_id = tests.user_id('taffy') and x.recipient_id = tests.user_id('roy') order by x.rank$$,
  $$values (1, 'Little Buff Boys'), (2, 'Calico Cut Pants')$$,
  'the stops left on the route close up their ranks'
);

select tests.authenticate_as('roy');
select public.rate_stop((select flop from movies), 1, 0, array[]::text[], array['Still a flop'], current_date);
select public.rate_stop((select flop from movies), 4, 0, array['Grew on me'], array[]::text[], current_date);

select tests.clear_authentication();

select results_eq(
  $$select stars, encounter from public.stop_ratings where nomad_id = tests.user_id('roy') order by created_at, watched_on$$,
  $$values (1, 2), (1, 2), (4, 0)$$,
  'a rewatch adds a rating, keeping the encounter unless the stars change'
);

select results_eq(
  $$select distinct navigator_id, promised_reasons from public.stop_ratings where nomad_id = tests.user_id('roy')$$,
  $$values (tests.user_id('taffy'), array['Bones', 'Coffins'])$$,
  'a rewatch keeps the navigator and their reasons'
);

select tests.authenticate_as('roy');

select throws_ok(
  $$select public.rate_stop((select crooner from movies), 3, 0, array['Hi'], array[]::text[], current_date)$$,
  'You can only rate stops plotted for you',
  'you cannot rate media nobody plotted for you'
);

select throws_ok(
  $$select public.rate_stop((select crooner from movies), 6, 0, array['Hi'], array[]::text[], current_date)$$,
  'Pick 1 to 5 stars',
  'stars go up to 5'
);

select throws_ok(
  $$select public.rate_stop((select crooner from movies), 0, 0, array['Hi'], array[]::text[], current_date)$$,
  'Pick 1 to 5 stars',
  'stars start at 1'
);

select throws_ok(
  $$select public.rate_stop((select crooner from movies), 3, -1, array['Hi'], array[]::text[], current_date)$$,
  'No encounter like that',
  'the encounter number cannot be negative'
);

select throws_ok(
  $$select public.rate_stop((select crooner from movies), 3, 0, array[' '], array[''], current_date)$$,
  'Give 1 to 3 reasons',
  'a rating needs at least one reason'
);

select throws_ok(
  $$select public.rate_stop((select crooner from movies), 3, 0, array['a', 'b'], array['c', 'd'], current_date)$$,
  'Give 1 to 3 reasons',
  'a rating has at most 3 reasons, good and bad together'
);

select throws_ok(
  $$select public.rate_stop((select crooner from movies), 3, 0, array[]::text[], array[repeat('x', 141)], current_date)$$,
  'Keep each reason under 140 characters',
  'rating reasons are short'
);

select throws_ok(
  $$select public.rate_stop((select crooner from movies), 3, 0, array['Hi'], array[]::text[], current_date + 2)$$,
  'You can''t have watched it in the future',
  'the watched date cannot be in the future'
);

select lives_ok(
  $$select public.rate_stop((select flop from movies), 4, 0, array['Hi'], array[]::text[], current_date + 1)$$,
  'tomorrow by the database clock is allowed for nomads ahead of UTC'
);

select tests.authenticate_as('taffy');
select throws_ok(
  $$select public.rate_stop((select flop from movies), 3, 0, array['Hi'], array[]::text[], current_date)$$,
  'You can only rate stops plotted for you',
  'a navigator cannot rate a stop they plotted for someone else'
);

select throws_ok(
  $$select public.add_recommendation(tests.user_id('roy'), (select flop from movies), array['Try again'])$$,
  'roy-donk already reached that stop',
  'nobody can plot a stop the nomad already reached'
);

select throws_ok(
  $$select public.replace_recommendation((select buff from movies), (select flop from movies), array['Try again'])$$,
  'roy-donk already reached that stop',
  'nobody can swap in a stop the nomad already reached'
);

select throws_ok(
  $$select * from public.stop_ratings$$,
  '42501', null,
  'nomads cannot read the ratings table directly'
);

select tests.authenticate_as_anon();
select throws_ok(
  $$select public.rate_stop(gen_random_uuid(), 3, 0, array['Hi'], array[]::text[], current_date)$$,
  '42501', null,
  'anon cannot rate a stop'
);

select * from finish();
rollback;
