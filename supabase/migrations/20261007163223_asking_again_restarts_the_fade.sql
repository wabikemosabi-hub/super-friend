create or replace function public.send_connection_request(username text)
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
  where requester_id = them and addressee_id = auth.uid() and status in ('pending', 'declined');

  if found then
    return;
  end if;

  update public.nomad_connections
  set last_asked_at = now()
  where requester_id = auth.uid() and addressee_id = them and status <> 'accepted';

  if found then
    return;
  end if;

  insert into public.nomad_connections (requester_id, addressee_id)
  values (auth.uid(), them)
  on conflict do nothing;
end;
$$;
