import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { NomadLog } from '@/components/nomad-log';
import type { LogRow } from '@/lib/ratings';

jest.mock('@/lib/supabase', () => ({ supabase: {} }));

function row(overrides: Partial<LogRow>): LogRow {
  return {
    id: 'rating-1',
    mine: true,
    navigator: 'taffy-lee-fubbins',
    media_item_id: 'media-1',
    title: 'Coffin Flop',
    year: 2019,
    stars: 1,
    encounter: 0,
    reasons: ['The dog'],
    promised_reasons: ['Bones'],
    created_at: '2026-10-15T21:00:00+00:00',
    ...overrides,
  };
}

test('shows every entry as a journal entry, in order', async () => {
  await render(
    <NomadLog
      channel="LOG-01"
      empty="NO ENTRIES YET."
      rows={[row({ id: 'a', stars: 2, encounter: 1 }), row({ id: 'b', stars: 1, encounter: 0 })]}
      tape="Navigator: taffy-lee-fubbins"
      testID="nomad-log"
      title="Nomad's log"
    />,
  );

  expect(screen.getByText("LOG-01 · NOMAD'S LOG")).toBeTruthy();
  expect(screen.getByText('NAVIGATOR: TAFFY-LEE-FUBBINS')).toBeTruthy();
  const titles = screen.getAllByTestId('log-entry-title');
  expect(titles).toHaveLength(2);
  expect(titles[0]).toHaveTextContent('BATTLE OF THE BANDS');
  expect(titles[1]).toHaveTextContent('MUTANT LATRINE FOUND');
  expect(screen.queryByTestId('nomad-log-empty')).toBeNull();
});

test('says so when there are no entries yet', async () => {
  await render(<NomadLog channel="LOG-01" empty="NO ENTRIES YET." rows={[]} testID="nomad-log" title="Nomad's log" />);

  expect(screen.getByTestId('nomad-log-empty')).toHaveTextContent('NO ENTRIES YET.');
  expect(screen.queryAllByTestId('log-entry')).toHaveLength(0);
});

test('skips an entry with stars the app does not know', async () => {
  await render(
    <NomadLog
      channel="LOG-01"
      empty="NO ENTRIES YET."
      rows={[row({ id: 'a', stars: 9 }), row({ id: 'b' })]}
      testID="nomad-log"
      title="Nomad's log"
    />,
  );

  expect(screen.getAllByTestId('log-entry')).toHaveLength(1);
});

const seven = Array.from({ length: 7 }, (_, i) => row({ id: `entry-${i + 1}`, title: `Movie ${i + 1}` }));

function log() {
  return <NomadLog channel="LOG-01" empty="NO ENTRIES YET." rows={seven} testID="nomad-log" title="Nomad's log" />;
}

test('shows only the three most recent entries at first', async () => {
  await render(log());

  expect(screen.getAllByTestId('log-entry')).toHaveLength(3);
  expect(screen.getByTestId('nomad-log-count')).toHaveTextContent('3 OF 7');
  expect(screen.getByTestId('nomad-log-more')).toHaveTextContent('SHOW 3 MORE');
  expect(screen.queryByTestId('nomad-log-fold')).toBeNull();
});

test('each press unfolds three more, until there are none left', async () => {
  await render(log());

  await fireEvent.press(screen.getByTestId('nomad-log-more'));

  expect(screen.getAllByTestId('log-entry')).toHaveLength(6);
  expect(screen.getByTestId('nomad-log-count')).toHaveTextContent('6 OF 7');
  expect(screen.getByTestId('nomad-log-more')).toHaveTextContent('SHOW 1 MORE');

  await fireEvent.press(screen.getByTestId('nomad-log-more'));

  expect(screen.getAllByTestId('log-entry')).toHaveLength(7);
  expect(screen.getByTestId('nomad-log-count')).toHaveTextContent('7 OF 7');
  expect(screen.queryByTestId('nomad-log-more')).toBeNull();
});

test('folding up goes back to the three most recent', async () => {
  await render(log());

  await fireEvent.press(screen.getByTestId('nomad-log-more'));
  await fireEvent.press(screen.getByTestId('nomad-log-fold'));

  await waitFor(() => expect(screen.getAllByTestId('log-entry')).toHaveLength(3));
  expect(screen.queryByTestId('nomad-log-fold')).toBeNull();
  expect(screen.getByTestId('nomad-log-more')).toBeTruthy();
});

test('three entries or fewer need no keys', async () => {
  await render(
    <NomadLog channel="LOG-01" empty="NO ENTRIES YET." rows={seven.slice(0, 3)} testID="nomad-log" title="Nomad's log" />,
  );

  expect(screen.getAllByTestId('log-entry')).toHaveLength(3);
  expect(screen.queryByTestId('nomad-log-more')).toBeNull();
  expect(screen.queryByTestId('nomad-log-count')).toBeNull();
});
