import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LocationPicker } from '@/components/location-picker';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getPrayerTimesForDate, type PrayerTimeEntry } from '@/lib/prayer-times';
import { useLocationStore } from '@/stores/location-store';

export default function PrayerTimesScreen() {
  const theme = useTheme();
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

  const nextKey = prayers ? findNextPrayerKey(prayers, now) : null;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <ThemedText type="title">Prayer Times</ThemedText>

          <LocationPicker />

          {prayers && (
            <View style={styles.list}>
              {prayers.map((prayer) => (
                <ThemedView
                  key={prayer.key}
                  type="backgroundElement"
                  style={[
                    styles.row,
                    prayer.key === nextKey && { borderColor: theme.primary, borderWidth: 2 },
                  ]}>
                  <ThemedText type={prayer.key === nextKey ? 'smallBold' : 'default'}>
                    {prayer.name}
                  </ThemedText>
                  <ThemedText
                    type={prayer.key === nextKey ? 'smallBold' : 'default'}
                    themeColor={prayer.key === nextKey ? 'primary' : 'text'}>
                    {prayer.time.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                  </ThemedText>
                </ThemedView>
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

/** "sunrise" isn't a prayer -- skip it when picking what's "next". Wraps
 * to fajr once isha has passed for the day. */
function findNextPrayerKey(prayers: PrayerTimeEntry[], now: Date): PrayerTimeEntry['key'] | null {
  const actionable = prayers.filter((p) => p.key !== 'sunrise');
  const next = actionable.find((p) => p.time.getTime() > now.getTime());
  return (next ?? actionable[0])?.key ?? null;
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
    gap: Spacing.four,
  },
  list: {
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: Spacing.three,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderWidth: 2,
    borderColor: 'transparent',
  },
});
