import { fireEvent, render, screen } from '@testing-library/react-native';

import { ReachStopPanel } from '@/components/reach-stop-panel';
import type { Recommendation } from '@/lib/recommendations';

jest.mock('@/lib/supabase', () => ({ supabase: {} }));
jest.mock(
  'react-native-safe-area-context',
  () => jest.requireActual<{ default: object }>('react-native-safe-area-context/jest/mock').default,
);

const coffinFlop: Recommendation = {
  id: 'coffin-flop-id',
  outgoing: false,
  rank: 1,
  reasons: ['Bones'],
  media_item_id: 'coffin-flop-media',
  type: 'movie',
  external_id: 'movie:coffin-flop',
  title: 'Coffin Flop',
  year: 2019,
  metadata: {},
};

afterEach(() => {
  jest.restoreAllMocks();
});

test('asks for stars before showing an encounter', async () => {
  await render(<ReachStopPanel onClose={jest.fn()} stop={coffinFlop} visible />);

  expect(screen.getByTestId('reach-stop-close')).toBeTruthy();
  expect(screen.getByText(/COFFIN FLOP/)).toBeTruthy();
  expect(screen.getByTestId('reach-stars-prompt')).toBeTruthy();
  expect(screen.queryByTestId('reach-encounter')).toBeNull();
});

test('picking stars reveals a random encounter for that many stars', async () => {
  jest.spyOn(Math, 'random').mockReturnValue(0);
  await render(<ReachStopPanel onClose={jest.fn()} stop={coffinFlop} visible />);

  await fireEvent.press(screen.getByTestId('reach-star-1'));

  expect(screen.getByTestId('reach-encounter-stars')).toHaveTextContent('★☆☆☆☆');
  expect(screen.getByTestId('reach-encounter-title')).toHaveTextContent('MUTANT LATRINE FOUND');
  expect(screen.queryByTestId('reach-stars-prompt')).toBeNull();
});

test('changing the stars draws a new encounter for the new star count', async () => {
  jest.spyOn(Math, 'random').mockReturnValue(0.99);
  await render(<ReachStopPanel onClose={jest.fn()} stop={coffinFlop} visible />);

  await fireEvent.press(screen.getByTestId('reach-star-1'));
  await fireEvent.press(screen.getByTestId('reach-star-2'));

  expect(screen.getByTestId('reach-encounter-stars')).toHaveTextContent('★★☆☆☆');
  expect(screen.getByTestId('reach-encounter-title')).toHaveTextContent('COMMUNE INVITE EXTENDED TO ME');
});

test('tapping the same stars again keeps the encounter', async () => {
  const random = jest.spyOn(Math, 'random').mockReturnValue(0);
  await render(<ReachStopPanel onClose={jest.fn()} stop={coffinFlop} visible />);

  await fireEvent.press(screen.getByTestId('reach-star-1'));
  random.mockReturnValue(0.99);
  await fireEvent.press(screen.getByTestId('reach-star-1'));

  expect(screen.getByTestId('reach-encounter-title')).toHaveTextContent('MUTANT LATRINE FOUND');
});

test('closing the panel tells the road', async () => {
  const onClose = jest.fn();
  await render(<ReachStopPanel onClose={onClose} stop={coffinFlop} visible />);

  await fireEvent.press(screen.getByTestId('reach-stop-close'));

  expect(onClose).toHaveBeenCalledTimes(1);
});
