import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { NomadAvatar } from '@/components/nomad-avatar';
import { CrtScreen, ShipButton, ShipPanel } from '@/components/ship-panel';
import { ThemedText } from '@/components/themed-text';
import { Spacing, Typefaces } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Connection } from '@/lib/connections';

type FellowNomadsCardProps = {
  nomads: Connection[];
  isLoading: boolean;
  error: string | null;
  onSend: (username: string) => Promise<void>;
};

export function FellowNomadsCard({ nomads, isLoading, error, onSend }: FellowNomadsCardProps) {
  const theme = useTheme();

  return (
    <ShipPanel
      channel="CH-01"
      title="Fellow Nomads"
      testID="fellow-nomads-card"
      badge={
        <View
          accessibilityLabel={`${nomads.length} fellow nomads`}
          style={[styles.count, { backgroundColor: theme.screen, borderColor: theme.edge }]}>
          <ThemedText style={[styles.countText, { color: theme.phosphor }]} testID="fellow-nomads-count">
            {String(nomads.length).padStart(2, '0')}
          </ThemedText>
        </View>
      }>
      <CrtScreen>
        {isLoading && <ScreenLine text="SCANNING…" testID="fellow-nomads-loading" />}
        {error && <ScreenLine text={error} color={theme.alert} testID="fellow-nomads-error" />}
        {!isLoading && !error && nomads.length === 0 && (
          <View style={styles.empty} testID="fellow-nomads-empty">
            <ThemedText style={[styles.noSignal, { color: theme.phosphor, textShadowColor: theme.phosphorDim }]}>
              NO SIGNAL
            </ThemedText>
            <ThemedText style={[styles.emptyText, { color: theme.phosphorDim }]}>
              No fellow nomads yet. Add a friend by their username. Once they say yes, they show up here.
            </ThemedText>
          </View>
        )}
        {nomads.map((nomad) => (
          <NomadRow key={nomad.connection_id} nomad={nomad} />
        ))}
      </CrtScreen>
      <AddNomad onSend={onSend} />
    </ShipPanel>
  );
}

function NomadRow({ nomad }: { nomad: Connection }) {
  const theme = useTheme();

  return (
    <View style={styles.row} testID={`fellow-nomad-${nomad.username}`}>
      <NomadAvatar
        avatarUrl={nomad.avatar_url}
        frameColor={theme.phosphor}
        initialColor={theme.phosphor}
        size={40}
        testID={`fellow-nomad-${nomad.username}-avatar`}
        username={nomad.username}
      />
      <ThemedText
        numberOfLines={1}
        style={[styles.username, { color: theme.phosphor, textShadowColor: theme.phosphorDim }]}>
        {nomad.username}
      </ThemedText>
    </View>
  );
}

function AddNomad({ onSend }: { onSend: (username: string) => Promise<void> }) {
  const theme = useTheme();
  const [username, setUsername] = useState('');
  const [focused, setFocused] = useState(false);
  const [sending, setSending] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const name = username.trim();

  async function send() {
    if (!name || sending) return;
    setSending(true);
    setSentTo(null);
    setProblem(null);
    try {
      await onSend(name);
      setSentTo(name);
      setUsername('');
    } catch (failure) {
      setProblem(failure instanceof Error ? failure.message : 'That request did not go through');
    } finally {
      setSending(false);
    }
  }

  return (
    <View style={styles.add}>
      <ThemedText nativeID="add-nomad-label" style={[styles.label, { color: theme.textSecondary }]}>
        ADD A NOMAD BY USERNAME
      </ThemedText>
      <View style={styles.addRow}>
        <TextInput
          accessibilityLabelledBy="add-nomad-label"
          autoCapitalize="none"
          autoComplete="off"
          autoCorrect={false}
          onBlur={() => setFocused(false)}
          onChangeText={(text) => {
            setUsername(text);
            setSentTo(null);
            setProblem(null);
          }}
          onFocus={() => setFocused(true)}
          onSubmitEditing={send}
          placeholder={focused ? '' : '#username'}
          placeholderTextColor={theme.phosphorDim}
          style={[
            styles.input,
            {
              backgroundColor: theme.screen,
              borderColor: focused ? theme.phosphorDim : theme.edge,
              color: theme.phosphor,
            },
          ]}
          testID="add-nomad-input"
          value={username}
        />
        <ShipButton disabled={!name || sending} label="Send request" onPress={send} testID="add-nomad-send" />
      </View>
      {sentTo && <ScreenLine text={`REQUEST SENT TO ${sentTo}`} testID="add-nomad-sent" />}
      {problem && <ScreenLine text={problem} color={theme.alert} testID="add-nomad-error" />}
    </View>
  );
}

function ScreenLine({ text, color, testID }: { text: string; color?: string; testID: string }) {
  const theme = useTheme();

  return (
    <ThemedText style={[styles.screenLine, { color: color ?? theme.phosphor }]} testID={testID}>
      {text}
    </ThemedText>
  );
}

const styles = StyleSheet.create({
  count: {
    borderRadius: 3,
    borderWidth: 2,
    paddingHorizontal: Spacing.two,
  },
  countText: {
    fontFamily: Typefaces.screen,
    fontSize: 24,
    lineHeight: 26,
  },
  empty: {
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.two,
    paddingVertical: 20,
  },
  noSignal: {
    fontFamily: Typefaces.screen,
    fontSize: 30,
    lineHeight: 32,
    textShadowRadius: 8,
  },
  emptyText: {
    fontFamily: Typefaces.screen,
    fontSize: 20,
    lineHeight: 24,
    textAlign: 'center',
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    minHeight: 52,
    paddingHorizontal: Spacing.two,
    paddingVertical: 6,
  },
  username: {
    flex: 1,
    fontFamily: Typefaces.screen,
    fontSize: 24,
    lineHeight: 26,
    textShadowRadius: 6,
  },
  add: {
    gap: 6,
  },
  label: {
    fontFamily: Typefaces.labelBold,
    fontSize: 12,
    letterSpacing: 1.4,
    lineHeight: 16,
  },
  addRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  input: {
    borderRadius: 3,
    borderWidth: 2,
    flex: 1,
    fontFamily: Typefaces.screen,
    fontSize: 24,
    height: 48,
    minWidth: 0,
    outlineStyle: 'solid',
    outlineWidth: 0,
    paddingHorizontal: 12,
  },
  screenLine: {
    fontFamily: Typefaces.screen,
    fontSize: 22,
    lineHeight: 26,
  },
});
