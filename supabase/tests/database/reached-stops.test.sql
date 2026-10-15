begin;
select plan(6);

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
  ('movie', 'tmdb', 'movie:test-3', 'Calico Cut Pants', 2021);

select tests.authenticate_as('taffy');
select public.send_connection_request('roy-donk');
select tests.authenticate_as('karl');
select public.send_connection_request('roy-donk');
select tests.authenticate_as('roy');
select public.send_connection_request('taffy-lee-fubbins');

select tests.authenticate_as('taffy');
select public.add_recommendation(tests.user_id('roy'), (select id from public.media_items where external_id = 'movie:test-1'), array['Bones']);
select public.add_recommendation(tests.user_id('roy'), (select id from public.media_items where external_id = 'movie:test-2'), array['Buff']);
select public.add_recommendation(tests.user_id('roy'), (select id from public.media_items where external_id = 'movie:test-3'), array['Pants']);

select tests.authenticate_as('roy');
select public.rate_stop((select id from public.media_items where external_id = 'movie:test-1'), 1, 2, array['Flop']);
select public.rate_stop((select id from public.media_items where external_id = 'movie:test-1'), 3, 1, array['Grew on me']);
select public.rate_stop((select id from public.media_items where external_id = 'movie:test-2'), 5, 0, array['Buff']);

select has_function('public', 'reached_stops', array['uuid'], 'reached_stops exists');

select tests.authenticate_as('taffy');

select results_eq(
  $$select external_id, stars, encounter from public.reached_stops(tests.user_id('roy')) order by external_id$$,
  $$values ('movie:test-1', 3, 1), ('movie:test-2', 5, 0)$$,
  'a fellow nomad sees each stop the nomad reached, with the latest rating'
);

select is(
  (select count(*)::int from public.reached_stops(tests.user_id('roy')) where external_id = 'movie:test-3'),
  0,
  'stops still on the route are not reached'
);

select tests.authenticate_as('karl');
select is(
  (select count(*)::int from public.reached_stops(tests.user_id('roy'))),
  0,
  'someone who is not a fellow nomad sees nothing'
);

select tests.authenticate_as('roy');
select is(
  (select count(*)::int from public.reached_stops(tests.user_id('roy'))),
  0,
  'a nomad does not look themselves up here'
);

select tests.authenticate_as_anon();
select throws_ok(
  $$select * from public.reached_stops(gen_random_uuid())$$,
  '42501', null,
  'anon cannot look up reached stops'
);

select * from finish();
rollback;
