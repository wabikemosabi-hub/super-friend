import { useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Platform, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Typefaces } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { encounterColor, encounterFor, starsLine } from '@/lib/encounters';
import { fillTemplate, logDate, type JournalEntry } from '@/lib/nomad-log';

export type LogEntryProps = JournalEntry;

const useNativeDriver = Platform.OS !== 'web';

export function LogEntry({ stars, encounter, title, navigator, promised, found, date }: LogEntryProps) {
  const theme = useTheme();
  const { title: heading, story } = encounterFor(stars, encounter);
  const pieces = fillTemplate(story, { date: logDate(date), navigator, title, promised, found });
  const [flipped, setFlipped] = useState(false);
  const [turn] = useState(() => new Animated.Value(1));
  const [stillMotion, setStillMotion] = useState(false);

  useEffect(() => {
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
      if (!cancelled) setStillMotion(reduced);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  function flip() {
    setFlipped(!flipped);
    if (stillMotion) return;
    turn.setValue(0);
    Animated.timing(turn, { toValue: 1, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver }).start();
  }

  return (
    <Animated.View style={{ transform: [{ scaleX: turn }] }}>
      <Pressable
        accessibilityHint="Flips the entry over"
        accessibilityRole="button"
        accessibilityState={{ expanded: flipped }}
        onPress={flip}
        style={({ pressed }) => [
          styles.entry,
          { backgroundColor: pressed ? theme.backgroundSelected : theme.backgroundElement, borderColor: theme.bezel },
        ]}
        testID="log-entry">
        <ThemedText style={[flipped ? styles.bigStars : styles.stars, { color: theme.hazard }]} testID="log-entry-stars">
          {starsLine(stars)}
        </ThemedText>
        <ThemedText style={[styles.title, { color: theme[encounterColor(stars)] }]} testID="log-entry-title">
          {heading.toUpperCase()}
        </ThemedText>
        {flipped ? (
          <View style={styles.back} testID="log-entry-back">
            <ThemedText style={[styles.media, { color: theme.text }]} testID="log-entry-media">
              {title.toUpperCase()}
            </ThemedText>
            <ThemedText style={[styles.label, { color: theme.textSecondary }]} testID="log-entry-navigator">
              PLOTTED BY {(navigator ?? 'REDACTED').toUpperCase()}
            </ThemedText>
            <ThemedText
              style={[styles.label, styles.found, { color: theme.hazard }]}
              testID="log-entry-promised-heading">
              WHAT {(navigator ?? 'REDACTED').toUpperCase()} PROMISED
            </ThemedText>
            {promised.map((reason, i) => (
              <View key={i} style={styles.reason}>
                <ThemedText style={[styles.bullet, { color: theme.textSecondary }]}>▸</ThemedText>
                <ThemedText style={[styles.reasonText, { color: theme.text }]} testID={`log-entry-promised-${i + 1}`}>
                  {reason}
                </ThemedText>
              </View>
            ))}
            <ThemedText style={[styles.label, styles.found, { color: theme.hazard }]}>WHAT I FOUND</ThemedText>
            {found.map((reason, i) => (
              <View key={i} style={styles.reason}>
                <ThemedText style={[styles.bullet, { color: theme.phosphorDim }]}>▸</ThemedText>
                <ThemedText style={[styles.reasonText, { color: theme.phosphor }]} testID={`log-entry-reason-${i + 1}`}>
                  {reason}
                </ThemedText>
              </View>
            ))}
          </View>
        ) : (
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
        )}
        <ThemedText style={[styles.hint, { color: theme.textSecondary }]}>
          {flipped ? 'TAP FOR THE STORY ↻' : 'TAP TO FLIP ↻'}
        </ThemedText>
      </Pressable>
    </Animated.View>
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
  bigStars: {
    fontFamily: Typefaces.screen,
    fontSize: 44,
    lineHeight: 46,
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
  back: {
    gap: 4,
    marginTop: 8,
  },
  media: {
    fontFamily: Typefaces.screen,
    fontSize: 24,
    lineHeight: 26,
  },
  label: {
    fontFamily: Typefaces.labelBold,
    fontSize: 11,
    letterSpacing: 1.2,
    lineHeight: 16,
  },
  found: {
    marginTop: 8,
  },
  reason: {
    flexDirection: 'row',
    gap: 8,
  },
  bullet: {
    fontFamily: Typefaces.screen,
    fontSize: 21,
    lineHeight: 26,
  },
  reasonText: {
    flex: 1,
    fontFamily: Typefaces.screen,
    fontSize: 21,
    lineHeight: 26,
  },
  hint: {
    alignSelf: 'flex-end',
    fontFamily: Typefaces.labelBold,
    fontSize: 10,
    letterSpacing: 1.2,
    lineHeight: 14,
    marginTop: 8,
  },
});
