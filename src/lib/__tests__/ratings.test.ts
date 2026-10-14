import { PostgrestError } from '@supabase/supabase-js';

import { blockedStop, reachedNote, reachedStop, reachedStops, type ReachedStop } from '@/lib/ratings';
import type { Recommendation } from '@/lib/recommendations';

type DatabaseResult = { data: unknown; error: PostgrestError | null };

const mockRpc = jest.fn<Promise<DatabaseResult>, [string, unknown]>();

jest.mock('@/lib/supabase', () => ({
  supabase: {
    rpc: (fn: string, args: unknown) => mockRpc(fn, args),
  },
}));

function reached(externalId: string, stars: number, encounter: number): ReachedStop {
  return {
    media_item_id: `${externalId}-media`,
    external_id: externalId,
    stars,
    encounter,
    watched_on: '2026-10-12',
  };
}

beforeEach(() => {
  mockRpc.mockReset().mockResolvedValue({ data: [], error: null });
});

test("looks up the stops a fellow nomad has reached", async () => {
  mockRpc.mockResolvedValue({ data: [reached('movie:1', 1, 0)], error: null });

  const stops = await reachedStops('roy-id');

  expect(stops).toEqual([reached('movie:1', 1, 0)]);
  expect(mockRpc).toHaveBeenCalledWith('reached_stops', { nomad_id: 'roy-id' });
});

test('passes along why the lookup failed', async () => {
  mockRpc.mockResolvedValue({
    data: null,
    error: new PostgrestError({ code: '42501', message: 'permission denied', details: '', hint: '' }),
  });

  await expect(reachedStops('roy-id')).rejects.toThrow('permission denied');
});

test('finds a reached stop by its external id', () => {
  const stops = [reached('movie:1', 1, 0), reached('movie:2', 3, 2)];

  expect(reachedStop(stops, 'movie:2')).toEqual(reached('movie:2', 3, 2));
  expect(reachedStop(stops, 'movie:3')).toBeNull();
});

test('names the nomad and the encounter they had', () => {
  expect(reachedNote('roy-donk', reached('movie:1', 1, 0))).toBe(
    'ROY-DONK ALREADY REACHED THIS: MUTANT LATRINE FOUND',
  );
  expect(reachedNote('roy-donk', reached('movie:2', 2, 1))).toBe(
    'ROY-DONK ALREADY REACHED THIS: BATTLE OF THE BANDS',
  );
});

test('leaves off the encounter when the stars make no sense', () => {
  expect(reachedNote('roy-donk', reached('movie:1', 9, 0))).toBe('ROY-DONK ALREADY REACHED THIS');
});

function onTheRoute(externalId: string): Recommendation {
  return {
    id: `${externalId}-id`,
    outgoing: true,
    rank: 1,
    reasons: ['Watch it'],
    media_item_id: `${externalId}-media`,
    type: 'movie',
    external_id: externalId,
    title: 'Coffin Flop',
    year: 2019,
    metadata: {},
  };
}

test('dims a search result that is already on your route', () => {
  expect(blockedStop('movie:1', [onTheRoute('movie:1')], [], 'roy-donk')).toEqual({
    note: 'ALREADY ON YOUR ROUTE',
    testID: 'plot-stop-unavailable-movie:1',
  });
});

test('dims a search result the nomad already reached', () => {
  expect(blockedStop('movie:2', [], [reached('movie:2', 1, 0)], 'roy-donk')).toEqual({
    note: 'ROY-DONK ALREADY REACHED THIS: MUTANT LATRINE FOUND',
    testID: 'plot-stop-reached-movie:2',
  });
});

test('leaves every other search result alone', () => {
  expect(blockedStop('movie:3', [onTheRoute('movie:1')], [reached('movie:2', 1, 0)], 'roy-donk')).toBeNull();
});
