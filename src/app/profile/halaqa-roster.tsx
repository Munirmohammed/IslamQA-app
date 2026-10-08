import { Link, Stack, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useHalaqaStudents } from '@/features/halaqa/api';

import type { StudentSummary } from '@/features/halaqa/types';

export default function HalaqaRosterScreen() {
  const params = useLocalSearchParams<{ halaqaId: string; halaqaName: string }>();
  const { data, isLoading, error } = useHalaqaStudents(params.halaqaId);

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: params.halaqaName }} />
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <Link
          href={{
            pathname: '/profile/halaqa-leaderboard',
            params: { halaqaId: params.halaqaId, halaqaName: params.halaqaName },
          }}
          style={styles.leaderboardLink}>
          <ThemedText type="small" themeColor="primary">
            View leaderboard →
          </ThemedText>
        </Link>

        {isLoading && (
          <ThemedText themeColor="textSecondary" style={styles.message}>
            Loading roster…
          </ThemedText>
        )}

        {error && (
          <ThemedText themeColor="textSecondary" style={styles.message}>
            Couldn&apos;t load this halaqa&apos;s roster.
          </ThemedText>
        )}

        {data && data.length === 0 && (
          <ThemedText themeColor="textSecondary" style={styles.message}>
            No students have joined yet -- share the join code shown on the halaqa list.
          </ThemedText>
        )}

        {data &&
          data.map((student) => (
            <StudentRow key={student.student_id} halaqaId={params.halaqaId} student={student} />
          ))}
      </SafeAreaView>
    </ThemedView>
  );
}

function StudentRow({ halaqaId, student }: { halaqaId: string; student: StudentSummary }) {
  const correctPct =
    student.correct_rate !== null ? `${Math.round(student.correct_rate * 100)}% correct` : 'No sessions yet';

  return (
    <Link
      href={{
        pathname: '/profile/halaqa-student',
        params: { halaqaId, studentId: student.student_id, username: student.username },
      }}
      asChild>
      <Pressable>
        {({ pressed }) => (
          <ThemedView type="backgroundElement" style={[styles.row, pressed && styles.rowPressed]}>
            <ThemedText type="smallBold">{student.username}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {student.session_count} session{student.session_count === 1 ? '' : 's'} · {correctPct}
            </ThemedText>
          </ThemedView>
        )}
      </Pressable>
    </Link>
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
    gap: Spacing.two,
  },
  message: {
    textAlign: 'center',
    marginTop: Spacing.six,
  },
  leaderboardLink: {
    marginBottom: Spacing.two,
  },
  row: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.half,
  },
  rowPressed: {
    opacity: 0.7,
  },
});
