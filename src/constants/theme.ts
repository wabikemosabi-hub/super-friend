import '@/global.css';

import { Platform } from 'react-native';

const shipComputer = {
  background: '#0C0E0F',
  backgroundElement: '#2D3230',
  backgroundSelected: '#3B413E',
  edge: '#111413',
  text: '#E4E6DE',
  textSecondary: '#A9B0A6',
  screen: '#030605',
  bezel: '#1A1F1D',
  phosphor: '#79F59A',
  phosphorDim: '#4FC777',
  hazard: '#F2B705',
  alert: '#E8342B',
  neon: '#FF3D9A',
  you: '#FF3D9A',
  friend: '#3DD6F5',
  onAccent: '#0C0E0F',
  scrim: '#000000B3',
  grid: '#79F59A12',
} as const;

export const Colors = {
  light: shipComputer,
  dark: shipComputer,
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Typefaces = {
  display: 'Michroma_400Regular',
  label: 'SpaceMono_400Regular',
  labelBold: 'SpaceMono_700Bold',
  screen: 'VT323_400Regular',
} as const;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
