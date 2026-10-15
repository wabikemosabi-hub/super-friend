import { fireEvent, render, screen, within } from '@testing-library/react-native';

import { RoadMap } from '@/components/road-map';
import type { Recommendation } from '@/lib/recommendations';

jest.mock('@/lib/supabase', () => ({ supabase: {} }));
jest.mock('@/lib/scan-line', () => ({
  scanLineOn: () => true,
  rememberScanLine: jest.fn(),
}));
jest.mock(
  'react-native-safe-area-context',
  () => jest.requireActual<{ default: object }>('react-native-safe-area-context/jest/mock').default,
);

function stop(title: string, rank: number): Recommendation {
  return {
    id: `${title}-id`,
    outgoing: false,
    rank,
    reasons: [`Watch ${title}`],
    media_item_id: `${title}-media`,
    type: 'movie',
    external_id: `movie:${title}`,
    title,
    year: 2019,
    metadata: {},
  };
}

const picks = [stop('Coffin Flop', 1), stop('Hot Dog Car', 2)];

test('wide: the rate key sits on the console, outside the stop screen', async () => {
  await render(<RoadMap isLoading={false} nomadName="taffy-lee-fubbins" onRate={jest.fn()} picks={picks} wide />);

  expect(screen.getByTestId('road-rate-movie:Coffin Flop')).toHaveTextContent('RATE');
  expect(within(screen.getByTestId('road-detail')).queryByTestId('road-rate-movie:Coffin Flop')).toBeNull();
  expect(screen.getByText('RATE THIS STOP')).toBeTruthy();
});

test('wide: the rate key rates the stop on the screen', async () => {
  await render(<RoadMap isLoading={false} nomadName="taffy-lee-fubbins" onRate={jest.fn()} picks={picks} wide />);

  await fireEvent.press(screen.getByTestId('road-rate-movie:Coffin Flop'));

  expect(screen.getByText('RATE · COFFIN FLOP (2019)')).toBeTruthy();
});

test('narrow: the rate key sits under the screen and rates the open stop', async () => {
  await render(<RoadMap isLoading={false} nomadName="taffy-lee-fubbins" onRate={jest.fn()} picks={picks} wide={false} />);

  expect(within(screen.getByTestId('road-stop-movie:Coffin Flop')).queryByTestId('road-rate-movie:Coffin Flop')).toBeNull();
  expect(screen.getByText('RATE THIS STOP')).toBeTruthy();
  expect(screen.getByText("▾ END OF TAFFY-LEE-FUBBINS'S ROUTE.")).toBeTruthy();
  expect(screen.queryByText(/3 STOPS, ALWAYS/)).toBeNull();

  await fireEvent.press(screen.getByTestId('road-stop-movie:Hot Dog Car'));

  expect(screen.getByText('RATE THIS STOP')).toBeTruthy();
  await fireEvent.press(screen.getByTestId('road-rate-movie:Hot Dog Car'));
  expect(screen.getByText('RATE · HOT DOG CAR (2019)')).toBeTruthy();
});

test('narrow: with every stop folded shut, the key waits for a stop', async () => {
  await render(<RoadMap isLoading={false} nomadName="taffy-lee-fubbins" onRate={jest.fn()} picks={picks} wide={false} />);

  await fireEvent.press(screen.getByTestId('road-stop-movie:Coffin Flop'));

  expect(screen.getByText('OPEN A STOP TO RATE IT')).toBeTruthy();
  expect(screen.getByTestId('road-rate')).toBeDisabled();
});
