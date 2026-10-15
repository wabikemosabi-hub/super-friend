create function public.reached_stops(nomad_id uuid)
returns table (
  media_item_id uuid,
  external_id text,
  stars int,
  encounter int
)
language sql
stable
security definer
set search_path = ''
as $$
  select distinct on (s.media_item_id)
    s.media_item_id,
    m.external_id,
    s.stars,
    s.encounter
  from public.stop_ratings s
  join public.media_items m on m.id = s.media_item_id
  where s.nomad_id = reached_stops.nomad_id
    and reached_stops.nomad_id <> auth.uid()
    and exists (
      select 1 from public.nomad_connections c
      where c.status = 'accepted'
        and auth.uid() in (c.requester_id, c.addressee_id)
        and reached_stops.nomad_id in (c.requester_id, c.addressee_id)
    )
  order by s.media_item_id, s.created_at desc;
$$;

revoke execute on function public.reached_stops(uuid) from public, anon;
