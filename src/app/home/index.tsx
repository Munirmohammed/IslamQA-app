import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActivityHeatmap } from '@/components/activity-heatmap';
import { AppHeader } from '@/components/app-header';
import { ArabicText } from '@/components/arabic-text';
import { DailyGoalWidget } from '@/components/daily-goal-widget';
import { EmptyState } from '@/components/empty-state';
import { GradientBanner } from '@/components/gradient-banner';
import { KhatmahProgressCard } from '@/components/khatmah-progress-card';
import { Skeleton } from '@/components/skeleton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
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

interface UtilityItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  labelAr: string;
  href: string;
  tint: 'primary' | 'accent' | 'error';
}

// Ported from the AI Studio reference's 6-tile utility grid, with this
// app's own real routes (Tasbih included, a real built screen) plus
// Calendar (a 7th tile the reference has no equivalent for, kept since
// nothing that already works should be dropped from Home just to match
// a 6-tile layout exactly).
const UTILITY_ITEMS: UtilityItem[] = [
  { icon: 'time-outline', label: 'Prayer Times', labelAr: 'مواقيت الصلاة', href: '/more/prayer-times', tint: 'primary' },
  { icon: 'compass-outline', label: 'Qibla Compass', labelAr: 'اتجاه القبلة', href: '/more/qibla', tint: 'primary' },
  { icon: 'flower-outline', label: 'Dua & Azkar', labelAr: 'أذكار المسلم', href: '/more/azkar', tint: 'accent' },
  { icon: 'ellipse-outline', label: 'Digital Tasbih', labelAr: 'المسبحة', href: '/more/tasbih', tint: 'accent' },
  { icon: 'book-outline', label: 'Hadith Library', labelAr: 'السنة النبوية', href: '/more/hadith', tint: 'primary' },
  { icon: 'cash-outline', label: 'Zakat Calc', labelAr: 'حاسبة الزكاة', href: '/more/zakat', tint: 'accent' },
  { icon: 'calendar-outline', label: 'Calendar', labelAr: 'التقويم', href: '/more/calendar', tint: 'primary' },
];

function UtilityGrid() {
  const theme = useTheme();
  return (
    <View style={styles.utilityGrid}>
      {UTILITY_ITEMS.map((item) => (
        <Link key={item.href} href={item.href as never} asChild>
          <Pressable style={styles.utilityTile}>
            {({ pressed }) => (
              <ThemedView type="backgroundElement" style={[styles.utilityCard, pressed && styles.pressed]}>
                <View style={[styles.utilityIconBadge, { backgroundColor: theme.primaryMuted }]}>
                  <Ionicons name={item.icon} size={20} color={theme[item.tint]} />
                </View>
                <ThemedText type="small" style={styles.utilityLabel} numberOfLines={1}>
                  {item.label}
                </ThemedText>
                <ArabicText font="badge" themeColor="textSecondary" size="badge" style={styles.utilityLabelAr} numberOfLines={1}>
                  {item.labelAr}
                </ArabicText>
              </ThemedView>
            )}
          </Pressable>
        </Link>
      ))}
    </View>
  );
}

const DAILY_DHIKR = {
  arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
  transliteration: 'SubhanAllahi wa bihamdihi',
  translation: 'Glory be to Allah and His is the praise',
};

/** A real, functional tap counter -- not wired to the backend's
 * hasanat/streak system, since there's no real endpoint for "dhikr counted
 * toward hasanat" (unlike reading progress, which useLogProgress genuinely
 * tracks); faking that link would mean inventing a mechanic the backend
 * doesn't actually have. Session-only count, same as the AI Studio
 * reference's own un-persisted `useState` counter. */
function QuickDhikrCard() {
  const theme = useTheme();
  const [count, setCount] = useState(0);

  return (
    <ThemedView type="backgroundElement" style={styles.dhikrCard}>
      <View style={styles.dhikrHeaderRow}>
        <ThemedText type="small" themeColor="accent" style={styles.dhikrEyebrow}>
          Quick Dhikr
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Goal: 33
        </ThemedText>
      </View>
      <ArabicText style={styles.dhikrArabic}>{DAILY_DHIKR.arabic}</ArabicText>
      <ThemedText type="small" themeColor="textSecondary" style={styles.dhikrCenter}>
        {DAILY_DHIKR.transliteration}
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={[styles.dhikrCenter, styles.dhikrItalic]}>
        &quot;{DAILY_DHIKR.translation}&quot;
      </ThemedText>

      <View style={styles.dhikrButtonRow}>
        <Pressable onPress={() => setCount((c) => c + 1)} style={styles.dhikrTapButton}>
          <ThemedView type="primary" style={styles.dhikrTapInner}>
            <ThemedText type="smallBold" themeColor="background">
              Tap to Count ({count})
            </ThemedText>
          </ThemedView>
        </Pressable>
        <Pressable onPress={() => router.push('/more/tasbih')} hitSlop={8}>
          <View style={[styles.dhikrFullButton, { borderColor: theme.border }]}>
            <ThemedText type="small">Full Tasbih</ThemedText>
          </View>
        </Pressable>
      </View>
    </ThemedView>
  );
}

const AYAH_OF_THE_DAY = {
  arabic: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ ۝ ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ',
  translation: '"[All] praise is [due] to Allah, Lord of the worlds - The Entirely Merciful, the Especially Merciful."',
  reference: 'Al-Fatihah 1:1-2',
};

function AyahOfTheDayCard() {
  const theme = useTheme();
  return (
    <ThemedView type="backgroundElement" style={styles.ayahCard}>
      <View style={styles.dhikrHeaderRow}>
        <ThemedText type="small" themeColor="primary" style={styles.dhikrEyebrow}>
          Ayah of the Day
        </ThemedText>
      </View>
      <ArabicText style={styles.ayahArabic}>{AYAH_OF_THE_DAY.arabic}</ArabicText>
      <ThemedText type="small" themeColor="textSecondary" style={styles.dhikrItalic}>
        {AYAH_OF_THE_DAY.translation}
      </ThemedText>
      <View style={[styles.ayahFooterRow, { borderTopColor: theme.border }]}>
        <ThemedText type="small" themeColor="textSecondary">
          {AYAH_OF_THE_DAY.reference}
        </ThemedText>
        <Pressable onPress={() => router.push('/quran/1')} hitSlop={8}>
          <ThemedText type="small" themeColor="primary" style={styles.dhikrItalic}>
            Read Surah →
          </ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}

/** Hero greeting banner -- ported from the AI Studio reference's opening
 * card. The reference's gradient/verse/CTA are directly reusable as-is
 * (real tokens, a real correctly-cited ayah); only the navigation target
 * differs, since this app has no single "surah 1" concept separate from
 * its own `/quran/1` route. */
function HeroBanner() {
  const theme = useTheme();
  const now = useMemo(() => new Date(), []);
  return (
    <LinearGradient
      colors={[theme.gradientBannerStart, theme.backgroundElement, theme.gradientBannerEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.heroCard}>
      <View style={styles.heroTopRow}>
        <View style={styles.heroPill}>
          <ThemedText type="small" style={styles.heroPillText}>
            Assalamu Alaikum
          </ThemedText>
        </View>
        <ThemedText type="small" style={styles.heroDate}>
          {now.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
        </ThemedText>
      </View>
      <ThemedText type="smallBold" style={styles.heroHeadline}>
        Begin your day with the remembrance of Allah
      </ThemedText>
      <ThemedText type="small" style={styles.heroQuote}>
        &quot;Those who have believed and whose hearts are assured by the remembrance of Allah.
        Unquestionably, by the remembrance of Allah hearts are assured.&quot; (13:28)
      </ThemedText>
      <Pressable onPress={() => router.push('/quran/1')} style={styles.heroButton} hitSlop={4}>
        <Ionicons name="book-outline" size={15} color="#06332E" />
        <ThemedText type="smallBold" style={styles.heroButtonText}>
          Open Mushaf
        </ThemedText>
      </Pressable>
    </LinearGradient>
  );
}

const PRAYER_KEYS: PrayerName[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

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
          <AppHeader />

          <HeroBanner />

          <DailyGoalWidget />

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
            <ThemedText type="smallBold">Daily Islamic Utilities</ThemedText>
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
          <UtilityGrid />

          <AyahOfTheDayCard />
          <QuickDhikrCard />

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
  heroCard: {
    borderRadius: Radius.card,
    padding: Spacing.four,
    gap: Spacing.one,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroPill: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
  },
  heroPillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  heroDate: {
    color: 'rgba(255,255,255,0.85)',
  },
  heroHeadline: {
    color: '#FFFFFF',
    fontSize: 19,
    lineHeight: 24,
    marginTop: Spacing.one,
  },
  heroQuote: {
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  heroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    marginTop: Spacing.two,
  },
  heroButtonText: {
    color: '#06332E',
  },
  utilityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  utilityTile: {
    width: '48%',
  },
  utilityCard: {
    borderRadius: Radius.card,
    padding: Spacing.three,
    alignItems: 'center',
    gap: 4,
  },
  utilityIconBadge: {
    width: 40,
    height: 40,
    borderRadius: Radius.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  utilityLabel: {
    fontWeight: '700',
  },
  utilityLabelAr: {
    fontSize: 13,
  },
  ayahCard: {
    borderRadius: Radius.card,
    padding: Spacing.four,
    gap: Spacing.two,
  },
  ayahArabic: {
    textAlign: 'right',
  },
  ayahFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.two,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  dhikrCard: {
    borderRadius: Radius.card,
    padding: Spacing.four,
    gap: Spacing.two,
  },
  dhikrHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dhikrEyebrow: {
    fontWeight: '700',
    textTransform: 'uppercase',
    fontSize: 11,
  },
  dhikrArabic: {
    textAlign: 'center',
  },
  dhikrCenter: {
    textAlign: 'center',
  },
  dhikrItalic: {
    fontStyle: 'italic',
  },
  dhikrButtonRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  dhikrTapButton: {
    flex: 1,
  },
  dhikrTapInner: {
    borderRadius: Radius.card,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  dhikrFullButton: {
    borderRadius: Radius.card,
    borderWidth: 1,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    justifyContent: 'center',
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
});
