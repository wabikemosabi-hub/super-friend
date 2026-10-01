import { Platform, StyleSheet, Text, type TextProps } from 'react-native';

import { Fonts, ThemeColor, Typefaces } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'small' | 'smallBold' | 'subtitle' | 'link' | 'linkPrimary' | 'code';
  themeColor?: ThemeColor;
};

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();

  return (
    <Text
      style={[
        { color: theme[themeColor ?? 'text'] },
        type === 'default' && styles.default,
        type === 'title' && styles.title,
        type === 'small' && styles.small,
        type === 'smallBold' && styles.smallBold,
        type === 'subtitle' && styles.subtitle,
        type === 'link' && styles.link,
        type === 'linkPrimary' && styles.linkPrimary,
        type === 'code' && styles.code,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  small: {
    fontFamily: Typefaces.label,
    fontSize: 14,
    lineHeight: 20,
  },
  smallBold: {
    fontFamily: Typefaces.labelBold,
    fontSize: 14,
    lineHeight: 20,
  },
  default: {
    fontFamily: Typefaces.label,
    fontSize: 16,
    lineHeight: 24,
  },
  title: {
    fontFamily: Typefaces.display,
    fontSize: 40,
    lineHeight: 48,
    letterSpacing: 1,
  },
  subtitle: {
    fontFamily: Typefaces.display,
    fontSize: 24,
    lineHeight: 32,
  },
  link: {
    fontFamily: Typefaces.label,
    lineHeight: 30,
    fontSize: 14,
  },
  linkPrimary: {
    lineHeight: 30,
    fontSize: 14,
    color: '#3c87f7',
  },
  code: {
    fontFamily: Fonts.mono,
    fontWeight: Platform.select({ android: 700 }) ?? 500,
    fontSize: 12,
  },
});
