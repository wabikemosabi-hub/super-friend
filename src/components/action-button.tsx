import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing, Typefaces } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ActionButtonProps = {
  label: string;
  onPress: () => void;
  testID: string;
};

export function ActionButton({ label, onPress, testID }: ActionButtonProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: theme.keyTop,
          boxShadow: `0px ${pressed ? 1 : 4}px 0px ${theme.keyShadow}`,
          transform: [{ translateY: pressed ? 3 : 0 }],
        },
      ]}>
      <ThemedText style={[styles.label, { color: theme.onAccent }]}>{label}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 4,
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
  },
  label: {
    fontFamily: Typefaces.tape,
    fontSize: 18,
    letterSpacing: 1.5,
    lineHeight: 22,
    textTransform: 'uppercase',
  },
});
