import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActivityHeatmap } from '@/components/activity-heatmap';
import { EmptyState } from '@/components/empty-state';
import { FeatureCard } from '@/components/feature-card';
import { KhatmahProgressCard } from '@/components/khatmah-progress-card';
import { Skeleton } from '@/components/skeleton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useMe } from '@/features/auth/api';
import { useHistory, useStreak } from '@/features/gamification/api';
import { useKhatmahProgress } from '@/features/khatmah/api';
import { useTodaySalah } from '@/features/salah/api';
import { useTheme } from '@/hooks/use-theme';

import type { KhatmahProgress } from '@/features/khatmah/types';
import type { SalahLog } from '@/features/salah/types';

interface FeatureGridItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  href: string;
}

// No description here, unlike More's fuller Islamic Tools list -- a
// 2-column grid cell is too narrow for icon + label + a line of
// description without truncating; icon + label alone matches how
// competitor apps render a dense shortcut grid.
const FEATURE_GRID: FeatureGridItem[] = [
  { icon: 'compass-outline', label: 'Qibla', href: '/more/qibla' },
  { icon: 'time-outline', label: 'Prayer Times', href: '/more/prayer-times' },
  { icon: 'flower-outline', label: 'Dua & Azkar', href: '/more/azkar' },
  { icon: 'book-outline', label: 'Hadith', href: '/more/hadith' },
  { icon: 'cash-outline', label: 'Zakat', href: '/more/zakat' },
  { icon: 'calendar-outline', label: 'Calendar', href: '/more/calendar' },
];

function FeatureGrid() {
  return (
    <View style={styles.grid}>
      {FEATURE_GRID.map((item) => (
        <View key={item.href} style={styles.gridItem}>
          <FeatureCard {...item} />
        </View>
      ))}
    </View>
  );
}

const PRAYER_KEYS: (keyof Pick<SalahLog, 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha'>)[] = [
  'fajr',
  'dhuhr',
  'asr',
  'maghrib',
  'isha',
];

function TodaySalahCard() {
  const theme = useTheme();
  const { data: today } = useTodaySalah();
  if (!today) return null;

  return (
    <Link href="/more/salah-tracker" asChild>
      <Pressable>
        {({ pressed }) => (
          <ThemedView type="backgroundElement" style={[styles.salahCard, pressed && styles.pressed]}>
            <ThemedText type="smallBold">Today&apos;s prayers</ThemedText>
            <View style={styles.salahDots}>
              {PRAYER_KEYS.map((key) => (
                <Ionicons
                  key={key}
                  name={today[key] ? 'checkmark-circle' : 'ellipse-outline'}
                  size={22}
                  color={today[key] ? theme.primary : theme.textSecondary}
                />
              ))}
            </View>
          </ThemedView>
        )}
      </Pressable>
    </Link>
  );
}

function ContinueReadingCard({ khatmah }: { khatmah: KhatmahProgress }) {
  const theme = useTheme();
  if (khatmah.last_surah === null) return null;

  return (
    <Link href={`/quran/${khatmah.last_surah}`} asChild>
      <Pressable>
        {({ pressed }) => (
          <ThemedView type="primaryMuted" style={[styles.continueCard, pressed && styles.pressed]}>
            <Ionicons name="book-outline" size={22} color={theme.primary} />
            <View style={styles.continueTextColumn}>
              <ThemedText type="smallBold" themeColor="primary">
                Continue reading
              </ThemedText>
              <ThemedText type="small" themeColor="primary">
                {khatmah.last_surah_name_en} {khatmah.last_surah}:{khatmah.last_ayah}
              </ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.primary} />
          </ThemedView>
        )}
      </Pressable>
    </Link>
  );
}

export default function HomeScreen() {
  const { data: me } = useMe();
  const { data: streak, isLoading: streakLoading, error: streakError } = useStreak();
  const { data: history, isLoading: historyLoading } = useHistory(30);
  const { data: khatmah, isLoading: khatmahLoading } = useKhatmahProgress();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <ThemedText type="title">Assalamu Alaikum{me ? `, ${me.username}` : ''}</ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.subtitle}>
            Your Quran companion -- recitation, memorization, and tafsir, all in one place.
          </ThemedText>

          {me && khatmah && <ContinueReadingCard khatmah={khatmah} />}

          {me && (
            <>
              {streakLoading && <Skeleton height={88} borderRadius={Spacing.three} />}
              {streakError && (
                <EmptyState icon="cloud-offline-outline" message="Couldn't load your streak." />
              )}
              {streak && (
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
              )}
              {!streakLoading && !streakError && !streak && (
                <ThemedView type="backgroundElement" style={styles.streakCardEmpty}>
                  <ThemedText type="smallBold">Start your streak</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    Read or recite an ayah to earn your first hasanat.
                  </ThemedText>
                </ThemedView>
              )}
            </>
          )}

          {me && (
            <>
              {khatmahLoading && <Skeleton height={80} borderRadius={Spacing.three} />}
              {khatmah && <KhatmahProgressCard progress={khatmah} />}
            </>
          )}

          {me && <TodaySalahCard />}

          <View style={styles.sectionHeading}>
            <ThemedText type="smallBold">Explore</ThemedText>
          </View>
          <FeatureGrid />

          {me && (
            <>
              {historyLoading && <Skeleton height={120} borderRadius={Spacing.three} />}
              {history && <ActivityHeatmap days={history.days} />}
            </>
          )}

          {!me && (
            <Link href="/more" asChild>
              <Pressable>
                {({ pressed }) => (
                  <ThemedView type="primaryMuted" style={[styles.cta, pressed && styles.ctaPressed]}>
                    <ThemedText type="smallBold" themeColor="primary">
                      Log in to track your streak, hifz progress, and more →
                    </ThemedText>
                  </ThemedView>
                )}
              </Pressable>
            </Link>
          )}

          <Link href="/quran" asChild>
            <Pressable>
              {({ pressed }) => (
                <ThemedView type="primaryMuted" style={[styles.cta, pressed && styles.ctaPressed]}>
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
        </ScrollView>
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
  },
  scrollContent: {
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
  sectionHeading: {
    marginTop: Spacing.two,
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
  continueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderRadius: Spacing.three,
    padding: Spacing.four,
  },
  continueTextColumn: {
    flex: 1,
    gap: 2,
  },
  salahCard: {
    borderRadius: Spacing.three,
    padding: Spacing.four,
    gap: Spacing.two,
  },
  pressed: {
    opacity: 0.8,
  },
  salahDots: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  gridItem: {
    width: '48%',
  },
});
