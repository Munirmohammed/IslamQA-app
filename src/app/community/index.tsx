import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/app-header';
import { Avatar } from '@/components/avatar';
import { EmptyState } from '@/components/empty-state';
import { Skeleton } from '@/components/skeleton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';
import { useLeaderboard } from '@/features/gamification/api';
import { useCreateHalaqa, useJoinHalaqa, useMyHalaqas } from '@/features/halaqa/api';
import { useTheme } from '@/hooks/use-theme';

import type { LeaderboardEntry } from '@/features/gamification/types';
import type { Halaqa } from '@/features/halaqa/types';

export default function HalaqaScreen() {
  const { data, isLoading, error } = useMyHalaqas();
  const hasNoHalaqas = !!data && data.teaching.length === 0 && data.studying.length === 0;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <AppHeader />
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText type="title">Community</ThemedText>

          <GlobalLeaderboardPreview />

          {isLoading && (
            <View style={styles.section}>
              <Skeleton height={84} borderRadius={Radius.card} />
              <Skeleton height={84} borderRadius={Radius.card} />
            </View>
          )}

          {error && <EmptyState icon="alert-circle-outline" message="Couldn't load your halaqas." />}

          {hasNoHalaqas && (
            <EmptyState
              icon="people-circle-outline"
              message="No halaqas yet -- start one to teach, or join with a code from your teacher."
            />
          )}

          {data && data.teaching.length > 0 && (
            <View style={styles.section}>
              <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionLabel}>
                TEACHING · {data.teaching.length}
              </ThemedText>
              {data.teaching.map((halaqa) => (
                <TeachingRow key={halaqa.id} halaqa={halaqa} />
              ))}
            </View>
          )}

          {data && data.studying.length > 0 && (
            <View style={styles.section}>
              <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionLabel}>
                STUDYING · {data.studying.length}
              </ThemedText>
              {data.studying.map((halaqa) => (
                <StudyingRow key={halaqa.id} halaqa={halaqa} />
              ))}
            </View>
          )}

          <View style={styles.section}>
            <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionLabel}>
              {hasNoHalaqas ? 'GET STARTED' : 'ADD ANOTHER CIRCLE'}
            </ThemedText>
            <CreateHalaqaForm />
            <JoinHalaqaForm />
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const MEDALS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

/** Ported from the AI Studio reference's inline "Hasanat Leaderboard"
 * card (medal emoji for the top 3, hasanat + streak per row) -- using
 * this app's own real useLeaderboard() data, not fabricated member rows.
 * Still links through to the full /community/leaderboard list rather than
 * duplicating it entirely here. */
function GlobalLeaderboardPreview() {
  const theme = useTheme();
  const { data } = useLeaderboard('total_hasanat');
  const top3 = data?.entries.slice(0, 3) ?? [];

  return (
    <Link href="/community/leaderboard" asChild>
      <Pressable>
        {({ pressed }) => (
          <ThemedView type="backgroundElement" style={[styles.leaderboardCard, pressed && styles.rowPressed]}>
            <View style={styles.leaderboardHeader}>
              <View style={[styles.navIconBadge, { backgroundColor: theme.primaryMuted }]}>
                <Ionicons name="trophy-outline" size={18} color={theme.primary} />
              </View>
              <ThemedText type="smallBold" style={styles.navRowLabel}>
                Hasanat Leaderboard
              </ThemedText>
              <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
            </View>

            {top3.length === 0 ? (
              <ThemedText type="small" themeColor="textSecondary">
                No one&apos;s on the board yet -- be the first to read or recite an ayah.
              </ThemedText>
            ) : (
              <View style={styles.leaderboardRows}>
                {top3.map((entry: LeaderboardEntry) => (
                  <View key={entry.rank} style={styles.leaderboardRow}>
                    <ThemedText type="smallBold" style={styles.leaderboardMedal}>
                      {MEDALS[entry.rank]}
                    </ThemedText>
                    <Avatar label={entry.username} size={28} />
                    <ThemedText type="small" style={styles.leaderboardName} numberOfLines={1}>
                      {entry.username}
                    </ThemedText>
                    <ThemedText type="small" themeColor="primary">
                      {entry.total_hasanat.toLocaleString()}
                    </ThemedText>
                  </View>
                ))}
              </View>
            )}
          </ThemedView>
        )}
      </Pressable>
    </Link>
  );
}

/** "N students" / "N check-ins this week" -- a compact, muted icon+count
 * pair (not a full sentence per stat), the density lever Muslim Pro's feed
 * uses for its like/comment/share row: several short icon+number pairs
 * packed on one line rather than stacked prose. */
function StatPair({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  const theme = useTheme();
  return (
    <View style={styles.statPair}>
      <Ionicons name={icon} size={14} color={theme.textSecondary} />
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
    </View>
  );
}

function TeachingRow({ halaqa }: { halaqa: Halaqa }) {
  const theme = useTheme();
  return (
    <Link
      href={{ pathname: '/community/halaqa-roster', params: { halaqaId: halaqa.id, halaqaName: halaqa.name } }}
      asChild>
      <Pressable>
        {({ pressed }) => (
          <ThemedView type="backgroundElement" style={[styles.card, pressed && styles.rowPressed]}>
            <View style={styles.cardTopRow}>
              <Avatar label={halaqa.name} />
              <View style={styles.cardTextColumn}>
                <ThemedText type="smallBold" numberOfLines={1}>
                  {halaqa.name}
                </ThemedText>
                <View style={styles.statRow}>
                  <StatPair
                    icon="people-outline"
                    label={`${halaqa.member_count} student${halaqa.member_count === 1 ? '' : 's'}`}
                  />
                  <StatPair
                    icon="flash-outline"
                    label={
                      halaqa.recent_session_count > 0
                        ? `${halaqa.recent_session_count} check-in${halaqa.recent_session_count === 1 ? '' : 's'} this week`
                        : 'Quiet this week'
                    }
                  />
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
            </View>
            <View style={[styles.joinCodeChip, { backgroundColor: theme.primaryMuted }]}>
              <Ionicons name="key-outline" size={13} color={theme.primary} />
              <ThemedText type="small" themeColor="primary">
                {halaqa.join_code}
              </ThemedText>
            </View>
          </ThemedView>
        )}
      </Pressable>
    </Link>
  );
}

function StudyingRow({ halaqa }: { halaqa: Halaqa }) {
  const theme = useTheme();
  return (
    <Link
      href={{
        pathname: '/community/halaqa-leaderboard',
        params: { halaqaId: halaqa.id, halaqaName: halaqa.name },
      }}
      asChild>
      <Pressable>
        {({ pressed }) => (
          <ThemedView type="backgroundElement" style={[styles.card, pressed && styles.rowPressed]}>
            <View style={styles.cardTopRow}>
              <Avatar label={halaqa.name} />
              <View style={styles.cardTextColumn}>
                <ThemedText type="smallBold" numberOfLines={1}>
                  {halaqa.name}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
                  Taught by {halaqa.teacher_name ?? 'your teacher'}
                </ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.primary} />
            </View>
            <View style={styles.statRow}>
              <StatPair
                icon="people-outline"
                label={`${halaqa.member_count} student${halaqa.member_count === 1 ? '' : 's'}`}
              />
              <StatPair
                icon="flash-outline"
                label={
                  halaqa.recent_session_count > 0
                    ? `${halaqa.recent_session_count} check-in${halaqa.recent_session_count === 1 ? '' : 's'} this week`
                    : 'Quiet this week'
                }
              />
            </View>
          </ThemedView>
        )}
      </Pressable>
    </Link>
  );
}

function CreateHalaqaForm() {
  const theme = useTheme();
  const [name, setName] = useState('');
  const createHalaqa = useCreateHalaqa();

  return (
    <ThemedView type="backgroundElement" style={styles.formCard}>
      <View style={styles.formHeader}>
        <Ionicons name="add-circle-outline" size={18} color={theme.primary} />
        <ThemedText type="smallBold">Start a halaqa</ThemedText>
      </View>
      <TextInput
        placeholder="Circle name"
        placeholderTextColor={theme.textSecondary}
        value={name}
        onChangeText={setName}
        style={[styles.input, { color: theme.text, borderColor: theme.border }]}
      />
      {createHalaqa.isSuccess && (
        <ThemedText type="small" themeColor="primary">
          Created -- join code: {createHalaqa.data.join_code}
        </ThemedText>
      )}
      {createHalaqa.isError && (
        <ThemedText type="small" themeColor="error">
          {createHalaqa.error.message}
        </ThemedText>
      )}
      <Pressable
        disabled={createHalaqa.isPending || name.trim().length === 0}
        onPress={() => createHalaqa.mutate(name.trim())}>
        {({ pressed }) => (
          <ThemedView
            type="primaryMuted"
            style={[styles.formButton, (pressed || createHalaqa.isPending) && styles.pressed]}>
            <ThemedText type="smallBold" themeColor="primary">
              Create
            </ThemedText>
          </ThemedView>
        )}
      </Pressable>
    </ThemedView>
  );
}

function JoinHalaqaForm() {
  const theme = useTheme();
  const [code, setCode] = useState('');
  const joinHalaqa = useJoinHalaqa();

  return (
    <ThemedView type="backgroundElement" style={styles.formCard}>
      <View style={styles.formHeader}>
        <Ionicons name="enter-outline" size={18} color={theme.primary} />
        <ThemedText type="smallBold">Join a halaqa</ThemedText>
      </View>
      <TextInput
        placeholder="Join code"
        placeholderTextColor={theme.textSecondary}
        autoCapitalize="characters"
        value={code}
        onChangeText={setCode}
        style={[styles.input, { color: theme.text, borderColor: theme.border }]}
      />
      {joinHalaqa.isSuccess && (
        <ThemedText type="small" themeColor="primary">
          Joined!
        </ThemedText>
      )}
      {joinHalaqa.isError && (
        <ThemedText type="small" themeColor="error">
          {joinHalaqa.error.message}
        </ThemedText>
      )}
      <Pressable
        disabled={joinHalaqa.isPending || code.trim().length === 0}
        onPress={() => joinHalaqa.mutate(code.trim())}>
        {({ pressed }) => (
          <ThemedView
            type="primaryMuted"
            style={[styles.formButton, (pressed || joinHalaqa.isPending) && styles.pressed]}>
            <ThemedText type="smallBold" themeColor="primary">
              Join
            </ThemedText>
          </ThemedView>
        )}
      </Pressable>
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
  content: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.six,
    paddingBottom: Spacing.four,
    gap: Spacing.four,
  },
  section: {
    gap: Spacing.two,
  },
  sectionLabel: {
    letterSpacing: 0.5,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.card,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  navIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navRowLabel: {
    flex: 1,
  },
  leaderboardCard: {
    borderRadius: Radius.card,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  leaderboardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  leaderboardRows: {
    gap: Spacing.two,
  },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  leaderboardMedal: {
    width: 20,
    textAlign: 'center',
  },
  leaderboardName: {
    flex: 1,
  },
  card: {
    borderRadius: Radius.card,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  cardTextColumn: {
    flex: 1,
    gap: Spacing.half,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  statPair: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  joinCodeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
  },
  rowPressed: {
    opacity: 0.7,
  },
  formCard: {
    borderRadius: Radius.card,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  input: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
  formButton: {
    borderRadius: Radius.card,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
});
