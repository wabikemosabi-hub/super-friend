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

test('opens on a punch card with stars and no encounter', async () => {
  await render(<ReachStopPanel navigator="taffy-lee-fubbins" onClose={jest.fn()} onLog={jest.fn()} stop={coffinFlop} visible />);

  expect(screen.getByTestId('reach-stop-close')).toBeTruthy();
  expect(screen.getByText('RATE · COFFIN FLOP (2019)')).toBeTruthy();
  expect(screen.getByTestId('reach-card')).toBeTruthy();
  expect(screen.getByText('PLEASE RATE NOMAD STOP')).toBeTruthy();
  expect(screen.queryByTestId('reach-encounter')).toBeNull();
  expect(screen.queryByText(/THE ROAD DECIDES/)).toBeNull();
});

test('picking stars lights them without giving away the encounter', async () => {
  await render(<ReachStopPanel navigator="taffy-lee-fubbins" onClose={jest.fn()} onLog={jest.fn()} stop={coffinFlop} visible />);

  await fireEvent.press(screen.getByTestId('reach-star-3'));

  expect(screen.getByTestId('reach-star-3')).toBeChecked();
  expect(screen.getByTestId('reach-star-2')).not.toBeChecked();
  expect(screen.queryByTestId('reach-encounter')).toBeNull();
});

test('closing the panel tells the road', async () => {
  const onClose = jest.fn();
  await render(<ReachStopPanel navigator="taffy-lee-fubbins" onClose={onClose} onLog={jest.fn()} stop={coffinFlop} visible />);

  await fireEvent.press(screen.getByTestId('reach-stop-close'));

  expect(onClose).toHaveBeenCalledTimes(1);
});

test('waits for stars before heading on to reasons', async () => {
  await render(<ReachStopPanel navigator="taffy-lee-fubbins" onClose={jest.fn()} onLog={jest.fn()} stop={coffinFlop} visible />);

  expect(screen.queryByTestId('reach-to-reasons')).toBeNull();

  await fireEvent.press(screen.getByTestId('reach-star-3'));

  expect(screen.getByTestId('reach-to-reasons')).toBeTruthy();
});

test('heading on asks for up to three things found out there', async () => {
  await render(<ReachStopPanel navigator="taffy-lee-fubbins" onClose={jest.fn()} onLog={jest.fn()} stop={coffinFlop} visible />);

  await fireEvent.press(screen.getByTestId('reach-star-1'));
  await fireEvent.press(screen.getByTestId('reach-to-reasons'));

  expect(screen.getByTestId('reach-reason-1')).toBeTruthy();
  expect(screen.getByTestId('reach-reason-2')).toBeTruthy();
  expect(screen.getByTestId('reach-reason-3')).toBeTruthy();
  expect(screen.getByText('REASONS FOR RATING')).toBeTruthy();
  expect(screen.queryByText(/WHAT DID YOU FIND/)).toBeNull();
  expect(screen.queryByTestId('reach-star-1')).toBeNull();
  expect(screen.queryByTestId('reach-encounter')).toBeNull();
  expect(screen.getByTestId('reach-reasons-help')).toHaveTextContent(
    'Help your navigator get you safely through this Wasteland! Give good reasons so that they can tailor their navigation to your specific desires!',
  );
});

test('only two steps: stars and reasons', async () => {
  await render(<ReachStopPanel navigator="taffy-lee-fubbins" onClose={jest.fn()} onLog={jest.fn()} stop={coffinFlop} visible />);

  expect(screen.getByTestId('reach-step-stars')).toBeTruthy();
  expect(screen.getByTestId('reach-step-reasons')).toBeTruthy();
  expect(screen.queryByTestId('reach-step-when')).toBeNull();
});

test('needs at least one reason before logging it', async () => {
  const onLog = jest.fn();
  await render(<ReachStopPanel navigator="taffy-lee-fubbins" onClose={jest.fn()} onLog={onLog} stop={coffinFlop} visible />);

  await fireEvent.press(screen.getByTestId('reach-star-2'));
  await fireEvent.press(screen.getByTestId('reach-to-reasons'));
  await fireEvent.changeText(screen.getByTestId('reach-reason-1'), '   ');
  await fireEvent.press(screen.getByTestId('reach-log'));

  expect(screen.getByTestId('reach-error')).toHaveTextContent('Give 1 to 3 reasons');
  expect(onLog).not.toHaveBeenCalled();
});

test('the encounter is drawn when you log it, for the stars you ended on', async () => {
  const random = jest.spyOn(Math, 'random').mockReturnValue(0);
  const onLog = jest.fn().mockResolvedValue(undefined);
  await render(<ReachStopPanel navigator="taffy-lee-fubbins" onClose={jest.fn()} onLog={onLog} stop={coffinFlop} visible />);

  await fireEvent.press(screen.getByTestId('reach-star-1'));
  await fireEvent.press(screen.getByTestId('reach-star-2'));
  await fireEvent.press(screen.getByTestId('reach-to-reasons'));
  await fireEvent.changeText(screen.getByTestId('reach-reason-2'), 'a goat with opinions');
  random.mockReturnValue(0.99);
  await fireEvent.press(screen.getByTestId('reach-log'));

  expect(onLog).toHaveBeenCalledTimes(1);
  expect(onLog).toHaveBeenCalledWith(2, 2, ['', 'a goat with opinions', '']);
});

test('once logged, the card flips to the screen and reveals the encounter and the story', async () => {
  jest.spyOn(Math, 'random').mockReturnValue(0);
  const onClose = jest.fn();
  await render(
    <ReachStopPanel navigator="taffy-lee-fubbins" onClose={onClose} onLog={jest.fn().mockResolvedValue(undefined)} stop={coffinFlop} visible />,
  );

  await fireEvent.press(screen.getByTestId('reach-star-1'));
  await fireEvent.press(screen.getByTestId('reach-to-reasons'));
  await fireEvent.changeText(screen.getByTestId('reach-reason-1'), '  a goat with opinions ');
  await fireEvent.press(screen.getByTestId('reach-log'));

  expect(screen.queryByTestId('reach-card')).toBeNull();
  expect(screen.getByTestId('reach-reveal')).toBeTruthy();
  expect(screen.getByTestId('reach-encounter-stars')).toHaveTextContent('★☆☆☆☆');
  expect(screen.getByTestId('reach-encounter-title')).toHaveTextContent('MUTANT LATRINE FOUND');
  expect(screen.getByTestId('reach-reveal-story')).toHaveTextContent(
    /taffy-lee-fubbins pointed me towards a stop in the wasteland known as Coffin Flop\. Instead of the Bones that I was promised I found a goat with opinions!/,
  );
  expect(screen.getAllByTestId('reach-reveal-redacted')).toHaveLength(4);
  expect(onClose).not.toHaveBeenCalled();

  await fireEvent.press(screen.getByTestId('reach-done'));

  expect(onClose).toHaveBeenCalledTimes(1);
});

test('stays open with the problem when the log does not go through', async () => {
  const onLog = jest.fn().mockRejectedValue(new Error('You can only rate stops plotted for you'));
  const onClose = jest.fn();
  await render(<ReachStopPanel navigator="taffy-lee-fubbins" onClose={onClose} onLog={onLog} stop={coffinFlop} visible />);

  await fireEvent.press(screen.getByTestId('reach-star-3'));
  await fireEvent.press(screen.getByTestId('reach-to-reasons'));
  await fireEvent.changeText(screen.getByTestId('reach-reason-1'), 'Spam');
  await fireEvent.press(screen.getByTestId('reach-log'));

  expect(screen.getByTestId('reach-error')).toHaveTextContent('You can only rate stops plotted for you');
  expect(screen.getByTestId('reach-reason-1')).toHaveDisplayValue('Spam');
  expect(screen.queryByTestId('reach-reveal')).toBeNull();
  expect(onClose).not.toHaveBeenCalled();
});

test('going back to stars keeps the stars and the reasons', async () => {
  await render(<ReachStopPanel navigator="taffy-lee-fubbins" onClose={jest.fn()} onLog={jest.fn()} stop={coffinFlop} visible />);

  await fireEvent.press(screen.getByTestId('reach-star-3'));
  await fireEvent.press(screen.getByTestId('reach-to-reasons'));
  await fireEvent.changeText(screen.getByTestId('reach-reason-1'), 'damp socks');
  await fireEvent.press(screen.getByTestId('reach-back-to-stars'));

  expect(screen.getByTestId('reach-star-3')).toBeChecked();

  await fireEvent.press(screen.getByTestId('reach-to-reasons'));

  expect(screen.getByTestId('reach-reason-1')).toHaveDisplayValue('damp socks');
});

test('closing starts the next visit back at the stars', async () => {
  await render(<ReachStopPanel navigator="taffy-lee-fubbins" onClose={jest.fn()} onLog={jest.fn()} stop={coffinFlop} visible />);

  await fireEvent.press(screen.getByTestId('reach-star-4'));
  await fireEvent.press(screen.getByTestId('reach-to-reasons'));
  await fireEvent.changeText(screen.getByTestId('reach-reason-1'), 'a haunted vending machine');
  await fireEvent.press(screen.getByTestId('reach-stop-close'));

  expect(screen.getByTestId('reach-star-4')).not.toBeChecked();
  expect(screen.queryByTestId('reach-to-reasons')).toBeNull();
  expect(screen.queryByTestId('reach-reason-1')).toBeNull();
});
