import { fireEvent, render, screen } from '@testing-library/react-native';

import { PickUsernameScreen } from '@/components/pick-username-screen';

test('explains the username rule before sending anything', async () => {
  const onSubmit = jest.fn();
  await render(<PickUsernameScreen onSubmit={onSubmit} onSignOut={jest.fn()} />);

  await fireEvent.changeText(screen.getByTestId('pick-username-input'), 'e!');
  await fireEvent.press(screen.getByTestId('pick-username-continue'));

  expect(screen.getByTestId('pick-username-error')).toHaveTextContent(
    'Usernames are 3 to 24 letters, numbers or underscores',
  );
  expect(onSubmit).not.toHaveBeenCalled();
});

test('lets you sign out', async () => {
  const onSignOut = jest.fn();
  await render(<PickUsernameScreen onSubmit={jest.fn()} onSignOut={onSignOut} />);

  await fireEvent.press(screen.getByTestId('pick-username-sign-out'));

  expect(onSignOut).toHaveBeenCalledTimes(1);
});
