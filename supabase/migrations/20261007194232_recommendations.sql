create table public.recommendations (
  id uuid primary key default gen_random_uuid(),
  recommender_id uuid not null references public.profiles (id) on delete cascade,
  recipient_id uuid not null references public.profiles (id) on delete cascade,
  media_item_id uuid not null references public.media_items (id) on delete cascade,
  rank int not null check (rank between 1 and 5),
  reasons text[] not null check (cardinality(reasons) between 1 and 3),
  created_at timestamptz not null default now(),
  unique (recommender_id, recipient_id, media_item_id)
);

alter table public.recommendations enable row level security;

revoke all on public.recommendations from public, anon, authenticated;

create function public.add_recommendation(nomad_id uuid, media_item_id uuid, reasons text[])
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  media public.media_items;
  cleaned text[];
  them text;
  taken int;
  new_id uuid;
begin
  if not exists (
    select 1 from public.nomad_connections c
    where c.status = 'accepted'
      and (
        (c.requester_id = auth.uid() and c.addressee_id = add_recommendation.nomad_id)
        or (c.addressee_id = auth.uid() and c.requester_id = add_recommendation.nomad_id)
      )
  ) then
    raise exception 'You can only recommend to fellow nomads';
  end if;

  select * into media from public.media_items m where m.id = add_recommendation.media_item_id;

  if media.id is null then
    raise exception 'No media item with that id';
  end if;

  select coalesce(array_agg(btrim(r) order by n), '{}') into cleaned
  from unnest(add_recommendation.reasons) with ordinality as u(r, n)
  where btrim(r) <> '';

  if cardinality(cleaned) not between 1 and 3 then
    raise exception 'Give 1 to 3 reasons';
  end if;

  if exists (select 1 from unnest(cleaned) r where char_length(r) > 140) then
    raise exception 'Keep each reason under 140 characters';
  end if;

  if exists (
    select 1 from public.recommendations x
    where x.recommender_id = auth.uid()
      and x.recipient_id = add_recommendation.nomad_id
      and x.media_item_id = media.id
  ) then
    raise exception 'That''s already on your list';
  end if;

  select count(*) into taken
  from public.recommendations x
  join public.media_items m on m.id = x.media_item_id
  where x.recommender_id = auth.uid()
    and x.recipient_id = add_recommendation.nomad_id
    and m.type = media.type;

  if taken >= 5 then
    select p.username into them from public.profiles p where p.id = add_recommendation.nomad_id;
    raise exception 'Your % list for % is full', media.type, them;
  end if;

  insert into public.recommendations (recommender_id, recipient_id, media_item_id, rank, reasons)
  values (auth.uid(), add_recommendation.nomad_id, media.id, taken + 1, cleaned)
  returning id into new_id;

  return new_id;
end;
$$;

revoke execute on function public.add_recommendation(uuid, uuid, text[]) from public, anon;

create function public.adventure_recommendations(nomad_id uuid)
returns table (
  id uuid,
  outgoing boolean,
  rank int,
  reasons text[],
  media_item_id uuid,
  type text,
  external_id text,
  title text,
  year int,
  metadata jsonb
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    x.id,
    x.recommender_id = auth.uid(),
    x.rank,
    x.reasons,
    m.id,
    m.type,
    m.external_id,
    m.title,
    m.year,
    m.metadata
  from public.recommendations x
  join public.media_items m on m.id = x.media_item_id
  where (
      (x.recommender_id = auth.uid() and x.recipient_id = adventure_recommendations.nomad_id)
      or (x.recipient_id = auth.uid() and x.recommender_id = adventure_recommendations.nomad_id)
    )
    and exists (
      select 1 from public.nomad_connections c
      where c.status = 'accepted'
        and auth.uid() in (c.requester_id, c.addressee_id)
        and adventure_recommendations.nomad_id in (c.requester_id, c.addressee_id)
    )
  order by x.recommender_id = auth.uid(), m.type, x.rank;
$$;

revoke execute on function public.adventure_recommendations(uuid) from public, anon;
