import type { ReactNode } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Spacing, Typefaces } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ShipModalProps = {
  visible: boolean;
  channel: string;
  heading: string;
  onClose: () => void;
  closeLabel: string;
  testID: string;
  children: ReactNode;
};

export function ShipModal({ visible, channel, heading, onClose, closeLabel, testID, children }: ShipModalProps) {
  const theme = useTheme();
  const isWeb = Platform.OS === 'web';

  return (
    <Modal
      animationType={isWeb ? 'fade' : 'slide'}
      onRequestClose={onClose}
      presentationStyle={isWeb ? undefined : 'fullScreen'}
      transparent={isWeb}
      visible={visible}>
      <SafeAreaProvider>
        <View style={[styles.backdrop, isWeb && { backgroundColor: theme.scrim }]}>
          {isWeb && (
            <Pressable
              accessibilityLabel={closeLabel}
              onPress={onClose}
              style={StyleSheet.absoluteFill}
              testID={`${testID}-backdrop`}
            />
          )}
          <SafeAreaView
            style={[
              styles.panel,
              isWeb ? styles.panelWeb : styles.panelPhone,
              { backgroundColor: theme.backgroundElement, borderColor: theme.edge },
            ]}>
            <View style={[styles.header, { borderBottomColor: theme.edge }]}>
              <View style={[styles.plate, { backgroundColor: theme.hazard }]}>
                <ThemedText style={[styles.plateText, { color: theme.onAccent }]}>{channel}</ThemedText>
              </View>
              <ThemedText style={styles.heading}>{heading}</ThemedText>
              <Pressable
                accessibilityLabel={closeLabel}
                accessibilityRole="button"
                onPress={onClose}
                style={({ pressed }) => [
                  styles.close,
                  {
                    backgroundColor: pressed ? theme.backgroundElement : theme.backgroundSelected,
                    borderColor: theme.edge,
                  },
                ]}
                testID={`${testID}-close`}>
                <ThemedText style={styles.closeText}>✕</ThemedText>
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
              {children}
            </ScrollView>
          </SafeAreaView>
        </View>
      </SafeAreaProvider>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  panel: {
    borderWidth: 2,
    overflow: 'hidden',
  },
  panelPhone: {
    alignSelf: 'stretch',
    flex: 1,
  },
  panelWeb: {
    borderRadius: 6,
    maxHeight: '85%',
    maxWidth: 640,
    width: '92%',
  },
  header: {
    alignItems: 'center',
    borderBottomWidth: 2,
    flexDirection: 'row',
    gap: Spacing.two,
    padding: Spacing.three,
  },
  plate: {
    borderRadius: 2,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
  },
  plateText: {
    fontFamily: Typefaces.labelBold,
    fontSize: 12,
    letterSpacing: 1,
    lineHeight: 16,
  },
  heading: {
    flex: 1,
    fontFamily: Typefaces.display,
    fontSize: 15,
    letterSpacing: 0.6,
    lineHeight: 20,
  },
  close: {
    alignItems: 'center',
    borderRadius: 4,
    borderWidth: 2,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  closeText: {
    fontFamily: Typefaces.labelBold,
    fontSize: 18,
    lineHeight: 22,
  },
  body: {
    padding: Spacing.three,
  },
});
