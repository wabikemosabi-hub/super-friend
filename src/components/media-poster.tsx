import { Image, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Typefaces } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Json } from '@/lib/database.types';
import { posterPath, tmdbImage } from '@/lib/media-search';

export function MediaPoster({ item }: { item: { title: string; metadata: Json } }) {
  const theme = useTheme();
  const uri = tmdbImage(posterPath(item), 'w92');

  if (uri) {
    return <Image source={{ uri }} style={[styles.poster, { borderColor: theme.edge }]} />;
  }

  return (
    <View style={[styles.poster, styles.tape, { backgroundColor: theme.backgroundSelected, borderColor: theme.edge }]}>
      <View style={[styles.stripe, { backgroundColor: theme.hazard }]} />
      <ThemedText style={styles.initial}>{item.title.charAt(0)}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  poster: {
    borderRadius: 2,
    borderWidth: 2,
    height: 69,
    width: 46,
  },
  tape: {
    alignItems: 'center',
    overflow: 'hidden',
  },
  stripe: {
    alignSelf: 'stretch',
    height: 12,
  },
  initial: {
    fontFamily: Typefaces.display,
    fontSize: 18,
    lineHeight: 50,
  },
});
