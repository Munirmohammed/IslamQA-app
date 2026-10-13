import { StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import type { DailyActivityEntry } from '@/features/gamification/types';
import { useTheme } from '@/hooks/use-theme';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

const ROWS = 7; // Sun..Sat, top to bottom
const LEGEND_STEPS = [0.15, 0.4, 0.65, 1];

/** A real calendar heatmap over `days` (oldest first, as the backend
 * returns it from GET /gamification/history) -- weeks run left-to-right as
 * columns with weekdays top-to-bottom as rows (the GitHub/Duolingo
 * contribution-graph layout), with each column flexing to fill the card's
 * full width.
 *
 * The previous version laid cells out as a fixed `COLUMNS * 16`px-wide
 * block (10 columns regardless of container width) with no card, header
 * stat, or legend -- on a full-width phone screen that reads as a small
 * island of squares floating in a sea of empty space, which is exactly
 * what prompted "it's just half of the page." Wrapping it in the same
 * backgroundElement card every other Home section uses, filling the full
 * width, and adding a real stat + legend makes it read as one deliberate
 * card instead of an orphaned grid.
 *
 * Each cell's opacity still scales against the busiest day in the window,
 * not an invented/placeholder scale. */
export function ActivityHeatmap({ days }: { days: DailyActivityEntry[] }) {
  const theme = useTheme();
  const maxHasanat = Math.max(1, ...days.map((d) => d.hasanat));
  const activeDays = days.filter((d) => d.hasanat > 0).length;

  // Pad the front so the first real day lands on its actual weekday row
  // (otherwise weeks drift out of calendar alignment), and pad the back so
  // the grid is a whole number of weeks.
  const firstWeekday = days.length > 0 ? new Date(`${days[0].date}T00:00:00`).getDay() : 0;
  const padded: (DailyActivityEntry | null)[] = [...Array<null>(firstWeekday).fill(null), ...days];
  while (padded.length % ROWS !== 0) padded.push(null);

  const columns: (DailyActivityEntry | null)[][] = [];
  for (let i = 0; i < padded.length; i += ROWS) {
    columns.push(padded.slice(i, i + ROWS));
  }

  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <View style={styles.header}>
        <ThemedText type="smallBold">Last {days.length} days</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {activeDays} active {activeDays === 1 ? 'day' : 'days'}
        </ThemedText>
      </View>
      <View style={styles.grid}>
        {columns.map((column, columnIndex) => (
          <View key={columnIndex} style={styles.column}>
            {column.map((day, rowIndex) => {
              if (!day) return <View key={rowIndex} style={styles.cellEmpty} />;
              const intensity = day.hasanat === 0 ? 0 : 0.25 + 0.75 * (day.hasanat / maxHasanat);
              return (
                <View
                  key={day.date}
                  style={[
                    styles.cell,
                    {
                      backgroundColor:
                        intensity === 0 ? theme.backgroundSelected : withOpacity(theme.primary, intensity),
                    },
                  ]}
                />
              );
            })}
          </View>
        ))}
      </View>
      <View style={styles.legend}>
        <ThemedText type="small" themeColor="textSecondary">
          Less
        </ThemedText>
        {LEGEND_STEPS.map((level) => (
          <View key={level} style={[styles.legendSwatch, { backgroundColor: withOpacity(theme.primary, level) }]} />
        ))}
        <ThemedText type="small" themeColor="textSecondary">
          More
        </ThemedText>
      </View>
    </ThemedView>
  );
}

function withOpacity(hexColor: string, opacity: number): string {
  const alpha = Math.round(opacity * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hexColor}${alpha}`;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.card,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  grid: {
    flexDirection: 'row',
    gap: Spacing.half,
  },
  column: {
    flex: 1,
    gap: Spacing.half,
  },
  cell: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 2,
  },
  cellEmpty: {
    width: '100%',
    aspectRatio: 1,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  legendSwatch: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
});
