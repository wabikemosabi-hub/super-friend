import { Image, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Typefaces } from '@/constants/theme';

type NomadAvatarProps = {
  username: string;
  avatarUrl: string | null;
  size: number;
  frameColor: string;
  initialColor: string;
  fillColor?: string;
  testID: string;
};

export function NomadAvatar({ username, avatarUrl, size, frameColor, initialColor, fillColor, testID }: NomadAvatarProps) {
  const frame = { width: size, height: size, borderColor: frameColor, backgroundColor: fillColor };

  if (avatarUrl) {
    return (
      <View style={[styles.frame, frame]} testID={testID}>
        <Image accessibilityIgnoresInvertColors source={{ uri: avatarUrl }} style={styles.image} />
      </View>
    );
  }

  return (
    <View style={[styles.frame, styles.initial, frame]} testID={testID}>
      <ThemedText style={[styles.initialText, { color: initialColor, fontSize: size * 0.7, lineHeight: size * 0.8 }]}>
        {username.charAt(0).toUpperCase()}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    borderRadius: 3,
    borderWidth: 2,
    overflow: 'hidden',
  },
  image: {
    height: '100%',
    width: '100%',
  },
  initial: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialText: {
    fontFamily: Typefaces.screen,
  },
});
