import { act, renderHook } from '@testing-library/react-native';

import { useDegauss } from '@/hooks/use-degauss';

jest.mock('expo-sqlite/localStorage/install', () => ({}));

const saved = new Map<string, string>();
const mockGetItem = jest.fn((key: string) => saved.get(key) ?? null);
const mockSetItem = jest.fn((key: string, value: string) => {
  saved.set(key, value);
});

beforeEach(() => {
  saved.clear();
  mockGetItem.mockClear();
  mockSetItem.mockClear();
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: { getItem: mockGetItem, setItem: mockSetItem },
  });
});

test('the scan line runs until someone degausses', async () => {
  const { result } = await renderHook(() => useDegauss());

  expect(result.current.scanning).toBe(true);
  expect(mockGetItem).toHaveBeenCalledWith('scan-line');
});

test('degaussing turns the scan line off and remembers it', async () => {
  const { result } = await renderHook(() => useDegauss());

  await act(() => result.current.degauss());

  expect(result.current.scanning).toBe(false);
  expect(mockSetItem).toHaveBeenCalledTimes(1);
  expect(mockSetItem).toHaveBeenCalledWith('scan-line', 'off');
});

test('degaussing again brings the scan line back', async () => {
  const { result } = await renderHook(() => useDegauss());

  await act(() => result.current.degauss());
  await act(() => result.current.degauss());

  expect(result.current.scanning).toBe(true);
  expect(mockSetItem).toHaveBeenLastCalledWith('scan-line', 'on');
});

test('a scan line turned off last visit stays off', async () => {
  saved.set('scan-line', 'off');

  const { result } = await renderHook(() => useDegauss());

  expect(result.current.scanning).toBe(false);
});

test('without storage the scan line still runs and still turns off', async () => {
  mockGetItem.mockImplementation(() => {
    throw new Error('storage blocked');
  });
  mockSetItem.mockImplementation(() => {
    throw new Error('storage blocked');
  });

  const { result } = await renderHook(() => useDegauss());
  expect(result.current.scanning).toBe(true);

  await act(() => result.current.degauss());
  expect(result.current.scanning).toBe(false);
});
