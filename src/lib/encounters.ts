import { encounters, type Encounter, type Stars } from '@/constants/encounters';
import type { ThemeColor } from '@/constants/theme';

export const STARS: Stars[] = [1, 2, 3, 4, 5];

export function encounterFor(stars: Stars, index: number): Encounter {
  const list = encounters[stars];
  return list[index % list.length];
}

export function randomEncounterIndex(stars: Stars, random: () => number = Math.random) {
  return Math.floor(random() * encounters[stars].length);
}

const starColors: Record<Stars, ThemeColor> = {
  1: 'alert',
  2: 'hazard',
  3: 'text',
  4: 'phosphorDim',
  5: 'phosphor',
};

export function starsLine(stars: Stars) {
  return '★'.repeat(stars) + '☆'.repeat(5 - stars);
}

export function encounterColor(stars: Stars) {
  return starColors[stars];
}
