import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { MediaSearch } from '@/components/media-search';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import type { MediaItem } from '@/lib/media-search';

export default function DevMediaSearchRoute() {
  const [picked, setPicked] = useState<MediaItem | null>(null);

  return (
    <ThemedView style={styles.page}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.column}>
          <ThemedText type="subtitle">DEV: MEDIA SEARCH</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Temporary page for trying the search component. Delete once the Adventure Page uses it.
          </ThemedText>
          <MediaSearch type="movie" onPick={setPicked} />
          {picked && (
            <ThemedText testID="dev-media-search-picked">
              Picked: {picked.title}
              {picked.year ? ` (${picked.year})` : ''}
            </ThemedText>
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  content: {
    alignItems: 'center',
    padding: Spacing.four,
  },
  column: {
    gap: Spacing.four,
    maxWidth: MaxContentWidth,
    width: '100%',
  },
});
