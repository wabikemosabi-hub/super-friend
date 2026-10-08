import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { MediaRow, StopReasons } from '@/components/media-row';
import { MediaSearchModal } from '@/components/media-search-modal';
import { ReasonsForm } from '@/components/reasons-form';
import { CrtScreen, ScreenLine, ShipButton, ShipPanel } from '@/components/ship-panel';
import { ThemedText } from '@/components/themed-text';
import { Spacing, Typefaces } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { MediaItem } from '@/lib/media-search';
import { MAX_PICKS, openSlots, type Recommendation } from '@/lib/recommendations';
import { slotsLine, toggleOpen } from '@/lib/road-map';

type NavConsoleProps = {
  nomadName: string;
  plotted: Recommendation[];
  isLoading: boolean;
  onAdd: (mediaItemId: string, reasons: string[]) => Promise<void>;
};

export function NavConsole({ nomadName, plotted, isLoading, onAdd }: NavConsoleProps) {
  const theme = useTheme();
  const [openId, setOpenId] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [picked, setPicked] = useState<MediaItem | null>(null);
  const slots = openSlots(plotted);

  return (
    <ShipPanel channel="NAV-02" title={`Nav console · plot ${nomadName}'s route`} testID="nav-console">
      <CrtScreen>
        <View style={styles.screen}>
          <View style={styles.slotsRow}>
            <View accessibilityLabel={`${plotted.length} of ${MAX_PICKS} stops plotted`} style={styles.pips}>
              {Array.from({ length: MAX_PICKS }, (_, i) => (
                <View
                  key={i}
                  style={[
                    styles.pip,
                    i < plotted.length
                      ? { backgroundColor: theme.you, borderColor: theme.you, boxShadow: `0px 0px 6px ${theme.you}` }
                      : { backgroundColor: theme.background, borderColor: theme.backgroundElement },
                  ]}
                />
              ))}
            </View>
            <ThemedText style={[styles.slots, { color: slots === 0 ? theme.alert : theme.hazard }]} testID="console-slots">
              {slotsLine(slots)}
            </ThemedText>
          </View>
          {isLoading && <ScreenLine text="SCANNING…" testID="console-loading" />}
          {!isLoading && plotted.length === 0 && (
            <ScreenLine text={`NO STOPS PLOTTED. Where should ${nomadName} go first?`} testID="console-empty" />
          )}
          {plotted.map((stop) => (
            <View key={stop.id} style={[styles.stop, { borderTopColor: theme.bezel }]}>
              <MediaRow
                item={stop}
                onToggle={() => setOpenId(toggleOpen(openId, stop.id))}
                open={openId === stop.id}
                rank={stop.rank}
                testID={`console-stop-${stop.external_id}`}>
                <StopReasons footnote={`${nomadName.toUpperCase()} HASN'T REACHED IT YET`} reasons={stop.reasons} />
              </MediaRow>
            </View>
          ))}
        </View>
      </CrtScreen>
      {picked ? (
        <ReasonsForm
          item={picked}
          nomadName={nomadName}
          onCancel={() => setPicked(null)}
          onSave={async (reasons) => {
            await onAdd(picked.id, reasons);
            setPicked(null);
          }}
        />
      ) : (
        <ShipButton
          disabled={slots === 0}
          label={`Plot a stop for ${nomadName}`}
          onPress={() => setSearching(true)}
          testID="console-plot"
        />
      )}
      <MediaSearchModal visible={searching} type="movie" onPick={setPicked} onClose={() => setSearching(false)} />
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
    gap: Spacing.one,
  },
  pip: {
    borderWidth: 1,
    height: 14,
    width: 14,
  },
  slots: {
    fontFamily: Typefaces.screen,
    fontSize: 20,
    lineHeight: 22,
  },
  stop: {
    borderStyle: 'dashed',
    borderTopWidth: 1,
    paddingTop: Spacing.two,
  },
});
