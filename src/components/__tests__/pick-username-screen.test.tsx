import { act, fireEvent, render, screen } from '@testing-library/react-native';
import type { ComponentProps } from 'react';

import { PickUsernameScreen } from '@/components/pick-username-screen';
import type { PickedAvatar } from '@/lib/avatar';

function nameIsFree() {
  return jest.fn<Promise<boolean>, [string]>().mockResolvedValue(true);
}

function sendsFine() {
  return jest.fn<Promise<string | null>, [string]>().mockResolvedValue(null);
}

function picks(...avatars: (PickedAvatar | null)[]) {
  const pickAvatar = jest.fn<Promise<PickedAvatar | null>, []>();
  avatars.forEach((avatar) => pickAvatar.mockResolvedValueOnce(avatar));
  return pickAvatar;
}

const taffyPhoto: PickedAvatar = { uri: 'file:///taffy.jpg', mimeType: 'image/jpeg' };

function renderScreen(props: Partial<ComponentProps<typeof PickUsernameScreen>> = {}) {
  return render(
    <PickUsernameScreen
      checkUsername={nameIsFree()}
      onSubmit={sendsFine()}
      onSignOut={jest.fn()}
      pickAvatar={picks(null)}
      {...props}
    />,
  );
}

afterEach(() => {
  jest.useRealTimers();
});

test('explains the username rule before sending anything', async () => {
  const onSubmit = sendsFine();
  await renderScreen({ onSubmit });

  await fireEvent.changeText(screen.getByTestId('pick-username-input'), 'e!');
  await fireEvent.press(screen.getByTestId('pick-username-continue'));

  expect(screen.getByTestId('pick-username-error')).toHaveTextContent(
    'Usernames are 3 to 24 letters or numbers, with single dashes between words',
  );
  expect(onSubmit).not.toHaveBeenCalled();
});

test('turns spaces and underscores into dashes as you type', async () => {
  await renderScreen();

  await fireEvent.changeText(screen.getByTestId('pick-username-input'), 'taffy lee_fubbins');

  expect(screen.getByTestId('pick-username-input')).toHaveDisplayValue('taffy-lee-fubbins');
});

test('lets you sign out', async () => {
  const onSignOut = jest.fn();
  await renderScreen({ onSignOut });

  await fireEvent.press(screen.getByTestId('pick-username-sign-out'));

  expect(onSignOut).toHaveBeenCalledTimes(1);
});

test('says a name is taken shortly after you stop typing', async () => {
  jest.useFakeTimers();
  const checkUsername = jest.fn<Promise<boolean>, [string]>().mockResolvedValue(false);
  await renderScreen({ checkUsername });

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
  await renderScreen({ checkUsername });
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
  await renderScreen();

  await fireEvent.changeText(screen.getByTestId('pick-username-input'), 'taffy-lee-fubbins');
  await act(async () => {
    await jest.advanceTimersByTimeAsync(500);
  });

  expect(screen.getByTestId('pick-username-availability')).toHaveTextContent(
    'taffy-lee-fubbins is available',
  );
});

test('ignores a slow answer about a name you already changed', async () => {
  jest.useFakeTimers();
  let answerForRoy: (available: boolean) => void = () => {};
  const checkUsername = jest.fn<Promise<boolean>, [string]>((username) =>
    username === 'roy'
      ? new Promise((resolve) => {
          answerForRoy = resolve;
        })
      : Promise.resolve(false),
  );
  await renderScreen({ checkUsername });

  await fireEvent.changeText(screen.getByTestId('pick-username-input'), 'roy');
  await act(async () => {
    await jest.advanceTimersByTimeAsync(500);
  });
  await fireEvent.changeText(screen.getByTestId('pick-username-input'), 'roy-donk');
  await act(async () => {
    await jest.advanceTimersByTimeAsync(500);
  });
  await act(async () => {
    answerForRoy(true);
  });

  expect(screen.getByTestId('pick-username-availability')).toHaveTextContent('roy-donk is taken');
});

test('checks only the name you stop on, not every keystroke', async () => {
  jest.useFakeTimers();
  const checkUsername = nameIsFree();
  await renderScreen({ checkUsername });

  await fireEvent.changeText(screen.getByTestId('pick-username-input'), 'roy');
  await act(async () => {
    await jest.advanceTimersByTimeAsync(300);
  });
  await fireEvent.changeText(screen.getByTestId('pick-username-input'), 'roy-donk');
  await act(async () => {
    await jest.advanceTimersByTimeAsync(500);
  });

  expect(checkUsername).toHaveBeenCalledTimes(1);
  expect(checkUsername).toHaveBeenCalledWith('roy-donk');
});

test('sends the dashed name when you continue', async () => {
  const onSubmit = sendsFine();
  await renderScreen({ onSubmit });

  await fireEvent.changeText(screen.getByTestId('pick-username-input'), 'taffy lee fubbins');
  await fireEvent.press(screen.getByTestId('pick-username-continue'));

  expect(onSubmit).toHaveBeenCalledTimes(1);
  expect(onSubmit).toHaveBeenCalledWith('taffy-lee-fubbins');
  expect(screen.queryByTestId('pick-username-error')).toBeNull();
});

test('shows what went wrong when sending fails', async () => {
  const onSubmit = jest
    .fn<Promise<string | null>, [string]>()
    .mockResolvedValue('That username is taken');
  await renderScreen({ onSubmit });

  await fireEvent.changeText(screen.getByTestId('pick-username-input'), 'roy-donk');
  await fireEvent.press(screen.getByTestId('pick-username-continue'));

  expect(await screen.findByTestId('pick-username-error')).toHaveTextContent(
    'That username is taken',
  );
});

test('shows the photo you pick', async () => {
  const pickAvatar = picks(taffyPhoto);
  await renderScreen({ pickAvatar });

  await fireEvent.press(screen.getByTestId('pick-username-avatar-button'));

  expect(pickAvatar).toHaveBeenCalledTimes(1);
  expect(await screen.findByTestId('pick-username-avatar-preview')).toHaveProp('source', {
    uri: 'file:///taffy.jpg',
  });
});

test('keeps your photo if you cancel picking another', async () => {
  await renderScreen({ pickAvatar: picks(taffyPhoto, null) });

  await fireEvent.press(screen.getByTestId('pick-username-avatar-button'));
  await screen.findByTestId('pick-username-avatar-preview');
  await fireEvent.press(screen.getByTestId('pick-username-avatar-button'));

  expect(screen.getByTestId('pick-username-avatar-preview')).toHaveProp('source', {
    uri: 'file:///taffy.jpg',
  });
});
