import { fireEvent, render, screen } from '@testing-library/react-native';

import { LogEntry, type LogEntryProps } from '@/components/log-entry';

const latrine: LogEntryProps = {
  stars: 1,
  encounter: 0,
  title: 'Coffin Flop',
  navigator: 'taffy-lee-fubbins',
  promised: ['Bones', 'Coffins', 'A dance'],
  found: ['The dog', 'Damp socks', 'A goat'],
  date: new Date(2026, 9, 15, 21, 0),
};

test('shows the stars and the encounter title', async () => {
  await render(<LogEntry {...latrine} />);

  expect(screen.getByTestId('log-entry-stars')).toHaveTextContent('★☆☆☆☆');
  expect(screen.getByTestId('log-entry-title')).toHaveTextContent('MUTANT LATRINE FOUND');
});

test('tells the story with the date, navigator, title and reasons filled in', async () => {
  await render(<LogEntry {...latrine} />);

  const story = screen.getByTestId('log-entry-story');
  expect(story).toHaveTextContent(/^October 15, 2026/);
  expect(story).toHaveTextContent(/taffy-lee-fubbins pointed me towards a stop in the wasteland known as Coffin Flop\./);
  expect(story).toHaveTextContent(/Instead of the Bones that I was promised I found The dog!/);
  expect(screen.queryAllByTestId('log-entry-redacted')).toHaveLength(0);
});

test('stamps REDACTED over every missing reason', async () => {
  await render(<LogEntry {...latrine} found={['The dog']} promised={['Bones', 'Coffins']} />);

  const redacted = screen.getAllByTestId('log-entry-redacted');
  expect(redacted).toHaveLength(3);
  for (const bar of redacted) {
    expect(bar).toHaveTextContent('REDACTED');
  }
});

test('uses the encounter that was saved, even past the end of the list', async () => {
  await render(<LogEntry {...latrine} encounter={4} stars={2} />);

  expect(screen.getByTestId('log-entry-title')).toHaveTextContent('BATTLE OF THE BANDS');
});

test('starts on the story side', async () => {
  await render(<LogEntry {...latrine} />);

  expect(screen.getByTestId('log-entry-story')).toBeTruthy();
  expect(screen.queryByTestId('log-entry-back')).toBeNull();
  expect(screen.getByTestId('log-entry')).toBeCollapsed();
});

test('tapping flips it to a star card with a plain list of reasons', async () => {
  await render(<LogEntry {...latrine} found={['The dog', 'Damp socks']} />);

  await fireEvent.press(screen.getByTestId('log-entry'));

  expect(screen.queryByTestId('log-entry-story')).toBeNull();
  expect(screen.getByTestId('log-entry-back')).toBeTruthy();
  expect(screen.getByTestId('log-entry-stars')).toHaveTextContent('★☆☆☆☆');
  expect(screen.getByTestId('log-entry-title')).toHaveTextContent('MUTANT LATRINE FOUND');
  expect(screen.getByTestId('log-entry-media')).toHaveTextContent('COFFIN FLOP');
  expect(screen.getByTestId('log-entry-navigator')).toHaveTextContent('PLOTTED BY TAFFY-LEE-FUBBINS');
  expect(screen.getAllByTestId(/^log-entry-reason-/)).toHaveLength(2);
  expect(screen.getByTestId('log-entry-reason-1')).toHaveTextContent('The dog');
  expect(screen.getByTestId('log-entry-reason-2')).toHaveTextContent('Damp socks');
  expect(screen.queryAllByTestId('log-entry-redacted')).toHaveLength(0);
  expect(screen.getByTestId('log-entry')).toBeExpanded();
});

test('tapping again flips it back to the story', async () => {
  await render(<LogEntry {...latrine} />);

  await fireEvent.press(screen.getByTestId('log-entry'));
  await fireEvent.press(screen.getByTestId('log-entry'));

  expect(screen.getByTestId('log-entry-story')).toBeTruthy();
  expect(screen.queryByTestId('log-entry-back')).toBeNull();
});

test('a navigator who is gone is redacted on the star card too', async () => {
  await render(<LogEntry {...latrine} navigator={null} />);

  await fireEvent.press(screen.getByTestId('log-entry'));

  expect(screen.getByTestId('log-entry-navigator')).toHaveTextContent('PLOTTED BY REDACTED');
});
