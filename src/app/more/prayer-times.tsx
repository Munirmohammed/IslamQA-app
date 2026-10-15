import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { Fragment, useEffect, useState } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/empty-state';
import { LocationPicker } from '@/components/location-picker';
import { ProgressRing } from '@/components/progress-ring';
import { Skeleton } from '@/components/skeleton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';
import { useSalahHistory, useTodaySalah, useUpdateSalah } from '@/features/salah/api';
import { useTheme } from '@/hooks/use-theme';
import { toHijri } from '@/lib/hijri';
import {
  CALCULATION_METHOD_LABEL,
  findCurrentPrayer,
  findNextPrayer,
  formatCountdown,
  getPrayerTimesForDate,
  type PrayerKey,
  type PrayerTimeEntry,
} from '@/lib/prayer-times';
import { reconcilePrayerNotifications } from '@/lib/prayer-notifications';
import { useAuthStore } from '@/stores/auth-store';
import { useLocationStore } from '@/stores/location-store';
import { useNotificationPrefsStore } from '@/stores/notification-prefs-store';

import type { PrayerName, SalahLog } from '@/features/salah/types';

const TRACKED_PRAYERS: PrayerName[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
const WEEKDAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
// How many days either side of today the date strip shows -- the real
// screenshot's strip is a 7-day window (today roughly centered), and this
// matches that count without hardcoding specific dates.
const DATE_STRIP_OFFSETS = [-3, -2, -1, 0, 1, 2, 3];

function isTrackedPrayer(key: PrayerTimeEntry['key']): key is PrayerName {
  return (TRACKED_PRAYERS as string[]).includes(key);
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, amount: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

/** Muslim Pro's actual "Prayers" screen merges what this app used to split
 * across two routes (plain prayer-time lookup, and a separate login-gated
 * prayed/fasting tracker) into one: a date strip + location/method chips,
 * a "Now" summary + prayed-count ring side by side, then a single list of
 * rows each carrying both the time and (when logged in) a prayed toggle.
 * `/more/salah-tracker` now just redirects here instead of duplicating
 * this screen.
 *
 * The time-list structure (date strip, chips, outline-not-fill current-row
 * highlight, per-row notification bells) was corrected against a real
 * device screenshot of the live Muslim Pro app -- see the git history for
 * this file and `src/constants/theme.ts` for what that changed. The
 * prayed/fasting tracker below it is this app's own feature (Muslim Pro
 * has nothing quite like it) and stays layered on top, not replaced. */
export default function PrayerTimesScreen() {
  const theme = useTheme();
  const accessToken = useAuthStore((s) => s.accessToken);
  const latitude = useLocationStore((s) => s.latitude);
  const longitude = useLocationStore((s) => s.longitude);
  const [now, setNow] = useState(() => new Date());
  // Which day of the date strip is selected, as an offset from today
  // (0 = today) rather than a stored Date -- so if the app is left open
  // across midnight, "today" automatically follows along instead of
  // silently going stale.
  const [selectedOffset, setSelectedOffset] = useState(0);

  // Re-render once a minute so "next prayer" and the countdown stay live
  // without the user having to reopen the screen.
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const todayDate = startOfDay(now);
  const selectedDate = addDays(todayDate, selectedOffset);
  const isViewingToday = selectedOffset === 0;
  const hijriSelected = toHijri(selectedDate);

  const hasLocation = latitude !== null && longitude !== null;
  const prayers: PrayerTimeEntry[] | null = hasLocation
    ? getPrayerTimesForDate(latitude, longitude, selectedDate)
    : null;
  const nextPrayer = prayers && isViewingToday ? findNextPrayer(prayers, now) : null;
  const currentPrayer = prayers && isViewingToday ? findCurrentPrayer(prayers, now) : null;

  const { data: today, isLoading, error } = useTodaySalah();
  const { data: history } = useSalahHistory(7);
  const update = useUpdateSalah();

  const notifyEnabled = useNotificationPrefsStore((s) => s.enabled);
  const hydrateNotifyPrefs = useNotificationPrefsStore((s) => s.hydrate);
  const notifyPrefsHydrated = useNotificationPrefsStore((s) => s.isHydrated);
  const toggleNotify = useNotificationPrefsStore((s) => s.toggle);

  useEffect(() => {
    hydrateNotifyPrefs();
  }, [hydrateNotifyPrefs]);

  // Real local-notification scheduling (expo-notifications), not a
  // decorative toggle -- reconciled against *today's* actual prayer times
  // (independent of whichever day is selected in the strip above) whenever
  // location, the enabled set, or hydration state changes. See
  // prayer-notifications.ts for the "today only" scope this honestly
  // settles for without a background-task scheduler.
  useEffect(() => {
    if (!hasLocation || !notifyPrefsHydrated) return;
    const todaysPrayers = getPrayerTimesForDate(latitude as number, longitude as number, startOfDay(new Date()));
    const enabledKeys = new Set<PrayerKey>(todaysPrayers.map((p) => p.key).filter((key) => notifyEnabled[key]));
    reconcilePrayerNotifications(todaysPrayers, new Date(), enabledKeys).catch((err) =>
      console.warn('Prayer notification reconcile failed:', err)
    );
  }, [hasLocation, latitude, longitude, notifyEnabled, notifyPrefsHydrated]);

  const prayedCount = today ? TRACKED_PRAYERS.filter((key) => today[key]).length : 0;
  const allPrayed = today ? prayedCount === TRACKED_PRAYERS.length : false;

  // Cheap enough (7 items) to compute plain every render -- React Compiler
  // (enabled project-wide) handles memoization automatically, and a manual
  // `useMemo` here fought its static analysis instead of helping it.
  const dateStrip = DATE_STRIP_OFFSETS.map((offset) => ({ offset, date: addDays(todayDate, offset) }));

  const handleShare = () => {
    if (!prayers) return;
    const lines = prayers.map((p) => `${p.name}: ${formatTime(p.time)}`).join('\n');
    const dateLabel = `${isViewingToday ? 'Today' : selectedDate.toLocaleDateString(undefined, { weekday: 'long' })}, ${selectedDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}`;
    Share.share({ message: `Prayer times -- ${dateLabel}\n${lines}` }).catch(() => {});
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: 'Prayers' }} />
      {/* No `edges` restriction (unlike this screen's previous version,
          which only protected the bottom edge) -- matches the sibling
          Qibla screen's SafeAreaView, which protects all edges by default.
          The previous bottom-only version was a latent inconsistency: this
          route's header is hidden (more/_layout.tsx), so without a top
          inset the new date-strip header could sit under the status bar /
          notch on real devices. */}
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.headerRow}>
            <View style={styles.headerTextCol}>
              <ThemedText type="smallBold" style={styles.headerTitle}>
                {isViewingToday ? 'Today' : selectedDate.toLocaleDateString(undefined, { weekday: 'long' })},{' '}
                {selectedDate.toLocaleDateString(undefined, { day: 'numeric', month: 'long' })}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {hijriSelected.day} {hijriSelected.monthName} {hijriSelected.year} AH
              </ThemedText>
            </View>
            <Pressable onPress={handleShare} hitSlop={10} disabled={!prayers}>
              <Ionicons name="ellipsis-horizontal" size={22} color={theme.text} />
            </Pressable>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dateStrip}>
            {dateStrip.map(({ offset, date }) => {
              const selected = offset === selectedOffset;
              return (
                <Pressable key={offset} onPress={() => setSelectedOffset(offset)} style={styles.dateItem}>
                  <View style={[styles.dateCircle, selected && { backgroundColor: theme.text }]}>
                    <ThemedText type="smallBold" themeColor={selected ? 'background' : 'text'}>
                      {date.getDate()}
                    </ThemedText>
                  </View>
                  <ThemedText type="small" themeColor="textSecondary">
                    {WEEKDAY_LETTERS[date.getDay()]}
                  </ThemedText>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={styles.chipsRow}>
            <LocationPicker variant="chip" />
            <View style={[styles.methodChip, { backgroundColor: theme.backgroundSelected }]}>
              <ThemedText type="small" numberOfLines={1}>
                {CALCULATION_METHOD_LABEL}
              </ThemedText>
            </View>
          </View>

          {/* Logged-out, a real device screenshot of Muslim Pro's Prayers
              screen shows no separate "Now" summary card at all -- just the
              chips, then straight into the row list, whose current row
              already carries its own inline "Now" badge below. This card
              only earns its keep by also hosting the prayed-count ring, so
              it's gated on `accessToken` rather than shown unconditionally
              (the earlier Play-Store-screenshot-based reasoning that
              justified it as a logged-out-safe merge is superseded by this
              on-device evidence). */}
          {accessToken && today && prayers && nextPrayer && (
            <ThemedView type="backgroundElement" style={styles.summaryCard}>
              <View style={styles.nowHalf}>
                <ThemedText type="small" themeColor="textSecondary">
                  Now
                </ThemedText>
                <ThemedText type="smallBold">{nextPrayer.name}</ThemedText>
                <ThemedText type="title" style={styles.nowTime}>
                  {formatTime(nextPrayer.time)}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  in {formatCountdown(nextPrayer.time.getTime() - now.getTime())}
                </ThemedText>
              </View>

              <View style={[styles.summaryDivider, { backgroundColor: theme.border }]} />
              <View style={styles.ringHalf}>
                <ProgressRing progress={prayedCount / TRACKED_PRAYERS.length} size={72}>
                  <ThemedText type="smallBold">
                    {prayedCount}/{TRACKED_PRAYERS.length}
                  </ThemedText>
                </ProgressRing>
                <ThemedText type="small" themeColor="textSecondary">
                  prayed
                </ThemedText>
              </View>
            </ThemedView>
          )}

          {!accessToken && isViewingToday && (
            <EmptyState
              icon="log-in-outline"
              message="Log in from the More tab to track which prayers you've prayed and your fasting."
            />
          )}

          {accessToken && isViewingToday && isLoading && (
            <View style={styles.skeletonList}>
              {Array.from({ length: 6 }, (_, i) => (
                <Skeleton key={i} height={52} borderRadius={Spacing.three} />
              ))}
            </View>
          )}

          {accessToken && isViewingToday && error && (
            <EmptyState icon="cloud-offline-outline" message="Couldn't load today's checklist." />
          )}

          {prayers && (
            <ThemedView type="backgroundElement" style={styles.listCard}>
              {prayers.map((prayer, index) => {
                const isCurrent = currentPrayer?.key === prayer.key;
                const isNext = nextPrayer?.key === prayer.key;
                const prevIsCurrent = index > 0 && currentPrayer?.key === prayers[index - 1].key;
                const trackedKey = isTrackedPrayer(prayer.key) ? prayer.key : null;
                const checked = trackedKey && today && isViewingToday ? today[trackedKey] : false;
                return (
                  <Fragment key={prayer.key}>
                    {index > 0 && !isCurrent && !prevIsCurrent && (
                      <View style={[styles.listDivider, { backgroundColor: theme.border }]} />
                    )}
                    <PrayerRow
                      prayer={prayer}
                      isCurrent={isCurrent}
                      isNext={isNext}
                      countdownLabel={isNext ? formatCountdown(prayer.time.getTime() - now.getTime()) : null}
                      trackable={!!trackedKey && !!accessToken && !!today && isViewingToday}
                      checked={checked}
                      disabled={update.isPending}
                      onToggle={() => trackedKey && update.mutate({ [trackedKey]: !checked })}
                      notifyEnabled={notifyEnabled[prayer.key]}
                      onToggleNotify={() => toggleNotify(prayer.key)}
                    />
                  </Fragment>
                );
              })}
            </ThemedView>
          )}

          {accessToken && isViewingToday && today && !allPrayed && (
            <Pressable
              onPress={() =>
                update.mutate(Object.fromEntries(TRACKED_PRAYERS.map((key) => [key, true])))
              }
              disabled={update.isPending}>
              {({ pressed }) => (
                <ThemedView type="primaryMuted" style={[styles.markAllButton, pressed && styles.pressed]}>
                  <ThemedText type="smallBold" themeColor="primary">
                    Mark all as prayed
                  </ThemedText>
                </ThemedView>
              )}
            </Pressable>
          )}

          {accessToken && isViewingToday && today && (
            <Pressable
              onPress={() => update.mutate({ fasting: !today.fasting })}
              disabled={update.isPending}
              hitSlop={4}>
              {({ pressed }) => (
                <ThemedView type="backgroundElement" style={[styles.row, pressed && styles.pressed]}>
                  <ThemedText>Fasting today</ThemedText>
                  <Ionicons
                    name={today.fasting ? 'checkmark-circle' : 'ellipse-outline'}
                    size={26}
                    color={today.fasting ? theme.primary : theme.textSecondary}
                  />
                </ThemedView>
              )}
            </Pressable>
          )}

          {accessToken && history && (
            <>
              <ThemedText type="smallBold" style={styles.historyTitle}>
                This week
              </ThemedText>
              <HistoryStrip history={history} />
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function PrayerRow({
  prayer,
  isCurrent,
  isNext,
  countdownLabel,
  trackable,
  checked,
  disabled,
  onToggle,
  notifyEnabled,
  onToggleNotify,
}: {
  prayer: PrayerTimeEntry;
  isCurrent: boolean;
  isNext: boolean;
  countdownLabel: string | null;
  trackable: boolean;
  checked: boolean;
  disabled: boolean;
  onToggle: () => void;
  notifyEnabled: boolean;
  onToggleNotify: () => void;
}) {
  const theme = useTheme();

  const row = (
    <View style={styles.listRow}>
      <View style={styles.rowLeft}>
        {trackable && (
          <Pressable onPress={onToggle} disabled={disabled} hitSlop={8}>
            <Ionicons
              name={checked ? 'checkmark-circle' : 'ellipse-outline'}
              size={22}
              color={checked ? theme.primary : theme.textSecondary}
            />
          </Pressable>
        )}
        <ThemedText type={isCurrent ? 'smallBold' : 'default'}>{prayer.name}</ThemedText>
        {isCurrent && (
          // White/near-white pill with dark text -- pixel-sampled from the
          // real device screenshot (the "Now" badge reads ~#F8FDFE, not a
          // tinted or brand-green pill), so it's built by inverting the
          // theme's own text/background pair rather than a new token.
          <View style={[styles.badge, { backgroundColor: theme.text }]}>
            <ThemedText type="small" themeColor="background" style={styles.badgeText}>
              Now
            </ThemedText>
          </View>
        )}
        {isNext && countdownLabel && (
          <View style={[styles.badge, { backgroundColor: theme.backgroundSelected }]}>
            <ThemedText type="small" themeColor="textSecondary" style={styles.badgeText}>
              in {countdownLabel}
            </ThemedText>
          </View>
        )}
      </View>
      <View style={styles.rowRight}>
        <ThemedText type={isCurrent ? 'smallBold' : 'default'}>{formatTime(prayer.time)}</ThemedText>
        <Pressable onPress={onToggleNotify} hitSlop={8}>
          <Ionicons
            name={notifyEnabled ? 'notifications-outline' : 'notifications-off-outline'}
            size={18}
            color={theme.textSecondary}
          />
        </Pressable>
      </View>
    </View>
  );

  if (!isCurrent) return row;

  // An outlined box around just this row, not a filled background -- the
  // real screenshot highlights the current prayer period (confirmed by
  // pixel-sampling its border, see theme.ts's `outlineStrong`) this way,
  // not with the solid `primaryMuted` fill this screen used before.
  return <View style={[styles.currentRowOutline, { borderColor: theme.outlineStrong }]}>{row}</View>;
}

function HistoryStrip({ history }: { history: SalahLog[] }) {
  const theme = useTheme();
  return (
    <View style={styles.historyRow}>
      {history.map((log) => {
        const prayedCount = TRACKED_PRAYERS.filter((key) => log[key]).length;
        const weekday = WEEKDAY_LETTERS[new Date(log.log_date).getUTCDay()];
        return (
          <View key={log.log_date} style={styles.historyDay}>
            <ThemedText type="small" themeColor="textSecondary">
              {weekday}
            </ThemedText>
            <View
              style={[
                styles.historyBadge,
                { backgroundColor: prayedCount === 5 ? theme.primaryMuted : theme.backgroundSelected },
              ]}>
              <ThemedText type="small" themeColor={prayedCount === 5 ? 'primary' : 'textSecondary'}>
                {prayedCount}
              </ThemedText>
            </View>
            {log.fasting && <Ionicons name="moon" size={14} color={theme.accent} />}
          </View>
        );
      })}
    </View>
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
    paddingBottom: Spacing.six,
    gap: Spacing.three,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTextCol: {
    gap: 2,
  },
  headerTitle: {
    fontSize: 20,
    lineHeight: 26,
  },
  dateStrip: {
    gap: Spacing.three,
    paddingVertical: 2,
  },
  dateItem: {
    alignItems: 'center',
    gap: 4,
    width: 34,
  },
  dateCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  methodChip: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.pill,
  },
  summaryCard: {
    flexDirection: 'row',
    borderRadius: Radius.card,
  },
  nowHalf: {
    flex: 1,
    padding: Spacing.four,
    gap: 2,
  },
  summaryDivider: {
    width: StyleSheet.hairlineWidth,
    marginVertical: Spacing.three,
  },
  ringHalf: {
    width: 120,
    padding: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
  },
  nowTime: {
    fontSize: 28,
    lineHeight: 32,
  },
  // A single continuous card for the prayer-row list (with `listDivider`
  // hairlines between rows), not one floating pill per prayer -- matching
  // both Muslim Pro's actual Prayers screen and this app's own grouped
  // settings-list convention (settings-row.tsx) instead of a third, flatter
  // list idiom unique to this screen.
  listCard: {
    borderRadius: Radius.card,
    overflow: 'hidden',
  },
  listRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  listDivider: {
    height: StyleSheet.hairlineWidth,
  },
  currentRowOutline: {
    borderWidth: 1.5,
    borderRadius: Radius.card,
    marginHorizontal: Spacing.one,
    marginVertical: Spacing.one,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.pill,
    marginLeft: Spacing.two,
  },
  badgeText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: Radius.card,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    flexShrink: 1,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  pressed: {
    opacity: 0.7,
  },
  markAllButton: {
    borderRadius: Radius.pill,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  skeletonList: {
    gap: Spacing.two,
  },
  historyTitle: {
    marginTop: Spacing.two,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  historyDay: {
    alignItems: 'center',
    gap: 4,
  },
  historyBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
