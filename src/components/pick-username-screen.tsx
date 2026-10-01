import { useState } from 'react';
import { StyleSheet, TextInput } from 'react-native';

import { ActionButton } from '@/components/action-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { usernameProblem } from '@/lib/username';

type PickUsernameScreenProps = {
  onSubmit: (username: string) => Promise<string | null>;
  onSignOut: () => void;
};

export function PickUsernameScreen({ onSignOut }: PickUsernameScreenProps) {
  const theme = useTheme();
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleContinue() {
    setError(usernameProblem(username));
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle">Pick a username</ThemedText>
      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        onChangeText={setUsername}
        placeholder="Username"
        placeholderTextColor={theme.textSecondary}
        style={[styles.input, { backgroundColor: theme.backgroundElement, color: theme.text }]}
        testID="pick-username-input"
        value={username}
      />
      {error && <ThemedText testID="pick-username-error">{error}</ThemedText>}
      <ActionButton label="Continue" onPress={handleContinue} testID="pick-username-continue" />
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
  input: {
    borderRadius: Spacing.three,
    minWidth: 240,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
});
