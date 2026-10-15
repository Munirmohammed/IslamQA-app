import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActivityHeatmap } from '@/components/activity-heatmap';
import { Avatar } from '@/components/avatar';
import { EmptyState } from '@/components/empty-state';
import { GradientBanner } from '@/components/gradient-banner';
import { KhatmahProgressCard } from '@/components/khatmah-progress-card';
import { Skeleton } from '@/components/skeleton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useMe } from '@/features/auth/api';
import { useHistory, useStreak } from '@/features/gamification/api';
import { useKhatmahProgress } from '@/features/khatmah/api';
import { useTodaySalah, useUpdateSalah } from '@/features/salah/api';
import { useTheme } from '@/hooks/use-theme';
import { toHijri } from '@/lib/hijri';
import {
  findCurrentPrayer,
  findNextPrayer,
  formatCountdown,
  getPrayerTimesForDate,
  type PrayerTimeEntry,
} from '@/lib/prayer-times';
import { useAuthStore } from '@/stores/auth-store';
import { useLocationStore } from '@/stores/location-store';

import type { KhatmahProgress } from '@/features/khatmah/types';
import type { PrayerName, SalahLog } from '@/features/salah/types';

interface FeatureRowItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  href: string;
}

const FEATURE_ITEMS: FeatureRowItem[] = [
  { icon: 'compass-outline', label: 'Qibla', href: '/more/qibla' },
  { icon: 'time-outline', label: 'Prayers', href: '/more/prayer-times' },
  { icon: 'flower-outline', label: 'Dua & Azkar', href: '/more/azkar' },
  { icon: 'ellipse-outline', label: 'Tasbih', href: '/more/tasbih' },
  { icon: 'book-outline', label: 'Hadith', href: '/more/hadith' },
  { icon: 'cash-outline', label: 'Zakat', href: '/more/zakat' },
  { icon: 'calendar-outline', label: 'Calendar', href: '/more/calendar' },
];

/** Muslim Pro's real Home/"Today" tab (confirmed off a real device
 * screenshot) runs its "Features" shortcuts as a horizontal row of
 * icon-in-circle + label columns, not a 2-column grid of full-width
 * rows -- this replaces the previous `FeatureGrid`'s row layout with
 * that same horizontal-strip shape, reusing `FeatureCard`'s icon/label
 * data (same six real routes) rather than inventing Muslim Pro's own
 * unrelated shortcuts (Giving, Tasbih, Inspiration) this app has no
 * screen for. */
function FeatureRow() {
  const theme = useTheme();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.featureRow}>
      {FEATURE_ITEMS.map((item) => (
        <Link key={item.href} href={item.href as never} asChild>
          <Pressable style={styles.featureItem}>
            {({ pressed }) => (
              <>
                <View
                  style={[
                    styles.featureIconCircle,
                    { backgroundColor: theme.primaryMuted },
                    pressed && styles.pressed,
                  ]}>
                  <Ionicons name={item.icon} size={24} color={theme.primary} />
                </View>
                <ThemedText type="small" style={styles.featureLabel} numberOfLines={1}>
                  {item.label}
                </ThemedText>
              </>
            )}
          </Pressable>
        </Link>
      ))}
    </ScrollView>
  );
}

const PRAYER_KEYS: PrayerName[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

/** The compact header row Muslim Pro's real Home tab opens with: a
 * Hijri-date readout on the left and, on the right, either a "Log In"
 * pill (logged out) or the signed-in user. The real screenshot's other
 * header element -- a notification bell with an unread badge -- has no
 * equivalent in this app (no notifications system exists), so rather
 * than fabricate fake notifications, a real piece of data takes that
 * same badge-on-the-right slot instead: the user's actual day streak,
 * once it's loaded. */
function HomeHeader({ streakCount }: { streakCount: number | null }) {
  const theme = useTheme();
  const { data: me } = useMe();
  const accessToken = useAuthStore((s) => s.accessToken);
  const hijriToday = useMemo(() => toHijri(new Date()), []);

  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        {me ? <Avatar label={me.username} size={34} /> : <Ionicons name="person-circle-outline" size={34} color={theme.textSecondary} />}
        <ThemedText type="smallBold">
          {hijriToday.day} {hijriToday.monthName}
        </ThemedText>
      </View>

      {accessToken ? (
        streakCount !== null && (
          <Link href="/community/leaderboard" asChild>
            <Pressable>
              {({ pressed }) => (
                <View style={[styles.streakChip, { backgroundColor: theme.backgroundElement }, pressed && styles.pressed]}>
                  <Ionicons name="flame" size={16} color={theme.accent} />
                  <ThemedText type="smallBold">{streakCount}</ThemedText>
                </View>
              )}
            </Pressable>
          </Link>
        )
      ) : (
        <Link href="/more" asChild>
          <Pressable>
            {({ pressed }) => (
              <View style={[styles.loginPill, { backgroundColor: theme.primary }, pressed && styles.pressed]}>
                <ThemedText type="smallBold" style={styles.loginPillText}>
                  Log In
                </ThemedText>
              </View>
            )}
          </Pressable>
        </Link>
      )}
    </View>
  );
}

/** Adapted from Muslim Pro's real solid dark-red "Your premium has
 * expired. Tap to reactivate now." bar with its own dismiss X -- this
 * app has no premium/subscription concept to clone that literally, so
 * the same dismissible-alert shape instead surfaces something this app
 * genuinely has: a prayer whose time has already passed today that
 * isn't logged yet. Tapping the row marks it prayed (same
 * `useUpdateSalah` mutation the Prayers tab's own rows use); tapping X
 * dismisses it for the rest of today only. */
function MissedPrayerAlert({ prayer, today }: { prayer: PrayerTimeEntry; today: SalahLog }) {
  const theme = useTheme();
  const [dismissedKey, setDismissedKey] = useState<string | null>(null);
  const update = useUpdateSalah();
  const key = `${today.log_date}-${prayer.key}`;

  if (dismissedKey === key) return null;

  return (
    <Pressable
      onPress={() => update.mutate({ [prayer.key]: true })}
      disabled={update.isPending}>
      {({ pressed }) => (
        <ThemedView type="dangerMuted" style={[styles.alertCard, pressed && styles.pressed]}>
          <ThemedText type="small" themeColor="error" style={styles.alertText}>
            You haven&apos;t logged {prayer.name} yet. Tap to mark it prayed.
          </ThemedText>
          <Pressable onPress={() => setDismissedKey(key)} hitSlop={8}>
            <Ionicons name="close" size={18} color={theme.error} style={styles.alertClose} />
          </Pressable>
        </ThemedView>
      )}
    </Pressable>
  );
}

/** Muslim Pro's real Home card is a single "Now · Asr" card -- a current
 * prayer + a countdown to the *next* one, location and Hijri date
 * right-aligned, and a "View all prayer times ->" link at the bottom --
 * not the two-panel Now+prayed-ring layout this file used previously
 * (that layout is real too, just lifted from the dedicated Prayers tab,
 * which keeps it; confirmed by comparing both against the real
 * screenshot). This is the simpler single-card version, reusing the same
 * `findCurrentPrayer`/`findNextPrayer`/`formatCountdown` helpers so Home
 * and the Prayers tab never compute conflicting times. Muslim Pro's own
 * card also shows a weather emoji next to the prayer name -- skipped,
 * since this app has no weather data source to back it with real data. */
function TodayPrayersCard({
  current,
  next,
  now,
}: {
  current: PrayerTimeEntry | null;
  next: PrayerTimeEntry | null;
  now: Date;
}) {
  const theme = useTheme();
  const label = useLocationStore((s) => s.label);
  const source = useLocationStore((s) => s.source);
  const hijriToday = useMemo(() => toHijri(now), [now]);
  const locationLabel = source === 'gps' ? 'Your location' : (label ?? 'Set your location');

  return (
    <Link href="/more/prayer-times" asChild>
      <Pressable>
        {({ pressed }) => (
          <ThemedView type="backgroundElement" style={[styles.prayerCard, pressed && styles.pressed]}>
            {current && next ? (
              <>
                <View style={styles.prayerTopRow}>
                  <View style={styles.nowLabelRow}>
                    <View style={[styles.nowDot, { backgroundColor: theme.primary }]} />
                    <ThemedText type="small" themeColor="textSecondary">
                      Now
                    </ThemedText>
                    <ThemedText type="smallBold">{current.name}</ThemedText>
                  </View>
                  <View style={styles.prayerTopRight}>
                    <ThemedText type="smallBold" numberOfLines={1}>
                      {locationLabel}
                    </ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {hijriToday.day} {hijriToday.monthName}
                    </ThemedText>
                  </View>
                </View>

                <ThemedText type="title" style={styles.bigTime}>
                  {current.time.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                </ThemedText>
                <ThemedText themeColor="textSecondary">
                  {formatCountdown(next.time.getTime() - now.getTime())} to {next.name}
                </ThemedText>
              </>
            ) : (
              <ThemedText themeColor="textSecondary">Enable location to see prayer times</ThemedText>
            )}

            <View style={[styles.prayerCardDividerRow, { borderTopColor: theme.border }]}>
              <ThemedText type="small" themeColor="textSecondary">
                View all prayer times
              </ThemedText>
              <Ionicons name="arrow-forward" size={14} color={theme.textSecondary} />
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
            <View style={[styles.continueBadge, { backgroundColor: theme.background }]}>
              <ThemedText type="smallBold" themeColor="primary">
                {khatmah.last_ayah}
              </ThemedText>
            </View>
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
  const theme = useTheme();
  const accessToken = useAuthStore((s) => s.accessToken);
  const { data: streak, isLoading: streakLoading, error: streakError } = useStreak();
  const { data: history, isLoading: historyLoading } = useHistory(30);
  const { data: khatmah, isLoading: khatmahLoading } = useKhatmahProgress();
  const { data: today } = useTodaySalah();

  const latitude = useLocationStore((s) => s.latitude);
  const longitude = useLocationStore((s) => s.longitude);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const prayers = latitude !== null && longitude !== null ? getPrayerTimesForDate(latitude, longitude, now) : null;
  const currentPrayer = prayers ? findCurrentPrayer(prayers, now) : null;
  const nextPrayer = prayers ? findNextPrayer(prayers, now) : null;

  const missedPrayer = useMemo(() => {
    if (!today || !prayers) return null;
    const passed = prayers.filter(
      (p): p is PrayerTimeEntry & { key: PrayerName } =>
        (PRAYER_KEYS as string[]).includes(p.key) && p.time.getTime() <= now.getTime()
    );
    return [...passed].reverse().find((p) => !today[p.key as PrayerName]) ?? null;
  }, [today, prayers, now]);

  const hasPersonalizedContent = !!(streak || khatmah?.last_surah);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <HomeHeader streakCount={streak ? streak.current_streak : null} />

          <GradientBanner
            href="/community/leaderboard"
            title="See where you rank on the leaderboard"
            variant="compact"
          />

          {accessToken && today && missedPrayer && (
            <MissedPrayerAlert prayer={missedPrayer} today={today} />
          )}

          <TodayPrayersCard current={currentPrayer} next={nextPrayer} now={now} />

          <GradientBanner
            href="/community"
            title="Study together"
            subtitle="Explore halaqas →"
            icon="people-outline"
            variant="feature"
          />

          <View style={styles.sectionHeadingRow}>
            <ThemedText type="smallBold">Features</ThemedText>
            <Link href="/more" asChild>
              <Pressable>
                {({ pressed }) => (
                  <ThemedText type="small" themeColor="textSecondary" style={pressed && styles.pressed}>
                    More
                  </ThemedText>
                )}
              </Pressable>
            </Link>
          </View>
          <FeatureRow />

          {accessToken && (
            <>
              <View style={styles.sectionHeading}>
                <ThemedText type="smallBold">For You</ThemedText>
              </View>

              {khatmahLoading && <Skeleton height={80} borderRadius={Spacing.three} />}
              {khatmah && <ContinueReadingCard khatmah={khatmah} />}
              {khatmah && <KhatmahProgressCard progress={khatmah} />}

              {streakLoading && <Skeleton height={88} borderRadius={Spacing.three} />}
              {streakError && <EmptyState icon="cloud-offline-outline" message="Couldn't load your streak." />}
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
                  <View style={[styles.streakDivider, { backgroundColor: theme.border }]} />
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

              {historyLoading && <Skeleton height={120} borderRadius={Spacing.three} />}
              {history && <ActivityHeatmap days={history.days} />}

              {!hasPersonalizedContent && !streakLoading && !khatmahLoading && (
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
              )}
            </>
          )}

          {!accessToken && (
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
    paddingTop: Spacing.three,
    gap: Spacing.three,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
    paddingBottom: BottomTabInset + Spacing.three,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  loginPill: {
    borderRadius: Radius.pill,
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
  },
  loginPillText: {
    color: '#FFFFFF',
  },
  streakChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: Radius.pill,
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
  },
  sectionHeading: {
    marginTop: Spacing.two,
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  cta: {
    borderRadius: Radius.card,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
  },
  ctaPressed: {
    opacity: 0.8,
  },
  streakCard: {
    flexDirection: 'row',
    borderRadius: Radius.card,
    paddingVertical: Spacing.four,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
  },
  streakCardEmpty: {
    borderRadius: Radius.card,
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
  },
  streakNumber: {
    fontSize: 32,
    lineHeight: 36,
  },
  continueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderRadius: Radius.pill,
    padding: Spacing.two,
    paddingRight: Spacing.four,
  },
  continueBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  continueTextColumn: {
    flex: 1,
    gap: 2,
  },
  pressed: {
    opacity: 0.8,
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: Radius.card,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    gap: Spacing.two,
  },
  alertText: {
    flex: 1,
  },
  alertClose: {
    opacity: 0.8,
  },
  prayerCard: {
    borderRadius: Radius.card,
    padding: Spacing.four,
    gap: 2,
  },
  prayerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  nowLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  nowDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  prayerTopRight: {
    alignItems: 'flex-end',
  },
  bigTime: {
    fontSize: 34,
    lineHeight: 40,
    marginTop: Spacing.one,
  },
  prayerCardDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.three,
    paddingTop: Spacing.three,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  featureRow: {
    gap: Spacing.four,
    paddingVertical: Spacing.one,
  },
  featureItem: {
    alignItems: 'center',
    gap: Spacing.two,
    width: 72,
  },
  featureIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureLabel: {
    textAlign: 'center',
  },
});
