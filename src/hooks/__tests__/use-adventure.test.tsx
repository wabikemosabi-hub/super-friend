import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { useAdventure } from '@/hooks/use-adventure';
import type { Recommendation } from '@/lib/recommendations';

const mockAdventureRecommendations = jest.fn<Promise<Recommendation[]>, [string]>();
const mockAddRecommendation = jest.fn<Promise<string>, [string, string, string[]]>();

jest.mock('@/lib/supabase', () => ({ supabase: {} }));
jest.mock('@/lib/recommendations', () => ({
  ...jest.requireActual<typeof import('@/lib/recommendations')>('@/lib/recommendations'),
  adventureRecommendations: (nomadId: string) => mockAdventureRecommendations(nomadId),
  addRecommendation: (nomadId: string, mediaItemId: string, reasons: string[]) =>
    mockAddRecommendation(nomadId, mediaItemId, reasons),
}));

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

const coffinFlop = recommendation('Coffin Flop', 1, true);
const drivingCrooner = recommendation('Driving Crooner', 1, false);
const ghostTour = recommendation('The Ghost Tour', 1, false, 'series');

function setup(nomadId: string | null) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return renderHook(() => useAdventure(nomadId, 'movie'), { wrapper });
}

beforeEach(() => {
  mockAdventureRecommendations.mockReset().mockResolvedValue([coffinFlop, drivingCrooner, ghostTour]);
  mockAddRecommendation.mockReset().mockResolvedValue('new-id');
});

test('loads the picks between you and the nomad for one media type', async () => {
  const { result } = await setup('roy-id');

  expect(result.current.isLoading).toBe(true);
  await waitFor(() => expect(result.current.isLoading).toBe(false));
  expect(mockAdventureRecommendations).toHaveBeenCalledWith('roy-id');
  expect(result.current.fromThem).toEqual([drivingCrooner]);
  expect(result.current.toThem).toEqual([coffinFlop]);
  expect(result.current.error).toBeNull();
});

test('waits without loading until it knows the nomad', async () => {
  const { result } = await setup(null);

  expect(mockAdventureRecommendations).not.toHaveBeenCalled();
  expect(result.current.fromThem).toEqual([]);
  expect(result.current.toThem).toEqual([]);
});

test('reports picks that would not load', async () => {
  mockAdventureRecommendations.mockRejectedValue(new Error('connection failure'));
  const { result } = await setup('roy-id');

  await waitFor(() => expect(result.current.error).toBe('connection failure'));
  expect(result.current.toThem).toEqual([]);
});

test('adds a pick with cleaned reasons, then refreshes', async () => {
  const { result } = await setup('roy-id');
  await waitFor(() => expect(result.current.isLoading).toBe(false));

  await act(() => result.current.add('media-1', ['  So buff ', '']));

  expect(mockAddRecommendation).toHaveBeenCalledWith('roy-id', 'media-1', ['So buff']);
  await waitFor(() => expect(mockAdventureRecommendations).toHaveBeenCalledTimes(2));
});

test('passes along the reason a pick was refused', async () => {
  mockAddRecommendation.mockRejectedValue(new Error('Your movie route for roy-donk is full'));
  const { result } = await setup('roy-id');
  await waitFor(() => expect(result.current.isLoading).toBe(false));

  await expect(result.current.add('media-1', ['Hi'])).rejects.toThrow('Your movie route for roy-donk is full');
  expect(mockAdventureRecommendations).toHaveBeenCalledTimes(1);
});
