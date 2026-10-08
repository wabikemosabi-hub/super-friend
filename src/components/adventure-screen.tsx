import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AccountButton } from '@/components/account-button';
import { MediaPoster } from '@/components/media-poster';
import { MediaSearchModal } from '@/components/media-search-modal';
import { NomadAvatar } from '@/components/nomad-avatar';
import { CrtScreen, HazardStripe, Plate, ShipButton, ShipPanel } from '@/components/ship-panel';
import { ThemedText } from '@/components/themed-text';
import { TmdbAttribution } from '@/components/tmdb-attribution';
import { Spacing, Typefaces } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Connection } from '@/lib/connections';
import type { MediaItem } from '@/lib/media-search';
import { MAX_PICKS, openSlots, reasonsProblem, type Recommendation } from '@/lib/recommendations';

const sideBySideWidth = 900;

type AdventureScreenProps = {
  username: string;
  avatarUrl: string | null;
  nomad: Connection | null;
  isLoading: boolean;
  fromThem: Recommendation[];
  toThem: Recommendation[];
  picksLoading: boolean;
  picksError: string | null;
  onAdd: (mediaItemId: string, reasons: string[]) => Promise<void>;
  onBack: () => void;
  onSignOut: () => void;
};

export function AdventureScreen({
  username,
  avatarUrl,
  nomad,
  isLoading,
  fromThem,
  toThem,
  picksLoading,
  picksError,
  onAdd,
  onBack,
  onSignOut,
}: AdventureScreenProps) {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const sideBySide = width >= sideBySideWidth;

  return (
    <SafeAreaView style={[styles.room, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.column}>
          <Header username={username} avatarUrl={avatarUrl} nomad={nomad} onBack={onBack} onSignOut={onSignOut} />
          {isLoading && <ScreenLine text="SCANNING…" testID="adventure-loading" />}
          {!isLoading && !nomad && <NotFound />}
          {nomad && (
            <>
              <MediaTabs />
              {picksError && <ScreenLine text={picksError} color={theme.alert} testID="adventure-error" />}
              <View style={[styles.lists, sideBySide && styles.listsSideBySide]}>
                <View style={sideBySide ? styles.half : undefined}>
                  <TheirPicks nomad={nomad} picks={fromThem} isLoading={picksLoading} />
                </View>
                <View style={sideBySide ? styles.half : undefined}>
                  <MyPicks nomad={nomad} picks={toThem} isLoading={picksLoading} onAdd={onAdd} />
                </View>
              </View>
              <TmdbAttribution />
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Header({
  username,
  avatarUrl,
  nomad,
  onBack,
  onSignOut,
}: {
  username: string;
  avatarUrl: string | null;
  nomad: Connection | null;
  onBack: () => void;
  onSignOut: () => void;
}) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.header,
        { backgroundColor: theme.backgroundElement, borderColor: theme.edge, boxShadow: `0px 8px 0px ${theme.edge}` },
      ]}>
      <View style={styles.headerTop}>
        <View style={styles.headerLeft}>
          <Pressable
            accessibilityLabel="Back to Basecamp"
            accessibilityRole="button"
            onPress={onBack}
            style={({ pressed }) => [
              styles.back,
              {
                backgroundColor: theme.backgroundSelected,
                borderColor: theme.edge,
                boxShadow: `0px 4px 0px ${theme.edge}`,
                transform: [{ translateY: pressed ? 3 : 0 }],
              },
            ]}
            testID="adventure-back">
            <ThemedText style={styles.backText}>‹ BASECAMP</ThemedText>
          </Pressable>
          <Plate label="ADVENTURE" />
        </View>
        <AccountButton username={username} avatarUrl={avatarUrl} onSignOut={onSignOut} />
      </View>
      {nomad && (
        <View style={styles.pair}>
          <View style={styles.avatars}>
            <NomadAvatar
              avatarUrl={avatarUrl}
              fillColor={theme.you}
              frameColor={theme.you}
              initialColor={theme.onAccent}
              size={56}
              testID="adventure-my-avatar"
              username={username}
            />
            <NomadAvatar
              avatarUrl={nomad.avatar_url}
              fillColor={theme.friend}
              frameColor={theme.friend}
              initialColor={theme.onAccent}
              size={56}
              testID="adventure-nomad-avatar"
              username={nomad.username}
            />
          </View>
          <View style={styles.names}>
            <ThemedText accessibilityRole="header" style={styles.pairTitle} testID="adventure-title">
              <ThemedText style={[styles.pairTitle, { color: theme.you, textShadowColor: theme.you }]}>You</ThemedText>
              {' & '}
              <ThemedText style={[styles.pairTitle, { color: theme.friend, textShadowColor: theme.friend }]}>
                {nomad.username}
              </ThemedText>
            </ThemedText>
            <ThemedText style={[styles.nomadLine, { color: theme.textSecondary }]} testID="adventure-nomad">
              @{nomad.username} · Fellow Nomad
            </ThemedText>
          </View>
        </View>
      )}
      <View style={[styles.alertLine, { backgroundColor: theme.alert }]} />
      <HazardStripe />
    </View>
  );
}

function NotFound() {
  const theme = useTheme();

  return (
    <CrtScreen>
      <View style={styles.empty} testID="adventure-not-found">
        <ThemedText style={[styles.noSignal, { color: theme.phosphor, textShadowColor: theme.phosphorDim }]}>
          NO SIGNAL
        </ThemedText>
        <ThemedText style={[styles.emptyText, { color: theme.phosphorDim }]}>
          That nomad isn&apos;t one of your fellow nomads. Head back to Basecamp to add them.
        </ThemedText>
      </View>
    </CrtScreen>
  );
}

const tabs = [
  { key: 'movies', label: 'Movies', ready: true },
  { key: 'series', label: 'Series', ready: false },
  { key: 'books', label: 'Books', ready: false },
];

function MediaTabs() {
  const theme = useTheme();

  return (
    <View accessibilityRole="tablist" style={styles.tabs}>
      {tabs.map((tab) => (
        <Pressable
          accessibilityRole="tab"
          accessibilityState={{ selected: tab.ready, disabled: !tab.ready }}
          disabled={!tab.ready}
          key={tab.key}
          style={[
            styles.tab,
            {
              backgroundColor: tab.ready ? theme.hazard : theme.backgroundElement,
              borderColor: theme.edge,
              opacity: tab.ready ? 1 : 0.5,
            },
          ]}
          testID={`adventure-tab-${tab.key}`}>
          <ThemedText style={[styles.tabText, { color: tab.ready ? theme.onAccent : theme.textSecondary }]}>
            {tab.label.toUpperCase()}
            {tab.ready ? '' : ' · SOON'}
          </ThemedText>
        </Pressable>
      ))}
    </View>
  );
}

function TheirPicks({ nomad, picks, isLoading }: { nomad: Connection; picks: Recommendation[]; isLoading: boolean }) {
  const theme = useTheme();
  const [open, setOpen] = useState(true);

  return (
    <ShipPanel
      channel="IN"
      title={`${nomad.username}'s picks for me`}
      testID="adventure-in"
      badge={<PanelBadge count={picks.length} color={theme.friend} open={open} onToggle={() => setOpen(!open)} testID="adventure-in-toggle" />}>
      {open && (
        <>
          <CrtScreen>
            {isLoading && <ScreenLine text="SCANNING…" testID="adventure-in-loading" />}
            {!isLoading && picks.length === 0 && (
              <ScreenLine text={`NO TRANSMISSIONS YET. ${nomad.username} hasn't picked anything for you.`} testID="adventure-in-empty" />
            )}
            {picks.map((pick) => (
              <PickRow key={pick.id} pick={pick} testID={`adventure-in-${pick.external_id}`} />
            ))}
          </CrtScreen>
          <ThemedText style={[styles.note, { color: theme.textSecondary }]}>
            Only {nomad.username} can change this list.
          </ThemedText>
        </>
      )}
    </ShipPanel>
  );
}

function MyPicks({
  nomad,
  picks,
  isLoading,
  onAdd,
}: {
  nomad: Connection;
  picks: Recommendation[];
  isLoading: boolean;
  onAdd: (mediaItemId: string, reasons: string[]) => Promise<void>;
}) {
  const theme = useTheme();
  const [open, setOpen] = useState(true);
  const [searching, setSearching] = useState(false);
  const [picked, setPicked] = useState<MediaItem | null>(null);
  const slots = openSlots(picks);

  return (
    <ShipPanel
      channel="OUT"
      title={`My picks for ${nomad.username}`}
      testID="adventure-out"
      badge={<PanelBadge count={picks.length} color={theme.you} open={open} onToggle={() => setOpen(!open)} testID="adventure-out-toggle" />}>
      {open && (
        <>
          <CrtScreen>
            {isLoading && <ScreenLine text="SCANNING…" testID="adventure-out-loading" />}
            {!isLoading && picks.length === 0 && (
              <ScreenLine text={`NO PICKS YET. What should ${nomad.username} watch?`} testID="adventure-out-empty" />
            )}
            {picks.map((pick) => (
              <PickRow key={pick.id} pick={pick} status={`${nomad.username} hasn't rated it yet`} testID={`adventure-out-${pick.external_id}`} />
            ))}
          </CrtScreen>
          {picked ? (
            <ReasonsForm
              item={picked}
              nomad={nomad}
              onCancel={() => setPicked(null)}
              onSave={async (reasons) => {
                await onAdd(picked.id, reasons);
                setPicked(null);
              }}
            />
          ) : (
            <ShipButton
              disabled={slots === 0}
              label={`Add a movie for ${nomad.username}`}
              onPress={() => setSearching(true)}
              testID="adventure-add"
            />
          )}
          <ThemedText style={[styles.slots, { color: slots === 0 ? theme.alert : theme.hazard }]} testID="adventure-slots">
            {slots === 0 ? 'LIST FULL' : `${slots} ${slots === 1 ? 'SLOT' : 'SLOTS'} OPEN. MAKE THEM COUNT.`}
          </ThemedText>
          <MediaSearchModal visible={searching} type="movie" onPick={setPicked} onClose={() => setSearching(false)} />
        </>
      )}
    </ShipPanel>
  );
}

function PanelBadge({
  count,
  color,
  open,
  onToggle,
  testID,
}: {
  count: number;
  color: string;
  open: boolean;
  onToggle: () => void;
  testID: string;
}) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityLabel={open ? 'Hide this list' : 'Show this list'}
      accessibilityRole="button"
      accessibilityState={{ expanded: open }}
      onPress={onToggle}
      style={styles.badge}
      testID={testID}>
      <View accessibilityLabel={`${count} of ${MAX_PICKS} picks`} style={styles.pips}>
        {Array.from({ length: MAX_PICKS }, (_, i) => (
          <View
            key={i}
            style={[
              styles.pip,
              {
                backgroundColor: i < count ? color : theme.screen,
                borderColor: theme.edge,
                boxShadow: i < count ? `0px 0px 6px ${color}` : 'none',
              },
            ]}
          />
        ))}
      </View>
      <ThemedText style={[styles.toggleText, { color: theme.textSecondary }]}>{open ? 'HIDE' : 'SHOW'}</ThemedText>
    </Pressable>
  );
}

function PickRow({ pick, status, testID }: { pick: Recommendation; status?: string; testID: string }) {
  const theme = useTheme();

  return (
    <View style={styles.pick} testID={testID}>
      <ThemedText style={[styles.rank, { color: theme.hazard }]}>{pick.rank}</ThemedText>
      <MediaPoster item={pick} />
      <View style={styles.pickDetails}>
        <ThemedText style={[styles.pickTitle, { color: theme.phosphor, textShadowColor: theme.phosphorDim }]}>
          {pick.title}
          {pick.year ? ` (${pick.year})` : ''}
        </ThemedText>
        {pick.reasons.map((reason, i) => (
          <ThemedText key={i} style={[styles.reason, { color: theme.phosphorDim }]}>
            “{reason}”
          </ThemedText>
        ))}
        {status && <ThemedText style={[styles.status, { color: theme.textSecondary }]}>{status}</ThemedText>}
      </View>
    </View>
  );
}

function ReasonsForm({
  item,
  nomad,
  onCancel,
  onSave,
}: {
  item: MediaItem;
  nomad: Connection;
  onCancel: () => void;
  onSave: (reasons: string[]) => Promise<void>;
}) {
  const theme = useTheme();
  const [reasons, setReasons] = useState(['', '', '']);
  const [saving, setSaving] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  async function save() {
    if (saving) return;
    const issue = reasonsProblem(reasons);
    if (issue) {
      setProblem(issue);
      return;
    }
    setSaving(true);
    setProblem(null);
    try {
      await onSave(reasons);
    } catch (failure) {
      setProblem(failure instanceof Error ? failure.message : 'That pick did not go through');
      setSaving(false);
    }
  }

  return (
    <View style={[styles.form, { backgroundColor: theme.backgroundSelected, borderColor: theme.edge }]} testID="adventure-reasons">
      <View style={styles.formHeading}>
        <MediaPoster item={item} />
        <View style={styles.pickDetails}>
          <ThemedText style={[styles.label, { color: theme.textSecondary }]}>WHY SHOULD {nomad.username.toUpperCase()} WATCH</ThemedText>
          <ThemedText style={styles.formTitle} testID="adventure-reasons-title">
            {item.title}
            {item.year ? ` (${item.year})` : ''}?
          </ThemedText>
        </View>
      </View>
      {reasons.map((reason, i) => (
        <TextInput
          accessibilityLabel={i === 0 ? 'Reason 1 (required)' : `Reason ${i + 1} (optional)`}
          key={i}
          maxLength={140}
          onChangeText={(text) => {
            setReasons(reasons.map((r, j) => (j === i ? text : r)));
            setProblem(null);
          }}
          placeholder={i === 0 ? 'REASON 1 (REQUIRED)' : `REASON ${i + 1} (OPTIONAL)`}
          placeholderTextColor={theme.phosphorDim}
          style={[styles.input, { backgroundColor: theme.screen, borderColor: theme.edge, color: theme.phosphor }]}
          testID={`adventure-reason-${i + 1}`}
          value={reason}
        />
      ))}
      {problem && <ScreenLine text={problem} color={theme.alert} testID="adventure-add-error" />}
      <View style={styles.formButtons}>
        <ShipButton label="Cancel" onPress={onCancel} testID="adventure-cancel" variant="panel" />
        <ShipButton disabled={saving} label="Save pick" onPress={save} testID="adventure-save" variant="phosphor" />
      </View>
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
  header: {
    borderRadius: 6,
    borderWidth: 2,
    overflow: 'hidden',
  },
  headerTop: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingTop: 18,
  },
  headerLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.three,
  },
  back: {
    borderRadius: 3,
    borderWidth: 2,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: Spacing.three,
  },
  backText: {
    fontFamily: Typefaces.labelBold,
    fontSize: 13,
    letterSpacing: 1,
    lineHeight: 18,
  },
  pair: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 18,
    paddingBottom: 18,
    paddingHorizontal: Spacing.four,
    paddingTop: 18,
  },
  avatars: {
    flexDirection: 'row',
    gap: 6,
  },
  names: {
    flexShrink: 1,
    gap: Spacing.one,
  },
  pairTitle: {
    fontFamily: Typefaces.display,
    fontSize: 28,
    letterSpacing: 1.2,
    lineHeight: 36,
    textShadowRadius: 12,
  },
  nomadLine: {
    fontFamily: Typefaces.label,
    fontSize: 13,
    lineHeight: 18,
  },
  alertLine: {
    height: 3,
  },
  tabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tab: {
    borderRadius: 3,
    borderWidth: 2,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: Spacing.three,
  },
  tabText: {
    fontFamily: Typefaces.labelBold,
    fontSize: 13,
    letterSpacing: 1,
    lineHeight: 18,
  },
  lists: {
    gap: 28,
  },
  listsSideBySide: {
    alignItems: 'flex-start',
    flexDirection: 'row',
  },
  half: {
    flex: 1,
    minWidth: 0,
  },
  badge: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    minHeight: 44,
  },
  pips: {
    flexDirection: 'row',
    gap: 4,
  },
  pip: {
    borderRadius: 2,
    borderWidth: 1,
    height: 12,
    width: 12,
  },
  toggleText: {
    fontFamily: Typefaces.labelBold,
    fontSize: 11,
    letterSpacing: 1,
    lineHeight: 16,
  },
  note: {
    fontFamily: Typefaces.label,
    fontSize: 12,
    lineHeight: 16,
  },
  slots: {
    fontFamily: Typefaces.labelBold,
    fontSize: 12,
    letterSpacing: 1.4,
    lineHeight: 16,
  },
  pick: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
  },
  rank: {
    fontFamily: Typefaces.screen,
    fontSize: 32,
    lineHeight: 34,
    width: 20,
  },
  pickDetails: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  pickTitle: {
    fontFamily: Typefaces.screen,
    fontSize: 24,
    lineHeight: 26,
    textShadowRadius: 6,
  },
  reason: {
    fontFamily: Typefaces.screen,
    fontSize: 19,
    lineHeight: 22,
  },
  status: {
    fontFamily: Typefaces.label,
    fontSize: 11,
    lineHeight: 16,
    marginTop: Spacing.half,
  },
  form: {
    borderRadius: 4,
    borderWidth: 2,
    gap: 10,
    padding: Spacing.three,
  },
  formHeading: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  label: {
    fontFamily: Typefaces.labelBold,
    fontSize: 11,
    letterSpacing: 1.2,
    lineHeight: 16,
  },
  formTitle: {
    fontFamily: Typefaces.display,
    fontSize: 15,
    lineHeight: 22,
  },
  input: {
    borderRadius: 3,
    borderWidth: 2,
    fontFamily: Typefaces.screen,
    fontSize: 22,
    height: 46,
    minWidth: 0,
    outlineStyle: 'solid',
    outlineWidth: 0,
    paddingHorizontal: 12,
  },
  formButtons: {
    flexDirection: 'row',
    gap: Spacing.two,
    justifyContent: 'flex-end',
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
  screenLine: {
    fontFamily: Typefaces.screen,
    fontSize: 22,
    lineHeight: 26,
  },
});
