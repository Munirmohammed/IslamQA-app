import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
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
import {
  findNextPrayer,
  formatCountdown,
  getPrayerTimesForDate,
  type PrayerTimeEntry,
} from '@/lib/prayer-times';
import { useAuthStore } from '@/stores/auth-store';
import { useLocationStore } from '@/stores/location-store';

import type { PrayerName, SalahLog } from '@/features/salah/types';

const TRACKED_PRAYERS: PrayerName[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
const WEEKDAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function isTrackedPrayer(key: PrayerTimeEntry['key']): key is PrayerName {
  return (TRACKED_PRAYERS as string[]).includes(key);
}

/** Muslim Pro's actual "Prayers" screen merges what this app used to split
 * across two routes (plain prayer-time lookup, and a separate login-gated
 * prayed/fasting tracker) into one: a "Now" summary + a prayed-count ring
 * side by side, then a single list of rows each carrying both the time
 * and (when logged in) a prayed toggle. `/more/salah-tracker` now just
 * redirects here instead of duplicating this screen. */
export default function PrayerTimesScreen() {
  const theme = useTheme();
  const accessToken = useAuthStore((s) => s.accessToken);
  const latitude = useLocationStore((s) => s.latitude);
  const longitude = useLocationStore((s) => s.longitude);
  const [now, setNow] = useState(() => new Date());

  // Re-render once a minute so "next prayer" and the countdown stay live
  // without the user having to reopen the screen.
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const prayers: PrayerTimeEntry[] | null =
    latitude !== null && longitude !== null ? getPrayerTimesForDate(latitude, longitude, now) : null;
  const nextPrayer = prayers ? findNextPrayer(prayers, now) : null;

  const { data: today, isLoading, error } = useTodaySalah();
  const { data: history } = useSalahHistory(7);
  const update = useUpdateSalah();

  const prayedCount = today ? TRACKED_PRAYERS.filter((key) => today[key]).length : 0;
  const allPrayed = today ? prayedCount === TRACKED_PRAYERS.length : false;

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: 'Prayers' }} />
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <ThemedText type="title">Prayers</ThemedText>

          <LocationPicker />

          {prayers && nextPrayer && (
            <View style={styles.summaryRow}>
              <ThemedView type="backgroundElement" style={styles.nowCard}>
                <ThemedText type="small" themeColor="textSecondary">
                  Now
                </ThemedText>
                <ThemedText type="smallBold">{nextPrayer.name}</ThemedText>
                <ThemedText type="title" style={styles.nowTime}>
                  {nextPrayer.time.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  in {formatCountdown(nextPrayer.time.getTime() - now.getTime())}
                </ThemedText>
              </ThemedView>

              {accessToken && today && (
                <ThemedView type="backgroundElement" style={styles.ringCard}>
                  <ProgressRing progress={prayedCount / TRACKED_PRAYERS.length} size={72}>
                    <ThemedText type="smallBold">
                      {prayedCount}/{TRACKED_PRAYERS.length}
                    </ThemedText>
                  </ProgressRing>
                  <ThemedText type="small" themeColor="textSecondary">
                    prayed
                  </ThemedText>
                </ThemedView>
              )}
            </View>
          )}

          {!accessToken && (
            <EmptyState
              icon="log-in-outline"
              message="Log in from the More tab to track which prayers you've prayed and your fasting."
            />
          )}

          {accessToken && isLoading && (
            <View style={styles.skeletonList}>
              {Array.from({ length: 6 }, (_, i) => (
                <Skeleton key={i} height={52} borderRadius={Spacing.three} />
              ))}
            </View>
          )}

          {accessToken && error && (
            <EmptyState icon="cloud-offline-outline" message="Couldn't load today's checklist." />
          )}

          {prayers && (
            <View style={styles.list}>
              {prayers.map((prayer) => {
                const isNext = prayer.key === nextPrayer?.key;
                const trackedKey = isTrackedPrayer(prayer.key) ? prayer.key : null;
                const checked = trackedKey && today ? today[trackedKey] : false;
                return (
                  <PrayerRow
                    key={prayer.key}
                    prayer={prayer}
                    isNext={isNext}
                    trackable={!!trackedKey && !!accessToken && !!today}
                    checked={checked}
                    disabled={update.isPending}
                    onToggle={() => trackedKey && update.mutate({ [trackedKey]: !checked })}
                  />
                );
              })}
            </View>
          )}

          {accessToken && today && !allPrayed && (
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

          {accessToken && today && (
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
  isNext,
  trackable,
  checked,
  disabled,
  onToggle,
}: {
  prayer: PrayerTimeEntry;
  isNext: boolean;
  trackable: boolean;
  checked: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  const theme = useTheme();

  return (
    <Pressable onPress={onToggle} disabled={!trackable || disabled} hitSlop={4}>
      {({ pressed }) => (
        <ThemedView
          type="backgroundElement"
          style={[
            styles.row,
            isNext && { borderColor: theme.primary, borderWidth: 2 },
            pressed && styles.pressed,
          ]}>
          <View style={styles.rowLeft}>
            {trackable && (
              <Ionicons
                name={checked ? 'checkmark-circle' : 'ellipse-outline'}
                size={22}
                color={checked ? theme.primary : theme.textSecondary}
              />
            )}
            <ThemedText type={isNext ? 'smallBold' : 'default'}>{prayer.name}</ThemedText>
          </View>
          <ThemedText type={isNext ? 'smallBold' : 'default'} themeColor={isNext ? 'primary' : 'text'}>
            {prayer.time.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
          </ThemedText>
        </ThemedView>
      )}
    </Pressable>
  );
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
    paddingTop: Spacing.six,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  nowCard: {
    flex: 1,
    borderRadius: Radius.card,
    padding: Spacing.four,
    gap: 2,
  },
  nowTime: {
    fontSize: 28,
    lineHeight: 32,
  },
  ringCard: {
    width: 120,
    borderRadius: Radius.card,
    padding: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
  },
  list: {
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: Radius.card,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
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
