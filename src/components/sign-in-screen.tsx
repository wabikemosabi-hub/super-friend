import { StyleSheet } from 'react-native';

import { ActionButton } from '@/components/action-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

type SignInScreenProps = {
  onContinueWithGoogle: () => void;
};

export function SignInScreen({ onContinueWithGoogle }: SignInScreenProps) {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle">Media Advisory Board</ThemedText>
      <ActionButton
        label="Continue with Google"
        onPress={onContinueWithGoogle}
        testID="sign-in-google"
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    gap: Spacing.four,
    justifyContent: 'center',
    padding: Spacing.four,
  },
});
