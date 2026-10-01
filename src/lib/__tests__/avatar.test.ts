import { StorageApiError } from '@supabase/supabase-js';
import type {
  ImagePickerAsset,
  ImagePickerOptions,
  ImagePickerResult,
} from 'expo-image-picker';

import { pickAvatar, uploadAvatar } from '@/lib/avatar';

const mockLaunch = jest.fn<Promise<ImagePickerResult>, [ImagePickerOptions]>();

jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: (options: ImagePickerOptions) => mockLaunch(options),
}));

type UploadOptions = { contentType: string; upsert: boolean };
type UploadResult = { data: { path: string } | null; error: Error | null };

const mockBucket = jest.fn<void, [string]>();
const mockUpload = jest.fn<Promise<UploadResult>, [string, ArrayBuffer, UploadOptions]>();
const mockPublicUrl = jest.fn<{ data: { publicUrl: string } }, [string]>();

jest.mock('@/lib/supabase', () => ({
  supabase: {
    storage: {
      from: (bucket: string) => {
        mockBucket(bucket);
        return {
          upload: (path: string, body: ArrayBuffer, options: UploadOptions) =>
            mockUpload(path, body, options),
          getPublicUrl: (path: string) => mockPublicUrl(path),
        };
      },
    },
  },
}));

const photoBytes = new Uint8Array([137, 80, 78, 71]).buffer;

function photo(asset: Partial<ImagePickerAsset>): ImagePickerAsset {
  return { uri: 'file:///taffy.png', width: 512, height: 512, ...asset };
}

beforeEach(() => {
  mockLaunch.mockReset();
  mockBucket.mockReset();
  mockUpload.mockReset().mockResolvedValue({ data: { path: 'taffy-id/avatar.png' }, error: null });
  mockPublicUrl.mockReset().mockImplementation((path) => ({
    data: { publicUrl: `http://127.0.0.1:54321/storage/v1/object/public/avatars/${path}` },
  }));
  jest.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(photoBytes));
});

afterEach(() => {
  jest.restoreAllMocks();
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

test('uploads the photo into your own folder and hands back its address', async () => {
  const url = await uploadAvatar('taffy-id', { uri: 'blob:taffy', mimeType: 'image/png' });

  expect(globalThis.fetch).toHaveBeenCalledWith('blob:taffy');
  expect(mockBucket).toHaveBeenCalledWith('avatars');
  expect(mockUpload).toHaveBeenCalledTimes(1);
  const [path, body, options] = mockUpload.mock.calls[0];
  expect(path).toBe('taffy-id/avatar.png');
  expect(new Uint8Array(body)).toEqual(new Uint8Array(photoBytes));
  expect(options).toEqual({ contentType: 'image/png', upsert: true });
  expect(url).toBe('http://127.0.0.1:54321/storage/v1/object/public/avatars/taffy-id/avatar.png');
});

test('passes along a refused upload', async () => {
  mockUpload.mockResolvedValue({
    data: null,
    error: new StorageApiError('The object exceeded the maximum allowed size', 413, '413'),
  });

  await expect(
    uploadAvatar('taffy-id', { uri: 'blob:taffy', mimeType: 'image/png' }),
  ).rejects.toThrow('The object exceeded the maximum allowed size');
});
