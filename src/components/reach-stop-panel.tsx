import { useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { MediaPoster } from '@/components/media-poster';
import { ShipModal } from '@/components/ship-modal';
import { CrtScreen, ShipButton } from '@/components/ship-panel';
import { ThemedText } from '@/components/themed-text';
import type { Stars } from '@/constants/encounters';
import { Spacing, Typefaces } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { encounterColor, encounterFor, randomEncounterIndex, STARS, starsLine } from '@/lib/encounters';
import { fillTemplate, logDate, type LogFill } from '@/lib/nomad-log';
import { cleanReasons, reasonsProblem, type Recommendation } from '@/lib/recommendations';

type ReachStopPanelProps = {
  visible: boolean;
  stop: Recommendation;
  navigator: string;
  onClose: () => void;
  onLog: (stars: Stars, encounter: number, reasons: string[]) => Promise<void>;
};

type Step = 'stars' | 'reasons';

const steps: Step[] = ['stars', 'reasons'];
const stepLabels: Record<Step, string> = { stars: 'STARS', reasons: 'REASONS' };
const useNativeDriver = Platform.OS !== 'web';
const flickerSteps = [0, 0.7, 0.2, 0.9, 0.5, 1];
const punches = [1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1];

export function ReachStopPanel({ visible, stop, navigator, onClose, onLog }: ReachStopPanelProps) {
  const theme = useTheme();
  const [stars, setStars] = useState<Stars | null>(null);
  const [step, setStep] = useState<Step>('stars');
  const [reasons, setReasons] = useState(['', '', '']);
  const [problem, setProblem] = useState<string | null>(null);
  const [focused, setFocused] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [logged, setLogged] = useState<{ stars: Stars; encounter: number; at: Date } | null>(null);
  const [turn] = useState(() => new Animated.Value(1));
  const title = `${stop.title}${stop.year ? ` (${stop.year})` : ''}`;

  async function log() {
    if (saving || stars === null) return;
    const issue = reasonsProblem(reasons);
    if (issue) {
      setProblem(issue);
      return;
    }
    const encounter = randomEncounterIndex(stars);
    setSaving(true);
    setProblem(null);
    try {
      await onLog(stars, encounter, reasons);
      setSaving(false);
      setLogged({ stars, encounter, at: new Date() });
      flipOver();
    } catch (failure) {
      setProblem(failure instanceof Error ? failure.message : 'That log did not go through');
      setSaving(false);
    }
  }

  function flipOver() {
    AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
      if (reduced) return;
      turn.setValue(0);
      Animated.timing(turn, { toValue: 1, duration: 260, easing: Easing.out(Easing.cubic), useNativeDriver }).start();
    });
  }

  function close() {
    setStars(null);
    setStep('stars');
    setReasons(['', '', '']);
    setProblem(null);
    setLogged(null);
    onClose();
  }

  return (
    <ShipModal
      channel="NAV-01"
      closeLabel="Close rating"
      heading={`RATE · ${title.toUpperCase()}`}
      onClose={close}
      testID="reach-stop"
      visible={visible}>
      {logged ? (
        <Animated.View style={[styles.body, { transform: [{ scaleX: turn }] }]}>
          <Reveal
            encounter={logged.encounter}
            fill={{
              date: logDate(logged.at),
              navigator,
              title: stop.title,
              promised: stop.reasons,
              found: cleanReasons(reasons),
            }}
            stars={logged.stars}
          />
          <View style={styles.buttons}>
            <ShipButton label="Back to the road" onPress={close} testID="reach-done" variant="phosphor" />
          </View>
        </Animated.View>
      ) : (
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
                testID={`reach-step-${s}`}>
                {i + 1} · {stepLabels[s]}
              </ThemedText>
            ))}
          </View>

          <View style={[styles.card, { backgroundColor: theme.card }]} testID="reach-card">
            <View style={[styles.cardCorner, { borderTopColor: theme.backgroundElement }]} />
            <View style={styles.stopRow}>
              <MediaPoster item={stop} />
              <ThemedText style={[styles.question, { color: theme.ink }]}>HOW DID IT GO OUT THERE?</ThemedText>
            </View>

            {step === 'stars' && (
              <View accessibilityLabel="Stars" accessibilityRole="radiogroup" style={styles.stars}>
                {STARS.map((n) => {
                  const lit = stars !== null && n <= stars;
                  return (
                    <Pressable
                      accessibilityLabel={`${n} ${n === 1 ? 'star' : 'stars'}`}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: stars === n }}
                      key={n}
                      onPress={() => setStars(n)}
                      style={({ pressed }) => [
                        styles.star,
                        { backgroundColor: pressed ? theme.backgroundSelected : 'transparent', borderColor: theme.ink },
                      ]}
                      testID={`reach-star-${n}`}>
                      <ThemedText style={[styles.starText, { color: lit ? theme.ink : theme.cardInk }]}>
                        {lit ? '★' : '☆'}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
            )}

            {step === 'reasons' && (
              <View style={styles.reasons}>
                <ThemedText style={[styles.question, { color: theme.ink }]}>WHAT DID YOU FIND OUT THERE?</ThemedText>
                <ThemedText style={[styles.help, { color: theme.inkSecondary }]} testID="reach-reasons-help">
                  Help your navigator get you safely through this Wasteland! Give good reasons so that they can tailor their
                  navigation to your specific desires!
                </ThemedText>
                {reasons.map((reason, i) => (
                  <View key={i} style={styles.field}>
                    <ThemedText style={[styles.label, { color: theme.cardInk }]}>
                      {i === 0 ? 'FOUND 1 · REQUIRED' : `FOUND ${i + 1} · OPTIONAL`}
                    </ThemedText>
                    <TextInput
                      accessibilityLabel={i === 0 ? 'Found 1 (required)' : `Found ${i + 1} (optional)`}
                      maxLength={140}
                      onBlur={() => setFocused(null)}
                      onChangeText={(text) => {
                        setReasons(reasons.map((r, j) => (j === i ? text : r)));
                        setProblem(null);
                      }}
                      onFocus={() => setFocused(i)}
                      placeholder={i === 0 && focused !== 0 ? 'Something you found at this stop' : ''}
                      placeholderTextColor={theme.cardInk}
                      style={[styles.input, { borderBottomColor: focused === i ? theme.signal : theme.ink, color: theme.ink }]}
                      testID={`reach-reason-${i + 1}`}
                      value={reason}
                    />
                  </View>
                ))}
              </View>
            )}

            <View style={styles.punches}>
              {punches.map((punched, i) => (
                <View
                  key={i}
                  style={[styles.punch, punched ? { backgroundColor: theme.ink } : { borderColor: theme.cardInk, borderWidth: 1 }]}
                />
              ))}
            </View>
          </View>

          {problem && (
            <ThemedText style={[styles.problem, { color: theme.alert }]} testID="reach-error">
              {problem}
            </ThemedText>
          )}

          {step === 'stars' && stars !== null && (
            <View style={styles.buttons}>
              <ShipButton label="Next: reasons" onPress={() => setStep('reasons')} testID="reach-to-reasons" variant="phosphor" />
            </View>
          )}

          {step === 'reasons' && (
            <View style={styles.buttons}>
              <ShipButton label="Back to stars" onPress={() => setStep('stars')} testID="reach-back-to-stars" variant="panel" />
              <ShipButton disabled={saving} label="Log it" onPress={log} testID="reach-log" variant="orange" />
            </View>
          )}
        </View>
      )}
    </ShipModal>
  );
}

function Reveal({ stars, encounter, fill }: { stars: Stars; encounter: number; fill: LogFill }) {
  const theme = useTheme();
  const { title, story } = encounterFor(stars, encounter);
  const color = theme[encounterColor(stars)];
  const pieces = fillTemplate(story, fill);
  const [flicker] = useState(() => new Animated.Value(1));

  useEffect(() => {
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
      if (cancelled || reduced) return;
      flicker.setValue(0);
      Animated.timing(flicker, { toValue: 1, duration: 420, delay: 260, easing: Easing.linear, useNativeDriver }).start();
    });
    return () => {
      cancelled = true;
    };
  }, [flicker]);

  return (
    <CrtScreen>
      <View style={styles.reveal} testID="reach-reveal">
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
            {title.toUpperCase()}
          </ThemedText>
        </Animated.View>
        <ThemedText style={[styles.story, { color: theme.phosphor, textShadowColor: theme.phosphorDim }]} testID="reach-reveal-story">
          {pieces.map((piece, i) =>
            piece.kind === 'text' ? (
              piece.text
            ) : (
              <ThemedText
                key={i}
                style={[styles.redacted, { backgroundColor: theme.phosphorDim, color: theme.screen }]}
                testID="reach-reveal-redacted">
                {'\u00A0REDACTED\u00A0'}
              </ThemedText>
            ),
          )}
        </ThemedText>
      </View>
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
  card: {
    gap: 14,
    overflow: 'hidden',
    padding: 18,
    paddingLeft: 22,
  },
  cardCorner: {
    borderRightColor: 'transparent',
    borderRightWidth: 24,
    borderTopWidth: 24,
    height: 0,
    left: 0,
    position: 'absolute',
    top: 0,
    width: 0,
  },
  punches: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  punch: {
    borderRadius: 1,
    height: 14,
    width: 7,
  },
  problem: {
    fontFamily: Typefaces.screen,
    fontSize: 22,
    lineHeight: 26,
  },
  reveal: {
    gap: 14,
  },
  story: {
    fontFamily: Typefaces.screen,
    fontSize: 21,
    lineHeight: 26,
    textShadowRadius: 4,
  },
  redacted: {
    fontFamily: Typefaces.tape,
    fontSize: 14,
    letterSpacing: 2,
    textShadowRadius: 0,
  },
  stopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  question: {
    flex: 1,
    fontFamily: Typefaces.display,
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
  reasons: {
    gap: 12,
  },
  help: {
    fontFamily: Typefaces.label,
    fontSize: 14,
    lineHeight: 20,
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
    borderBottomWidth: 2,
    fontFamily: Typefaces.label,
    fontSize: 17,
    height: 40,
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
