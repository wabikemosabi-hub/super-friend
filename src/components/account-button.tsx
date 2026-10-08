import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { NomadAvatar } from '@/components/nomad-avatar';
import { ShipButton } from '@/components/ship-panel';
import { ThemedText } from '@/components/themed-text';
import { Spacing, Typefaces } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type AccountButtonProps = {
  username: string;
  avatarUrl: string | null;
  onSignOut: () => void;
};

export function AccountButton({ username, avatarUrl, onSignOut }: AccountButtonProps) {
  const theme = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <View style={styles.account}>
      <Pressable
        accessibilityLabel={`Account menu for ${username}`}
        accessibilityRole="button"
        accessibilityState={{ expanded: menuOpen }}
        onPress={() => setMenuOpen((open) => !open)}
        style={({ pressed }) => [styles.controls, { transform: [{ translateY: pressed ? 3 : 0 }] }]}
        testID="account-button">
        <View style={[styles.avatar, { boxShadow: `0px 4px 0px ${theme.edge}` }]}>
          <NomadAvatar
            avatarUrl={avatarUrl}
            fillColor={theme.hazard}
            frameColor={theme.edge}
            initialColor={theme.onAccent}
            size={46}
            testID="account-avatar"
            username={username}
          />
        </View>
        <View
          style={[
            styles.operator,
            { backgroundColor: theme.screen, borderColor: theme.edge, boxShadow: `0px 4px 0px ${theme.edge}` },
          ]}>
          <View style={[styles.led, { backgroundColor: theme.phosphor, boxShadow: `0px 0px 8px ${theme.phosphor}` }]} />
          <ThemedText
            numberOfLines={1}
            style={[styles.operatorText, { color: theme.phosphor, textShadowColor: theme.phosphorDim }]}
            testID="account-operator">
            OPERATOR: {username.toUpperCase()}
          </ThemedText>
        </View>
      </Pressable>
      {menuOpen && (
        <View style={styles.menu}>
          <ShipButton label="Sign out" onPress={onSignOut} testID="account-sign-out" variant="panel" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  account: {
    alignItems: 'flex-end',
    flexShrink: 1,
    gap: Spacing.three,
  },
  controls: {
    alignItems: 'center',
    flexDirection: 'row',
    flexShrink: 1,
    gap: 10,
  },
  avatar: {
    borderRadius: 3,
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
  menu: {
    alignItems: 'flex-end',
  },
});
