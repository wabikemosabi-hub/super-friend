import { useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Platform, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Typefaces } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { encounterFor, starsLine } from '@/lib/encounters';
import { fillTemplate, logDate, type JournalEntry } from '@/lib/nomad-log';
import { textureStyle } from '@/lib/textures';

export type LogEntryProps = JournalEntry;

const useNativeDriver = Platform.OS !== 'web';
const sprocketCount = 60;
const barHeight = 26;
const punches = [1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0, 1];

export function LogEntry({ stars, encounter, title, navigator, promised, found, date }: LogEntryProps) {
  const theme = useTheme();
  const { title: heading, story } = encounterFor(stars, encounter);
  const pieces = fillTemplate(story, { date: logDate(date), navigator, title, promised, found });
  const navigatorName = (navigator ?? 'REDACTED').toUpperCase();
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
    <View style={[styles.slot, { backgroundColor: theme.bezel }]}>
      <View style={[styles.slotMouth, { backgroundColor: theme.edge }]} />
      <Animated.View style={{ transform: [{ scaleX: turn }] }}>
        <Pressable
          accessibilityHint="Flips the entry over"
          accessibilityRole="button"
          accessibilityState={{ expanded: flipped }}
          onPress={flip}
          style={({ pressed }) => [
            flipped ? styles.card : styles.paper,
            { backgroundColor: flipped ? theme.card : theme.paper, opacity: pressed ? 0.92 : 1 },
          ]}
          testID="log-entry">
          {flipped ? (
            <>
              <View style={[styles.cardCorner, { borderTopColor: theme.bezel }]} />
              <ThemedText style={[styles.cardKicker, { color: theme.cardInk }]}>NOMAD&apos;S LOG · DATA CARD</ThemedText>
              <ThemedText style={[styles.bigStars, { color: theme.ink }]} testID="log-entry-stars">
                {starsLine(stars)}
              </ThemedText>
              <ThemedText style={[styles.cardTitle, { color: theme.ink }]} testID="log-entry-title">
                {heading.toUpperCase()}
              </ThemedText>
              <View style={styles.back} testID="log-entry-back">
                <View style={[styles.cardRule, { borderColor: theme.cardInk }]}>
                  <ThemedText style={[styles.media, { color: theme.ink }]} testID="log-entry-media">
                    {title.toUpperCase()}
                  </ThemedText>
                  <ThemedText style={[styles.cardLabel, { color: theme.cardInk }]} testID="log-entry-navigator">
                    PLOTTED BY {navigatorName}
                  </ThemedText>
                </View>
                <View style={styles.columns}>
                  <View style={styles.column}>
                    <ThemedText style={[styles.cardLabel, { color: theme.cardInk }]} testID="log-entry-promised-heading">
                      WHAT {navigatorName} PROMISED
                    </ThemedText>
                    {promised.map((reason, i) => (
                      <ThemedText
                        key={i}
                        style={[styles.reasonText, { color: theme.printInk }]}
                        testID={`log-entry-promised-${i + 1}`}>
                        {reason}
                      </ThemedText>
                    ))}
                  </View>
                  <View style={styles.column}>
                    <ThemedText style={[styles.cardLabel, { color: theme.signal }]}>WHAT I FOUND</ThemedText>
                    {found.map((reason, i) => (
                      <ThemedText
                        key={i}
                        style={[styles.reasonText, styles.found, { color: theme.ink }]}
                        testID={`log-entry-reason-${i + 1}`}>
                        {reason}
                      </ThemedText>
                    ))}
                  </View>
                </View>
                <View style={styles.punches}>
                  {punches.map((punched, i) => (
                    <View
                      key={i}
                      style={[styles.punch, punched ? { backgroundColor: theme.ink } : { borderColor: theme.cardInk, borderWidth: 1 }]}
                    />
                  ))}
                </View>
              </View>
              <ThemedText style={[styles.hint, { color: theme.cardInk }]}>
                DO NOT FOLD, SPINDLE OR MUTILATE · TAP FOR THE STORY ↻
              </ThemedText>
            </>
          ) : (
            <>
              <View
                pointerEvents="none"
                style={[
                  StyleSheet.absoluteFill,
                  textureStyle({
                    image: `linear-gradient(180deg, ${theme.paper} 0%, ${theme.paper} 50%, ${theme.paperBar} 50%, ${theme.paperBar} 100%)`,
                    size: `100% ${barHeight * 2}px`,
                  }),
                ]}
              />
              <Sprockets side="left" />
              <Sprockets side="right" />
              <View style={styles.printHead}>
                <ThemedText style={[styles.print, styles.printBold, { color: theme.printInk }]}>
                  <ThemedText style={[styles.print, styles.printBold, { color: theme.printInk }]} testID="log-entry-stars">
                    {starsLine(stars)}
                  </ThemedText>{' '}
                  <ThemedText style={[styles.print, styles.printBold, { color: theme.printInk }]} testID="log-entry-title">
                    {heading.toUpperCase()}
                  </ThemedText>
                </ThemedText>
              </View>
              <ThemedText style={[styles.print, { color: theme.printInk }]} testID="log-entry-story">
                {pieces.map((piece, i) =>
                  piece.kind === 'text' ? (
                    piece.text
                  ) : (
                    <ThemedText
                      key={i}
                      style={[styles.redacted, { backgroundColor: theme.tape, color: theme.textSecondary }]}
                      testID="log-entry-redacted">
                      {' REDACTED '}
                    </ThemedText>
                  ),
                )}
              </ThemedText>
              <ThemedText style={[styles.print, styles.tear, { color: theme.inkSecondary }]}>
                -- {title.toUpperCase()} · TAP TO FLIP ↻ --
              </ThemedText>
            </>
          )}
        </Pressable>
      </Animated.View>
    </View>
  );
}

function Sprockets({ side }: { side: 'left' | 'right' }) {
  const theme = useTheme();

  return (
    <View pointerEvents="none" style={[styles.sprockets, side === 'left' ? styles.sprocketsLeft : styles.sprocketsRight]}>
      {Array.from({ length: sprocketCount }, (_, i) => (
        <View key={i} style={[styles.sprocket, { backgroundColor: theme.bezel }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  slot: {
    borderRadius: 4,
    paddingBottom: 14,
    paddingHorizontal: 12,
  },
  slotMouth: {
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    height: 10,
    marginBottom: 12,
    marginHorizontal: -12,
  },
  paper: {
    overflow: 'hidden',
    paddingHorizontal: 36,
    paddingVertical: barHeight / 2,
  },
  sprockets: {
    bottom: 0,
    gap: 18,
    overflow: 'hidden',
    paddingTop: 9,
    position: 'absolute',
    top: 0,
    width: 22,
  },
  sprocketsLeft: {
    alignItems: 'center',
    left: 4,
  },
  sprocketsRight: {
    alignItems: 'center',
    right: 4,
  },
  sprocket: {
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  printHead: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  print: {
    fontFamily: Typefaces.label,
    fontSize: 14,
    lineHeight: barHeight,
  },
  printBold: {
    fontFamily: Typefaces.labelBold,
  },
  tear: {
    fontSize: 12,
  },
  redacted: {
    fontFamily: Typefaces.tape,
    fontSize: 13,
    letterSpacing: 2,
  },
  card: {
    gap: 6,
    overflow: 'hidden',
    paddingBottom: 16,
    paddingHorizontal: 22,
    paddingTop: 18,
  },
  cardCorner: {
    borderRightColor: 'transparent',
    borderRightWidth: 26,
    borderTopWidth: 26,
    height: 0,
    left: 0,
    position: 'absolute',
    top: 0,
    width: 0,
  },
  cardKicker: {
    fontFamily: Typefaces.label,
    fontSize: 11,
    letterSpacing: 3,
    lineHeight: 16,
    marginLeft: 14,
  },
  bigStars: {
    fontFamily: Typefaces.display,
    fontSize: 44,
    lineHeight: 48,
  },
  cardTitle: {
    fontFamily: Typefaces.display,
    fontSize: 28,
    lineHeight: 30,
  },
  back: {
    gap: 12,
    marginTop: 4,
  },
  cardRule: {
    borderBottomWidth: 1,
    borderStyle: 'dashed',
    borderTopWidth: 1,
    gap: 2,
    paddingVertical: 8,
  },
  media: {
    fontFamily: Typefaces.display,
    fontSize: 22,
    lineHeight: 24,
  },
  cardLabel: {
    fontFamily: Typefaces.labelBold,
    fontSize: 11,
    letterSpacing: 1.5,
    lineHeight: 16,
  },
  columns: {
    columnGap: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 12,
  },
  column: {
    flexBasis: 160,
    flexGrow: 1,
    gap: 4,
  },
  reasonText: {
    fontFamily: Typefaces.label,
    fontSize: 15,
    lineHeight: 21,
  },
  found: {
    fontFamily: Typefaces.labelBold,
  },
  punches: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  punch: {
    borderRadius: 1,
    height: 14,
    width: 7,
  },
  hint: {
    fontFamily: Typefaces.labelBold,
    fontSize: 10,
    letterSpacing: 1.5,
    lineHeight: 14,
    marginTop: 6,
  },
});
