import { useEffect, useState } from 'react';
import { Image, StyleSheet, TextInput } from 'react-native';

import { ActionButton } from '@/components/action-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { PickedAvatar } from '@/lib/avatar';
import { usernameProblem } from '@/lib/username';

type PickUsernameScreenProps = {
  checkUsername: (username: string) => Promise<boolean>;
  onSubmit: (username: string, avatar: PickedAvatar) => Promise<string | null>;
  onSignOut: () => void;
  pickAvatar: () => Promise<PickedAvatar | null>;
};

export function PickUsernameScreen({
  checkUsername,
  onSubmit,
  onSignOut,
  pickAvatar,
}: PickUsernameScreenProps) {
  const theme = useTheme();
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [availability, setAvailability] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<PickedAvatar | null>(null);

  useEffect(() => {
    if (usernameProblem(username)) return;
    let current = true;
    const timer = setTimeout(() => {
      checkUsername(username).then((available) => {
        if (current) setAvailability(`${username} is ${available ? 'available' : 'taken'}`);
      });
    }, 500);
    return () => {
      current = false;
      clearTimeout(timer);
    };
  }, [username, checkUsername]);

  function handleChangeText(text: string) {
    setUsername(text.replace(/[ _]/g, '-'));
    setAvailability(null);
  }

  async function handlePickAvatar() {
    const picked = await pickAvatar();
    if (picked) setAvatar(picked);
  }

  async function handleContinue() {
    const problem = usernameProblem(username) ?? (avatar ? null : 'Pick an avatar first');
    setError(problem);
    if (problem || !avatar) return;
    setError(await onSubmit(username, avatar));
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle">Pick a username</ThemedText>
      {avatar && (
        <Image
          source={{ uri: avatar.uri }}
          style={styles.avatar}
          testID="pick-username-avatar-preview"
        />
      )}
      <ActionButton
        label="Pick an avatar"
        onPress={handlePickAvatar}
        testID="pick-username-avatar-button"
      />
      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        onChangeText={handleChangeText}
        placeholder="Username"
        placeholderTextColor={theme.textSecondary}
        style={[styles.input, { backgroundColor: theme.backgroundElement, color: theme.text }]}
        testID="pick-username-input"
        value={username}
      />
      {error && <ThemedText testID="pick-username-error">{error}</ThemedText>}
      {availability && (
        <ThemedText testID="pick-username-availability">{availability}</ThemedText>
      )}
      <ActionButton label="Continue" onPress={handleContinue} testID="pick-username-continue" />
      <ActionButton label="Sign out" onPress={onSignOut} testID="pick-username-sign-out" />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  avatar: {
    borderRadius: 64,
    height: 128,
    width: 128,
  },
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
