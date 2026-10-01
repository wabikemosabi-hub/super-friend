export const MEDIA_TYPES = ['movie', 'series', 'book'] as const;
export type MediaType = (typeof MEDIA_TYPES)[number];

export type NewMediaItem = {
  type: MediaType;
  provider: 'tmdb' | 'hardcover' | 'openlibrary';
  external_id: string;
  title: string;
  subtitle: string | null;
  year: number | null;
  image_url: string | null;
  overview: string | null;
  metadata: Record<string, unknown>;
};

export type MediaItem = NewMediaItem & { id: string; fetched_at: string };

export type Fetch = (request: Request) => Promise<Response>;
