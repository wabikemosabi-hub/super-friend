begin;
select plan(12);

select tests.create_user('taffy');
select tests.create_user('roy');

select tests.authenticate_as('taffy');
select lives_ok(
  format(
    'insert into public.profiles (id, username, avatar_url) values (%L, %L, %L)',
    tests.user_id('taffy'), 'Taffy', 'avatars/taffy.png'
  ),
  'a signed-in user can create their own profile'
);

select throws_ok(
  format(
    'insert into public.profiles (id, username) values (%L, %L)',
    tests.user_id('roy'), 'not_roy'
  ),
  '42501', null,
  'a user cannot create a profile for someone else'
);

select tests.authenticate_as('roy');
select throws_ok(
  format('insert into public.profiles (id, username) values (%L, %L)', tests.user_id('roy'), 'TAFFY'),
  '23505', null,
  'usernames are unique regardless of case'
);
select throws_ok(
  format('insert into public.profiles (id, username) values (%L, %L)', tests.user_id('roy'), 'jk'),
  '23514', null,
  'usernames are at least 3 characters'
);
select throws_ok(
  format('insert into public.profiles (id, username) values (%L, %L)', tests.user_id('roy'), 'roy!'),
  '23514', null,
  'usernames are only letters, numbers and underscores'
);
select throws_ok(
  format('insert into public.profiles (id, username) values (%L, %L)', tests.user_id('roy'), repeat('j', 25)),
  '23514', null,
  'usernames are at most 24 characters'
);
select lives_ok(
  format('insert into public.profiles (id, username) values (%L, %L)', tests.user_id('roy'), 'roy_donk'),
  'a username with an underscore is fine'
);

select results_eq(
  $$select username from public.profiles order by username$$,
  $$values ('roy_donk'), ('Taffy')$$,
  'signed-in users can look up everyone''s profile'
);

update public.profiles set avatar_url = 'hijacked.png' where username = 'Taffy';
update public.profiles set avatar_url = 'avatars/roy.png' where username = 'roy_donk';
select tests.clear_authentication();
select results_eq(
  $$select username, avatar_url from public.profiles order by username$$,
  $$values ('roy_donk', 'avatars/roy.png'), ('Taffy', 'avatars/taffy.png')$$,
  'a user can change their own avatar but nobody else''s'
);

select tests.authenticate_as('roy');
select throws_ok(
  format('update public.profiles set id = %L where username = %L', tests.user_id('taffy'), 'roy_donk'),
  '42501', null,
  'a user cannot move their profile to another account'
);

select tests.authenticate_as_anon();
select is_empty(
  $$select * from public.profiles$$,
  'visitors who are not signed in see no profiles'
);

select tests.clear_authentication();
delete from auth.users where id = tests.user_id('roy');
select is_empty(
  $$select * from public.profiles where username = 'roy_donk'$$,
  'deleting an account deletes its profile'
);

select * from finish();
rollback;
