// Checks that jest-expo and React Native Testing Library are wired up.
// Delete once real component tests exist.
import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

test('renders a React Native component', async () => {
  await render(<Text>Media Advisory Board</Text>);

  expect(screen.getByText('Media Advisory Board')).toBeOnTheScreen();
});
