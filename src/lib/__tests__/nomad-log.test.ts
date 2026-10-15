import { encounters } from '@/constants/encounters';
import { fillTemplate, logDate, type LogFill } from '@/lib/nomad-log';

const fill: LogFill = {
  date: 'October 15, 2026',
  navigator: 'taffy-lee-fubbins',
  title: 'Coffin Flop',
  promised: ['Bones', 'Coffins', 'A dance'],
  found: ['The dog', 'Damp socks', 'A goat'],
};

test('fills every slot with the rating', () => {
  const story = '{date}\n{navigator} sent me to {title}. Promised {promised1}, {promised2}, {promised3}. Found {found1}, {found2}, {found3}.';

  expect(fillTemplate(story, fill)).toEqual([
    {
      kind: 'text',
      text: 'October 15, 2026\ntaffy-lee-fubbins sent me to Coffin Flop. Promised Bones, Coffins, A dance. Found The dog, Damp socks, A goat.',
    },
  ]);
});

test('missing reasons come out redacted', () => {
  const story = 'Promised {promised1} and {promised2}. Found {found1}, {found2} and {found3}.';

  expect(fillTemplate(story, { ...fill, promised: ['Bones'], found: ['The dog'] })).toEqual([
    { kind: 'text', text: 'Promised Bones and ' },
    { kind: 'redacted' },
    { kind: 'text', text: '. Found The dog, ' },
    { kind: 'redacted' },
    { kind: 'text', text: ' and ' },
    { kind: 'redacted' },
    { kind: 'text', text: '.' },
  ]);
});

test('a navigator who is gone is redacted too', () => {
  expect(fillTemplate('{navigator} pointed the way.', { ...fill, navigator: null })).toEqual([
    { kind: 'redacted' },
    { kind: 'text', text: ' pointed the way.' },
  ]);
});

test('the same slot can show up more than once', () => {
  expect(fillTemplate('{found1}! {found1}!', fill)).toEqual([{ kind: 'text', text: 'The dog! The dog!' }]);
});

test('leaves anything that is not a slot alone', () => {
  expect(fillTemplate('A {mystery} and {found4}.', fill)).toEqual([{ kind: 'text', text: 'A {mystery} and {found4}.' }]);
});

test('every encounter story fills in without leftover slots', () => {
  for (const list of Object.values(encounters)) {
    for (const encounter of list) {
      const text = fillTemplate(encounter.story, fill)
        .map((piece) => (piece.kind === 'text' ? piece.text : ''))
        .join('');
      expect(text).not.toMatch(/\{\w+\}/);
    }
  }
});

test('writes the date out like a journal', () => {
  expect(logDate(new Date(2026, 9, 15, 23, 30))).toBe('October 15, 2026');
  expect(logDate(new Date(2027, 0, 1, 0, 5))).toBe('January 1, 2027');
});
