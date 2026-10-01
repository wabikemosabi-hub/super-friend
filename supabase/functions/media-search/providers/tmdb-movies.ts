import type { Fetch, NewMediaItem } from '../../_shared/media.ts';

const API = 'https://api.themoviedb.org/3';
const POSTER = 'https://image.tmdb.org/t/p/w500';

export type TmdbMovie = {
  id: number;
  title: string;
  original_title: string;
  original_language: string;
  overview: string;
  release_date: string;
  poster_path: string | null;
  backdrop_path: string | null;
  popularity: number;
  vote_average: number;
  vote_count: number;
};

export function normalizeTmdbMovie(m: TmdbMovie): NewMediaItem {
  return {
    type: 'movie',
    provider: 'tmdb',
    external_id: `movie:${m.id}`,
    title: m.title,
    subtitle: null,
    year: m.release_date ? Number(m.release_date.slice(0, 4)) : null,
    image_url: m.poster_path ? POSTER + m.poster_path : null,
    overview: m.overview || null,
    metadata: {
      poster_path: m.poster_path,
      backdrop_path: m.backdrop_path,
      original_title: m.original_title,
      original_language: m.original_language,
      popularity: m.popularity,
      vote_average: m.vote_average,
      vote_count: m.vote_count,
    },
  };
}

export function normalizeTmdbMovieSearch(body: { results: TmdbMovie[] }): NewMediaItem[] {
  return body.results.map(normalizeTmdbMovie);
}

export async function searchTmdbMovies(
  query: string,
  token: string,
  fetchFn: Fetch = fetch,
): Promise<NewMediaItem[]> {
  const url = new URL(`${API}/search/movie`);
  url.searchParams.set('query', query);
  url.searchParams.set('include_adult', 'false');
  url.searchParams.set('language', 'en-US');
  url.searchParams.set('page', '1');

  const res = await fetchFn(
    new Request(url, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } }),
  );
  const body = await res.json();
  if (!res.ok) throw new Error(`TMDB ${res.status}: ${body.status_message ?? res.statusText}`);

  return normalizeTmdbMovieSearch(body);
}
