import { Link } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import type { KhatmahProgress } from '@/features/khatmah/types';
import { useTheme } from '@/hooks/use-theme';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

export function KhatmahProgressCard({ progress }: { progress: KhatmahProgress }) {
  const theme = useTheme();
  const percent = Math.round(progress.percent_complete * 100);

  return (
    <Link href="/home/khatmah" asChild>
      <Pressable>
        {({ pressed }) => (
          <ThemedView type="backgroundElement" style={[styles.card, pressed && styles.pressed]}>
            <View style={styles.header}>
              <ThemedText type="smallBold">
                {progress.completed_at ? 'Khatmah complete ✓' : 'Khatmah progress'}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {percent}%
              </ThemedText>
            </View>
            <View style={[styles.barTrack, { backgroundColor: theme.background }]}>
              <View
                style={[styles.barFill, { width: `${percent}%`, backgroundColor: theme.primary }]}
              />
            </View>
            <ThemedText type="small" themeColor="textSecondary">
              {progress.ayahs_read.toLocaleString()} of {progress.total_ayahs.toLocaleString()} ayahs
            </ThemedText>
          </ThemedView>
        )}
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Spacing.three,
    padding: Spacing.four,
    gap: Spacing.two,
  },
  pressed: {
    opacity: 0.8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
});
