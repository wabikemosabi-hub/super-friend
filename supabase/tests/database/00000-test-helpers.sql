-- Shared helpers for the pgTAP suite. pg_prove runs files in name order, so
-- this runs first. It is committed (no rollback) so later files can use it;
-- `supabase db reset` wipes it.
create extension if not exists pgtap with schema extensions;

create schema if not exists tests;
grant usage on schema tests to anon, authenticated;

-- Creates an auth user; the handle_new_user trigger makes their profile.
create or replace function tests.create_user(p_username text)
returns uuid
language sql
as $$
  insert into auth.users (id, email, raw_user_meta_data)
  values (gen_random_uuid(), p_username || '@test.local', jsonb_build_object('username', p_username))
  returning id;
$$;

create or replace function tests.user_id(p_username text)
returns uuid
language sql
stable
as $$
  select id from public.profiles where username = p_username;
$$;

-- Acts as the given user for the rest of the transaction, as PostgREST would.
create or replace function tests.authenticate_as(p_username text)
returns void
language plpgsql
as $$
begin
  perform set_config('role', 'authenticated', true);
  perform set_config(
    'request.jwt.claims',
    json_build_object('sub', tests.user_id(p_username), 'role', 'authenticated')::text,
    true
  );
end;
$$;

-- Acts as a visitor who is not signed in.
create or replace function tests.authenticate_as_anon()
returns void
language plpgsql
as $$
begin
  perform set_config('role', 'anon', true);
  perform set_config('request.jwt.claims', json_build_object('role', 'anon')::text, true);
end;
$$;

-- Back to the superuser, which bypasses RLS. Use it to inspect raw rows.
create or replace function tests.clear_authentication()
returns void
language plpgsql
as $$
begin
  perform set_config('role', 'postgres', true);
  perform set_config('request.jwt.claims', null, true);
end;
$$;

grant execute on all functions in schema tests to anon, authenticated;

begin;
select plan(1);
select has_function('tests', 'authenticate_as', array['text'], 'test helpers are installed');
select * from finish();
rollback;
