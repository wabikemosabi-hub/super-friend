begin;
select plan(13);

select tests.create_user('taffy');
select tests.create_user('roy');
select tests.create_user('outsider');
insert into public.profiles (id, username) values
  (tests.user_id('taffy'), 'taffy-lee-fubbins'),
  (tests.user_id('roy'), 'roy-donk');

select tests.authenticate_as('roy');
select public.send_connection_request('taffy-lee-fubbins');

select results_eq(
  $$select nomad_id, username, status, outgoing from public.my_connections()$$,
  $$values (tests.user_id('taffy'), 'taffy-lee-fubbins', 'pending', true)$$,
  'a request you sent shows as pending and outgoing'
);

select tests.authenticate_as('taffy');
select results_eq(
  $$select nomad_id, username, status, outgoing from public.my_connections()$$,
  $$values (tests.user_id('roy'), 'roy-donk', 'pending', false)$$,
  'a request sent to you shows as pending and incoming'
);

select tests.clear_authentication();
update public.nomad_connections set last_asked_at = now() - interval '31 days' where tests.user_id('roy') in (requester_id, addressee_id);

select tests.authenticate_as('roy');
select is_empty(
  $$select * from public.my_connections()$$,
  'a request you sent fades from your list after 30 days'
);

select tests.authenticate_as('taffy');
select results_eq(
  $$select username, status, outgoing from public.my_connections()$$,
  $$values ('roy-donk', 'pending', false)$$,
  'a request sent to you stays until you answer it'
);

select tests.clear_authentication();
update public.nomad_connections set last_asked_at = now() where tests.user_id('roy') in (requester_id, addressee_id);

select tests.authenticate_as('taffy');

select public.respond_to_connection_request(
  (select connection_id from public.my_connections()),
  false
);

select tests.authenticate_as('roy');
select results_eq(
  $$select username, status, outgoing from public.my_connections()$$,
  $$values ('taffy-lee-fubbins', 'pending', true)$$,
  'a declined request still looks pending to the nomad who asked'
);

select tests.authenticate_as('taffy');
select is_empty(
  $$select * from public.my_connections()$$,
  'a request you declined leaves your list'
);

select tests.authenticate_as('roy');
select public.send_connection_request('taffy-lee-fubbins');

select tests.authenticate_as('taffy');
select is_empty(
  $$select * from public.my_connections()$$,
  'asking again after a decline sends nothing new'
);

select tests.clear_authentication();
update public.nomad_connections set last_asked_at = now() - interval '31 days' where tests.user_id('roy') in (requester_id, addressee_id);

select tests.authenticate_as('roy');
select public.send_connection_request('taffy-lee-fubbins');
select results_eq(
  $$select username, status, outgoing from public.my_connections()$$,
  $$values ('taffy-lee-fubbins', 'pending', true)$$,
  'asking again restarts your 30 days'
);

select tests.authenticate_as('taffy');
select is_empty(
  $$select * from public.my_connections()$$,
  'asking again after your request faded sends nothing new'
);

select tests.clear_authentication();
update public.nomad_connections set status = 'pending', responded_at = null where tests.user_id('roy') in (requester_id, addressee_id);

select tests.authenticate_as('taffy');
select public.respond_to_connection_request(
  (select connection_id from public.my_connections()),
  true
);
select results_eq(
  $$select username, status, outgoing from public.my_connections()$$,
  $$values ('roy-donk', 'accepted', false)$$,
  'an accepted connection shows for the nomad who accepted'
);

select tests.authenticate_as('roy');
select results_eq(
  $$select username, status, outgoing from public.my_connections()$$,
  $$values ('taffy-lee-fubbins', 'accepted', true)$$,
  'an accepted connection shows for the nomad who asked'
);

select tests.authenticate_as('outsider');
select is_empty(
  $$select * from public.my_connections()$$,
  'you only see connections you are part of'
);

select tests.authenticate_as_anon();
select throws_ok(
  $$select * from public.my_connections()$$,
  '42501', null,
  'visitors who are not signed in cannot list connections'
);

select * from finish();
rollback;
