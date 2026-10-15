create function public.nomad_log(nomad_id uuid)
returns table (
  id uuid,
  mine boolean,
  navigator text,
  media_item_id uuid,
  title text,
  year int,
  stars int,
  encounter int,
  reasons text[],
  promised_reasons text[],
  created_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    s.id,
    s.nomad_id = auth.uid(),
    p.username,
    s.media_item_id,
    m.title,
    m.year,
    s.stars,
    s.encounter,
    s.reasons,
    s.promised_reasons,
    s.created_at
  from public.stop_ratings s
  join public.media_items m on m.id = s.media_item_id
  left join public.profiles p on p.id = s.navigator_id
  where nomad_log.nomad_id <> auth.uid()
    and (
      (s.nomad_id = auth.uid() and s.navigator_id = nomad_log.nomad_id)
      or (s.nomad_id = nomad_log.nomad_id and s.navigator_id = auth.uid())
    )
    and exists (
      select 1 from public.nomad_connections c
      where c.status = 'accepted'
        and auth.uid() in (c.requester_id, c.addressee_id)
        and nomad_log.nomad_id in (c.requester_id, c.addressee_id)
    )
  order by s.created_at desc;
$$;

revoke execute on function public.nomad_log(uuid) from public, anon;
