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
  onCancel: () => void;
  onSave: (reasons: string[]) => Promise<void>;
};

export function ReasonsForm({ item, nomadName, onCancel, onSave }: ReasonsFormProps) {
  const theme = useTheme();
  const [reasons, setReasons] = useState(['', '', '']);
  const [saving, setSaving] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

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
    <View style={[styles.form, { backgroundColor: theme.backgroundSelected, borderColor: theme.edge }]} testID="adventure-reasons">
      <View style={styles.heading}>
        <MediaPoster item={item} />
        <View style={styles.details}>
          <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
            WHY SHOULD {nomadName.toUpperCase()} STOP HERE
          </ThemedText>
          <ThemedText style={styles.title} testID="adventure-reasons-title">
            {item.title}
            {item.year ? ` (${item.year})` : ''}?
          </ThemedText>
        </View>
      </View>
      {reasons.map((reason, i) => (
        <TextInput
          accessibilityLabel={i === 0 ? 'Reason 1 (required)' : `Reason ${i + 1} (optional)`}
          key={i}
          maxLength={140}
          onChangeText={(text) => {
            setReasons(reasons.map((r, j) => (j === i ? text : r)));
            setProblem(null);
          }}
          placeholder={i === 0 ? 'REASON 1 (REQUIRED)' : `REASON ${i + 1} (OPTIONAL)`}
          placeholderTextColor={theme.phosphorDim}
          style={[styles.input, { backgroundColor: theme.screen, borderColor: theme.edge, color: theme.phosphor }]}
          testID={`adventure-reason-${i + 1}`}
          value={reason}
        />
      ))}
      {problem && <ScreenLine text={problem} color={theme.alert} testID="adventure-add-error" />}
      <View style={styles.buttons}>
        <ShipButton label="Cancel" onPress={onCancel} testID="adventure-cancel" variant="panel" />
        <ShipButton disabled={saving} label="Plot it" onPress={save} testID="adventure-save" variant="phosphor" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    borderRadius: 4,
    borderWidth: 2,
    gap: 10,
    padding: Spacing.three,
  },
  heading: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  details: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  label: {
    fontFamily: Typefaces.labelBold,
    fontSize: 11,
    letterSpacing: 1.2,
    lineHeight: 16,
  },
  title: {
    fontFamily: Typefaces.display,
    fontSize: 15,
    lineHeight: 22,
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
    gap: Spacing.two,
    justifyContent: 'flex-end',
  },
});
