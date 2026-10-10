create or replace function public.replace_recommendation(recommendation_id uuid, media_item_id uuid, reasons text[])
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  old public.recommendations;
  old_type text;
  media public.media_items;
  cleaned text[];
  new_id uuid;
begin
  select * into old from public.recommendations x
  where x.id = replace_recommendation.recommendation_id
    and x.recommender_id = auth.uid();

  if old.id is null then
    raise exception 'No stop like that on your route';
  end if;

  if not exists (
    select 1 from public.nomad_connections c
    where c.status = 'accepted'
      and (
        (c.requester_id = auth.uid() and c.addressee_id = old.recipient_id)
        or (c.addressee_id = auth.uid() and c.requester_id = old.recipient_id)
      )
  ) then
    raise exception 'You can only recommend to fellow nomads';
  end if;

  select * into media from public.media_items m where m.id = replace_recommendation.media_item_id;

  if media.id is null then
    raise exception 'No media item with that id';
  end if;

  select m.type into old_type from public.media_items m where m.id = old.media_item_id;

  if media.type <> old_type then
    raise exception 'Replace a % stop with another %', old_type, old_type;
  end if;

  select coalesce(array_agg(btrim(r) order by n), '{}') into cleaned
  from unnest(replace_recommendation.reasons) with ordinality as u(r, n)
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
      and x.recipient_id = old.recipient_id
      and x.media_item_id = media.id
  ) then
    raise exception 'That''s already on your list';
  end if;

  delete from public.recommendations x where x.id = old.id;

  insert into public.recommendations (recommender_id, recipient_id, media_item_id, rank, reasons)
  values (auth.uid(), old.recipient_id, media.id, old.rank, cleaned)
  returning id into new_id;

  return new_id;
end;
$$;

revoke execute on function public.replace_recommendation(uuid, uuid, text[]) from public, anon;
