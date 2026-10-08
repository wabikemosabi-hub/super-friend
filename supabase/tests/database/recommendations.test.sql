begin;
select plan(28);

select tests.create_user('taffy');
select tests.create_user('roy');
select tests.create_user('karl');
select tests.create_user('tc');
select tests.create_user('outsider');
insert into public.profiles (id, username) values
  (tests.user_id('taffy'), 'taffy-lee-fubbins'),
  (tests.user_id('roy'), 'roy-donk'),
  (tests.user_id('karl'), 'karl-havoc'),
  (tests.user_id('tc'), 'tc-tuggers'),
  (tests.user_id('outsider'), 'the-outsider');

delete from public.media_items where external_id like 'movie:test-%' or external_id like 'tv:test-%';
insert into public.media_items (type, provider, external_id, title, year) values
  ('movie', 'tmdb', 'movie:test-1', 'Coffin Flop', 2019),
  ('movie', 'tmdb', 'movie:test-2', 'Little Buff Boys', 2021),
  ('movie', 'tmdb', 'movie:test-3', 'Calico Cut Pants', 2021),
  ('movie', 'tmdb', 'movie:test-4', 'Driving Crooner', 2023),
  ('movie', 'tmdb', 'movie:test-5', 'Detective Crashmore', 2021),
  ('movie', 'tmdb', 'movie:test-6', 'Sloppy Steaks', 2019),
  ('series', 'tmdb', 'tv:test-1', 'The Ghost Tour', 2023);

select tests.authenticate_as('taffy');
select public.send_connection_request('roy-donk');
select public.send_connection_request('karl-havoc');
select public.send_connection_request('tc-tuggers');
select tests.authenticate_as('roy');
select public.send_connection_request('taffy-lee-fubbins');
select tests.authenticate_as('tc');
select public.send_connection_request('taffy-lee-fubbins');
select tests.clear_authentication();

select has_table('public', 'recommendations', 'recommendations exists');
select ok(
  (select relrowsecurity from pg_class where oid = 'public.recommendations'::regclass),
  'recommendations has row level security on'
);

select tests.authenticate_as('taffy');

select throws_ok(
  $$select * from public.recommendations$$,
  '42501', null,
  'nobody reads the table directly'
);

select isnt(
  public.add_recommendation(
    tests.user_id('roy'),
    (select id from public.media_items where external_id = 'movie:test-1'),
    array['The coffin flops', 'You will scream']
  ),
  null,
  'adding a recommendation returns its id'
);

select results_eq(
  $$select outgoing, rank, reasons, external_id, title, year, type
    from public.adventure_recommendations(tests.user_id('roy'))$$,
  $$values (true, 1, array['The coffin flops', 'You will scream'], 'movie:test-1', 'Coffin Flop', 2019, 'movie')$$,
  'the recommender sees it as outgoing'
);

select tests.authenticate_as('roy');
select results_eq(
  $$select outgoing, rank, title from public.adventure_recommendations(tests.user_id('taffy'))$$,
  $$values (false, 1, 'Coffin Flop')$$,
  'the recipient sees it as incoming'
);

select tests.authenticate_as('taffy');
select public.add_recommendation(
  tests.user_id('roy'),
  (select id from public.media_items where external_id = 'movie:test-2'),
  array['  So buff  ', '', '   ']
);
select public.add_recommendation(
  tests.user_id('roy'),
  (select id from public.media_items where external_id = 'movie:test-3'),
  array['Pants']
);

select results_eq(
  $$select rank, title from public.adventure_recommendations(tests.user_id('roy'))$$,
  $$values (1, 'Coffin Flop'), (2, 'Little Buff Boys'), (3, 'Calico Cut Pants')$$,
  'new picks are ranked after the others'
);

select results_eq(
  $$select reasons from public.adventure_recommendations(tests.user_id('roy')) where title = 'Little Buff Boys'$$,
  $$values (array['So buff'])$$,
  'reasons are trimmed and blank ones dropped'
);

select throws_ok(
  $$select public.add_recommendation(tests.user_id('roy'), (select id from public.media_items where external_id = 'movie:test-4'), array[]::text[])$$,
  'Give 1 to 3 reasons',
  'a pick needs at least one reason'
);

select throws_ok(
  $$select public.add_recommendation(tests.user_id('roy'), (select id from public.media_items where external_id = 'movie:test-4'), array['', '  '])$$,
  'Give 1 to 3 reasons',
  'blank reasons do not count'
);

select throws_ok(
  $$select public.add_recommendation(tests.user_id('roy'), (select id from public.media_items where external_id = 'movie:test-4'), null)$$,
  'Give 1 to 3 reasons',
  'missing reasons do not count'
);

select throws_ok(
  $$select public.add_recommendation(tests.user_id('roy'), (select id from public.media_items where external_id = 'movie:test-4'), array['a', 'b', 'c', 'd'])$$,
  'Give 1 to 3 reasons',
  'a pick has at most three reasons'
);

select throws_ok(
  $$select public.add_recommendation(tests.user_id('roy'), (select id from public.media_items where external_id = 'movie:test-4'), array[repeat('x', 141)])$$,
  'Keep each reason under 140 characters',
  'reasons are short'
);

select throws_ok(
  $$select public.add_recommendation(tests.user_id('roy'), (select id from public.media_items where external_id = 'movie:test-1'), array['Again'])$$,
  'That''s already on your list',
  'the same pick cannot go on the list twice'
);

select throws_ok(
  $$select public.add_recommendation(tests.user_id('outsider'), (select id from public.media_items where external_id = 'movie:test-4'), array['Hi'])$$,
  'You can only recommend to fellow nomads',
  'you cannot recommend to a stranger'
);

select throws_ok(
  $$select public.add_recommendation(tests.user_id('karl'), (select id from public.media_items where external_id = 'movie:test-4'), array['Hi'])$$,
  'You can only recommend to fellow nomads',
  'you cannot recommend to someone who has not said yes'
);

select throws_ok(
  $$select public.add_recommendation(tests.user_id('taffy'), (select id from public.media_items where external_id = 'movie:test-4'), array['Hi'])$$,
  'You can only recommend to fellow nomads',
  'you cannot recommend to yourself'
);

select throws_ok(
  $$select public.add_recommendation(tests.user_id('roy'), gen_random_uuid(), array['Hi'])$$,
  'No media item with that id',
  'the media item must exist'
);

select throws_ok(
  $$select public.add_recommendation(tests.user_id('roy'), (select id from public.media_items where external_id = 'movie:test-4'), array['Croon'])$$,
  'Your movie route for roy-donk is full',
  'a route holds three stops'
);

select tests.clear_authentication();
select throws_ok(
  $$insert into public.recommendations (recommender_id, recipient_id, media_item_id, rank, reasons)
    values (tests.user_id('roy'), tests.user_id('taffy'), (select id from public.media_items where external_id = 'movie:test-5'), 4, array['Too far'])$$,
  '23514', null,
  'no stop is ranked past three'
);
select tests.authenticate_as('taffy');

select lives_ok(
  $$select public.add_recommendation(tests.user_id('roy'), (select id from public.media_items where external_id = 'tv:test-1'), array['Spooky'])$$,
  'the five-pick cap is per media type'
);

select results_eq(
  $$select rank from public.adventure_recommendations(tests.user_id('roy')) where type = 'series'$$,
  $$values (1)$$,
  'each media type has its own order'
);

select public.add_recommendation(tests.user_id('tc'), (select id from public.media_items where external_id = 'movie:test-6'), array['For TC']);

select is(
  (select count(*)::int from public.adventure_recommendations(tests.user_id('roy')) where title = 'Sloppy Steaks'),
  0,
  'picks for another nomad stay off this page'
);

select tests.authenticate_as('roy');
select lives_ok(
  $$select public.add_recommendation(tests.user_id('taffy'), (select id from public.media_items where external_id = 'movie:test-1'), array['Right back at you'])$$,
  'the other nomad can recommend the same thing back'
);

select tests.authenticate_as('outsider');
select is_empty(
  $$select * from public.adventure_recommendations(tests.user_id('taffy'))$$,
  'a stranger sees nothing between you and them'
);

select tests.clear_authentication();
insert into public.recommendations (recommender_id, recipient_id, media_item_id, rank, reasons)
values (tests.user_id('taffy'), tests.user_id('karl'), (select id from public.media_items where external_id = 'movie:test-1'), 1, array['Left over']);

select tests.authenticate_as('karl');
select is_empty(
  $$select * from public.adventure_recommendations(tests.user_id('taffy'))$$,
  'picks stay hidden unless you are fellow nomads'
);

select tests.authenticate_as_anon();
select throws_ok(
  $$select public.add_recommendation(gen_random_uuid(), gen_random_uuid(), array['Hi'])$$,
  '42501', null,
  'anon cannot add recommendations'
);
select throws_ok(
  $$select * from public.adventure_recommendations(gen_random_uuid())$$,
  '42501', null,
  'anon cannot read an adventure'
);

select * from finish();
rollback;
