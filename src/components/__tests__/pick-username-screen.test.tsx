import { act, fireEvent, render, screen } from '@testing-library/react-native';

import { PickUsernameScreen } from '@/components/pick-username-screen';

function nameIsFree() {
  return jest.fn<Promise<boolean>, [string]>().mockResolvedValue(true);
}

afterEach(() => {
  jest.useRealTimers();
});

test('explains the username rule before sending anything', async () => {
  const onSubmit = jest.fn();
  await render(<PickUsernameScreen checkUsername={nameIsFree()} onSubmit={onSubmit} onSignOut={jest.fn()} />);

  await fireEvent.changeText(screen.getByTestId('pick-username-input'), 'e!');
  await fireEvent.press(screen.getByTestId('pick-username-continue'));

  expect(screen.getByTestId('pick-username-error')).toHaveTextContent(
    'Usernames are 3 to 24 letters or numbers, with single dashes between words',
  );
  expect(onSubmit).not.toHaveBeenCalled();
});

test('turns spaces and underscores into dashes as you type', async () => {
  await render(<PickUsernameScreen checkUsername={nameIsFree()} onSubmit={jest.fn()} onSignOut={jest.fn()} />);

  await fireEvent.changeText(screen.getByTestId('pick-username-input'), 'taffy lee_fubbins');

  expect(screen.getByTestId('pick-username-input')).toHaveDisplayValue('taffy-lee-fubbins');
});

test('lets you sign out', async () => {
  const onSignOut = jest.fn();
  await render(<PickUsernameScreen checkUsername={nameIsFree()} onSubmit={jest.fn()} onSignOut={onSignOut} />);

  await fireEvent.press(screen.getByTestId('pick-username-sign-out'));

  expect(onSignOut).toHaveBeenCalledTimes(1);
});

test('says a name is taken shortly after you stop typing', async () => {
  jest.useFakeTimers();
  const checkUsername = jest.fn<Promise<boolean>, [string]>().mockResolvedValue(false);
  await render(
    <PickUsernameScreen checkUsername={checkUsername} onSubmit={jest.fn()} onSignOut={jest.fn()} />,
  );

  await fireEvent.changeText(screen.getByTestId('pick-username-input'), 'Roy-Donk');
  expect(checkUsername).not.toHaveBeenCalled();

  await act(async () => {
    await jest.advanceTimersByTimeAsync(500);
  });

  expect(checkUsername).toHaveBeenCalledWith('Roy-Donk');
  expect(screen.getByTestId('pick-username-availability')).toHaveTextContent('Roy-Donk is taken');
});

test('clears the taken message as soon as you change the name', async () => {
  jest.useFakeTimers();
  const checkUsername = jest.fn<Promise<boolean>, [string]>().mockResolvedValue(false);
  await render(
    <PickUsernameScreen checkUsername={checkUsername} onSubmit={jest.fn()} onSignOut={jest.fn()} />,
  );
  await fireEvent.changeText(screen.getByTestId('pick-username-input'), 'Roy-Donk');
  await act(async () => {
    await jest.advanceTimersByTimeAsync(500);
  });
  expect(screen.getByTestId('pick-username-availability')).toHaveTextContent('Roy-Donk is taken');

  await fireEvent.changeText(screen.getByTestId('pick-username-input'), 'Roy-Donks');

  expect(screen.queryByTestId('pick-username-availability')).toBeNull();
});

test('says a name is available shortly after you stop typing', async () => {
  jest.useFakeTimers();
  await render(
    <PickUsernameScreen checkUsername={nameIsFree()} onSubmit={jest.fn()} onSignOut={jest.fn()} />,
  );

  await fireEvent.changeText(screen.getByTestId('pick-username-input'), 'taffy-lee-fubbins');
  await act(async () => {
    await jest.advanceTimersByTimeAsync(500);
  });

  expect(screen.getByTestId('pick-username-availability')).toHaveTextContent(
    'taffy-lee-fubbins is available',
  );
});
