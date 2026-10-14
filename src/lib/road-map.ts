import { MAX_PICKS, type Recommendation } from '@/lib/recommendations';

export type Spot = { x: number; y: number };

export type RoadStop = { pick: Recommendation; rank: number; spot: Spot };

export const youAreHere: Spot = { x: 34, y: 58 };

const stopSpots: Spot[] = [
  { x: 55, y: 18 },
  { x: 66, y: 70 },
  { x: 88, y: 46 },
];

export function roadStops(picks: Recommendation[]): RoadStop[] {
  return [...picks]
    .sort((a, b) => a.rank - b.rank)
    .slice(0, MAX_PICKS)
    .map((pick, i) => ({ pick, rank: pick.rank, spot: stopSpots[i] }));
}

export function dottedLine(from: Spot, to: Spot, width: number, height: number) {
  const startX = (from.x * width) / 100;
  const startY = (from.y * height) / 100;
  const dx = (to.x * width) / 100 - startX;
  const dy = (to.y * height) / 100 - startY;
  const length = Math.hypot(dx, dy);

  return {
    left: startX + dx / 2 - length / 2,
    top: startY + dy / 2,
    length,
    angle: (Math.atan2(dy, dx) * 180) / Math.PI,
  };
}

const lineWeights = [
  { width: 3, opacity: 1 },
  { width: 2.5, opacity: 0.8 },
  { width: 2, opacity: 0.65 },
];

export function lineWeight(rank: number) {
  return lineWeights[Math.min(rank, lineWeights.length) - 1];
}

export function slotsLine(open: number) {
  if (open === 0) return 'ROUTE FULL';
  if (open === 1) return '1 SLOT OPEN. MAKE IT COUNT.';
  return `${open} SLOTS OPEN. MAKE THEM COUNT.`;
}

export function toggleOpen(openId: string | null, id: string): string | null {
  return openId === id ? null : id;
}
