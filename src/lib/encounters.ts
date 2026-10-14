import { encounters, type Encounter, type Stars } from '@/constants/encounters';

export const STARS: Stars[] = [1, 2, 3, 4, 5];

export function encounterFor(stars: Stars, index: number): Encounter {
  const list = encounters[stars];
  return list[index % list.length];
}

export function randomEncounterIndex(stars: Stars, random: () => number = Math.random) {
  return Math.floor(random() * encounters[stars].length);
}
