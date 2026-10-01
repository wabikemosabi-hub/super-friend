import { StyleSheet } from 'react-native';

import { ActionButton } from '@/components/action-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

type PickUsernameScreenProps = {
  onSignOut: () => void;
};

export function PickUsernameScreen({ onSignOut }: PickUsernameScreenProps) {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle">Pick a username</ThemedText>
      <ThemedText>Coming soon: choose your username and avatar here.</ThemedText>
      <ActionButton label="Sign out" onPress={onSignOut} testID="pick-username-sign-out" />
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
