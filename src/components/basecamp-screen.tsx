import { StyleSheet } from 'react-native';

import { ActionButton } from '@/components/action-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

type BasecampScreenProps = {
  username: string;
  onSignOut: () => void;
};

export function BasecampScreen({ username, onSignOut }: BasecampScreenProps) {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle" testID="basecamp-greeting">
        Welcome to Basecamp, {username}
      </ThemedText>
      <ActionButton label="Sign out" onPress={onSignOut} testID="basecamp-sign-out" />
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
