import { useEffect, useState } from 'react';
import { Animated, Easing, Platform, Pressable, StyleSheet, View, type LayoutChangeEvent } from 'react-native';

import { MediaPoster } from '@/components/media-poster';
import { MediaRow, StopReasons } from '@/components/media-row';
import { CrtScreen, ScreenLine, ShipPanel } from '@/components/ship-panel';
import { ThemedText } from '@/components/themed-text';
import { Spacing, Typefaces } from '@/constants/theme';
import { useDegauss } from '@/hooks/use-degauss';
import { useTheme } from '@/hooks/use-theme';
import type { Recommendation } from '@/lib/recommendations';
import { dottedLine, lineWeight, roadStops, toggleOpen, youAreHere, type RoadStop } from '@/lib/road-map';

const mapHeight = 380;
const gridStep = 40;
const stopBox = 56;
const stopWidth = 150;
const scanBarHeight = 3;
const useNativeDriver = Platform.OS !== 'web';

type RoadMapProps = {
  nomadName: string;
  picks: Recommendation[];
  isLoading: boolean;
  wide: boolean;
};

export function RoadMap({ nomadName, picks, isLoading, wide }: RoadMapProps) {
  const theme = useTheme();
  const stops = roadStops(picks);
  const count = stops.length;
  const { scanning, degauss } = useDegauss();

  return (
    <ShipPanel
      channel="NAV-01"
      title={`Your road · plotted by ${nomadName}`}
      testID="road-map"
      badge={
        <View style={styles.badge}>
          <ThemedText style={[styles.readout, { color: theme.textSecondary }]}>
            {count} {count === 1 ? 'STOP' : 'STOPS'} · JUST STARTING OUT
          </ThemedText>
          {wide && (
            <DegaussButton on={scanning} onPress={degauss} />
          )}
        </View>
      }>
      {isLoading && (
        <CrtScreen>
          <ScreenLine text="SCANNING…" testID="road-loading" />
        </CrtScreen>
      )}
      {!isLoading && count === 0 && (
        <CrtScreen>
          <ScreenLine text={`NO STOPS YET. ${nomadName} hasn't plotted a route for you.`} testID="road-empty" />
        </CrtScreen>
      )}
      {!isLoading && count > 0 && (wide ? <WideRoad nomadName={nomadName} scanning={scanning} stops={stops} /> : <StripRoad nomadName={nomadName} stops={stops} />)}
    </ShipPanel>
  );
}

function WideRoad({ nomadName, scanning, stops }: { nomadName: string; scanning: boolean; stops: RoadStop[] }) {
  const theme = useTheme();
  const [width, setWidth] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = stops.find((s) => s.pick.id === selectedId) ?? stops[0];
  const ways = stops.length;

  return (
    <>
      <CrtScreen>
        <View style={styles.mapHeading}>
          <ThemedText style={[styles.mapLabel, { color: theme.phosphorDim }]}>◂ JUST STARTING OUT</ThemedText>
          <ThemedText style={[styles.mapLabel, { color: theme.phosphorDim }]}>
            {ways} {ways === 1 ? 'WAY' : 'WAYS'} FORWARD ▸
          </ThemedText>
        </View>
        <View onLayout={(event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width)} style={styles.map}>
          <Grid width={width} />
          {width > 0 &&
            stops.map((stop) => <RouteLine key={stop.pick.id} stop={stop} width={width} />)}
          {width > 0 &&
            stops.map((stop) => (
              <MapStop
                key={stop.pick.id}
                onPress={() => setSelectedId(stop.pick.id)}
                selected={stop.pick.id === selected.pick.id}
                stop={stop}
                width={width}
              />
            ))}
          {width > 0 && (
            <View
              pointerEvents="none"
              style={[styles.hereSpot, { left: (youAreHere.x * width) / 100 - 60, top: (youAreHere.y * mapHeight) / 100 - 12 }]}>
              <YouAreHere />
            </View>
          )}
          {scanning && <ScanBar />}
        </View>
        <View style={[styles.legend, { borderTopColor: theme.backgroundElement }]}>
          <ThemedText style={[styles.legendText, { color: theme.textSecondary }]}>
            <ThemedText style={[styles.legendText, { color: theme.friend }]}>■</ThemedText> STOP AHEAD (
            {nomadName.toUpperCase()}&apos;S RANK)
          </ThemedText>
        </View>
      </CrtScreen>
      <StopDetail nomadName={nomadName} stop={selected} />
    </>
  );
}

function Grid({ width }: { width: number }) {
  const theme = useTheme();
  const columns = Math.floor(width / gridStep);
  const rows = Math.floor(mapHeight / gridStep);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {Array.from({ length: columns }, (_, i) => (
        <View key={`c${i}`} style={[styles.gridColumn, { left: (i + 1) * gridStep, backgroundColor: theme.grid }]} />
      ))}
      {Array.from({ length: rows }, (_, i) => (
        <View key={`r${i}`} style={[styles.gridRow, { top: (i + 1) * gridStep, backgroundColor: theme.grid }]} />
      ))}
    </View>
  );
}

function RouteLine({ stop, width }: { stop: RoadStop; width: number }) {
  const theme = useTheme();
  const line = dottedLine(youAreHere, stop.spot, width, mapHeight);
  const weight = lineWeight(stop.rank);
  const dashes = Math.floor(line.length / 15);

  return (
    <View
      pointerEvents="none"
      style={[
        styles.line,
        {
          gap: 7,
          height: weight.width,
          left: line.left,
          opacity: weight.opacity,
          top: line.top - weight.width / 2,
          transform: [{ rotate: `${line.angle}deg` }],
          width: line.length,
        },
      ]}>
      {Array.from({ length: dashes }, (_, i) => (
        <View key={i} style={[styles.dash, { backgroundColor: theme.hazard, height: weight.width }]} />
      ))}
    </View>
  );
}

function MapStop({
  stop,
  width,
  selected,
  onPress,
}: {
  stop: RoadStop;
  width: number;
  selected: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityLabel={`${stop.pick.title}, stop ${stop.rank}`}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[
        styles.mapStop,
        { left: (stop.spot.x * width) / 100 - stopWidth / 2, top: (stop.spot.y * mapHeight) / 100 - stopBox / 2 },
      ]}
      testID={`road-stop-${stop.pick.external_id}`}>
      <View
        style={[
          styles.stopBox,
          {
            backgroundColor: theme.screen,
            borderColor: theme.friend,
            boxShadow: selected
              ? `0px 0px 0px 3px ${theme.screen}, 0px 0px 0px 6px ${theme.neon}, 0px 0px 18px ${theme.friend}`
              : `0px 0px 10px ${theme.friend}`,
          },
        ]}>
        <ThemedText style={[styles.stopRank, { color: theme.friend }]}>{stop.rank}</ThemedText>
      </View>
      <ThemedText numberOfLines={2} style={[styles.stopTitle, { backgroundColor: theme.screen, color: theme.phosphor }]}>
        {stop.pick.title}
      </ThemedText>
      <ThemedText style={[styles.stopTag, { backgroundColor: theme.screen, color: theme.friend }]}>ROUTE {stop.rank}</ThemedText>
    </Pressable>
  );
}

function StopDetail({ nomadName, stop }: { nomadName: string; stop: RoadStop }) {
  const theme = useTheme();

  return (
    <CrtScreen>
      <View style={styles.detail} testID="road-detail">
        <View style={styles.detailHeading}>
          <ThemedText style={[styles.detailKicker, { color: theme.textSecondary }]}>
            STOP {stop.rank} ON {nomadName.toUpperCase()}&apos;S ROUTE · AHEAD OF YOU
          </ThemedText>
          <ThemedText style={[styles.detailKicker, { color: theme.friend }]}>STOP {stop.rank}</ThemedText>
        </View>
        <View style={styles.detailTitleRow}>
          <MediaPoster item={stop.pick} />
          <ThemedText style={[styles.detailTitle, { color: theme.phosphor, textShadowColor: theme.phosphorDim }]}>
            {stop.pick.title.toUpperCase()}
            {stop.pick.year ? ` (${stop.pick.year})` : ''}
          </ThemedText>
        </View>
        <StopReasons reasons={stop.pick.reasons} />
      </View>
    </CrtScreen>
  );
}

function StripRoad({ nomadName, stops }: { nomadName: string; stops: RoadStop[] }) {
  const theme = useTheme();
  const [openId, setOpenId] = useState<string | null>(stops[0].pick.id);

  return (
    <CrtScreen>
      <View style={styles.strip}>
        <View style={styles.stripRow}>
          <View style={styles.stripRail}>
            <YouAreHere compact />
            <DashedRail />
          </View>
          <ThemedText style={[styles.hereText, { color: theme.neon }]}>YOU ARE HERE</ThemedText>
        </View>
        {stops.map((stop) => (
          <View key={stop.pick.id} style={styles.stripRow}>
            <View style={styles.stripRail}>
              <DashedRail />
              <View style={[styles.stopBox, styles.stripBox, { backgroundColor: theme.screen, borderColor: theme.friend, boxShadow: `0px 0px 10px ${theme.friend}` }]}>
                <ThemedText style={[styles.stopRank, { color: theme.friend }]}>{stop.rank}</ThemedText>
              </View>
              <DashedRail />
            </View>
            <View style={styles.stripStop}>
              <MediaRow
                item={stop.pick}
                kicker={`STOP ${stop.rank} · ${nomadName.toUpperCase()}'S RANK`}
                onToggle={() => setOpenId(toggleOpen(openId, stop.pick.id))}
                open={openId === stop.pick.id}
                testID={`road-stop-${stop.pick.external_id}`}>
                <StopReasons reasons={stop.pick.reasons} />
              </MediaRow>
            </View>
          </View>
        ))}
        <ThemedText style={[styles.roadEnd, { color: theme.textSecondary }]}>
          ▾ END OF {nomadName.toUpperCase()}&apos;S ROUTE. 3 STOPS, ALWAYS.
        </ThemedText>
      </View>
    </CrtScreen>
  );
}

function DashedRail() {
  const theme = useTheme();

  return (
    <View style={styles.rail}>
      {Array.from({ length: 4 }, (_, i) => (
        <View key={i} style={[styles.railDash, { backgroundColor: theme.hazard }]} />
      ))}
    </View>
  );
}

function YouAreHere({ compact = false }: { compact?: boolean }) {
  const theme = useTheme();
  const blink = useBlink();

  return (
    <Animated.View style={[styles.here, { opacity: blink }]} testID="road-here">
      <View
        style={[
          styles.diamond,
          { backgroundColor: theme.neon, borderColor: theme.onAccent, boxShadow: `0px 0px 12px ${theme.neon}` },
        ]}
      />
      {!compact && (
        <ThemedText style={[styles.hereLabel, { backgroundColor: theme.screen, color: theme.neon }]}>YOU ARE HERE</ThemedText>
      )}
    </Animated.View>
  );
}

function useBlink() {
  const [opacity] = useState(() => new Animated.Value(1));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.25, duration: 0, delay: 720, useNativeDriver }),
        Animated.timing(opacity, { toValue: 1, duration: 0, delay: 480, useNativeDriver }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return opacity;
}

function DegaussButton({ on, onPress }: { on: boolean; onPress: () => void }) {
  const theme = useTheme();

  return (
    <View style={styles.degauss}>
      <View
        style={[
          styles.led,
          on
            ? { backgroundColor: theme.phosphor, borderColor: theme.phosphorDim, boxShadow: `0px 0px 6px 1px ${theme.phosphor}` }
            : { backgroundColor: theme.bezel, borderColor: theme.edge },
        ]}
        testID="road-degauss-light"
      />
      <Pressable
        accessibilityLabel="Degauss, scan line"
        accessibilityRole="switch"
        accessibilityState={{ checked: on }}
        hitSlop={12}
        onPress={onPress}
        style={({ pressed }) => [
          styles.degaussKey,
          {
            backgroundColor: theme.backgroundSelected,
            borderColor: theme.edge,
            boxShadow: pressed ? `0px 0px 0px ${theme.edge}` : `0px 2px 0px ${theme.edge}`,
            transform: [{ translateY: pressed ? 2 : 0 }],
          },
        ]}
        testID="road-degauss">
        <ThemedText style={[styles.degaussText, { color: theme.textSecondary }]}>DEGAUSS</ThemedText>
      </Pressable>
    </View>
  );
}

function ScanBar() {
  const theme = useTheme();
  const [sweep] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(sweep, { toValue: 1, duration: 4000, easing: Easing.linear, useNativeDriver }),
    );
    loop.start();
    return () => loop.stop();
  }, [sweep]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.scanBar,
        {
          backgroundColor: theme.phosphor,
          boxShadow: `0px 0px 14px 4px ${theme.phosphor}`,
          transform: [{ translateY: sweep.interpolate({ inputRange: [0, 1], outputRange: [-scanBarHeight, mapHeight] }) }],
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  degauss: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  led: {
    borderRadius: 4,
    borderWidth: 1,
    height: 8,
    width: 8,
  },
  degaussKey: {
    borderRadius: 2,
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  degaussText: {
    fontFamily: Typefaces.labelBold,
    fontSize: 9,
    letterSpacing: 1.2,
    lineHeight: 12,
  },
  readout: {
    fontFamily: Typefaces.screen,
    fontSize: 20,
    lineHeight: 22,
  },
  mapHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  mapLabel: {
    fontFamily: Typefaces.screen,
    fontSize: 18,
    lineHeight: 20,
  },
  map: {
    height: mapHeight,
    overflow: 'hidden',
  },
  scanBar: {
    height: scanBarHeight,
    left: 0,
    opacity: 0.18,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  gridColumn: {
    bottom: 0,
    position: 'absolute',
    top: 0,
    width: 1,
  },
  gridRow: {
    height: 1,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  line: {
    flexDirection: 'row',
    overflow: 'hidden',
    position: 'absolute',
  },
  dash: {
    width: 8,
  },
  mapStop: {
    alignItems: 'center',
    gap: Spacing.one,
    position: 'absolute',
    width: stopWidth,
  },
  stopBox: {
    alignItems: 'center',
    borderRadius: 3,
    borderWidth: 3,
    height: stopBox,
    justifyContent: 'center',
    width: stopBox,
  },
  stopRank: {
    fontFamily: Typefaces.screen,
    fontSize: 34,
    lineHeight: 36,
  },
  stopTitle: {
    fontFamily: Typefaces.screen,
    fontSize: 20,
    lineHeight: 20,
    paddingHorizontal: Spacing.one,
    textAlign: 'center',
  },
  stopTag: {
    fontFamily: Typefaces.screen,
    fontSize: 16,
    lineHeight: 18,
    paddingHorizontal: Spacing.one,
  },
  hereSpot: {
    alignItems: 'center',
    position: 'absolute',
    width: 120,
  },
  here: {
    alignItems: 'center',
    gap: 6,
  },
  diamond: {
    borderWidth: 3,
    height: 18,
    transform: [{ rotate: '45deg' }],
    width: 18,
  },
  hereLabel: {
    fontFamily: Typefaces.screen,
    fontSize: 18,
    lineHeight: 20,
    paddingHorizontal: Spacing.one,
  },
  legend: {
    borderTopWidth: 1,
    paddingTop: Spacing.two,
  },
  legendText: {
    fontFamily: Typefaces.screen,
    fontSize: 18,
    lineHeight: 20,
  },
  detail: {
    gap: 10,
    padding: Spacing.two,
  },
  detailHeading: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  detailKicker: {
    fontFamily: Typefaces.screen,
    fontSize: 20,
    lineHeight: 22,
  },
  detailTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
  },
  detailTitle: {
    flex: 1,
    fontFamily: Typefaces.screen,
    fontSize: 34,
    lineHeight: 34,
    textShadowRadius: 6,
  },
  strip: {
    paddingVertical: Spacing.one,
  },
  stripRow: {
    alignItems: 'stretch',
    flexDirection: 'row',
    gap: 10,
  },
  stripRail: {
    alignItems: 'center',
    width: 60,
  },
  stripBox: {
    height: 48,
    width: 48,
  },
  stripStop: {
    flex: 1,
    justifyContent: 'center',
    minWidth: 0,
  },
  rail: {
    alignItems: 'center',
    flex: 1,
    gap: 6,
    minHeight: 24,
    overflow: 'hidden',
    paddingVertical: 3,
  },
  railDash: {
    height: 6,
    width: 4,
  },
  hereText: {
    alignSelf: 'center',
    fontFamily: Typefaces.screen,
    fontSize: 22,
    lineHeight: 24,
  },
  roadEnd: {
    fontFamily: Typefaces.screen,
    fontSize: 19,
    lineHeight: 22,
    paddingTop: 10,
    textAlign: 'center',
  },
});
