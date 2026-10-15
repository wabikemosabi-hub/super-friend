import '@/global.css';

import { Platform } from 'react-native';

const crawlerBridge = {
  background: '#16140F',
  backgroundElement: '#CFC6B0',
  backgroundSelected: '#BDB49D',
  edge: '#0B0A07',
  panelEdge: '#8F8670',
  text: '#E9E3D3',
  textSecondary: '#A39C88',
  ink: '#2A261D',
  inkSecondary: '#5C5546',
  screen: '#030805',
  bezel: '#24211A',
  phosphor: '#7CFF8A',
  phosphorDim: '#3E9E52',
  amber: '#FFB43A',
  amberScreen: '#170D02',
  hazard: '#E8B629',
  orange: '#F07A1A',
  alert: '#D9412B',
  signal: '#2F5F9E',
  you: '#FFB43A',
  friend: '#6FD3E6',
  onAccent: '#1D1A14',
  scrim: '#000000B3',
  grid: '#7CFF8A55',
  tape: '#141414',
  tapeText: '#F1EFE8',
  paper: '#F1EEDF',
  paperBar: '#D9E8CF',
  printInk: '#3B372E',
  card: '#EFE3C2',
  cardInk: '#6B5A3A',
  lampOff: '#4A453A',
  screwLight: '#E9E3D3',
  screwDark: '#8A826D',
  keyTop: '#E9E2CF',
  keyShadow: '#6D6553',
  sheen: '#FFFFFF55',
  shade: '#00000024',
  scanline: '#00000059',
  vignette: '#00000099',
  grime: '#3C2D1438',
} as const;

export const Colors = {
  light: crawlerBridge,
  dark: crawlerBridge,
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Typefaces = {
  display: 'BarlowCondensed_800ExtraBold',
  tape: 'BarlowCondensed_700Bold',
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
