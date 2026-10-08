import { StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import type { DailyActivityEntry } from '@/features/gamification/types';
import { useTheme } from '@/hooks/use-theme';

import { ThemedText } from './themed-text';

const COLUMNS = 10;

/** A real calendar heatmap over `days` (oldest first, as the backend
 * returns it from GET /gamification/history) -- each cell's opacity scales
 * against the busiest day in the window, not an invented/placeholder
 * scale. */
export function ActivityHeatmap({ days }: { days: DailyActivityEntry[] }) {
  const theme = useTheme();
  const maxHasanat = Math.max(1, ...days.map((d) => d.hasanat));

  return (
    <View style={styles.container}>
      <ThemedText type="small" themeColor="textSecondary">
        Last {days.length} days
      </ThemedText>
      <View style={styles.grid}>
        {days.map((day) => {
          const intensity = day.hasanat === 0 ? 0 : 0.2 + 0.8 * (day.hasanat / maxHasanat);
          return (
            <View
              key={day.date}
              style={[
                styles.cell,
                {
                  backgroundColor:
                    intensity === 0 ? theme.backgroundElement : withOpacity(theme.primary, intensity),
                },
              ]}
            />
          );
        })}
      </View>
    </View>
  );
}

function withOpacity(hexColor: string, opacity: number): string {
  const alpha = Math.round(opacity * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hexColor}${alpha}`;
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.half,
    width: COLUMNS * 16 + (COLUMNS - 1) * Spacing.half,
  },
  cell: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
});
