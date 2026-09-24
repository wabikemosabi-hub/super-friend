-- Media Advisory Board: initial schema
--
-- Core ideas:
--   * friendships: one row per pair, requester -> addressee, with a status.
--   * media_items: a local cache of metadata from TMDB / Hardcover / Open Library.
--   * recommendations: sender -> recipient for a media item. A recommendation to
--     yourself is how you add something to your own list ("because I said so").
--   * reasons: freeform, per-(author, recipient) text chips attached to
--     recommendations. Reused reasons become shelves for the recipient.
--   * stickers: a shared, curated vocabulary of emoji chips describing the vibe
--     of the media itself. Anything personal or occasion-based is a reason.
--   * list_entries: one per (user, media item); many recommendations can point at one.
--   * watchlists: user-created, ordered collections of their list entries.

create extension if not exists pg_trgm with schema extensions;

-- ---------------------------------------------------------------------------
-- Types
-- ---------------------------------------------------------------------------

create type public.media_type as enum ('movie', 'series', 'book');
create type public.friendship_status as enum ('pending', 'accepted', 'declined', 'blocked');
create type public.recommendation_status as enum ('pending', 'accepted', 'dismissed');
create type public.entry_status as enum ('want', 'in_progress', 'done', 'dropped');

-- ---------------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null check (username ~ '^[a-zA-Z0-9_]{3,24}$'),
  display_name text not null,
  avatar_url text,
  created_at timestamptz not null default now()
);

create unique index profiles_username_key on public.profiles (lower(username));

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    new.raw_user_meta_data ->> 'username',
    coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), new.raw_user_meta_data ->> 'username')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Friendships
-- ---------------------------------------------------------------------------

create table public.friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles (id) on delete cascade,
  addressee_id uuid not null references public.profiles (id) on delete cascade,
  status public.friendship_status not null default 'pending',
  blocked_by uuid references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  check (requester_id <> addressee_id),
  check ((status = 'blocked') = (blocked_by is not null))
);

-- One row per pair, regardless of who asked first.
create unique index friendships_pair_key on public.friendships (
  least(requester_id, addressee_id),
  greatest(requester_id, addressee_id)
);
create index friendships_addressee_idx on public.friendships (addressee_id);

create function public.are_friends(a uuid, b uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.friendships f
    where f.status = 'accepted'
      and least(f.requester_id, f.addressee_id) = least(a, b)
      and greatest(f.requester_id, f.addressee_id) = greatest(a, b)
  );
$$;

-- ---------------------------------------------------------------------------
-- Media cache
-- ---------------------------------------------------------------------------

create table public.media_items (
  id uuid primary key default gen_random_uuid(),
  type public.media_type not null,
  provider text not null,          -- 'tmdb' | 'hardcover' | 'openlibrary'
  external_id text not null,
  title text not null,
  subtitle text,                   -- author for books
  year int,
  image_url text,
  overview text,
  metadata jsonb not null default '{}',
  fetched_at timestamptz not null default now(),
  unique (provider, external_id)
);

create index media_items_title_trgm on public.media_items using gin (title extensions.gin_trgm_ops);

-- ---------------------------------------------------------------------------
-- Lists
-- ---------------------------------------------------------------------------

create table public.list_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  media_item_id uuid not null references public.media_items (id) on delete cascade,
  status public.entry_status not null default 'want',
  rating smallint check (rating between 1 and 5),
  added_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  finished_at timestamptz,
  unique (user_id, media_item_id)
);

create function public.touch_list_entry()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  if new.status = 'done' and old.status is distinct from 'done' then
    new.finished_at := now();
  elsif new.status <> 'done' then
    new.finished_at := null;
  end if;
  return new;
end;
$$;

create trigger list_entries_touch
  before update on public.list_entries
  for each row execute function public.touch_list_entry();

-- ---------------------------------------------------------------------------
-- Recommendations, stickers, reasons
-- ---------------------------------------------------------------------------

create table public.recommendations (
  id uuid primary key default gen_random_uuid(),
  from_user uuid not null references public.profiles (id) on delete cascade,
  to_user uuid not null references public.profiles (id) on delete cascade,
  media_item_id uuid not null references public.media_items (id) on delete cascade,
  note text check (char_length(note) <= 1000),
  status public.recommendation_status not null default 'pending',
  list_entry_id uuid references public.list_entries (id) on delete set null,
  created_at timestamptz not null default now(),
  responded_at timestamptz
);

create index recommendations_to_user_idx on public.recommendations (to_user, status);
create index recommendations_from_user_idx on public.recommendations (from_user);
create index recommendations_list_entry_idx on public.recommendations (list_entry_id);

create table public.stickers (
  id uuid primary key default gen_random_uuid(),
  emoji text not null,
  label text not null check (char_length(label) between 1 and 32),
  created_by uuid references public.profiles (id) on delete cascade, -- null = built-in
  created_at timestamptz not null default now()
);

create table public.recommendation_stickers (
  recommendation_id uuid not null references public.recommendations (id) on delete cascade,
  sticker_id uuid not null references public.stickers (id) on delete cascade,
  primary key (recommendation_id, sticker_id)
);

create table public.reasons (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  recipient_id uuid not null references public.profiles (id) on delete cascade,
  text text not null check (char_length(text) between 1 and 140),
  created_at timestamptz not null default now()
);

create unique index reasons_author_recipient_text_key
  on public.reasons (author_id, recipient_id, lower(text));
create index reasons_recipient_idx on public.reasons (recipient_id);
create index reasons_text_trgm on public.reasons using gin (text extensions.gin_trgm_ops);

create table public.recommendation_reasons (
  recommendation_id uuid not null references public.recommendations (id) on delete cascade,
  reason_id uuid not null references public.reasons (id) on delete cascade,
  primary key (recommendation_id, reason_id)
);

create index recommendation_reasons_reason_idx on public.recommendation_reasons (reason_id);

-- ---------------------------------------------------------------------------
-- Watchlists
-- ---------------------------------------------------------------------------

create table public.watchlists (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 60),
  emoji text,
  description text,
  visibility text not null default 'friends' check (visibility in ('private', 'friends')),
  sort_mode text not null default 'manual' check (sort_mode in ('manual', 'added', 'title', 'year')),
  created_at timestamptz not null default now()
);

create unique index watchlists_owner_name_key on public.watchlists (owner_id, lower(name));

create table public.watchlist_items (
  watchlist_id uuid not null references public.watchlists (id) on delete cascade,
  list_entry_id uuid not null references public.list_entries (id) on delete cascade,
  -- Fractional ordering: insert between neighbours by averaging their positions.
  position double precision not null,
  added_at timestamptz not null default now(),
  primary key (watchlist_id, list_entry_id)
);

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.friendships enable row level security;
alter table public.media_items enable row level security;
alter table public.list_entries enable row level security;
alter table public.recommendations enable row level security;
alter table public.stickers enable row level security;
alter table public.recommendation_stickers enable row level security;
alter table public.reasons enable row level security;
alter table public.recommendation_reasons enable row level security;
alter table public.watchlists enable row level security;
alter table public.watchlist_items enable row level security;

-- Profiles: any signed-in user can look people up (needed to add friends).
create policy "profiles are readable" on public.profiles
  for select to authenticated using (true);
create policy "update own profile" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- Friendships: no direct table access. Everything goes through the RPCs below,
-- so a requester never learns they were declined and blocks stay one-sided.

-- Media cache: readable by everyone signed in; written only by the search function.
create policy "media is readable" on public.media_items
  for select to authenticated using (true);

-- List entries: yours to manage; friends can peek.
create policy "read own or friends' entries" on public.list_entries
  for select to authenticated
  using (user_id = auth.uid() or public.are_friends(user_id, auth.uid()));
create policy "insert own entries" on public.list_entries
  for insert to authenticated with check (user_id = auth.uid());
create policy "update own entries" on public.list_entries
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "delete own entries" on public.list_entries
  for delete to authenticated using (user_id = auth.uid());

-- Recommendations: only the two people involved can see them. Writes go through RPCs,
-- except the sender may unsend a pending one.
create policy "participants read recommendations" on public.recommendations
  for select to authenticated using (auth.uid() in (from_user, to_user));
create policy "sender unsends pending" on public.recommendations
  for delete to authenticated using (from_user = auth.uid() and status = 'pending');

-- Stickers: built-ins plus your own.
create policy "read built-in and own stickers" on public.stickers
  for select to authenticated using (created_by is null or created_by = auth.uid());
create policy "create own stickers" on public.stickers
  for insert to authenticated with check (created_by = auth.uid());
create policy "delete own stickers" on public.stickers
  for delete to authenticated using (created_by = auth.uid());

create policy "participants read recommendation stickers" on public.recommendation_stickers
  for select to authenticated using (
    exists (
      select 1 from public.recommendations r
      where r.id = recommendation_id and auth.uid() in (r.from_user, r.to_user)
    )
  );

-- Reasons: private to author and recipient. Mike never sees what you told Mom.
create policy "author and recipient read reasons" on public.reasons
  for select to authenticated using (auth.uid() in (author_id, recipient_id));
create policy "author edits reasons" on public.reasons
  for update to authenticated using (author_id = auth.uid()) with check (author_id = auth.uid());
create policy "author deletes reasons" on public.reasons
  for delete to authenticated using (author_id = auth.uid());

create policy "participants read recommendation reasons" on public.recommendation_reasons
  for select to authenticated using (
    exists (
      select 1 from public.recommendations r
      where r.id = recommendation_id and auth.uid() in (r.from_user, r.to_user)
    )
  );

-- Watchlists: owner manages; friends can read the ones marked 'friends'.
create policy "read own or shared watchlists" on public.watchlists
  for select to authenticated using (
    owner_id = auth.uid()
    or (visibility = 'friends' and public.are_friends(owner_id, auth.uid()))
  );
create policy "insert own watchlists" on public.watchlists
  for insert to authenticated with check (owner_id = auth.uid());
create policy "update own watchlists" on public.watchlists
  for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "delete own watchlists" on public.watchlists
  for delete to authenticated using (owner_id = auth.uid());

create policy "read items of visible watchlists" on public.watchlist_items
  for select to authenticated using (
    exists (select 1 from public.watchlists w where w.id = watchlist_id)
  );
create policy "manage items of own watchlists" on public.watchlist_items
  for all to authenticated
  using (exists (select 1 from public.watchlists w where w.id = watchlist_id and w.owner_id = auth.uid()))
  with check (
    exists (select 1 from public.watchlists w where w.id = watchlist_id and w.owner_id = auth.uid())
    and exists (select 1 from public.list_entries e where e.id = list_entry_id and e.user_id = auth.uid())
  );

-- ---------------------------------------------------------------------------
-- Friendship RPCs
-- ---------------------------------------------------------------------------

-- Everyone you have a relationship with, from your point of view. Declined
-- requests look 'pending' to the requester; blocks are only visible to the blocker.
create function public.my_connections()
returns table (
  friendship_id uuid,
  user_id uuid,
  username text,
  display_name text,
  avatar_url text,
  status public.friendship_status,
  outgoing boolean,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    f.id,
    p.id,
    p.username,
    p.display_name,
    p.avatar_url,
    case when f.status = 'declined' then 'pending'::public.friendship_status else f.status end,
    f.requester_id = auth.uid(),
    f.created_at
  from public.friendships f
  join public.profiles p
    on p.id = case when f.requester_id = auth.uid() then f.addressee_id else f.requester_id end
  where auth.uid() in (f.requester_id, f.addressee_id)
    and not (f.status = 'blocked' and f.blocked_by <> auth.uid())
    and not (f.status = 'declined' and f.addressee_id = auth.uid())
  order by p.display_name;
$$;

create function public.send_friend_request(p_username text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid := auth.uid();
  them uuid;
  existing public.friendships;
begin
  select id into them from public.profiles where lower(username) = lower(p_username);
  if them is null or them = me then
    raise exception 'No user named %', p_username;
  end if;

  select * into existing from public.friendships
  where least(requester_id, addressee_id) = least(me, them)
    and greatest(requester_id, addressee_id) = greatest(me, them);

  if existing.id is null then
    insert into public.friendships (requester_id, addressee_id) values (me, them);
  elsif existing.status = 'pending' and existing.addressee_id = me then
    -- They already asked us: asking back means yes.
    update public.friendships set status = 'accepted', responded_at = now() where id = existing.id;
  elsif existing.status = 'declined' and existing.addressee_id = me then
    -- We declined them before and changed our mind: start fresh in our direction.
    update public.friendships
    set requester_id = me, addressee_id = them, status = 'pending', created_at = now(), responded_at = null
    where id = existing.id;
  end if;
  -- Otherwise (already friends, already pending, declined by them, blocked): silently no-op.
end;
$$;

create function public.respond_friend_request(p_friendship_id uuid, p_accept boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.friendships
  set status = case when p_accept then 'accepted' else 'declined' end::public.friendship_status,
      responded_at = now()
  where id = p_friendship_id and addressee_id = auth.uid() and status = 'pending';
end;
$$;

create function public.remove_friend(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Removes friendships and cancels/withdraws requests. Blocks are left alone.
  delete from public.friendships
  where least(requester_id, addressee_id) = least(auth.uid(), p_user_id)
    and greatest(requester_id, addressee_id) = greatest(auth.uid(), p_user_id)
    and status <> 'blocked';
end;
$$;

create function public.block_user(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_user_id = auth.uid() then
    raise exception 'You cannot block yourself';
  end if;
  insert into public.friendships (requester_id, addressee_id, status, blocked_by, responded_at)
  values (auth.uid(), p_user_id, 'blocked', auth.uid(), now())
  on conflict (least(requester_id, addressee_id), greatest(requester_id, addressee_id))
  do update set status = 'blocked', blocked_by = auth.uid(), responded_at = now()
  where public.friendships.status <> 'blocked';
end;
$$;

create function public.unblock_user(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.friendships
  where least(requester_id, addressee_id) = least(auth.uid(), p_user_id)
    and greatest(requester_id, addressee_id) = greatest(auth.uid(), p_user_id)
    and status = 'blocked'
    and blocked_by = auth.uid();
end;
$$;

-- ---------------------------------------------------------------------------
-- Recommendation RPCs
-- ---------------------------------------------------------------------------

-- Find or create a reason for (me -> recipient) and return its id.
create function public.upsert_reason(p_recipient uuid, p_text text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  reason_id uuid;
begin
  if p_recipient <> auth.uid() and not public.are_friends(auth.uid(), p_recipient) then
    raise exception 'You can only write reasons for friends';
  end if;

  insert into public.reasons (author_id, recipient_id, text)
  values (auth.uid(), p_recipient, btrim(p_text))
  on conflict (author_id, recipient_id, lower(text)) do update set text = public.reasons.text
  returning id into reason_id;

  return reason_id;
end;
$$;

-- Send a recommendation to a friend, or to yourself (which adds it to your list).
create function public.send_recommendation(
  p_to uuid,
  p_media_item_id uuid,
  p_note text default null,
  p_sticker_ids uuid[] default '{}',
  p_reasons text[] default '{}'
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid := auth.uid();
  rec_id uuid;
  entry_id uuid;
  reason_text text;
begin
  if me is null then
    raise exception 'Not signed in';
  end if;
  if p_to <> me and not public.are_friends(me, p_to) then
    raise exception 'You can only recommend to friends';
  end if;

  insert into public.recommendations (from_user, to_user, media_item_id, note)
  values (me, p_to, p_media_item_id, nullif(btrim(p_note), ''))
  returning id into rec_id;

  insert into public.recommendation_stickers (recommendation_id, sticker_id)
  select rec_id, s.id from public.stickers s
  where s.id = any (p_sticker_ids) and (s.created_by is null or s.created_by = me)
  on conflict do nothing;

  foreach reason_text in array coalesce(p_reasons, '{}') loop
    if btrim(reason_text) <> '' then
      insert into public.recommendation_reasons (recommendation_id, reason_id)
      values (rec_id, public.upsert_reason(p_to, reason_text))
      on conflict do nothing;
    end if;
  end loop;

  -- Recommending to yourself is "add to my list".
  if p_to = me then
    insert into public.list_entries (user_id, media_item_id)
    values (me, p_media_item_id)
    on conflict (user_id, media_item_id) do update set updated_at = now()
    returning id into entry_id;

    update public.recommendations
    set status = 'accepted', list_entry_id = entry_id, responded_at = now()
    where id = rec_id;
  end if;

  return rec_id;
end;
$$;

create function public.accept_recommendation(p_recommendation_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  rec public.recommendations;
  entry_id uuid;
begin
  select * into rec from public.recommendations
  where id = p_recommendation_id and to_user = auth.uid();
  if rec.id is null then
    raise exception 'Recommendation not found';
  end if;

  insert into public.list_entries (user_id, media_item_id)
  values (rec.to_user, rec.media_item_id)
  on conflict (user_id, media_item_id) do update set updated_at = now()
  returning id into entry_id;

  update public.recommendations
  set status = 'accepted', list_entry_id = entry_id, responded_at = now()
  where id = rec.id;

  return entry_id;
end;
$$;

create function public.dismiss_recommendation(p_recommendation_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.recommendations
  set status = 'dismissed', responded_at = now()
  where id = p_recommendation_id and to_user = auth.uid() and status = 'pending';
end;
$$;

-- ---------------------------------------------------------------------------
-- Built-in stickers: the vibe of the thing itself. Personal messages ("trust me")
-- and occasions ("date night") are reasons, not stickers.
-- ---------------------------------------------------------------------------

insert into public.stickers (emoji, label) values
  ('🧸', 'cozy'),
  ('🥲', 'tearjerker'),
  ('🔥', 'unputdownable'),
  ('😂', 'funny'),
  ('🧠', 'big brain'),
  ('👻', 'spooky'),
  ('🐢', 'slow burn'),
  ('⚡', 'adrenaline'),
  ('💘', 'swoon'),
  ('🍿', 'popcorn'),
  ('🌀', 'mind-bender'),
  ('🎨', 'gorgeous'),
  ('🪦', 'devastating'),
  ('🗿', 'classic'),
  ('🌶️', 'spicy'),
  ('🤯', 'twisty');
