import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { MediaPoster } from '@/components/media-poster';
import { ThemedText } from '@/components/themed-text';
import { Spacing, Typefaces } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Json } from '@/lib/database.types';

type MediaRowProps = {
  item: { title: string; year: number | null; metadata: Json };
  rank?: number;
  kicker?: string;
  open: boolean;
  onToggle: () => void;
  children?: ReactNode;
  testID: string;
};

export function MediaRow({ item, rank, kicker, open, onToggle, children, testID }: MediaRowProps) {
  const theme = useTheme();
  const title = `${item.title}${item.year ? ` (${item.year})` : ''}`;

  return (
    <View style={styles.row}>
      <Pressable
        accessibilityLabel={title}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={onToggle}
        style={styles.toggle}
        testID={testID}>
        {rank !== undefined && <ThemedText style={[styles.rank, { color: theme.hazard }]}>{rank}</ThemedText>}
        <MediaPoster item={item} />
        <View style={styles.names}>
          {kicker && <ThemedText style={[styles.kicker, { color: theme.friend }]}>{kicker}</ThemedText>}
          <ThemedText style={[styles.title, { color: theme.phosphor, textShadowColor: theme.phosphorDim }]}>{title}</ThemedText>
        </View>
        <ThemedText style={[styles.chevron, { color: theme.textSecondary }]}>{open ? '▾' : '▸'}</ThemedText>
      </Pressable>
      {open && children && <View style={styles.body}>{children}</View>}
    </View>
  );
}

export function StopReasons({ reasons, footnote }: { reasons: string[]; footnote?: string }) {
  const theme = useTheme();

  return (
    <View style={styles.reasons}>
      <ThemedText style={[styles.because, { color: theme.hazard }]}>GREAT STOP BECAUSE:</ThemedText>
      {reasons.map((reason, i) => (
        <ThemedText key={i} style={[styles.reason, { color: theme.phosphorDim }]}>
          {i + 1}. {reason}
        </ThemedText>
      ))}
      {footnote && <ThemedText style={[styles.footnote, { color: theme.textSecondary }]}>{footnote}</ThemedText>}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: Spacing.one,
    paddingVertical: Spacing.one,
  },
  toggle: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    minHeight: 56,
  },
  rank: {
    fontFamily: Typefaces.screen,
    fontSize: 30,
    lineHeight: 32,
    width: 16,
  },
  names: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  kicker: {
    fontFamily: Typefaces.screen,
    fontSize: 16,
    lineHeight: 18,
  },
  title: {
    fontFamily: Typefaces.screen,
    fontSize: 22,
    lineHeight: 24,
    textShadowRadius: 6,
  },
  chevron: {
    fontFamily: Typefaces.screen,
    fontSize: 22,
    lineHeight: 24,
  },
  body: {
    paddingLeft: 58,
  },
  reasons: {
    gap: Spacing.one,
  },
  because: {
    fontFamily: Typefaces.screen,
    fontSize: 18,
    lineHeight: 20,
  },
  reason: {
    fontFamily: Typefaces.screen,
    fontSize: 20,
    lineHeight: 22,
  },
  footnote: {
    fontFamily: Typefaces.label,
    fontSize: 11,
    letterSpacing: 1,
    lineHeight: 16,
  },
});
