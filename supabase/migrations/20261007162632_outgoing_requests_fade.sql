alter table public.nomad_connections
  add column last_asked_at timestamptz not null default now();

create or replace function public.my_connections()
returns table (
  connection_id uuid,
  nomad_id uuid,
  username text,
  avatar_url text,
  status text,
  outgoing boolean
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    c.id,
    p.id,
    p.username,
    p.avatar_url,
    case when c.status = 'declined' then 'pending' else c.status::text end,
    c.requester_id = auth.uid()
  from public.nomad_connections c
  join public.profiles p
    on p.id = case when c.requester_id = auth.uid() then c.addressee_id else c.requester_id end
  where auth.uid() in (c.requester_id, c.addressee_id)
    and not (c.status = 'declined' and c.addressee_id = auth.uid())
    and not (
      c.requester_id = auth.uid()
      and c.status <> 'accepted'
      and c.last_asked_at < now() - interval '30 days'
    );
$$;
