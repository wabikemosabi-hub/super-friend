begin;
select plan(6);

select tests.create_user('taffy');
select tests.create_user('roy');
insert into public.profiles (id, username) values
  (tests.user_id('taffy'), 'taffy-lee-fubbins'),
  (tests.user_id('roy'), 'roy-donk');

select tests.authenticate_as('roy');
select public.send_connection_request('taffy-lee-fubbins');

select tests.clear_authentication();
select id as connection_id from public.nomad_connections \gset

select tests.authenticate_as('taffy');
select public.respond_to_connection_request(:'connection_id', true);

select tests.clear_authentication();
select results_eq(
  $$select status::text, responded_at is not null from public.nomad_connections$$,
  $$values ('accepted', true)$$,
  'the nomad who was asked can accept'
);

update public.nomad_connections set status = 'pending', responded_at = null;

select tests.authenticate_as('taffy');
select public.respond_to_connection_request(:'connection_id', false);

select tests.clear_authentication();
select results_eq(
  $$select status::text, responded_at is not null from public.nomad_connections$$,
  $$values ('declined', true)$$,
  'the nomad who was asked can decline'
);

update public.nomad_connections set status = 'pending', responded_at = null;

select tests.authenticate_as('roy');
select public.respond_to_connection_request(:'connection_id', true);

select tests.clear_authentication();
select results_eq(
  $$select status::text from public.nomad_connections$$,
  $$values ('pending')$$,
  'the nomad who asked cannot answer their own request'
);

select tests.authenticate_as('taffy');
select public.respond_to_connection_request(:'connection_id', false);
select public.respond_to_connection_request(:'connection_id', true);

select tests.clear_authentication();
select results_eq(
  $$select status::text from public.nomad_connections$$,
  $$values ('declined')$$,
  'a request that was already answered cannot be answered again'
);

select tests.authenticate_as('taffy');
select public.send_connection_request('roy-donk');

select tests.clear_authentication();
select results_eq(
  $$select requester_id, addressee_id, status::text from public.nomad_connections$$,
  $$values (tests.user_id('roy'), tests.user_id('taffy'), 'accepted')$$,
  'a nomad who declined can change their mind by asking, which connects you'
);

select tests.authenticate_as_anon();
select throws_ok(
  format('select public.respond_to_connection_request(%L, true)', :'connection_id'),
  '42501', null,
  'visitors who are not signed in cannot answer requests'
);

select * from finish();
rollback;
