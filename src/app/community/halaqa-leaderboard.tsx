import { FlashList } from '@shopify/flash-list';
import { Stack, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useHalaqaLeaderboard } from '@/features/halaqa/api';

import type { HalaqaLeaderboardEntry } from '@/features/halaqa/types';

export default function HalaqaLeaderboardScreen() {
  const params = useLocalSearchParams<{ halaqaId: string; halaqaName: string }>();
  const { data, isLoading, error } = useHalaqaLeaderboard(params.halaqaId);

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: params.halaqaName || 'Leaderboard' }} />
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        {isLoading && (
          <ThemedText themeColor="textSecondary" style={styles.message}>
            Loading the leaderboard…
          </ThemedText>
        )}

        {error && (
          <ThemedText themeColor="textSecondary" style={styles.message}>
            Couldn&apos;t load this halaqa&apos;s leaderboard.
          </ThemedText>
        )}

        {data && data.entries.length === 0 && (
          <ThemedText themeColor="textSecondary" style={styles.message}>
            No one in this halaqa has read or recited yet.
          </ThemedText>
        )}

        {data && data.entries.length > 0 && (
          <FlashList
            data={data.entries}
            keyExtractor={(item) => String(item.rank)}
            renderItem={({ item }) => <LeaderboardRow entry={item} />}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <ThemedView style={styles.separator} />}
          />
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

function LeaderboardRow({ entry }: { entry: HalaqaLeaderboardEntry }) {
  return (
    <ThemedView type="backgroundElement" style={styles.row}>
      <ThemedText type="smallBold" style={styles.rank}>
        #{entry.rank}
      </ThemedText>
      <View style={styles.rowBody}>
        <ThemedText type="smallBold">{entry.username}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {entry.current_streak} day streak
        </ThemedText>
      </View>
      <ThemedText type="smallBold" themeColor="primary">
        {entry.total_hasanat.toLocaleString()}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  message: {
    textAlign: 'center',
    marginTop: Spacing.six,
    paddingHorizontal: Spacing.four,
  },
  listContent: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  separator: {
    height: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  rank: {
    width: 32,
  },
  rowBody: {
    flex: 1,
    gap: Spacing.half,
  },
});
