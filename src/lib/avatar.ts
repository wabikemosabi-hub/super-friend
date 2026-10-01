import { launchImageLibraryAsync } from 'expo-image-picker';

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
