import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { MediaPoster } from '@/components/media-poster';
import { ScreenLine, ShipButton } from '@/components/ship-panel';
import { ThemedText } from '@/components/themed-text';
import { Spacing, Typefaces } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { MediaItem } from '@/lib/media-search';
import { reasonsProblem } from '@/lib/recommendations';

type ReasonsFormProps = {
  item: MediaItem;
  nomadName: string;
  onBack: () => void;
  onSave: (reasons: string[]) => Promise<void>;
};

export function ReasonsForm({ item, nomadName, onBack, onSave }: ReasonsFormProps) {
  const theme = useTheme();
  const [reasons, setReasons] = useState(['', '', '']);
  const [saving, setSaving] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [focused, setFocused] = useState<number | null>(null);

  async function save() {
    if (saving) return;
    const issue = reasonsProblem(reasons);
    if (issue) {
      setProblem(issue);
      return;
    }
    setSaving(true);
    setProblem(null);
    try {
      await onSave(reasons);
    } catch (failure) {
      setProblem(failure instanceof Error ? failure.message : 'That stop did not go through');
      setSaving(false);
    }
  }

  return (
    <View style={styles.form} testID="plot-stop-reasons">
      <View style={[styles.heading, { backgroundColor: theme.screen, borderColor: theme.edge }]}>
        <MediaPoster item={item} />
        <ThemedText style={[styles.title, { color: theme.phosphor }]} testID="plot-stop-title">
          {item.title}
          {item.year ? <ThemedText style={[styles.year, { color: theme.phosphorDim }]}> ({item.year})</ThemedText> : null}
        </ThemedText>
      </View>
      <ThemedText style={[styles.because, { color: theme.hazard }]}>GREAT STOP BECAUSE:</ThemedText>
      {reasons.map((reason, i) => (
        <View key={i} style={styles.field}>
          <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
            {i === 0 ? 'REASON 1 · REQUIRED' : `REASON ${i + 1} · OPTIONAL`}
          </ThemedText>
          <TextInput
            accessibilityLabel={i === 0 ? 'Reason 1 (required)' : `Reason ${i + 1} (optional)`}
            maxLength={140}
            onBlur={() => setFocused(null)}
            onChangeText={(text) => {
              setReasons(reasons.map((r, j) => (j === i ? text : r)));
              setProblem(null);
            }}
            onFocus={() => setFocused(i)}
            placeholder={i === 0 && focused !== 0 ? `Why should ${nomadName} stop here?` : ''}
            placeholderTextColor={theme.phosphorDim}
            style={[styles.input, { backgroundColor: theme.screen, borderColor: focused === i ? theme.phosphorDim : theme.edge, color: theme.phosphor }]}
            testID={`plot-stop-reason-${i + 1}`}
            value={reason}
          />
        </View>
      ))}
      {problem && <ScreenLine text={problem} color={theme.alert} testID="plot-stop-error" />}
      <View style={styles.buttons}>
        <ShipButton label="Back to search" onPress={onBack} testID="plot-stop-back" variant="panel" />
        <ShipButton disabled={saving} label="Plot it" onPress={save} testID="plot-stop-submit" variant="phosphor" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 12,
  },
  heading: {
    alignItems: 'center',
    borderRadius: 4,
    borderWidth: 2,
    flexDirection: 'row',
    gap: 14,
    padding: 12,
  },
  title: {
    flex: 1,
    fontFamily: Typefaces.screen,
    fontSize: 28,
    lineHeight: 30,
  },
  year: {
    fontFamily: Typefaces.screen,
    fontSize: 22,
  },
  because: {
    fontFamily: Typefaces.screen,
    fontSize: 22,
    lineHeight: 24,
  },
  field: {
    gap: 4,
  },
  label: {
    fontFamily: Typefaces.labelBold,
    fontSize: 11,
    letterSpacing: 1.2,
    lineHeight: 16,
  },
  input: {
    borderRadius: 3,
    borderWidth: 2,
    fontFamily: Typefaces.screen,
    fontSize: 22,
    height: 46,
    minWidth: 0,
    outlineStyle: 'solid',
    outlineWidth: 0,
    paddingHorizontal: 12,
  },
  buttons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    justifyContent: 'flex-end',
  },
});
