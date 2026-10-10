import { PostgrestError } from '@supabase/supabase-js';

import {
  addRecommendation,
  adventureRecommendations,
  cleanReasons,
  MAX_PICKS,
  onRoute,
  openSlots,
  reasonsProblem,
  type Recommendation,
  replaceRecommendation,
  splitRecommendations,
} from '@/lib/recommendations';

type DatabaseResult = { data: unknown; error: PostgrestError | null };

const mockRpc = jest.fn<Promise<DatabaseResult>, [string, unknown]>();

jest.mock('@/lib/supabase', () => ({
  supabase: {
    rpc: (fn: string, args: unknown) => mockRpc(fn, args),
  },
}));

function databaseError(message: string) {
  return new PostgrestError({ code: 'P0001', message, details: '', hint: '' });
}

function recommendation(title: string, rank: number, outgoing: boolean, type = 'movie'): Recommendation {
  return {
    id: `${title}-id`,
    outgoing,
    rank,
    reasons: [`Watch ${title}`],
    media_item_id: `${title}-media`,
    type,
    external_id: `movie:${title}`,
    title,
    year: 2019,
    metadata: {},
  };
}

beforeEach(() => {
  mockRpc.mockReset().mockResolvedValue({ data: null, error: null });
});

test('adds a recommendation for a fellow nomad', async () => {
  mockRpc.mockResolvedValue({ data: 'recommendation-1', error: null });

  const id = await addRecommendation('roy-id', 'media-1', ['The coffin flops', 'You will scream']);

  expect(id).toBe('recommendation-1');
  expect(mockRpc).toHaveBeenCalledTimes(1);
  expect(mockRpc).toHaveBeenCalledWith('add_recommendation', {
    nomad_id: 'roy-id',
    media_item_id: 'media-1',
    reasons: ['The coffin flops', 'You will scream'],
  });
});

test('passes along the reason a recommendation was refused', async () => {
  mockRpc.mockResolvedValue({ data: null, error: databaseError('Your movie route for roy-donk is full') });

  await expect(addRecommendation('roy-id', 'media-1', ['Hi'])).rejects.toThrow(
    'Your movie route for roy-donk is full',
  );
});

test('replaces a stop on your route', async () => {
  mockRpc.mockResolvedValue({ data: 'recommendation-2', error: null });

  const id = await replaceRecommendation('recommendation-1', 'media-2', ['Croon', 'Drive']);

  expect(id).toBe('recommendation-2');
  expect(mockRpc).toHaveBeenCalledTimes(1);
  expect(mockRpc).toHaveBeenCalledWith('replace_recommendation', {
    recommendation_id: 'recommendation-1',
    media_item_id: 'media-2',
    reasons: ['Croon', 'Drive'],
  });
});

test('passes along the reason a replacement was refused', async () => {
  mockRpc.mockResolvedValue({ data: null, error: databaseError('Replace a movie stop with another movie') });

  await expect(replaceRecommendation('recommendation-1', 'media-2', ['Hi'])).rejects.toThrow(
    'Replace a movie stop with another movie',
  );
});

test('loads the recommendations between you and a fellow nomad', async () => {
  const rows = [recommendation('Coffin Flop', 1, true)];
  mockRpc.mockResolvedValue({ data: rows, error: null });

  await expect(adventureRecommendations('roy-id')).resolves.toEqual(rows);
  expect(mockRpc).toHaveBeenCalledWith('adventure_recommendations', { nomad_id: 'roy-id' });
});

test('passes along a failed load', async () => {
  mockRpc.mockResolvedValue({ data: null, error: databaseError('connection lost') });

  await expect(adventureRecommendations('roy-id')).rejects.toThrow('connection lost');
});

test('trims reasons and drops blank ones', () => {
  expect(cleanReasons(['  So buff  ', '', '   ', 'Pants'])).toEqual(['So buff', 'Pants']);
});

test('accepts one to three short reasons', () => {
  expect(reasonsProblem(['One'])).toBeNull();
  expect(reasonsProblem(['One', 'Two', 'Three'])).toBeNull();
  expect(reasonsProblem(['x'.repeat(140)])).toBeNull();
});

test('needs at least one reason that is not blank', () => {
  expect(reasonsProblem([])).toBe('Give 1 to 3 reasons');
  expect(reasonsProblem(['', '  '])).toBe('Give 1 to 3 reasons');
});

test('allows at most three reasons', () => {
  expect(reasonsProblem(['a', 'b', 'c', 'd'])).toBe('Give 1 to 3 reasons');
});

test('keeps each reason under 140 characters', () => {
  expect(reasonsProblem(['Fine', 'x'.repeat(141)])).toBe('Keep each reason under 140 characters');
});

test('splits one media type into their picks for you and your picks for them, by rank', () => {
  const rows = [
    recommendation('Little Buff Boys', 2, true),
    recommendation('Coffin Flop', 1, true),
    recommendation('Driving Crooner', 1, false),
    recommendation('The Ghost Tour', 1, false, 'series'),
  ];

  const { fromThem, toThem } = splitRecommendations(rows, 'movie');

  expect(fromThem.map((r) => r.title)).toEqual(['Driving Crooner']);
  expect(toThem.map((r) => r.title)).toEqual(['Coffin Flop', 'Little Buff Boys']);
});

test('counts the open slots in a list', () => {
  expect(MAX_PICKS).toBe(3);
  expect(openSlots([])).toBe(3);
  expect(openSlots([recommendation('Coffin Flop', 1, true), recommendation('Little Buff Boys', 2, true)])).toBe(1);
});

test('knows when a search result is already on your route', () => {
  const route = [recommendation('Coffin Flop', 1, true), recommendation('Little Buff Boys', 2, true)];

  expect(onRoute(route, 'movie:Little Buff Boys')).toBe(true);
  expect(onRoute(route, 'movie:Driving Crooner')).toBe(false);
  expect(onRoute([], 'movie:Coffin Flop')).toBe(false);
});
