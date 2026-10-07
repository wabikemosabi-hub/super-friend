import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FellowNomadsCard } from '@/components/fellow-nomads-card';
import { NomadAvatar } from '@/components/nomad-avatar';
import { NomadRequestsCard } from '@/components/nomad-requests-card';
import { HazardStripe, ShipButton } from '@/components/ship-panel';
import { ThemedText } from '@/components/themed-text';
import { Spacing, Typefaces } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Connection } from '@/lib/connections';

type BasecampScreenProps = {
  username: string;
  avatarUrl: string | null;
  onSignOut: () => void;
  nomads: Connection[];
  incoming: Connection[];
  outgoing: Connection[];
  isLoading: boolean;
  error: string | null;
  onSend: (username: string) => Promise<void>;
  onRespond: (connectionId: string, accept: boolean) => Promise<void>;
};

export function BasecampScreen({
  username,
  avatarUrl,
  onSignOut,
  nomads,
  incoming,
  outgoing,
  isLoading,
  error,
  onSend,
  onRespond,
}: BasecampScreenProps) {
  const theme = useTheme();

  return (
    <SafeAreaView style={[styles.room, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.column}>
          <Header username={username} avatarUrl={avatarUrl} onSignOut={onSignOut} />
          <View style={styles.cards}>
            <View style={styles.card}>
              <FellowNomadsCard nomads={nomads} isLoading={isLoading} error={error} onSend={onSend} />
            </View>
            <View style={styles.card}>
              <NomadRequestsCard incoming={incoming} outgoing={outgoing} onRespond={onRespond} />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Header({ username, avatarUrl, onSignOut }: { username: string; avatarUrl: string | null; onSignOut: () => void }) {
  const theme = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <View
      style={[
        styles.header,
        { backgroundColor: theme.backgroundElement, borderColor: theme.edge, boxShadow: `0px 8px 0px ${theme.edge}` },
      ]}>
      <View style={styles.headerBody}>
        <View style={styles.titles}>
          <ThemedText style={[styles.unit, { color: theme.textSecondary }]}>
            MEDIA ADVISORY BOARD · DEEP FIELD UNIT MAB-1
          </ThemedText>
          <View style={styles.titleRow}>
            <View style={[styles.eye, { backgroundColor: theme.alert, borderColor: theme.edge, boxShadow: `0px 0px 16px ${theme.alert}` }]}>
              <View style={[styles.pupil, { backgroundColor: theme.hazard }]} />
            </View>
            <ThemedText
              accessibilityRole="header"
              style={[styles.basecamp, { color: theme.neon, textShadowColor: theme.neon }]}>
              BASECAMP
            </ThemedText>
          </View>
        </View>
        <Pressable
          accessibilityLabel={`Account menu for ${username}`}
          accessibilityRole="button"
          accessibilityState={{ expanded: menuOpen }}
          onPress={() => setMenuOpen((open) => !open)}
          style={({ pressed }) => [styles.controls, { transform: [{ translateY: pressed ? 3 : 0 }] }]}
          testID="basecamp-account">
          <View style={[styles.account, { boxShadow: `0px 4px 0px ${theme.edge}` }]}>
            <NomadAvatar
              avatarUrl={avatarUrl}
              fillColor={theme.hazard}
              frameColor={theme.edge}
              initialColor={theme.onAccent}
              size={46}
              testID="basecamp-account-avatar"
              username={username}
            />
          </View>
          <View style={[styles.operator, { backgroundColor: theme.screen, borderColor: theme.edge, boxShadow: `0px 4px 0px ${theme.edge}` }]}>
            <View style={[styles.led, { backgroundColor: theme.phosphor, boxShadow: `0px 0px 8px ${theme.phosphor}` }]} />
            <ThemedText
              numberOfLines={1}
              style={[styles.operatorText, { color: theme.phosphor, textShadowColor: theme.phosphorDim }]}
              testID="basecamp-operator">
              OPERATOR: {username.toUpperCase()}
            </ThemedText>
          </View>
        </Pressable>
      </View>
      {menuOpen && (
        <View style={styles.menu}>
          <ShipButton label="Sign out" onPress={onSignOut} testID="basecamp-sign-out" variant="panel" />
        </View>
      )}
      <View style={[styles.alertLine, { backgroundColor: theme.alert }]} />
      <HazardStripe />
    </View>
  );
}

const styles = StyleSheet.create({
  room: {
    flex: 1,
  },
  scroll: {
    paddingBottom: 56,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.four,
  },
  column: {
    alignSelf: 'center',
    gap: 28,
    maxWidth: 1200,
    width: '100%',
  },
  cards: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 28,
  },
  card: {
    flexBasis: 300,
    flexGrow: 1,
  },
  header: {
    borderRadius: 6,
    borderWidth: 2,
    overflow: 'hidden',
  },
  headerBody: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 18,
    justifyContent: 'space-between',
    paddingBottom: 18,
    paddingHorizontal: Spacing.four,
    paddingTop: 22,
  },
  titles: {
    flexShrink: 1,
    gap: Spacing.two,
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
  },
  unit: {
    fontFamily: Typefaces.labelBold,
    fontSize: 11,
    letterSpacing: 2.4,
    lineHeight: 16,
  },
  basecamp: {
    fontFamily: Typefaces.display,
    fontSize: 44,
    letterSpacing: 2.6,
    lineHeight: 52,
    textShadowRadius: 14,
  },
  controls: {
    alignItems: 'center',
    flexDirection: 'row',
    flexShrink: 1,
    gap: 10,
  },
  eye: {
    alignItems: 'center',
    borderRadius: 17,
    borderWidth: 4,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  pupil: {
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  operator: {
    alignItems: 'center',
    borderRadius: 4,
    borderWidth: 2,
    flexDirection: 'row',
    flexShrink: 1,
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: Spacing.two,
  },
  led: {
    borderRadius: 5,
    height: 9,
    width: 9,
  },
  operatorText: {
    flexShrink: 1,
    fontFamily: Typefaces.screen,
    fontSize: 24,
    lineHeight: 26,
    textShadowRadius: 6,
  },
  account: {
    borderRadius: 3,
  },
  menu: {
    alignItems: 'flex-end',
    paddingBottom: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  alertLine: {
    height: 3,
  },
});
