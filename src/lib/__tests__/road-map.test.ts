import type { Recommendation } from '@/lib/recommendations';
import { dottedLine, lineWeight, roadStops, routeCount, toggleOpen } from '@/lib/road-map';

jest.mock('@/lib/supabase', () => ({ supabase: {} }));

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

test('spreads the stops ahead across the map in rank order', () => {
  const stops = roadStops([stop('Hot Dog Car', 2), stop('Coffin Flop', 1), stop('Driving Crooner', 3)]);

  expect(stops.map((s) => [s.pick.title, s.rank, s.spot])).toEqual([
    ['Coffin Flop', 1, { x: 55, y: 18 }],
    ['Hot Dog Car', 2, { x: 66, y: 70 }],
    ['Driving Crooner', 3, { x: 88, y: 46 }],
  ]);
});

test('shows only as many stops as a route holds', () => {
  const stops = roadStops([1, 2, 3, 4].map((rank) => stop(`Pick ${rank}`, rank)));

  expect(stops.map((s) => s.rank)).toEqual([1, 2, 3]);
});

test("keeps the navigator's rank numbers when ranks leave gaps", () => {
  const stops = roadStops([stop('Coffin Flop', 1), stop('Driving Crooner', 3)]);

  expect(stops.map((s) => [s.rank, s.spot])).toEqual([
    [1, { x: 55, y: 18 }],
    [3, { x: 66, y: 70 }],
  ]);
});

test('has an empty road when nothing is plotted', () => {
  expect(roadStops([])).toEqual([]);
});

test('runs a dotted line from one spot to another across the map', () => {
  const line = dottedLine({ x: 0, y: 0 }, { x: 20, y: 20 }, 300, 400);

  expect(line.length).toBe(100);
  expect(line.angle).toBeCloseTo(53.1301, 4);
  expect(line.left).toBe(-20);
  expect(line.top).toBe(40);
});

test('runs a flat dotted line', () => {
  expect(dottedLine({ x: 10, y: 50 }, { x: 60, y: 50 }, 200, 100)).toEqual({ left: 20, top: 50, length: 100, angle: 0 });
});

test('runs a dotted line straight up', () => {
  expect(dottedLine({ x: 50, y: 90 }, { x: 50, y: 10 }, 100, 100)).toEqual({ left: 10, top: 50, length: 80, angle: -90 });
});

test('draws the line to stop 1 boldest', () => {
  expect([1, 2, 3].map(lineWeight)).toEqual([
    { width: 3, opacity: 1 },
    { width: 2.5, opacity: 0.8 },
    { width: 2, opacity: 0.65 },
  ]);
});

test('draws lines past stop 3 like stop 3', () => {
  expect(lineWeight(4)).toEqual({ width: 2, opacity: 0.65 });
});

test('counts the stops plotted on a route out of its size', () => {
  expect([0, 1, 2, 3].map((plotted) => routeCount(plotted, 3))).toEqual(['0/3', '1/3', '2/3', '3/3']);
});

test('opens one row at a time', () => {
  expect(toggleOpen(null, 'coffin-flop')).toBe('coffin-flop');
  expect(toggleOpen('coffin-flop', 'hot-dog-car')).toBe('hot-dog-car');
});

test('closes the open row when it is tapped again', () => {
  expect(toggleOpen('coffin-flop', 'coffin-flop')).toBeNull();
});
