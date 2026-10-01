insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change, email_change_token_new,
  email_change_token_current, phone_change, phone_change_token, reauthentication_token
)
values (
  '00000000-0000-0000-0000-000000000000', 'b0000000-0000-4000-8000-000000000001',
  'authenticated', 'authenticated', 'bart-harley-jarvis@dev.local',
  extensions.crypt('nomad-password', extensions.gen_salt('bf')), now(),
  '{"provider": "email", "providers": ["email"]}', '{}', now(), now(),
  '', '', '', '', '', '', '', ''
), (
  '00000000-0000-0000-0000-000000000000', 'b0000000-0000-4000-8000-000000000002',
  'authenticated', 'authenticated', 'paul-bufano@dev.local',
  extensions.crypt('nomad-password', extensions.gen_salt('bf')), now(),
  '{"provider": "email", "providers": ["email"]}', '{}', now(), now(),
  '', '', '', '', '', '', '', ''
)
on conflict (id) do nothing;

insert into auth.identities (id, user_id, provider_id, provider, identity_data, created_at, updated_at)
values (
  'b0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001',
  'b0000000-0000-4000-8000-000000000001', 'email',
  '{"sub": "b0000000-0000-4000-8000-000000000001", "email": "bart-harley-jarvis@dev.local", "email_verified": true}',
  now(), now()
), (
  'b0000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000002',
  'b0000000-0000-4000-8000-000000000002', 'email',
  '{"sub": "b0000000-0000-4000-8000-000000000002", "email": "paul-bufano@dev.local", "email_verified": true}',
  now(), now()
)
on conflict (id) do nothing;

insert into public.profiles (id, username)
values
  ('b0000000-0000-4000-8000-000000000001', 'bart-harley-jarvis'),
  ('b0000000-0000-4000-8000-000000000002', 'paul-bufano')
on conflict (id) do nothing;
