import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ActionButton } from '@/components/action-button';
import { MediaSearchModal } from '@/components/media-search-modal';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import type { MediaItem } from '@/lib/media-search';

export default function DevMediaSearchRoute() {
  const [searching, setSearching] = useState(false);
  const [picked, setPicked] = useState<MediaItem | null>(null);

  return (
    <ThemedView style={styles.page}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.column}>
          <ThemedText type="subtitle">DEV: MEDIA SEARCH</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Temporary page for trying the search modal. Delete once the Adventure Page uses it.
          </ThemedText>
          <ActionButton
            label="Search movies"
            onPress={() => setSearching(true)}
            testID="dev-media-search-open"
          />
          {picked && (
            <ThemedText testID="dev-media-search-picked">
              Picked: {picked.title}
              {picked.year ? ` (${picked.year})` : ''}
            </ThemedText>
          )}
        </View>
      </ScrollView>
      <MediaSearchModal
        visible={searching}
        type="movie"
        onPick={setPicked}
        onClose={() => setSearching(false)}
      />
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
    alignItems: 'flex-start',
    gap: Spacing.four,
    maxWidth: MaxContentWidth,
    width: '100%',
  },
});
