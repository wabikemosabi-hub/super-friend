create table public.stop_ratings (
  id uuid primary key default gen_random_uuid(),
  nomad_id uuid not null references public.profiles (id) on delete cascade,
  media_item_id uuid not null references public.media_items (id) on delete cascade,
  navigator_id uuid references public.profiles (id) on delete set null,
  promised_reasons text[] not null default '{}',
  stars int not null check (stars between 1 and 5),
  encounter int not null check (encounter >= 0),
  reasons text[] not null check (cardinality(reasons) between 1 and 3),
  created_at timestamptz not null default clock_timestamp()
);

create index stop_ratings_nomad_media on public.stop_ratings (nomad_id, media_item_id, created_at desc);

alter table public.stop_ratings enable row level security;

revoke all on public.stop_ratings from public, anon, authenticated;

create function public.rate_stop(
  media_item_id uuid,
  stars int,
  encounter int,
  reasons text[]
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  cleaned text[];
  plotted public.recommendations;
  previous public.stop_ratings;
  navigator uuid;
  promised text[];
  picked int := rate_stop.encounter;
  new_id uuid;
begin
  if rate_stop.stars is null or rate_stop.stars not between 1 and 5 then
    raise exception 'Pick 1 to 5 stars';
  end if;

  if rate_stop.encounter is null or rate_stop.encounter < 0 then
    raise exception 'No encounter like that';
  end if;

  select coalesce(array_agg(btrim(r) order by n), '{}') into cleaned
  from unnest(coalesce(rate_stop.reasons, '{}')) with ordinality as u(r, n)
  where btrim(r) <> '';

  if cardinality(cleaned) not between 1 and 3 then
    raise exception 'Give 1 to 3 reasons';
  end if;

  if exists (select 1 from unnest(cleaned) r where char_length(r) > 140) then
    raise exception 'Keep each reason under 140 characters';
  end if;

  select * into plotted from public.recommendations x
  where x.recipient_id = auth.uid()
    and x.media_item_id = rate_stop.media_item_id
  order by x.created_at
  limit 1;

  select * into previous from public.stop_ratings s
  where s.nomad_id = auth.uid()
    and s.media_item_id = rate_stop.media_item_id
  order by s.created_at desc
  limit 1;

  if plotted.id is null and previous.id is null then
    raise exception 'You can only rate stops plotted for you';
  end if;

  if plotted.id is not null then
    navigator := plotted.recommender_id;
    promised := plotted.reasons;
  else
    navigator := previous.navigator_id;
    promised := previous.promised_reasons;
  end if;

  if previous.id is not null and previous.stars = rate_stop.stars then
    picked := previous.encounter;
  end if;

  insert into public.stop_ratings (
    nomad_id, media_item_id, navigator_id, promised_reasons,
    stars, encounter, reasons
  )
  values (
    auth.uid(), rate_stop.media_item_id, navigator, promised,
    rate_stop.stars, picked, cleaned
  )
  returning id into new_id;

  with gone as (
    delete from public.recommendations x
    where x.recipient_id = auth.uid()
      and x.media_item_id = rate_stop.media_item_id
    returning x.recommender_id, x.media_item_id
  ),
  routes as (
    select distinct g.recommender_id, m.type
    from gone g
    join public.media_items m on m.id = g.media_item_id
  ),
  renumbered as (
    select x.id, row_number() over (partition by x.recommender_id order by x.rank) as new_rank
    from public.recommendations x
    join public.media_items m on m.id = x.media_item_id
    join routes r on r.recommender_id = x.recommender_id and r.type = m.type
    where x.recipient_id = auth.uid()
      and x.media_item_id <> rate_stop.media_item_id
  )
  update public.recommendations x
  set rank = renumbered.new_rank
  from renumbered
  where x.id = renumbered.id;

  return new_id;
end;
$$;

revoke execute on function public.rate_stop(uuid, int, int, text[]) from public, anon;
