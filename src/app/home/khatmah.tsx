import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/empty-state';
import { Skeleton } from '@/components/skeleton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useKhatmahProgress, useRestartKhatmah } from '@/features/khatmah/api';
import { useTheme } from '@/hooks/use-theme';

export default function KhatmahScreen() {
  const { data: progress, isLoading, error } = useKhatmahProgress();
  const restart = useRestartKhatmah();
  const theme = useTheme();
  const [confirmingRestart, setConfirmingRestart] = useState(false);

  const percent = progress ? Math.round(progress.percent_complete * 100) : 0;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {isLoading && <Skeleton height={140} borderRadius={Spacing.three} />}

          {error && (
            <EmptyState icon="alert-circle-outline" message="Couldn't load your khatmah progress." />
          )}

          {progress && (
            <View style={styles.content}>
              <ThemedView type="backgroundElement" style={styles.summaryCard}>
                <ThemedText type="title" style={styles.summaryNumber}>
                  {percent}%
                </ThemedText>
                <ThemedText themeColor="textSecondary">
                  {progress.ayahs_read.toLocaleString()} of {progress.total_ayahs.toLocaleString()}{' '}
                  ayahs read
                </ThemedText>
                {progress.completed_at && (
                  <View style={styles.completeBadge}>
                    <Ionicons name="checkmark-circle" size={16} color={theme.accent} />
                    <ThemedText type="smallBold" themeColor="accent">
                      Khatmah complete
                    </ThemedText>
                  </View>
                )}
              </ThemedView>

              <View style={[styles.barTrack, { backgroundColor: theme.backgroundElement }]}>
                <View
                  style={[styles.barFill, { width: `${percent}%`, backgroundColor: theme.primary }]}
                />
              </View>

              <ThemedText themeColor="textSecondary" style={styles.explainer}>
                Opening a surah in the Quran tab marks its ayahs as read toward this khatmah.
                Re-reading an ayah you&apos;ve already covered won&apos;t inflate your progress.
              </ThemedText>

              {confirmingRestart ? (
                <View style={styles.confirmRow}>
                  <ThemedText type="small" themeColor="textSecondary" style={styles.confirmText}>
                    Start a brand-new khatmah? Your current progress stays saved in your history.
                  </ThemedText>
                  <View style={styles.confirmButtons}>
                    <Pressable
                      style={styles.confirmButton}
                      onPress={() => {
                        restart.mutate();
                        setConfirmingRestart(false);
                      }}>
                      <ThemedView type="primaryMuted" style={styles.button}>
                        <ThemedText type="smallBold" themeColor="primary">
                          Yes, start over
                        </ThemedText>
                      </ThemedView>
                    </Pressable>
                    <Pressable style={styles.confirmButton} onPress={() => setConfirmingRestart(false)}>
                      <ThemedView style={styles.button}>
                        <ThemedText type="smallBold">Cancel</ThemedText>
                      </ThemedView>
                    </Pressable>
                  </View>
                </View>
              ) : (
                <Pressable onPress={() => setConfirmingRestart(true)}>
                  <ThemedView style={styles.button}>
                    <ThemedText type="smallBold">Start a new khatmah</ThemedText>
                  </ThemedView>
                </Pressable>
              )}
            </View>
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
    paddingTop: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.four,
  },
  content: {
    gap: Spacing.four,
  },
  summaryCard: {
    borderRadius: Spacing.three,
    padding: Spacing.five,
    alignItems: 'center',
    gap: Spacing.one,
  },
  summaryNumber: {
    fontSize: 40,
    lineHeight: 44,
  },
  completeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.half,
    marginTop: Spacing.two,
  },
  barTrack: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 5,
  },
  explainer: {
    lineHeight: 20,
  },
  button: {
    borderRadius: Spacing.three,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  confirmRow: {
    gap: Spacing.three,
  },
  confirmText: {
    textAlign: 'center',
  },
  confirmButtons: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  confirmButton: {
    flex: 1,
  },
});
