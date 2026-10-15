import { useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Platform, Pressable, StyleSheet, View, type LayoutChangeEvent } from 'react-native';

import { MediaPoster } from '@/components/media-poster';
import { MediaRow, StopReasons } from '@/components/media-row';
import { ReachStopPanel } from '@/components/reach-stop-panel';
import { CrtScreen, Readout, ScreenLine, ShipButton, ShipPanel, Tape } from '@/components/ship-panel';
import { ThemedText } from '@/components/themed-text';
import type { Stars } from '@/constants/encounters';
import { Spacing, Typefaces } from '@/constants/theme';
import { useDegauss } from '@/hooks/use-degauss';
import { useTheme } from '@/hooks/use-theme';
import type { Recommendation } from '@/lib/recommendations';
import { dottedLine, lineWeight, roadStops, toggleOpen, youAreHere, type RoadStop, type Spot } from '@/lib/road-map';
import { textureStyle } from '@/lib/textures';

const mapHeight = 380;
const stopBox = 56;
const stopWidth = 150;
const scanBarHeight = 3;
const useNativeDriver = Platform.OS !== 'web';
const wobbleSteps = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.85, 1];
const jolt = [0, -7, 6, -5, 4, -3, 2, -1, 0.5, 0];
const tilt = ['0deg', '-2deg', '1.6deg', '-1.2deg', '0.9deg', '-0.6deg', '0.4deg', '-0.2deg', '0.1deg', '0deg'];
const flicker = [1, 0.45, 0.9, 0.6, 0.95, 0.8, 1, 0.9, 1, 1];

type RoadMapProps = {
  nomadName: string;
  picks: Recommendation[];
  isLoading: boolean;
  wide: boolean;
  onRate: (mediaItemId: string, stars: Stars, encounter: number, reasons: string[]) => Promise<void>;
};

export function RoadMap({ nomadName, picks, isLoading, wide, onRate }: RoadMapProps) {
  const stops = roadStops(picks);
  const count = stops.length;
  const { scanning, degauss } = useDegauss();
  const [shake] = useState(() => new Animated.Value(0));
  const [reaching, setReaching] = useState<Recommendation | null>(null);

  async function degaussWithWobble() {
    if (await AccessibilityInfo.isReduceMotionEnabled()) {
      degauss();
      return;
    }
    shake.setValue(0);
    Animated.timing(shake, { toValue: 1, duration: 520, easing: Easing.linear, useNativeDriver }).start(({ finished }) => {
      if (finished) degauss();
    });
  }

  return (
    <ShipPanel
      channel="NAV-01"
      icon="up"
      tape={`Navigator: ${nomadName}`}
      title="Your road"
      testID="road-map"
      badge={
        <View style={styles.badge}>
          <Readout>
            {count} {count === 1 ? 'STOP' : 'STOPS'} · JUST STARTING OUT
          </Readout>
          {wide && (
            <DegaussButton on={scanning} onPress={degaussWithWobble} />
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
      {!isLoading &&
        count > 0 &&
        (wide ? (
          <WideRoad nomadName={nomadName} onReach={setReaching} scanning={scanning} shake={shake} stops={stops} />
        ) : (
          <StripRoad nomadName={nomadName} onReach={setReaching} stops={stops} />
        ))}
      {reaching && (
        <ReachStopPanel
          navigator={nomadName}
          onClose={() => setReaching(null)}
          onLog={(stars, encounter, reasons) => onRate(reaching.media_item_id, stars, encounter, reasons)}
          stop={reaching}
          visible
        />
      )}
    </ShipPanel>
  );
}

function WideRoad({
  nomadName,
  onReach,
  scanning,
  shake,
  stops,
}: {
  nomadName: string;
  onReach: (stop: Recommendation) => void;
  scanning: boolean;
  shake: Animated.Value;
  stops: RoadStop[];
}) {
  const theme = useTheme();
  const [width, setWidth] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = stops.find((s) => s.pick.id === selectedId) ?? stops[0];
  const ways = stops.length;

  return (
    <>
      <Animated.View
        style={{
          opacity: shake.interpolate({ inputRange: wobbleSteps, outputRange: flicker }),
          transform: [
            { translateX: shake.interpolate({ inputRange: wobbleSteps, outputRange: jolt }) },
            { skewX: shake.interpolate({ inputRange: wobbleSteps, outputRange: tilt }) },
          ],
        }}
        testID="road-screen">
        <CrtScreen>
          <View style={styles.mapHeading}>
            <ThemedText style={[styles.mapLabel, { color: theme.phosphorDim }]}>◂ JUST STARTING OUT</ThemedText>
            <ThemedText style={[styles.mapLabel, { color: theme.phosphorDim }]}>
              {ways} {ways === 1 ? 'WAY' : 'WAYS'} FORWARD ▸
            </ThemedText>
          </View>
          <View onLayout={(event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width)} style={styles.map}>
            <Terrain width={width} />
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
      </Animated.View>
      <StopDetail nomadName={nomadName} onReach={onReach} stop={selected} />
    </>
  );
}

const ridge: Spot[] = [
  { x: 0, y: 30 },
  { x: 8, y: 27 },
  { x: 17, y: 31 },
  { x: 25, y: 24 },
  { x: 33, y: 29 },
  { x: 45, y: 21 },
  { x: 54, y: 27 },
  { x: 65, y: 19 },
  { x: 76, y: 26 },
  { x: 87, y: 22 },
  { x: 100, y: 27 },
];
const floorColumns = 24;
const floorRows = 9;

function Terrain({ width }: { width: number }) {
  const theme = useTheme();
  const floorWidth = width * 1.8;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={[styles.floor, { left: -width * 0.4, width: floorWidth }]}>
        {Array.from({ length: floorColumns + 1 }, (_, i) => (
          <View
            key={`c${i}`}
            style={[styles.gridColumn, { left: (i * floorWidth) / floorColumns, backgroundColor: theme.grid }]}
          />
        ))}
        {Array.from({ length: floorRows + 1 }, (_, i) => (
          <View key={`r${i}`} style={[styles.gridRow, { top: `${(i * 100) / floorRows}%`, backgroundColor: theme.grid }]} />
        ))}
      </View>
      <View
        style={[
          styles.horizon,
          textureStyle({ image: `linear-gradient(180deg, ${theme.screen} 30%, transparent 100%)` }),
        ]}
      />
      {width > 0 &&
        ridge.slice(1).map((spot, i) => {
          const line = dottedLine(ridge[i], spot, width, mapHeight);
          return (
            <View
              key={i}
              style={[
                styles.ridge,
                {
                  backgroundColor: theme.phosphorDim,
                  left: line.left,
                  top: line.top,
                  transform: [{ rotate: `${line.angle}deg` }],
                  width: line.length + 1,
                },
              ]}
            />
          );
        })}
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
              ? `0px 0px 0px 3px ${theme.screen}, 0px 0px 0px 6px ${theme.you}, 0px 0px 18px ${theme.friend}`
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

function StopDetail({
  nomadName,
  onReach,
  stop,
}: {
  nomadName: string;
  onReach: (stop: Recommendation) => void;
  stop: RoadStop;
}) {
  const theme = useTheme();

  return (
    <View style={styles.detailRow}>
      <CrtScreen style={styles.detailScreen}>
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
      <RateKey onPress={() => onReach(stop.pick)} prompt="WATCHED IT?" testID={`road-rate-${stop.pick.external_id}`} />
    </View>
  );
}

function StripRoad({
  nomadName,
  onReach,
  stops,
}: {
  nomadName: string;
  onReach: (stop: Recommendation) => void;
  stops: RoadStop[];
}) {
  const theme = useTheme();
  const [openId, setOpenId] = useState<string | null>(stops[0].pick.id);
  const open = stops.find((stop) => stop.pick.id === openId) ?? null;

  return (
    <>
      <CrtScreen>
        <View style={styles.strip}>
          <View style={styles.stripRow}>
            <View style={styles.stripRail}>
              <YouAreHere compact />
              <DashedRail />
            </View>
            <ThemedText style={[styles.hereText, { color: theme.you }]}>YOU ARE HERE</ThemedText>
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
      {open ? (
        <RateKey
          onPress={() => onReach(open.pick)}
          prompt={`WATCHED STOP ${open.rank}?`}
          testID={`road-rate-${open.pick.external_id}`}
        />
      ) : (
        <RateKey prompt="OPEN A STOP TO RATE IT" testID="road-rate" />
      )}
    </>
  );
}

function RateKey({ prompt, onPress, testID }: { prompt: string; onPress?: () => void; testID: string }) {
  const theme = useTheme();

  return (
    <View style={styles.rateKey}>
      <Tape label={prompt} tilt={-2} />
      <View style={[styles.rateWell, { backgroundColor: theme.bezel, boxShadow: `inset 0px 3px 6px ${theme.edge}` }]}>
        <ShipButton
          disabled={!onPress}
          label="Rate"
          onPress={onPress ?? (() => undefined)}
          size="big"
          testID={testID}
          variant="orange"
        />
      </View>
    </View>
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
          { backgroundColor: theme.you, borderColor: theme.onAccent, boxShadow: `0px 0px 12px ${theme.you}` },
        ]}
      />
      {!compact && (
        <ThemedText style={[styles.hereLabel, { backgroundColor: theme.screen, color: theme.you }]}>YOU ARE HERE</ThemedText>
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
            backgroundColor: theme.keyTop,
            boxShadow: `0px ${pressed ? 1 : 3}px 0px ${theme.keyShadow}`,
            transform: [{ translateY: pressed ? 2 : 0 }],
          },
        ]}
        testID="road-degauss">
        <ThemedText style={[styles.degaussText, { color: theme.onAccent }]}>DEGAUSS</ThemedText>
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
  detailRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
  detailScreen: {
    flexBasis: 360,
    flexGrow: 999,
    minWidth: 0,
  },
  rateKey: {
    alignItems: 'center',
    flexGrow: 1,
    gap: 10,
  },
  rateWell: {
    alignSelf: 'stretch',
    borderRadius: 8,
    padding: 10,
  },
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
    borderRadius: 3,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  degaussText: {
    fontFamily: Typefaces.tape,
    fontSize: 13,
    letterSpacing: 1.5,
    lineHeight: 16,
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
  floor: {
    bottom: 0,
    height: mapHeight * 1.5,
    position: 'absolute',
    transform: [{ perspective: 500 }, { rotateX: '58deg' }],
    transformOrigin: 'bottom',
  },
  horizon: {
    height: mapHeight * 0.45,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  ridge: {
    height: 1.5,
    position: 'absolute',
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
