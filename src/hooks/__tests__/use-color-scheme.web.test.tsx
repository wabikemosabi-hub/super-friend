import { renderHook } from '@testing-library/react-native';
import { renderToString } from 'react-dom/server';

import { useColorScheme } from '@/hooks/use-color-scheme.web';

jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({
  __esModule: true,
  default: () => 'dark',
}));

function Scheme() {
  return useColorScheme();
}

test('renders light on the server so the first client render matches', () => {
  expect(renderToString(<Scheme />)).toContain('light');
});

test('switches to the device scheme once mounted on the client', async () => {
  const { result } = await renderHook(() => useColorScheme());

  expect(result.current).toBe('dark');
});
