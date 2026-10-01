import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { useMediaSearch } from '@/hooks/use-media-search';
import type { MediaItem } from '@/lib/media-search';

const mockSearchMedia = jest.fn<Promise<MediaItem[]>, [string, string]>();

jest.mock('@/lib/supabase', () => ({ supabase: {} }));
jest.mock('@/lib/media-search', () => ({
  ...jest.requireActual<typeof import('@/lib/media-search')>('@/lib/media-search'),
  searchMedia: (type: string, query: string) => mockSearchMedia(type, query),
}));

function movie(title: string): MediaItem {
  return {
    id: `row-${title}`,
    type: 'movie',
    provider: 'tmdb',
    external_id: `movie:${title}`,
    title,
    subtitle: null,
    year: null,
    image_url: null,
    overview: null,
    metadata: {},
    fetched_at: '2026-10-01T18:00:00Z',
  };
}

function setup(initialQuery = '') {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return renderHook(({ query }: { query: string }) => useMediaSearch('movie', query), {
    wrapper,
    initialProps: { query: initialQuery },
  });
}

beforeEach(() => {
  jest.useFakeTimers();
  mockSearchMedia.mockReset().mockImplementation((_type, query) => Promise.resolve([movie(query)]));
});

afterEach(() => {
  jest.useRealTimers();
});

test('does not search for fewer than 2 characters', async () => {
  const { result } = await setup('A');
  await act(() => jest.advanceTimersByTime(1000));

  expect(mockSearchMedia).not.toHaveBeenCalled();
  expect(result.current).toEqual({ results: [], isSearching: false, error: null, noMatches: false });
});

test('is searching while waiting for typing to pause', async () => {
  const hook = await setup();
  await hook.rerender({ query: 'Alien' });
  await act(() => jest.advanceTimersByTime(100));

  expect(mockSearchMedia).not.toHaveBeenCalled();
  expect(hook.result.current.isSearching).toBe(true);
  expect(hook.result.current.noMatches).toBe(false);
});

test('reports no matches once a search finds nothing', async () => {
  mockSearchMedia.mockResolvedValue([]);
  const { result } = await setup('zzqxqzzqxq');
  await act(() => jest.advanceTimersByTime(300));

  await waitFor(() => expect(result.current.noMatches).toBe(true));
  expect(result.current.isSearching).toBe(false);
});

test('does not report no matches while the next search is waiting', async () => {
  mockSearchMedia.mockResolvedValue([]);
  const hook = await setup('zzqxqzzqxq');
  await act(() => jest.advanceTimersByTime(300));
  await waitFor(() => expect(hook.result.current.noMatches).toBe(true));

  await hook.rerender({ query: 'Alien' });

  expect(hook.result.current.noMatches).toBe(false);
  expect(hook.result.current.isSearching).toBe(true);
});

test('does not report no matches when the search failed', async () => {
  mockSearchMedia.mockRejectedValue(new Error('Search is having trouble. Try again in a moment.'));
  const { result } = await setup('Alien');
  await act(() => jest.advanceTimersByTime(300));

  await waitFor(() => expect(result.current.error).not.toBeNull());
  expect(result.current.noMatches).toBe(false);
});

test('searches once typing pauses for 300 ms', async () => {
  const hook = await setup();

  await hook.rerender({ query: 'Al' });
  await act(() => jest.advanceTimersByTime(100));
  await hook.rerender({ query: 'Ali' });
  await act(() => jest.advanceTimersByTime(100));
  await hook.rerender({ query: 'Alien' });
  await act(() => jest.advanceTimersByTime(299));
  expect(mockSearchMedia).not.toHaveBeenCalled();

  await act(() => jest.advanceTimersByTime(1));
  await waitFor(() => expect(hook.result.current.results).toEqual([movie('Alien')]));
  expect(mockSearchMedia).toHaveBeenCalledTimes(1);
  expect(mockSearchMedia).toHaveBeenCalledWith('movie', 'Alien');
});

test('is searching while the request is out', async () => {
  mockSearchMedia.mockReturnValue(new Promise(() => {}));
  const { result } = await setup('Alien');
  await act(() => jest.advanceTimersByTime(300));

  expect(result.current.isSearching).toBe(true);
});

test('reports a failed search with its message', async () => {
  mockSearchMedia.mockRejectedValue(new Error('Search is having trouble. Try again in a moment.'));
  const { result } = await setup('Alien');
  await act(() => jest.advanceTimersByTime(300));

  await waitFor(() =>
    expect(result.current.error).toBe('Search is having trouble. Try again in a moment.'),
  );
  expect(result.current.results).toEqual([]);
});

test('clearing the query clears the results', async () => {
  const hook = await setup('Alien');
  await act(() => jest.advanceTimersByTime(300));
  await waitFor(() => expect(hook.result.current.results).toHaveLength(1));

  await hook.rerender({ query: '' });
  await act(() => jest.advanceTimersByTime(300));

  expect(hook.result.current.results).toEqual([]);
});
