import { Stack, useLocalSearchParams } from 'expo-router';
import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useStudentSessions } from '@/features/halaqa/api';

import type { StudentSession } from '@/features/halaqa/types';

export default function HalaqaStudentScreen() {
  const params = useLocalSearchParams<{ halaqaId: string; studentId: string; username: string }>();
  const { data, isLoading, error } = useStudentSessions(params.halaqaId, params.studentId);

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: params.username }} />
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        {isLoading && (
          <ThemedText themeColor="textSecondary" style={styles.message}>
            Loading sessions…
          </ThemedText>
        )}

        {error && (
          <ThemedText themeColor="textSecondary" style={styles.message}>
            Couldn&apos;t load this student&apos;s sessions.
          </ThemedText>
        )}

        {data && data.length === 0 && (
          <ThemedText themeColor="textSecondary" style={styles.message}>
            No recitation checks recorded yet.
          </ThemedText>
        )}

        {data && data.length > 0 && (
          <FlatList
            data={data}
            keyExtractor={(item) => item.session_id}
            renderItem={({ item }) => <SessionCard session={item} />}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <ThemedView style={styles.separator} />}
          />
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

function SessionCard({ session }: { session: StudentSession }) {
  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <View style={styles.cardHeader}>
        <ThemedText type="smallBold">
          {session.surah_number}:{session.ayah_number}
        </ThemedText>
        <ThemedText type="small" themeColor={session.is_correct ? 'primary' : 'textSecondary'}>
          {session.is_correct ? '✓ Correct' : `${session.mistake_count} mistake${session.mistake_count === 1 ? '' : 's'}`}
        </ThemedText>
      </View>

      <ThemedText type="small" themeColor="textSecondary">
        &ldquo;{session.transcript}&rdquo;
      </ThemedText>

      {session.mistakes.map((mistake, index) => (
        <ThemedText key={index} type="small" themeColor="textSecondary">
          {mistake.type}: expected &ldquo;{mistake.expected}&rdquo;, recited &ldquo;{mistake.recited}&rdquo;
        </ThemedText>
      ))}

      {session.is_duplicate_submission && (
        <ThemedText type="small" style={styles.flag}>
          Flagged: same audio submitted by another account
        </ThemedText>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
  },
  message: {
    textAlign: 'center',
    marginTop: Spacing.six,
  },
  listContent: {
    paddingBottom: Spacing.four,
  },
  separator: {
    height: Spacing.two,
  },
  card: {
    borderRadius: Spacing.three,
    padding: Spacing.four,
    gap: Spacing.two,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  flag: {
    color: '#C0392B',
  },
});
