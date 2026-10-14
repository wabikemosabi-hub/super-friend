import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { MediaPoster } from '@/components/media-poster';
import { ThemedText } from '@/components/themed-text';
import { TmdbAttribution } from '@/components/tmdb-attribution';
import { Spacing, Typefaces } from '@/constants/theme';
import { useMediaSearch } from '@/hooks/use-media-search';
import { useTheme } from '@/hooks/use-theme';
import { type MediaItem, type MediaType } from '@/lib/media-search';

const plural: Record<MediaType, string> = { movie: 'movies', series: 'series', book: 'books' };
const singular: Record<MediaType, string> = { movie: 'Movie', series: 'Series', book: 'Book' };

export type Unavailable = { note: string; testID: string };

type MediaSearchProps = {
  type: MediaType;
  onPick: (item: MediaItem) => void;
  unavailable?: (item: MediaItem) => Unavailable | null;
};

export function MediaSearch({ type, onPick, unavailable }: MediaSearchProps) {
  const theme = useTheme();
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const { results, isSearching, error, noMatches } = useMediaSearch(type, query);

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.screen,
          { backgroundColor: theme.screen, borderColor: focused ? theme.phosphorDim : theme.edge },
        ]}>
        <TextInput
          accessibilityLabel={`Search ${plural[type]}`}
          autoCapitalize="none"
          autoCorrect={false}
          onBlur={() => setFocused(false)}
          onChangeText={setQuery}
          onFocus={() => setFocused(true)}
          placeholder={`SEARCH ${plural[type].toUpperCase()}`}
          placeholderTextColor={theme.phosphorDim}
          style={[styles.input, { color: theme.phosphor }]}
          testID="media-search-input"
          value={query}
        />
      </View>

      {isSearching && (
        <ThemedText style={[styles.status, { color: theme.phosphor }]} testID="media-search-status">
          SCANNING…
        </ThemedText>
      )}
      {error && (
        <ThemedText style={[styles.status, { color: theme.alert }]} testID="media-search-error">
          {error}
        </ThemedText>
      )}
      {noMatches && (
        <ThemedText style={[styles.status, { color: theme.phosphor }]} testID="media-search-no-matches">
          NO SIGNAL. Nothing matches “{query.trim()}”.
        </ThemedText>
      )}

      <View style={styles.results}>
        {results.map((item) => {
          const blocked = unavailable?.(item) ?? null;
          return (
            <Pressable
              accessibilityLabel={item.year ? `${item.title}, ${item.year}` : item.title}
              accessibilityRole="button"
              accessibilityState={{ disabled: blocked !== null }}
              disabled={blocked !== null}
              key={item.id}
              onPress={() => onPick(item)}
              style={({ pressed }) => [
                styles.row,
                {
                  backgroundColor: pressed ? theme.backgroundSelected : theme.backgroundElement,
                  borderColor: theme.edge,
                  opacity: blocked ? 0.45 : 1,
                },
              ]}
              testID={`media-search-result-${item.external_id}`}>
              <MediaPoster item={item} />
              <View style={styles.details}>
                <ThemedText style={styles.title}>{item.title}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {item.year ? `${item.year} · ${singular[type]}` : singular[type]}
                </ThemedText>
                {blocked && (
                  <ThemedText style={[styles.note, { color: theme.textSecondary }]} testID={blocked.testID}>
                    {blocked.note}
                  </ThemedText>
                )}
              </View>
            </Pressable>
          );
        })}
      </View>

      <TmdbAttribution />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
  screen: {
    borderRadius: 4,
    borderWidth: 2,
    paddingHorizontal: Spacing.three,
  },
  input: {
    fontFamily: Typefaces.screen,
    fontSize: 26,
    minHeight: 52,
    outlineStyle: 'solid',
    outlineWidth: 0,
  },
  status: {
    fontFamily: Typefaces.screen,
    fontSize: 22,
    lineHeight: 26,
  },
  results: {
    gap: Spacing.two,
  },
  row: {
    alignItems: 'center',
    borderRadius: 4,
    borderWidth: 2,
    flexDirection: 'row',
    gap: Spacing.three,
    padding: Spacing.two,
  },
  details: {
    flex: 1,
    gap: Spacing.one,
  },
  title: {
    fontFamily: Typefaces.display,
    fontSize: 14,
    lineHeight: 20,
  },
  note: {
    fontFamily: Typefaces.screen,
    fontSize: 18,
    lineHeight: 20,
  },
});
