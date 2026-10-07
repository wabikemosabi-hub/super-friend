import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { CrtScreen, ShipButton, ShipPanel } from '@/components/ship-panel';
import { ThemedText } from '@/components/themed-text';
import { Spacing, Typefaces } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Connection } from '@/lib/connections';

type NomadRequestsCardProps = {
  incoming: Connection[];
  outgoing: Connection[];
  onRespond: (connectionId: string, accept: boolean) => Promise<void>;
};

export function NomadRequestsCard({ incoming, outgoing, onRespond }: NomadRequestsCardProps) {
  const theme = useTheme();
  const [answering, setAnswering] = useState<string | null>(null);
  const [problem, setProblem] = useState<string | null>(null);

  async function respond(connectionId: string, accept: boolean) {
    setAnswering(connectionId);
    setProblem(null);
    try {
      await onRespond(connectionId, accept);
    } catch (failure) {
      setProblem(failure instanceof Error ? failure.message : 'That answer did not go through');
    } finally {
      setAnswering(null);
    }
  }

  return (
    <ShipPanel channel="CH-02" title="Nomad requests" testID="nomad-requests-card">
      {incoming.length === 0 && outgoing.length === 0 && (
        <CrtScreen>
          <View style={styles.transmission} testID="nomad-requests-empty">
            <ThemedText style={[styles.username, { color: theme.phosphor }]}>NO TRANSMISSIONS</ThemedText>
            <ThemedText style={[styles.detail, { color: theme.phosphorDim }]}>
              Requests to and from other nomads show up here.
            </ThemedText>
          </View>
        </CrtScreen>
      )}

      {incoming.map((request) => (
        <View key={request.connection_id} style={styles.request} testID={`incoming-${request.username}`}>
          <CrtScreen>
            <View style={styles.transmission}>
              <ThemedText style={[styles.kicker, { color: theme.alert }]}>INCOMING TRANSMISSION</ThemedText>
              <ThemedText
                style={[styles.username, { color: theme.phosphor, textShadowColor: theme.phosphorDim }]}>
                {request.username}
              </ThemedText>
              <ThemedText style={[styles.detail, { color: theme.phosphorDim }]}>
                wants to be fellow nomads
              </ThemedText>
            </View>
          </CrtScreen>
          <View style={styles.answers}>
            <View style={styles.answer}>
              <ShipButton
                disabled={answering === request.connection_id}
                label="Accept"
                onPress={() => respond(request.connection_id, true)}
                testID={`incoming-${request.username}-accept`}
                variant="phosphor"
              />
            </View>
            <View style={styles.answer}>
              <ShipButton
                disabled={answering === request.connection_id}
                label="Decline"
                onPress={() => respond(request.connection_id, false)}
                testID={`incoming-${request.username}-decline`}
                variant="panel"
              />
            </View>
          </View>
        </View>
      ))}

      {problem && (
        <ThemedText style={[styles.detail, { color: theme.alert }]} testID="nomad-requests-error">
          {problem}
        </ThemedText>
      )}

      {outgoing.map((request) => (
        <CrtScreen key={request.connection_id}>
          <View style={styles.transmission} testID={`outgoing-${request.username}`}>
            <ThemedText style={[styles.kicker, { color: theme.phosphorDim }]}>OUTGOING TRANSMISSION</ThemedText>
            <ThemedText style={[styles.username, { color: theme.phosphorDim }]}>{request.username}</ThemedText>
            <ThemedText style={[styles.detail, { color: theme.phosphorDim }]}>waiting for a yes</ThemedText>
          </View>
        </CrtScreen>
      ))}
    </ShipPanel>
  );
}

const styles = StyleSheet.create({
  request: {
    gap: 10,
  },
  transmission: {
    gap: Spacing.one,
    padding: Spacing.one,
  },
  kicker: {
    fontFamily: Typefaces.screen,
    fontSize: 18,
    lineHeight: 20,
  },
  username: {
    fontFamily: Typefaces.screen,
    fontSize: 26,
    lineHeight: 28,
    textShadowRadius: 6,
  },
  detail: {
    fontFamily: Typefaces.screen,
    fontSize: 20,
    lineHeight: 22,
  },
  answers: {
    flexDirection: 'row',
    gap: 10,
  },
  answer: {
    flex: 1,
  },
});
