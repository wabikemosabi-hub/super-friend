begin;
select plan(4);

select tests.create_user('taffy');
select tests.create_user('roy');

select tests.authenticate_as('roy');
insert into public.profiles (id, username) values (tests.user_id('roy'), 'roy-donk');

select tests.authenticate_as('taffy');
select is(
  public.username_available('taffy-lee-fubbins'),
  true,
  'a name nobody has is available'
);
select is(
  public.username_available('roy-donk'),
  false,
  'a name somebody has is not available'
);
select is(
  public.username_available('Roy-Donk'),
  false,
  'a name is taken no matter the case'
);

select tests.authenticate_as_anon();
select throws_ok(
  $$select public.username_available('taffy-lee-fubbins')$$,
  '42501', null,
  'visitors who are not signed in cannot check names'
);

select * from finish();
rollback;
