import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Typefaces } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { encounterColor, encounterFor, starsLine } from '@/lib/encounters';
import { fillTemplate, logDate, type JournalEntry } from '@/lib/nomad-log';

export type LogEntryProps = JournalEntry;

export function LogEntry({ stars, encounter, title, navigator, promised, found, date }: LogEntryProps) {
  const theme = useTheme();
  const { title: heading, story } = encounterFor(stars, encounter);
  const pieces = fillTemplate(story, { date: logDate(date), navigator, title, promised, found });

  return (
    <View style={[styles.entry, { backgroundColor: theme.backgroundElement, borderColor: theme.bezel }]} testID="log-entry">
      <ThemedText style={[styles.stars, { color: theme.hazard }]} testID="log-entry-stars">
        {starsLine(stars)}
      </ThemedText>
      <ThemedText style={[styles.title, { color: theme[encounterColor(stars)] }]} testID="log-entry-title">
        {heading.toUpperCase()}
      </ThemedText>
      <ThemedText style={[styles.story, { color: theme.text }]} testID="log-entry-story">
        {pieces.map((piece, i) =>
          piece.kind === 'text' ? (
            piece.text
          ) : (
            <ThemedText
              key={i}
              style={[styles.redacted, { backgroundColor: theme.screen, color: theme.textSecondary }]}
              testID="log-entry-redacted">
              {' REDACTED '}
            </ThemedText>
          ),
        )}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  entry: {
    borderRadius: 4,
    borderWidth: 2,
    gap: 4,
    padding: 16,
  },
  stars: {
    fontFamily: Typefaces.screen,
    fontSize: 22,
    lineHeight: 24,
  },
  title: {
    fontFamily: Typefaces.screen,
    fontSize: 30,
    lineHeight: 32,
  },
  story: {
    fontFamily: Typefaces.screen,
    fontSize: 21,
    lineHeight: 26,
    marginTop: 8,
  },
  redacted: {
    fontFamily: Typefaces.labelBold,
    fontSize: 12,
    letterSpacing: 2,
  },
});
