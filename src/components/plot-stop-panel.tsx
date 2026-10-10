import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { MediaPoster } from '@/components/media-poster';
import { MediaSearch } from '@/components/media-search';
import { ReasonsForm } from '@/components/reasons-form';
import { ShipModal } from '@/components/ship-modal';
import { CrtScreen, ShipButton } from '@/components/ship-panel';
import { ThemedText } from '@/components/themed-text';
import { Spacing, Typefaces } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { MediaItem } from '@/lib/media-search';
import { MAX_PICKS, onRoute, type Recommendation } from '@/lib/recommendations';

type PlotStopPanelProps = {
  visible: boolean;
  nomadName: string;
  route: Recommendation[];
  routeFull: boolean;
  landingRank: number;
  onClose: () => void;
  onPlot: (item: MediaItem, reasons: string[], replacing: Recommendation | null) => Promise<void>;
};

type Step = 'replace' | 'search' | 'plot';

const stepLabels: Record<Step, string> = { replace: 'STOP TO REPLACE', search: 'SEARCH', plot: 'REASONS' };

export function PlotStopPanel({ visible, nomadName, route, routeFull, landingRank, onClose, onPlot }: PlotStopPanelProps) {
  const theme = useTheme();
  const [chosen, setChosen] = useState<Recommendation | null>(null);
  const [searching, setSearching] = useState(false);
  const [picked, setPicked] = useState<MediaItem | null>(null);
  const steps: Step[] = routeFull ? ['replace', 'search', 'plot'] : ['search', 'plot'];
  const step: Step = picked ? 'plot' : routeFull && !searching ? 'replace' : 'search';
  const name = nomadName.toUpperCase();

  function close() {
    setChosen(null);
    setSearching(false);
    setPicked(null);
    onClose();
  }

  return (
    <ShipModal
      channel="NAV-02"
      closeLabel="Close plot a stop"
      heading={
        routeFull ? `REPLACE A STOP ON ${name}'S ROUTE` : `PLOT A STOP FOR ${name} · STOP ${landingRank} OF ${MAX_PICKS}`
      }
      onClose={close}
      testID="plot-stop"
      visible={visible}>
      <View style={styles.body}>
        <View style={styles.steps}>
          {steps.map((s, i) => (
            <ThemedText
              key={s}
              style={[
                styles.step,
                s === step
                  ? { backgroundColor: theme.hazard, color: theme.onAccent }
                  : { backgroundColor: theme.screen, color: theme.textSecondary },
              ]}
              testID={`plot-stop-step-${s}`}>
              {i + 1} · {stepLabels[s]}
            </ThemedText>
          ))}
        </View>

        {step === 'replace' && (
          <View style={styles.replace}>
            <ThemedText style={[styles.question, { color: theme.hazard }]}>
              {name}&apos;S ROUTE IS FULL. WHICH STOP ARE YOU REPLACING?
            </ThemedText>
            <CrtScreen>
              <View accessibilityLabel="Stop to replace" accessibilityRole="radiogroup">
                {route.map((stop) => {
                  const isChosen = chosen?.id === stop.id;
                  return (
                    <Pressable
                      accessibilityLabel={`Stop ${stop.rank}, ${stop.title}`}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: isChosen }}
                      key={stop.id}
                      onPress={() => setChosen(stop)}
                      style={[
                        styles.choice,
                        { borderBottomColor: theme.bezel },
                        isChosen && { backgroundColor: theme.bezel, borderColor: theme.alert, borderWidth: 2 },
                      ]}
                      testID={`plot-stop-replace-${stop.rank}`}>
                      <ThemedText style={[styles.rank, { color: theme.hazard }]}>{stop.rank}</ThemedText>
                      <MediaPoster item={stop} />
                      <ThemedText style={[styles.choiceTitle, { color: theme.phosphor }]}>
                        {stop.title}
                        {stop.year ? ` (${stop.year})` : ''}
                      </ThemedText>
                      {isChosen && <ThemedText style={[styles.mark, { color: theme.alert }]}>REPLACING</ThemedText>}
                    </Pressable>
                  );
                })}
              </View>
            </CrtScreen>
            <ThemedText style={[styles.footnote, { color: theme.textSecondary }]}>
              The new stop takes its place in the ranking. The old one leaves the route. {nomadName} never sees it was
              swapped.
            </ThemedText>
            <View style={styles.next}>
              <ShipButton
                disabled={chosen === null}
                label="Find its replacement"
                onPress={() => setSearching(true)}
                testID="plot-stop-replace-next"
              />
            </View>
          </View>
        )}

        <View style={step === 'search' ? null : styles.hidden}>
          <MediaSearch
            type="movie"
            onPick={setPicked}
            unavailable={(item) =>
              onRoute(route, item.external_id)
                ? { note: 'ALREADY ON YOUR ROUTE', testID: `plot-stop-unavailable-${item.external_id}` }
                : null
            }
          />
        </View>

        {picked && (
          <ReasonsForm
            item={picked}
            nomadName={nomadName}
            onBack={() => setPicked(null)}
            onSave={async (reasons) => {
              await onPlot(picked, reasons, chosen);
              close();
            }}
            submitLabel={chosen ? 'Replace' : 'Plot it'}
            replacing={chosen}
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
    flexWrap: 'wrap',
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
  replace: {
    gap: 12,
  },
  question: {
    fontFamily: Typefaces.screen,
    fontSize: 22,
    lineHeight: 24,
  },
  choice: {
    alignItems: 'center',
    borderBottomWidth: 1,
    borderStyle: 'dashed',
    flexDirection: 'row',
    gap: 12,
    minHeight: 60,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  rank: {
    fontFamily: Typefaces.screen,
    fontSize: 28,
    lineHeight: 30,
    width: 16,
  },
  choiceTitle: {
    flex: 1,
    fontFamily: Typefaces.screen,
    fontSize: 22,
    lineHeight: 24,
    minWidth: 0,
  },
  mark: {
    fontFamily: Typefaces.screen,
    fontSize: 18,
    lineHeight: 20,
  },
  footnote: {
    fontSize: 12,
    lineHeight: 18,
  },
  next: {
    alignItems: 'flex-end',
  },
});
