import { useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Platform, StyleSheet, View } from 'react-native';

import { LogEntry } from '@/components/log-entry';
import { CrtScreen, ScreenLine, ShipButton, ShipPanel } from '@/components/ship-panel';
import { ThemedText } from '@/components/themed-text';
import { Spacing, Typefaces } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { logEntry, type LogRow } from '@/lib/ratings';

type NomadLogProps = {
  channel: string;
  title: string;
  tape?: string;
  rows: LogRow[];
  empty: string;
  testID: string;
};

const pageSize = 3;
const useNativeDriver = Platform.OS !== 'web';

export function NomadLog({ channel, title, tape, rows, empty, testID }: NomadLogProps) {
  const theme = useTheme();
  const entries = rows.flatMap((row) => {
    const entry = logEntry(row);
    return entry ? [{ id: row.id, entry }] : [];
  });
  const [shown, setShown] = useState(pageSize);
  const [still, setStill] = useState(false);
  const [sheets] = useState(() => new Map<number, Animated.Value>());
  const visible = entries.slice(0, shown);
  const left = entries.length - visible.length;

  useEffect(() => {
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
      if (!cancelled) setStill(reduced);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  function sheet(index: number) {
    const existing = sheets.get(index);
    if (existing) return existing;
    const created = new Animated.Value(1);
    sheets.set(index, created);
    return created;
  }

  function unfoldMore() {
    const next = Math.min(shown + pageSize, entries.length);
    const opening = Array.from({ length: next - shown }, (_, i) => sheet(shown + i));
    opening.forEach((value) => value.setValue(still ? 1 : 0));
    setShown(next);
    if (still) return;
    Animated.stagger(
      140,
      opening.map((value) =>
        Animated.timing(value, { toValue: 1, duration: 420, easing: Easing.out(Easing.cubic), useNativeDriver }),
      ),
    ).start();
  }

  function foldUp() {
    if (still) {
      setShown(pageSize);
      return;
    }
    const closing = Array.from({ length: shown - pageSize }, (_, i) => sheet(shown - 1 - i));
    Animated.stagger(
      90,
      closing.map((value) =>
        Animated.timing(value, { toValue: 0, duration: 300, easing: Easing.in(Easing.cubic), useNativeDriver }),
      ),
    ).start(() => setShown(pageSize));
  }

  return (
    <ShipPanel channel={channel} icon="page" tape={tape} testID={testID} title={title}>
      {entries.length === 0 ? (
        <CrtScreen>
          <ScreenLine testID={`${testID}-empty`} text={empty} />
        </CrtScreen>
      ) : (
        <View style={styles.entries}>
          {visible.map(({ id, entry }, i) => {
            const fold = sheet(i);
            return (
              <Animated.View
                key={id}
                style={[
                  styles.sheet,
                  {
                    opacity: fold.interpolate({ inputRange: [0, 0.25, 1], outputRange: [0, 1, 1] }),
                    transform: [
                      { perspective: 900 },
                      { rotateX: fold.interpolate({ inputRange: [0, 1], outputRange: ['-90deg', '0deg'] }) },
                    ],
                  },
                ]}>
                <LogEntry {...entry} />
                <Animated.View
                  pointerEvents="none"
                  style={[
                    StyleSheet.absoluteFill,
                    { backgroundColor: theme.edge, opacity: fold.interpolate({ inputRange: [0, 1], outputRange: [0.7, 0] }) },
                  ]}
                />
              </Animated.View>
            );
          })}
        </View>
      )}
      {entries.length > pageSize && (
        <View style={styles.footer}>
          <ThemedText style={[styles.count, { color: theme.inkSecondary }]} testID={`${testID}-count`}>
            {visible.length} OF {entries.length}
          </ThemedText>
          <View style={styles.keys}>
            {shown > pageSize && <ShipButton label="Fold up" onPress={foldUp} testID={`${testID}-fold`} variant="panel" />}
            {left > 0 && (
              <ShipButton
                label={`Show ${Math.min(left, pageSize)} more`}
                onPress={unfoldMore}
                testID={`${testID}-more`}
                variant="panel"
              />
            )}
          </View>
        </View>
      )}
    </ShipPanel>
  );
}

const styles = StyleSheet.create({
  entries: {
    gap: Spacing.three,
  },
  sheet: {
    transformOrigin: 'top',
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    justifyContent: 'space-between',
  },
  count: {
    fontFamily: Typefaces.labelBold,
    fontSize: 12,
    letterSpacing: 1.5,
    lineHeight: 16,
  },
  keys: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
});
