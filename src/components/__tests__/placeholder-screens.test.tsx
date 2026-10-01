import { fireEvent, render, screen } from '@testing-library/react-native';

import { BasecampScreen } from '@/components/basecamp-screen';
import { PickUsernameScreen } from '@/components/pick-username-screen';

test('pick username lets you sign out', async () => {
  const onSignOut = jest.fn();
  await render(<PickUsernameScreen onSignOut={onSignOut} />);

  await fireEvent.press(screen.getByTestId('pick-username-sign-out'));

  expect(onSignOut).toHaveBeenCalledTimes(1);
});

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
