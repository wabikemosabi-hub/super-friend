import type {
  ImagePickerAsset,
  ImagePickerOptions,
  ImagePickerResult,
} from 'expo-image-picker';

import { pickAvatar } from '@/lib/avatar';

const mockLaunch = jest.fn<Promise<ImagePickerResult>, [ImagePickerOptions]>();

jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: (options: ImagePickerOptions) => mockLaunch(options),
}));

function photo(asset: Partial<ImagePickerAsset>): ImagePickerAsset {
  return { uri: 'file:///taffy.png', width: 512, height: 512, ...asset };
}

beforeEach(() => {
  mockLaunch.mockReset();
});

test('opens the library for one square image and hands back the photo', async () => {
  mockLaunch.mockResolvedValue({
    canceled: false,
    assets: [photo({ uri: 'file:///taffy.png', mimeType: 'image/png' })],
  });

  await expect(pickAvatar()).resolves.toEqual({ uri: 'file:///taffy.png', mimeType: 'image/png' });
  expect(mockLaunch).toHaveBeenCalledTimes(1);
  expect(mockLaunch).toHaveBeenCalledWith({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });
});

test('gives nothing back when you cancel', async () => {
  mockLaunch.mockResolvedValue({ canceled: true, assets: null });

  await expect(pickAvatar()).resolves.toBeNull();
});

test('treats a photo with no type as a jpeg', async () => {
  mockLaunch.mockResolvedValue({ canceled: false, assets: [photo({ uri: 'file:///roy' })] });

  await expect(pickAvatar()).resolves.toEqual({ uri: 'file:///roy', mimeType: 'image/jpeg' });
});
