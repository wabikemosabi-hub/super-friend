import { usernameProblem } from '@/lib/username';

const rule = 'Usernames are 3 to 24 letters, numbers or underscores';

test.each(['taffy_lee_fubbins', 'Jake', 'nomad_42', 'abc', 'a'.repeat(24)])('accepts %p', (username) => {
  expect(usernameProblem(username)).toBeNull();
});

test.each(['', 'e!', 'ab', 'a'.repeat(25), 'has space', 'dash-y', 'émile'])(
  'rejects %p with the rule',
  (username) => {
    expect(usernameProblem(username)).toBe(rule);
  },
);
