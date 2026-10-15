import { render, screen } from '@testing-library/react-native';

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
      testID="nomad-log"
      title="Nomad's log"
    />,
  );

  expect(screen.getByText("NOMAD'S LOG")).toBeTruthy();
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
