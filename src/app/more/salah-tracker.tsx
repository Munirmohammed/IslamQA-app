import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/empty-state';
import { Skeleton } from '@/components/skeleton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTodaySalah, useUpdateSalah, useSalahHistory } from '@/features/salah/api';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/stores/auth-store';

import type { PrayerName, SalahLog } from '@/features/salah/types';

const PRAYERS: { key: PrayerName; label: string }[] = [
  { key: 'fajr', label: 'Fajr' },
  { key: 'dhuhr', label: 'Dhuhr' },
  { key: 'asr', label: 'Asr' },
  { key: 'maghrib', label: 'Maghrib' },
  { key: 'isha', label: 'Isha' },
];

const WEEKDAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function ChecklistRow({
  label,
  checked,
  onToggle,
  disabled,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
  disabled: boolean;
}) {
  const theme = useTheme();
  return (
    <Pressable onPress={onToggle} disabled={disabled} hitSlop={4}>
      {({ pressed }) => (
        <ThemedView type="backgroundElement" style={[styles.row, pressed && styles.pressed]}>
          <ThemedText>{label}</ThemedText>
          <Ionicons
            name={checked ? 'checkmark-circle' : 'ellipse-outline'}
            size={26}
            color={checked ? theme.primary : theme.textSecondary}
          />
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
        const prayedCount = PRAYERS.filter((p) => log[p.key]).length;
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
            {log.fasting && <ThemedText type="small">🌙</ThemedText>}
          </View>
        );
      })}
    </View>
  );
}

export default function SalahTrackerScreen() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const { data: today, isLoading, error } = useTodaySalah();
  const { data: history } = useSalahHistory(7);
  const update = useUpdateSalah();

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: 'Salah & Fasting' }} />
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.content}>
          {!accessToken && (
            <EmptyState
              icon="log-in-outline"
              message="Log in from the More tab to track your daily prayers and fasting."
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

          {accessToken && today && (
            <>
              <ThemedText type="smallBold">Today&apos;s prayers</ThemedText>
              {PRAYERS.map((prayer) => (
                <ChecklistRow
                  key={prayer.key}
                  label={prayer.label}
                  checked={today[prayer.key]}
                  disabled={update.isPending}
                  onToggle={() => update.mutate({ [prayer.key]: !today[prayer.key] })}
                />
              ))}

              <ChecklistRow
                label="Fasting today"
                checked={today.fasting}
                disabled={update.isPending}
                onToggle={() => update.mutate({ fasting: !today.fasting })}
              />

              {history && (
                <>
                  <ThemedText type="smallBold" style={styles.historyTitle}>
                    This week
                  </ThemedText>
                  <HistoryStrip history={history} />
                </>
              )}
            </>
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
  content: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.two,
  },
  skeletonList: {
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: Spacing.three,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  pressed: {
    opacity: 0.7,
  },
  historyTitle: {
    marginTop: Spacing.four,
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
