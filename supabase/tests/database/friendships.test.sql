-- Friendship RPCs and the privacy rules around them.
begin;
select plan(41);

select tests.create_user('alice');
select tests.create_user('bob');
select tests.create_user('carol');
select tests.create_user('dave');

-- ---------------------------------------------------------------------------
-- The table itself is off limits
-- ---------------------------------------------------------------------------

select tests.clear_authentication();
insert into public.friendships (requester_id, addressee_id, status)
values (tests.user_id('carol'), tests.user_id('dave'), 'accepted');

select tests.authenticate_as('carol');
select is_empty(
  'select * from public.friendships',
  'users cannot read friendships directly, even their own'
);
select throws_ok(
  format(
    'insert into public.friendships (requester_id, addressee_id) values (%L, %L)',
    tests.user_id('carol'), tests.user_id('alice')
  ),
  '42501',
  null,
  'users cannot insert friendships directly'
);

-- ---------------------------------------------------------------------------
-- send_friend_request
-- ---------------------------------------------------------------------------

select tests.authenticate_as('alice');
select lives_ok($$select public.send_friend_request('BOB')$$, 'usernames match case-insensitively');
select results_eq(
  $$select username, status::text, outgoing from public.my_connections()$$,
  $$values ('bob', 'pending', true)$$,
  'the requester sees an outgoing pending request'
);

select tests.authenticate_as('bob');
select results_eq(
  $$select username, status::text, outgoing from public.my_connections()$$,
  $$values ('alice', 'pending', false)$$,
  'the addressee sees an incoming pending request'
);

select tests.authenticate_as('alice');
select throws_ok(
  $$select public.send_friend_request('nobody')$$,
  'P0001', 'No user named nobody',
  'requesting an unknown username fails'
);
select throws_ok(
  $$select public.send_friend_request('alice')$$,
  'P0001', 'No user named alice',
  'requesting yourself fails'
);
select lives_ok($$select public.send_friend_request('bob')$$, 'repeating a pending request is allowed');

select tests.clear_authentication();
select is(
  (select count(*)::int from public.friendships
   where tests.user_id('alice') in (requester_id, addressee_id)),
  1,
  'a repeated request does not create a second row'
);

-- Crossed requests: bob asking alice back means yes.
select tests.authenticate_as('bob');
select lives_ok($$select public.send_friend_request('alice')$$, 'the addressee can request back');
select results_eq(
  $$select username, status::text from public.my_connections()$$,
  $$values ('alice', 'accepted')$$,
  'a crossed request becomes a friendship'
);
select ok(public.are_friends(tests.user_id('alice'), tests.user_id('bob')), 'are_friends is true for friends');

-- ---------------------------------------------------------------------------
-- respond_friend_request
-- ---------------------------------------------------------------------------

select tests.authenticate_as('alice');
select public.send_friend_request('carol');

-- The requester cannot accept their own request.
select public.respond_friend_request(
  (select friendship_id from public.my_connections() where username = 'carol'), true
);
select results_eq(
  $$select status::text from public.my_connections() where username = 'carol'$$,
  $$values ('pending')$$,
  'the requester cannot accept their own request'
);

-- Carol declines.
select tests.authenticate_as('carol');
select lives_ok(
  $$select public.respond_friend_request(
      (select friendship_id from public.my_connections() where username = 'alice'), false)$$,
  'the addressee can decline'
);
select is_empty(
  $$select * from public.my_connections() where username = 'alice'$$,
  'a declined request disappears for the addressee'
);

select tests.authenticate_as('alice');
select results_eq(
  $$select status::text, outgoing from public.my_connections() where username = 'carol'$$,
  $$values ('pending', true)$$,
  'a declined request still looks pending to the requester'
);
select public.send_friend_request('carol');
select results_eq(
  $$select status::text from public.my_connections() where username = 'carol'$$,
  $$values ('pending')$$,
  'asking again after being declined changes nothing'
);
select tests.clear_authentication();
select is(
  (select status::text from public.friendships
   where requester_id = tests.user_id('alice') and addressee_id = tests.user_id('carol')),
  'declined',
  'asking again after being declined keeps the row declined'
);

-- Carol changes her mind.
select tests.authenticate_as('carol');
select public.send_friend_request('alice');
select results_eq(
  $$select status::text, outgoing from public.my_connections() where username = 'alice'$$,
  $$values ('pending', true)$$,
  'the decliner can later send their own request'
);

select tests.authenticate_as('alice');
select lives_ok(
  $$select public.respond_friend_request(
      (select friendship_id from public.my_connections() where username = 'carol'), true)$$,
  'the new addressee can accept'
);
select ok(public.are_friends(tests.user_id('alice'), tests.user_id('carol')), 'alice and carol are now friends');

-- ---------------------------------------------------------------------------
-- remove_friend
-- ---------------------------------------------------------------------------

select tests.authenticate_as('alice');
select lives_ok(
  format('select public.remove_friend(%L)', tests.user_id('carol')),
  'a user can remove a friend'
);
select ok(not public.are_friends(tests.user_id('alice'), tests.user_id('carol')), 'removed friends are no longer friends');
select is_empty(
  $$select * from public.my_connections() where username = 'carol'$$,
  'a removed friend disappears from connections'
);

select public.send_friend_request('dave');
select public.remove_friend(tests.user_id('dave'));
select is_empty(
  $$select * from public.my_connections() where username = 'dave'$$,
  'remove_friend withdraws a pending request'
);

-- ---------------------------------------------------------------------------
-- block_user / unblock_user
-- ---------------------------------------------------------------------------

select tests.authenticate_as('alice');
select throws_ok(
  format('select public.block_user(%L)', tests.user_id('alice')),
  'P0001', 'You cannot block yourself',
  'users cannot block themselves'
);

-- Alice blocks her friend bob.
select lives_ok(format('select public.block_user(%L)', tests.user_id('bob')), 'a user can block a friend');
select ok(not public.are_friends(tests.user_id('alice'), tests.user_id('bob')), 'blocking ends the friendship');
select results_eq(
  $$select username, status::text from public.my_connections() where username = 'bob'$$,
  $$values ('bob', 'blocked')$$,
  'the blocker sees the block'
);

select tests.authenticate_as('bob');
select is_empty(
  $$select * from public.my_connections() where username = 'alice'$$,
  'the blocked user does not see the block'
);
select public.send_friend_request('alice');
select public.block_user(tests.user_id('alice'));
select public.unblock_user(tests.user_id('alice'));
select public.remove_friend(tests.user_id('alice'));

select tests.clear_authentication();
select results_eq(
  format(
    'select status::text, blocked_by from public.friendships where %L in (requester_id, addressee_id) and %L in (requester_id, addressee_id)',
    tests.user_id('alice'), tests.user_id('bob')
  ),
  format('values (%L, %L::uuid)', 'blocked', tests.user_id('alice')),
  'the blocked user cannot request, re-block, unblock or remove their way out'
);

select tests.authenticate_as('alice');
select lives_ok(format('select public.unblock_user(%L)', tests.user_id('bob')), 'the blocker can unblock');
select is_empty(
  $$select * from public.my_connections() where username = 'bob'$$,
  'unblocking removes the relationship entirely'
);

-- ---------------------------------------------------------------------------
-- are_friends does not leak other people's friendships
-- ---------------------------------------------------------------------------

select tests.clear_authentication();
insert into public.friendships (requester_id, addressee_id, status)
values (tests.user_id('alice'), tests.user_id('bob'), 'accepted');

select tests.authenticate_as('dave');
select ok(
  not public.are_friends(tests.user_id('alice'), tests.user_id('bob')),
  'are_friends does not reveal friendships the caller is not part of'
);

-- ---------------------------------------------------------------------------
-- Visitors who are not signed in cannot call any of it
-- ---------------------------------------------------------------------------

select tests.clear_authentication();
select ok(not has_function_privilege('anon', 'public.are_friends(uuid, uuid)', 'execute'), 'anon cannot call are_friends');
select ok(not has_function_privilege('anon', 'public.my_connections()', 'execute'), 'anon cannot call my_connections');
select ok(not has_function_privilege('anon', 'public.send_friend_request(text)', 'execute'), 'anon cannot call send_friend_request');
select ok(not has_function_privilege('anon', 'public.respond_friend_request(uuid, boolean)', 'execute'), 'anon cannot call respond_friend_request');
select ok(not has_function_privilege('anon', 'public.remove_friend(uuid)', 'execute'), 'anon cannot call remove_friend');
select ok(not has_function_privilege('anon', 'public.block_user(uuid)', 'execute'), 'anon cannot call block_user');
select ok(not has_function_privilege('anon', 'public.unblock_user(uuid)', 'execute'), 'anon cannot call unblock_user');

select * from finish();
rollback;
