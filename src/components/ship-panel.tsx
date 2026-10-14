import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing, Typefaces } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ShipPanelProps = {
  channel: string;
  title: string;
  badge?: ReactNode;
  children: ReactNode;
  testID: string;
};

export function ShipPanel({ channel, title, badge, children, testID }: ShipPanelProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.panel,
        { backgroundColor: theme.backgroundElement, borderColor: theme.edge, boxShadow: `0px 6px 0px ${theme.edge}` },
      ]}
      testID={testID}>
      <Rivet side="left" />
      <Rivet side="right" />
      <View style={styles.heading}>
        <Plate label={channel} />
        <ThemedText accessibilityRole="header" style={styles.title}>
          {title.toUpperCase()}
        </ThemedText>
        {badge}
      </View>
      {children}
    </View>
  );
}

function Rivet({ side }: { side: 'left' | 'right' }) {
  const theme = useTheme();
  return <View style={[styles.rivet, side === 'left' ? styles.rivetLeft : styles.rivetRight, { backgroundColor: theme.edge }]} />;
}

export function Plate({ label }: { label: string }) {
  const theme = useTheme();

  return (
    <View style={[styles.plate, { backgroundColor: theme.hazard }]}>
      <ThemedText style={[styles.plateText, { color: theme.onAccent }]}>{label}</ThemedText>
    </View>
  );
}

export function CrtScreen({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const theme = useTheme();

  return (
    <View style={[styles.screen, { backgroundColor: theme.screen, borderColor: theme.edge }, style]}>
      <View style={[styles.bezel, { borderColor: theme.bezel }]}>{children}</View>
    </View>
  );
}

type ShipButtonProps = {
  label: string;
  onPress: () => void;
  testID: string;
  variant?: 'hazard' | 'phosphor' | 'panel' | 'alert';
  disabled?: boolean;
};

export function ShipButton({ label, onPress, testID, variant = 'hazard', disabled = false }: ShipButtonProps) {
  const theme = useTheme();
  const fill = { hazard: theme.hazard, phosphor: theme.phosphor, panel: theme.backgroundSelected, alert: theme.alert }[variant];
  const ink = variant === 'panel' ? theme.text : theme.onAccent;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: fill,
          borderColor: theme.edge,
          boxShadow: `0px 4px 0px ${theme.edge}`,
          opacity: disabled ? 0.5 : 1,
          transform: [{ translateY: pressed ? 3 : 0 }],
        },
      ]}
      testID={testID}>
      <ThemedText style={[styles.buttonText, { color: ink }]}>{label.toUpperCase()}</ThemedText>
    </Pressable>
  );
}

export function ScreenLine({ text, color, testID }: { text: string; color?: string; testID: string }) {
  const theme = useTheme();

  return (
    <ThemedText style={[styles.screenLine, { color: color ?? theme.phosphor }]} testID={testID}>
      {text}
    </ThemedText>
  );
}

const stripeCount = 80;

export function HazardStripe() {
  const theme = useTheme();

  return (
    <View style={styles.stripe}>
      {Array.from({ length: stripeCount }, (_, i) => (
        <View
          key={i}
          style={[styles.stripeBand, { backgroundColor: i % 2 === 0 ? theme.hazard : theme.onAccent }]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderRadius: 6,
    borderWidth: 2,
    gap: 14,
    paddingBottom: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingTop: 18,
  },
  rivet: {
    borderRadius: 3,
    height: 6,
    position: 'absolute',
    top: 6,
    width: 6,
  },
  rivetLeft: {
    left: 6,
  },
  rivetRight: {
    right: 6,
  },
  heading: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  title: {
    flex: 1,
    fontFamily: Typefaces.display,
    fontSize: 15,
    letterSpacing: 0.6,
    lineHeight: 20,
  },
  plate: {
    borderRadius: 2,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
  },
  plateText: {
    fontFamily: Typefaces.labelBold,
    fontSize: 12,
    letterSpacing: 1.2,
    lineHeight: 16,
  },
  screen: {
    borderRadius: 4,
    borderWidth: 2,
    overflow: 'hidden',
  },
  bezel: {
    borderRadius: 2,
    borderWidth: 4,
    padding: Spacing.two,
  },
  button: {
    alignItems: 'center',
    borderRadius: 3,
    borderWidth: 2,
    height: 48,
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
  },
  buttonText: {
    fontFamily: Typefaces.labelBold,
    fontSize: 14,
    letterSpacing: 0.8,
    lineHeight: 20,
  },
  screenLine: {
    fontFamily: Typefaces.screen,
    fontSize: 22,
    lineHeight: 26,
  },
  stripe: {
    flexDirection: 'row',
    height: 14,
    overflow: 'hidden',
  },
  stripeBand: {
    height: 14,
    transform: [{ skewX: '-45deg' }],
    width: 20,
  },
});
