import { useState } from 'react';
import { StyleSheet, TextInput } from 'react-native';

import { ActionButton } from '@/components/action-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type SignInScreenProps = {
  onContinueWithGoogle: () => void;
  onSignInWithEmail?: (email: string, password: string) => Promise<void>;
};

export function SignInScreen({ onContinueWithGoogle, onSignInWithEmail }: SignInScreenProps) {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle">Media Advisory Board</ThemedText>
      <ActionButton
        label="Continue with Google"
        onPress={onContinueWithGoogle}
        testID="sign-in-google"
      />
      {onSignInWithEmail && <EmailSignIn onSignIn={onSignInWithEmail} />}
    </ThemedView>
  );
}

function EmailSignIn({ onSignIn }: { onSignIn: (email: string, password: string) => Promise<void> }) {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function handleSignIn() {
    setError(null);
    try {
      await onSignIn(email.trim(), password);
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : 'Sign in failed');
    }
  }

  const inputStyle = [styles.input, { backgroundColor: theme.backgroundElement, color: theme.text }];

  return (
    <ThemedView style={styles.emailSignIn}>
      <ThemedText type="small">DEV ONLY: test nomads</ThemedText>
      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        inputMode="email"
        onChangeText={setEmail}
        placeholder="Email"
        placeholderTextColor={theme.textSecondary}
        style={inputStyle}
        testID="email-sign-in-email"
        value={email}
      />
      <TextInput
        autoCapitalize="none"
        onChangeText={setPassword}
        onSubmitEditing={handleSignIn}
        placeholder="Password"
        placeholderTextColor={theme.textSecondary}
        secureTextEntry
        style={inputStyle}
        testID="email-sign-in-password"
        value={password}
      />
      {error && <ThemedText testID="email-sign-in-error">{error}</ThemedText>}
      <ActionButton label="Sign in" onPress={handleSignIn} testID="email-sign-in-submit" />
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
  emailSignIn: {
    alignItems: 'center',
    gap: Spacing.three,
  },
  input: {
    borderRadius: Spacing.three,
    minWidth: 240,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
});
