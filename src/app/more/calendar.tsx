import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { toHijri } from '@/lib/hijri';

const RAMADAN_MONTH = 9;
const MAX_LOOKAHEAD_DAYS = 400; // a Hijri year is ~354 days -- this always finds the next Ramadan

/** Days until the next Ramadan 1 starts (today counts as 0 if Ramadan has
 * already begun). Brute-force day-by-day search rather than converting
 * Hijri-back-to-Gregorian -- simpler and just as correct at this scale. */
function daysUntilNextRamadan(today: Date): number {
  for (let offset = 0; offset <= MAX_LOOKAHEAD_DAYS; offset++) {
    const candidate = new Date(today);
    candidate.setDate(candidate.getDate() + offset);
    const hijri = toHijri(candidate);
    if (hijri.month === RAMADAN_MONTH && hijri.day === 1) return offset;
  }
  return -1; // unreachable in practice, but keeps the return type honest
}

export default function CalendarScreen() {
  const today = useMemo(() => new Date(), []);
  const hijriToday = useMemo(() => toHijri(today), [today]);
  const ramadanCountdown = useMemo(() => daysUntilNextRamadan(today), [today]);
  const inRamadan = hijriToday.month === RAMADAN_MONTH;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <ThemedText type="title">Islamic Calendar</ThemedText>

          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText type="title" style={styles.hijriDate}>
              {hijriToday.day} {hijriToday.monthName}
            </ThemedText>
            <ThemedText themeColor="textSecondary">{hijriToday.year} AH</ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.gregorian}>
              {today.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </ThemedText>
          </ThemedView>

          <ThemedView type="backgroundElement" style={styles.card}>
            {inRamadan ? (
              <ThemedText type="smallBold" themeColor="primary">
                Ramadan Mubarak -- day {hijriToday.day} of Ramadan
              </ThemedText>
            ) : (
              <>
                <ThemedText type="title" style={styles.countdownNumber}>
                  {ramadanCountdown}
                </ThemedText>
                <ThemedText themeColor="textSecondary">days until Ramadan</ThemedText>
              </>
            )}
          </ThemedView>

          <View style={styles.caveat}>
            <ThemedText type="small" themeColor="textSecondary">
              This Hijri date is computed arithmetically (Umm al-Qura-based), not from local moon
              sighting -- it may be a day off from the date your local mosque or religious
              authority announces.
            </ThemedText>
          </View>
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
    paddingBottom: Spacing.six,
    gap: Spacing.four,
  },
  card: {
    borderRadius: Spacing.three,
    padding: Spacing.five,
    alignItems: 'center',
    gap: Spacing.one,
  },
  hijriDate: {
    fontSize: 32,
    lineHeight: 38,
  },
  gregorian: {
    marginTop: Spacing.two,
  },
  countdownNumber: {
    fontSize: 40,
    lineHeight: 44,
  },
  caveat: {
    paddingHorizontal: Spacing.two,
  },
});
