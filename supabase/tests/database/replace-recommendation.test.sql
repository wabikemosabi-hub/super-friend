begin;
select plan(15);

select tests.create_user('taffy');
select tests.create_user('roy');
select tests.create_user('karl');
insert into public.profiles (id, username) values
  (tests.user_id('taffy'), 'taffy-lee-fubbins'),
  (tests.user_id('roy'), 'roy-donk'),
  (tests.user_id('karl'), 'karl-havoc');

delete from public.media_items where external_id like 'movie:test-%' or external_id like 'tv:test-%';
insert into public.media_items (type, provider, external_id, title, year) values
  ('movie', 'tmdb', 'movie:test-1', 'Coffin Flop', 2019),
  ('movie', 'tmdb', 'movie:test-2', 'Little Buff Boys', 2021),
  ('movie', 'tmdb', 'movie:test-3', 'Calico Cut Pants', 2021),
  ('movie', 'tmdb', 'movie:test-4', 'Driving Crooner', 2023),
  ('movie', 'tmdb', 'movie:test-5', 'Detective Crashmore', 2021),
  ('series', 'tmdb', 'tv:test-1', 'The Ghost Tour', 2023);

select tests.authenticate_as('taffy');
select public.send_connection_request('roy-donk');
select public.send_connection_request('karl-havoc');
select tests.authenticate_as('roy');
select public.send_connection_request('taffy-lee-fubbins');

select public.add_recommendation(tests.user_id('taffy'), (select id from public.media_items where external_id = 'movie:test-5'), array['Crash']);

select tests.authenticate_as('taffy');
select public.add_recommendation(tests.user_id('roy'), (select id from public.media_items where external_id = 'movie:test-1'), array['Flop']);
select public.add_recommendation(tests.user_id('roy'), (select id from public.media_items where external_id = 'movie:test-2'), array['Buff']);
select public.add_recommendation(tests.user_id('roy'), (select id from public.media_items where external_id = 'movie:test-3'), array['Pants']);

select tests.clear_authentication();
insert into public.recommendations (recommender_id, recipient_id, media_item_id, rank, reasons)
values (tests.user_id('taffy'), tests.user_id('karl'), (select id from public.media_items where external_id = 'movie:test-1'), 1, array['Left over']);

create temp table stops on commit drop as
select
  (select id from public.recommendations where recommender_id = tests.user_id('taffy') and recipient_id = tests.user_id('roy')
     and media_item_id = (select id from public.media_items where external_id = 'movie:test-2')) as buff,
  (select id from public.recommendations where recommender_id = tests.user_id('taffy') and recipient_id = tests.user_id('roy') and rank = 3) as pants,
  (select id from public.recommendations where recommender_id = tests.user_id('roy')) as roys,
  (select id from public.recommendations where recipient_id = tests.user_id('karl')) as karls;
grant select on stops to authenticated, anon;

select has_function('public', 'replace_recommendation', array['uuid', 'uuid', 'text[]'], 'replace_recommendation exists');

select tests.authenticate_as('taffy');

select isnt(
  public.replace_recommendation(
    (select buff from stops),
    (select id from public.media_items where external_id = 'movie:test-4'),
    array['  Croon  ', '', 'Drive']
  ),
  null,
  'replacing a stop returns the new stop''s id'
);

select results_eq(
  $$select rank, title from public.adventure_recommendations(tests.user_id('roy')) where outgoing$$,
  $$values (1, 'Coffin Flop'), (2, 'Driving Crooner'), (3, 'Calico Cut Pants')$$,
  'the new stop takes the old stop''s rank'
);

select results_eq(
  $$select reasons from public.adventure_recommendations(tests.user_id('roy')) where title = 'Driving Crooner'$$,
  $$values (array['Croon', 'Drive'])$$,
  'reasons are trimmed and blank ones dropped'
);

select is(
  (select count(*)::int from public.adventure_recommendations(tests.user_id('roy')) where title = 'Little Buff Boys'),
  0,
  'the old stop leaves the route'
);

select throws_ok(
  $$select public.replace_recommendation((select roys from stops), (select id from public.media_items where external_id = 'movie:test-2'), array['Mine now'])$$,
  'No stop like that on your route',
  'you cannot replace a stop someone else plotted'
);

select throws_ok(
  $$select public.replace_recommendation(gen_random_uuid(), (select id from public.media_items where external_id = 'movie:test-2'), array['Hi'])$$,
  'No stop like that on your route',
  'the stop must exist'
);

select throws_ok(
  $$select public.replace_recommendation((select karls from stops), (select id from public.media_items where external_id = 'movie:test-2'), array['Hi'])$$,
  'You can only recommend to fellow nomads',
  'you cannot replace a stop for someone who is not a fellow nomad'
);

select throws_ok(
  $$select public.replace_recommendation((select pants from stops), gen_random_uuid(), array['Hi'])$$,
  'No media item with that id',
  'the media item must exist'
);

select throws_ok(
  $$select public.replace_recommendation((select pants from stops), (select id from public.media_items where external_id = 'tv:test-1'), array['Spooky'])$$,
  'Replace a movie stop with another movie',
  'a stop is replaced with the same media type'
);

select throws_ok(
  $$select public.replace_recommendation((select pants from stops), (select id from public.media_items where external_id = 'movie:test-2'), array['', ' '])$$,
  'Give 1 to 3 reasons',
  'a replacement needs at least one reason'
);

select throws_ok(
  $$select public.replace_recommendation((select pants from stops), (select id from public.media_items where external_id = 'movie:test-2'), array[repeat('x', 141)])$$,
  'Keep each reason under 140 characters',
  'replacement reasons are short'
);

select throws_ok(
  $$select public.replace_recommendation((select pants from stops), (select id from public.media_items where external_id = 'movie:test-1'), array['Twice'])$$,
  'That''s already on your list',
  'a replacement cannot already be on the route'
);

select tests.authenticate_as('roy');
select results_eq(
  $$select outgoing, rank, title from public.adventure_recommendations(tests.user_id('taffy')) where not outgoing$$,
  $$values (false, 1, 'Coffin Flop'), (false, 2, 'Driving Crooner'), (false, 3, 'Calico Cut Pants')$$,
  'the nomad sees the new stop in its place'
);

select tests.authenticate_as_anon();
select throws_ok(
  $$select public.replace_recommendation(gen_random_uuid(), gen_random_uuid(), array['Hi'])$$,
  '42501', null,
  'anon cannot replace a stop'
);

select * from finish();
rollback;
