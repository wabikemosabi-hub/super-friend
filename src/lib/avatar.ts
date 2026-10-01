import { launchImageLibraryAsync } from 'expo-image-picker';

import { supabase } from '@/lib/supabase';

export type PickedAvatar = {
  uri: string;
  mimeType: string;
};

export async function pickAvatar(): Promise<PickedAvatar | null> {
  const result = await launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });
  if (result.canceled) return null;
  const [photo] = result.assets;
  return { uri: photo.uri, mimeType: photo.mimeType ?? 'image/jpeg' };
}

export async function uploadAvatar(userId: string, avatar: PickedAvatar): Promise<string> {
  const photo = await fetch(avatar.uri);
  const path = `${userId}/avatar.${avatar.mimeType.split('/')[1]}`;
  const bucket = supabase.storage.from('avatars');
  const { error } = await bucket.upload(path, await photo.arrayBuffer(), {
    contentType: avatar.mimeType,
    upsert: true,
  });
  if (error) throw error;
  return bucket.getPublicUrl(path).data.publicUrl;
}
