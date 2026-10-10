import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { MediaSearch } from '@/components/media-search';
import { ReasonsForm } from '@/components/reasons-form';
import { ShipModal } from '@/components/ship-modal';
import { ThemedText } from '@/components/themed-text';
import { Spacing, Typefaces } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { MediaItem } from '@/lib/media-search';
import { MAX_PICKS } from '@/lib/recommendations';

type PlotStopPanelProps = {
  visible: boolean;
  nomadName: string;
  landingRank: number;
  onClose: () => void;
  onPlot: (item: MediaItem, reasons: string[]) => Promise<void>;
};

const steps = [
  { key: 'search', label: '1 · SEARCH' },
  { key: 'plot', label: '2 · REASONS' },
] as const;

export function PlotStopPanel({ visible, nomadName, landingRank, onClose, onPlot }: PlotStopPanelProps) {
  const theme = useTheme();
  const [picked, setPicked] = useState<MediaItem | null>(null);
  const step = picked ? 'plot' : 'search';

  function close() {
    setPicked(null);
    onClose();
  }

  return (
    <ShipModal
      channel="NAV-02"
      closeLabel="Close plot a stop"
      heading={`PLOT A STOP FOR ${nomadName.toUpperCase()} · STOP ${landingRank} OF ${MAX_PICKS}`}
      onClose={close}
      testID="plot-stop"
      visible={visible}>
      <View style={styles.body}>
        <View style={styles.steps}>
          {steps.map((s) => (
            <ThemedText
              key={s.key}
              style={[
                styles.step,
                s.key === step
                  ? { backgroundColor: theme.hazard, color: theme.onAccent }
                  : { backgroundColor: theme.screen, color: theme.textSecondary },
              ]}
              testID={`plot-stop-step-${s.key}`}>
              {s.label}
            </ThemedText>
          ))}
        </View>
        <View style={step === 'search' ? null : styles.hidden}>
          <MediaSearch type="movie" onPick={setPicked} />
        </View>
        {picked && (
          <ReasonsForm
            item={picked}
            nomadName={nomadName}
            onBack={() => setPicked(null)}
            onSave={async (reasons) => {
              await onPlot(picked, reasons);
              close();
            }}
          />
        )}
      </View>
    </ShipModal>
  );
}

const styles = StyleSheet.create({
  body: {
    gap: Spacing.three,
  },
  steps: {
    flexDirection: 'row',
    gap: 6,
  },
  step: {
    borderRadius: 2,
    fontFamily: Typefaces.screen,
    fontSize: 18,
    lineHeight: 22,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  hidden: {
    display: 'none',
  },
});
