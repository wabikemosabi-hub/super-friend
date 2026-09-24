// Hand-written row types. Once a Supabase project is linked, these can be
// replaced with `npx supabase gen types typescript --linked > src/lib/database.types.ts`.

export type MediaType = 'movie' | 'series' | 'book';
export type EntryStatus = 'want' | 'in_progress' | 'done' | 'dropped';
export type FriendshipStatus = 'pending' | 'accepted' | 'declined' | 'blocked';

export type Profile = {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
};

export type MediaItem = {
  id: string;
  type: MediaType;
  provider: string;
  external_id: string;
  title: string;
  subtitle: string | null;
  year: number | null;
  image_url: string | null;
  overview: string | null;
  metadata: Record<string, unknown>;
};

export type Connection = {
  friendship_id: string;
  user_id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  status: FriendshipStatus;
  outgoing: boolean;
  created_at: string;
};

export type Sticker = {
  id: string;
  emoji: string;
  label: string;
  created_by: string | null;
};

export type Reason = {
  id: string;
  text: string;
  author_id: string;
};

export type Recommendation = {
  id: string;
  note: string | null;
  status: 'pending' | 'accepted' | 'dismissed';
  created_at: string;
  from: Profile;
  media: MediaItem;
  stickers: { sticker: Sticker }[];
  reasons: { reason: Reason }[];
};

export type ListEntry = {
  id: string;
  status: EntryStatus;
  rating: number | null;
  added_at: string;
  updated_at: string;
  media: MediaItem;
  recommendations: Omit<Recommendation, 'media' | 'status'>[];
};

export type Watchlist = {
  id: string;
  name: string;
  emoji: string | null;
  description: string | null;
  visibility: 'private' | 'friends';
  sort_mode: 'manual' | 'added' | 'title' | 'year';
  created_at: string;
};

export type WatchlistItem = {
  position: number;
  added_at: string;
  entry: {
    id: string;
    status: EntryStatus;
    media: MediaItem;
  };
};

export const mediaTypeLabel: Record<MediaType, string> = {
  movie: 'Movie',
  series: 'Series',
  book: 'Book',
};

export const entryStatusLabel: Record<EntryStatus, string> = {
  want: 'Up next',
  in_progress: 'In progress',
  done: 'Done',
  dropped: 'Dropped',
};
