import type { PickedAvatar } from '@/lib/avatar';
import type { Profile } from '@/providers/session-provider';
import { finishSignUp } from '@/lib/sign-up';

const steps: string[] = [];
const mockUploadAvatar = jest.fn<Promise<string>, [string, PickedAvatar]>();
const mockCreateProfile = jest.fn<Promise<void>, [Profile]>();

jest.mock('@/lib/avatar', () => ({
  uploadAvatar: (userId: string, avatar: PickedAvatar) => {
    steps.push('upload');
    return mockUploadAvatar(userId, avatar);
  },
}));

jest.mock('@/lib/profile', () => ({
  createProfile: (profile: Profile) => {
    steps.push('profile');
    return mockCreateProfile(profile);
  },
}));

const taffyPhoto: PickedAvatar = { uri: 'blob:taffy', mimeType: 'image/png' };
const taffyPhotoUrl =
  'http://127.0.0.1:54321/storage/v1/object/public/avatars/taffy-id/avatar.png';

beforeEach(() => {
  steps.length = 0;
  mockUploadAvatar.mockReset().mockResolvedValue(taffyPhotoUrl);
  mockCreateProfile.mockReset().mockResolvedValue();
});

test('uploads the photo, then saves the profile pointing at it', async () => {
  await expect(finishSignUp('taffy-id', 'taffy-lee-fubbins', taffyPhoto)).resolves.toBeNull();

  expect(mockUploadAvatar).toHaveBeenCalledWith('taffy-id', taffyPhoto);
  expect(mockCreateProfile).toHaveBeenCalledWith({
    id: 'taffy-id',
    username: 'taffy-lee-fubbins',
    avatar_url: taffyPhotoUrl,
  });
  expect(steps).toEqual(['upload', 'profile']);
});

test('turns a failed profile save into a message', async () => {
  mockCreateProfile.mockRejectedValue(new Error('That username is taken'));

  await expect(finishSignUp('roy-id', 'taffy-lee-fubbins', taffyPhoto)).resolves.toBe(
    'That username is taken',
  );
});

test('does not save a profile when the photo upload fails', async () => {
  mockUploadAvatar.mockRejectedValue(new Error('The object exceeded the maximum allowed size'));

  await expect(finishSignUp('taffy-id', 'taffy-lee-fubbins', taffyPhoto)).resolves.toBe(
    'The object exceeded the maximum allowed size',
  );
  expect(mockCreateProfile).not.toHaveBeenCalled();
});
