import { fireEvent, render, screen } from '@testing-library/react-native';

import { BasecampScreen } from '@/components/basecamp-screen';

test('basecamp greets you by username', async () => {
  await render(<BasecampScreen username="taffy_lee_fubbins" onSignOut={jest.fn()} />);

  expect(screen.getByTestId('basecamp-greeting')).toHaveTextContent('Welcome to Basecamp, taffy_lee_fubbins');
});

test('basecamp lets you sign out', async () => {
  const onSignOut = jest.fn();
  await render(<BasecampScreen username="taffy_lee_fubbins" onSignOut={onSignOut} />);

  await fireEvent.press(screen.getByTestId('basecamp-sign-out'));

  expect(onSignOut).toHaveBeenCalledTimes(1);
});
