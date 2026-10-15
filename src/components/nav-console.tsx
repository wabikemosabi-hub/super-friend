import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { MediaRow, StopReasons } from '@/components/media-row';
import { PlotStopPanel } from '@/components/plot-stop-panel';
import { CrtScreen, Lamp, ScreenLine, ShipButton, ShipPanel } from '@/components/ship-panel';
import { ThemedText } from '@/components/themed-text';
import { Spacing, Typefaces } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { ReachedStop } from '@/lib/ratings';
import { MAX_PICKS, openSlots, type Recommendation } from '@/lib/recommendations';
import { routeCount, toggleOpen } from '@/lib/road-map';

type NavConsoleProps = {
  nomadName: string;
  plotted: Recommendation[];
  reached: ReachedStop[];
  isLoading: boolean;
  onAdd: (mediaItemId: string, reasons: string[]) => Promise<void>;
  onReplace: (recommendationId: string, mediaItemId: string, reasons: string[]) => Promise<void>;
};

export function NavConsole({ nomadName, plotted, reached, isLoading, onAdd, onReplace }: NavConsoleProps) {
  const theme = useTheme();
  const [openId, setOpenId] = useState<string | null>(null);
  const [plotting, setPlotting] = useState(false);
  const slots = openSlots(plotted);
  const full = slots === 0;

  return (
    <ShipPanel channel="NAV-02" icon="crosshair" tape={`Plot ${nomadName}'s route`} title="Nav console" testID="nav-console">
      <CrtScreen>
        <View style={styles.screen}>
          <View style={styles.slotsRow}>
            <View accessibilityLabel={`${plotted.length} of ${MAX_PICKS} stops plotted`} style={styles.pips}>
              {Array.from({ length: MAX_PICKS }, (_, i) => (
                <Lamp key={i} on={i < plotted.length} />
              ))}
            </View>
            <ThemedText style={[styles.slots, { color: theme.amber, textShadowColor: theme.amber }]} testID="console-slots">
              {routeCount(plotted.length, MAX_PICKS)}
            </ThemedText>
          </View>
          {isLoading && <ScreenLine text="SCANNING…" testID="console-loading" />}
          {!isLoading && plotted.length === 0 && (
            <ScreenLine text={`NO STOPS PLOTTED. Where should ${nomadName} go first?`} testID="console-empty" />
          )}
          {plotted.map((stop) => (
            <View key={stop.id} style={[styles.stop, { borderTopColor: theme.phosphorDim }]}>
              <MediaRow
                item={stop}
                onToggle={() => setOpenId(toggleOpen(openId, stop.id))}
                open={openId === stop.id}
                rank={stop.rank}
                testID={`console-stop-${stop.external_id}`}>
                <StopReasons reasons={stop.reasons} />
              </MediaRow>
            </View>
          ))}
        </View>
      </CrtScreen>
      <ShipButton
        label={full ? `Replace a stop on ${nomadName}'s route` : `Plot a stop for ${nomadName}`}
        onPress={() => setPlotting(true)}
        testID="plot-stop-open"
        variant={full ? 'alert' : 'hazard'}
      />
      <PlotStopPanel
        landingRank={plotted.length + 1}
        nomadName={nomadName}
        onClose={() => setPlotting(false)}
        onPlot={(item, reasons, replacing) =>
          replacing ? onReplace(replacing.id, item.id, reasons) : onAdd(item.id, reasons)
        }
        routeFull={full}
        reached={reached}
        route={plotted}
        visible={plotting}
      />
    </ShipPanel>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: 10,
  },
  slotsRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  pips: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  slots: {
    fontFamily: Typefaces.screen,
    fontSize: 24,
    lineHeight: 26,
    textShadowRadius: 6,
  },
  stop: {
    borderStyle: 'dashed',
    borderTopWidth: 1,
    paddingTop: Spacing.two,
  },
});
