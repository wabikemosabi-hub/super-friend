import { encounters } from '@/constants/encounters';
import { encounterColor, encounterFor, randomEncounterIndex, STARS, starsLine } from '@/lib/encounters';

test('finds the encounter for a star rating and its number', () => {
  expect(encounterFor(1, 0).title).toBe('Mutant Latrine Found');
  expect(encounterFor(2, 1).title).toBe('Battle of the Bands');
  expect(encounterFor(3, 2).title).toBe('Found a new album!');
});

test('wraps around when the number is past the end of the list', () => {
  const count = encounters[1].length;

  expect(encounterFor(1, count)).toBe(encounterFor(1, 0));
  expect(encounterFor(1, count + 1)).toBe(encounterFor(1, 1));
});

test('every star level has at least one encounter with a title and a story', () => {
  for (const stars of STARS) {
    expect(encounters[stars].length).toBeGreaterThan(0);

    for (const encounter of encounters[stars]) {
      expect(encounter.title.trim()).not.toBe('');
      expect(encounter.story).toContain('{found1}');
    }
  }
});

test('picks a random encounter number from the ones that exist for those stars', () => {
  const count = encounters[2].length;

  expect(randomEncounterIndex(2, () => 0)).toBe(0);
  expect(randomEncounterIndex(2, () => 0.999)).toBe(count - 1);
});

test('draws the stars as filled and empty', () => {
  expect(starsLine(1)).toBe('★☆☆☆☆');
  expect(starsLine(3)).toBe('★★★☆☆');
  expect(starsLine(5)).toBe('★★★★★');
});

test('colors each star level like the field guide', () => {
  expect(STARS.map(encounterColor)).toEqual(['alert', 'hazard', 'text', 'phosphorDim', 'phosphor']);
});

test('every star level has at least three real encounters', () => {
  for (const stars of STARS) {
    expect(encounters[stars].length).toBeGreaterThanOrEqual(3);
    expect(encounters[stars].map((encounter) => encounter.title).join(' ')).not.toContain('PLACEHOLDER');
  }
});
