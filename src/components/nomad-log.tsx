import { StyleSheet, View } from 'react-native';

import { LogEntry } from '@/components/log-entry';
import { CrtScreen, ScreenLine, ShipPanel } from '@/components/ship-panel';
import { Spacing } from '@/constants/theme';
import { logEntry, type LogRow } from '@/lib/ratings';

type NomadLogProps = {
  channel: string;
  title: string;
  rows: LogRow[];
  empty: string;
  testID: string;
};

export function NomadLog({ channel, title, rows, empty, testID }: NomadLogProps) {
  const entries = rows.flatMap((row) => {
    const entry = logEntry(row);
    return entry ? [{ id: row.id, entry }] : [];
  });

  return (
    <ShipPanel channel={channel} testID={testID} title={title}>
      {entries.length === 0 ? (
        <CrtScreen>
          <ScreenLine testID={`${testID}-empty`} text={empty} />
        </CrtScreen>
      ) : (
        <View style={styles.entries}>
          {entries.map(({ id, entry }) => (
            <LogEntry key={id} {...entry} />
          ))}
        </View>
      )}
    </ShipPanel>
  );
}

const styles = StyleSheet.create({
  entries: {
    gap: Spacing.three,
  },
});
