begin;
select plan(8);

select tests.create_user('taffy');
select tests.create_user('roy');
insert into public.profiles (id, username) values
  (tests.user_id('taffy'), 'taffy-lee-fubbins'),
  (tests.user_id('roy'), 'roy-donk');

select tests.authenticate_as('roy');
select public.send_connection_request('taffy-lee-fubbins');

select tests.clear_authentication();
select results_eq(
  $$select requester_id, addressee_id, status::text from public.nomad_connections where tests.user_id('roy') in (requester_id, addressee_id)$$,
  $$values (tests.user_id('roy'), tests.user_id('taffy'), 'pending')$$,
  'asking a nomad by username makes a pending connection'
);

select tests.authenticate_as('roy');
select public.send_connection_request('Taffy-Lee-Fubbins');

select tests.clear_authentication();
select results_eq(
  $$select requester_id, addressee_id, status::text from public.nomad_connections where tests.user_id('roy') in (requester_id, addressee_id)$$,
  $$values (tests.user_id('roy'), tests.user_id('taffy'), 'pending')$$,
  'asking the same nomad again changes nothing'
);

select tests.authenticate_as('taffy');
select public.send_connection_request('roy-donk');

select tests.clear_authentication();
select results_eq(
  $$select requester_id, addressee_id, status::text from public.nomad_connections where tests.user_id('roy') in (requester_id, addressee_id)$$,
  $$values (tests.user_id('roy'), tests.user_id('taffy'), 'accepted')$$,
  'asking someone who already asked you connects you'
);

select tests.authenticate_as('roy');
select throws_ok(
  $$select public.send_connection_request('roy-donk')$$,
  'P0001', 'You can''t connect with yourself',
  'you cannot ask yourself to connect'
);
select throws_ok(
  $$select public.send_connection_request('nobody-at-all')$$,
  'P0001', 'No nomad named nobody-at-all',
  'asking for a username nobody has says so'
);

select is_empty(
  $$select * from public.nomad_connections$$,
  'nomads cannot read connections straight from the table'
);
select throws_ok(
  $$insert into public.nomad_connections (requester_id, addressee_id)
    values (tests.user_id('roy'), tests.user_id('roy'))$$,
  '42501', null,
  'nomads cannot write connections straight into the table'
);

select tests.authenticate_as_anon();
select throws_ok(
  $$select public.send_connection_request('taffy-lee-fubbins')$$,
  '42501', null,
  'visitors who are not signed in cannot ask to connect'
);

select * from finish();
rollback;
