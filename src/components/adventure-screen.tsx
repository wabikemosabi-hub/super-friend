import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AccountButton } from '@/components/account-button';
import { NavConsole } from '@/components/nav-console';
import { NomadAvatar } from '@/components/nomad-avatar';
import { RoadMap } from '@/components/road-map';
import { CrtScreen, HazardStripe, Plate, ScreenLine } from '@/components/ship-panel';
import { ThemedText } from '@/components/themed-text';
import { TmdbAttribution } from '@/components/tmdb-attribution';
import { Spacing, Typefaces } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Connection } from '@/lib/connections';
import type { Recommendation } from '@/lib/recommendations';

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

type AdventureView = 'road' | 'console';

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
  const [showing, setShowing] = useState<AdventureView>('road');

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
              {!sideBySide && <ViewSwitch nomadName={nomad.username} showing={showing} onShow={setShowing} />}
              <View style={[styles.panels, sideBySide && styles.panelsSideBySide]}>
                {(sideBySide || showing === 'road') && (
                  <View style={sideBySide ? styles.road : undefined}>
                    <RoadMap isLoading={picksLoading} nomadName={nomad.username} picks={fromThem} wide={sideBySide} />
                  </View>
                )}
                {(sideBySide || showing === 'console') && (
                  <View style={sideBySide ? styles.console : undefined}>
                    <NavConsole isLoading={picksLoading} nomadName={nomad.username} onAdd={onAdd} plotted={toThem} />
                  </View>
                )}
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

function ViewSwitch({
  nomadName,
  showing,
  onShow,
}: {
  nomadName: string;
  showing: AdventureView;
  onShow: (view: AdventureView) => void;
}) {
  const theme = useTheme();
  const options: { key: AdventureView; label: string }[] = [
    { key: 'road', label: 'MY ROAD' },
    { key: 'console', label: `PLOT ${nomadName.toUpperCase()}'S ROUTE` },
  ];

  return (
    <View
      accessibilityRole="tablist"
      style={[styles.switch, { backgroundColor: theme.screen, borderColor: theme.edge }]}>
      {options.map((option) => {
        const selected = showing === option.key;
        return (
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            key={option.key}
            onPress={() => onShow(option.key)}
            style={[styles.switchOption, { backgroundColor: selected ? theme.hazard : 'transparent' }]}
            testID={`adventure-view-${option.key}`}>
            <ThemedText
              numberOfLines={1}
              style={[styles.switchText, { color: selected ? theme.onAccent : theme.textSecondary }]}>
              {option.label}
            </ThemedText>
          </Pressable>
        );
      })}
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
  panels: {
    gap: 28,
  },
  panelsSideBySide: {
    alignItems: 'flex-start',
    flexDirection: 'row',
  },
  road: {
    flex: 2,
    minWidth: 0,
  },
  console: {
    flex: 1,
    minWidth: 0,
  },
  switch: {
    borderRadius: 4,
    borderWidth: 2,
    flexDirection: 'row',
    gap: Spacing.one,
    padding: Spacing.one,
  },
  switchOption: {
    alignItems: 'center',
    borderRadius: 3,
    flex: 1,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: Spacing.two,
  },
  switchText: {
    fontFamily: Typefaces.labelBold,
    fontSize: 12,
    letterSpacing: 1,
    lineHeight: 16,
  },
});
