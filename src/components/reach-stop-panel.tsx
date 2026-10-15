import { useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Platform, Pressable, StyleSheet, View } from 'react-native';

import { MediaPoster } from '@/components/media-poster';
import { ShipModal } from '@/components/ship-modal';
import { CrtScreen, ScreenLine } from '@/components/ship-panel';
import { ThemedText } from '@/components/themed-text';
import type { Stars } from '@/constants/encounters';
import { Spacing, Typefaces } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { encounterColor, encounterFor, randomEncounterIndex, STARS, starsLine } from '@/lib/encounters';
import type { Recommendation } from '@/lib/recommendations';

type ReachStopPanelProps = {
  visible: boolean;
  stop: Recommendation;
  onClose: () => void;
};

type Step = 'stars' | 'reasons' | 'when';

const steps: Step[] = ['stars', 'reasons', 'when'];
const stepLabels: Record<Step, string> = { stars: 'STARS', reasons: 'REASONS', when: 'WHEN' };
const useNativeDriver = Platform.OS !== 'web';
const flickerSteps = [0, 0.7, 0.2, 0.9, 0.5, 1];

export function ReachStopPanel({ visible, stop, onClose }: ReachStopPanelProps) {
  const theme = useTheme();
  const [stars, setStars] = useState<Stars | null>(null);
  const [encounter, setEncounter] = useState(0);
  const title = `${stop.title}${stop.year ? ` (${stop.year})` : ''}`;

  function pick(next: Stars) {
    if (next === stars) return;
    setStars(next);
    setEncounter(randomEncounterIndex(next));
  }

  function close() {
    setStars(null);
    setEncounter(0);
    onClose();
  }

  return (
    <ShipModal
      channel="NAV-01"
      closeLabel="Close current position"
      heading={`CURRENT POSITION · ${title.toUpperCase()}`}
      onClose={close}
      testID="reach-stop"
      visible={visible}>
      <View style={styles.body}>
        <View style={styles.steps}>
          {steps.map((s, i) => (
            <ThemedText
              key={s}
              style={[
                styles.step,
                s === 'stars'
                  ? { backgroundColor: theme.hazard, color: theme.onAccent }
                  : { backgroundColor: theme.screen, color: theme.textSecondary },
              ]}
              testID={`reach-step-${s}`}>
              {i + 1} · {stepLabels[s]}
            </ThemedText>
          ))}
        </View>

        <View style={styles.stopRow}>
          <MediaPoster item={stop} />
          <ThemedText style={[styles.question, { color: theme.hazard }]}>HOW DID IT GO OUT THERE?</ThemedText>
        </View>

        <View accessibilityLabel="Stars" accessibilityRole="radiogroup" style={styles.stars}>
          {STARS.map((n) => {
            const lit = stars !== null && n <= stars;
            return (
              <Pressable
                accessibilityLabel={`${n} ${n === 1 ? 'star' : 'stars'}`}
                accessibilityRole="radio"
                accessibilityState={{ checked: stars === n }}
                key={n}
                onPress={() => pick(n)}
                style={({ pressed }) => [
                  styles.star,
                  { backgroundColor: pressed ? theme.backgroundSelected : theme.screen, borderColor: theme.bezel },
                ]}
                testID={`reach-star-${n}`}>
                <ThemedText style={[styles.starText, { color: lit ? theme.hazard : theme.textSecondary }]}>
                  {lit ? '★' : '☆'}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>

        {stars === null ? (
          <CrtScreen>
            <ScreenLine text="PICK YOUR STARS. THE ROAD DECIDES WHAT HAPPENED." testID="reach-stars-prompt" />
          </CrtScreen>
        ) : (
          <EncounterCard encounter={encounter} stars={stars} />
        )}
      </View>
    </ShipModal>
  );
}

function EncounterCard({ stars, encounter }: { stars: Stars; encounter: number }) {
  const theme = useTheme();
  const color = theme[encounterColor(stars)];
  const [flicker] = useState(() => new Animated.Value(1));

  useEffect(() => {
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
      if (cancelled || reduced) return;
      flicker.setValue(0);
      Animated.timing(flicker, { toValue: 1, duration: 420, easing: Easing.linear, useNativeDriver }).start();
    });
    return () => {
      cancelled = true;
    };
  }, [flicker, stars, encounter]);

  return (
    <CrtScreen>
      <Animated.View
        style={[
          styles.encounter,
          {
            borderColor: color,
            boxShadow: `0px 0px 12px ${color}`,
            opacity: flicker.interpolate({ inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1], outputRange: flickerSteps }),
          },
        ]}
        testID="reach-encounter">
        <ThemedText style={[styles.encounterStars, { color: theme.hazard }]} testID="reach-encounter-stars">
          {starsLine(stars)}
        </ThemedText>
        <ThemedText style={[styles.encounterTitle, { color }]} testID="reach-encounter-title">
          {encounterFor(stars, encounter).title.toUpperCase()}
        </ThemedText>
      </Animated.View>
    </CrtScreen>
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
  stopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  question: {
    flex: 1,
    fontFamily: Typefaces.screen,
    fontSize: 24,
    lineHeight: 26,
  },
  stars: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  star: {
    alignItems: 'center',
    borderRadius: 4,
    borderWidth: 2,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  starText: {
    fontSize: 30,
    lineHeight: 34,
  },
  encounter: {
    borderRadius: 4,
    borderWidth: 2,
    gap: 4,
    padding: 14,
  },
  encounterStars: {
    fontFamily: Typefaces.screen,
    fontSize: 22,
    lineHeight: 24,
  },
  encounterTitle: {
    fontFamily: Typefaces.screen,
    fontSize: 32,
    lineHeight: 34,
  },
});
