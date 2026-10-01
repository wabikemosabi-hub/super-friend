import { assertEquals } from 'jsr:@std/assert@1';

import type { MediaItem, NewMediaItem } from '../_shared/media.ts';
import { handleMediaSearch, type MediaSearchDeps } from '../media-search/handler.ts';

function movie(id: number, title: string): NewMediaItem {
  return {
    type: 'movie',
    provider: 'tmdb',
    external_id: `movie:${id}`,
    title,
    subtitle: null,
    year: null,
    image_url: null,
    overview: null,
    metadata: {},
  };
}

function fakes(overrides: Partial<MediaSearchDeps> = {}) {
  const calls = { searched: [] as string[], cached: [] as NewMediaItem[][] };
  const deps: MediaSearchDeps = {
    isSignedIn: () => Promise.resolve(true),
    searchMovies: (query: string) => {
      calls.searched.push(query);
      return Promise.resolve([movie(600, 'Full Metal Jacket'), movie(386610, 'Between Good and Evil')]);
    },
    cache: (items: NewMediaItem[]) => {
      calls.cached.push(items);
      const rows: MediaItem[] = items.map((m, i) => ({ ...m, id: `row-${i}`, fetched_at: 'now' }));
      return Promise.resolve(rows.reverse());
    },
    ...overrides,
  };
  return { deps, calls };
}

function post(body: unknown) {
  return new Request('http://localhost/functions/v1/media-search', {
    method: 'POST',
    headers: { authorization: 'Bearer user-jwt', 'content-type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

Deno.test('answers the browser preflight with CORS headers', async () => {
  const { deps } = fakes();
  const res = await handleMediaSearch(new Request('http://localhost/', { method: 'OPTIONS' }), deps);
  assertEquals(res.status, 200);
  assertEquals(res.headers.get('access-control-allow-origin'), '*');
});

Deno.test('refuses callers who are not signed in, without searching', async () => {
  const { deps, calls } = fakes({ isSignedIn: () => Promise.resolve(false) });
  const res = await handleMediaSearch(post({ type: 'movie', query: 'Alien' }), deps);
  assertEquals(res.status, 401);
  assertEquals(await res.json(), { error: 'Sign in to search' });
  assertEquals(calls.searched, []);
});

Deno.test('refuses a body that is not JSON', async () => {
  const { deps } = fakes();
  const res = await handleMediaSearch(post('not json'), deps);
  assertEquals(res.status, 400);
  assertEquals(await res.json(), { error: 'Send JSON like { "type": "movie", "query": "Alien" }' });
});

Deno.test('refuses an unknown media type', async () => {
  const { deps, calls } = fakes();
  const res = await handleMediaSearch(post({ type: 'vinyl', query: 'Alien' }), deps);
  assertEquals(res.status, 400);
  assertEquals(await res.json(), { error: 'Unknown media type: vinyl' });
  assertEquals(calls.searched, []);
});

Deno.test('refuses media types that are not built yet', async () => {
  const { deps, calls } = fakes();
  const res = await handleMediaSearch(post({ type: 'series', query: 'Severance' }), deps);
  assertEquals(res.status, 400);
  assertEquals(await res.json(), { error: 'Searching for series is not available yet' });
  assertEquals(calls.searched, []);
});

Deno.test('a blank query returns nothing, without searching', async () => {
  const { deps, calls } = fakes();
  const res = await handleMediaSearch(post({ type: 'movie', query: '   ' }), deps);
  assertEquals(res.status, 200);
  assertEquals(await res.json(), { results: [] });
  assertEquals(calls.searched, []);
});

Deno.test('a movie search returns cached rows in TMDB order', async () => {
  const { deps, calls } = fakes();
  const res = await handleMediaSearch(post({ type: 'movie', query: '  Full Metal Jacket ' }), deps);

  assertEquals(res.status, 200);
  assertEquals(calls.searched, ['Full Metal Jacket']);
  const { results } = await res.json();
  assertEquals(
    results.map((r: MediaItem) => [r.external_id, r.id]),
    [['movie:600', 'row-0'], ['movie:386610', 'row-1']],
  );
});

Deno.test('duplicate results are cached once', async () => {
  const { deps, calls } = fakes({
    searchMovies: () => Promise.resolve([movie(600, 'Full Metal Jacket'), movie(600, 'Full Metal Jacket')]),
  });
  await handleMediaSearch(post({ type: 'movie', query: 'Full Metal Jacket' }), deps);
  assertEquals(calls.cached[0].length, 1);
});

Deno.test('no matches returns nothing, without touching the cache', async () => {
  const { deps, calls } = fakes({ searchMovies: () => Promise.resolve([]) });
  const res = await handleMediaSearch(post({ type: 'movie', query: 'zzqxqzzqxq' }), deps);
  assertEquals(await res.json(), { results: [] });
  assertEquals(calls.cached, []);
});

Deno.test('a TMDB failure is a bad gateway', async () => {
  const { deps } = fakes({ searchMovies: () => Promise.reject(new Error('TMDB 401: Invalid API key')) });
  const res = await handleMediaSearch(post({ type: 'movie', query: 'Alien' }), deps);
  assertEquals(res.status, 502);
  assertEquals(await res.json(), { error: 'TMDB 401: Invalid API key' });
});
