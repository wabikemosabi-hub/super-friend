import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AccountButton } from '@/components/account-button';
import { FellowNomadsCard } from '@/components/fellow-nomads-card';
import { NomadRequestsCard } from '@/components/nomad-requests-card';
import { HazardStripe } from '@/components/ship-panel';
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
  onOpenNomad: (username: string) => void;
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
  onOpenNomad,
}: BasecampScreenProps) {
  const theme = useTheme();

  return (
    <SafeAreaView style={[styles.room, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.column}>
          <Header username={username} avatarUrl={avatarUrl} onSignOut={onSignOut} />
          <View style={styles.cards}>
            <View style={styles.card}>
              <FellowNomadsCard nomads={nomads} isLoading={isLoading} error={error} onSend={onSend} onOpenNomad={onOpenNomad} />
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
        <AccountButton username={username} avatarUrl={avatarUrl} onSignOut={onSignOut} />
      </View>
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
  alertLine: {
    height: 3,
  },
});
