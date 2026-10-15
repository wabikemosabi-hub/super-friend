import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing, Typefaces, type ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { scanlines, textureStyle } from '@/lib/textures';

export type Pictogram = 'up' | 'page' | 'crosshair' | 'warning' | 'bars';

type ShipPanelProps = {
  channel: string;
  title: string;
  icon?: Pictogram;
  tape?: string;
  badge?: ReactNode;
  children: ReactNode;
  testID: string;
};

const plateColors: Record<Pictogram, ThemeColor> = {
  up: 'signal',
  page: 'hazard',
  crosshair: 'alert',
  warning: 'hazard',
  bars: 'signal',
};

export function ShipPanel({ channel, title, icon, tape, badge, children, testID }: ShipPanelProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.panel,
        {
          backgroundColor: theme.backgroundElement,
          borderColor: theme.panelEdge,
          boxShadow: `0px 6px 0px ${theme.edge}`,
        },
      ]}
      testID={testID}>
      <Grime />
      <Screws />
      <View style={styles.heading}>
        {icon && <PictogramPlate kind={icon} />}
        <ThemedText accessibilityRole="header" style={[styles.title, { color: theme.ink }]}>
          {channel} · {title.toUpperCase()}
        </ThemedText>
        {tape && <Tape label={tape} />}
        {badge && <View style={styles.badge}>{badge}</View>}
      </View>
      {children}
    </View>
  );
}

function Grime() {
  const theme = useTheme();

  return (
    <View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        styles.rounded,
        textureStyle({
          image: `linear-gradient(180deg, ${theme.sheen} 0%, transparent 18%, transparent 70%, ${theme.grime} 100%)`,
        }),
      ]}
    />
  );
}

export function Screws() {
  return (
    <>
      <Screw style={styles.screwTopLeft} />
      <Screw style={styles.screwTopRight} />
      <Screw style={styles.screwBottomLeft} />
      <Screw style={styles.screwBottomRight} />
    </>
  );
}

function Screw({ style }: { style: ViewStyle }) {
  const theme = useTheme();

  return (
    <View pointerEvents="none" style={[styles.screw, { backgroundColor: theme.screwDark, borderColor: theme.screwLight }, style]}>
      <View style={[styles.screwSlot, { backgroundColor: theme.ink }]} />
    </View>
  );
}

export function Plate({ label }: { label: string }) {
  const theme = useTheme();

  return (
    <View style={[styles.plate, { backgroundColor: theme.hazard }]}>
      <ThemedText style={[styles.plateText, { color: theme.onAccent }]}>{label}</ThemedText>
    </View>
  );
}

export function Tape({ label, tilt = -1 }: { label: string; tilt?: number }) {
  const theme = useTheme();

  return (
    <View style={[styles.tape, { backgroundColor: theme.tape, transform: [{ rotate: `${tilt}deg` }] }]}>
      <ThemedText style={[styles.tapeText, { color: theme.tapeText }]}>{label.toUpperCase()}</ThemedText>
    </View>
  );
}

export function PictogramPlate({ kind }: { kind: Pictogram }) {
  const theme = useTheme();
  const fill = theme[plateColors[kind]];
  const ink = plateColors[kind] === 'hazard' ? theme.onAccent : theme.paper;

  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[styles.pictogram, { backgroundColor: fill }]}>
      {kind === 'up' && (
        <>
          <View style={[styles.arrowShaft, { backgroundColor: ink }]} />
          <View style={[styles.arrowHead, { borderColor: ink }]} />
        </>
      )}
      {kind === 'page' && (
        <View style={[styles.page, { borderColor: ink }]}>
          <View style={[styles.pageLine, { backgroundColor: ink }]} />
          <View style={[styles.pageLine, { backgroundColor: ink }]} />
          <View style={[styles.pageLine, styles.pageLineShort, { backgroundColor: ink }]} />
        </View>
      )}
      {kind === 'crosshair' && (
        <View style={[styles.ring, { borderColor: ink }]}>
          <View style={[styles.dot, { backgroundColor: ink }]} />
        </View>
      )}
      {kind === 'warning' && (
        <>
          <View style={[styles.triangle, { borderBottomColor: ink }]} />
          <View style={[styles.bang, { backgroundColor: fill }]} />
        </>
      )}
      {kind === 'bars' && (
        <View style={styles.bars}>
          <View style={[styles.bar, styles.barLow, { backgroundColor: ink }]} />
          <View style={[styles.bar, styles.barMid, { backgroundColor: ink }]} />
          <View style={[styles.bar, styles.barHigh, { backgroundColor: ink }]} />
        </View>
      )}
    </View>
  );
}

export function Lamp({ on, color = 'phosphor' }: { on: boolean; color?: ThemeColor }) {
  const theme = useTheme();
  const glow = theme[color];

  return (
    <View
      style={[
        styles.lamp,
        on
          ? { backgroundColor: glow, borderColor: theme.ink, boxShadow: `0px 0px 10px ${glow}` }
          : { backgroundColor: theme.lampOff, borderColor: theme.ink },
      ]}
    />
  );
}

export function Readout({ children, testID }: { children: ReactNode; testID?: string }) {
  const theme = useTheme();

  return (
    <View style={[styles.readoutBezel, { backgroundColor: theme.bezel }]}>
      <View style={[styles.readout, { backgroundColor: theme.amberScreen }]}>
        <ThemedText
          style={[styles.readoutText, { color: theme.amber, textShadowColor: theme.amber }]}
          testID={testID}>
          {children}
        </ThemedText>
      </View>
    </View>
  );
}

export function CrtScreen({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.bezel,
        { backgroundColor: theme.bezel, boxShadow: `inset 0px 3px 6px ${theme.edge}, 0px 1px 0px ${theme.sheen}` },
        style,
      ]}>
      <View style={[styles.screen, { backgroundColor: theme.screen }]}>
        {children}
        <View pointerEvents="none" style={[StyleSheet.absoluteFill, textureStyle(scanlines(theme.scanline))]} />
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            textureStyle({ image: `radial-gradient(ellipse at center, transparent 55%, ${theme.vignette} 100%)` }),
          ]}
        />
      </View>
    </View>
  );
}

type ShipButtonProps = {
  label: string;
  onPress: () => void;
  testID: string;
  variant?: 'hazard' | 'phosphor' | 'panel' | 'alert' | 'orange';
  size?: 'normal' | 'big';
  disabled?: boolean;
};

export function ShipButton({ label, onPress, testID, variant = 'hazard', size = 'normal', disabled = false }: ShipButtonProps) {
  const theme = useTheme();
  const face = { hazard: theme.hazard, phosphor: theme.phosphor, panel: theme.keyTop, alert: theme.alert, orange: theme.orange }[variant];
  const glow = variant === 'phosphor' || variant === 'orange' ? `, 0px 0px 16px ${face}` : '';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        size === 'big' && styles.bigButton,
        {
          backgroundColor: face,
          boxShadow: `0px ${pressed ? 1 : 4}px 0px ${theme.keyShadow}${disabled ? '' : glow}`,
          opacity: disabled ? 0.5 : 1,
          transform: [{ translateY: pressed ? 3 : 0 }],
        },
      ]}
      testID={testID}>
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          styles.buttonFace,
          textureStyle({ image: `linear-gradient(180deg, ${theme.sheen} 0%, transparent 45%, ${theme.shade} 100%)` }),
        ]}
      />
      <ThemedText style={[styles.buttonText, size === 'big' && styles.bigButtonText, { color: theme.onAccent }]}>
        {label.toUpperCase()}
      </ThemedText>
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
    padding: 20,
  },
  rounded: {
    borderRadius: 4,
  },
  heading: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  title: {
    flexShrink: 1,
    fontFamily: Typefaces.display,
    fontSize: 24,
    letterSpacing: 0.5,
    lineHeight: 26,
  },
  badge: {
    marginLeft: 'auto',
  },
  screw: {
    alignItems: 'center',
    borderRadius: 5,
    borderWidth: 2,
    height: 10,
    justifyContent: 'center',
    position: 'absolute',
    width: 10,
  },
  screwSlot: {
    height: 1.5,
    transform: [{ rotate: '35deg' }],
    width: 6,
  },
  screwTopLeft: {
    left: 6,
    top: 6,
  },
  screwTopRight: {
    right: 6,
    top: 6,
  },
  screwBottomLeft: {
    bottom: 6,
    left: 6,
  },
  screwBottomRight: {
    bottom: 6,
    right: 6,
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
  tape: {
    borderRadius: 2,
    paddingHorizontal: 9,
    paddingVertical: 2,
  },
  tapeText: {
    fontFamily: Typefaces.tape,
    fontSize: 14,
    letterSpacing: 2,
    lineHeight: 18,
  },
  pictogram: {
    alignItems: 'center',
    borderRadius: 3,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  arrowShaft: {
    height: 18,
    position: 'absolute',
    top: 10,
    width: 3,
  },
  arrowHead: {
    borderLeftWidth: 3,
    borderTopWidth: 3,
    height: 12,
    position: 'absolute',
    top: 9,
    transform: [{ rotate: '45deg' }],
    width: 12,
  },
  page: {
    borderWidth: 2,
    gap: 3,
    height: 24,
    paddingHorizontal: 3,
    paddingTop: 4,
    width: 18,
  },
  pageLine: {
    height: 2,
  },
  pageLineShort: {
    width: 6,
  },
  ring: {
    alignItems: 'center',
    borderRadius: 11,
    borderWidth: 3,
    height: 22,
    justifyContent: 'center',
    width: 22,
  },
  dot: {
    borderRadius: 2,
    height: 4,
    width: 4,
  },
  triangle: {
    borderBottomWidth: 22,
    borderLeftColor: 'transparent',
    borderLeftWidth: 13,
    borderRightColor: 'transparent',
    borderRightWidth: 13,
    height: 0,
    width: 0,
  },
  bang: {
    height: 9,
    position: 'absolute',
    top: 15,
    width: 3,
  },
  bars: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 3,
    height: 20,
  },
  bar: {
    width: 5,
  },
  barLow: {
    height: 7,
  },
  barMid: {
    height: 13,
  },
  barHigh: {
    height: 20,
  },
  lamp: {
    borderRadius: 7,
    borderWidth: 2,
    height: 14,
    width: 14,
  },
  readoutBezel: {
    borderRadius: 4,
    padding: 4,
  },
  readout: {
    borderRadius: 2,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  readoutText: {
    fontFamily: Typefaces.screen,
    fontSize: 20,
    letterSpacing: 1,
    lineHeight: 24,
    textShadowRadius: 6,
  },
  bezel: {
    borderRadius: 10,
    padding: 8,
  },
  screen: {
    borderRadius: 8,
    overflow: 'hidden',
    padding: 12,
  },
  button: {
    alignItems: 'center',
    borderRadius: 4,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: Spacing.three,
  },
  bigButton: {
    borderRadius: 6,
    minHeight: 76,
    paddingHorizontal: 36,
  },
  bigButtonText: {
    fontSize: 32,
    letterSpacing: 3,
    lineHeight: 36,
  },
  buttonFace: {
    borderRadius: 4,
  },
  buttonText: {
    fontFamily: Typefaces.tape,
    fontSize: 18,
    letterSpacing: 1.5,
    lineHeight: 22,
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
