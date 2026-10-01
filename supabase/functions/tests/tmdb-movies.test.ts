import { assertEquals, assertRejects } from 'jsr:@std/assert@1';

import {
  normalizeTmdbMovie,
  normalizeTmdbMovieSearch,
  searchTmdbMovies,
} from '../media-search/providers/tmdb-movies.ts';
import fullMetalJacket from './fixtures/tmdb-search-movie-full-metal-jacket.json' with { type: 'json' };
import noResults from './fixtures/tmdb-search-movie-no-results.json' with { type: 'json' };
import unauthorized from './fixtures/tmdb-error-unauthorized.json' with { type: 'json' };

const [fmj, kubricksWar, shooting] = fullMetalJacket.results;

Deno.test('normalizes a TMDB movie into a media_items row', () => {
  assertEquals(normalizeTmdbMovie(fmj), {
    type: 'movie',
    provider: 'tmdb',
    external_id: 'movie:600',
    title: 'Full Metal Jacket',
    subtitle: null,
    year: 1987,
    image_url: 'https://image.tmdb.org/t/p/w500/kMKyx1k8hWWscYFnPbnxxN4Eqo4.jpg',
    overview: fmj.overview,
    metadata: {
      poster_path: '/kMKyx1k8hWWscYFnPbnxxN4Eqo4.jpg',
      backdrop_path: '/3k2TRmqMjgt7tcwkYwZQdctnty3.jpg',
      original_title: 'Full Metal Jacket',
      original_language: 'en',
      popularity: fmj.popularity,
      vote_average: fmj.vote_average,
      vote_count: fmj.vote_count,
    },
  });
});

Deno.test('an empty release date means no year', () => {
  assertEquals(kubricksWar.release_date, '');
  assertEquals(normalizeTmdbMovie(kubricksWar).year, null);
});

Deno.test('a movie without a poster has no image', () => {
  assertEquals(shooting.poster_path, null);
  const movie = normalizeTmdbMovie(shooting);
  assertEquals(movie.image_url, null);
  assertEquals(movie.metadata.poster_path, null);
});

Deno.test('an empty overview is stored as null', () => {
  assertEquals(normalizeTmdbMovie({ ...fmj, overview: '' }).overview, null);
});

Deno.test('keeps TMDB ranking order', () => {
  assertEquals(
    normalizeTmdbMovieSearch(fullMetalJacket).map((m) => m.external_id),
    ['movie:600', 'movie:1567612', 'movie:614123', 'movie:386610', 'movie:1732140'],
  );
});

Deno.test('no matches gives an empty list', () => {
  assertEquals(normalizeTmdbMovieSearch(noResults), []);
});

Deno.test('asks TMDB for movies only, with the token as a bearer header', async () => {
  let seen: Request | undefined;
  const fakeFetch = (request: Request) => {
    seen = request;
    return Promise.resolve(Response.json(fullMetalJacket));
  };

  const results = await searchTmdbMovies('Full Metal Jacket', 'test-token', fakeFetch);

  const url = new URL(seen!.url);
  assertEquals(url.origin + url.pathname, 'https://api.themoviedb.org/3/search/movie');
  assertEquals(url.searchParams.get('query'), 'Full Metal Jacket');
  assertEquals(url.searchParams.get('include_adult'), 'false');
  assertEquals(url.searchParams.get('language'), 'en-US');
  assertEquals(url.searchParams.get('page'), '1');
  assertEquals(seen!.headers.get('authorization'), 'Bearer test-token');
  assertEquals(results.length, 5);
});

Deno.test('a TMDB error is raised with its status and message', async () => {
  const fakeFetch = () => Promise.resolve(Response.json(unauthorized, { status: 401 }));

  await assertRejects(
    () => searchTmdbMovies('anything', 'bad-token', fakeFetch),
    Error,
    'TMDB 401: Invalid API key: You must be granted a valid key.',
  );
});
