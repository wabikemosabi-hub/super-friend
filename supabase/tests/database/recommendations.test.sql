-- Recommendation RPCs and the privacy rules around recommendations and reasons.
begin;
select plan(48);

select tests.create_user('alice');
select tests.create_user('mom');
select tests.create_user('mike');
select tests.create_user('stranger');

-- Alice is friends with Mom and Mike; Mike is friends with Mom. Nobody knows the stranger.
insert into public.friendships (requester_id, addressee_id, status) values
  (tests.user_id('alice'), tests.user_id('mom'), 'accepted'),
  (tests.user_id('alice'), tests.user_id('mike'), 'accepted'),
  (tests.user_id('mike'), tests.user_id('mom'), 'accepted');

insert into public.media_items (type, provider, external_id, title) values
  ('movie', 'tmdb', 'movie:1', 'Paddington 2'),
  ('movie', 'tmdb', 'movie:2', 'Arrival'),
  ('book', 'openlibrary', '/works/OL1W', 'The Hobbit');

insert into public.stickers (emoji, label, created_by) values
  ('🫖', 'alice custom', tests.user_id('alice')),
  ('🛹', 'mike custom', tests.user_id('mike'));

-- Ids captured as the superuser, so tests can refer to rows the acting user cannot see.
create temp table ids (name text primary key, id uuid not null);
grant select on ids to authenticated;
insert into ids
  select 'movie:' || title, id from public.media_items
  union all
  select 'sticker:' || label, id from public.stickers where label in ('cozy', 'alice custom', 'mike custom');

create function pg_temp.id(p_name text) returns uuid language sql stable as $$
  select id from ids where name = p_name;
$$;

-- ---------------------------------------------------------------------------
-- upsert_reason
-- ---------------------------------------------------------------------------

select tests.authenticate_as('alice');
select isnt(
  public.upsert_reason(tests.user_id('mom'), '  Warms the heart  '),
  null,
  'the author can write a reason for a friend'
);
select results_eq(
  format('select text from public.reasons where recipient_id = %L', tests.user_id('mom')),
  $$values ('Warms the heart')$$,
  'reason text is trimmed'
);
select is(
  public.upsert_reason(tests.user_id('mom'), 'warms the heart'),
  (select id from public.reasons where recipient_id = tests.user_id('mom')),
  'the same text in a different case reuses the reason'
);
select results_eq(
  format('select text from public.reasons where recipient_id = %L', tests.user_id('mom')),
  $$values ('Warms the heart')$$,
  'reusing a reason keeps its original casing'
);
select isnt(
  public.upsert_reason(tests.user_id('mike'), 'Warms the heart'),
  (select id from public.reasons where recipient_id = tests.user_id('mom')),
  'the same text for a different friend is a separate reason'
);
select lives_ok(
  format('select public.upsert_reason(%L, %L)', tests.user_id('alice'), 'Because I said so'),
  'the author can write a reason for themselves'
);
select throws_ok(
  format('select public.upsert_reason(%L, %L)', tests.user_id('stranger'), 'Hi'),
  'P0001', 'You can only write reasons for friends',
  'reasons for non-friends are refused'
);
select throws_ok(
  format('select public.upsert_reason(%L, %L)', tests.user_id('mom'), '   '),
  '23514', null,
  'blank reasons are refused'
);

-- ---------------------------------------------------------------------------
-- send_recommendation to a friend
-- ---------------------------------------------------------------------------

select throws_ok(
  format('select public.send_recommendation(%L, %L)', tests.user_id('stranger'), pg_temp.id('movie:Paddington 2')),
  'P0001', 'You can only recommend to friends',
  'recommending to a non-friend is refused'
);

select lives_ok(
  format(
    'select public.send_recommendation(%L, %L, %L, %L::uuid[], %L::text[])',
    tests.user_id('mom'),
    pg_temp.id('movie:Paddington 2'),
    '  For Sunday  ',
    array[pg_temp.id('sticker:cozy'), pg_temp.id('sticker:alice custom'), pg_temp.id('sticker:mike custom')],
    array['Warms the heart', 'WARMS THE HEART', '   ', 'Cozy night in']
  ),
  'the sender can recommend to a friend with a note, stickers and reasons'
);

select tests.clear_authentication();
insert into ids select 'rec:sunday', id from public.recommendations where note = 'For Sunday';

select results_eq(
  $$select status::text, list_entry_id from public.recommendations where id = pg_temp.id('rec:sunday')$$,
  $$values ('pending', null::uuid)$$,
  'a recommendation to a friend starts pending, with no list entry'
);
select is_empty(
  format('select * from public.list_entries where user_id = %L', tests.user_id('mom')),
  'sending does not touch the recipient''s list'
);
select set_eq(
  $$select s.label from public.recommendation_stickers rs join public.stickers s on s.id = rs.sticker_id
    where rs.recommendation_id = pg_temp.id('rec:sunday')$$,
  array['cozy', 'alice custom'],
  'built-in and the sender''s own stickers attach; other people''s custom stickers do not'
);
select set_eq(
  $$select r.text from public.recommendation_reasons rr join public.reasons r on r.id = rr.reason_id
    where rr.recommendation_id = pg_temp.id('rec:sunday')$$,
  array['Warms the heart', 'Cozy night in'],
  'reasons attach once each; case duplicates and blanks are skipped'
);
select is(
  (select count(*)::int from public.reasons
   where author_id = tests.user_id('alice') and recipient_id = tests.user_id('mom')),
  2,
  'an existing reason is reused rather than duplicated'
);

select tests.authenticate_as('alice');
select lives_ok(
  format('select public.send_recommendation(%L, %L, %L)', tests.user_id('mom'), pg_temp.id('movie:Arrival'), '   '),
  'a blank note is allowed'
);
select tests.clear_authentication();
select is(
  (select count(*)::int from public.recommendations
   where to_user = tests.user_id('mom') and media_item_id = pg_temp.id('movie:Arrival') and note is null),
  1,
  'a blank note is stored as null'
);
insert into ids select 'rec:arrival', id from public.recommendations
  where to_user = tests.user_id('mom') and media_item_id = pg_temp.id('movie:Arrival');

-- ---------------------------------------------------------------------------
-- send_recommendation to yourself is "add to my list"
-- ---------------------------------------------------------------------------

select tests.authenticate_as('alice');
select lives_ok(
  format(
    'select public.send_recommendation(%L, %L, %L, %L::uuid[], %L::text[])',
    tests.user_id('alice'), pg_temp.id('movie:The Hobbit'), 'self one', '{}', array['Because I said so']
  ),
  'a user can recommend to themselves'
);
select results_eq(
  $$select r.status::text, e.user_id, e.media_item_id
    from public.recommendations r join public.list_entries e on e.id = r.list_entry_id
    where r.note = 'self one'$$,
  format('values (%L, %L::uuid, %L::uuid)', 'accepted', tests.user_id('alice'), pg_temp.id('movie:The Hobbit')),
  'a self-recommendation is accepted and linked to a new list entry'
);
select lives_ok(
  format('select public.send_recommendation(%L, %L, %L)', tests.user_id('alice'), pg_temp.id('movie:The Hobbit'), 'self two'),
  'a user can add the same item to their list again'
);
select is(
  (select count(distinct list_entry_id)::int from public.recommendations where note in ('self one', 'self two')),
  1,
  'adding the same item twice reuses the one list entry'
);

-- ---------------------------------------------------------------------------
-- Who can see what
-- ---------------------------------------------------------------------------

select tests.authenticate_as('mom');
select results_eq(
  $$select note from public.recommendations where id = pg_temp.id('rec:sunday')$$,
  $$values ('For Sunday')$$,
  'the recipient can read the recommendation'
);
select set_eq(
  $$select r.text from public.recommendation_reasons rr join public.reasons r on r.id = rr.reason_id
    where rr.recommendation_id = pg_temp.id('rec:sunday')$$,
  array['Warms the heart', 'Cozy night in'],
  'the recipient can read the reasons attached to it'
);
select is(
  (select count(*)::int from public.recommendation_stickers where recommendation_id = pg_temp.id('rec:sunday')),
  2,
  'the recipient can read the stickers attached to it'
);

select tests.authenticate_as('mike');
select is_empty(
  $$select * from public.recommendations where id = pg_temp.id('rec:sunday')$$,
  'a third friend cannot see someone else''s recommendation'
);
select is_empty(
  format('select * from public.reasons where recipient_id = %L', tests.user_id('mom')),
  'Mike never sees the reasons written for Mom'
);
select is_empty(
  $$select * from public.recommendation_reasons where recommendation_id = pg_temp.id('rec:sunday')$$,
  'a third friend cannot see which reasons are attached'
);
select is_empty(
  $$select * from public.recommendation_stickers where recommendation_id = pg_temp.id('rec:sunday')$$,
  'a third friend cannot see which stickers are attached'
);

select throws_ok(
  format(
    'insert into public.recommendations (from_user, to_user, media_item_id) values (%L, %L, %L)',
    tests.user_id('mike'), tests.user_id('mom'), pg_temp.id('movie:Arrival')
  ),
  '42501', null,
  'recommendations cannot be inserted directly'
);
select throws_ok(
  format('insert into public.reasons (recipient_id, text) values (%L, %L)', tests.user_id('mom'), 'sneaky'),
  '42501', null,
  'reasons cannot be inserted directly'
);

-- ---------------------------------------------------------------------------
-- accept_recommendation
-- ---------------------------------------------------------------------------

select tests.authenticate_as('mike');
select throws_ok(
  format('select public.accept_recommendation(%L)', pg_temp.id('rec:sunday')),
  'P0001', 'Recommendation not found',
  'a third party cannot accept someone else''s recommendation'
);
select tests.authenticate_as('alice');
select throws_ok(
  format('select public.accept_recommendation(%L)', pg_temp.id('rec:sunday')),
  'P0001', 'Recommendation not found',
  'the sender cannot accept their own recommendation'
);

select tests.authenticate_as('mom');
select isnt(
  public.accept_recommendation(pg_temp.id('rec:sunday')),
  null,
  'the recipient can accept and gets a list entry id'
);
select results_eq(
  $$select r.status::text, e.media_item_id
    from public.recommendations r join public.list_entries e on e.id = r.list_entry_id
    where r.id = pg_temp.id('rec:sunday')$$,
  format('values (%L, %L::uuid)', 'accepted', pg_temp.id('movie:Paddington 2')),
  'accepting links the recommendation to a list entry for that item'
);

-- Mike recommends the same film; accepting it lands on the same card.
select tests.authenticate_as('mike');
select public.send_recommendation(tests.user_id('mom'), pg_temp.id('movie:Paddington 2'), 'from mike');
select tests.clear_authentication();
insert into ids select 'rec:mike', id from public.recommendations where note = 'from mike';

select tests.authenticate_as('mom');
select is(
  public.accept_recommendation(pg_temp.id('rec:mike')),
  (select list_entry_id from public.recommendations where id = pg_temp.id('rec:sunday')),
  'recommendations of the same item from different friends share one list entry'
);

-- ---------------------------------------------------------------------------
-- dismiss_recommendation
-- ---------------------------------------------------------------------------

select tests.authenticate_as('alice');
select public.dismiss_recommendation(pg_temp.id('rec:arrival'));
select tests.authenticate_as('mom');
select results_eq(
  $$select status::text from public.recommendations where id = pg_temp.id('rec:arrival')$$,
  $$values ('pending')$$,
  'the sender cannot dismiss a recommendation'
);
select public.dismiss_recommendation(pg_temp.id('rec:arrival'));
select results_eq(
  $$select status::text from public.recommendations where id = pg_temp.id('rec:arrival')$$,
  $$values ('dismissed')$$,
  'the recipient can dismiss a pending recommendation'
);
select public.dismiss_recommendation(pg_temp.id('rec:sunday'));
select results_eq(
  $$select status::text from public.recommendations where id = pg_temp.id('rec:sunday')$$,
  $$values ('accepted')$$,
  'an accepted recommendation cannot be dismissed'
);

-- ---------------------------------------------------------------------------
-- Unsending
-- ---------------------------------------------------------------------------

select tests.authenticate_as('alice');
select public.send_recommendation(tests.user_id('mike'), pg_temp.id('movie:Arrival'), 'unsend me');
select tests.clear_authentication();
insert into ids select 'rec:unsend', id from public.recommendations where note = 'unsend me';

select tests.authenticate_as('mike');
delete from public.recommendations where id = pg_temp.id('rec:unsend');
select tests.clear_authentication();
select isnt_empty(
  $$select * from public.recommendations where id = pg_temp.id('rec:unsend')$$,
  'the recipient cannot delete a recommendation'
);

select tests.authenticate_as('alice');
delete from public.recommendations where id = pg_temp.id('rec:sunday');
delete from public.recommendations where id = pg_temp.id('rec:unsend');
select tests.clear_authentication();
select isnt_empty(
  $$select * from public.recommendations where id = pg_temp.id('rec:sunday')$$,
  'the sender cannot unsend an accepted recommendation'
);
select is_empty(
  $$select * from public.recommendations where id = pg_temp.id('rec:unsend')$$,
  'the sender can unsend a pending recommendation'
);

-- ---------------------------------------------------------------------------
-- Editing reasons
-- ---------------------------------------------------------------------------

select tests.authenticate_as('mom');
update public.reasons set text = 'hijacked' where text = 'Cozy night in';
select tests.clear_authentication();
select isnt_empty(
  $$select * from public.reasons where text = 'Cozy night in'$$,
  'the recipient cannot edit a reason'
);

select tests.authenticate_as('alice');
update public.reasons set text = 'Cosy night in' where text = 'Cozy night in';
select tests.clear_authentication();
select isnt_empty(
  $$select * from public.reasons where text = 'Cosy night in'$$,
  'the author can edit a reason''s text'
);

select tests.authenticate_as('alice');
select throws_ok(
  format(
    'update public.reasons set recipient_id = %L where text = %L',
    tests.user_id('stranger'), 'Cosy night in'
  ),
  '42501', null,
  'the author cannot move a reason to another recipient'
);

-- ---------------------------------------------------------------------------
-- Visitors who are not signed in cannot call any of it
-- ---------------------------------------------------------------------------

select tests.clear_authentication();
select ok(not has_function_privilege('anon', 'public.upsert_reason(uuid, text)', 'execute'), 'anon cannot call upsert_reason');
select ok(not has_function_privilege('anon', 'public.send_recommendation(uuid, uuid, text, uuid[], text[])', 'execute'), 'anon cannot call send_recommendation');
select ok(not has_function_privilege('anon', 'public.accept_recommendation(uuid)', 'execute'), 'anon cannot call accept_recommendation');
select ok(not has_function_privilege('anon', 'public.dismiss_recommendation(uuid)', 'execute'), 'anon cannot call dismiss_recommendation');

select * from finish();
rollback;
