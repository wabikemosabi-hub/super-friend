import { render, screen } from '@testing-library/react-native';

import { TmdbAttribution } from '@/components/tmdb-attribution';

test('shows the notice TMDB requires', async () => {
  await render(<TmdbAttribution />);

  expect(
    screen.getByText('This product uses the TMDB API but is not endorsed or certified by TMDB.'),
  ).toBeOnTheScreen();
});
