import type { Json, Tables } from '@/lib/database.types';
import { supabase } from '@/lib/supabase';

export type MediaType = 'movie' | 'series' | 'book';
export type MediaItem = Tables<'media_items'>;

export const searchTrouble = 'Search is having trouble. Try again in a moment.';

const minimumQueryLength = 2;

export function shouldSearch(query: string) {
  return query.trim().length >= minimumQueryLength;
}

type SearchResponse = { data: { results: MediaItem[] } | null; error: Error | null };

export async function searchMedia(type: MediaType, query: string): Promise<MediaItem[]> {
  const { data, error } = (await supabase.functions.invoke('media-search', {
    body: { type, query: query.trim() },
  })) as SearchResponse;
  if (error || !data) throw new Error(searchTrouble);
  return data.results;
}

export function posterPath(item: { metadata: Json }): string | null {
  const { metadata } = item;
  if (typeof metadata !== 'object' || metadata === null || Array.isArray(metadata)) return null;
  return typeof metadata.poster_path === 'string' ? metadata.poster_path : null;
}

export type TmdbImageSize = 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'original';

export function tmdbImage(path: string | null | undefined, size: TmdbImageSize) {
  return path ? `https://image.tmdb.org/t/p/${size}${path}` : null;
}

const OVERVIEW_LINE_LENGTH = 120;

export function overviewLine(item: Pick<MediaItem, 'overview'>) {
  const overview = item.overview?.trim();
  if (!overview) return null;
  const sentence = overview.match(/^.*?[.!?](?=\s|$)/)?.[0] ?? overview;
  if (sentence.length <= OVERVIEW_LINE_LENGTH) return sentence;
  const lastSpace = sentence.slice(0, OVERVIEW_LINE_LENGTH + 1).lastIndexOf(' ');
  return `${sentence.slice(0, lastSpace > 0 ? lastSpace : OVERVIEW_LINE_LENGTH)}…`;
}
