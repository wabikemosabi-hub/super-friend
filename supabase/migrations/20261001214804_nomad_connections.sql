create type public.connection_status as enum ('pending', 'accepted', 'declined');

create table public.nomad_connections (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles (id) on delete cascade,
  addressee_id uuid not null references public.profiles (id) on delete cascade,
  status public.connection_status not null default 'pending',
  created_at timestamptz not null default now(),
  responded_at timestamptz
);

create unique index nomad_connections_pair_key on public.nomad_connections (
  least(requester_id, addressee_id),
  greatest(requester_id, addressee_id)
);

alter table public.nomad_connections enable row level security;

create function public.send_connection_request(username text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  them uuid;
begin
  select p.id into them
  from public.profiles p
  where lower(p.username) = lower(send_connection_request.username);

  if them is null then
    raise exception 'No nomad named %', send_connection_request.username;
  end if;

  if them = auth.uid() then
    raise exception 'You can''t connect with yourself';
  end if;

  update public.nomad_connections
  set status = 'accepted', responded_at = now()
  where requester_id = them and addressee_id = auth.uid() and status = 'pending';

  if found then
    return;
  end if;

  insert into public.nomad_connections (requester_id, addressee_id)
  values (auth.uid(), them)
  on conflict do nothing;
end;
$$;

revoke execute on function public.send_connection_request(text) from public, anon;
