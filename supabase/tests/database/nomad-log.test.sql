begin;
select plan(8);

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
select public.add_recommendation(tests.user_id('roy'), (select id from public.media_items where external_id = 'movie:test-1'), array['Bones']);
select public.add_recommendation(tests.user_id('roy'), (select id from public.media_items where external_id = 'movie:test-2'), array['Buff']);

select tests.authenticate_as('karl');
select public.add_recommendation(tests.user_id('roy'), (select id from public.media_items where external_id = 'movie:test-3'), array['Pants']);

select tests.authenticate_as('roy');
select public.add_recommendation(tests.user_id('taffy'), (select id from public.media_items where external_id = 'movie:test-4'), array['Croon', 'Drive']);
select public.rate_stop((select id from public.media_items where external_id = 'movie:test-1'), 1, 2, array['Flop']);
select public.rate_stop((select id from public.media_items where external_id = 'movie:test-1'), 3, 1, array['Grew on me']);
select public.rate_stop((select id from public.media_items where external_id = 'movie:test-3'), 2, 0, array['Pockets']);

select tests.authenticate_as('taffy');
select public.rate_stop((select id from public.media_items where external_id = 'movie:test-4'), 4, 1, array['Wheels']);

select has_function('public', 'nomad_log', array['uuid'], 'nomad_log exists');

select tests.authenticate_as('roy');

select results_eq(
  $$select mine, title, stars, encounter, reasons from public.nomad_log(tests.user_id('taffy'))$$,
  $$values
    (false, 'Driving Crooner', 4, 1, array['Wheels']),
    (true, 'Coffin Flop', 3, 1, array['Grew on me']),
    (true, 'Coffin Flop', 1, 2, array['Flop'])$$,
  'the log holds every entry between two nomads, newest first, rewatches included'
);

select results_eq(
  $$select navigator, promised_reasons from public.nomad_log(tests.user_id('taffy')) where mine$$,
  $$values ('taffy-lee-fubbins', array['Bones']), ('taffy-lee-fubbins', array['Bones'])$$,
  'your entries carry the navigator and what they promised'
);

select results_eq(
  $$select navigator, promised_reasons from public.nomad_log(tests.user_id('taffy')) where not mine$$,
  $$values ('roy-donk', array['Croon', 'Drive'])$$,
  'their entries about your stops carry you as the navigator'
);

select tests.authenticate_as('taffy');
select results_eq(
  $$select mine, title from public.nomad_log(tests.user_id('roy'))$$,
  $$values (true, 'Driving Crooner'), (false, 'Coffin Flop'), (false, 'Coffin Flop')$$,
  'the other nomad sees the same log from their side'
);

select tests.authenticate_as('karl');
select is(
  (select count(*)::int from public.nomad_log(tests.user_id('taffy'))),
  0,
  'someone who is not a fellow nomad sees nothing'
);

select tests.authenticate_as('roy');
select is(
  (select count(*)::int from public.nomad_log(tests.user_id('roy'))),
  0,
  'a nomad does not look themselves up here'
);

select tests.authenticate_as_anon();
select throws_ok(
  $$select * from public.nomad_log(gen_random_uuid())$$,
  '42501', null,
  'anon cannot read a log'
);

select * from finish();
rollback;
