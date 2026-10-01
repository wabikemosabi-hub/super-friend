import { fireEvent, render, screen } from '@testing-library/react-native';

import { SignInScreen } from '@/components/sign-in-screen';

test('continuing with Google starts Google sign-in', async () => {
  const onContinueWithGoogle = jest.fn();
  await render(<SignInScreen onContinueWithGoogle={onContinueWithGoogle} />);

  await fireEvent.press(screen.getByTestId('sign-in-google'));

  expect(onContinueWithGoogle).toHaveBeenCalledTimes(1);
});

test('says what the button does', async () => {
  await render(<SignInScreen onContinueWithGoogle={jest.fn()} />);

  expect(screen.getByTestId('sign-in-google')).toHaveTextContent('Continue with Google');
});
