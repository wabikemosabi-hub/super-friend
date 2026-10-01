import { uploadAvatar, type PickedAvatar } from '@/lib/avatar';
import { createProfile } from '@/lib/profile';

export async function finishSignUp(
  userId: string,
  username: string,
  avatar: PickedAvatar,
): Promise<string | null> {
  try {
    const avatarUrl = await uploadAvatar(userId, avatar);
    await createProfile({ id: userId, username, avatar_url: avatarUrl });
    return null;
  } catch (error) {
    return error instanceof Error ? error.message : 'Something went wrong. Try again?';
  }
}
