import { Link } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActivityHeatmap } from '@/components/activity-heatmap';
import { KhatmahProgressCard } from '@/components/khatmah-progress-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useMe } from '@/features/auth/api';
import { useHistory, useStreak } from '@/features/gamification/api';
import { useKhatmahProgress } from '@/features/khatmah/api';

export default function HomeScreen() {
  const { data: me } = useMe();
  const { data: streak } = useStreak();
  const { data: history } = useHistory(30);
  const { data: khatmah } = useKhatmahProgress();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title">Assalamu Alaikum{me ? `, ${me.username}` : ''}</ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.subtitle}>
          Your Quran companion -- recitation, memorization, and tafsir, all in one place.
        </ThemedText>

        {me &&
          (streak ? (
            <ThemedView type="backgroundElement" style={styles.streakCard}>
              <View style={styles.streakStat}>
                <ThemedText type="title" style={styles.streakNumber}>
                  {streak.current_streak}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  day streak
                </ThemedText>
              </View>
              <View style={styles.streakDivider} />
              <View style={styles.streakStat}>
                <ThemedText type="title" style={styles.streakNumber}>
                  {streak.total_hasanat.toLocaleString()}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  hasanat
                </ThemedText>
              </View>
            </ThemedView>
          ) : (
            <ThemedView type="backgroundElement" style={styles.streakCardEmpty}>
              <ThemedText type="smallBold">Start your streak</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Read or recite an ayah to earn your first hasanat.
              </ThemedText>
            </ThemedView>
          ))}

        {me && khatmah && <KhatmahProgressCard progress={khatmah} />}

        {me && history && <ActivityHeatmap days={history.days} />}

        <Link href="/quran" asChild>
          <Pressable>
            {({ pressed }) => (
              <ThemedView
                type="primaryMuted"
                style={[styles.cta, pressed && styles.ctaPressed]}>
                <ThemedText type="smallBold" themeColor="primary">
                  Open the Mushaf →
                </ThemedText>
              </ThemedView>
            )}
          </Pressable>
        </Link>

        {me && (
          <Link href="/community/leaderboard" asChild>
            <Pressable>
              {({ pressed }) => (
                <ThemedText type="link" themeColor="primary" style={pressed && styles.ctaPressed}>
                  View leaderboard →
                </ThemedText>
              )}
            </Pressable>
          </Link>
        )}

      </SafeAreaView>
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
    paddingTop: Spacing.six,
    gap: Spacing.three,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
    paddingBottom: BottomTabInset + Spacing.three,
  },
  subtitle: {
    marginBottom: Spacing.three,
  },
  cta: {
    borderRadius: Spacing.three,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
  },
  ctaPressed: {
    opacity: 0.8,
  },
  streakCard: {
    flexDirection: 'row',
    borderRadius: Spacing.three,
    paddingVertical: Spacing.four,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
  },
  streakCardEmpty: {
    borderRadius: Spacing.three,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    gap: Spacing.half,
  },
  streakStat: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.half,
  },
  streakDivider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
    backgroundColor: 'rgba(128, 128, 128, 0.3)',
  },
  streakNumber: {
    fontSize: 32,
    lineHeight: 36,
  },
});
