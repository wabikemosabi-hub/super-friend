alter table public.recommendations drop constraint recommendations_rank_check;
alter table public.recommendations add constraint recommendations_rank_check check (rank between 1 and 3);

create or replace function public.add_recommendation(nomad_id uuid, media_item_id uuid, reasons text[])
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

  if taken >= 3 then
    select p.username into them from public.profiles p where p.id = add_recommendation.nomad_id;
    raise exception 'Your % route for % is full', media.type, them;
  end if;

  insert into public.recommendations (recommender_id, recipient_id, media_item_id, rank, reasons)
  values (auth.uid(), add_recommendation.nomad_id, media.id, taken + 1, cleaned)
  returning id into new_id;

  return new_id;
end;
$$;
