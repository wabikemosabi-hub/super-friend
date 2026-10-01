import { usernameProblem } from '@/lib/username';

const rule = 'Usernames are 3 to 24 letters or numbers, with single dashes between words';

test.each(['taffy-lee-fubbins', 'roy-donk', 'Roy', 'nomad42', 'abc', 'a'.repeat(24)])(
  'accepts %p',
  (username) => {
    expect(usernameProblem(username)).toBeNull();
  },
);

test.each([
  '',
  'e!',
  'ab',
  'a'.repeat(25),
  'has space',
  'taffy_lee',
  '-roy',
  'roy-',
  'roy--donk',
  'émile',
])('rejects %p with the rule', (username) => {
  expect(usernameProblem(username)).toBe(rule);
});
