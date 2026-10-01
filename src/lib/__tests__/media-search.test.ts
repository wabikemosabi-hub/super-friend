import { FunctionsHttpError } from '@supabase/supabase-js';

import {
  posterPath,
  searchMedia,
  searchTrouble,
  shouldSearch,
  tmdbImage,
  type MediaItem,
} from '@/lib/media-search';

type InvokeResult = { data: { results: MediaItem[] } | null; error: Error | null };

const mockInvoke = jest.fn<Promise<InvokeResult>, [string, { body: unknown }]>();

jest.mock('@/lib/supabase', () => ({
  supabase: { functions: { invoke: (name: string, options: { body: unknown }) => mockInvoke(name, options) } },
}));

const fullMetalJacket: MediaItem = {
  id: 'row-1',
  type: 'movie',
  provider: 'tmdb',
  external_id: 'movie:600',
  title: 'Full Metal Jacket',
  subtitle: null,
  year: 1987,
  image_url: 'https://image.tmdb.org/t/p/w500/kMKyx1k8hWWscYFnPbnxxN4Eqo4.jpg',
  overview: null,
  metadata: { poster_path: '/kMKyx1k8hWWscYFnPbnxxN4Eqo4.jpg' },
  fetched_at: '2026-10-01T18:00:00Z',
};

beforeEach(() => {
  mockInvoke.mockReset().mockResolvedValue({ data: { results: [fullMetalJacket] }, error: null });
});

test('asks the media-search function for one media type', async () => {
  await searchMedia('movie', '  Full Metal Jacket ');

  expect(mockInvoke).toHaveBeenCalledWith('media-search', {
    body: { type: 'movie', query: 'Full Metal Jacket' },
  });
});

test('returns the cached media rows', async () => {
  await expect(searchMedia('movie', 'Full Metal Jacket')).resolves.toEqual([fullMetalJacket]);
});

test('any failure becomes the friendly message', async () => {
  mockInvoke.mockResolvedValue({
    data: null,
    error: new FunctionsHttpError(new Response('{"error":"TMDB 401"}', { status: 502 })),
  });

  await expect(searchMedia('movie', 'Alien')).rejects.toThrow(searchTrouble);
});

test('the friendly message', () => {
  expect(searchTrouble).toBe('Search is having trouble. Try again in a moment.');
});

test.each([
  ['', false],
  ['a', false],
  ['  a  ', false],
  ['al', true],
  ['Full Metal Jacket', true],
])('shouldSearch(%p) is %p', (query, expected) => {
  expect(shouldSearch(query)).toBe(expected);
});

test('builds a TMDB image URL at the size asked for', () => {
  expect(tmdbImage('/kMKyx1k8hWWscYFnPbnxxN4Eqo4.jpg', 'w185')).toBe(
    'https://image.tmdb.org/t/p/w185/kMKyx1k8hWWscYFnPbnxxN4Eqo4.jpg',
  );
});

test('no image path means no image', () => {
  expect(tmdbImage(null, 'w185')).toBeNull();
  expect(tmdbImage(undefined, 'w500')).toBeNull();
});

test('reads the TMDB poster path from a media row', () => {
  expect(posterPath(fullMetalJacket)).toBe('/kMKyx1k8hWWscYFnPbnxxN4Eqo4.jpg');
});

test.each([
  ['no poster', { poster_path: null }],
  ['no metadata keys', {}],
  ['a poster path that is not text', { poster_path: 42 }],
  ['metadata that is a list', ['/kMKyx1k8hWWscYFnPbnxxN4Eqo4.jpg']],
])('a row with %s has no poster path', (_case, metadata) => {
  expect(posterPath({ ...fullMetalJacket, metadata })).toBeNull();
});
