begin;
select plan(10);

select tests.create_user('taffy');
select tests.create_user('roy');

select results_eq(
  $$select public, file_size_limit, allowed_mime_types from storage.buckets where id = 'avatars'$$,
  $$values (true, 5242880::bigint, array['image/*'])$$,
  'the avatars bucket is public, images only, up to 5 MB'
);

select tests.authenticate_as('taffy');
select lives_ok(
  format(
    'insert into storage.objects (bucket_id, name, owner_id) values (%L, %L, %L)',
    'avatars', tests.user_id('taffy') || '/avatar.png', tests.user_id('taffy')
  ),
  'a user can upload into their own folder'
);
select throws_ok(
  format(
    'insert into storage.objects (bucket_id, name, owner_id) values (%L, %L, %L)',
    'avatars', tests.user_id('roy') || '/avatar.png', tests.user_id('taffy')
  ),
  '42501', null,
  'a user cannot upload into someone else''s folder'
);
select throws_ok(
  $$insert into storage.objects (bucket_id, name) values ('avatars', 'avatar.png')$$,
  '42501', null,
  'a user cannot upload outside a folder'
);

select tests.authenticate_as('roy');
select lives_ok(
  format(
    'insert into storage.objects (bucket_id, name, owner_id) values (%L, %L, %L)',
    'avatars', tests.user_id('roy') || '/avatar.png', tests.user_id('roy')
  ),
  'another user can upload into their own folder'
);

select tests.authenticate_as('taffy');
update storage.objects set metadata = '{"v": 2}'
  where bucket_id = 'avatars' and name like '%/avatar.png';
select tests.clear_authentication();
-- Checks below only look at Taffy's and Roy's folders, so real local users'
-- avatars don't change the results.
select results_eq(
  format(
    $$select split_part(name, '/', 1), coalesce(metadata ->> 'v', 'original') from storage.objects
      where bucket_id = 'avatars' and split_part(name, '/', 1) in (%L, %L)
      order by split_part(name, '/', 1) = %L desc$$,
    tests.user_id('taffy'), tests.user_id('roy'), tests.user_id('taffy')
  ),
  format(
    $$values (%L, '2'), (%L, 'original')$$,
    tests.user_id('taffy'), tests.user_id('roy')
  ),
  'a user can replace their own avatar but nobody else''s'
);

select tests.authenticate_as('taffy');
select results_eq(
  format(
    $$select count(*)::int from storage.objects
      where bucket_id = 'avatars' and split_part(name, '/', 1) in (%L, %L)$$,
    tests.user_id('taffy'), tests.user_id('roy')
  ),
  $$values (2)$$,
  'signed-in users can see every avatar'
);

select set_config('storage.allow_delete_query', 'true', true);
delete from storage.objects where bucket_id = 'avatars' and name like '%/avatar.png';
select tests.clear_authentication();
select results_eq(
  format(
    $$select split_part(name, '/', 1)::uuid from storage.objects
      where bucket_id = 'avatars' and split_part(name, '/', 1) in (%L, %L)$$,
    tests.user_id('taffy'), tests.user_id('roy')
  ),
  format('values (%L::uuid)', tests.user_id('roy')),
  'a user can delete their own avatar but nobody else''s'
);

select tests.authenticate_as_anon();
select throws_ok(
  $$insert into storage.objects (bucket_id, name) values ('avatars', 'x/avatar.png')$$,
  '42501', null,
  'visitors who are not signed in cannot upload'
);

select tests.clear_authentication();
select is_empty(
  $$select * from storage.objects where bucket_id <> 'avatars'$$,
  'nothing lands in any other bucket'
);

select * from finish();
rollback;
