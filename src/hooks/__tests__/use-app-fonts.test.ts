import { Michroma_400Regular } from '@expo-google-fonts/michroma';
import { SpaceMono_400Regular, SpaceMono_700Bold } from '@expo-google-fonts/space-mono';
import { VT323_400Regular } from '@expo-google-fonts/vt323';
import { renderHook } from '@testing-library/react-native';

import { useAppFonts } from '@/hooks/use-app-fonts';

const mockUseFonts = jest.fn<[boolean, Error | null], [Record<string, unknown>]>();

jest.mock('expo-font', () => ({
  useFonts: (map: Record<string, unknown>) => mockUseFonts(map),
}));

beforeEach(() => {
  mockUseFonts.mockReset().mockReturnValue([false, null]);
});

test('loads the four ship-computer faces under the theme names', async () => {
  await renderHook(() => useAppFonts());

  expect(mockUseFonts).toHaveBeenCalledWith({
    Michroma_400Regular,
    SpaceMono_400Regular,
    SpaceMono_700Bold,
    VT323_400Regular,
  });
});

test('is not ready while the fonts load', async () => {
  const { result } = await renderHook(() => useAppFonts());

  expect(result.current).toBe(false);
});

test('is ready once the fonts load', async () => {
  mockUseFonts.mockReturnValue([true, null]);
  const { result } = await renderHook(() => useAppFonts());

  expect(result.current).toBe(true);
});

test('is ready even if the fonts fail, so the app falls back to system fonts', async () => {
  mockUseFonts.mockReturnValue([false, new Error('font failed')]);
  const { result } = await renderHook(() => useAppFonts());

  expect(result.current).toBe(true);
});
